import math
import networkx as nx
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.navigation.graph import (
    graph_manager,
    haversine_distance_meters,
    calculate_bearing_degrees,
    bearing_to_direction,
)
from app.schemas.navigation import RouteResponse, TurnInstruction
import app.models as m


def astar_heuristic(u: str, v: str, G: nx.Graph) -> float:
    """Euclidean/Haversine heuristic estimate between node u and goal node v."""
    u_data = G.nodes[u]
    v_data = G.nodes[v]
    return haversine_distance_meters(
        u_data["lat"], u_data["lng"],
        v_data["lat"], v_data["lng"],
    )


def generate_instructions(path: List[str], G: nx.Graph) -> List[TurnInstruction]:
    """Generates human-readable turn-by-turn navigation instructions."""
    instructions: List[TurnInstruction] = []
    if len(path) < 2:
        return instructions

    for i in range(len(path) - 1):
        u = path[i]
        v = path[i + 1]
        edge_data = G.get_edge_data(u, v, {})
        u_node = G.nodes[u]
        v_node = G.nodes[v]

        dist = edge_data.get("distance", edge_data.get("weight", 0.0))
        path_type = edge_data.get("pathway_type", "walkway")
        has_ramp = edge_data.get("has_ramp", False)
        has_stairs = edge_data.get("has_stairs", False)

        bearing = calculate_bearing_degrees(
            u_node["lat"], u_node["lng"],
            v_node["lat"], v_node["lng"],
        )
        direction = bearing_to_direction(bearing)

        # Build informative sentence
        if i == 0:
            msg = f"Depart from {u_node.get('name', 'Starting Point')} heading {direction} along {path_type}."
        elif i == len(path) - 2:
            msg = f"Continue {direction} along {path_type} towards destination: {v_node.get('name', 'Destination')}."
        else:
            if has_ramp:
                msg = f"Take the accessible ramp heading {direction} towards {v_node.get('name', 'pathway junction')}."
            elif has_stairs:
                msg = f"Ascend/descend stairs carefully heading {direction} to {v_node.get('name', 'junction')}."
            else:
                msg = f"Proceed {direction} along {path_type} towards {v_node.get('name', 'next pathway')}."

        instructions.append(
            TurnInstruction(
                step_number=i + 1,
                instruction=msg,
                distance_meters=round(dist, 1),
                pathway_type=path_type,
                is_ramp=has_ramp,
                is_stairs=has_stairs,
            )
        )

    return instructions


def calculate_route(
    start_id: str,
    end_id: str,
    wheelchair_mode: bool = False,
    avoid_stairs: bool = False,
    algorithm: str = "astar",
    db: Optional[Session] = None,
) -> Optional[RouteResponse]:
    """Computes optimal route between start and destination nodes."""
    if db and (not graph_manager.graph.nodes or len(graph_manager.graph.nodes) == 0):
        graph_manager.build_graph(db)

    subgraph = graph_manager.get_filtered_subgraph(
        wheelchair_mode=wheelchair_mode,
        avoid_stairs=avoid_stairs,
    )

    if start_id not in subgraph or end_id not in subgraph:
        return None

    if not nx.has_path(subgraph, start_id, end_id):
        return None

    try:
        if algorithm == "dijkstra":
            path = nx.dijkstra_path(subgraph, start_id, end_id, weight="weight")
            length = nx.dijkstra_path_length(subgraph, start_id, end_id, weight="weight")
        else:  # astar default
            h = lambda u, v: astar_heuristic(u, v, subgraph)
            path = nx.astar_path(subgraph, start_id, end_id, heuristic=h, weight="weight")
            length = nx.astar_path_length(subgraph, start_id, end_id, heuristic=h, weight="weight")
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return None

    # Check accessibility flags along chosen path
    all_wheelchair = True
    has_any_stairs = False
    coords = []

    for i in range(len(path)):
        node_data = subgraph.nodes[path[i]]
        coords.append([node_data["lat"], node_data["lng"]])

        if i < len(path) - 1:
            edge_attrs = subgraph.get_edge_data(path[i], path[i + 1], {})
            if not edge_attrs.get("is_wheelchair_accessible", True):
                all_wheelchair = False
            if edge_attrs.get("has_stairs", False):
                has_any_stairs = True

    # Walking speed assumption: 1.2 meters/second (approx 72 meters/minute)
    time_minutes = round(length / 72.0, 1)

    turn_instructions = generate_instructions(path, subgraph)

    return RouteResponse(
        total_distance_meters=round(length, 1),
        estimated_time_minutes=max(1.0, time_minutes),
        is_wheelchair_accessible=all_wheelchair,
        has_stairs=has_any_stairs,
        algorithm_used=algorithm,
        node_ids=path,
        coordinates=coords,
        turn_by_turn=turn_instructions,
        route_name="Recommended Shortest Route",
    )


def calculate_alternatives(
    start_id: str,
    end_id: str,
    wheelchair_mode: bool = False,
    avoid_stairs: bool = False,
    db: Optional[Session] = None,
) -> Tuple[Optional[RouteResponse], List[RouteResponse]]:
    """Calculates primary route and up to two distinct alternative routes."""
    primary = calculate_route(start_id, end_id, wheelchair_mode, avoid_stairs, "astar", db)
    if not primary:
        return None, []

    alternatives: List[RouteResponse] = []
    subgraph = graph_manager.get_filtered_subgraph(wheelchair_mode, avoid_stairs)

    if len(primary.node_ids) >= 3:
        # Create candidate alternate by temporarily pruning the middle edge
        mid_idx = len(primary.node_ids) // 2
        u = primary.node_ids[mid_idx]
        v = primary.node_ids[mid_idx + 1]

        alt_subgraph = subgraph.copy()
        if alt_subgraph.has_edge(u, v):
            alt_subgraph.remove_edge(u, v)

            if nx.has_path(alt_subgraph, start_id, end_id):
                try:
                    h = lambda a, b: astar_heuristic(a, b, alt_subgraph)
                    alt_path = nx.astar_path(alt_subgraph, start_id, end_id, heuristic=h, weight="weight")
                    alt_length = nx.astar_path_length(alt_subgraph, start_id, end_id, heuristic=h, weight="weight")

                    # Verify alt_path is distinct
                    if alt_path != primary.node_ids:
                        coords = [[alt_subgraph.nodes[n]["lat"], alt_subgraph.nodes[n]["lng"]] for n in alt_path]
                        turn_ins = generate_instructions(alt_path, alt_subgraph)
                        alternatives.append(
                            RouteResponse(
                                total_distance_meters=round(alt_length, 1),
                                estimated_time_minutes=max(1.0, round(alt_length / 72.0, 1)),
                                is_wheelchair_accessible=wheelchair_mode,
                                has_stairs=not avoid_stairs,
                                algorithm_used="astar_alternative",
                                node_ids=alt_path,
                                coordinates=coords,
                                turn_by_turn=turn_ins,
                                route_name="Alternative Pathway (Via Perimeter)",
                            )
                        )
                except Exception:
                    pass

    return primary, alternatives
