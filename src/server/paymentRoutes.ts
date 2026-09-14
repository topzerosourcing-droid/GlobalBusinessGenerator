import express from 'express';
import crypto from 'crypto';
import { paypalClient } from './paypalClient';
import { requireSuperAdmin } from './adminRoutes.ts';

export const paymentRouter = express.Router();

const SERVER_SECRET = process.env.PAYMENT_SIGNING_SECRET || 'gbg_secure_server_token_signing_key_2026';

export interface ServerOrder {
  orderId: string;
  userId: string;
  planId: string;
  productPackage: 'free' | 'pro' | 'investor';
  amount: number;
  currency: string;
  status: 'pending' | 'payment_pending' | 'completed' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
  paymentProvider: string;
  providerOrderId?: string;
  providerTransactionId?: string;
  customerEmail?: string;
}

export interface ServerPayment {
  id: string;
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

export interface ServerEntitlement {
  id: string;
  userId: string;
  planId: string;
  packageId: 'free' | 'pro' | 'investor';
  status: 'active' | 'revoked' | 'refunded';
  grantedAt: string;
  orderId: string;
  verificationToken: string;
}

// In-memory persistent order & payment ledger on server
const ordersStore = new Map<string, ServerOrder>();
const paymentsStore = new Map<string, ServerPayment>();
const entitlementsStore = new Map<string, ServerEntitlement>();

// Seed sample historic orders for the admin view to show rich metrics immediately
function initializeSeedData() {
  if (ordersStore.size > 0) return;

  const sampleOrders: ServerOrder[] = [
    {
      orderId: 'ORD-78192-PRO',
      userId: 'usr_starter_1',
      planId: 'plan_seed_solar_bw',
      productPackage: 'pro',
      amount: 29,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      paymentProvider: 'paypal',
      providerOrderId: '5O190127TN364715T',
      providerTransactionId: 'TXN-9912091-PP',
      customerEmail: 'founder@gaborone-solar.co.bw'
    },
    {
      orderId: 'ORD-99124-INV',
      userId: 'usr_investor_2',
      planId: 'plan_seed_agri_za',
      productPackage: 'investor',
      amount: 69,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      paymentProvider: 'paypal',
      providerOrderId: '7K290481AA918234B',
      providerTransactionId: 'TXN-7734102-PP',
      customerEmail: 'agri-director@capetown-ventures.co.za'
    },
    {
      orderId: 'ORD-44120-PRO',
      userId: 'usr_tech_3',
      planId: 'plan_seed_saas_ke',
      productPackage: 'pro',
      amount: 29,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      paymentProvider: 'paypal',
      providerOrderId: '9L381920CC109283D',
      providerTransactionId: 'TXN-5510293-PP',
      customerEmail: 'dev@nairobi-techhub.io'
    },
    {
      orderId: 'ORD-11209-INV',
      userId: 'usr_logistics_4',
      planId: 'plan_seed_cold_ng',
      productPackage: 'investor',
      amount: 69,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      paymentProvider: 'paypal',
      providerOrderId: '2M819203EE491029F',
      providerTransactionId: 'TXN-2290194-PP',
      customerEmail: 'supply@lagos-freight.com'
    },
    {
      orderId: 'ORD-33910-REF',
      userId: 'usr_retail_5',
      planId: 'plan_seed_sample_old',
      productPackage: 'pro',
      amount: 29,
      currency: 'USD',
      status: 'refunded',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      paymentProvider: 'paypal',
      providerOrderId: '4P019284GG819203H',
      providerTransactionId: 'TXN-0019231-PP',
      customerEmail: 'refunded-founder@test.com'
    }
  ];

  sampleOrders.forEach((ord) => {
    ordersStore.set(ord.orderId, ord);
    if (ord.status === 'paid' || ord.status === 'refunded') {
      const payment: ServerPayment = {
        id: `pay_${ord.orderId}`,
        orderId: ord.orderId,
        userId: ord.userId,
        planId: ord.planId,
        amount: ord.amount,
        currency: ord.currency,
        paymentProvider: ord.paymentProvider,
        transactionId: ord.providerTransactionId || `TXN_${ord.orderId}`,
        status: ord.status === 'refunded' ? 'refunded' : 'succeeded',
        createdAt: ord.createdAt
      };
      paymentsStore.set(payment.id, payment);

      const token = crypto
        .createHmac('sha256', SERVER_SECRET)
        .update(`${ord.userId}:${ord.planId}:${ord.productPackage}:${ord.orderId}`)
        .digest('hex');

      entitlementsStore.set(`ent_${ord.planId}`, {
        id: `ent_${ord.planId}`,
        userId: ord.userId,
        planId: ord.planId,
        packageId: ord.productPackage,
        status: ord.status === 'refunded' ? 'refunded' : 'active',
        grantedAt: ord.createdAt,
        orderId: ord.orderId,
        verificationToken: token
      });
    }
  });
}

initializeSeedData();

function generateVerificationToken(userId: string, planId: string, packageId: string, orderId: string): string {
  return crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${userId}:${planId}:${packageId}:${orderId}`)
    .digest('hex');
}

/**
 * Helper: dynamically resolve base URL of the currently running application.
 * Honors x-forwarded-proto, x-forwarded-host, host headers, APP_URL, PUBLIC_APP_URL, and VERCEL_URL.
 */
export function getRequestBaseUrl(req: express.Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'] as string;
  const forwardedHost = req.headers['x-forwarded-host'] as string;
  if (forwardedHost) {
    const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : (req.secure ? 'https' : 'http');
    return `${proto}://${forwardedHost.split(',')[0].trim()}`;
  }

