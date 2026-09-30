import React, { useState, useEffect } from 'react';
import { getSettings, updateSetting, getCategories, createCategory, deleteCategory, importJsonData } from '../services/api';
import CategoryModal from '../components/CategoryModal';
import { Settings, ShieldCheck, Download, Upload, Database, FolderPlus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        getSettings(),
        getCategories()
      ]);
      setSettings(sRes);
      setCategories(cRes);

      if (sRes.winter_arc_start) setStartDate(sRes.winter_arc_start);
      if (sRes.winter_arc_end) setEndDate(sRes.winter_arc_end);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveDates = async () => {
    try {
      await updateSetting('winter_arc_start', startDate);
      await updateSetting('winter_arc_end', endDate);
      setImportStatus('Winter Arc dates updated successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      console.error('Failed to update dates:', err);
    }
  };

  const handleCreateCategory = async (catData) => {
    try {
      await createCategory(catData);
      await loadSettingsData();
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        await loadSettingsData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete category');
      }
    }
  };

  const handleExportJson = () => {
    window.open('/api/data/export/json', '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/data/export/csv', '_blank');
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImportStatus('Importing data...');
      const res = await importJsonData(file);
      setImportStatus(res.message);
      await loadSettingsData();
    } catch (err) {
      setImportStatus(err.response?.data?.detail || 'Failed to import data');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-400" />
            SETTINGS & DATA SAFETY
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure app parameters and manage offline database backups</p>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {importStatus}
        </div>
      )}

      {/* 1. Winter Arc Date Range Configuration */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-wide">WINTER ARC DATES CONFIGURATION</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Winter Arc Start Date
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Winter Arc End Date
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleSaveDates}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          Save Winter Arc Dates
        </button>
      </div>

      {/* 2. Custom Categories Manager */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">CATEGORIES MANAGEMENT</h3>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold flex items-center gap-2 border border-slate-700"
          >
            <FolderPlus className="w-4 h-4" />
            Add Custom Category
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div 
              key={c.id} 
              className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-xs font-bold text-white">{c.name}</span>
              </div>
              {!c.is_default && (
                <button 
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Data Safety & Export/Import */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          DATA SAFETY & LOCAL BACKUPS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Export JSON */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              Export Data (JSON)
            </h4>
            <p className="text-xs text-slate-400">Export complete database structure including goals, logs, categories, and settings.</p>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
            >
              Export JSON
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Export Logs (CSV)
            </h4>
            <p className="text-xs text-slate-400">Export goal logs into a spreadsheet-compatible CSV file for external analysis.</p>
            <button
              onClick={handleExportCsv}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
            >
              Export CSV
            </button>
          </div>

          {/* Import Data */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              Import Data (JSON)
            </h4>
            <p className="text-xs text-slate-400">Restore or import goals and performance records from a backup JSON file.</p>
            <label className="block w-full text-center py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20">
              Select JSON File
              <input 
                type="file" 
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleCreateCategory}
      />
    </div>
  );
};

export default SettingsPage;
