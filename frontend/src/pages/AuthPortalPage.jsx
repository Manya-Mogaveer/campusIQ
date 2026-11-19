import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import sitCampusBg from '../assets/sit.jpg';
import LoadingScreen from './LoadingScreen';
import {
  Compass,
  ArrowRight,
  Shield,
  AlertCircle,
  Lock,
  Mail,
  ArrowLeft,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function AuthPortalPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Flip State for Cards: null | 'student' | 'faculty' | 'admin'
  const [flippedCard, setFlippedCard] = useState(null);

  // Loading Screen State: triggers the high-tech progressive loading screen
  const [showLoading, setShowLoading] = useState(false);
  const [targetDestination, setTargetDestination] = useState('/dashboard');

  // Form inputs for Student
  const [studentEmail, setStudentEmail] = useState('student@srinivasgroup.com');
  const [studentPassword, setStudentPassword] = useState('StudentPassword123!');

  // Form inputs for Faculty
  const [facultyEmail, setFacultyEmail] = useState('faculty@srinivasgroup.com');
  const [facultyPassword, setFacultyPassword] = useState('FacultyPassword123!');

  // Form inputs for Admin
  const [adminEmail, setAdminEmail] = useState('admin@srinivasgroup.com');
  const [adminPassword, setAdminPassword] = useState('AdminPassword123!');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login submission
  const handlePerformLogin = async (e, roleType) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    let emailToUse = studentEmail;
    let passwordToUse = studentPassword;

    if (roleType === 'faculty') {
      emailToUse = facultyEmail;
      passwordToUse = facultyPassword;
    } else if (roleType === 'admin') {
      emailToUse = adminEmail;
      passwordToUse = adminPassword;
    }

    try {
      const user = await login(emailToUse, passwordToUse);
      // Trigger the loading screen sequence before navigating
      if (user.role === 'admin') {
        setTargetDestination('/admin');
      } else {
        setTargetDestination('/dashboard');
      }
      setShowLoading(true);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Visitor Entry through loading screen
  const handleVisitorEnter = () => {
    setTargetDestination('/dashboard');
    setShowLoading(true);
  };

  // If loading screen is active, show the high-tech spatial LoadingScreen
  if (showLoading) {
    return (
      <LoadingScreen
        onComplete={() => {
          navigate(targetDestination);
        }}
        targetRoute={targetDestination}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5, 12, 24, 0.88), rgba(7, 16, 32, 0.94)), url(${sitCampusBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Header Bar (Clean and minimal branding) */}
      <div className="relative z-10 w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-tight">
              Campus<span className="text-blue-500">IQ</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Srinivas Institute of Technology &bull; Valachil
            </span>
          </div>
        </div>

        {/* Top Right: Campus Gate Tag & Admin Direct Toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/10 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Valachil NH-75 Campus</span>
          </span>

          <button
            onClick={() => setFlippedCard(flippedCard === 'admin' ? null : 'admin')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition backdrop-blur-md ${
              flippedCard === 'admin'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{flippedCard === 'admin' ? 'Close Admin' : 'Admin Console'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Area (Clean & Simple typography like Reference Image 3) */}
      <div className="relative z-10 max-w-4xl w-full my-auto py-6 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Intelligent Campus Navigation & Spatial Awareness.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
            Walking paths, wheelchair accessibility guidance, interactive floor layouts, and smart spatial checkpoints for Srinivas Institute of Technology, Valachil.
          </p>
          <div className="pt-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
              CHOOSE YOUR ROLE
            </span>
          </div>
        </div>

        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-2xl text-xs text-red-200 flex items-center gap-2 max-w-md animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Two Main Cards: Student & Faculty (3D Flippable in-place, Login in back face) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* ============================================================== */}
          {/* CARD 01: STUDENT PORTAL (Flip card in-place like Image 2)      */}
          {/* ============================================================== */}
          <div className="perspective-1000 w-full min-h-[460px]">
            <div
              className={`relative w-full h-full transform-style-3d transition-transform duration-500 ease-in-out ${
                flippedCard === 'student' ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE: Card Overview (Click anywhere to flip) */}
              <div
                onClick={() => setFlippedCard('student')}
                className="absolute inset-0 backface-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-500/80 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-2xl cursor-pointer hover:shadow-emerald-500/10 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-emerald-400 tracking-wider">
                      01
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Student Access
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-sans">
                      STUDENT PORTAL
                    </h2>
                    <p className="text-xs text-emerald-200/80 mt-1 font-medium leading-relaxed">
                      Academic Waypoints, Lectures & Campus Amenities
                    </p>
                  </div>

                  {/* Explore Pill Button */}
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCard('student');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white border border-emerald-500/40 transition-colors text-xs font-bold tracking-wider"
                    >
                      <span>Explore</span>
                      <span className="text-xs font-mono">&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Features & Demo Credential Bar */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Turn-by-turn routes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Wheelchair filters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>QR orientation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Cafeteria & Library</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[10px] uppercase text-emerald-400">Demo Credentials:</span>
                      <span className="font-mono text-[10px] text-slate-300">student@srinivasgroup.com</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 underline">Click to Flip</span>
                  </div>
                </div>
              </div>

              {/* BACK FACE: In-Card Login Form (Matches Image 2 exactly) */}
              <div
                className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  {/* Top Bar with Back Button */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <h2 className="text-lg font-black text-white tracking-wide">
                        Student Portal
                      </h2>
                      <p className="text-[11px] text-emerald-300/80">
                        Academic waypoints, lectures & campus amenities
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFlippedCard(null)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={(e) => handlePerformLogin(e, 'student')}
                    className="space-y-3.5 pt-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                          placeholder="student@srinivasgroup.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                    >
                      <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Footer Auto-fill & reset */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentEmail('student@srinivasgroup.com');
                      setStudentPassword('StudentPassword123!');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill Demo Credentials</span>
                  </button>
                  <span className="text-slate-500">Student Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARD 02: FACULTY PORTAL (Flip card in-place like Image 2)      */}
          {/* ============================================================== */}
          <div className="perspective-1000 w-full min-h-[460px]">
            <div
              className={`relative w-full h-full transform-style-3d transition-transform duration-500 ease-in-out ${
                flippedCard === 'faculty' ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE: Card Overview (Click anywhere to flip) */}
              <div
                onClick={() => setFlippedCard('faculty')}
                className="absolute inset-0 backface-hidden rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 hover:border-rose-500/80 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-2xl cursor-pointer hover:shadow-rose-500/10 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-rose-500 tracking-wider">
                      02
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                      Faculty & Staff
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-sans">
                      FACULTY PORTAL
                    </h2>
                    <p className="text-xs text-rose-200/80 mt-1 font-medium leading-relaxed">
                      Department Chambers, Lab Operations & Maintenance
                    </p>
                  </div>

                  {/* Explore Pill Button */}
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCard('faculty');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 group-hover:bg-rose-600 text-rose-300 group-hover:text-white border border-rose-500/40 transition-colors text-xs font-bold tracking-wider"
                    >
                      <span>Explore</span>
                      <span className="text-xs font-mono">&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Features & Demo Credential Bar */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>HOD & Staff Rooms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Laboratory schedules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Priority barrier reports</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Seminar hall access</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-[11px] text-rose-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[10px] uppercase text-rose-400">Demo Credentials:</span>
                      <span className="font-mono text-[10px] text-slate-300">faculty@srinivasgroup.com</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 underline">Click to Flip</span>
                  </div>
                </div>
              </div>

              {/* BACK FACE: In-Card Login Form (Matches Image 2 exactly) */}
              <div
                className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-rose-500/80 p-6 sm:p-7 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  {/* Top Bar with Back Button */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <h2 className="text-lg font-black text-white tracking-wide">
                        Faculty Portal
                      </h2>
                      <p className="text-[11px] text-rose-300/80">
                        Department chambers, lab operations & maintenance
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFlippedCard(null)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={(e) => handlePerformLogin(e, 'faculty')}
                    className="space-y-3.5 pt-4 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={facultyEmail}
                          onChange={(e) => setFacultyEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-xs"
                          placeholder="faculty@srinivasgroup.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={facultyPassword}
                          onChange={(e) => setFacultyPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 mt-2"
                    >
                      <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Footer Auto-fill & reset */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyEmail('faculty@srinivasgroup.com');
                      setFacultyPassword('FacultyPassword123!');
                    }}
                    className="text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill Demo Credentials</span>
                  </button>
                  <span className="text-slate-500">Faculty Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Console Card if toggled from top button */}
        {flippedCard === 'admin' && (
          <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl max-w-md mx-auto space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase">Campus Administrator</h3>
              </div>
              <button
                onClick={() => setFlippedCard(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => handlePerformLogin(e, 'admin')} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase"
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Footer Details */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span>Srinivas Institute of Technology</span>
          <span>&bull;</span>
          <span>Valachil, Mangaluru, Karnataka, India</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleVisitorEnter}
            className="text-slate-300 hover:text-white underline font-semibold flex items-center gap-1"
          >
            <span>Explore Public Campus Map as Visitor</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
