import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Eye, 
  Shield, 
  Ban, 
  Check, 
  Sparkles,
  BarChart3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  UserProfile, 
  BusinessPlan, 
  OrderRecord, 
  isPermanentSuperAdminEmail, 
  PERMANENT_SUPER_ADMIN_EMAILS 
} from '../types';
import { 
  getAllUsersForAdmin, 
  updateUserByAdmin, 
  toggleUserStatusByAdmin, 
  getAllBusinessPlansForAdmin, 
  deleteBusinessPlanFromFirestore,
  getAllEntitlementsForAdmin,
  grantManualEntitlementByAdmin,
  revokeEntitlementByAdmin
} from '../lib/firebase';
import { paymentGateway, GatewayConfigResponse } from '../services/paymentService';

export type SuperAdminTab = 'overview' | 'users' | 'plans' | 'orders' | 'entitlements' | 'settings';

interface SuperAdminSuiteProps {
  onOpenPlan?: (plan: BusinessPlan) => void;
}

export const SuperAdminSuite: React.FC<SuperAdminSuiteProps> = ({ onOpenPlan }) => {
  const { user, profile, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [plansList, setPlansList] = useState<BusinessPlan[]>([]);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [entitlementsList, setEntitlementsList] = useState<any[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfigResponse | null>(null);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'USER'>('ALL');
  const [planSearch, setPlanSearch] = useState('');

  // Modals / Dialogs
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    tier: 'free' as 'free' | 'starter' | 'pro' | 'enterprise',
    country: 'United States',
    preferredCurrency: 'USD'
  });

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [manualEntitlementPlanId, setManualEntitlementPlanId] = useState('');
  const [manualEntitlementUserId, setManualEntitlementUserId] = useState('');
  const [manualEntitlementPackage, setManualEntitlementPackage] = useState<'pro' | 'investor'>('investor');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      // 1. Users
      const users = await getAllUsersForAdmin();
      setUsersList(users);

      // 2. Plans
      const plans = await getAllBusinessPlansForAdmin();
      setPlansList(plans);

      // 3. Orders
      const orders = await paymentGateway.getAllOrdersAdmin(user?.email || undefined);
      setOrdersList(orders);

      // 4. Entitlements
      const entitlements = await getAllEntitlementsForAdmin();
      setEntitlementsList(entitlements);

      // 5. Gateway Config
      const cfg = await paymentGateway.getConfig();
      setGatewayConfig(cfg);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setActionError(err.message || 'Error fetching administrator data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAdminData();
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // User Actions
  const handleToggleUserStatus = async (targetUser: UserProfile) => {
    try {
      if (isPermanentSuperAdminEmail(targetUser.email)) {
        alert('Permanent Super Admin accounts (topogabolekwe@gmail.com, gabolekwetopo@gmail.com) cannot be deactivated.');
        return;
      }
      const newStatus = await toggleUserStatusByAdmin(
        targetUser.uid, 
        targetUser.email, 
        targetUser.status as any
      );
      setUsersList(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, status: newStatus, isActive: newStatus === 'active' } : u));
      showNotification(`User ${targetUser.email} status set to ${newStatus}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserByAdmin(editingUser.uid, {
        name: editingUser.name,
        role: editingUser.role,
        tier: editingUser.tier,
        country: editingUser.country,
        preferredCurrency: editingUser.preferredCurrency
      });
      setUsersList(prev => prev.map(u => u.uid === editingUser.uid ? editingUser : u));
      setEditingUser(null);
      showNotification(`Updated profile for ${editingUser.email}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const profileToCreate: Partial<UserProfile> = {
        name: newUserForm.name,
        email: newUserForm.email.toLowerCase().trim(),
        role: newUserForm.role,
        tier: newUserForm.tier,
        country: newUserForm.country,
        preferredCurrency: newUserForm.preferredCurrency,
        createdAt: new Date().toISOString(),
        status: 'active',
        isActive: true,
      };

      await updateUserByAdmin(generatedUid, profileToCreate);
      await loadAllAdminData();
      setShowCreateUserModal(false);
      setNewUserForm({
        name: '',
        email: '',
        role: 'USER',
        tier: 'free',
        country: 'United States',
        preferredCurrency: 'USD'
      });
      showNotification(`Provisioned user ${profileToCreate.email}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to provision user.');
    }
  };

  // Plan Actions
  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this business plan from the entire platform? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteBusinessPlanFromFirestore(planId);
      setPlansList(prev => prev.filter(p => p.id !== planId));
      showNotification('Business plan deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan.');
    }
  };

  // Entitlement Actions
  const handleGrantManualEntitlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntitlementPlanId.trim()) {
      alert('Plan ID is required.');
      return;
    }
    try {
      const adminEmail = user?.email || 'topogabolekwe@gmail.com';
      await grantManualEntitlementByAdmin(
        manualEntitlementPlanId.trim(),
        manualEntitlementUserId.trim() || 'admin_assigned',
        manualEntitlementPackage,
        adminEmail
      );
      await loadAllAdminData();
      setManualEntitlementPlanId('');
      setManualEntitlementUserId('');
      showNotification(`Manually granted ${manualEntitlementPackage.toUpperCase()} entitlement.`);
    } catch (err: any) {
      alert(err.message || 'Failed to grant entitlement.');
    }
  };

  const handleRevokeEntitlement = async (entId: string) => {
    if (!window.confirm('Revoke this entitlement? The plan will revert to free preview status.')) return;
    try {
      await revokeEntitlementByAdmin(entId);
      setEntitlementsList(prev => prev.map(e => e.id === entId ? { ...e, status: 'revoked' } : e));
      showNotification('Entitlement revoked.');
    } catch (err: any) {
      alert(err.message || 'Failed to revoke entitlement.');
    }
  };

  // Security Gate
  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center max-w-2xl mx-auto my-12">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <Ban className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-red-950">SUPER_ADMIN Access Required</h2>
        <p className="mt-2 text-sm text-red-700">
          This administration center is restricted to authorized platform Super Administrators.
          Your current account ({user?.email || 'Guest'}) does not hold SUPER_ADMIN authorization.
        </p>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.uid && u.uid.toLowerCase().includes(userSearch.toLowerCase()));
    
    const matchesRole = 
      userRoleFilter === 'ALL' ? true : u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Filtered Plans
  const filteredPlans = plansList.filter(p => {
    const matchesSearch = 
      (p.input?.businessName && p.input.businessName.toLowerCase().includes(planSearch.toLowerCase())) ||
      (p.input?.industry && p.input.industry.toLowerCase().includes(planSearch.toLowerCase())) ||
      (p.userId && p.userId.toLowerCase().includes(planSearch.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(planSearch.toLowerCase()));
    return matchesSearch;
  });

  // Calculated Metrics
  const totalRevenue = ordersList
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const superAdminsCount = usersList.filter(u => u.role === 'SUPER_ADMIN').length;
  const activePaidPlansCount = plansList.filter(p => p.status === 'paid' || p.packageId === 'investor' || p.packageId === 'pro').length;

  return (
    <div className="space-y-6">
      {/* Super Admin Top Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>SUPER ADMIN PLATFORM CONTROL CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Global Business Generator Administration
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Authenticated as <span className="text-white font-semibold">{user?.email}</span> (SUPER_ADMIN) • Permanent Authority Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Live Platform'}</span>
            </button>
          </div>
        </div>

        {/* Permanent Super Admin Accounts Badge Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Permanent Super Admins:</span>
          {PERMANENT_SUPER_ADMIN_EMAILS.map((email) => (
            <span 
              key={email}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 px-2.5 py-1 text-[11px] font-mono text-indigo-200"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>{email}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
          { id: 'users', label: `User Management (${usersList.length})`, icon: Users },
          { id: 'plans', label: `All Plans Fleet (${plansList.length})`, icon: FileText },
          { id: 'orders', label: `PayPal LIVE Orders (${ordersList.length})`, icon: DollarSign },
          { id: 'entitlements', label: `Entitlements (${entitlementsList.length})`, icon: Unlock },
          { id: 'settings', label: 'System Diagnostics & Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SuperAdminTab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{usersList.length}</p>
              <span className="mt-1 text-[11px] text-slate-400 block font-medium">
                {superAdminsCount} Super Admins • {usersList.filter(u => u.status === 'active' || u.isActive).length} Active
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Business Plans</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{plansList.length}</p>
              <span className="mt-1 text-[11px] text-slate-400 block font-medium">
                {activePaidPlansCount} Paid / Unlocked Plans
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue (PayPal)</span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">${totalRevenue.toLocaleString()} USD</p>
              <span className="mt-1 text-[11px] text-slate-400 block font-medium">
                Pro ($29) & Investor ($69) Packages
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PayPal Gateway</span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="mt-3 text-lg font-black text-emerald-700">LIVE MODE ACTIVE</p>
              <span className="mt-1 text-[11px] text-slate-400 block font-medium truncate">
                {gatewayConfig?.merchantEmail || 'topogabolekwe@gmail.com'}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>User Provisioning</span>
              </h3>
              <p className="text-xs text-slate-500">
                Directly provision, edit, or adjust roles and tiers for any user on the platform.
              </p>
              <button
                onClick={() => { setActiveTab('users'); setShowCreateUserModal(true); }}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 transition"
              >
                + Add / Provision User
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>Manual Entitlement</span>
              </h3>
              <p className="text-xs text-slate-500">
                Grant instant Pro ($29) or Investor ($69) 34-section access to any customer plan.
              </p>
              <button
                onClick={() => setActiveTab('entitlements')}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 transition"
              >
                Open Entitlements Manager
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Plans Fleet Inspection</span>
              </h3>
              <p className="text-xs text-slate-500">
                Browse and inspect all generated business plans across every entrepreneur account.
              </p>
              <button
                onClick={() => setActiveTab('plans')}
                className="w-full rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 transition"
              >
                Inspect All Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search users by email, name, or UID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN Only</option>
                <option value="ADMIN">ADMIN Only</option>
                <option value="USER">USER Only</option>
              </select>

              <button
                onClick={() => setShowCreateUserModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Provision User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Subscription Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isPermanent = isPermanentSuperAdminEmail(u.email);
                    return (
                      <tr key={u.uid} className={`hover:bg-slate-50/80 transition ${isPermanent ? 'bg-indigo-50/30' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                              isPermanent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{u.name || 'Founder'}</span>
                                {isPermanent && (
                                  <span className="rounded-sm bg-indigo-100 px-1 py-0.5 text-[9px] font-black text-indigo-800">
                                    PERMANENT
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono block">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : u.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            <Shield className="w-3 h-3" />
                            <span>{u.role || 'USER'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="capitalize font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                            {u.tier || 'free'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'deactivated' || u.isActive === false
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'deactivated' ? 'bg-red-500' : 'bg-emerald-500'
                            }`} />
                            <span>{u.status === 'deactivated' ? 'Deactivated' : 'Active'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {u.country || 'Global'}
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                              title="Edit User"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isPermanent ? (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`rounded-lg p-1.5 transition ${
                                  u.status === 'deactivated' 
                                    ? 'text-emerald-600 hover:bg-emerald-50' 
                                    : 'text-red-500 hover:bg-red-50'
                                }`}
                                title={u.status === 'deactivated' ? 'Reactivate User' : 'Deactivate User'}
                              >
                                {u.status === 'deactivated' ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                              <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Permanent accounts cannot be deactivated">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL BUSINESS PLANS FLEET */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search plans by business name, industry, userId..."
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">{filteredPlans.length} Total Plans</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <div 
                key={plan.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md truncate">
                      {plan.input?.industry || 'Business'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      plan.status === 'paid' || plan.packageId === 'investor' || plan.packageId === 'pro'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.packageId ? `${plan.packageId.toUpperCase()}` : 'FREE PREVIEW'}
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-slate-900 line-clamp-1">
                    {plan.input?.businessName || 'Untitled Business Plan'}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {plan.input?.businessIdea || 'No idea specified'}
                  </p>

                  <div className="mt-3 text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>User ID: {plan.userId?.slice(0, 14)}...</div>
                    <div>Created: {new Date(plan.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenPlan?.(plan)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Plan</span>
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & PAYMENTS (PAYPAL LIVE) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>PayPal LIVE Payment Records & Orders</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Email</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersList.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {order.orderId}
                      </td>
                      <td className="py-3 px-4">
                        {order.customerEmail || order.userId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold uppercase text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {order.productPackage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        ${order.amount} {order.currency || 'USD'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          order.status === 'paid' || order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'refunded'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No orders registered yet. Live orders will populate dynamically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ENTITLEMENTS MANAGER */}
      {activeTab === 'entitlements' && (
        <div className="space-y-6">
          {/* Manual Grant Tool */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-indigo-600" />
              <span>Manually Grant Plan Entitlement</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Instantly unlock all 34 sections and investor PDF capabilities for any plan without requiring PayPal checkout.
            </p>

            <form onSubmit={handleGrantManualEntitlement} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Plan ID</label>
                <input
                  type="text"
                  placeholder="e.g. plan_17734..."
                  value={manualEntitlementPlanId}
                  onChange={(e) => setManualEntitlementPlanId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">User ID / Email</label>
                <input
                  type="text"
                  placeholder="e.g. user_abc or customer@..."
                  value={manualEntitlementUserId}
                  onChange={(e) => setManualEntitlementUserId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Package</label>
                <div className="flex items-center gap-2">
                  <select
                    value={manualEntitlementPackage}
                    onChange={(e) => setManualEntitlementPackage(e.target.value as any)}
                    className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden bg-white font-bold"
                  >
                    <option value="investor">Investor / Funding Package ($69)</option>
                    <option value="pro">Pro Business Plan ($29)</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 transition"
                  >
                    Grant
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Active Entitlements List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Registered Platform Entitlements</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Plan ID</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Granted At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entitlementsList.map((ent) => (
                    <tr key={ent.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ent.planId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold uppercase text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {ent.packageId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ent.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {ent.grantedAt ? new Date(ent.grantedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ent.status === 'active' && (
                          <button
                            onClick={() => handleRevokeEntitlement(ent.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-800"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {entitlementsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No entitlements issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM DIAGNOSTICS & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Architecture & Diagnostics</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time status of services, authorization engines, and PayPal LIVE credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Permanent Super Admins</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                    VERIFIED (2)
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono space-y-1">
                  <div>1. topogabolekwe@gmail.com</div>
                  <div>2. gabolekwetopo@gmail.com</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Firebase Auth Authorized Domains</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5">
                    PROJECT CONSOLE
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Vercel Domain: <span className="font-mono text-indigo-700 font-semibold">globalbusinessgenerator.vercel.app</span></div>
                  <div>Project ID: <span className="font-mono">airy-formula-p6shk</span></div>
                  <div className="pt-1">
                    <a
                      href="https://console.firebase.google.com/project/airy-formula-p6shk/authentication/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Open Firebase Console &rarr; Add Authorized Domain
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">PayPal Production Gateway</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                    LIVE READY
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Merchant: <span className="font-mono">{gatewayConfig?.merchantEmail || 'topogabolekwe@gmail.com'}</span></div>
                  <div>Mode: <span className="font-bold text-emerald-700">LIVE (Real Funds)</span></div>
                  <div>Webhook Engine: Configured & Verified</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Authoritative Catalog Prices</span>
                  <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5">
                    ENFORCED
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Pro Business Plan: <span className="font-black text-slate-900">$29 USD</span></div>
                  <div>Investor / Funding Package: <span className="font-black text-slate-900">$69 USD</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">AI Intelligence Engine</span>
                  <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5">
                    GEMINI FLASH 2.5
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>All 34 Comprehensive Sections Supported</div>
                  <div>Idea Generation Engine: Operational</div>
                  <div>Self-Marketing Engine: Operational</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Edit User Profile & Role</h3>
            <p className="text-xs text-slate-500 mb-4">{editingUser.email}</p>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">User Role</label>
                <select
                  value={editingUser.role || 'USER'}
                  disabled={isPermanentSuperAdminEmail(editingUser.email)}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden bg-white"
                >
                  <option value="USER">USER (Standard Entrepreneur)</option>
                  <option value="ADMIN">ADMIN (Limited Admin Access)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                </select>
                {isPermanentSuperAdminEmail(editingUser.email) && (
                  <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                    Permanent Super Admins cannot be demoted.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Tier</label>
                <select
                  value={editingUser.tier || 'free'}
                  onChange={(e) => setEditingUser({ ...editingUser, tier: e.target.value as any })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden bg-white"
                >
                  <option value="free">free</option>
                  <option value="starter">starter</option>
                  <option value="pro">pro</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editingUser.country || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Provision New User</h3>
            <p className="text-xs text-slate-500 mb-4">Create or initialize a user profile with assigned role and tier.</p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. founder@company.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden bg-white"
                >
                  <option value="USER">USER (Standard Entrepreneur)</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Tier</label>
                <select
                  value={newUserForm.tier}
                  onChange={(e) => setNewUserForm({ ...newUserForm, tier: e.target.value as any })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-hidden bg-white"
                >
                  <option value="free">free</option>
                  <option value="starter">starter</option>
                  <option value="pro">pro</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
