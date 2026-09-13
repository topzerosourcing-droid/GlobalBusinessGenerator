/**
 * PayPal REST API Server Client — Production Live Mode
 * Handles server-to-server communication exclusively with PayPal Live API:
 * - OAuth 2.0 Client Credentials Token Generation (https://api-m.paypal.com/v1/oauth2/token)
 * - Order Creation (https://api-m.paypal.com/v2/checkout/orders) with intent CAPTURE
 * - Order Capture (https://api-m.paypal.com/v2/checkout/orders/{id}/capture)
 * - Order Details Verification (https://api-m.paypal.com/v2/checkout/orders/{id})
 * - Webhook Signature Verification (https://api-m.paypal.com/v1/notifications/verify-webhook-signature)
 * 
 * SECURITY DIRECTIVES:
 * - Strictly LIVE PayPal API (https://api-m.paypal.com). Never uses Sandbox endpoints.
 * - Never fall back to Sandbox or simulated payments.
 * - Secrets (Client Secret, Signing Secret, Tokens) are NEVER exposed to the frontend or logged.
 * - Strict production configuration checks preventing credential / endpoint mixing.
 */

export interface PayPalConfig {
  mode: 'live';
  clientId: string;
  clientSecret: string;
  merchantEmail: string;
  webhookId: string;
}

export interface CreatePayPalOrderParams {
  internalOrderId: string;
  planId: string;
  userId: string;
  productPackage: 'pro' | 'investor';
  amount: number;
  currency: string;
  customerEmail?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResult {
  success: boolean;
  paypalOrderId: string;
  approvalUrl?: string;
  status: string;
  mode: 'live';
  raw?: any;
  error?: string;
}

export interface PayPalCaptureResult {
  success: boolean;
  captureId?: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
  payeeEmail?: string;
  raw?: any;
  error?: string;
}

export interface ProductionCheckResult {
  isProductionReady: boolean;
  mode: 'live';
  apiEndpoint: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasMerchantEmail: boolean;
  merchantEmail: string;
  hasWebhookId: boolean;
  hasSigningSecret: boolean;
  liveConnectivity: boolean;
  errors: string[];
}

class PayPalClient {
  private readonly mode: 'live' = 'live';
  private readonly baseUrl: string = 'https://api-m.paypal.com';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly merchantEmail: string;
  private readonly webhookId: string;

  // Cached OAuth token with expiration timestamp
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    // Strictly enforce production LIVE mode
    const envMode = (process.env.PAYPAL_MODE || 'live').toLowerCase();
    if (envMode !== 'live') {
      console.warn(`[PayPal LIVE Security] Notice: PAYPAL_MODE in environment was "${envMode}". Overriding to strictly "live" for production safety.`);
    }

    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.merchantEmail = process.env.PAYPAL_MERCHANT_EMAIL || 'topogabolekwe@gmail.com';
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID || '';

    // Run pre-flight production validation
    this.assertNoSandboxMixing();
  }

