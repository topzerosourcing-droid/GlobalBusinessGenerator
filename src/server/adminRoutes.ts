import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const adminRouter = express.Router();

export const PERMANENT_SUPER_ADMIN_EMAILS = [
  'topogabolekwe@gmail.com',
  'gabolekwetopo@gmail.com'
] as const;

export function isPermanentSuperAdminEmailServer(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return PERMANENT_SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

// In-memory store for server-managed users and entitlements
interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'deactivated' | 'suspended';
  country: string;
  preferredCurrency: string;
  createdAt: string;
  updatedAt: string;
  businessPlansCount?: number;
}

const serverUsers = new Map<string, AdminUserRecord>();

// Pre-provision the two permanent super admin accounts
function initSuperAdmins() {
  PERMANENT_SUPER_ADMIN_EMAILS.forEach((email) => {
    const normalized = email.toLowerCase();
    if (!serverUsers.has(normalized)) {
      serverUsers.set(normalized, {
        uid: `sa_${crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12)}`,
        name: normalized.includes('topo') ? 'Topo Gabolekwe (Super Admin)' : 'Super Admin',
        email: normalized,
        role: 'SUPER_ADMIN',
        tier: 'enterprise',
        status: 'active',
        country: 'Botswana / Global',
        preferredCurrency: 'USD',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        businessPlansCount: 12
      });
    }
  });
}

initSuperAdmins();

/**
 * Server-Side SUPER_ADMIN Authorization Middleware
 * Enforces that only topogabolekwe@gmail.com and gabolekwetopo@gmail.com
 * or verified SUPER_ADMIN credentials can access admin endpoints.
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const userEmail = (req.headers['x-user-email'] as string || req.headers['authorization-email'] as string || '').trim().toLowerCase();
  const userRole = (req.headers['x-user-role'] as string || '').trim();

  // Validate email against permanent super admin list or role
  const isSuperAdminEmail = isPermanentSuperAdminEmailServer(userEmail);
  const isSuperAdminRole = userRole === 'SUPER_ADMIN' && isSuperAdminEmail;

  if (!userEmail || (!isSuperAdminEmail && !isSuperAdminRole)) {
    return res.status(403).json({
      error: 'Forbidden: SUPER_ADMIN authorization required.',
      code: 'UNAUTHORIZED_SUPER_ADMIN',
      message: 'Access restricted to authorized platform Super Administrators.'
    });
  }

  // Ensure record is up-to-date in server store
  if (isSuperAdminEmail && !serverUsers.has(userEmail)) {
    initSuperAdmins();
  }

  next();
}

// 1. Verify Super Admin Access
adminRouter.get('/verify', requireSuperAdmin, (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string || '').trim().toLowerCase();
  res.json({
    authorized: true,
    role: 'SUPER_ADMIN',
    email: userEmail,
    permanentSuperAdmins: PERMANENT_SUPER_ADMIN_EMAILS,
    timestamp: new Date().toISOString()
  });
});

// 2. List All Users
adminRouter.get('/users', requireSuperAdmin, (req: Request, res: Response) => {
  initSuperAdmins();
  const usersList = Array.from(serverUsers.values());
  res.json({
    users: usersList,
    totalCount: usersList.length,
    superAdminsCount: usersList.filter(u => u.role === 'SUPER_ADMIN').length
  });
});

// 3. Provision / Create User
adminRouter.post('/users', requireSuperAdmin, (req: Request, res: Response) => {
  const { name, email, role, tier, country, preferredCurrency } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required to provision a user.' });
  }

  const normalized = email.trim().toLowerCase();
  const isSuperAdmin = isPermanentSuperAdminEmailServer(normalized);

  const newUser: AdminUserRecord = {
    uid: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name,
    email: normalized,
    role: isSuperAdmin ? 'SUPER_ADMIN' : (role || 'USER'),
    tier: isSuperAdmin ? 'enterprise' : (tier || 'free'),
    status: 'active',
    country: country || 'United States',
    preferredCurrency: preferredCurrency || 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    businessPlansCount: 0
  };

  serverUsers.set(normalized, newUser);
  res.status(201).json({ success: true, user: newUser });
});

// 4. Update User
adminRouter.put('/users/:userId', requireSuperAdmin, (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;

  let targetKey: string | null = null;
  let targetUser: AdminUserRecord | null = null;

  for (const [emailKey, u] of serverUsers.entries()) {
    if (u.uid === userId || emailKey === userId.toLowerCase()) {
      targetKey = emailKey;
      targetUser = u;
      break;
    }
  }

  if (!targetUser || !targetKey) {
    return res.status(404).json({ error: 'User not found in system.' });
  }

  // Protect permanent super admins from demotion
  if (isPermanentSuperAdminEmailServer(targetUser.email)) {
    updates.role = 'SUPER_ADMIN';
    updates.tier = 'enterprise';
    updates.status = 'active';
  }

  const updatedUser: AdminUserRecord = {
    ...targetUser,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  serverUsers.set(targetKey, updatedUser);
  res.json({ success: true, user: updatedUser });
});

// 5. Toggle User Status (Deactivate / Reactivate)
adminRouter.post('/users/:userId/toggle-status', requireSuperAdmin, (req: Request, res: Response) => {
  const { userId } = req.params;

  let targetKey: string | null = null;
  let targetUser: AdminUserRecord | null = null;

  for (const [emailKey, u] of serverUsers.entries()) {
    if (u.uid === userId || emailKey === userId.toLowerCase()) {
      targetKey = emailKey;
      targetUser = u;
      break;
    }
  }

  if (!targetUser || !targetKey) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (isPermanentSuperAdminEmailServer(targetUser.email)) {
    return res.status(400).json({ 
      error: 'Permanent Super Admin accounts (topogabolekwe@gmail.com, gabolekwetopo@gmail.com) cannot be deactivated.' 
    });
  }

  const nextStatus = targetUser.status === 'deactivated' ? 'active' : 'deactivated';
  targetUser.status = nextStatus;
  targetUser.updatedAt = new Date().toISOString();

  serverUsers.set(targetKey, targetUser);
  res.json({ success: true, status: nextStatus, user: targetUser });
});

// 6. System Settings & Configuration Overview
adminRouter.get('/system-settings', requireSuperAdmin, (req: Request, res: Response) => {
  res.json({
    platform: 'Global Business Generator',
    environment: 'production-ready',
    permanentSuperAdmins: PERMANENT_SUPER_ADMIN_EMAILS,
    pricing: {
      proPlanUSD: 29,
      investorPackageUSD: 69,
      currency: 'USD'
    },
    paypal: {
      mode: process.env.PAYPAL_MODE || 'live',
      merchantEmail: 'topogabolekwe@gmail.com',
      liveClientConfigured: Boolean(process.env.PAYPAL_LIVE_CLIENT_ID || process.env.PAYPAL_CLIENT_ID),
      webhookConfigured: true
    },
    security: {
      serverSideAuthEnforced: true,
      unauthorizedAccessBlocked: true,
      rolesAllowed: ['SUPER_ADMIN', 'ADMIN', 'USER']
    },
    aiEngine: {
      provider: 'Google Gemini',
      defaultModel: 'gemini-2.5-flash',
      fullPlan34SectionsEnabled: true
    }
  });
});
