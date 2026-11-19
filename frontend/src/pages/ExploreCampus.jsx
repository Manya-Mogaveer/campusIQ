import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../maps/CampusMap';
import { buildingService } from '../services/buildingService';
import { locationService } from '../services/locationService';
import { navigationService } from '../services/navigationService';
import {
  Search,
  Building2,
  MapPin,
  Layers,
  Filter,
  Navigation,
  Accessibility,
  ArrowRight,
  Phone,
  Mail,
  X,
  Compass,
  LocateFixed,
} from 'lucide-react';

export default function ExploreCampus() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locateCount, setLocateCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bldgs, cats, edges] = await Promise.all([
          buildingService.getAll(),
          locationService.getCategories(),
          navigationService.getEdges(),
        ]);
        setBuildings(bldgs || []);
        setCategories(cats || []);
        setPathways(edges || []);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locs = await locationService.getAll({
          category: selectedCategory,
          search: searchQuery,
          accessible_only: accessibleOnly,
        });
        setLocations(locs || []);
      } catch (err) {
        console.error('Failed to query locations:', err);
      }
    };
    fetchLocations();
  }, [selectedCategory, searchQuery, accessibleOnly]);

  const handleNavigateTo = (item) => {
    // If it's a building or location, pass target coordinate or code
    navigate(`/navigate?dest_lat=${item.lat}&dest_lng=${item.lng}&dest_name=${encodeURIComponent(item.name)}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search campus buildings, labs, departments, amenities (e.g. AI Lab, Principal, Canteen)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Accessibility Filter Checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 select-none">
          <input
            type="checkbox"
            checked={accessibleOnly}
            onChange={(e) => setAccessibleOnly(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <Accessibility className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">Wheelchair Accessible</span>
        </label>

        {/* Current Location Quick Action */}
        <button
          onClick={() => setLocateCount((c) => c + 1)}
          className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 font-semibold transition whitespace-nowrap shadow-2xs"
          title="Locate me on the SIT campus map"
        >
          <LocateFixed className="w-4 h-4 text-blue-600" />
          <span>My Current Location</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Map & Detail Drawer Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 cols) */}
        <div className="lg:col-span-2">
          <CampusMap
            buildings={buildings}
            locations={locations}
            pathways={pathways}
            selectedLocation={selectedItem}
            onLocationSelect={(item) => setSelectedItem(item)}
            height="620px"
            locateTrigger={locateCount}
            onUseLocationAsOrigin={(loc) => navigate(`/navigate?start_lat=${loc.lat}&start_lng=${loc.lng}`)}
          />
        </div>

        {/* Selected Information Panel / Explorer List (1 col) */}
        <div className="space-y-4 max-h-[620px] flex flex-col">
          {selectedItem ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {selectedItem.code || 'CAMPUS POI'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedItem.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedItem.image_url && (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="w-full h-36 object-cover rounded-xl border border-slate-100"
                />
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedItem.description || 'SIT Valachil campus facility.'}
              </p>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latitude</span>
                  <span className="font-mono font-medium text-slate-700">{selectedItem.lat.toFixed(5)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Longitude</span>
                  <span className="font-mono font-medium text-slate-700">{selectedItem.lng.toFixed(5)}</span>
                </div>
                {selectedItem.floors_count && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Floors</span>
                    <span className="font-medium text-slate-700">{selectedItem.floors_count} Levels</span>
                  </div>
                )}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accessibility</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
                    <Accessibility className="w-3.5 h-3.5" />
                    Verified Ramp
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleNavigateTo(selectedItem)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to this Location</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Filtered POIs ({locations.length})</span>
              </h3>

              <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedItem(loc)}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{loc.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                        {loc.code || loc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {loc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
