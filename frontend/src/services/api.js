import axios from 'axios';

// Base API configuration (Proxied by Vite or relative endpoint for desktop PyWebView)
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getGoals = async (params = {}) => {
  const response = await api.get('/goals', { params });
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await api.post('/goals', goalData);
  return response.data;
};

export const updateGoal = async (id, goalData) => {
  const response = await api.put(`/goals/${id}`, goalData);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};

export const getHabits = async (params = {}) => {
  const response = await api.get('/habits', { params });
  return response.data;
};

export const createHabit = async (habitData) => {
  const response = await api.post('/habits', habitData);
  return response.data;
};

export const getLogs = async (params = {}) => {
  const response = await api.get('/logs', { params });
  return response.data;
};

export const saveLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data;
};

export const saveLogsBatch = async (batchData) => {
  const response = await api.post('/logs/batch', batchData);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const getPlannedVsActual = async (params = {}) => {
  const response = await api.get('/analytics/planned-vs-actual', { params });
  return response.data;
};

export const getMonthlyAnalytics = async (year) => {
  const response = await api.get('/analytics/monthly', { params: { year } });
  return response.data;
};

export const getYearlyOverview = async (year) => {
  const response = await api.get('/analytics/yearly', { params: { year } });
  return response.data;
};

export const getCategoryPerformance = async () => {
  const response = await api.get('/analytics/categories');
  return response.data;
};

export const getCalendarHeatmap = async (params = {}) => {
  const response = await api.get('/analytics/heatmap', { params });
  return response.data;
};

export const getPeriodComparison = async (params = {}) => {
  const response = await api.get('/analytics/comparison', { params });
  return response.data;
};

export const getWinterArc = async () => {
  const response = await api.get('/winter-arc');
  return response.data;
};

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSetting = async (key, value) => {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data;
};

export const importJsonData = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/data/import/json', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