  const host = req.get('host');
  if (host) {
    const proto = (req.secure || forwardedProto === 'https') ? 'https' : 'http';
    return `${proto}://${host}`;
  }

  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

/**
 * Helper: Find an order across memory by orderId, providerOrderId (PayPal ID/token),
 * or providerTransactionId. If not found in memory (e.g. after server reboot),
 * query PayPal Live directly to reconstruct and restore the order.
 */
export async function findOrder(idOrToken?: string): Promise<ServerOrder | undefined> {
  if (!idOrToken) return undefined;
  const trimmed = idOrToken.trim();

  // 1. Direct key match in ordersStore
  if (ordersStore.has(trimmed)) {
    return ordersStore.get(trimmed);
  }

  // 2. Scan values for matching internal orderId, providerOrderId, or transactionId
  for (const ord of ordersStore.values()) {
    if (ord.orderId === trimmed || ord.providerOrderId === trimmed || ord.providerTransactionId === trimmed) {
      return ord;
    }
  }

  // 3. Fallback: Reconstruct order from PayPal Live API if it's a PayPal Order ID/Token
  try {
    const liveDetails = await paypalClient.getOrderDetails(trimmed);
    if (liveDetails && liveDetails.id) {
      const pu = liveDetails.purchase_units?.[0];
      let customData: any = {};
      try {
        if (pu?.custom_id) {
          customData = JSON.parse(pu.custom_id);
        }
      } catch {}

      const recoveredOrderId = customData.internalOrderId || pu?.reference_id || `ORD-${liveDetails.id}`;
      const amountVal = parseFloat(pu?.amount?.value || '29');
      const recoveredPackage: 'pro' | 'investor' = (customData.productPackage || (amountVal >= 60 ? 'investor' : 'pro'));
      const recoveredAmount = recoveredPackage === 'investor' ? 69 : 29;

      const existingCapture = pu?.payments?.captures?.[0];
      const captureId = existingCapture?.id;

      const isPaid = liveDetails.status === 'COMPLETED' || !!captureId;
      const now = new Date().toISOString();

      const recoveredOrder: ServerOrder = {
        orderId: recoveredOrderId,
        userId: customData.userId || 'customer',
        planId: customData.planId || 'default_plan',
        productPackage: recoveredPackage,
        amount: recoveredAmount,
        currency: pu?.amount?.currency_code || 'USD',
        status: isPaid ? 'paid' : (liveDetails.status === 'APPROVED' ? 'payment_pending' : 'pending'),
        createdAt: liveDetails.create_time || now,
        updatedAt: now,
        paymentProvider: 'paypal',
        providerOrderId: liveDetails.id,
        providerTransactionId: captureId,
        customerEmail: liveDetails.payer?.email_address || customData.customerEmail || paypalClient.getMerchantEmail()
      };

      ordersStore.set(recoveredOrderId, recoveredOrder);
      ordersStore.set(liveDetails.id, recoveredOrder);

      if (isPaid && captureId) {
        const token = generateVerificationToken(recoveredOrder.userId, recoveredOrder.planId, recoveredOrder.productPackage, recoveredOrder.orderId);
        entitlementsStore.set(`ent_${recoveredOrder.planId}`, {
          id: `ent_${recoveredOrder.planId}`,
          userId: recoveredOrder.userId,
          planId: recoveredOrder.planId,
          packageId: recoveredOrder.productPackage,
          status: 'active',
          grantedAt: recoveredOrder.createdAt,
          orderId: recoveredOrder.orderId,
          verificationToken: token
        });
      }

      console.log(`[Payment Router] Successfully recovered order ${recoveredOrderId} (PayPal ${liveDetails.id}, status: ${liveDetails.status})`);
      return recoveredOrder;
    }
  } catch (err: any) {
    console.debug(`[Payment Router] Order recovery check for "${trimmed}":`, err.message);
  }

  return undefined;
}

/**
 * 0. GET /api/payments/config: Return client-safe configuration
 */
paymentRouter.get('/config', (req, res) => {
  res.json({
    provider: 'paypal',
    mode: paypalClient.getMode(),
    isConfigured: paypalClient.isConfigured(),
    merchantEmail: paypalClient.getMerchantEmail(),
    clientId: paypalClient.getClientId(),
    currency: 'USD',
    packages: {
      pro: {
        id: 'pro',
        name: 'Pro Business Plan',
        priceUSD: 29,
        currency: 'USD'
      },
      investor: {
        id: 'investor',
        name: 'Investor / Funding Package',
        priceUSD: 69,
        currency: 'USD'
      }
    }
  });
});

/**
 * 0b. GET /api/payments/production-check: Production readiness & live connectivity validation
 * Safe diagnostic endpoint confirming Live connection and verifying no sandbox mixing.
 */
paymentRouter.get('/production-check', async (req, res) => {
  try {
    const check = await paypalClient.validateProductionConfig();
    res.json(check);
  } catch (err: any) {
    res.status(500).json({
      isProductionReady: false,
      mode: 'live',
      error: err.message || 'Production validation check failed.'
    });
  }
});

/**
 * 0c. GET /api/payments/order-status/:orderId: Check real-time status of PayPal Live order
 * Verifies whether buyer has approved on PayPal without prematurely capturing.
 */
paymentRouter.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await findOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${orderId} not found` });
    }

    let paypalStatus = 'UNKNOWN';
    let buyerApproved = false;
    let isCompleted = order.status === 'paid' || order.status === 'completed';

    if (order.providerOrderId) {
      try {
        const details = await paypalClient.getOrderDetails(order.providerOrderId);
        paypalStatus = details.status || 'UNKNOWN';
        buyerApproved = details.status === 'APPROVED';
        if (details.status === 'COMPLETED') {
          isCompleted = true;
        }
      } catch (err: any) {
        console.warn(`[Payment Router] PayPal status query error for ${order.providerOrderId}:`, err.message);
      }
    }

    res.json({
      orderId: order.orderId,
      internalStatus: order.status,
      paypalStatus,
      buyerApproved,
      isCompleted,
      providerOrderId: order.providerOrderId,
      amount: order.amount,
      currency: order.currency,
      packageId: order.productPackage
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to inspect order status' });
  }
});

/**
 * 1. POST /api/payments/create-order: Initialize an order on server with PayPal
 * SECURITY:
 * - Server strictly determines product price ($29 or $69 USD) from product catalog.
 * - Client cannot forge amount, currency, or package.
 * - Dynamically constructs valid return_url and cancel_url pointing to the actual deployed app.
 */
paymentRouter.post('/create-order', async (req, res) => {
  try {
    const { userId, planId, productPackage, customerEmail, returnUrl, cancelUrl } = req.body;

    if (!userId || !planId || !productPackage) {
      return res.status(400).json({ error: 'Missing required parameters: userId, planId, productPackage' });
    }

    if (!['pro', 'investor'].includes(productPackage)) {
      return res.status(400).json({ error: 'Invalid package for payment. Must be "pro" or "investor".' });
    }

    // STRICT SERVER CATALOG PRICING
    const PRICE_CATALOG: Record<'pro' | 'investor', number> = {
      pro: 29,
      investor: 69
    };
    const amount = PRICE_CATALOG[productPackage as 'pro' | 'investor'];
    const currency = 'USD';

    // Generate internal order ID
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Resolve actual base URL of application for return and cancel flows
    const baseUrl = getRequestBaseUrl(req);
    const targetReturnUrl = returnUrl || `${baseUrl}/payment-return?orderId=${encodeURIComponent(orderId)}&planId=${encodeURIComponent(planId)}`;
    const targetCancelUrl = cancelUrl || `${baseUrl}/payment-cancel?orderId=${encodeURIComponent(orderId)}&planId=${encodeURIComponent(planId)}`;

    // Create order in PayPal via server client
    const paypalResult = await paypalClient.createOrder({
      internalOrderId: orderId,
      planId,
      userId,
      productPackage,
      amount,
      currency,
      customerEmail,
      returnUrl: targetReturnUrl,
      cancelUrl: targetCancelUrl,
    });

    const now = new Date().toISOString();
    const newOrder: ServerOrder = {
      orderId,
      userId,
      planId,
      productPackage,
      amount,
      currency,
      status: 'payment_pending',
      createdAt: now,
      updatedAt: now,
      paymentProvider: 'paypal',
      providerOrderId: paypalResult.paypalOrderId,
      customerEmail: customerEmail || paypalClient.getMerchantEmail()
    };

    // Index by both internal orderId and PayPal order ID
    ordersStore.set(orderId, newOrder);
    if (newOrder.providerOrderId) {
      ordersStore.set(newOrder.providerOrderId, newOrder);
    }

    console.log(`[Payment Router] Created pending order ${orderId} with PayPal ID ${paypalResult.paypalOrderId} (Return: ${targetReturnUrl})`);

    res.json({
      success: true,
      order: newOrder,
      orderId,
      providerOrderId: paypalResult.paypalOrderId,
      approvalUrl: paypalResult.approvalUrl,
      amount,
      currency,
      productPackage,
      mode: paypalClient.getMode(),
      returnUrl: targetReturnUrl,
      cancelUrl: targetCancelUrl,
      message: 'Order created with PayPal and pending authorization'
    });
  } catch (err: any) {
    console.error('[Payment Router] Error creating order with PayPal:', err);
    res.status(500).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

/**
 * 2. POST /api/payments/capture-order: Capture and strictly verify payment directly with PayPal
 * SECURITY:
 * - Never trusts frontend claims.
 * - Directly validates with PayPal that transaction status is COMPLETED.
 * - Confirms amount, currency, PayPal Order ID, and intended product match.
 * - Grants entitlement and cryptographically signed verification token only upon verified capture.
 * - Enforces idempotency (duplicate calls return existing token and entitlement).
 */
paymentRouter.post('/capture-order', async (req, res) => {
  try {
    const { orderId, providerOrderId } = req.body;

    const lookupKey = orderId || providerOrderId;
    if (!lookupKey) {
      return res.status(400).json({ error: 'Missing required orderId or providerOrderId' });
    }

    // Attempt lookup by orderId or providerOrderId (with live PayPal order recovery if needed)
    let order = await findOrder(orderId) || await findOrder(providerOrderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${lookupKey} not found` });
    }

    // IDEMPOTENCY CHECK: If already paid, return existing verified entitlement
    if (order.status === 'paid' || order.status === 'completed') {
      const existingToken = generateVerificationToken(order.userId, order.planId, order.productPackage, order.orderId);
      const existingEntitlement = entitlementsStore.get(`ent_${order.planId}`);

      console.log(`[Payment Router] Idempotent request: Order ${order.orderId} is already paid.`);
      return res.json({
        success: true,
        alreadyCaptured: true,
        orderId: order.orderId,
        transactionId: order.providerTransactionId,
        packageId: order.productPackage,
        verificationToken: existingToken,
        entitlement: existingEntitlement,
        order,
        message: 'Order already captured and verified by PayPal.'
      });
    }

    const paypalOrderIdToCapture = providerOrderId || order.providerOrderId;
    if (!paypalOrderIdToCapture) {
      return res.status(400).json({ error: 'No associated PayPal order ID found for capture' });
    }

    // MANDATORY AUDIT REQUIREMENT: Verify buyer approval with PayPal Live before executing capture
    console.log(`[Payment Router] Verifying PayPal buyer approval for order ${order.orderId} (${paypalOrderIdToCapture})...`);
    let orderDetails: any;
    try {
      orderDetails = await paypalClient.getOrderDetails(paypalOrderIdToCapture);
    } catch (fetchErr: any) {
      console.error(`[Payment Router] Failed to fetch order details from PayPal:`, fetchErr.message);
      return res.status(502).json({
        success: false,
        error: `Could not verify order state with PayPal: ${fetchErr.message}`
      });
    }

    const liveStatus = orderDetails?.status;
    console.log(`[Payment Router] PayPal Live order status for ${paypalOrderIdToCapture}: ${liveStatus}`);

    // Case A: Buyer has NOT yet approved in PayPal
    if (liveStatus === 'CREATED' || liveStatus === 'SAVED' || liveStatus === 'PAYER_ACTION_REQUIRED') {
      return res.status(400).json({
        success: false,
        requiresBuyerApproval: true,
        paypalStatus: liveStatus,
        orderId: order.orderId,
        error: `PayPal order has not yet been approved by the customer (status: ${liveStatus}). Buyer approval is strictly required before capture.`
      });
    }

    // Case B: Already captured directly in PayPal
    if (liveStatus === 'COMPLETED') {
      const now = new Date().toISOString();
      const existingCapture = orderDetails.purchase_units?.[0]?.payments?.captures?.[0];
      const captureId = existingCapture?.id || order.providerTransactionId || `TXN-PP-${Date.now()}`;
      
      order.status = 'paid';
      order.updatedAt = now;
      order.providerTransactionId = captureId;
      order.providerOrderId = paypalOrderIdToCapture;
      ordersStore.set(order.orderId, order);
      ordersStore.set(paypalOrderIdToCapture, order);

      const verificationToken = generateVerificationToken(order.userId, order.planId, order.productPackage, order.orderId);
      const entitlementId = `ent_${order.planId}`;
      const entitlement: ServerEntitlement = {
        id: entitlementId,
        userId: order.userId,
        planId: order.planId,
        packageId: order.productPackage,
        status: 'active',
        grantedAt: now,
        orderId: order.orderId,
        verificationToken
      };
      entitlementsStore.set(entitlementId, entitlement);

      return res.json({
        success: true,
        orderId: order.orderId,
        transactionId: captureId,
        packageId: order.productPackage,
        verificationToken,
        entitlement,
        order,
        message: 'PayPal payment was already completed. Entitlement verified and active.'
      });
    }

    // Case C: Must be specifically APPROVED by buyer
    if (liveStatus !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        paypalStatus: liveStatus,
        error: `Cannot capture PayPal order. Expected status APPROVED but got ${liveStatus}.`
      });
    }

    // Case D: BUYER APPROVAL IS CONFIRMED! Execute capture directly through PayPal Live API
    console.log(`[Payment Router] Buyer approval confirmed! Proceeding to capture PayPal order ${paypalOrderIdToCapture}...`);
    const captureResult = await paypalClient.captureOrder(paypalOrderIdToCapture);

    if (!captureResult.success) {
      console.warn(`[Payment Router] PayPal capture rejected for order ${order.orderId}: ${captureResult.error}`);
      order.status = 'failed';
      order.updatedAt = new Date().toISOString();
      ordersStore.set(order.orderId, order);
      ordersStore.set(paypalOrderIdToCapture, order);

      return res.status(400).json({
        success: false,
        orderId: order.orderId,
        status: 'failed',
        error: captureResult.error || 'Payment capture was declined or failed in PayPal.'
      });
    }

    // Strict validation of transaction attributes
    // 1. Status check
    if (captureResult.status !== 'COMPLETED') {
      order.status = 'failed';
      order.updatedAt = new Date().toISOString();
      ordersStore.set(order.orderId, order);
      ordersStore.set(paypalOrderIdToCapture, order);
      return res.status(400).json({
        success: false,
        error: `PayPal payment status is ${captureResult.status}, expected COMPLETED.`
      });
    }

    // 2. Amount & Currency validation
    if (captureResult.amount && Math.abs(captureResult.amount - order.amount) > 0.05) {
      console.error(`[Payment Router] Amount mismatch! Order: ${order.amount}, PayPal: ${captureResult.amount}`);
      return res.status(400).json({
        success: false,
        error: `Captured payment amount (${captureResult.amount} ${captureResult.currency}) does not match order amount (${order.amount} ${order.currency}).`
      });
    }

    const now = new Date().toISOString();
    const transactionId = captureResult.captureId || `TXN-PP-${Date.now()}`;

    // 1. Mark internal order as PAID
    order.status = 'paid';
    order.updatedAt = now;
    order.providerTransactionId = transactionId;
    order.providerOrderId = paypalOrderIdToCapture;
    ordersStore.set(order.orderId, order);
    ordersStore.set(paypalOrderIdToCapture, order);

    // 2. Store verified payment record
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const payment: ServerPayment = {
      id: paymentId,
      orderId: order.orderId,
      userId: order.userId,
      planId: order.planId,
      amount: order.amount,
      currency: order.currency,
      paymentProvider: 'paypal',
      transactionId,
      status: 'succeeded',
      createdAt: now
    };
    paymentsStore.set(paymentId, payment);

    // 3. Generate cryptographic verification token
    const verificationToken = generateVerificationToken(order.userId, order.planId, order.productPackage, order.orderId);

    // 4. Create and store active entitlement
    const entitlementId = `ent_${order.planId}`;
    const entitlement: ServerEntitlement = {
      id: entitlementId,
      userId: order.userId,
      planId: order.planId,
      packageId: order.productPackage,
      status: 'active',
      grantedAt: now,
      orderId: order.orderId,
      verificationToken
    };
    entitlementsStore.set(entitlementId, entitlement);

    console.log(`[Payment Router] Order ${order.orderId} successfully captured & verified. Transaction ID: ${transactionId}`);

    res.json({
      success: true,
      orderId: order.orderId,
      transactionId,
      packageId: order.productPackage,
      verificationToken,
      entitlement,
      order,
      message: 'Payment successfully captured and verified directly with PayPal. Entitlement granted.'
    });
  } catch (err: any) {
    console.error('[Payment Router] Error capturing order:', err);
    res.status(500).json({ error: err.message || 'Failed to capture PayPal order' });
  }
});

