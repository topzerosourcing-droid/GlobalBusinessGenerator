import { OrderRecord, PaymentRecord, PlanPackageId } from '../types';
import { auth } from '../lib/firebase';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface PayPalOrderRequest {
  planId: string;
  userId: string;
  userEmail?: string;
  amount: number;
  currency: string;
}

export interface CreateOrderRequest {
  userId: string;
  planId: string;
  productPackage: 'free' | 'pro' | 'investor';
  amount?: number;
  currency?: string;
  customerEmail?: string;
  paymentProvider?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  providerOrderId?: string;
  approvalUrl?: string;
  amount?: number;
  currency?: string;
  productPackage?: string;
  mode?: string;
  message?: string;
  order?: any;
}

export interface CaptureOrderResponse {
  success: boolean;
  orderId: string;
  transactionId?: string;
  packageId?: 'free' | 'pro' | 'investor';
  verificationToken?: string;
  entitlement?: any;
  order?: any;
  message?: string;
  alreadyCaptured?: boolean;
  error?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  orderId?: string;
  planId?: string;
  packageId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  paypalOrderId?: string;
  error?: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  orderId: string;
  status: string;
  refundedAt?: string;
  reason?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: string;
  amount?: number;
  currency?: string;
  packageId?: string;
  updatedAt?: string;
  paymentProvider?: string;
  providerOrderId?: string;
  providerTransactionId?: string;
  error?: string;
}

export interface GatewayConfigResponse {
  provider: string;
  mode: 'live';
  isConfigured: boolean;
  merchantEmail: string;
  clientId?: string;
  currency: string;
  packages: {
    pro: { id: string; name: string; priceUSD: number; currency: string };
    investor: { id: string; name: string; priceUSD: number; currency: string };
  };
}

export interface PaymentGatewayAdapter {
  getGatewayName(): string;
  isReady(): boolean;
  getConfig(): Promise<GatewayConfigResponse>;
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse>;
  captureOrder(orderId: string, providerOrderId?: string): Promise<CaptureOrderResponse>;
  cancelOrder(orderId: string): Promise<{ success: boolean; orderId: string; status: string }>;
  verifyPayment(orderId: string, planId?: string, token?: string): Promise<VerifyPaymentResponse>;
  refundPayment(orderId: string, reason?: string): Promise<RefundPaymentResponse>;
  getPaymentStatus(orderId: string): Promise<PaymentStatusResponse>;
  checkOrderStatus(orderId: string): Promise<any>;
  getUserOrders(userId: string): Promise<OrderRecord[]>;
  getAllOrdersAdmin(): Promise<OrderRecord[]>;
  getAdminSummary(): Promise<any>;
  createSubscriptionOrder(request: PayPalOrderRequest): Promise<{ orderId: string; approvalUrl?: string }>;
}

/**
 * Modular Production-Ready PayPal Gateway Adapter
 * Implements PaymentGatewayAdapter contract with secure server-side routes:
 * - Server creates PayPal order with payee email topogabolekwe@gmail.com
 * - Captures & verifies with PayPal before granting plan entitlement
 * - Never trusts client price or frontend authorization claims
 */
class PayPalGatewayAdapterImpl implements PaymentGatewayAdapter {
  private configCache: GatewayConfigResponse | null = null;

  getGatewayName(): string {
    return 'PayPal';
  }

  isReady(): boolean {
    return true;
  }

  async getConfig(): Promise<GatewayConfigResponse> {
    if (this.configCache) {
      return this.configCache;
    }
    const defaultClientId =
      (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID ||
      'BAA91Azu3vaFjziWsSm5T7NSX5wJnThiLhaxYjTEj2AeXwNM1rczvO877jESgNhqvjOmycY3eulrZpJTXw';

    try {
      let response = await fetch('/api/payments/config');
      if (!response.ok && response.status === 404) {
        response = await fetch('/api/paypal/config');
      }
      if (!response.ok) throw new Error(`Failed to load payment config: ${response.status}`);
      const data = await response.json();
      if (!data.clientId) {
        data.clientId = defaultClientId;
      }
      this.configCache = data;
      return data;
    } catch (err) {
      console.warn('[PaymentService] Using default PayPal Live configuration fallback:', err);
      // Default live configuration fallback (safe client-side metadata)
      const fallbackConfig: GatewayConfigResponse = {
        provider: 'paypal',
        mode: 'live',
        isConfigured: true,
        merchantEmail: 'topogabolekwe@gmail.com',
        clientId: defaultClientId,
        currency: 'USD',
        packages: {
          pro: { id: 'pro', name: 'Pro Business Plan', priceUSD: 29, currency: 'USD' },
          investor: { id: 'investor', name: 'Investor / Funding Package', priceUSD: 69, currency: 'USD' }
        }
      };
      this.configCache = fallbackConfig;
      return fallbackConfig;
    }
  }

  /**
   * 1. createOrder: Server creates pending order with PayPal
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const payload: CreateOrderRequest = {
        ...request,
        returnUrl: request.returnUrl || (origin ? `${origin}/payment-return` : undefined),
        cancelUrl: request.cancelUrl || (origin ? `${origin}/payment-cancel` : undefined),
      };

      let response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // If 404 on /api/payments, try /api/paypal/create-order or /api/create-order
      if (response.status === 404) {
        console.warn('[PaymentService] /api/payments/create-order returned 404, attempting fallback route /api/paypal/create-order...');
        response = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.status === 404) {
        response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      console.error('[PaymentService] Error creating PayPal order:', err);
      throw err;
    }
  }

  /**
   * 2. captureOrder: Server captures and strictly verifies payment directly with PayPal
   */
  async captureOrder(orderId: string, providerOrderId?: string): Promise<CaptureOrderResponse> {
    try {
      const effectiveOrderId = orderId || providerOrderId || '';
      const response = await fetch('/api/payments/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: effectiveOrderId, providerOrderId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Payment capture failed with status ${response.status}`);
      }
      return data;
    } catch (err: any) {
      console.error('[PaymentService] PayPal Order capture failed:', err);
      return {
        success: false,
        orderId,
        error: err.message || 'Payment capture failed on server'
      };
    }
  }

  /**
   * 2b. lookupOrder: Query order details by either internal orderId or PayPal token/providerOrderId
   */
  async lookupOrder(tokenOrOrderId: string): Promise<any> {
    try {
      const response = await fetch(`/api/payments/lookup-order?token=${encodeURIComponent(tokenOrOrderId)}`);
      if (!response.ok) {
        // Fallback to get-payment-status
        const fallback = await fetch(`/api/payments/get-payment-status/${encodeURIComponent(tokenOrOrderId)}`);
        if (fallback.ok) return await fallback.json();
        return null;
      }
      return await response.json();
    } catch (err: any) {
      console.warn('[PaymentService] lookupOrder failed:', err);
      return null;
    }
  }

  /**
   * 3. cancelOrder: Notify server customer cancelled checkout
   */
  async cancelOrder(orderId: string, providerOrderId?: string): Promise<{ success: boolean; orderId: string; status: string }> {
    try {
      const response = await fetch('/api/payments/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, providerOrderId }),
      });
      return await response.json();
    } catch (err: any) {
      return { success: false, orderId, status: 'failed' };
    }
  }

