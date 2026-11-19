import math
import networkx as nx
from sqlalchemy.orm import Session
import app.models as m


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two coordinates in meters."""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def calculate_bearing_degrees(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates bearing from point 1 to point 2 in degrees (0-360)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360


def bearing_to_direction(bearing: float) -> str:
    """Converts bearing to human cardinal direction."""
    directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    idx = int((bearing + 22.5) / 45) % 8
    return directions[idx]


class CampusGraphManager:
    """Manages the in-memory NetworkX spatial graph built from PostgreSQL / SQLAlchemy models."""

    def __init__(self):
        self.graph: nx.Graph = nx.Graph()

    def build_graph(self, db: Session) -> nx.Graph:
        """Constructs graph with all active, unblocked edges."""
        G = nx.Graph()

        # Add all nodes
        nodes = db.query(m.PathNode).all()
        for node in nodes:
            G.add_node(
                node.id,
                name=node.name,
                lat=node.lat,
                lng=node.lng,
                node_type=node.node_type,
                floor_level=node.floor_level,
                is_accessible=node.is_accessible,
            )

        # Add edges
        edges = db.query(m.PathEdge).all()
        for edge in edges:
            G.add_edge(
                edge.start_node_id,
                edge.end_node_id,
                id=edge.id,
                weight=edge.distance_meters,
                distance=edge.distance_meters,
                pathway_type=edge.pathway_type,
                is_blocked=edge.is_blocked,
                is_wheelchair_accessible=edge.is_wheelchair_accessible,
                has_stairs=edge.has_stairs,
                has_ramp=edge.has_ramp,
                slope_degrees=edge.slope_degrees,
                description=edge.description,
            )

        self.graph = G
        return G

    def get_filtered_subgraph(
        self,
        wheelchair_mode: bool = False,
        avoid_stairs: bool = False,
    ) -> nx.Graph:
        """Returns a subgraph excluding blocked or inaccessible edges."""
        filtered_G = nx.Graph()

        # Copy all nodes
        for node_id, attrs in self.graph.nodes(data=True):
            filtered_G.add_node(node_id, **attrs)

        # Filter edges based on constraints
        for u, v, attrs in self.graph.edges(data=True):
            # Never route through blocked paths
            if attrs.get("is_blocked", False):
                continue

            # Strict wheelchair mode filtering
            if wheelchair_mode:
                if not attrs.get("is_wheelchair_accessible", True):
                    continue
                if attrs.get("has_stairs", False):
                    continue
                if attrs.get("slope_degrees", 0.0) > 8.0:
                    continue  # standard accessibility gradient threshold

            # Stair avoidance
            if avoid_stairs and attrs.get("has_stairs", False):
                continue

            filtered_G.add_edge(u, v, **attrs)

        return filtered_G

    def find_nearest_node(self, lat: float, lng: float) -> str | None:
        """Finds closest graph node to given coordinates."""
        node, _ = self.find_nearest_node_with_distance(lat, lng)
        return node

    def find_nearest_node_with_distance(self, lat: float, lng: float) -> tuple[str | None, float]:
        """Finds closest graph node to given coordinates along with haversine distance in meters."""
        if not self.graph.nodes:
            return None, float("inf")

        best_node = None
        min_dist = float("inf")

        for node_id, data in self.graph.nodes(data=True):
            dist = haversine_distance_meters(lat, lng, data["lat"], data["lng"])
            if dist < min_dist:
                min_dist = dist
                best_node = node_id

        return best_node, min_dist


# Global singleton graph manager
graph_manager = CampusGraphManager()