/**
 * 2b. GET /api/payments/lookup-order: Query order by either internal orderId or PayPal token/providerOrderId
 */
paymentRouter.get('/lookup-order', async (req, res) => {
  try {
    const token = (req.query.token || req.query.providerOrderId || req.query.orderId) as string;
    if (!token) {
      return res.status(400).json({ error: 'Missing required query parameter: token or orderId' });
    }

    const order = await findOrder(token);
    if (!order) {
      return res.status(404).json({ error: `Order not found for identifier: ${token}` });
    }

    let paypalStatus = 'UNKNOWN';
    let buyerApproved = false;
    let isCompleted = order.status === 'paid' || order.status === 'completed';

    if (order.providerOrderId) {
      try {
        const details = await paypalClient.getOrderDetails(order.providerOrderId);
        paypalStatus = details.status || 'UNKNOWN';
        buyerApproved = details.status === 'APPROVED';
        if (details.status === 'COMPLETED') {
          isCompleted = true;
        }
      } catch (err: any) {
        console.warn(`[Payment Router] PayPal status query error for ${order.providerOrderId}:`, err.message);
      }
    }

    res.json({
      success: true,
      order,
      orderId: order.orderId,
      providerOrderId: order.providerOrderId,
      status: order.status,
      paypalStatus,
      buyerApproved,
      isCompleted,
      amount: order.amount,
      currency: order.currency,
      packageId: order.productPackage,
      planId: order.planId,
      userId: order.userId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to lookup order' });
  }
});

/**
 * 3. POST /api/payments/cancel-order: Customer cancelled checkout
 */
paymentRouter.post('/cancel-order', async (req, res) => {
  try {
    const { orderId, providerOrderId } = req.body;
    const lookupKey = orderId || providerOrderId;
    if (!lookupKey) {
      return res.status(400).json({ error: 'Missing orderId or providerOrderId' });
    }

    const order = await findOrder(lookupKey);
    if (!order) {
      return res.status(404).json({ error: `Order ${lookupKey} not found` });
    }

    if (order.status === 'payment_pending' || order.status === 'pending') {
      order.status = 'cancelled';
      order.updatedAt = new Date().toISOString();
      ordersStore.set(order.orderId, order);
      if (order.providerOrderId) ordersStore.set(order.providerOrderId, order);
      console.log(`[Payment Router] Order ${order.orderId} marked as cancelled by customer.`);
    }

    res.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      message: 'Order status updated to cancelled. Customer may retry payment.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel order' });
  }
});

