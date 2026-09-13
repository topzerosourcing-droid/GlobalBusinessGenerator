import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardLayout, DashboardTab } from './components/DashboardLayout';
import { AuthModal } from './components/AuthModal';
import { PublicPlanView } from './components/PublicPlanView';
import { BusinessIdeasDirectory } from './components/BusinessIdeasDirectory';
import { CuratedBusinessIdea } from './types';
import { captureReferralFromUrl, getActiveReferralCode } from './lib/referralService';
import { Analytics } from './lib/analytics';

function MainApp() {
  const { user, profile, loading } = useAuth();

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'public_plan' | 'ideas_directory'>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('create');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedIdeaForCreation, setSelectedIdeaForCreation] = useState<CuratedBusinessIdea | null>(null);
  const [publicPlanSlug, setPublicPlanSlug] = useState<string | null>(null);
  const [focusedIdeaId, setFocusedIdeaId] = useState<string | undefined>(undefined);
  const [focusedCountrySlug, setFocusedCountrySlug] = useState<string | undefined>(undefined);

  // 1. Capture referral code on URL load & handle hash routing
  useEffect(() => {
    // Capture referral if present in ?ref= or #ref=
    const detectedRef = captureReferralFromUrl();
    if (detectedRef) {
      Analytics.referralClick(detectedRef, window.location.pathname);
    }

    // Check hash for public plan or idea navigation
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#plan=')) {
        const slug = hash.replace('#plan=', '').split('&')[0];
        if (slug) {
          setPublicPlanSlug(slug);
          setCurrentView('public_plan');
        }
      } else if (hash.startsWith('#idea=')) {
        const ideaId = hash.replace('#idea=', '').split('&')[0];
        setFocusedIdeaId(ideaId);
        setFocusedCountrySlug(undefined);
        setCurrentView('ideas_directory');
      } else if (hash.startsWith('#country=')) {
        const countrySlug = hash.replace('#country=', '').split('&')[0];
        setFocusedCountrySlug(countrySlug);
        setFocusedIdeaId(undefined);
        setCurrentView('ideas_directory');
      } else if (hash === '#ideas') {
        setFocusedIdeaId(undefined);
        setFocusedCountrySlug(undefined);
        setCurrentView('ideas_directory');
      } else if (hash === '#referrals') {
        setCurrentView('dashboard');
        setDashboardTab('referrals');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track landing page view
  useEffect(() => {
    if (currentView === 'landing') {
      Analytics.landingPageVisit();
    }
  }, [currentView]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigateToCreatePlan = () => {
    Analytics.businessPlanStart('landing_cta');
    if (user) {
      setCurrentView('dashboard');
      setDashboardTab('create');
    } else {
      handleOpenAuth('register');
    }
  };

  const handleNavigateToIdeas = () => {
    window.location.hash = '#ideas';
    setFocusedIdeaId(undefined);
    setFocusedCountrySlug(undefined);
    setCurrentView('ideas_directory');
  };

  const handleSelectIdea = (idea: CuratedBusinessIdea) => {
    setSelectedIdeaForCreation(idea);
    Analytics.businessPlanStart(idea.id);
    if (user) {
      setCurrentView('dashboard');
      setDashboardTab('create');
    } else {
      handleOpenAuth('register');
    }
  };

  const handleOpenPublicPlan = (slugOrId: string) => {
    setPublicPlanSlug(slugOrId);
    window.location.hash = `plan=${slugOrId}`;
    setCurrentView('public_plan');
  };

  const handleClosePublicPlan = () => {
    window.location.hash = '';
    setPublicPlanSlug(null);
    setCurrentView(user ? 'dashboard' : 'landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        currentView={currentView === 'public_plan' ? 'landing' : currentView}
        setCurrentView={(view) => {
          if (view === 'dashboard' && !user) {
            handleOpenAuth('login');
            return;
          }
          if (publicPlanSlug) {
            window.location.hash = '';
            setPublicPlanSlug(null);
          }
          if (view === 'landing') {
            window.location.hash = '';
          }
          setCurrentView(view);
        }}
        dashboardTab={dashboardTab}
        setDashboardTab={(tab) => setDashboardTab(tab as DashboardTab)}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'public_plan' && publicPlanSlug ? (
          <PublicPlanView
            slug={publicPlanSlug}
            onBack={handleClosePublicPlan}
            onCreateOwnPlan={() => {
              handleClosePublicPlan();
              handleNavigateToCreatePlan();
            }}
          />
        ) : currentView === 'ideas_directory' ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <BusinessIdeasDirectory
              onSelectIdea={handleSelectIdea}
              referralCode={profile?.referralCode}
              initialIdeaId={focusedIdeaId}
              initialCountrySlug={focusedCountrySlug}
              onOpenCreatePlanWithPrefill={(prefill) => {
                const ideaStub: any = {
                  id: `ai-${Date.now()}`,
                  title: prefill.businessName,
                  fullDescription: prefill.businessIdea,
                  industry: prefill.industry,
                  targetAudience: prefill.targetCustomers,
                  country: prefill.country,
                  estimatedCapitalRange: prefill.startupCapital,
                  defaultGoals: prefill.businessGoals,
                };
                handleSelectIdea(ideaStub);
              }}
            />
          </div>
        ) : currentView === 'landing' ? (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onNavigateToCreatePlan={handleNavigateToCreatePlan}
            onNavigateToIdeas={handleNavigateToIdeas}
            onSelectIdea={handleSelectIdea}
          />
        ) : (
          <DashboardLayout
            activeTab={dashboardTab}
            onTabChange={(tab) => setDashboardTab(tab)}
            selectedIdeaForCreation={selectedIdeaForCreation}
            onClearSelectedIdea={() => setSelectedIdeaForCreation(null)}
            onViewPublicPage={handleOpenPublicPlan}
          />
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          Analytics.registration('email_or_google', getActiveReferralCode() || undefined);
          setCurrentView('dashboard');
          if (selectedIdeaForCreation) {
            setDashboardTab('create');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
