import React, { useEffect, useState } from 'react';
import { buildingService } from '../services/buildingService';
import { adminService } from '../services/adminService';
import {
  Building2,
  Plus,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Accessibility,
  X,
  Layers,
} from 'lucide-react';

export default function ManageBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    lat: 12.8718,
    lng: 74.9602,
    floors_count: 3,
    has_elevator: true,
    has_ramp: true,
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const data = await buildingService.getAll();
      setBuildings(data || []);
    } catch (err) {
      console.error('Failed to load buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      lat: 12.8718,
      lng: 74.9602,
      floors_count: 3,
      has_elevator: true,
      has_ramp: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingId(b.id);
    setFormData({
      name: b.name,
      code: b.code,
      description: b.description || '',
      lat: b.lat,
      lng: b.lng,
      floors_count: b.floors_count,
      has_elevator: b.has_elevator,
      has_ramp: b.has_ramp,
    });
    setModalOpen(true);
  };

  const handleSaveBuilding = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      if (editingId) {
        await adminService.updateBuilding(editingId, formData);
        setFeedbackMsg('Building record updated successfully.');
      } else {
        await adminService.createBuilding(formData);
        setFeedbackMsg('New building registered.');
      }
      setModalOpen(false);
      fetchBuildings();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  const filtered = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Manage Campus Buildings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic blocks, seminar complexes, laboratory buildings, floor numbers, and elevator/ramp accessibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Building</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((bldg) => (
          <div
            key={bldg.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {bldg.code}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {bldg.floors_count} Levels
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{bldg.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {bldg.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                {bldg.has_ramp && <span className="text-blue-600 font-medium">♿ Ramp</span>}
                {bldg.has_elevator && <span className="text-indigo-600 font-medium">🛗 Lift</span>}
              </div>
              <button
                onClick={() => handleOpenEdit(bldg)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Building' : 'Register New Building'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building Name *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Building Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.floors_count}
                    onChange={(e) => setFormData({ ...formData, floors_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_elevator}
                    onChange={(e) => setFormData({ ...formData, has_elevator: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Passenger Elevator / Lift</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_ramp}
                    onChange={(e) => setFormData({ ...formData, has_ramp: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Wheelchair Ramp Entrance</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
