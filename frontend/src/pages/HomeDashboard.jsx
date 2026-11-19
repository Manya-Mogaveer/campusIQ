import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampusMap from '../maps/CampusMap';
import { buildingService } from '../services/buildingService';
import { locationService } from '../services/locationService';
import { navigationService } from '../services/navigationService';
import { facilityService } from '../services/facilityService';
import sitHeaderImg from '../assets/sit_header.png';
import {
  Compass,
  Building2,
  MapPin,
  Route,
  Accessibility,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Shield,
  Layers,
  Sparkles,
  LocateFixed,
} from 'lucide-react';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick navigation widget state
  const [quickOrigin, setQuickOrigin] = useState('');
  const [quickDest, setQuickDest] = useState('');
  const [wheelchair, setWheelchair] = useState(false);
  const [resolvingGps, setResolvingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState(null);
  const [locateCount, setLocateCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [bldgs, locs, edges, facs] = await Promise.all([
          buildingService.getAll().catch(() => []),
          locationService.getAll().catch(() => []),
          navigationService.getEdges().catch(() => []),
          facilityService.getAll().catch(() => []),
        ]);
        if (bldgs && bldgs.length > 0) setBuildings(bldgs);
        else {
          setBuildings([
            { id: 'bldg-main-admin', name: 'Main Administrative & Academic Block', code: 'SIT-ADMIN', lat: 12.8718, lng: 74.9602, floors_count: 4, has_elevator: true, has_ramp: true, description: "Primary administrative complex housing the Principal's Office and Admissions." },
            { id: 'bldg-cs-is', name: 'Computer Science & Information Science Block', code: 'SIT-CS', lat: 12.8722, lng: 74.9593, floors_count: 4, has_elevator: true, has_ramp: true, description: "Computational laboratories and Artificial Intelligence research hub." },
            { id: 'bldg-mech-aero', name: 'Mechanical & Aeronautical Engineering Block', code: 'SIT-MECH', lat: 12.8726, lng: 74.9609, floors_count: 3, has_elevator: false, has_ramp: true, description: "Heavy machinery workshops and design laboratories." },
            { id: 'bldg-ec-ee', name: 'Electronics & Electrical Engineering Block', code: 'SIT-ECE', lat: 12.8712, lng: 74.9608, floors_count: 3, has_elevator: false, has_ramp: true, description: "VLSI, IoT and robotics testing arenas." },
            { id: 'bldg-central-lib', name: 'Central Library & Digital Resource Centre', code: 'SIT-LIB', lat: 12.8710, lng: 74.9596, floors_count: 2, has_elevator: true, has_ramp: true, description: "Comprehensive technical archives and quiet study zones." },
            { id: 'bldg-cafeteria', name: 'Student Centre & Central Cafeteria', code: 'SIT-CAFE', lat: 12.8715, lng: 74.9616, floors_count: 1, has_elevator: false, has_ramp: true, description: "Multi-cuisine student dining hall." },
            { id: 'bldg-sports-complex', name: 'Indoor Sports Complex & Gymnasium', code: 'SIT-SPORT', lat: 12.8732, lng: 74.9601, floors_count: 2, has_elevator: false, has_ramp: true, description: "Badminton courts and athletic training facilities." },
          ]);
        }

        if (locs && locs.length > 0) setLocations(locs);
        else {
          setLocations([
            { id: 'loc-1', name: "Principal's Office", code: 'ADM-01', lat: 12.87182, lng: 74.96022, category: 'admin', is_accessible: true },
            { id: 'loc-2', name: 'AI & Robotics Research Lab', code: 'CS-LAB-4', lat: 12.87222, lng: 74.95935, category: 'lab', is_accessible: true },
            { id: 'loc-3', name: 'Golden Jubilee Auditorium', code: 'AUD-01', lat: 12.87188, lng: 74.96015, category: 'academic', is_accessible: true },
            { id: 'loc-4', name: 'Central Reference Library', code: 'LIB-REF', lat: 12.87102, lng: 74.95962, category: 'library', is_accessible: true },
            { id: 'loc-5', name: 'Campus Dining Hall', code: 'CAFE-01', lat: 12.87152, lng: 74.96162, category: 'canteen', is_accessible: true },
            { id: 'loc-6', name: 'Badminton Arena & Gym', code: 'SPT-01', lat: 12.87322, lng: 74.96012, category: 'sports', is_accessible: true },
            { id: 'loc-7', name: 'Main Campus Security Gate (NH-75)', code: 'GATE-01', lat: 12.8705, lng: 74.9602, category: 'gate', is_accessible: true },
            { id: 'loc-8', name: 'Campus Health Center', code: 'MED-01', lat: 12.87175, lng: 74.96035, category: 'medical', is_accessible: true },
          ]);
        }

        if (edges && edges.length > 0) setPathways(edges);
        else {
          setPathways([
            { id: 'e1', start_coords: [12.8705, 74.9602], end_coords: [12.8710, 74.9602], distance_meters: 55.6, pathway_type: 'paved', is_blocked: false, is_wheelchair_accessible: true },
            { id: 'e2', start_coords: [12.8710, 74.9602], end_coords: [12.8718, 74.9602], distance_meters: 89.0, pathway_type: 'paved', is_blocked: false, is_wheelchair_accessible: true },
            { id: 'e3', start_coords: [12.8718, 74.9602], end_coords: [12.8722, 74.9595], distance_meters: 79.2, pathway_type: 'ramp', is_blocked: false, is_wheelchair_accessible: true, has_ramp: true },
            { id: 'e4', start_coords: [12.8710, 74.9602], end_coords: [12.8710, 74.9596], distance_meters: 65.2, pathway_type: 'walkway', is_blocked: false, is_wheelchair_accessible: true, has_ramp: true },
            { id: 'e5', start_coords: [12.8718, 74.9602], end_coords: [12.8715, 74.9616], distance_meters: 152.0, pathway_type: 'walkway', is_blocked: false, is_wheelchair_accessible: true },
          ]);
        }

        if (facs && facs.length > 0) setFacilities(facs);
        else {
          setFacilities([
            { id: 'f1', name: 'Central Campus Library', status: { status: 'open', open_time: '08:30 AM', close_time: '08:00 PM' } },
            { id: 'f2', name: 'Srinivas Central Food Court', status: { status: 'open', open_time: '07:30 AM', close_time: '06:00 PM' } },
            { id: 'f3', name: 'SIT Health & Emergency Care', status: { status: 'open', open_time: '09:00 AM', close_time: '05:00 PM' } },
            { id: 'f4', name: 'Srinivas Fitness & Sports Arena', status: { status: 'open', open_time: '06:00 AM', close_time: '07:30 PM' } },
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickRouteSubmit = (e) => {
    e.preventDefault();
    if (quickOrigin && quickDest) {
      navigate(`/navigate?start=${quickOrigin}&end=${quickDest}&wheelchair=${wheelchair}`);
    }
  };

  // Quick GPS Origin resolution for Dashboard
  const handleUseGpsLocation = async () => {
    setGpsNotice(null);
    if (!navigator.geolocation) {
      setGpsNotice({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setResolvingGps(true);
    // Also trigger location dot and centering on the digital twin map
    setLocateCount((c) => c + 1);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const snapRes = await navigationService.resolveNearestNode(latitude, longitude);
          if (!snapRes.is_within_campus) {
            const distKm = (snapRes.distance_meters / 1000).toFixed(1);
            setQuickOrigin(snapRes.default_entrance_id || 'node-gate-main');
            setGpsNotice({
              type: 'warning',
              text: `Your position is ${distKm} km away. Defaulted origin to SIT Main Entrance Gate (NH-75).`,
            });
          } else {
            setQuickOrigin(snapRes.node_id);
            setGpsNotice({
              type: 'success',
              text: `GPS Snapped to nearest campus waypoint: ${snapRes.name}`,
            });
          }
        } catch (err) {
          setGpsNotice({ type: 'error', text: err.message || 'Failed to snap GPS to campus graph.' });
        } finally {
          setResolvingGps(false);
        }
      },
      (err) => {
        setResolvingGps(false);
        setGpsNotice({
          type: 'error',
          text: err.code === 1 ? 'Location permission was denied.' : 'GPS position unavailable.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const blockedCount = pathways.filter((p) => p.is_blocked).length;
  const accessibleCount = locations.filter((l) => l.is_accessible).length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner with SIT Header Background */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white p-6 sm:p-8 bg-slate-950">
        {/* Background Image with Dark Gradient Tint for Optimal Legibility */}
        <div className="absolute inset-0 z-0">
          <img
            src={sitHeaderImg}
            alt="Srinivas Institute of Technology Campus"
            className="w-full h-full object-cover object-center scale-[1.02]"
          />
          {/* Multi-stop gradient overlay preserving image details while maintaining contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-400/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Spatial Navigation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
            Srinivas Institute of Technology
          </h1>
          <p className="text-slate-200 text-sm sm:text-base mt-2 leading-relaxed drop-shadow-sm font-medium">
            Real-time walking paths, wheelchair accessibility guidance, interactive floor layouts, and instant incident reporting for the Valachil campus.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/navigate"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/40 transition backdrop-blur-xs"
            >
              <Route className="w-4 h-4" />
              <span>Start Navigation</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/70 hover:bg-slate-900/90 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md transition border border-white/20 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Explore Digital Twin</span>
            </Link>
            <Link
              to="/qr"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/70 hover:bg-slate-900/90 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md transition border border-white/20 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>QR Checkpoint</span>
            </Link>
          </div>
        </div>

        {/* Ambient background graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block z-0">
          <Compass className="w-96 h-96 -mr-16 -mt-16 text-blue-400" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Campus Buildings</p>
            <p className="text-xl font-bold text-slate-900">{buildings.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Searchable POIs</p>
            <p className="text-xl font-bold text-slate-900">{locations.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Accessibility className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Wheelchair Waypoints</p>
            <p className="text-xl font-bold text-slate-900">{accessibleCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Blocked Pathways</p>
            <p className="text-xl font-bold text-slate-900">{blockedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Quick Route Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Campus Digital Twin Overview</span>
            </h2>
            <Link
              to="/explore"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Full Screen Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CampusMap
            buildings={buildings}
            locations={locations}
            pathways={pathways}
            height="460px"
            locateTrigger={locateCount}
            onUseLocationAsOrigin={(loc) => navigate(`/navigate?start_lat=${loc.lat}&start_lng=${loc.lng}`)}
          />
        </div>

        {/* Quick Route Launcher & Facilities (1 col) */}
        <div className="space-y-6">
          {/* Quick Route Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Route className="w-4 h-4 text-emerald-600" />
              <span>Quick Route Solver</span>
            </h3>

            <form onSubmit={handleQuickRouteSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Start From
                  </label>
                  <button
                    type="button"
                    onClick={handleUseGpsLocation}
                    disabled={resolvingGps}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition border border-blue-200 shadow-2xs"
                    title="Use my current GPS position"
                  >
                    <LocateFixed className="w-3 h-3 text-blue-600 animate-pulse" />
                    <span>{resolvingGps ? 'Locating...' : 'Use My GPS Location'}</span>
                  </button>
                </div>
                <select
                  value={quickOrigin}
                  onChange={(e) => setQuickOrigin(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2 px-2.5"
                  required
                >
                  <option value="">Select origin point...</option>
                  <option value="node-gate-main">Main Entrance Gate (NH-75)</option>
                  <option value="node-ent-admin-main">Administrative Block Portico</option>
                  <option value="node-ent-cs-ramp">Computer Science Ramp Entry</option>
                  <option value="node-ent-library">Central Library Entrance</option>
                  <option value="node-ent-cafe">Central Cafeteria</option>
                </select>

                {gpsNotice && (
                  <p className={`mt-1.5 text-[10px] leading-tight px-2 py-1 rounded-md border ${
                    gpsNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : gpsNotice.type === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {gpsNotice.text}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Destination
                </label>
                <select
                  value={quickDest}
                  onChange={(e) => setQuickDest(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2 px-2.5"
                  required
                >
                  <option value="">Select destination...</option>
                  <option value="node-ent-admin-main">Administrative Block</option>
                  <option value="node-ent-cs-ramp">CS & IS Engineering Block</option>
                  <option value="node-ent-mech">Mechanical Engineering Block</option>
                  <option value="node-ent-library">Central Library</option>
                  <option value="node-ent-sports">Indoor Sports Complex</option>
                  <option value="node-ent-cafe">Dining Hall & Canteen</option>
                </select>
              </div>

              {/* <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wheelchair}
                    onChange={(e) => setWheelchair(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="font-medium flex items-center gap-1">
                    <Accessibility className="w-3.5 h-3.5 text-blue-600" />
                    Wheelchair Accessible Mode
                  </span>
                </label>
              </div> */}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Calculate Best Walking Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Operational Facilities Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Facility Status</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </h3>

            <div className="space-y-3">
              {facilities.slice(0, 4).map((fac) => {
                const isOpen = fac.status?.status === 'open';
                return (
                  <div
                    key={fac.id}
                    className="flex items-start justify-between text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{fac.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {fac.status?.open_time} - {fac.status?.close_time}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        isOpen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fac.status?.status || 'Open'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
