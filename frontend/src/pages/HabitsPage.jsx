import React, { useState, useEffect } from 'react';
import { getHabits, createHabit, updateGoal, deleteGoal, getCategories } from '../services/api';
import GoalModal from '../components/GoalModal';
import { Repeat, Plus, Edit2, Trash2, CheckCircle2, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  const loadHabitsData = async () => {
    try {
      setLoading(true);
      const [habitsRes, catRes] = await Promise.all([
        getHabits(),
        getCategories()
      ]);
      setHabits(habitsRes);
      setCategories(catRes);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabitsData();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingHabit) {
        await updateGoal(editingHabit.id, formData);
      } else {
        await createHabit(formData);
      }
      await loadHabitsData();
      setEditingHabit(null);
    } catch (err) {
      console.error('Failed to save habit:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit? Historical logs will also be removed.')) {
      try {
        await deleteGoal(id);
        await loadHabitsData();
      } catch (err) {
        console.error('Failed to delete habit:', err);
      }
    }
  };

  const filteredHabits = habits.filter(h => {
    if (frequencyFilter !== 'all' && h.frequency !== frequencyFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Repeat className="w-7 h-7 text-cyan-400" />
            HABIT MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-1">Build daily consistency and optimize routines</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Frequency Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'daily', 'weekly', 'custom'].map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequencyFilter(freq)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  frequencyFilter === freq
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit) => {
          const categoryName = habit.category ? habit.category.name : 'General';
          const categoryColor = habit.category ? habit.category.color : '#3B82F6';
          const isLowerBetter = habit.goal_direction === 'lower_is_better';

          return (
            <div 
              key={habit.id}
              className="glass-card glass-card-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {categoryName}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mt-3">{habit.name}</h3>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Target Amount:</span>
                    <span className="font-bold text-cyan-400">{habit.target_value} {habit.unit}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Frequency:</span>
                    <span className="font-semibold text-slate-200 capitalize">{habit.frequency}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Direction:</span>
                    <span className={`font-semibold flex items-center gap-1 ${isLowerBetter ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isLowerBetter ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {isLowerBetter ? 'Lower is Better' : 'Higher is Better'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status:</span>
                    <span className={`font-semibold ${habit.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {habit.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingHabit}
        categories={categories}
      />
    </div>
  );
};

export default HabitsPage;
