import React, { useState, useEffect } from 'react';
import { getDashboard, getPlannedVsActual, getLogs, saveLogsBatch, getCategories, getPeriodComparison } from '../services/api';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import ProgressVisualizationCard from '../components/ProgressVisualizationCard';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  CalendarCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pvData, setPvData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [timeFrame, setTimeFrame] = useState('month');
  const [loading, setLoading] = useState(true);
  const [savingLogs, setSavingLogs] = useState(false);
  const [logInputs, setLogInputs] = useState({});

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const [dashStats, pvRes, todayLogs, compRes] = await Promise.all([
        getDashboard(),
        getPlannedVsActual({ time_frame: timeFrame }),
        getLogs({ log_date: todayStr }),
        getPeriodComparison({ period_type: 'month' })
      ]);

      setStats(dashStats);
      setPvData(pvRes);
      setLogs(todayLogs);
      setComparison(compRes);

      // Pre-fill log inputs
      const initialInputs = {};
      todayLogs.forEach(l => {
        initialInputs[l.goal_id] = {
          actual_value: l.actual_value,
          notes: l.notes || '',
          status: l.status
        };
      });
      setLogInputs(initialInputs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeFrame]);

  const handleInputChange = (goalId, field, value) => {
    setLogInputs(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleQuickSave = async () => {
    try {
      setSavingLogs(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const batchItems = Object.entries(logInputs).map(([goalId, data]) => ({
        goal_id: parseInt(goalId),
        actual_value: parseFloat(data.actual_value) || 0,
        notes: data.notes,
        status: data.status
      }));

      await saveLogsBatch({
        log_date: todayStr,
        logs: batchItems
      });

      await loadDashboardData();
    } catch (err) {
      console.error('Failed to save logs:', err);
    } finally {
      setSavingLogs(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Winter Arc Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen flex flex-col">
      <Header stats={stats} />

      <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* 8 Main Metric Cards */}
        <MetricCards stats={stats} />

        {/* Large Progress Visualization Card */}
        <ProgressVisualizationCard data={stats?.planned_vs_actual} />

        {/* 2-Column Section: Planned vs Actual Chart & Quick Today Logging */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planned vs Actual Breakdown Chart (2 Cols) */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">PLANNED VS ACTUAL GOALS</h3>
                <p className="text-xs text-slate-400">Compare target values against actual achievements</p>
              </div>

              {/* Timeframe Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {['day', 'week', 'month', 'quarter', 'year'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                      timeFrame === tf
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full">
              {pvData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                    />
                    <Bar dataKey="target" fill="#38BDF8" radius={[6, 6, 0, 0]} name="Planned Target" />
                    <Bar dataKey="actual" fill="#10B981" radius={[6, 6, 0, 0]} name="Actual Achieved" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No goal data found for this timeframe.
                </div>
              )}
            </div>

            {/* Goal Differences List */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
              {pvData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-900/40">
                  <span className="font-semibold text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">Target: {item.target} | Actual: {item.actual}</span>
                    <span className={`font-bold ${item.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.difference >= 0 ? `+${item.difference}` : item.difference} ({item.achievement_pct}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Quick Log & Comparison Widget (1 Col) */}
          <div className="space-y-6">
            {/* Month-over-Month Quick Comparison */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">MONTHLY COMPARISON</h4>
                <span className="text-[10px] text-cyan-400 font-semibold">{comparison?.period_previous_name} vs {comparison?.period_current_name}</span>
              </div>

              <div className="space-y-3">
                {comparison?.metrics?.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">{m.metric_name}</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {m.current_value} {m.unit} <span className="text-[11px] text-slate-500 font-normal">(vs {m.previous_value})</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                      m.change_pct >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {m.change_pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {m.change_pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Log Save Widget */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-cyan-400" />
                  TODAY'S LOG QUICK SAVE
                </h4>
                <button
                  onClick={handleQuickSave}
                  disabled={savingLogs}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingLogs ? 'Saving...' : 'Save Logs'}
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {logs.map((log) => {
                  const goalName = log.goal?.name || 'Goal';
                  const unit = log.goal?.unit || '';
                  const target = log.target_value;
                  const currentInput = logInputs[log.goal_id] || { actual_value: log.actual_value, notes: '' };

                  return (
                    <div key={log.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{goalName}</span>
                        <span className="text-slate-400">Target: {target} {unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={currentInput.actual_value}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newStatus = val <= 0 ? 'missed' : (val >= target ? 'complete' : 'partial');
                            handleInputChange(log.goal_id, 'actual_value', e.target.value);
                            handleInputChange(log.goal_id, 'status', newStatus);
                          }}
                          className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs text-center font-bold focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-xs text-slate-400">{unit}</span>

                        <div className="flex gap-1 ml-auto">
                          {['complete', 'partial', 'missed'].map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                let newActual = currentInput.actual_value;
                                if (st === 'missed') {
                                  newActual = 0;
                                } else if (st === 'complete') {
                                  newActual = target;
                                } else if (st === 'partial') {
                                  newActual = Math.round((target / 2) * 10) / 10;
                                }
                                handleInputChange(log.goal_id, 'status', st);
                                handleInputChange(log.goal_id, 'actual_value', newActual);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                                currentInput.status === st
                                  ? st === 'complete' ? 'bg-emerald-500 text-slate-950' : st === 'partial' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
