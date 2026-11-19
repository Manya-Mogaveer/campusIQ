import React, { useState, useEffect } from 'react';
import { incidentService } from '../services/incidentService';
import { locationService } from '../services/locationService';
import { navigationService } from '../services/navigationService';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
  Sparkles,
  GitFork,
} from 'lucide-react';

export default function ReportIssuePage() {
  const [locations, setLocations] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [myReports, setMyReports] = useState([]);

  // Form State
  const [category, setCategory] = useState('blocked_pathway');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locs, edges, recentIncidents] = await Promise.all([
          locationService.getAll(),
          navigationService.getEdges(),
          incidentService.getPublic(),
        ]);
        setLocations(locs || []);
        setPathways(edges || []);
        setMyReports(recentIncidents || []);
      } catch (err) {
        console.error('Error loading incident data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg('Please provide a title and detailed description.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        category,
        title,
        description,
        location_id: selectedLocation || null,
        path_edge_id: selectedPath || null,
        reporter_name: reporterName || 'Anonymous Student/Visitor',
        reporter_email: reporterEmail || null,
      };

      const res = await incidentService.submit(payload);
      setSuccessMsg('Incident report submitted successfully! Campus administrators will triage and inspect this issue.');
      setTitle('');
      setDescription('');
      setSelectedLocation('');
      setSelectedPath('');

      // Refresh public list
      const updated = await incidentService.getPublic();
      setMyReports(updated || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit incident report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <span>Report Campus Issue or Pathway Barrier</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Help maintain SIT Valachil campus infrastructure. Submit blocked routes, broken ramps, or facility issues for administrative verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Verification Safety Policy:</strong> Unverified reports do not automatically alter the navigation graph. An authorized campus administrator will review, verify the site, and update pathway status.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
                  >
                    <option value="blocked_pathway">Blocked Pedestrian Pathway</option>
                    <option value="damaged_pathway">Damaged Pathway / Pothole / Tiles</option>
                    <option value="accessibility_issue">Accessibility Barrier / Broken Ramp</option>
                    <option value="facility_issue">Facility Outage / Water / Restroom</option>
                    <option value="incorrect_info">Incorrect Location Information</option>
                    <option value="other">Other Campus Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Related Pathway Edge (Optional)
                  </label>
                  <select
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
                  >
                    <option value="">Select pathway if known...</option>
                    {pathways.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.pathway_type.toUpperCase()} ({p.distance_meters}m) - {p.description || p.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Waterlogging near CS block entrance, tile repair on central walkway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the exact location, obstruction severity, whether wheelchairs can bypass it, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2.5 px-3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Student / Faculty / Visitor"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email (Optional for updates)
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 py-2 px-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Report...' : 'Submit Incident to Administration'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Recent Community Advisories & Status (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Campus Advisories & Status</span>
            </h2>

            <div className="space-y-3">
              {myReports.length === 0 ? (
                <p className="text-xs text-slate-400">No active incidents reported.</p>
              ) : (
                myReports.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{inc.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          inc.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inc.status === 'approved'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{inc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Category: {inc.category.replace('_', ' ')}</span>
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
