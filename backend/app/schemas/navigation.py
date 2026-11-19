from typing import List, Optional
from pydantic import BaseModel


class RouteRequest(BaseModel):
    start_node_id: Optional[str] = None
    end_node_id: Optional[str] = None
    # Support coordinates directly as fallback or pin drops
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None
    wheelchair_mode: bool = False
    avoid_stairs: bool = False
    algorithm: str = "astar"  # astar, dijkstra


class TurnInstruction(BaseModel):
    step_number: int
    instruction: str
    distance_meters: float
    pathway_type: str
    is_ramp: bool = False
    is_stairs: bool = False


class RouteResponse(BaseModel):
    total_distance_meters: float
    estimated_time_minutes: float
    is_wheelchair_accessible: bool
    has_stairs: bool
    algorithm_used: str
    node_ids: List[str]
    coordinates: List[List[float]]  # [[lat, lng], [lat, lng], ...]
    turn_by_turn: List[TurnInstruction]
    route_name: Optional[str] = "Primary Optimal Route"


class AlternativeRoutesResponse(BaseModel):
    primary: RouteResponse
    alternatives: List[RouteResponse] = []
