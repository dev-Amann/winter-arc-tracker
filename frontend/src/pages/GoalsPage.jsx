import React, { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, getCategories } from '../services/api';
import GoalModal from '../components/GoalModal';
import { Target, Plus, Edit2, Trash2, Folder, Layers } from 'lucide-react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, catRes] = await Promise.all([
        getGoals(),
        getCategories()
      ]);
      setGoals(goalsRes);
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
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal and its associated logs?')) {
      try {
        await deleteGoal(id);
        await loadData();
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  const filteredGoals = goals.filter(g => {
    if (selectedCategory !== 'all' && g.category_id !== parseInt(selectedCategory)) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-cyan-400" />
            GOAL TRACKER
          </h2>
          <p className="text-xs text-slate-400 mt-1">Define long-term target metrics across categories</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>
      </div>

      {/* Goals List Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Goal Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">Frequency</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGoals.map((g) => {
                const categoryName = g.category ? g.category.name : 'Uncategorized';
                const categoryColor = g.category ? g.category.color : '#3B82F6';

                return (
                  <tr key={g.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white text-sm">
                      {g.name}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: categoryColor }}
                      >
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-cyan-400">
                      {g.target_value} {g.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        g.goal_direction === 'lower_is_better' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {g.goal_direction === 'lower_is_better' ? 'Lower is Better' : 'Higher is Better'}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-300">
                      {g.frequency}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingGoal(g);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingGoal}
        categories={categories}
      />
    </div>
  );
};

export default GoalsPage;
