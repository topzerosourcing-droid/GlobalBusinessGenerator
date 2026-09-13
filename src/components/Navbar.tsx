import React from 'react';
import { 
  Globe, 
  Sparkles, 
  User, 
  LogOut, 
  FileText, 
  Lightbulb, 
  CreditCard, 
  LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  currentView: 'landing' | 'dashboard' | 'ideas_directory';
  setCurrentView: (view: 'landing' | 'dashboard' | 'ideas_directory') => void;
  dashboardTab?: string;
  setDashboardTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  currentView,
  setCurrentView,
  dashboardTab,
  setDashboardTab,
}) => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Brand */}
        <div 
          id="brand-logo"
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Globe className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              Global Business <span className="text-indigo-600 font-extrabold">Generator</span>
            </span>
            <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase block">
              AI Venture Strategy Platform
            </span>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            id="nav-explore-ideas"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.hash = '#ideas';
              setCurrentView('ideas_directory');
            }}
            className={`flex items-center gap-1.5 transition-colors ${
              currentView === 'ideas_directory'
                ? 'text-indigo-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Explore Business Ideas
          </button>

          <button
            id="nav-pricing"
            onClick={() => {
              if (user) {
                setCurrentView('dashboard');
                setDashboardTab?.('pricing');
              } else {
                setCurrentView('landing');
                const el = document.getElementById('pricing-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            <CreditCard className="h-4 w-4 text-emerald-500" />
            Pricing
          </button>

          {user && (
            <button
              id="nav-dashboard-link"
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 transition-colors ${
                currentView === 'dashboard' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                id="header-user-badge"
                onClick={() => {
                  setCurrentView('dashboard');
                  setDashboardTab?.('profile');
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block font-semibold text-slate-900 leading-none">
                    {profile?.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {profile?.preferredCurrency || 'USD'} • {profile?.tier?.toUpperCase() || 'FREE'}
                  </span>
                </div>
              </button>

              <button
                id="btn-nav-logout"
                onClick={() => logout()}
                title="Sign Out"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-header-login"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
              >
                Sign In
              </button>
              <button
                id="btn-header-register"
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
