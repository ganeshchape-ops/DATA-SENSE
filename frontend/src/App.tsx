import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatasetProvider } from './context/DatasetContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Menu, X } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ProfilerPage } from './pages/ProfilerPage';
import { CleaningPage } from './pages/CleaningPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { MLStudioPage } from './pages/MLStudioPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { AnomalyPage } from './pages/AnomalyPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Dashboard Layout Wrapper
const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-300"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{mobileSidebarOpen ? "Close Menu" : "Analytics Navigation"}</span>
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DatasetProvider>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="profile" element={<ProfilerPage />} />
            <Route path="cleaning" element={<CleaningPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="visualize" element={<VisualizationPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="correlation" element={<CorrelationPage />} />
            <Route path="ai-insights" element={<AIInsightsPage />} />
            <Route path="ml-studio" element={<MLStudioPage />} />
            <Route path="forecasting" element={<ForecastingPage />} />
            <Route path="anomaly" element={<AnomalyPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DatasetProvider>
    </AuthProvider>
  );
};

export default App;
