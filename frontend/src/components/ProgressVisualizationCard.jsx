import React from 'react';
import { Target, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const ProgressVisualizationCard = ({ data }) => {
  const plannedHours = data?.planned_hours || 0;
  const actualHours = data?.actual_hours || 0;
  const achievementPct = data?.achievement_pct || 0;
  const diff = data?.difference_hours || (actualHours - plannedHours);

  const cappedPct = Math.min(100, Math.max(0, achievementPct));

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
      {/* Background Accent Blur */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Side: Text Metrics */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-cyan-400" />
              PLANNED VS ACTUAL PROGRESS
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Overall Tracked Performance
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                PLANNED
              </div>
              <div className="text-3xl font-black text-sky-400 mt-2">{plannedHours} <span className="text-xs font-medium text-slate-400">hrs</span></div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                ACTUAL
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">{actualHours} <span className="text-xs font-medium text-slate-400">hrs</span></div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                ACHIEVEMENT
              </div>
              <div className="text-3xl font-black text-cyan-400 mt-2">{achievementPct}%</div>
            </div>
          </div>

          {/* Large Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Overall Achievement Progress</span>
              <span className={diff >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {diff >= 0 ? `+${diff.toFixed(1)} hrs ahead` : `${diff.toFixed(1)} hrs behind target`}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-5 rounded-full p-1 border border-slate-800 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-md shadow-cyan-500/20"
                style={{ width: `${cappedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Circular Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 min-w-[200px]">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * cappedPct) / 100}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{achievementPct}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Target</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-3 text-center">
            {achievementPct >= 80 ? "On Track for Arc Victory" : "Action Required to Catch Up"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressVisualizationCard;
