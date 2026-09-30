import React, { useState, useEffect } from 'react';
import { getMonthlyAnalytics, getCalendarHeatmap, getGoals, getCategories } from '../services/api';
import HeatmapGrid from '../components/HeatmapGrid';
import { CalendarDays, Calendar as CalendarIcon, Filter, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CalendarPage = () => {
  const [activeView, setActiveView] = useState('heatmap'); // 'heatmap' or 'yearly'
  const [monthlyData, setMonthlyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const [mRes, hRes, gRes, cRes] = await Promise.all([
        getMonthlyAnalytics(year),
        getCalendarHeatmap({
          year,
          goal_id: selectedGoal || undefined,
          category_id: selectedCategory || undefined
        }),
        getGoals(),
        getCategories()
      ]);

      setMonthlyData(mRes);
      setHeatmapData(hRes);
      setGoals(gRes);
      setCategories(cRes);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [selectedGoal, selectedCategory]);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-cyan-400" />
            CALENDAR & ACTIVITY HEATMAP
          </h2>
          <p className="text-xs text-slate-400 mt-1">Visualize consistent habits across months and days</p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'heatmap' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Heatmap
          </button>

          <button
            onClick={() => setActiveView('yearly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'yearly' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly 12-Month View
          </button>
        </div>
      </div>

      {activeView === 'heatmap' ? (
        <div className="space-y-6">
          {/* Heatmap Filters */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-cyan-400" />
              Heatmap Scope Filter
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedGoal('');
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Goal Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Habit / Goal:</span>
                <select
                  value={selectedGoal}
                  onChange={(e) => {
                    setSelectedGoal(e.target.value);
                    setSelectedCategory('');
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="">All Habits & Goals</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GitHub-style Heatmap Grid */}
          <HeatmapGrid 
            heatmapData={heatmapData} 
            onSelectDay={(dayStr) => {
              const matched = heatmapData.find(d => d.date === dayStr);
              setSelectedDayDetail(matched || { date: dayStr, planned: 0, actual: 0, achievement_pct: 0 });
            }}
          />

          {/* Selected Day Details Popup Card */}
          {selectedDayDetail && (
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-cyan-400" />
                  Detailed Record for {selectedDayDetail.date}
                </h3>
                <button 
                  onClick={() => setSelectedDayDetail(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Planned</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">{selectedDayDetail.planned}</div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Actual</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{selectedDayDetail.actual}</div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Achievement</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">{selectedDayDetail.achievement_pct}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full-Year Dashboard (12-Month Breakdown) */
        <div className="space-y-8">
          {/* Yearly Trendline */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">YEARLY ACHIEVEMENT TRENDLINE</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month_name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="achievement_pct" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white">{m.month_name}</h4>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {m.achievement_pct}% Achieved
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Planned:</span>
                    <span className="font-semibold text-slate-200">{m.planned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual:</span>
                    <span className="font-semibold text-emerald-400">{m.actual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed Goals:</span>
                    <span className="font-semibold text-emerald-400">{m.completed_goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missed Goals:</span>
                    <span className="font-semibold text-rose-400">{m.missed_goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Daily Completion:</span>
                    <span className="font-semibold text-cyan-400">{m.avg_daily_completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
