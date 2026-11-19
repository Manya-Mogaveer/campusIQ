import React, { useEffect, useState } from 'react';
import { navigationService } from '../services/navigationService';
import { adminService } from '../services/adminService';
import {
  GitFork,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Accessibility,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function ManagePathways() {
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [blockReason, setBlockReason] = useState('Maintenance / repair work');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEdges = async () => {
    try {
      setLoading(true);
      const data = await navigationService.getEdges();
      setEdges(data || []);
    } catch (err) {
      console.error('Failed to load edges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdges();
  }, []);

  const handleOpenBlockModal = (edge) => {
    setSelectedEdge(edge);
    setBlockReason('Pathway maintenance or temporary construction work');
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedEdge) return;
    try {
      setFeedbackMsg('');
      setErrorMsg('');
      await adminService.blockPathway(selectedEdge.id, blockReason);
      setFeedbackMsg(`Pathway segment blocked. Live routing graph updated.`);
      setBlockModalOpen(false);
      fetchEdges();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to block pathway.');
    }
  };

  const handleReopen = async (edge) => {
    try {
      setFeedbackMsg('');
      setErrorMsg('');
      await adminService.reopenPathway(edge.id);
      setFeedbackMsg(`Pathway segment reopened and restored to live routing network.`);
      fetchEdges();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reopen pathway.');
    }
  };

  const filtered = edges.filter(
    (e) =>
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      e.pathway_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitFork className="w-6 h-6 text-blue-600" />
            <span>Campus Pathway Dynamic Control</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Block or reopen walking segments in real-time. Blocked edges are dynamically pruned from the Dijkstra and A* routing graph.
          </p>
        </div>

        <button
          onClick={fetchEdges}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Pathways</span>
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

      {/* Pathways Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Pathway Segment</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Distance</th>
                <th className="px-5 py-3.5">Accessibility</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((edge) => (
                <tr key={edge.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    <div>{edge.description || edge.id}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {edge.start_node_id} &rarr; {edge.end_node_id}
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize">{edge.pathway_type}</td>
                  <td className="px-5 py-3 font-mono">{edge.distance_meters} m</td>
                  <td className="px-5 py-3">
                    {edge.is_wheelchair_accessible ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Accessibility className="w-3.5 h-3.5" />
                        Ramped / Level
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">⚠️ Has Steps</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {edge.is_blocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {edge.is_blocked ? (
                      <button
                        onClick={() => handleReopen(edge)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBlockModal(edge)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Block</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Reason Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>Block Pathway Segment</span>
            </h3>

            <p className="text-xs text-slate-600">
              Marking this pathway blocked will immediately prune it from the navigation graph. Active route solvers will bypass this segment.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Closure
              </label>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
