import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CampusMap from '../maps/CampusMap';
import { navigationService } from '../services/navigationService';
import { buildingService } from '../services/buildingService';
import { locationService } from '../services/locationService';
import {
  Route,
  Navigation,
  Accessibility,
  Footprints,
  Clock,
  Compass,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sliders,
  LocateFixed,
  Radio,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function NavigationPage() {
  const [searchParams] = useSearchParams();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form states
  const [startNode, setStartNode] = useState(searchParams.get('start') || 'node-gate-main');
  const [endNode, setEndNode] = useState(searchParams.get('end') || 'node-ent-admin-main');
  const [wheelchairMode, setWheelchairMode] = useState(searchParams.get('wheelchair') === 'true');
  const [avoidStairs, setAvoidStairs] = useState(false);
  const algorithm = 'astar'; // A* algorithm as permanent default

  // GPS Location state
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [resolvingGps, setResolvingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState(null);
  const [locateCount, setLocateCount] = useState(0); // { type, message, offCampus, defaultEntrance, defaultEntranceName }

  // Route states
  const [activeRoute, setActiveRoute] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [nodeList, edgeList, bldgs, locs] = await Promise.all([
          navigationService.getNodes(),
          navigationService.getEdges(),
          buildingService.getAll(),
          locationService.getAll(),
        ]);
        setNodes(nodeList || []);
        setEdges(edgeList || []);
        setBuildings(bldgs || []);
        setLocations(locs || []);
      } catch (err) {
        console.error('Failed to load navigation graph elements:', err);
      }
    };
    fetchPrerequisites();
  }, []);

  // Auto solve route if params exist on mount or change
  useEffect(() => {
    if (startNode && endNode && startNode !== endNode) {
      handleCalculateRoute();
    }
  }, [startNode, endNode, wheelchairMode, avoidStairs]);

  const handleCalculateRoute = async () => {
    if (!startNode || !endNode) {
      setErrorMsg('Please select both a start waypoint and destination.');
      return;
    }
    if (startNode === endNode) {
      setErrorMsg('Start location and destination must be distinct points.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await navigationService.getAlternatives({
        start_node_id: startNode,
        end_node_id: endNode,
        wheelchair_mode: wheelchairMode,
        avoid_stairs: avoidStairs,
        algorithm,
      });

      if (res && res.primary) {
        setActiveRoute(res.primary);
        setAlternatives(res.alternatives || []);
      } else {
        setErrorMsg('No valid pathway found connecting these locations.');
      }
    } catch (err) {
      console.warn('Navigation error:', err);
      setErrorMsg(err.message || 'Unable to compute route with current constraints.');
      setActiveRoute(null);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapPoints = () => {
    const temp = startNode;
    setStartNode(endNode);
    setEndNode(temp);
  };

  // Resolve user GPS coordinates to graph node
  const handleUseGpsLocation = async (coords = null) => {
    setGpsFeedback(null);
    setResolvingGps(true);
    setLocateCount((c) => c + 1);

    const resolveCoords = async (lat, lng) => {
      try {
        const snapRes = await navigationService.resolveNearestNode(lat, lng);
        if (!snapRes.is_within_campus) {
          const distKm = (snapRes.distance_meters / 1000).toFixed(1);
          setGpsFeedback({
            type: 'warning',
            offCampus: true,
            message: `Your current GPS position is ${distKm} km away, outside the mapped SIT Valachil campus pedestrian network. Walking directions cannot be computed outside the campus boundary.`,
            defaultEntrance: snapRes.default_entrance_id || 'node-gate-main',
            defaultEntranceName: snapRes.default_entrance_name || 'SIT Main Entrance Gate',
          });
        } else {
          setStartNode(snapRes.node_id);
          setGpsFeedback({
            type: 'success',
            offCampus: false,
            message: `GPS Snapped to nearest campus point: ${snapRes.name} (${snapRes.distance_meters}m away).`,
          });
        }
      } catch (err) {
        setGpsFeedback({
          type: 'error',
          offCampus: false,
          message: err.message || 'Failed to snap GPS location to campus graph.',
        });
      } finally {
        setResolvingGps(false);
      }
    };

    if (coords && coords.lat && coords.lng) {
      await resolveCoords(coords.lat, coords.lng);
      return;
    }

    if (userGpsCoords && userGpsCoords.lat && userGpsCoords.lng) {
      await resolveCoords(userGpsCoords.lat, userGpsCoords.lng);
      return;
    }

    if (!navigator.geolocation) {
      setGpsFeedback({
        type: 'error',
        offCampus: false,
        message: 'Browser geolocation is not supported on this device.',
      });
      setResolvingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserGpsCoords({ lat: latitude, lng: longitude, accuracy });
        await resolveCoords(latitude, longitude);
      },
      (err) => {
        setResolvingGps(false);
        let msg = 'Unable to acquire GPS coordinates.';
        if (err.code === 1) msg = 'Location access permission was denied in your browser.';
        else if (err.code === 2) msg = 'GPS signal unavailable or location turned off.';
        else if (err.code === 3) msg = 'GPS location request timed out.';
        setGpsFeedback({ type: 'error', offCampus: false, message: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const startPointObj = nodes.find((n) => n.id === startNode);
  const endPointObj = nodes.find((n) => n.id === endNode);

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-blue-600" />
            <span>Campus Pedestrian Navigation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            NetworkX graph-based multi-criteria routing following real paved walkways and ramps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Graph Connected ({nodes.length} Waypoints)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Controls & Step Directions (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Route Parameters</span>
            </h2>

            {/* Start Node with Live GPS Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Starting Location
                </label>
                <button
                  type="button"
                  onClick={() => handleUseGpsLocation()}
                  disabled={resolvingGps}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                  title="Snap nearest campus node from live GPS"
                >
                  <LocateFixed className="w-3 h-3 text-blue-600" />
                  <span>{resolvingGps ? 'Locating...' : 'Use My GPS Location'}</span>
                </button>
              </div>

              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
              >
                <option value="">Select origin waypoint...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.node_type})
                  </option>
                ))}
              </select>
            </div>

            {/* GPS Feedback Notice */}
            {gpsFeedback && (
              <div
                className={`p-3 rounded-xl text-xs space-y-1.5 border animate-in fade-in ${
                  gpsFeedback.type === 'warning'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : gpsFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                <div className="flex items-start gap-1.5 font-bold">
                  {gpsFeedback.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : gpsFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{gpsFeedback.message}</span>
                </div>

                {gpsFeedback.offCampus && gpsFeedback.defaultEntrance && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartNode(gpsFeedback.defaultEntrance);
                      setGpsFeedback(null);
                    }}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1.5 mt-1 shadow-xs"
                  >
                    <span>Start from {gpsFeedback.defaultEntranceName || 'SIT Main Gate'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwapPoints}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Swap origin and destination"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Node */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Destination
              </label>
              <select
                value={endNode}
                onChange={(e) => setEndNode(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
              >
                <option value="">Select destination waypoint...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.node_type})
                  </option>
                ))}
              </select>
            </div>

            

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Active Route Summary Card */}
          {activeRoute && (
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {activeRoute.route_name}
                </span>
                {activeRoute.is_wheelchair_accessible && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    <Accessibility className="w-3 h-3" />
                    Accessible
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Footprints className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-lg font-extrabold text-slate-900 block">
                    {activeRoute.total_distance_meters} m
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">
                    Walking Distance
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-lg font-extrabold text-slate-900 block">
                    {activeRoute.estimated_time_minutes} min
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">
                    Estimated Time (1.2m/s)
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Guidance */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Turn-By-Turn Instructions
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeRoute.turn_by_turn.map((step) => (
                    <div
                      key={step.step_number}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {step.step_number}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium leading-snug">
                          {step.instruction}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          {step.distance_meters} meters &bull; {step.pathway_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Route Candidates */}
              {alternatives.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Alternative Routes ({alternatives.length})
                  </span>
                  {alternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveRoute(alt)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{alt.route_name}</p>
                        <p className="text-[10px] text-slate-500">
                          {alt.total_distance_meters}m &bull; {alt.estimated_time_minutes} min
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Canvas (2 cols) */}
        <div className="lg:col-span-2">
          <CampusMap
            buildings={buildings}
            locations={locations}
            pathways={edges}
            activeRoute={activeRoute}
            startPoint={startPointObj}
            endPoint={endPointObj}
            height="640px"
            locateTrigger={locateCount}
            onUserLocationUpdate={(loc) => setUserGpsCoords(loc)}
            onUseLocationAsOrigin={(loc) => handleUseGpsLocation(loc)}
          />
        </div>
      </div>
    </div>
  );
}
