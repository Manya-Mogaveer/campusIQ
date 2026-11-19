import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Compass,
  LogIn,
  LogOut,
  Menu,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Sidebar Menu Toggle + Campus Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border border-slate-200"
              title="Open Navigation Menu"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Campus<span className="text-blue-600">IQ</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 leading-none hidden sm:block">
                  SIT Valachil, Mangaluru
                </span>
              </div>
            </Link>
          </div>

          {/* Right: User Profile / Auth Action */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{user.full_name}</span>
                  <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
