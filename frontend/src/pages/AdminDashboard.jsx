import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { incidentService } from '../services/incidentService';
import { navigationService } from '../services/navigationService';
import {
  Shield,
  MapPin,
  Building2,
  GitFork,
  AlertTriangle,
  BarChart3,
  Coffee,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [stats, incs, paths] = await Promise.all([
        adminService.getAnalytics(),
        incidentService.getAdminAll(),
        navigationService.getEdges(),
      ]);
      setAnalytics(stats);
      setIncidents(incs || []);
      setPathways(paths || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const pendingIncidents = incidents.filter((i) => i.status === 'submitted' || i.status === 'under_review');
  const blockedPaths = pathways.filter((p) => p.is_blocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Admin Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Operations & Spatial Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Control campus infrastructure, review reports, and supervise live pedestrian graph state.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Live Graph</span>
        </button>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Routes Solved</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {analytics?.total_routes_calculated || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {analytics?.accessible_route_percentage || 0}% Wheelchair Guided
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Triage</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {pendingIncidents.length}
          </p>
          <span className="text-[11px] text-slate-500">
            Needs verification & approval
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Blocked Paths</span>
            <GitFork className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {blockedPaths.length}
          </p>
          <span className="text-[11px] text-red-600 font-medium">
            Pruned from routing graph
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Campus POIs</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {analytics?.total_poi_locations || 0}
          </p>
          <span className="text-[11px] text-slate-500">
            Across {analytics?.total_active_buildings || 0} buildings
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/admin/locations"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <MapPin className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Manage Locations</span>
        </Link>
        <Link
          to="/admin/buildings"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <Building2 className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Buildings</span>
        </Link>
        <Link
          to="/admin/pathways"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <GitFork className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Pathway Block/Reopen</span>
        </Link>
        <Link
          to="/admin/incidents"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <CheckCircle2 className="w-5 h-5 mx-auto text-amber-500 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Incident Triage</span>
        </Link>
        <Link
          to="/admin/facilities"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <Coffee className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Facilities</span>
        </Link>
        <Link
          to="/admin/analytics"
          className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group"
        >
          <BarChart3 className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-slate-800 block mt-2">Analytics</span>
        </Link>
      </div>

      {/* Incident Review Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Incident Review & Verification Queue</span>
          </h2>
          <Link
            to="/admin/incidents"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Triage Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.slice(0, 5).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {inc.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-700">
                      {inc.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inc.reporter_name || 'Anonymous'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inc.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(inc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/incidents"
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                    >
                      Triage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
