import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sitCampusBg from '../assets/sit.jpg';
import { Compass, CheckCircle2, Shield, Layers, Route } from 'lucide-react';

export default function LoadingScreen({ onComplete, targetRoute = '/app' }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(12);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Connecting to SIT Valachil Spatial Knowledgebase', icon: Layers },
    { title: 'Loading NetworkX Pedestrian Graph (14 Waypoints, 14 Paths)', icon: Route },
    { title: 'Calibrating Wheelchair Ramps & Accessibility Constraints', icon: CheckCircle2 },
    { title: 'Syncing Operational Facility Schedules & Incident Advisories', icon: Shield },
    { title: 'Launching CampusIQ Digital Twin...', icon: Compass },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const nextVal = prev + Math.floor(Math.random() * 18) + 12;
        return nextVal > 100 ? 100 : nextVal;
      });
    }, 280);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 25) setCurrentStep(0);
    else if (progress < 50) setCurrentStep(1);
    else if (progress < 75) setCurrentStep(2);
    else if (progress < 95) setCurrentStep(3);
    else setCurrentStep(4);

    if (progress === 100) {
      const exitTimeout = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate(targetRoute);
        }
      }, 500);
      return () => clearTimeout(exitTimeout);
    }
  }, [progress, navigate, onComplete, targetRoute]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5, 12, 24, 0.92), rgba(8, 18, 36, 0.97)), url(${sitCampusBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Radial Glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-in fade-in duration-500">
        {/* Pulsing Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 border border-blue-400/30 mx-auto">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-blue-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Institution & App Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
            Srinivas Institute of Technology
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Initializing Campus<span className="text-blue-500">IQ</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Valachil, Mangaluru &bull; Intelligent Spatial Engine
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CurrentIcon className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="truncate max-w-[280px] text-left">{steps[currentStep].title}</span>
            </span>
            <span className="font-bold text-blue-400">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 overflow-hidden border border-slate-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-5 gap-1.5 pt-2">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                idx <= currentStep ? 'bg-blue-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <p className="text-[11px] text-slate-500 font-mono">
          Powered by NetworkX &bull; Dijkstra & A* Path Solvers
        </p>
      </div>
    </div>
  );
}
