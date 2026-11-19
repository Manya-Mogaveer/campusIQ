import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { locationService } from '../services/locationService';
import {
  MapPin,
  Building2,
  Accessibility,
  ArrowRight,
  Navigation,
  ArrowLeft,
} from 'lucide-react';

export default function LocationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const data = await locationService.getById(id);
        setLocation(data);
      } catch (err) {
        console.error('Failed to load location details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading location profile...</div>;
  }

  if (!location) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Location not found.{' '}
        <button onClick={() => navigate('/directory')} className="text-blue-600 underline">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
              {location.code || 'POI'}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
              {location.category}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">{location.name}</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{location.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Location Coordinates</span>
            <span className="font-mono text-slate-800 font-medium">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Accessibility</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Accessibility className="w-3.5 h-3.5" />
              {location.is_accessible ? 'Wheelchair Accessible' : 'Stairs Required'}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(
              `/navigate?dest_lat=${location.lat}&dest_lng=${location.lng}&dest_name=${encodeURIComponent(
                location.name
              )}`
            )
          }
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          <span>Start Navigation to this POI</span>
        </button>
      </div>
    </div>
  );
}
