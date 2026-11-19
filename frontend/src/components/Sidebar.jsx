import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Compass,
  MapPin,
  Route,
  FolderTree,
  QrCode,
  AlertTriangle,
  Building2,
  GitFork,
  CheckCircle2,
  BarChart3,
  Layers,
  X,
  Coffee,
  Shield,
  GraduationCap,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { to: '/dashboard', label: 'Campus Overview', icon: Compass },
    { to: '/explore', label: 'Explore Campus (Map)', icon: MapPin },
    { to: '/navigate', label: 'Pedestrian Navigation', icon: Route },
    { to: '/directory', label: 'Campus Directory', icon: FolderTree },
    { to: '/indoor', label: 'Indoor & Floor Plans', icon: Layers },
    { to: '/qr', label: 'QR Orientation Points', icon: QrCode },
    { to: '/report', label: 'Report Issue / Barrier', icon: AlertTriangle },
  ];

  const adminItems = [
    { to: '/admin', label: 'Operations Dashboard', icon: BarChart3 },
    { to: '/admin/locations', label: 'Manage Locations', icon: MapPin },
    { to: '/admin/buildings', label: 'Manage Buildings', icon: Building2 },
    { to: '/admin/pathways', label: 'Pathway Controls', icon: GitFork },
    { to: '/admin/incidents', label: 'Incident Triage', icon: CheckCircle2 },
    { to: '/admin/facilities', label: 'Facility Status', icon: Coffee },
    { to: '/admin/analytics', label: 'Spatial Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Overlay Backdrop - higher than map panes and controls */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Flyout Overlay Drawer - top-level z-index */}
      <aside
        className={`fixed inset-y-0 left-0 z-[9999] w-72 sm:w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Campus Navigation Drawer"
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-tight">
                  Campus<span className="text-blue-600">IQ</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  SIT Valachil, Mangaluru
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Pill if signed in */}
          {user ? (
            <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1">{user.full_name}</p>
                  <p className="text-[10px] font-mono uppercase text-blue-700 font-bold">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-white transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-800">Campus Portals</p>
                <p className="text-[10px] text-slate-500">Student & Faculty Sign In</p>
              </div>
              <NavLink
                to="/auth"
                onClick={onClose}
                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition"
              >
                Sign In
              </NavLink>
            </div>
          )}

          {/* Navigation Links Scrollable Area */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation & Spatial
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Portals & Administrative Access */}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Portals & Access
              </p>
              <NavLink
                to="/auth"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Student / Faculty Portal</span>
              </NavLink>

              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Admin Operations Console</span>
              </NavLink>
            </div>

            {isAdmin && (
              <>
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>Admin Management Tools</span>
                </p>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-slate-400 text-[10px]">
          <p className="font-semibold text-slate-700">Srinivas Institute of Technology</p>
          <p>Valachil, Mangaluru &bull; NH-75</p>
          <p className="mt-1 font-mono text-slate-400">NetworkX A* / Dijkstra v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
