import React, { useEffect, useState } from 'react';
import { facilityService } from '../services/facilityService';
import {
  Coffee,
  Clock,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [statusVal, setStatusVal] = useState('open');
  const [openTime, setOpenTime] = useState('08:30 AM');
  const [closeTime, setCloseTime] = useState('05:30 PM');
  const [notice, setNotice] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilityService.getAll();
      setFacilities(data || []);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenEdit = (fac) => {
    setSelectedFacility(fac);
    setStatusVal(fac.status?.status || 'open');
    setOpenTime(fac.status?.open_time || '08:30 AM');
    setCloseTime(fac.status?.close_time || '05:30 PM');
    setNotice(fac.status?.notice || '');
    setModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      setFeedbackMsg('');
      setErrorMsg('');

      await facilityService.updateStatus(selectedFacility.id, {
        status: statusVal,
        open_time: openTime,
        close_time: closeTime,
        notice,
      });

      setFeedbackMsg(`Operational status updated for ${selectedFacility.name}.`);
      setModalOpen(false);
      fetchFacilities();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update facility status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Coffee className="w-6 h-6 text-indigo-600" />
            <span>Campus Facility Operations & Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operational hours, temporary maintenance closures, and public facility notices.
          </p>
        </div>

        <button
          onClick={fetchFacilities}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Facilities</span>
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
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((fac) => {
          const isOpen = fac.status?.status === 'open';
          return (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {fac.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {fac.status?.status || 'Open'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{fac.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{fac.description}</p>

                {fac.status?.notice && (
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700">
                    <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">
                      Active Notice
                    </span>
                    <p className="mt-0.5">{fac.status.notice}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {fac.status?.open_time} - {fac.status?.close_time} ({fac.status?.days_active})
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(fac)}
                  className="px-3 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-lg transition"
                >
                  Update Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Status Modal */}
      {modalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Update Schedule: {selectedFacility.name}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational State *</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50 capitalize"
                >
                  <option value="open">Open (Normal Hours)</option>
                  <option value="closed">Closed for the Day</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="temporary_closure">Temporary Advisory Closure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opens At</label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Closes At</label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice / Message to Students</label>
                <textarea
                  rows={3}
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  placeholder="e.g. Early closure at 4 PM for seminar, dining counter sanitized..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
