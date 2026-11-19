import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '../services/qrService';
import {
  QrCode,
  Scan,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building,
  Layers,
} from 'lucide-react';

export default function QRCheckpointsPage() {
  const navigate = useNavigate();
  const [checkpoints, setCheckpoints] = useState([]);
  const [manualCode, setManualCode] = useState('');
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        setLoading(true);
        const data = await qrService.getAll();
        setCheckpoints(data || []);
      } catch (err) {
        console.error('Failed to load QR checkpoints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckpoints();
  }, []);

  const handleResolveCode = async (codeToResolve) => {
    const code = codeToResolve || manualCode;
    if (!code) {
      setErrorMsg('Please enter a valid checkpoint code.');
      return;
    }

    try {
      setErrorMsg('');
      const cp = await qrService.getByCode(code);
      setActiveCheckpoint(cp);
    } catch (err) {
      setErrorMsg(err.message || 'Checkpoint code not recognized.');
      setActiveCheckpoint(null);
    }
  };

  const handleStartNavigationFromCheckpoint = () => {
    if (activeCheckpoint) {
      const nodeParam = activeCheckpoint.associated_node_id || '';
      navigate(`/navigate?start=${nodeParam}&origin_name=${encodeURIComponent(activeCheckpoint.name)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <QrCode className="w-6 h-6 text-purple-600" />
          <span>Indoor QR Orientation Checkpoints</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan or enter physical campus QR codes stationed at entrances and lobbies to orient your spatial position.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner / Code Entry Form (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Scan className="w-4 h-4 text-purple-600" />
              <span>Checkpoint Entry</span>
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Enter Physical Checkpoint Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SIT-GATE-01, SIT-CS-G01"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="flex-1 text-xs rounded-xl border-slate-300 focus:border-purple-500 focus:ring-purple-500 uppercase font-mono bg-slate-50 py-2.5 px-3"
                />
                <button
                  onClick={() => handleResolveCode(manualCode)}
                  className="py-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Locate
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Demo Selector */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Select Known Checkpoints
              </span>
              <div className="flex flex-wrap gap-1.5">
                {checkpoints.map((cp) => (
                  <button
                    key={cp.code}
                    onClick={() => {
                      setManualCode(cp.code);
                      handleResolveCode(cp.code);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 border border-slate-200 transition"
                  >
                    {cp.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Resolved Checkpoint Detail */}
          {activeCheckpoint && (
            <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                  {activeCheckpoint.code}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Oriented
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{activeCheckpoint.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeCheckpoint.description}</p>
              </div>

              {/* Orientation Direction Note */}
              {activeCheckpoint.orientation_guidance && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Compass className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Spatial Orientation:</span>
                    <span className="text-slate-600">{activeCheckpoint.orientation_guidance}</span>
                  </div>
                </div>
              )}

              {/* QR Code Graphic */}
              {activeCheckpoint.qr_image_url && (
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={activeCheckpoint.qr_image_url}
                    alt={activeCheckpoint.code}
                    className="w-36 h-36 object-contain rounded-lg shadow-sm"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-2">
                    Physical Placard QR Code
                  </span>
                </div>
              )}

              <button
                onClick={handleStartNavigationFromCheckpoint}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Navigate from this Checkpoint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Checkpoint Registry Gallery (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Campus Physical Orientation Nodes ({checkpoints.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  onClick={() => handleResolveCode(cp.code)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                      {cp.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">{cp.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{cp.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Floor {cp.floor_level === 0 ? 'Ground' : cp.floor_level} &bull; Coordinates: {cp.lat.toFixed(4)}, {cp.lng.toFixed(4)}
                    </span>
                  </div>
                  {cp.qr_image_url && (
                    <img
                      src={cp.qr_image_url}
                      alt={cp.code}
                      className="w-16 h-16 object-contain rounded bg-white p-1 border border-slate-200 flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
