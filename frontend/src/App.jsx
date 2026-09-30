import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TodayPage from './pages/TodayPage';
import HabitsPage from './pages/HabitsPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import WinterArcPage from './pages/WinterArcPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/winter-arc" element={<WinterArcPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
