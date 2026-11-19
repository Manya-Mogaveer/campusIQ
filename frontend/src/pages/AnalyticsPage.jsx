import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Accessibility,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load spatial analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading campus spatial analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Campus Spatial Usage & Intelligence Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time trends on pedestrian traffic, accessibility adoption, and infrastructure incident resolution.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Total Routes Calculated
          </span>
          <span className="text-2xl font-black text-slate-900 block">
            {analytics.total_routes_calculated}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">
            Active campus navigation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Wheelchair Accessibility Ratio
          </span>
          <span className="text-2xl font-black text-blue-600 block">
            {analytics.accessible_route_percentage}%
          </span>
          <span className="text-[11px] text-slate-500">
            Routes with ramp & stair avoidance
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Active Issues / Alerts
          </span>
          <span className="text-2xl font-black text-amber-600 block">
            {analytics.active_incidents}
          </span>
          <span className="text-[11px] text-slate-500">
            Under active mitigation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Resolved Issues
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {analytics.resolved_incidents}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">
            Pathways restored
          </span>
        </div>
      </div>

      {/* Chart 1: Daily Navigation Trends */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Weekly Pedestrian Navigation Volume</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Comparing standard shortest paths against wheelchair-accessible requested routes.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.route_trends}>
              <defs>
                <linearGradient id="totalRoutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="accRoutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="total_routes" name="Total Routes" stroke="#2563eb" fillOpacity={1} fill="url(#totalRoutes)" />
              <Area type="monotone" dataKey="accessible_routes" name="Wheelchair Mode" stroke="#10b981" fillOpacity={1} fill="url(#accRoutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Popular Destinations & Incident Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Most Navigated Campus Destinations</span>
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.popular_destinations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="request_count" name="Routes Requested" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Infrastructure Incident Breakdown</span>
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.incident_breakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="count" name="Reported" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved_count" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
