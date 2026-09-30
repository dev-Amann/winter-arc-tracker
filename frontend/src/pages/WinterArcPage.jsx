import React, { useState, useEffect } from 'react';
import { getWinterArc } from '../services/api';
import { Flame, Calendar, Clock, Trophy, Award, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

const WinterArcPage = () => {
  const [waData, setWaData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWinterArc = async () => {
    try {
      setLoading(true);
      const res = await getWinterArc();
      setWaData(res);
    } catch (err) {
      console.error('Failed to load Winter Arc data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWinterArc();
  }, []);

  if (loading && !waData) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Winter Arc 2026 Mode...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-cyan-500/30 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                <Flame className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">WINTER ARC 2026</h2>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Focused Execution Period</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Objective tracking period designed to measure planned work against actual performance.
            </p>
          </div>

          {/* Days Remaining Pill */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 text-center min-w-[200px]">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DAYS REMAINING</div>
            <div className="text-4xl font-black text-cyan-400 mt-1">{waData?.days_remaining}</div>
            <div className="text-[11px] text-slate-500 mt-1">Out of {waData?.total_days} Total Days</div>
          </div>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">START DATE</span>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            {waData?.start_date}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">END DATE</span>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            {waData?.end_date}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DAYS ELAPSED</span>
          <div className="text-2xl font-black text-white">{waData?.days_elapsed} <span className="text-xs text-slate-400">days</span></div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OVERALL PROGRESS</span>
          <div className="text-2xl font-black text-cyan-400">{waData?.overall_progress_pct}%</div>
        </div>
      </div>

      {/* Objective End-of-Arc Summary Panel */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            WINTER ARC OBJECTIVE SUMMARY METRICS
          </h3>
          <span className="text-xs text-slate-400 font-medium">Standardized Statistical Evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PLANNED HOURS</span>
            <div className="text-2xl font-extrabold text-sky-400">{waData?.planned_hours} hrs</div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ACTUAL HOURS</span>
            <div className="text-2xl font-extrabold text-emerald-400">{waData?.actual_hours} hrs</div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ACHIEVEMENT RATE</span>
            <div className="text-2xl font-extrabold text-cyan-400">{waData?.achievement_pct}%</div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CONSISTENCY RATE</span>
            <div className="text-2xl font-extrabold text-indigo-400">{waData?.consistency_pct}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">BEST MONTH</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white">{waData?.best_month}</div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">BEST HABIT</span>
              <Trophy className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white">{waData?.best_habit}</div>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MOST IMPROVED HABIT</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">{waData?.most_improved_habit}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinterArcPage;
