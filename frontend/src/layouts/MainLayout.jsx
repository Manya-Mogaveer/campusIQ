import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { AlertTriangle, Bell, X } from 'lucide-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiRequest('/announcements');
        if (data && data.length > 0) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.warn('Could not fetch announcements:', err.message);
      }
    };
    fetchAnnouncements();
  }, []);

  const latestAlert = announcements.length > 0 ? announcements[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Top Bar Navigation */}
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Flyout Overlay Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Campus Active Alert Banner */}
      {latestAlert && !bannerDismissed && (
        <div className={`w-full px-4 py-2 text-xs flex items-center justify-between transition ${
          latestAlert.level === 'warning'
            ? 'bg-amber-500 text-slate-900 border-b border-amber-600'
            : latestAlert.level === 'emergency'
            ? 'bg-red-600 text-white border-b border-red-700 font-semibold'
            : 'bg-blue-600 text-white border-b border-blue-700'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center gap-2 flex-1 px-4">
            {latestAlert.level === 'warning' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Bell className="w-4 h-4 flex-shrink-0 animate-bounce" />
            )}
            <span className="font-semibold">{latestAlert.title}:</span>
            <span className="line-clamp-1">{latestAlert.content}</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded hover:bg-black/10 transition"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Container - Expansive & Centered */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CampusIQ Spatial Platform</span>
            <span>&bull;</span>
            <span>Srinivas Institute of Technology (SIT), Valachil, Mangaluru</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-medium">
              SIT Valachil Campus Model
            </span>
            <span>All rights reserved &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
