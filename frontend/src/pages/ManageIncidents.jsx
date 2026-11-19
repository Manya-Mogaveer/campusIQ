import React, { useEffect, useState } from 'react';
import { incidentService } from '../services/incidentService';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  X,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
} from 'lucide-react';

export default function ManageIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Triage Action Modal State
  const [activeModalInc, setActiveModalInc] = useState(null);
  const [triageStatus, setTriageStatus] = useState('approved');
  const [priority, setPriority] = useState('medium');
  const [adminNotes, setAdminNotes] = useState('');
  const [markBlocked, setMarkBlocked] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAdminAll({
        status: selectedStatus,
      });
      setIncidents(data || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedStatus]);

  const handleOpenTriage = (inc) => {
    setActiveModalInc(inc);
    setTriageStatus(inc.status === 'submitted' ? 'approved' : inc.status);
    setPriority(inc.priority || 'medium');
    setAdminNotes(inc.admin_notes || '');
    setMarkBlocked(Boolean(inc.path_edge_id));
  };

  const handleSaveTriage = async () => {
    if (!activeModalInc) return;
    try {
      setFeedbackMsg('');
      setErrorMsg('');

      await incidentService.triage(activeModalInc.id, {
        status: triageStatus,
        priority,
        admin_notes: adminNotes,
        mark_path_blocked: markBlocked,
      });

      setFeedbackMsg(`Incident "${activeModalInc.title}" triaged as [${triageStatus.toUpperCase()}]. Pathway state synchronized.`);
      setActiveModalInc(null);
      fetchIncidents();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update incident.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Incident Review & Verification Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage student & faculty infrastructure reports. Approving reports synchronizes pathway obstruction in the navigation graph.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Incidents</span>
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

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'submitted', 'under_review', 'approved', 'in_progress', 'resolved', 'rejected'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Report Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Reporter</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900 max-w-xs">
                    <div>{inc.title}</div>
                    <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{inc.description}</div>
                  </td>
                  <td className="px-5 py-3 capitalize">
                    {inc.category.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-700 capitalize">{inc.priority}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <div>{inc.reporter_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-slate-400">{inc.reporter_email || ''}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inc.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : inc.status === 'rejected'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleOpenTriage(inc)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition"
                    >
                      Review & Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage Modal */}
      {activeModalInc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Triage Incident: {activeModalInc.title}
              </h3>
              <button
                onClick={() => setActiveModalInc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {activeModalInc.description}
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Action</label>
                  <select
                    value={triageStatus}
                    onChange={(e) => setTriageStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 capitalize"
                  >
                    <option value="under_review">Under Review / Inspection</option>
                    <option value="approved">Approved / Confirmed Issue</option>
                    <option value="in_progress">In Progress / Fixing</option>
                    <option value="resolved">Resolved / Pathway Safe</option>
                    <option value="rejected">Rejected / Unsubstantiated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {activeModalInc.path_edge_id && triageStatus === 'approved' && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-red-50 border border-red-200 rounded-xl">
                    <input
                      type="checkbox"
                      checked={markBlocked}
                      onChange={(e) => setMarkBlocked(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-semibold text-red-800">
                      Mark associated pathway segment as BLOCKED in live navigation graph
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes from physical inspection, maintenance crew assignment..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalInc(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTriage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  Save Triage Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
