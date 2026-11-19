from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.navigation.graph import graph_manager
from app.navigation.router import calculate_route, calculate_alternatives
from app.schemas.navigation import RouteRequest, RouteResponse, AlternativeRoutesResponse
import app.models as m

router = APIRouter(prefix="/navigation", tags=["Navigation Engine"])


@router.get("/nodes")
def get_path_nodes(db: Session = Depends(get_db)):
    """Returns all routing network path nodes for map rendering and dropdowns."""
    nodes = db.query(m.PathNode).all()
    return [
        {
            "id": n.id,
            "name": n.name,
            "node_type": n.node_type,
            "lat": n.lat,
            "lng": n.lng,
            "floor_level": n.floor_level,
            "is_accessible": n.is_accessible,
            "building_id": n.building_id,
        }
        for n in nodes
    ]


@router.get("/edges")
def get_path_edges(db: Session = Depends(get_db)):
    """Returns all pathway segments with attributes for map overlay rendering."""
    edges = db.query(m.PathEdge).all()
    results = []
    for e in edges:
        start_n = db.query(m.PathNode).filter(m.PathNode.id == e.start_node_id).first()
        end_n = db.query(m.PathNode).filter(m.PathNode.id == e.end_node_id).first()
        if start_n and end_n:
            results.append({
                "id": e.id,
                "start_node_id": e.start_node_id,
                "end_node_id": e.end_node_id,
                "start_coords": [start_n.lat, start_n.lng],
                "end_coords": [end_n.lat, end_n.lng],
                "distance_meters": e.distance_meters,
                "pathway_type": e.pathway_type,
                "is_blocked": e.is_blocked,
                "is_wheelchair_accessible": e.is_wheelchair_accessible,
                "has_stairs": e.has_stairs,
                "has_ramp": e.has_ramp,
                "slope_degrees": e.slope_degrees,
                "description": e.description,
            })
    return results


@router.get("/nearest-node")
def get_nearest_node(lat: float, lng: float, db: Session = Depends(get_db)):
    """Resolves GPS coordinates to the nearest walkable campus node with distance check."""
    if not graph_manager.graph.nodes:
        graph_manager.build_graph(db)

    node_id, distance = graph_manager.find_nearest_node_with_distance(lat, lng)
    if not node_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No campus navigation nodes available in the graph.",
        )

    node_data = graph_manager.graph.nodes[node_id]
    MAX_CAMPUS_RADIUS_METERS = 1000.0  # 1 km threshold for SIT Valachil campus pedestrian network
    is_within_campus = distance <= MAX_CAMPUS_RADIUS_METERS

    return {
        "node_id": node_id,
        "name": node_data.get("name", "Campus Waypoint"),
        "lat": node_data.get("lat"),
        "lng": node_data.get("lng"),
        "distance_meters": round(distance, 1),
        "is_within_campus": is_within_campus,
        "default_entrance_id": "node-gate-main",
        "default_entrance_name": "SIT Main Entrance Gate",
    }


@router.post("/route", response_model=RouteResponse)
def get_route(req: RouteRequest, db: Session = Depends(get_db)):
    """Calculates optimal walking route based on constraints and chosen algorithm."""
    start_id = req.start_node_id
    end_id = req.end_node_id

    # Fallback to coordinate nearest neighbor matching if direct node IDs are omitted
    if not start_id and req.start_lat and req.start_lng:
        if not graph_manager.graph.nodes:
            graph_manager.build_graph(db)
        start_id, dist = graph_manager.find_nearest_node_with_distance(req.start_lat, req.start_lng)
        if dist > 1200.0:
            dist_km = round(dist / 1000, 1)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Your current location is {dist_km} km away, outside the mapped Srinivas Institute of Technology pedestrian network. Please select a campus entrance (such as SIT Main Entrance Gate) as your walking origin.",
            )

    if not end_id and req.end_lat and req.end_lng:
        if not graph_manager.graph.nodes:
            graph_manager.build_graph(db)
        end_id, dist = graph_manager.find_nearest_node_with_distance(req.end_lat, req.end_lng)
        if dist > 1200.0:
            dist_km = round(dist / 1000, 1)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Destination coordinate is {dist_km} km away, outside the mapped Srinivas Institute of Technology campus network.",
            )

    if not start_id or not end_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start and destination points could not be resolved on the campus map.",
        )

    if start_id == end_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Starting location and destination must be distinct.",
        )

    route = calculate_route(
        start_id=start_id,
        end_id=end_id,
        wheelchair_mode=req.wheelchair_mode,
        avoid_stairs=req.avoid_stairs,
        algorithm=req.algorithm,
        db=db,
    )

    if not route:
        detail_msg = "No traversable pathway found between selected points."
        if req.wheelchair_mode:
            detail_msg += " (Note: Wheelchair-accessible route may be blocked or restricted)."
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail_msg,
        )

    # Log route request for campus intelligence and analytics
    try:
        start_n = db.query(m.PathNode).filter(m.PathNode.id == start_id).first()
        end_n = db.query(m.PathNode).filter(m.PathNode.id == end_id).first()
        history = m.RouteHistory(
            start_node_id=start_id,
            end_node_id=end_id,
            origin_name=start_n.name if start_n else start_id,
            destination_name=end_n.name if end_n else end_id,
            total_distance_meters=route.total_distance_meters,
            estimated_time_minutes=route.estimated_time_minutes,
            algorithm_used=route.algorithm_used,
            wheelchair_mode=req.wheelchair_mode,
            avoid_stairs=req.avoid_stairs,
        )
        db.add(history)
        db.commit()
    except Exception:
        db.rollback()

    return route


@router.post("/alternatives", response_model=AlternativeRoutesResponse)
def get_alternative_routes(req: RouteRequest, db: Session = Depends(get_db)):
    """Returns primary route along with viable alternative routes."""
    start_id = req.start_node_id
    end_id = req.end_node_id

    if not start_id and req.start_lat and req.start_lng:
        if not graph_manager.graph.nodes:
            graph_manager.build_graph(db)
        start_id = graph_manager.find_nearest_node(req.start_lat, req.start_lng)

    if not end_id and req.end_lat and req.end_lng:
        if not graph_manager.graph.nodes:
            graph_manager.build_graph(db)
        end_id = graph_manager.find_nearest_node(req.end_lat, req.end_lng)

    if not start_id or not end_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start and destination points could not be resolved.",
        )

    primary, alts = calculate_alternatives(
        start_id=start_id,
        end_id=end_id,
        wheelchair_mode=req.wheelchair_mode,
        avoid_stairs=req.avoid_stairs,
        db=db,
    )

    if not primary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No viable routes found connecting the selected locations.",
        )

    return AlternativeRoutesResponse(primary=primary, alternatives=alts)