  /**
   * 4. verifyPayment: Verify payment cryptographic validity on server
   */
  async verifyPayment(orderId: string, planId?: string, token?: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, planId, token }),
      });
      return await response.json();
    } catch (err: any) {
      return {
        verified: false,
        orderId,
        error: err.message
      };
    }
  }

  /**
   * 5. refundPayment: Admin refund processing
   */
  async refundPayment(orderId: string, reason?: string, adminEmail?: string): Promise<RefundPaymentResponse> {
    try {
      const email = adminEmail || auth.currentUser?.email || '';
      const response = await fetch('/api/payments/refund-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': email,
          'x-user-role': 'SUPER_ADMIN'
        },
        body: JSON.stringify({ orderId, reason }),
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        orderId,
        status: 'failed',
        error: err.message
      };
    }
  }

  /**
   * 6. getPaymentStatus: Live status query
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`/api/payments/get-payment-status/${orderId}`);
      return await response.json();
    } catch (err: any) {
      return {
        orderId,
        status: 'unknown',
        error: err.message
      };
    }
  }

  /**
   * 6b. checkOrderStatus: Live real-time query of PayPal order status
   * Verifies buyer approval without prematurely capturing funds.
   */
  async checkOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`/api/payments/order-status/${encodeURIComponent(orderId)}`);
      return await response.json();
    } catch (err: any) {
      return {
        orderId,
        internalStatus: 'unknown',
        paypalStatus: 'UNKNOWN',
        buyerApproved: false,
        error: err.message
      };
    }
  }

  /**
   * 7. getUserOrders: Retrieve order history for a customer
   */
  async getUserOrders(userId: string): Promise<OrderRecord[]> {
    try {
      const response = await fetch(`/api/payments/user-orders/${userId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.orders || [];
    } catch {
      return [];
    }
  }

  /**
   * 8. getAllOrdersAdmin: Retrieve all orders for admin inspection
   */
  async getAllOrdersAdmin(adminEmail?: string): Promise<OrderRecord[]> {
    try {
      const email = adminEmail || auth.currentUser?.email || '';
      const response = await fetch('/api/payments/admin/orders', {
        headers: {
          'x-user-email': email,
          'x-user-role': 'SUPER_ADMIN'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.orders || [];
    } catch {
      return [];
    }
  }

  /**
   * 9. getAdminSummary: Revenue, KPIs, and gateway status
   */
  async getAdminSummary(adminEmail?: string): Promise<any> {
    try {
      const email = adminEmail || auth.currentUser?.email || '';
      const response = await fetch('/api/payments/admin-summary', {
        headers: {
          'x-user-email': email,
          'x-user-role': 'SUPER_ADMIN'
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Backward compatibility for subscription order requests
   */
  async createSubscriptionOrder(request: PayPalOrderRequest): Promise<{ orderId: string; approvalUrl?: string }> {
    const pkg = request.planId === 'enterprise' ? 'investor' : (request.planId as any);
    const res = await this.createOrder({
      userId: request.userId,
      planId: request.planId,
      productPackage: pkg === 'pro' || pkg === 'investor' ? pkg : 'pro',
      amount: request.amount,
      currency: request.currency,
      customerEmail: request.userEmail
    });
    return {
      orderId: res.orderId,
      approvalUrl: res.approvalUrl
    };
  }
}

export const paymentGateway = new PayPalGatewayAdapterImpl();
export const paymentService = paymentGateway;

export const FEATURE_PERMISSIONS = {
  EXPORT_PDF: ['pro', 'enterprise'],
  EXPORT_DOCX: ['pro', 'enterprise'],
  UNLIMITED_PLANS: ['pro', 'enterprise'],
  FINANCIAL_FORECAST_DEEP: ['pro', 'enterprise'],
  CUSTOM_BRANDING: ['enterprise'],
} as const;

export const hasFeaturePermission = (
  userTier: SubscriptionTier = 'free', 
  feature: keyof typeof FEATURE_PERMISSIONS
): boolean => {
  const allowedTiers = FEATURE_PERMISSIONS[feature] as readonly string[];
  return allowedTiers.includes(userTier);
};
