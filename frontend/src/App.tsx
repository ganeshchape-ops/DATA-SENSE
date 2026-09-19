import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatasetProvider } from './context/DatasetContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { SplashScreen } from './components/common/SplashScreen';
import { SearchModal } from './components/common/SearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OtpVerificationPage } from './pages/OtpVerificationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ProfilerPage } from './pages/ProfilerPage';
import { CleaningPage } from './pages/CleaningPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { AIChatPage } from './pages/AIChatPage';
import { MLStudioPage } from './pages/MLStudioPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { AnomalyPage } from './pages/AnomalyPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminPage } from './pages/AdminPage';

// Protected SaaS Dashboard Layout Wrapper
const DashboardLayout: React.FC<{
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}> = ({
  onOpenSearch,
  onOpenNotifications,
  unreadCount,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Authenticating AI DataSense session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 relative selection:bg-indigo-600 selection:text-white">
      <Navbar
        onOpenSearch={onOpenSearch}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={unreadCount}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex relative z-10">
        {/* Sidebar Navigation */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Application View Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'AutoML Model Benchmarked',
      message: 'Random Forest trained with 94.2% test accuracy on your active dataset.',
      time: '3m ago',
      type: 'prediction' as const,
      unread: true,
      link: '/ml',
    },
    {
      id: '2',
      title: 'Dataset Profile Synthesized',
      message: 'Multi-signal analysis detected academic performance parameters.',
      time: '12m ago',
      type: 'analysis' as const,
      unread: true,
      link: '/dashboard',
    },
    {
      id: '3',
      title: 'Executive PDF Generated',
      message: 'Your publication-grade analytics report is ready for download.',
      time: '45m ago',
      type: 'report' as const,
      unread: false,
      link: '/reports',
    },
  ]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <DatasetProvider>
        {/* Global Modals */}
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
        <NotificationDrawer
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
          onClearAll={() => setNotifications([])}
        />

        <Routes>
          {/* Public & Authentication Flow */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Unified Application Layout */}
          <Route
            element={
              <DashboardLayout
                onOpenSearch={() => setSearchOpen(true)}
                onOpenNotifications={() => setNotifOpen(true)}
                unreadCount={unreadCount}
              />
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/profiler" element={<ProfilerPage />} />
            <Route path="/cleaning" element={<CleaningPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/correlation" element={<CorrelationPage />} />
            <Route path="/insights" element={<AIInsightsPage />} />
            <Route path="/chat" element={<AIChatPage />} />
            <Route path="/ml" element={<MLStudioPage />} />
            <Route path="/forecasting" element={<ForecastingPage />} />
            <Route path="/anomaly" element={<AnomalyPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Sub-route aliases */}
            <Route path="/dashboard/upload" element={<UploadPage />} />
            <Route path="/dashboard/profile" element={<ProfilerPage />} />
            <Route path="/dashboard/cleaning" element={<CleaningPage />} />
            <Route path="/dashboard/explorer" element={<ExplorerPage />} />
            <Route path="/dashboard/visualize" element={<VisualizationPage />} />
            <Route path="/dashboard/statistics" element={<StatisticsPage />} />
            <Route path="/dashboard/correlation" element={<CorrelationPage />} />
            <Route path="/dashboard/ai-insights" element={<AIInsightsPage />} />
            <Route path="/dashboard/chat" element={<AIChatPage />} />
            <Route path="/dashboard/ml-studio" element={<MLStudioPage />} />
            <Route path="/dashboard/forecasting" element={<ForecastingPage />} />
            <Route path="/dashboard/anomaly" element={<AnomalyPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/history" element={<HistoryPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DatasetProvider>
    </AuthProvider>
  );
};

export default App;
