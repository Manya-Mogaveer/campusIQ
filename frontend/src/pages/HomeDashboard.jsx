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
  const [navNodes, setNavNodes] = useState([]);
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
        const [bldgs, locs, edges, facs, nodes] = await Promise.all([
          buildingService.getAll().catch(() => []),
          locationService.getAll().catch(() => []),
          navigationService.getEdges().catch(() => []),
          facilityService.getAll().catch(() => []),
          navigationService.getNodes().catch(() => []),
        ]);
        setBuildings(bldgs || []);
        setLocations(locs || []);
        setPathways(edges || []);
        setFacilities(facs || []);
        setNavNodes(nodes || []);
      } catch (err) {
        console.error('Failed to load dashboard data from backend:', err);
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
                  {navNodes && navNodes.length > 0 ? (
                    navNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.node_type || 'point'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="node-gate-main">Main Entrance Gate (NH-75)</option>
                      <option value="node-ent-admin-main">Administrative Block Portico</option>
                      <option value="node-ent-library">Central Library Entrance</option>
                      <option value="node-ent-cafe">Central Cafeteria</option>
                    </>
                  )}
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
                  {navNodes && navNodes.length > 0 ? (
                    navNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.node_type || 'point'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="node-ent-admin-main">Administrative Block</option>
                      <option value="node-ent-mech">Mechanical Engineering Block</option>
                      <option value="node-ent-library">Central Library</option>
                      <option value="node-ent-sports">Indoor Sports Complex</option>
                      <option value="node-ent-cafe">Dining Hall & Canteen</option>
                    </>
                  )}
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