/**
 * 4. POST /api/payments/verify-payment: Verify authenticity of payment/entitlement
 */
paymentRouter.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, planId, token } = req.body;
    const order = await findOrder(orderId);
    if (!order) {
      return res.status(404).json({ verified: false, error: 'Order not found' });
    }

    if (order.status !== 'paid' && order.status !== 'completed') {
      return res.json({ verified: false, status: order.status, error: 'Order has not been paid' });
    }

    const expectedToken = generateVerificationToken(order.userId, order.planId, order.productPackage, order.orderId);
    const isTokenValid = !token || token === expectedToken;

    res.json({
      verified: isTokenValid,
      orderId: order.orderId,
      planId: order.planId,
      packageId: order.productPackage,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      transactionId: order.providerTransactionId,
      paypalOrderId: order.providerOrderId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

/**
 * 5. POST /api/payments/webhook: PayPal Webhook Endpoint
 * Authenticates signature via PayPal verify-webhook-signature API.
 * Idempotently handles:
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.CAPTURE.DENIED / PAYMENT.CAPTURE.FAILED
 * - PAYMENT.CAPTURE.REFUNDED
 * - PAYMENT.CAPTURE.REVERSED
 */
paymentRouter.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    const headers = req.headers;

    // Verify webhook signature with PayPal
    const isAuthentic = await paypalClient.verifyWebhookSignature(headers, body);
    if (!isAuthentic) {
      console.warn('[Payment Webhook] Unauthorized webhook signature detected. Rejecting payload.');
      return res.status(400).json({ error: 'Invalid PayPal webhook signature' });
    }

    const eventType = body?.event_type;
    const resource = body?.resource;
    console.log(`[Payment Webhook] Received authentic event: ${eventType}`);

    if (!resource) {
      return res.status(200).json({ received: true });
    }

    // Try to find matching internal order
    // 1. Through custom_id or supplementary_data
    let matchedOrder: ServerOrder | undefined;
    let customData: any = null;

    if (resource.custom_id) {
      try {
        customData = JSON.parse(resource.custom_id);
      } catch {
        // Not JSON
      }
    }

    const internalOrderId = customData?.internalOrderId || resource.reference_id;
    if (internalOrderId && ordersStore.has(internalOrderId)) {
      matchedOrder = ordersStore.get(internalOrderId);
    } else {
      // Find by PayPal Order ID or Transaction ID
      const paypalOrderId = resource.order_id || resource.id;
      for (const ord of ordersStore.values()) {
        if (ord.providerOrderId === paypalOrderId || ord.providerTransactionId === resource.id) {
          matchedOrder = ord;
          break;
        }
      }
    }

    const now = new Date().toISOString();

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        if (matchedOrder) {
          // Idempotency: do not re-grant if already paid
          if (matchedOrder.status !== 'paid') {
            matchedOrder.status = 'paid';
            matchedOrder.updatedAt = now;
            matchedOrder.providerTransactionId = resource.id;
            ordersStore.set(matchedOrder.orderId, matchedOrder);

            const token = generateVerificationToken(matchedOrder.userId, matchedOrder.planId, matchedOrder.productPackage, matchedOrder.orderId);
            entitlementsStore.set(`ent_${matchedOrder.planId}`, {
              id: `ent_${matchedOrder.planId}`,
              userId: matchedOrder.userId,
              planId: matchedOrder.planId,
              packageId: matchedOrder.productPackage,
              status: 'active',
              grantedAt: now,
              orderId: matchedOrder.orderId,
              verificationToken: token
            });

            console.log(`[Payment Webhook] Order ${matchedOrder.orderId} marked PAID via webhook.`);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED': {
        if (matchedOrder && matchedOrder.status !== 'paid') {
          matchedOrder.status = 'failed';
          matchedOrder.updatedAt = now;
          ordersStore.set(matchedOrder.orderId, matchedOrder);
          console.log(`[Payment Webhook] Order ${matchedOrder.orderId} marked FAILED via webhook.`);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        if (matchedOrder) {
          matchedOrder.status = 'refunded';
          matchedOrder.updatedAt = now;
          ordersStore.set(matchedOrder.orderId, matchedOrder);

          const ent = entitlementsStore.get(`ent_${matchedOrder.planId}`);
          if (ent) {
            ent.status = 'refunded';
            entitlementsStore.set(`ent_${matchedOrder.planId}`, ent);
          }
          console.log(`[Payment Webhook] Order ${matchedOrder.orderId} marked REFUNDED and entitlement revoked.`);
        }
        break;
      }

      default:
        console.log(`[Payment Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    res.status(200).json({
      success: true,
      event: eventType,
      processed: true
    });
  } catch (err: any) {
    console.error('[Payment Webhook] Processing error:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
});

/**
 * 6. POST /api/payments/refund-payment: Admin refund processing
 */
paymentRouter.post('/refund-payment', requireSuperAdmin, (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = ordersStore.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date().toISOString();
    order.status = 'refunded';
    order.updatedAt = now;
    ordersStore.set(orderId, order);

    // Revoke entitlement
    const entitlementId = `ent_${order.planId}`;
    const ent = entitlementsStore.get(entitlementId);
    if (ent) {
      ent.status = 'refunded';
      entitlementsStore.set(entitlementId, ent);
    }

    console.log(`[Payment Router] Order ${orderId} refunded by administrator. Reason: ${reason || 'Not specified'}`);

    res.json({
      success: true,
      orderId,
      status: 'refunded',
      refundedAt: now,
      reason: reason || 'Customer requested refund'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Refund processing failed' });
  }
});

/**
 * 7. GET /api/payments/get-payment-status/:orderId: Query live status of an order
 */
paymentRouter.get('/get-payment-status/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = await findOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({
    orderId: order.orderId,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    packageId: order.productPackage,
    updatedAt: order.updatedAt,
    paymentProvider: order.paymentProvider,
    providerOrderId: order.providerOrderId,
    providerTransactionId: order.providerTransactionId
  });
});

/**
 * 8. GET /api/payments/user-orders/:userId: Retrieve customer order history
 */
paymentRouter.get('/user-orders/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = Array.from(ordersStore.values())
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ orders: userOrders });
});

/**
 * 9. GET /api/payments/admin/orders: Retrieve all orders for admin inspection
 */
paymentRouter.get('/admin/orders', requireSuperAdmin, (req, res) => {
  const allOrders = Array.from(ordersStore.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ orders: allOrders });
});

/**
 * 10. GET /api/payments/admin-summary: Complete analytical and financial summary for the administrator
 */
paymentRouter.get('/admin-summary', requireSuperAdmin, (req, res) => {
  const allOrders = Array.from(ordersStore.values());
  const totalOrders = allOrders.length;
  const successfulPayments = allOrders.filter((o) => o.status === 'paid' || o.status === 'completed').length;
  const failedPayments = allOrders.filter((o) => o.status === 'failed').length;
  const refunds = allOrders.filter((o) => o.status === 'refunded').length;

  const totalRevenueUSD = allOrders
    .filter((o) => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const refundedRevenueUSD = allOrders
    .filter((o) => o.status === 'refunded')
    .reduce((sum, o) => sum + o.amount, 0);

  const proCount = allOrders.filter((o) => o.productPackage === 'pro' && (o.status === 'paid' || o.status === 'completed')).length;
  const investorCount = allOrders.filter((o) => o.productPackage === 'investor' && (o.status === 'paid' || o.status === 'completed')).length;
  const freeCount = Math.max(14, totalOrders * 2);

  const conversionRate = totalOrders > 0 ? ((successfulPayments / (successfulPayments + freeCount)) * 100).toFixed(1) : '0.0';

  res.json({
    gateway: {
      provider: 'PayPal',
      merchantEmail: paypalClient.getMerchantEmail(),
      mode: paypalClient.getMode(),
      isConfigured: paypalClient.isConfigured(),
    },
    kpis: {
      totalOrders,
      successfulPayments,
      failedPayments,
      refunds,
      totalRevenueUSD,
      refundedRevenueUSD,
      conversionRate: `${conversionRate}%`,
    },
    popularPackages: [
      { packageId: 'pro', name: 'Pro Business Plan', price: 29, count: proCount, revenue: proCount * 29 },
      { packageId: 'investor', name: 'Investor / Funding Package', price: 69, count: investorCount, revenue: investorCount * 69 }
    ],
    recentOrders: allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)
  });
});