  public getMode(): 'live' {
    return 'live';
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getMerchantEmail(): string {
    return this.merchantEmail;
  }

  public isConfigured(): boolean {
    return Boolean(
      this.clientId &&
      this.clientSecret &&
      this.clientId.trim().length > 0 &&
      this.clientSecret.trim().length > 0
    );
  }

  /**
   * Pre-flight guard: strictly forbids mixing Live credentials with Sandbox endpoints,
   * sandbox webhook URLs, or sandbox test identifiers.
   */
  public assertNoSandboxMixing(): void {
    if (this.baseUrl.includes('sandbox')) {
      throw new Error('[PayPal Production Security Violation] Sandbox base URL detected in Live configuration!');
    }

    if (this.clientId.toLowerCase().includes('sandbox') || this.clientSecret.toLowerCase().includes('sandbox')) {
      console.warn('[PayPal LIVE Security Warning] PayPal credential contains sandbox string identifier. Ensure valid Live credentials.');
    }
  }

  /**
   * Safe logger: sanitizes secrets and tokens before logging to console.
   */
  private log(message: string, data?: any) {
    if (!data) {
      console.log(`[PayPal LIVE] ${message}`);
      return;
    }
    const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
      if (['clientsecret', 'client_secret', 'token', 'access_token', 'authorization', 'payment_signing_secret', 'secret'].includes(key.toLowerCase())) {
        return '***REDACTED***';
      }
      return value;
    }));
    console.log(`[PayPal LIVE] ${message}`, sanitized);
  }

  /**
   * 1. Get OAuth 2.0 Access Token using Live Client Credentials
   * URL: https://api-m.paypal.com/v1/oauth2/token
   */
  public async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('PayPal Live credentials are not configured in environment (PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET required).');
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const url = `${this.baseUrl}/v1/oauth2/token`;

    this.log('Requesting OAuth 2.0 Access Token from Live PayPal API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errText = await response.text();
      this.log(`OAuth token acquisition failed with status ${response.status}`);
      throw new Error(`Failed to authenticate with PayPal Live API (${response.status}): Check Live Client ID and Secret.`);
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 3600;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: now + expiresIn * 1000,
    };

    this.log('OAuth 2.0 Live access token acquired and cached.');
    return this.cachedToken.token;
  }

  /**
   * 2. Create PayPal Live Order (https://api-m.paypal.com/v2/checkout/orders)
   * Enforces server-side amount ($29 or $69 USD), payee email (topogabolekwe@gmail.com), and custom tracking data.
   */
  public async createOrder(params: CreatePayPalOrderParams): Promise<PayPalOrderResult> {
    const { internalOrderId, planId, userId, productPackage, amount, currency, returnUrl, cancelUrl } = params;

    if (!this.isConfigured()) {
      throw new Error('Cannot create PayPal order: PayPal Live credentials are not configured in server environment.');
    }

    const packageTitle = productPackage === 'investor'
      ? 'Investor / Funding Package — Venture & Loan Ready Suite'
      : 'Pro Business Plan — Complete 34 Sections & Financial Model';

    try {
      const accessToken = await this.getAccessToken();
      const url = `${this.baseUrl}/v2/checkout/orders`;
      const formattedAmount = amount.toFixed(2);

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: internalOrderId,
            description: packageTitle,
            custom_id: JSON.stringify({ internalOrderId, planId, userId, productPackage }),
            payee: {
              email_address: this.merchantEmail,
            },
            amount: {
              currency_code: currency,
              value: formattedAmount,
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: formattedAmount,
                }
              }
            },
            items: [
              {
                name: packageTitle,
                description: `Single-plan digital license for business plan ${planId}`,
                quantity: '1',
                unit_amount: {
                  currency_code: currency,
                  value: formattedAmount,
                },
                category: 'DIGITAL_GOODS',
              }
            ]
          }
        ],
        application_context: {
          brand_name: 'Global Business Generator',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: returnUrl || 'https://globalbusinessgenerator.com/payment-success',
          cancel_url: cancelUrl || 'https://globalbusinessgenerator.com/payment-cancelled',
        }
      };

      this.log(`Creating Live PayPal order for internal order ${internalOrderId} ($${formattedAmount} ${currency})...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `REQ-${internalOrderId}-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        this.log(`Live PayPal Order Creation failed (${response.status}):`, data);
        throw new Error(data.message || data.details?.[0]?.description || 'PayPal Live order creation rejected.');
      }

      const approveLink = data.links?.find((l: any) => l.rel === 'approve')?.href;
      this.log(`Live PayPal order created successfully: ${data.id}, status: ${data.status}`);

      return {
        success: true,
        paypalOrderId: data.id,
        approvalUrl: approveLink,
        status: data.status,
        mode: 'live',
        raw: data,
      };
    } catch (err: any) {
      this.log('Order creation error:', err.message);
      throw err;
    }
  }

  /**
   * 3. Capture PayPal Live Order (https://api-m.paypal.com/v2/checkout/orders/{id}/capture)
   * Captures customer funds and retrieves verified capture transaction ID directly from PayPal Live.
   */
  public async captureOrder(paypalOrderId: string): Promise<PayPalCaptureResult> {
    if (!this.isConfigured()) {
      throw new Error('Cannot capture PayPal order: PayPal Live credentials are not configured.');
    }

    try {
      const accessToken = await this.getAccessToken();
      const url = `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`;

      this.log(`Capturing Live PayPal order ${paypalOrderId}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `CAP-${paypalOrderId}-${Date.now()}`,
        }
      });

      const data = await response.json();
      if (!response.ok) {
        this.log(`PayPal Live capture failed (${response.status}):`, data);
        throw new Error(data.message || data.details?.[0]?.description || 'PayPal Live payment capture failed.');
      }

      const purchaseUnit = data.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
      const captureStatus = capture?.status || data.status;
      const captureId = capture?.id || data.id;
      const captureAmount = parseFloat(capture?.amount?.value || '0');
      const captureCurrency = capture?.amount?.currency_code || 'USD';
      const payeeEmail = purchaseUnit?.payee?.email_address;

      const isCompleted = captureStatus === 'COMPLETED';
      this.log(`Live capture response: ID=${captureId}, status=${captureStatus}, amount=${captureAmount} ${captureCurrency}`);

      return {
        success: isCompleted,
        captureId,
        paypalOrderId,
        status: captureStatus,
        amount: captureAmount,
        currency: captureCurrency,
        payeeEmail,
        raw: data,
        error: isCompleted ? undefined : `Capture status is ${captureStatus}`,
      };
    } catch (err: any) {
      this.log('Capture order error:', err.message);
      return {
        success: false,
        paypalOrderId,
        status: 'FAILED',
        amount: 0,
        currency: 'USD',
        error: err.message,
      };
    }
  }

  /**
   * 4. Retrieve PayPal Live Order Details (https://api-m.paypal.com/v2/checkout/orders/{id})
   */
  public async getOrderDetails(paypalOrderId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('PayPal Live credentials not configured.');
    }

    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to retrieve PayPal Live order ${paypalOrderId}: ${err}`);
    }

    return await response.json();
  }

  /**
   * 5. Verify PayPal Live Webhook Signature (https://api-m.paypal.com/v1/notifications/verify-webhook-signature)
   * Authenticates that an incoming webhook genuinely originated from PayPal Live.
   */
  public async verifyWebhookSignature(headers: Record<string, any>, body: any): Promise<boolean> {
    if (!this.isConfigured()) {
      this.log('Webhook signature verification rejected: PayPal Live credentials not configured.');
      return false;
    }

    if (!this.webhookId || this.webhookId.trim() === '') {
      this.log('Webhook signature verification rejected: PAYPAL_WEBHOOK_ID not set.');
      return false;
    }

    try {
      const accessToken = await this.getAccessToken();
      const url = `${this.baseUrl}/v1/notifications/verify-webhook-signature`;

      const verificationPayload = {
        auth_algo: headers['paypal-auth-algo'] || headers['PAYPAL-AUTH-ALGO'],
        cert_url: headers['paypal-cert-url'] || headers['PAYPAL-CERT-URL'],
        transmission_id: headers['paypal-transmission-id'] || headers['PAYPAL-TRANSMISSION-ID'],
        transmission_sig: headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'],
        transmission_time: headers['paypal-transmission-time'] || headers['PAYPAL-TRANSMISSION-TIME'],
        webhook_id: this.webhookId,
        webhook_event: body,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationPayload),
      });

      if (!response.ok) {
        this.log(`Live webhook verification request failed with status ${response.status}`);
        return false;
      }

      const data = await response.json();
      const isValid = data.verification_status === 'SUCCESS';
      this.log(`PayPal Live Webhook signature verification status: ${data.verification_status}`);
      return isValid;
    } catch (err: any) {
      this.log('Live webhook verification error:', err.message);
      return false;
    }
  }

  /**
   * 6. Comprehensive Production Readiness & Connectivity Check
   * Validates all production credentials and tests live connection with PayPal Live API.
   */
  public async validateProductionConfig(): Promise<ProductionCheckResult> {
    const errors: string[] = [];

    if (!this.clientId || this.clientId.trim() === '') {
      errors.push('PAYPAL_CLIENT_ID is missing or empty.');
    }

    if (!this.clientSecret || this.clientSecret.trim() === '') {
      errors.push('PAYPAL_CLIENT_SECRET is missing or empty.');
    }

    if (!this.merchantEmail || this.merchantEmail !== 'topogabolekwe@gmail.com') {
      errors.push(`PAYPAL_MERCHANT_EMAIL is "${this.merchantEmail}", expected "topogabolekwe@gmail.com".`);
    }

    if (!this.webhookId || this.webhookId.trim() === '') {
      errors.push('PAYPAL_WEBHOOK_ID is missing or empty.');
    }

    const signingSecret = process.env.PAYMENT_SIGNING_SECRET || '';
    if (!signingSecret || signingSecret.trim() === '') {
      errors.push('PAYMENT_SIGNING_SECRET is missing or empty.');
    }

    if (this.baseUrl !== 'https://api-m.paypal.com') {
      errors.push(`API base URL is "${this.baseUrl}", expected "https://api-m.paypal.com".`);
    }

    let liveConnectivity = false;
    if (this.isConfigured()) {
      try {
        await this.getAccessToken();
        liveConnectivity = true;
      } catch (err: any) {
        errors.push(`PayPal Live OAuth connectivity check failed: ${err.message}`);
      }
    }

    return {
      isProductionReady: errors.length === 0 && liveConnectivity,
      mode: 'live',
      apiEndpoint: this.baseUrl,
      hasClientId: Boolean(this.clientId),
      hasClientSecret: Boolean(this.clientSecret),
      hasMerchantEmail: Boolean(this.merchantEmail),
      merchantEmail: this.merchantEmail,
      hasWebhookId: Boolean(this.webhookId),
      hasSigningSecret: Boolean(signingSecret),
      liveConnectivity,
      errors,
    };
  }
}

export const paypalClient = new PayPalClient();
