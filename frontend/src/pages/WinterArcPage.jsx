import React, { useState, useEffect } from 'react';
import { getWinterArc } from '../services/api';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Trophy, 
  Award, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Timer
} from 'lucide-react';

const WinterArcPage = () => {
  const currentCalendarYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentCalendarYear);
  const [waData, setWaData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWinterArc = async (yr) => {
    try {
      setLoading(true);
      const res = await getWinterArc(yr);
      setWaData(res);
    } catch (err) {
      console.error('Failed to load Winter Arc data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWinterArc(selectedYear);
  }, [selectedYear]);

  const handlePrevYear = () => setSelectedYear((prev) => prev - 1);
  const handleNextYear = () => setSelectedYear((prev) => prev + 1);
  const handleResetYear = () => setSelectedYear(currentCalendarYear);

  const isCurrentYear = selectedYear === currentCalendarYear;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Lifetime Mode Explainer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Lifetime Mode:</strong> Winter Arc automatically activates <strong>every year from Oct 1 to Dec 31</strong>.
          </span>
        </div>
        
        {/* Year Navigator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={handlePrevYear}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-extrabold text-sm px-3 text-white tracking-wider">
            {selectedYear}
          </span>
          
          <button
            onClick={handleNextYear}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Next Year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isCurrentYear && (
            <button
              onClick={handleResetYear}
              className="ml-2 px-2.5 py-1 text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 transition-colors"
            >
              Current Year ({currentCalendarYear})
            </button>
          )}
        </div>
      </div>

      {loading && !waData ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading Winter Arc {selectedYear}...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Hero Banner */}
          <div className={`relative glass-card p-8 rounded-3xl border overflow-hidden ${
            waData?.status === 'active'
              ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30'
              : waData?.status === 'completed'
              ? 'border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30'
              : 'border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/50'
          }`}>
            <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3.5 rounded-2xl border shadow-lg ${
                    waData?.status === 'active'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/20'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-cyan-500/20'
                  }`}>
                    <Flame className={`w-8 h-8 ${waData?.status === 'active' ? 'animate-pulse text-amber-400 fill-amber-400' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-3xl font-black text-white tracking-tight">
                        WINTER ARC {selectedYear}
                      </h2>
                      {waData?.status === 'active' && (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          ACTIVE SEASON
                        </span>
                      )}
                      {waData?.status === 'upcoming' && (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          UPCOMING
                        </span>
                      )}
                      {waData?.status === 'completed' && (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-700/60 text-slate-300 border border-slate-600">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      Oct 1 – Dec 31 ({waData?.total_days || 92} Days Protocol)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  {waData?.status === 'active' &&
                    "🔥 The annual Winter Arc is currently LIVE! 92 consecutive days to execute your highest priority habits and lock in total discipline."}
                  {waData?.status === 'upcoming' &&
                    `⏳ Winter Arc ${selectedYear} is off-season. It automatically triggers on October 1st, ${selectedYear}. Use this period to prime your habits and maintain high baseline consistency.`}
                  {waData?.status === 'completed' &&
                    `🏆 Winter Arc ${selectedYear} is complete. Here is your permanent performance record and statistical summary.`}
                </p>
              </div>

              {/* Status & Countdown Pill */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 text-center min-w-[210px] shadow-xl">
                {waData?.status === 'active' && (
                  <>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">DAYS REMAINING</div>
                    <div className="text-4xl font-black text-white mt-1">{waData?.days_remaining}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Day {waData?.days_elapsed} of {waData?.total_days}</div>
                  </>
                )}
                {waData?.status === 'upcoming' && (
                  <>
                    <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center justify-center gap-1">
                      <Timer className="w-3.5 h-3.5" />
                      STARTS IN
                    </div>
                    <div className="text-4xl font-black text-cyan-400 mt-1">{waData?.days_until_start}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Days Until Oct 1, {selectedYear}</div>
                  </>
                )}
                {waData?.status === 'completed' && (
                  <>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STATUS</div>
                    <div className="text-3xl font-black text-emerald-400 mt-1">FINISHED</div>
                    <div className="text-[11px] text-slate-400 mt-1">All {waData?.total_days} Days Concluded</div>
                  </>
                )}
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
              <div className="text-2xl font-black text-white">
                {waData?.days_elapsed} <span className="text-xs text-slate-400 font-normal">/ {waData?.total_days} days</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PROGRESSION</span>
              <div className="text-2xl font-black text-cyan-400">{waData?.overall_progress_pct}%</div>
            </div>
          </div>

          {/* Objective Summary Panel */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                WINTER ARC {selectedYear} PERFORMANCE METRICS
              </h3>
              <span className="text-xs text-slate-400 font-medium">Standardized Habit Evaluation</span>
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
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CONSISTENCY (≥80%)</span>
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
        </>
      )}
    </div>
  );
};

export default WinterArcPage;

