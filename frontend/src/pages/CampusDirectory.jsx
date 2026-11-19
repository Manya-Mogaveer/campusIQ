import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';
import { buildingService } from '../services/buildingService';
import {
  FolderTree,
  Search,
  Building2,
  MapPin,
  Accessibility,
  ArrowRight,
  Filter,
  ExternalLink,
} from 'lucide-react';

export default function CampusDirectory() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDir = async () => {
      try {
        setLoading(true);
        const [locs, bldgs, cats] = await Promise.all([
          locationService.getAll(),
          buildingService.getAll(),
          locationService.getCategories(),
        ]);
        setLocations(locs || []);
        setBuildings(bldgs || []);
        setCategories(cats || []);
      } catch (err) {
        console.error('Error fetching directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDir();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const matchesCat = selectedCat === 'all' || loc.category === selectedCat;
    const matchesSearch =
      !search ||
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      (loc.code && loc.code.toLowerCase().includes(search.toLowerCase())) ||
      (loc.tags && loc.tags.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-blue-600" />
            <span>Campus Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete registry of departments, academic halls, labs, amenities, and campus offices.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCat === c.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      {/* Table Directory View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Facility / Location</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Building</th>
                <th className="px-5 py-3.5">Floor</th>
                <th className="px-5 py-3.5">Accessibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocations.map((loc) => {
                const bldg = buildings.find((b) => b.id === loc.building_id);
                return (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>{loc.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                        {loc.description}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500">
                      {loc.code || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {loc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {bldg ? bldg.name : 'Open Campus Ground'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {loc.floor_number === 0 ? 'Ground' : `Floor ${loc.floor_number}`}
                    </td>
                    <td className="px-5 py-3">
                      {loc.is_accessible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <Accessibility className="w-3 h-3 text-emerald-600" />
                          Ramp / Lift
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Stairs only</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/navigate?dest_lat=${loc.lat}&dest_lng=${loc.lng}&dest_name=${encodeURIComponent(
                              loc.name
                            )}`
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                      >
                        <span>Navigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
