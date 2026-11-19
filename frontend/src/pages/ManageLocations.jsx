import React, { useEffect, useState } from 'react';
import { locationService } from '../services/locationService';
import { buildingService } from '../services/buildingService';
import { adminService } from '../services/adminService';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Accessibility,
  X,
} from 'lucide-react';

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'academic',
    building_id: '',
    floor_number: 0,
    lat: 12.8718,
    lng: 74.9602,
    description: '',
    is_accessible: true,
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const [locs, bldgs] = await Promise.all([
        locationService.getAll(),
        buildingService.getAll(),
      ]);
      setLocations(locs || []);
      setBuildings(bldgs || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      category: 'academic',
      building_id: buildings[0]?.id || '',
      floor_number: 0,
      lat: 12.8718,
      lng: 74.9602,
      description: '',
      is_accessible: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      code: loc.code || '',
      category: loc.category,
      building_id: loc.building_id || '',
      floor_number: loc.floor_number || 0,
      lat: loc.lat,
      lng: loc.lng,
      description: loc.description || '',
      is_accessible: loc.is_accessible,
    });
    setModalOpen(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      if (editingId) {
        await adminService.updateLocation(editingId, formData);
        setFeedbackMsg('Location updated successfully.');
      } else {
        await adminService.createLocation(formData);
        setFeedbackMsg('New location created successfully.');
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  const handleDeleteLocation = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await adminService.deleteLocation(id);
        setFeedbackMsg(`Location "${name}" removed.`);
        fetchLocations();
      } catch (err) {
        setErrorMsg(err.message || 'Failed to delete location.');
      }
    }
  };

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.code && l.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Manage Campus Locations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, or remove points of interest, labs, classrooms, and department offices.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter locations by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Coordinates</th>
                <th className="px-5 py-3.5">Accessibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <div>{loc.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{loc.description}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-500">{loc.code || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                      {loc.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </td>
                  <td className="px-5 py-3">
                    {loc.is_accessible ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Accessibility className="w-3.5 h-3.5" />
                        Accessible
                      </span>
                    ) : (
                      <span className="text-slate-400">Restricted</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Campus Location' : 'Add New Campus Location'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code / Room</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="academic">Academic / Classroom</option>
                    <option value="admin">Administration / Office</option>
                    <option value="lab">Laboratory</option>
                    <option value="library">Library</option>
                    <option value="canteen">Cafeteria</option>
                    <option value="sports">Sports / Gym</option>
                    <option value="medical">Health Center</option>
                    <option value="gate">Campus Gate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.is_accessible}
                    onChange={(e) => setFormData({ ...formData, is_accessible: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Wheelchair Accessible Location</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
