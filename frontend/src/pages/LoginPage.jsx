import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import {
  Compass,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register({
          email,
          password,
          full_name: fullName,
          role,
        });
        setSuccessMsg('Account registered successfully! Signing you in...');
      }

      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@srinivasgroup.com');
      setPassword('AdminPassword123!');
      setIsRegister(false);
    } else {
      setEmail('student@srinivasgroup.com');
      setPassword('StudentPassword123!');
      setIsRegister(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isRegister ? 'Create CampusIQ Account' : 'Campus Member Sign In'}
          </h2>
          <p className="text-xs text-slate-500">
            Srinivas Institute of Technology, Valachil, Mangaluru
          </p>
        </div>

        {/* Demo Account Quick Access Buttons */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student Demo</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Raghavendra / Priya Rao"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                placeholder="user@srinivasgroup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : "Don't have an account? Register as campus member"}
          </button>
        </div>
      </div>
    </div>
  );
}
