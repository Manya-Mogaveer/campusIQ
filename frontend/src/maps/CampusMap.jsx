import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  GeoJSON,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import sitBuildingGeoJson from '../assets/sit_campus_buildings.json';
import {
  Compass,
  Layers,
  Building as BuildingIcon,
  Crosshair,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus,
  LocateFixed,
  Navigation,
  Radio,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

// Fix standard Leaflet default icon paths in bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Verified Geocoded SIT Valachil Coordinates
const SIT_CAMPUS_CENTER = [12.8746, 74.9395];
const SIT_DEFAULT_ZOOM = 18;

// Custom colored SVG pin markers
const createCustomIcon = (bgColor, label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
        transition: transform 0.2s ease;
      ">
        <span style="transform: rotate(45deg); font-size: 11px; font-weight: 800; font-family: sans-serif;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom User Location Marker with Direction Heading Indicator
const createUserLocationIcon = (heading = null) => {
  const hasHeading = heading !== null && heading !== undefined && !isNaN(heading);
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing Radar Animation -->
        <div style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 50%; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Directional Heading Pointer (if device heading available) -->
        ${
          hasHeading
            ? `
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%) rotate(${heading}deg);
            transform-origin: center 26px;
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-bottom: 14px solid #1d4ed8;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
          "></div>
        `
            : ''
        }

        <!-- Center Glowing Blue Dot -->
        <div style="position: absolute; inset: 6px; background-color: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.7);"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const buildingIcon = createCustomIcon('#2563eb', 'B');
const locationIcon = createCustomIcon('#10b981', 'P');
const startIcon = createCustomIcon('#059669', 'A');
const endIcon = createCustomIcon('#dc2626', 'B');

// Map Controller Subcomponent for Imperative Actions
function MapController({
  center,
  zoom,
  bounds,
  onMapReady,
}) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Handle map invalidation and resizing
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Recenter when bounds or center changes
  useEffect(() => {
    if (bounds && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    } else if (center) {
      map.setView(center, zoom || SIT_DEFAULT_ZOOM);
    }
  }, [center, zoom, bounds, map]);

  return null;
}

export default function CampusMap({
  buildings = [],
  locations = [],
  pathways = [],
  activeRoute = null,
  startPoint = null,
  endPoint = null,
  onLocationSelect = null,
  selectedLocation = null,
  height = '580px',
  initialBasemap = 'satellite', // 'satellite' for top-down aerial view or 'osm' for street view
  onUserLocationUpdate = null,
  onUseLocationAsOrigin = null,
  locateTrigger = 0,
}) {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Basemap selection: default to 'satellite' for top-down aerial view
  const [basemap, setBasemap] = useState(initialBasemap);

  // Layer Visibility
  const [layers, setLayers] = useState({
    buildings: true,
    footprints: true,
    locations: true,
    pathways: pathways.length > 0,
    accuracyCircle: true,
  });

  // User Geolocation States
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, accuracy, heading, speed, timestamp }
  const [isTracking, setIsTracking] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [locating, setLocating] = useState(false);
  const watchIdRef = useRef(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  // Cleanup GPS subscription on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Standardize Geolocation Error messages
  const handleGeoError = (err) => {
    let msg = 'Unable to retrieve your location.';
    if (err.code === 1) {
      msg = 'Location permission denied. Please allow location access in your browser settings.';
    } else if (err.code === 2) {
      msg = 'GPS signal unavailable or position could not be determined.';
    } else if (err.code === 3) {
      msg = 'GPS location request timed out. Please try again.';
    }
    setGeoError(msg);
    setTimeout(() => setGeoError(''), 7000);
  };

  // 1. One-Shot "My Location" Button (navigator.geolocation.getCurrentPosition)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoError('');
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy, heading, speed } = pos.coords;

        // Validate Coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
          setGeoError('Received invalid coordinates from GPS sensor.');
          return;
        }

        const newLoc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 15,
          heading: heading,
          speed: speed,
          timestamp: pos.timestamp,
        };

        setUserLocation(newLoc);
        if (onUserLocationUpdate) {
          onUserLocationUpdate(newLoc);
        }

        // Center map on user location with high zoom
        if (mapInstance) {
          mapInstance.flyTo([latitude, longitude], 18, { duration: 1.2 });
        }
      },
      (err) => {
        setLocating(false);
        handleGeoError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  };

  // External Locate Trigger from parent views
  useEffect(() => {
    if (locateTrigger > 0) {
      handleLocateMe();
    }
  }, [locateTrigger]);

  // 2. Live Continuous GPS Tracking Toggle (navigator.geolocation.watchPosition)
  const toggleLiveTracking = () => {
    if (isTracking) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError('');
    setIsTracking(true);

    // Prevent duplicate subscriptions
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, heading, speed } = pos.coords;
          if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

          const newLoc = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || 15,
            heading: heading,
            speed: speed,
            timestamp: pos.timestamp,
          };

          setUserLocation(newLoc);
          if (onUserLocationUpdate) {
            onUserLocationUpdate(newLoc);
          }
        },
        (err) => {
          handleGeoError(err);
          // If error occurs, clear tracking
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        }
      );
    } catch (e) {
      setGeoError('Failed to initialize live GPS tracker.');
      setIsTracking(false);
    }
  };

  // Reset View directly to SIT Valachil campus center
  const handleResetToCampus = () => {
    if (mapInstance) {
      mapInstance.flyTo(SIT_CAMPUS_CENTER, SIT_DEFAULT_ZOOM, {
        duration: 1.2,
      });
    }
  };

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen for native escape from fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 150);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [mapInstance]);

  // Compute bounds if active route coordinates exist
  let routeBounds = null;
  if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 1) {
    routeBounds = activeRoute.coordinates;
  }

  // GeoJSON Building Styling
  const geoJsonStyle = () => {
    return {
      color: '#0284c7',
      weight: 2,
      opacity: 0.85,
      fillColor: '#38bdf8',
      fillOpacity: basemap === 'satellite' ? 0.22 : 0.4,
    };
  };

  const onEachGeoJsonFeature = (feature, layer) => {
    const props = feature.properties || {};
    const name = props.name && props.name !== 'yes' ? props.name : 'SIT Campus Facility';
    const levels = props.levels ? `${props.levels} Floors` : 'Ground Structure';

    layer.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${name}</strong>
        <span style="display: inline-block; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 10px; font-weight: 700; margin-bottom: 6px;">
          ${levels}
        </span>
        <p style="margin: 0; color: #475569; font-size: 11px;">Verified OpenStreetMap spatial footprint.</p>
      </div>
    `);

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#38bdf8',
          fillOpacity: 0.55,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 2,
          color: '#0284c7',
          fillOpacity: basemap === 'satellite' ? 0.22 : 0.4,
        });
      },
    });
  };

  return (
    <div className={`space-y-3 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-950 flex flex-col' : ''}`}>
      {/* ============================================================== */}
      {/* DEDICATED TOP MAP OPTIONS TOOLBAR                             */}
      {/* Placed cleanly on top of the map below header                 */}
      {/* ============================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Basemap Switcher & Campus GPS Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Switcher Pills */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                basemap === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="High-resolution aerial satellite imagery"
            >
              <span>🛰️ Satellite View</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemap('osm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                basemap === 'osm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="OpenStreetMap vector road tiles"
            >
              <span>🗺️ Street Map</span>
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Section 1: My Location Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              locating
                ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse'
                : userLocation
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Locate my position on campus"
          >
            <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
            <span>{locating ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Section 2: Live GPS Tracking Toggle */}
          <button
            type="button"
            onClick={toggleLiveTracking}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
              isTracking
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isTracking ? 'Stop Live GPS Tracking' : 'Start Live GPS Tracking'}
          >
            <span className="relative flex h-2 w-2">
              {isTracking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isTracking ? 'bg-emerald-300' : 'bg-slate-400'
                }`}
              ></span>
            </span>
            <span>{isTracking ? 'Tracking Live GPS' : 'Start Live GPS'}</span>
          </button>

          {/* Reset to SIT Campus Center */}
          <button
            type="button"
            onClick={handleResetToCampus}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
            title="Reset to SIT Campus Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Layers Dropdown & Zoom / Fullscreen Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Campus Layers Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayersDropdown((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showLayersDropdown
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Layers</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {Object.values(layers).filter(Boolean).length}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showLayersDropdown && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200 text-xs text-slate-700 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Campus Map Layers</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    2D GIS
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
                  <input
                    type="checkbox"
                    checked={layers.footprints}
                    onChange={() => toggleLayer('footprints')}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Building Footprints (GeoJSON)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
                  <input
                    type="checkbox"
                    checked={layers.buildings}
                    onChange={() => toggleLayer('buildings')}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Building Markers ({buildings.length})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
                  <input
                    type="checkbox"
                    checked={layers.locations}
                    onChange={() => toggleLayer('locations')}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Points of Interest ({locations.length})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
                  <input
                    type="checkbox"
                    checked={layers.pathways}
                    onChange={() => toggleLayer('pathways')}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Pedestrian Pathways ({pathways.length})</span>
                </label>

                {userLocation && (
                  <label className="flex items-center gap-2 cursor-pointer text-blue-700 hover:text-blue-800 transition pt-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      checked={layers.accuracyCircle}
                      onChange={() => toggleLayer('accuracyCircle')}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>GPS Accuracy Circle (±{Math.round(userLocation.accuracy)}m)</span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => mapInstance && mapInstance.zoomIn()}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition border-r border-slate-200"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => mapInstance && mapInstance.zoomOut()}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Geolocation Notice Toast */}
      {geoError && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 select-none isolate ${
          isFullscreen ? 'flex-1 rounded-xl' : 'z-0'
        }`}
        style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
      >
      <MapContainer
        center={SIT_CAMPUS_CENTER}
        zoom={SIT_DEFAULT_ZOOM}
        zoomControl={false} // Custom floating zoom controls used
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', background: '#090d16' }}
      >
        <MapController
          center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : SIT_CAMPUS_CENTER}
          zoom={selectedLocation ? 19 : SIT_DEFAULT_ZOOM}
          bounds={routeBounds}
          onMapReady={setMapInstance}
        />

        {/* ============================================================== */}
        {/* TILE LAYER PROVIDERS                                           */}
        {/* ============================================================== */}
        {basemap === 'satellite' ? (
          <TileLayer
            key="esri-satellite"
            attribution='&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> World Imagery (High-Res Aerial Satellite)'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            maxNativeZoom={19}
          />
        ) : (
          <TileLayer
            key="osm-standard"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* ============================================================== */}
        {/* GEOJSON BUILDING FOOTPRINTS                                    */}
        {/* ============================================================== */}
        {layers.footprints && sitBuildingGeoJson && (
          <GeoJSON
            key={`sit-geojson-${basemap}`}
            data={sitBuildingGeoJson}
            style={geoJsonStyle}
            onEachFeature={onEachGeoJsonFeature}
          />
        )}

        {/* ============================================================== */}
        {/* VERIFIED PEDESTRIAN PATHWAYS                                   */}
        {/* ============================================================== */}
        {layers.pathways &&
          pathways.map((edge) => {
            const isBlocked = edge.is_blocked;
            const hasStairs = edge.has_stairs;
            const isRamp = edge.has_ramp;

            let color = '#38bdf8'; // bright cyan-blue on satellite
            if (isBlocked) color = '#ef4444';
            else if (isRamp) color = '#3b82f6';
            else if (hasStairs) color = '#f59e0b';

            return (
              <Polyline
                key={edge.id}
                positions={[edge.start_coords, edge.end_coords]}
                pathOptions={{
                  color,
                  weight: isBlocked ? 4 : 3,
                  dashArray: isBlocked ? '6, 6' : hasStairs ? '3, 6' : undefined,
                  opacity: 0.85,
                }}
              >
                <Popup>
                  <div className="text-xs font-sans">
                    <p className="font-bold text-slate-800">
                      {edge.pathway_type.toUpperCase()} PATHWAY
                    </p>
                    <p className="text-slate-600 mt-1 font-mono">Distance: {edge.distance_meters}m</p>
                    {isBlocked && (
                      <p className="text-red-600 font-bold mt-1">
                        BLOCKED: {edge.description || 'Restricted'}
                      </p>
                    )}
                    {hasStairs && <p className="text-amber-600 mt-0.5">⚠️ Steps Present</p>}
                    {isRamp && <p className="text-blue-600 mt-0.5">♿ Accessible Ramp</p>}
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* Active Route Highlight */}
        {activeRoute && activeRoute.coordinates && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.95,
              lineJoin: 'round',
            }}
          />
        )}

        {/* Start Point Marker */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <span className="font-bold text-emerald-600 block">START LOCATION</span>
                <span className="font-semibold text-slate-800">{startPoint.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <span className="font-bold text-red-600 block">DESTINATION</span>
                <span className="font-semibold text-slate-800">{endPoint.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ============================================================== */}
        {/* LIVE GPS USER LOCATION MARKER & ACCURACY CIRCLE                */}
        {/* ============================================================== */}
        {userLocation && (
          <>
            {/* Accuracy Circle */}
            {layers.accuracyCircle && userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}

            {/* User Location Dot Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon(userLocation.heading)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 space-y-2 max-w-[220px]">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 text-sm pb-1 border-b border-slate-100">
                    <Radio className="w-4 h-4 animate-pulse text-blue-600" />
                    <span>Your Current Location</span>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="font-semibold">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy:</span>
                      <span className="font-semibold text-slate-800">±{Math.round(userLocation.accuracy)} meters</span>
                    </div>
                    {userLocation.heading !== null && userLocation.heading !== undefined && !isNaN(userLocation.heading) && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Direction:</span>
                        <span className="font-semibold text-slate-800">{Math.round(userLocation.heading)}°</span>
                      </div>
                    )}
                    {userLocation.speed !== null && userLocation.speed !== undefined && !isNaN(userLocation.speed) && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Speed:</span>
                        <span className="font-semibold text-slate-800">{(userLocation.speed * 3.6).toFixed(1)} km/h</span>
                      </div>
                    )}
                  </div>

                  {userLocation.accuracy > 100 && (
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] flex items-center gap-1 border border-amber-200">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>Low GPS precision (±{Math.round(userLocation.accuracy)}m)</span>
                    </div>
                  )}

                  {/* Quick Action: Set as Route Origin */}
                  {onUseLocationAsOrigin && (
                    <button
                      type="button"
                      onClick={() => onUseLocationAsOrigin(userLocation)}
                      className="w-full mt-2 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Set as Route Origin</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ============================================================== */}
        {/* VERIFIED BUILDINGS LAYER                                       */}
        {/* ============================================================== */}
        {layers.buildings &&
          buildings.map((bldg) => (
            <Marker
              key={bldg.id}
              position={[bldg.lat, bldg.lng]}
              icon={buildingIcon}
              eventHandlers={{
                click: () => onLocationSelect && onLocationSelect(bldg),
              }}
            >
              <Popup>
                <div className="font-sans text-xs max-w-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                    <BuildingIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{bldg.name}</span>
                  </div>
                  <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono rounded text-[10px] mb-2 font-bold">
                    {bldg.code}
                  </span>
                  <p className="text-slate-600 text-xs mb-2 leading-relaxed">
                    {bldg.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 font-medium">
                    <span>Floors: {bldg.floors_count}</span>
                    {bldg.has_ramp && <span className="text-blue-600">♿ Ramp</span>}
                    {bldg.has_elevator && <span className="text-indigo-600">🛗 Elevator</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ============================================================== */}
        {/* CAMPUS POINTS OF INTEREST LAYER                                */}
        {/* ============================================================== */}
        {layers.locations &&
          locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={locationIcon}
              eventHandlers={{
                click: () => onLocationSelect && onLocationSelect(loc),
              }}
            >
              <Popup>
                <div className="font-sans text-xs max-w-xs">
                  <div className="font-bold text-slate-900 text-sm mb-0.5">{loc.name}</div>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase mb-1">
                    {loc.category}
                  </span>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">{loc.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* ============================================================== */}
      {/* BOTTOM CAMPUS COORDINATE & SATELLITE BADGE                     */}
      {/* ============================================================== */}
      <div className="absolute bottom-3.5 left-3.5 z-10 bg-slate-900/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-md border border-slate-700/80 text-xs flex items-center gap-2 text-white pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <div>
          <p className="font-bold text-white text-[11px] leading-tight">
            Srinivas Institute of Technology
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Valachil, Mangaluru &bull; 12.8746° N, 74.9395° E
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}
