from typing import List, Dict, Any
from pydantic import BaseModel


class MetricCard(BaseModel):
    title: str
    value: int | float | str
    change: str
    trend: str  # up, down, neutral


class PopularDestination(BaseModel):
    name: str
    category: str
    request_count: int


class IncidentBreakdown(BaseModel):
    category: str
    count: int
    resolved_count: int


class DailyRouteStat(BaseModel):
    date: str
    total_routes: int
    accessible_routes: int


class AnalyticsResponse(BaseModel):
    total_routes_calculated: int
    total_active_buildings: int
    total_poi_locations: int
    total_incidents_reported: int
    active_incidents: int
    resolved_incidents: int
    accessible_route_percentage: float
    popular_destinations: List[PopularDestination]
    incident_breakdown: List[IncidentBreakdown]
    route_trends: List[DailyRouteStat]
