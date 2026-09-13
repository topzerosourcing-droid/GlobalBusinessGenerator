import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Lightbulb, 
  User, 
  CreditCard, 
  Plus, 
  Loader2, 
  LogOut, 
  Globe, 
  ChevronRight,
  Menu,
  X,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BusinessPlan, CuratedBusinessIdea } from '../types';
import { getUserBusinessPlans, deleteBusinessPlanFromFirestore } from '../lib/firebase';
import { CreatePlanForm } from './CreatePlanForm';
import { MyPlansList } from './MyPlansList';
import { PlanDetailView } from './PlanDetailView';
import { BusinessIdeasDirectory } from './BusinessIdeasDirectory';
import { ProfileView } from './ProfileView';
import { PricingView } from './PricingView';
import { ReferralDashboard } from './ReferralDashboard';
import { PlanCompletedModal } from './PlanCompletedModal';
import { MarketingKitModal } from './MarketingKitModal';
import { PurchaseHistoryView } from './PurchaseHistoryView';
import { SuperAdminSuite } from './SuperAdminSuite';
import { Receipt, BarChart3, ShieldCheck } from 'lucide-react';

export type DashboardTab = 'create' | 'plans' | 'ideas' | 'purchases' | 'pricing' | 'admin' | 'referrals' | 'profile';

