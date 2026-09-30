import React, { useState, useEffect } from 'react';
import { 
  getPlannedVsActual, 
  getMonthlyAnalytics, 
  getCategoryPerformance, 
  getPeriodComparison 
} from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  PieChart as PieIcon, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from 'recharts';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'comparison'
  const [timeFrame, setTimeFrame] = useState('month');
  const [pvData, setPvData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [pvRes, mRes, cRes, compRes] = await Promise.all([
        getPlannedVsActual({ time_frame: timeFrame }),
        getMonthlyAnalytics(new Date().getFullYear()),
        getCategoryPerformance(),
        getPeriodComparison({ period_type: 'month' })
      ]);

      setPvData(pvRes);
      setMonthlyData(mRes);
      setCatData(cRes);
      setCompData(compRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeFrame]);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            ANALYTICS & PERFORMANCE INSIGHTS
          </h2>
          <p className="text-xs text-slate-400 mt-1">Objective data visualizations and trend analysis</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'charts' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Charts & Trends
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'comparison' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Period Comparison
          </button>
        </div>
      </div>

      {activeTab === 'charts' ? (
        <div className="space-y-8">
          {/* Timeframe Filter Bar */}
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Scope</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['day', 'week', 'month', 'quarter', 'year'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    timeFrame === tf
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Planned vs Actual Bar Chart & Monthly Achievement Line Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Planned vs Actual Bar Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                1. Planned vs Actual Bar Chart
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pvData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="target" fill="#38BDF8" name="Planned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Monthly Achievement Line Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                2. Monthly Achievement Trend Line
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="achievement_pct" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 5 }} name="Achievement %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Category Performance Radar/Pie & Habit Consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 3: Category Performance */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-purple-400" />
                3. Category Performance Breakdown
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} />
                    <YAxis dataKey="category_name" type="category" stroke="#64748B" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="avg_achievement_pct" radius={[0, 6, 6, 0]}>
                      {catData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Goal & Daily Completion Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                4. Monthly Goals Completed vs Missed
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="completed_goals" fill="#10B981" name="Completed Goals" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="missed_goals" fill="#F43F5E" name="Missed Goals" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Period Comparison Tab */
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">PERIOD COMPARISON ENGINE</h3>
            <span className="text-xs text-cyan-400 font-semibold">{compData?.period_previous_name} vs {compData?.period_current_name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {compData?.metrics?.map((m, idx) => (
              <div key={idx} className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.metric_name}</span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-white">{m.current_value} <span className="text-xs text-slate-400">{m.unit}</span></div>
                    <div className="text-xs text-slate-500 mt-1">Previous: {m.previous_value} {m.unit}</div>
                  </div>
                  <div className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-1 ${
                    m.change_pct >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {m.change_pct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {m.change_pct}%
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

export default AnalyticsPage;
