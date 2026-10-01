import React, { useState, useEffect } from 'react';
import { getGoals, getHabits, createGoal, updateGoal, deleteGoal, getCategories } from '../services/api';
import GoalMilestoneModal from '../components/GoalMilestoneModal';
import { 
  Trophy, 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Flag,
  ChevronRight,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, habitsRes, catRes] = await Promise.all([
        getGoals({ type: 'goal' }),
        getHabits(),
        getCategories()
      ]);
      setGoals(goalsRes);
      setHabits(habitsRes);
      setCategories(catRes);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, formData);
      } else {
        await createGoal(formData);
      }
      await loadData();
      setEditingGoal(null);
    } catch (err) {
      console.error('Failed to save goal:', err);
      alert('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone goal?')) {
      try {
        await deleteGoal(id);
        await loadData();
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  // Quick increment progress for milestone goal
  const handleQuickIncrement = async (goal, delta) => {
    try {
      const nextVal = Math.max(0, (goal.current_value || 0) + delta);
      const isAchieved = nextVal >= goal.target_value;
      await updateGoal(goal.id, {
        current_value: nextVal,
        status: isAchieved ? 'achieved' : goal.status
      });
      await loadData();
    } catch (err) {
      console.error('Failed to increment progress:', err);
    }
  };

  // Toggle achieved status
  const handleToggleAchieved = async (goal) => {
    try {
      const nextStatus = goal.status === 'achieved' ? 'in_progress' : 'achieved';
      await updateGoal(goal.id, { status: nextStatus });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Map habits for fast lookup
  const habitMap = habits.reduce((acc, h) => {
    acc[String(h.id)] = h;
    return acc;
  }, {});

  const filteredGoals = goals.filter(g => {
    if (selectedCategory !== 'all' && g.category_id !== parseInt(selectedCategory)) return false;
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    return true;
  });

  // Calculate days left to deadline
  const getDaysLeft = (endDateStr) => {
    if (!endDateStr) return null;
    const target = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8 select-none">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 space-y-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Outcome Milestones & Results
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              MILESTONE GOALS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Goals are the tangible results and milestones you achieve through daily consistency and habit practice.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Set New Milestone Goal
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({goals.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'in_progress' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress ({goals.filter(g => g.status === 'in_progress' || !g.status).length})
            </button>
            <button
              onClick={() => setStatusFilter('achieved')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'achieved' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Achieved ({goals.filter(g => g.status === 'achieved').length})
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800/80 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Milestone Goals Set Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create targets like <em>"Crack SDE-1 Placement"</em>, <em>"Solve 300 LeetCode Problems"</em>, or <em>"Reach 75kg"</em>. Link your daily habits to power them!
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Create Your First Milestone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const currentVal = goal.current_value || 0;
            const targetVal = goal.target_value || 1;
            const pct = Math.min(Math.round((currentVal / targetVal) * 100), 100);
            const isAchieved = goal.status === 'achieved' || pct >= 100;
            const daysLeft = getDaysLeft(goal.end_date);

            const linkedIds = goal.linked_habit_ids 
              ? String(goal.linked_habit_ids).split(',').map(s => s.trim()).filter(Boolean)
              : [];

            return (
              <div 
                key={goal.id}
                className={`glass-card rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl ${
                  isAchieved 
                    ? 'border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/20' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
                }`}
              >
                {/* Card Header */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {goal.category && (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${goal.category.color}20`,
                            color: goal.category.color,
                            border: `1px solid ${goal.category.color}40`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: goal.category.color }} />
                          {goal.category.name}
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {goal.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Milestone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description quote if present */}
                  {goal.description && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                      "{goal.description}"
                    </p>
                  )}

                  {/* Target Deadline Tag */}
                  {goal.end_date && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400">Deadline:</span>
                      <span className="text-slate-200 font-bold">{goal.end_date}</span>
                      {daysLeft !== null && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          daysLeft > 0 
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Due today/past'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Milestone Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span className="text-slate-400">Progress:</span>
                      <span className="text-white font-extrabold text-sm">
                        {currentVal} <span className="text-xs text-slate-400 font-normal">/ {targetVal} {goal.unit}</span>
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAchieved
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/40'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/30'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0</span>
                      <span className={pct >= 50 ? 'text-amber-400 font-bold' : ''}>50%</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                  </div>

                  {/* Linked Habits */}
                  {linkedIds.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <LinkIcon className="w-3 h-3 text-cyan-400" />
                        <span>Powered by Daily Habits:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedIds.map(hId => {
                          const habit = habitMap[hId];
                          if (!habit) return null;
                          return (
                            <span 
                              key={hId}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium truncate max-w-[140px]"
                            >
                              ⚡ {habit.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                  {/* Quick Increment Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickIncrement(goal, 1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                      title="Add 1 to progress"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickIncrement(goal, 5)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                      title="Add 5 to progress"
                    >
                      +5
                    </button>
                  </div>

                  {/* Mark Achieved Button */}
                  <button
                    onClick={() => handleToggleAchieved(goal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isAchieved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isAchieved ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{isAchieved ? 'Achieved 🏆' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Goal Milestone Modal */}
      <GoalMilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSave}
        initialData={editingGoal}
        categories={categories}
        habits={habits}
      />
    </div>
  );
};

export default GoalsPage;
