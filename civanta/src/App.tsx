import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GrievanceProvider } from './context/GrievanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DemoLoginModal } from './components/common/DemoLoginModal';
import { SimulationControlBar } from './components/common/SimulationControlBar';
import { ChatbotWidget } from './components/common/ChatbotWidget';
import { CommandPalette } from './components/common/CommandPalette';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { EscalationManagementPage } from './pages/EscalationManagementPage';
import { ActionHistoryPage } from './pages/ActionHistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/UserManagementPage';
import { SLAConfigPage } from './pages/SLAConfigPage';
import { ProfilePage } from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';
import { Shield, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('CIV-2026-BLR-0101');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync default dashboard when role changes
  const handleRoleChanged = (role: string) => {
    if (role === 'citizen') setCurrentPage('citizen-dash');
    else if (role === 'junior_officer') setCurrentPage('officer-dash');
    else if (role === 'senior_supervisor') setCurrentPage('supervisor-dash');
    else if (role === 'admin') setCurrentPage('admin-dash');
  };

  const handleSelectComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentPage('complaint-detail');
  };

  const handleNavigate = (page: string) => {
    if (page === 'assigned-cases') {
      setCurrentPage('officer-dash');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current view
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
          />
        );
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'citizen-dash':
        return (
          <CitizenDashboard
            onNavigate={handleNavigate}
            onSelectComplaint={handleSelectComplaint}
          />
        );
      case 'new-complaint':
        return (
          <NewComplaintPage
            onNavigate={handleNavigate}
            onSelectComplaint={handleSelectComplaint}
          />
        );
      case 'track-complaint':
        return (
          <TrackComplaintPage
            onSelectComplaint={handleSelectComplaint}
            preselectedId={selectedComplaintId}
          />
        );
      case 'complaint-detail':
        return (
          <ComplaintDetailPage
            complaintId={selectedComplaintId}
            onBack={() => {
              if (currentRole === 'junior_officer') setCurrentPage('officer-dash');
              else if (currentRole === 'senior_supervisor') setCurrentPage('supervisor-dash');
              else if (currentRole === 'admin') setCurrentPage('admin-dash');
              else setCurrentPage('citizen-dash');
            }}
          />
        );
      case 'officer-dash':
        return (
          <OfficerDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'supervisor-dash':
        return (
          <SupervisorDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleNavigate}
          />
        );
      case 'escalations':
        return (
          <EscalationManagementPage onSelectComplaint={handleSelectComplaint} />
        );
      case 'audit-trail':
        return (
          <ActionHistoryPage onSelectComplaint={handleSelectComplaint} />
        );
      case 'notifications':
        return (
          <NotificationsPage onSelectComplaint={handleSelectComplaint} />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'admin-dash':
        return (
          <AdminDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleNavigate}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
          />
        );
      case 'users-management':
        return <UserManagementPage />;
      case 'sla-settings':
        return <SLAConfigPage />;
      case 'profile':
        return (
          <ProfilePage
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
          />
        );
    }
  };

  const isPublicLanding = currentPage === 'landing' || currentPage === 'login' || currentPage === 'register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onSelectComplaint={handleSelectComplaint}
        onNavigate={handleNavigate}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex w-full">
        {/* Role-Aware Collapsible Sidebar for Authenticated Dashboards */}
        {!isPublicLanding && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all`}
        >
          {renderPage()}
        </main>
      </div>

      {/* Floating Simulation Control Bar (Bottom-Right) */}
      <SimulationControlBar onRoleModalOpen={() => setIsRoleModalOpen(true)} />

      {/* Floating CIVANTA Sahāyaka Chatbot Widget (Bottom-Left) */}
      <ChatbotWidget />

      {/* Demo Role Switcher Modal */}
      <DemoLoginModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onRoleSelected={handleRoleChanged}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectComplaint={handleSelectComplaint}
        onNavigate={handleNavigate}
      />

      {/* Official Government Disclaimer Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-bold">
              <Shield size={16} className="text-amber-400" />
              <span>{t('landingHeroTitle')}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t('officialFooterDesc')}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 max-w-md">
            <p>
              {t('officialFooterDisclaimer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <GrievanceProvider>
            <AppContent />
          </GrievanceProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