interface DashboardLayoutProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  selectedIdeaForCreation?: CuratedBusinessIdea | null;
  onClearSelectedIdea?: () => void;
  onViewPublicPage?: (slug: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab: externalTab,
  onTabChange,
  selectedIdeaForCreation,
  onClearSelectedIdea,
  onViewPublicPage,
}) => {
  const { user, profile, isSuperAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(externalTab || (selectedIdeaForCreation ? 'create' : 'plans'));
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Viral completion prompt state
  const [newlyCreatedPlan, setNewlyCreatedPlan] = useState<BusinessPlan | null>(null);
  const [marketingKitPlan, setMarketingKitPlan] = useState<BusinessPlan | null>(null);

  // Sync external tab
  useEffect(() => {
    if (externalTab && externalTab !== activeTab) {
      setActiveTab(externalTab);
    }
  }, [externalTab]);

  // Load plans from Firestore
  const loadPlans = async () => {
    if (!user) return;
    setLoadingPlans(true);
    try {
      const data = await getUserBusinessPlans(user.uid);
      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [user]);

  const handleTabSelect = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSelectedPlan(null);
    onTabChange?.(tab);
    setMobileMenuOpen(false);
  };

  const handlePlanCreated = (newPlan: BusinessPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setSelectedPlan(newPlan);
    setNewlyCreatedPlan(newPlan);
    onClearSelectedIdea?.();
  };

  const handleUpdatePlan = (updatedPlan: BusinessPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    setSelectedPlan(updatedPlan);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteBusinessPlanFromFirestore(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const handleSelectIdeaFromDirectory = (idea: CuratedBusinessIdea) => {
    onClearSelectedIdea?.();
    setActiveTab('create');
    setSelectedPlan(null);
  };

  const navItems: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'create', label: 'Create New Business Plan', icon: Sparkles },
    { id: 'plans', label: 'My Business Plans', icon: FileText, count: plans.length },
    { id: 'ideas', label: 'Business Ideas', icon: Lightbulb },
    { id: 'purchases', label: 'Purchase History', icon: Receipt },
    { id: 'pricing', label: 'Plans & Pricing', icon: CreditCard },
    ...(isSuperAdmin ? [{ id: 'admin' as DashboardTab, label: 'Super Admin Suite', icon: ShieldCheck }] : []),
    { id: 'referrals', label: 'Referrals & Rewards', icon: Gift },
    { id: 'profile', label: 'Account / Profile', icon: User },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Dashboard: {navItems.find((n) => n.id === activeTab)?.label}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block 
        w-full md:w-64 shrink-0 border-r border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between
      `}>
        <div className="space-y-6">
          {/* User Quick Info */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl font-bold flex items-center justify-center text-xs text-white ${
                isSuperAdmin ? 'bg-purple-600 shadow-xs' : 'bg-indigo-600'
              }`}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {profile?.name || user?.email?.split('@')[0]}
                  </span>
                </div>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-black text-purple-800 tracking-wide mt-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-purple-700" />
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className="block text-[11px] text-slate-500 truncate">
                    {profile?.country || 'Global'} • {profile?.preferredCurrency || 'USD'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !selectedPlan;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status / Logout */}
        <div className="pt-6 border-t border-slate-100 mt-6">
          <button
            id="btn-sidebar-logout"
            onClick={() => logout()}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* If viewing a single plan in detail */}
        {selectedPlan ? (
          <PlanDetailView
            plan={selectedPlan}
            onBack={() => setSelectedPlan(null)}
            onDelete={handleDeletePlan}
            onUpdatePlan={handleUpdatePlan}
            onViewPublicPage={onViewPublicPage}
            referralCode={profile?.referralCode}
          />
        ) : (
          <>
            {activeTab === 'create' && (
              <CreatePlanForm
                initialIdea={selectedIdeaForCreation}
                onPlanCreated={handlePlanCreated}
                onCancel={() => handleTabSelect('plans')}
              />
            )}

            {activeTab === 'plans' && (
              loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                  <span className="text-xs font-medium">Loading your business plans from Firestore...</span>
                </div>
              ) : (
                <MyPlansList
                  plans={plans}
                  onSelectPlan={(p) => setSelectedPlan(p)}
                  onCreateNew={() => handleTabSelect('create')}
                  onDeletePlan={handleDeletePlan}
                />
              )
            )}

            {activeTab === 'ideas' && (
              <BusinessIdeasDirectory
                onSelectIdea={(idea) => {
                  handleSelectIdeaFromDirectory(idea);
                }}
                referralCode={profile?.referralCode}
              />
            )}

            {activeTab === 'referrals' && (
              <ReferralDashboard
                userProfile={
                  profile || {
                    uid: user?.uid || '',
                    name: user?.email?.split('@')[0] || 'Founder',
                    email: user?.email || '',
                    createdAt: new Date().toISOString(),
                    referralCode: 'GBG' + (user?.uid?.slice(0, 4).toUpperCase() || 'USER'),
                  }
                }
                onCreatePlan={() => handleTabSelect('create')}
              />
            )}

            {activeTab === 'purchases' && (
              <PurchaseHistoryView
                userId={user?.uid || 'guest_user'}
                plans={plans}
                onOpenPlan={(plan) => setSelectedPlan(plan)}
                onNavigateToPlans={() => handleTabSelect('plans')}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingView
                plans={plans}
                onOpenPlan={(plan) => setSelectedPlan(plan)}
                onNavigateToGenerator={() => handleTabSelect('create')}
              />
            )}

            {activeTab === 'admin' && (
              isSuperAdmin ? (
                <SuperAdminSuite onOpenPlan={(plan) => setSelectedPlan(plan)} />
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md mx-auto my-12">
                  <h3 className="text-base font-bold text-red-900">Access Denied</h3>
                  <p className="text-xs text-red-700 mt-1">Super Administrator authorization is required to access this portal.</p>
                </div>
              )
            )}

            {activeTab === 'profile' && <ProfileView />}
          </>
        )}

      </main>

      {/* Post-Completion Viral Prompt Modal */}
      {newlyCreatedPlan && (
        <PlanCompletedModal
          isOpen={!!newlyCreatedPlan}
          onClose={() => setNewlyCreatedPlan(null)}
          plan={newlyCreatedPlan}
          userProfile={profile}
          onOpenMarketingKit={() => {
            const planRef = newlyCreatedPlan;
            setNewlyCreatedPlan(null);
            setMarketingKitPlan(planRef);
          }}
          onViewPublicPage={(slug) => {
            setNewlyCreatedPlan(null);
            onViewPublicPage?.(slug);
          }}
        />
      )}

      {/* Standalone Marketing Kit Modal */}
      {marketingKitPlan && (
        <MarketingKitModal
          isOpen={!!marketingKitPlan}
          onClose={() => setMarketingKitPlan(null)}
          plan={marketingKitPlan}
          referralCode={profile?.referralCode}
          onSaveKit={(kit) => {
            handleUpdatePlan({
              ...marketingKitPlan,
              marketingKit: kit,
            });
          }}
        />
      )}

    </div>
  );
};
