import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  X, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  RotateCcw, 
  Receipt, 
  Check, 
  Loader2 
} from 'lucide-react';
import { PlanPackageId, ProductPackage, PlanEntitlement, BusinessPlan } from '../types';
import { PRODUCT_PACKAGES, createProEntitlement, createInvestorEntitlement } from '../services/entitlementService';
import { paymentGateway, GatewayConfigResponse } from '../services/paymentService';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackageId: PlanPackageId;
  plan: BusinessPlan;
  userId: string;
  userEmail?: string;
  onSuccess: (entitlement: PlanEntitlement) => void;
}

type CheckoutStep = 'select' | 'authorizing' | 'paypal_checkout' | 'processing' | 'success' | 'error';

// Helper to load PayPal JavaScript SDK
const loadPayPalSdk = (clientId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).paypal?.Buttons) {
      resolve((window as any).paypal);
      return;
    }
    const existing = document.getElementById('paypal-sdk-script') as HTMLScriptElement;
    if (existing) {
      if ((window as any).paypal?.Buttons) {
        resolve((window as any).paypal);
      } else {
        existing.addEventListener('load', () => resolve((window as any).paypal));
        existing.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK script')));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => {
      if ((window as any).paypal?.Buttons) {
        resolve((window as any).paypal);
      } else {
        reject(new Error('PayPal SDK script loaded without Buttons component'));
      }
    };
    script.onerror = () => reject(new Error('Network error loading PayPal JavaScript SDK'));
    document.body.appendChild(script);
  });
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPackageId,
  plan,
  userId,
  userEmail,
  onSuccess
}) => {
  const [activePackageId, setActivePackageId] = useState<PlanPackageId>(
    selectedPackageId === 'free' ? 'pro' : selectedPackageId
  );
  const [step, setStep] = useState<CheckoutStep>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfigResponse | null>(null);
  const [isSdkLoading, setIsSdkLoading] = useState<boolean>(false);
  const [sdkLoadError, setSdkLoadError] = useState<boolean>(false);

  // Active transaction details from server
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentPayPalOrderId, setCurrentPayPalOrderId] = useState<string | null>(null);
  const [currentApprovalUrl, setCurrentApprovalUrl] = useState<string | null>(null);
  const [grantedEntitlement, setGrantedEntitlement] = useState<PlanEntitlement | null>(null);
  const [verifiedTransactionId, setVerifiedTransactionId] = useState<string | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(false);

  const paypalButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const activePackageIdRef = useRef<PlanPackageId>(activePackageId);
  activePackageIdRef.current = activePackageId;
  const currentOrderIdRef = useRef<string | null>(null);
  currentOrderIdRef.current = currentOrderId;

  // Load gateway config on open
  useEffect(() => {
    if (isOpen) {
      paymentGateway.getConfig().then(cfg => {
        setGatewayConfig(cfg);
      }).catch(err => {
        console.warn('[Checkout] Could not load payment config:', err);
      });
    }
  }, [isOpen]);

  const pkg: ProductPackage = PRODUCT_PACKAGES[activePackageId] || PRODUCT_PACKAGES.pro;
  const isInvestor = activePackageId === 'investor';
  const merchantEmail = gatewayConfig?.merchantEmail || 'topogabolekwe@gmail.com';

  /**
   * Capture and strictly verify payment directly with PayPal via Server API
   * Server requires buyer approval to be verified by PayPal before executing capture.
   */
  const handleCaptureAndVerify = async (providedOrderId?: string, providedProviderOrderId?: string) => {
    const orderIdToUse = providedOrderId || currentOrderId;
    const paypalOrderIdToUse = providedProviderOrderId || currentPayPalOrderId;

    if (!orderIdToUse) {
      setErrorMessage('No active order to capture.');
      setStep('error');
      return;
    }

    setStep('processing');
    setErrorMessage(null);

    try {
      // Server queries PayPal Live to confirm status === APPROVED before capturing
      const captureRes = await paymentGateway.captureOrder(
        orderIdToUse,
        paypalOrderIdToUse || undefined
      );

      if (!captureRes.success) {
        // If buyer hasn't approved yet on PayPal, return to checkout screen with notice
        if ((captureRes as any).requiresBuyerApproval || captureRes.error?.includes('approved') || captureRes.error?.includes('approval')) {
          setStep('paypal_checkout');
          setErrorMessage(captureRes.error || 'Payment has not been approved in PayPal yet. Please complete authorization in the PayPal window.');
          return;
        }
        throw new Error(captureRes.error || 'Payment was not verified by PayPal.');
      }

      const txId = captureRes.transactionId || `TXN-PP-${Date.now()}`;
      setVerifiedTransactionId(txId);

      // Construct verified entitlement with cryptographic signature
      const entitlement: PlanEntitlement = isInvestor
        ? createInvestorEntitlement(plan.id, userId, orderIdToUse, captureRes.verificationToken)
        : createProEntitlement(plan.id, userId, orderIdToUse, captureRes.verificationToken);

      // Store in Firestore
      try {
        const entDocRef = doc(db, 'entitlements', entitlement.id);
        await setDoc(entDocRef, entitlement, { merge: true });

        // Update plan status to paid
        const planDocRef = doc(db, 'business_plans', plan.id);
        await updateDoc(planDocRef, {
          status: 'paid',
          packageId: activePackageId,
          entitlementId: entitlement.id,
          updatedAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.debug('[Checkout] Firestore entitlement log deferred:', fsErr);
      }

      // Local storage cache for offline resilience
      localStorage.setItem(`gbg_entitlement_${plan.id}`, JSON.stringify(entitlement));

      setGrantedEntitlement(entitlement);
      setStep('success');
    } catch (err: any) {
      console.error('[Checkout] Verification failed:', err);
      setErrorMessage(err.message || 'Payment capture failed or was declined by PayPal.');
      setStep('error');
    }
  };

  /**
   * Launch Dedicated PayPal Approval Flow (Used directly or as fallback)
   */
  const handleInitiateApprovalWindow = async () => {
    setErrorMessage(null);
    setStep('authorizing');

    try {
      const orderRes = await paymentGateway.createOrder({
        userId: userId || 'guest_user',
        planId: plan.id,
        productPackage: activePackageId,
        amount: pkg.priceUSD, // Server strictly enforces from catalog
        currency: 'USD',
        customerEmail: userEmail || merchantEmail,
        paymentProvider: 'paypal'
      });

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.message || 'Could not initialize PayPal Live order.');
      }

      setCurrentOrderId(orderRes.orderId);
      setCurrentPayPalOrderId(orderRes.providerOrderId || null);
      setCurrentApprovalUrl(orderRes.approvalUrl || null);

      // Record pending order in Firestore orders collection
      try {
        const orderDocRef = doc(db, 'orders', orderRes.orderId);
        await setDoc(orderDocRef, {
          orderId: orderRes.orderId,
          userId: userId || 'guest_user',
          planId: plan.id,
          productPackage: activePackageId,
          amount: pkg.priceUSD,
          currency: 'USD',
          status: 'payment_pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paymentProvider: 'paypal',
          providerOrderId: orderRes.providerOrderId || ''
        }, { merge: true });
      } catch (fsErr) {
        console.debug('[Checkout] Firestore order log deferred:', fsErr);
      }

      // Move to active PayPal approval state
      setStep('paypal_checkout');

      // Automatically open PayPal approval window in new tab if URL available
      if (orderRes.approvalUrl) {
        window.open(orderRes.approvalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('[Checkout] Error initializing order:', err);
      setErrorMessage(err.message || 'Could not initialize PayPal checkout. Please try again.');
      setStep('error');
    }
  };

  /**
   * Check PayPal order status manually
   */
  const handleCheckApprovalStatus = async () => {
    if (!currentOrderId) return;
    setIsCheckingApproval(true);
    setErrorMessage(null);

    try {
      const statusRes = await paymentGateway.checkOrderStatus(currentOrderId);
      if (statusRes.buyerApproved || statusRes.isCompleted) {
        // Buyer has approved! Server can now safely capture
        await handleCaptureAndVerify(currentOrderId, currentPayPalOrderId || undefined);
      } else {
        setErrorMessage(`PayPal indicates this order is awaiting customer approval (${statusRes.paypalStatus || 'Pending'}). Please complete the authorization in PayPal.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify approval status with PayPal.');
    } finally {
      setIsCheckingApproval(false);
    }
  };

  /**
   * Render official PayPal JavaScript SDK Buttons
   */
  useEffect(() => {
    if (!isOpen || step !== 'select') return;

    let isMounted = true;
    const clientId = gatewayConfig?.clientId;

    if (!clientId) {
      return;
    }

    setIsSdkLoading(true);
    setSdkLoadError(false);

    loadPayPalSdk(clientId)
      .then((paypal) => {
        if (!isMounted || !paypalButtonContainerRef.current) return;
        setIsSdkLoading(false);

        // Clear previous buttons before re-rendering
        paypalButtonContainerRef.current.innerHTML = '';

        try {
          paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 44
            },
            createOrder: async () => {
              setErrorMessage(null);
              const currentPkg = PRODUCT_PACKAGES[activePackageIdRef.current] || PRODUCT_PACKAGES.pro;
              
              const orderRes = await paymentGateway.createOrder({
                userId: userId || 'guest_user',
                planId: plan.id,
                productPackage: activePackageIdRef.current,
                amount: currentPkg.priceUSD, // Server validates price from server-authoritative catalog
                currency: 'USD',
                customerEmail: userEmail || merchantEmail,
                paymentProvider: 'paypal'
              });

              if (!orderRes.success || !orderRes.providerOrderId) {
                throw new Error(orderRes.message || 'Could not initialize PayPal LIVE order.');
              }

              currentOrderIdRef.current = orderRes.orderId;
              setCurrentOrderId(orderRes.orderId);
              setCurrentPayPalOrderId(orderRes.providerOrderId);
              setCurrentApprovalUrl(orderRes.approvalUrl || null);

              // Record in Firestore
              try {
                const orderDocRef = doc(db, 'orders', orderRes.orderId);
                await setDoc(orderDocRef, {
                  orderId: orderRes.orderId,
                  userId: userId || 'guest_user',
                  planId: plan.id,
                  productPackage: activePackageIdRef.current,
                  amount: currentPkg.priceUSD,
                  currency: 'USD',
                  status: 'payment_pending',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  paymentProvider: 'paypal',
                  providerOrderId: orderRes.providerOrderId
                }, { merge: true });
              } catch (fsErr) {
                console.debug('[Checkout] Firestore order log deferred:', fsErr);
              }

              return orderRes.providerOrderId;
            },
            onApprove: async (data: any) => {
              // Buyer has officially authorized payment on PayPal!
              console.log('[PayPal SDK] Buyer approval confirmed on PayPal Live:', data);
              const intOrderId = currentOrderIdRef.current || currentOrderId;
              if (intOrderId) {
                await handleCaptureAndVerify(intOrderId, data.orderID);
              }
            },
            onCancel: () => {
              console.log('[PayPal SDK] Buyer cancelled checkout.');
              setErrorMessage('PayPal checkout was cancelled. No charges were made.');
            },
            onError: (err: any) => {
              console.error('[PayPal SDK Error]:', err);
              setErrorMessage('PayPal encountered an issue. You can also use the dedicated PayPal approval window.');
            }
          }).render(paypalButtonContainerRef.current);
        } catch (renderErr) {
          console.warn('[PayPal SDK] Button render notice:', renderErr);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsSdkLoading(false);
        setSdkLoadError(true);
        console.warn('[PayPal SDK] Notice:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, gatewayConfig?.clientId, activePackageId, step]);

  /**
   * Auto-poll order status while in paypal_checkout step to detect buyer approval in real-time
   */
  useEffect(() => {
    if (step !== 'paypal_checkout' || !currentOrderId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const statusRes = await paymentGateway.checkOrderStatus(currentOrderId);
        if (!isSubscribed) return;

        if (statusRes.buyerApproved) {
          console.log('[Checkout Poller] Buyer approval detected on PayPal Live! Triggering server capture...');
          clearInterval(interval);
          handleCaptureAndVerify(currentOrderId, currentPayPalOrderId || undefined);
        } else if (statusRes.isCompleted) {
          console.log('[Checkout Poller] Order already completed on PayPal! Updating entitlement...');
          clearInterval(interval);
          handleCaptureAndVerify(currentOrderId, currentPayPalOrderId || undefined);
        }
      } catch {
        // Non-blocking background check
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [step, currentOrderId, currentPayPalOrderId]);

  /**
   * Cancel Checkout
   */
  const handleCancelCheckout = async () => {
    if (currentOrderId) {
      try {
        await paymentGateway.cancelOrder(currentOrderId);
      } catch {
        // Continue
      }
    }
    setErrorMessage('Checkout was cancelled. You may select a package and try again when ready.');
    setStep('error');
  };

  /**
   * Retry Payment
   */
  const handleRetry = () => {
    setErrorMessage(null);
    setCurrentOrderId(null);
    setCurrentPayPalOrderId(null);
    setCurrentApprovalUrl(null);
    setStep('select');
  };

  const handleFinish = () => {
    if (grantedEntitlement) {
      onSuccess(grantedEntitlement);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="checkout-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {step === 'success' ? 'Payment Verified & Confirmed' : 'Unlock Your Complete Business Plan'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                  PayPal Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {plan.input.businessName} • Global Business Generator
              </p>
            </div>
          </div>
          {step !== 'processing' && step !== 'authorizing' && (
            <button
              id="checkout-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: Select Package & Buyer Checkout */}
        {step === 'select' && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Package Selector Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Business Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pro Plan */}
                  <div
                    id="package-card-pro"
                    onClick={() => setActivePackageId('pro')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      activePackageId === 'pro'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Pro Business Plan</span>
                        <span className="block text-xs text-emerald-700 font-semibold">Bank & Operations Ready</span>
                      </div>
                      <span className="text-base font-black text-slate-900">$29 <span className="text-xs font-normal text-slate-500">USD</span></span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      Full 34-section plan, 3-year cash-flow and revenue forecast, break-even analysis, and PDF export.
                    </p>
                    <div className="mt-3 flex items-center text-[11px] font-semibold text-emerald-700">
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      One-time payment • Lifetime access
                    </div>
                  </div>

                  {/* Investor Package */}
                  <div
                    id="package-card-investor"
                    onClick={() => setActivePackageId('investor')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      activePackageId === 'investor'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Investor Package</span>
                        <span className="block text-xs text-indigo-700 font-semibold">Venture & Loan Suite</span>
                      </div>
                      <span className="text-base font-black text-slate-900">$69 <span className="text-xs font-normal text-slate-500">USD</span></span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      Everything in Pro plus funding tranches, investor pitch deck outline, readiness audit, and financial models.
                    </p>
                    <div className="mt-3 flex items-center text-[11px] font-semibold text-indigo-700">
                      <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      One-time payment • Pitch & Grant ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Selected Package:</span>
                  <span className="font-bold text-slate-900">{pkg.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Target Business Plan:</span>
                  <span className="font-semibold text-slate-900">{plan.input.businessName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>PayPal Live Payee:</span>
                  <span className="font-mono text-slate-800 text-[11px]">{merchantEmail}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900 uppercase">Total Amount Due:</span>
                  <span className="text-xl font-black text-slate-900">
                    ${pkg.priceUSD}.00 <span className="text-xs font-semibold text-slate-500">USD</span>
                  </span>
                </div>
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Guarantees */}
              <div className="py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Instant Verification</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">30-Day Money-Back Guarantee</span>
                </div>
              </div>

              {/* REAL PAYPAL BUYER APPROVAL EXPERIENCE */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Complete Payment with PayPal Live
                </label>

                {/* Primary: In-Modal Official PayPal JavaScript SDK Buttons */}
                <div className="min-h-[90px] relative">
                  {isSdkLoading && (
                    <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading secure PayPal buttons...</span>
                    </div>
                  )}

                  <div 
                    id="paypal-button-container" 
                    ref={paypalButtonContainerRef}
                    className="w-full relative z-10"
                  />
                </div>

                {/* Secondary / Fallback: Dedicated Approval Window Launcher */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    id="checkout-open-approval-window-btn"
                    onClick={handleInitiateApprovalWindow}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>Or open PayPal in a dedicated approval window</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Official PayPal LIVE Checkout. Prices: Pro $29.00 USD, Investor $69.00 USD. No recurring fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Authorizing / Initializing Order */}
        {step === 'authorizing' && (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connecting to PayPal Live...</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Creating LIVE PayPal order for <strong className="text-slate-800">${pkg.priceUSD}.00 USD</strong>. Payee verified as <strong className="text-slate-800">{merchantEmail}</strong>.
            </p>
          </div>
        )}

        {/* STEP 3: Active PayPal Approval Window & Poller */}
        {step === 'paypal_checkout' && (
          <div className="p-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-1">
                <span className="font-black italic text-lg text-blue-700">PayPal</span>
                <span>Awaiting Your Payment Approval</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Please complete and authorize your payment in the PayPal checkout window. Once you confirm on PayPal, this window will automatically detect your approval and unlock your business plan.
              </p>
            </div>

            {/* Error or Alert notice */}
            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Order Ledger Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Internal Order ID:</span>
                <span className="font-mono font-bold text-slate-800">{currentOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="font-mono font-bold text-blue-700">{currentPayPalOrderId || 'Assigned by PayPal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span className="font-bold text-slate-900">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Merchant:</span>
                <span className="font-semibold text-slate-700">{merchantEmail}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total Price:</span>
                <span className="text-lg font-black text-slate-900">${pkg.priceUSD}.00 USD</span>
              </div>
            </div>

            {/* Actions for buyer */}
            <div className="space-y-3">
              {currentApprovalUrl && (
                <a
                  href={currentApprovalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <span>Re-open PayPal Approval Window</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Status Poller Indicator */}
              <div className="flex items-center justify-center space-x-2 py-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Listening for buyer approval on PayPal Live...</span>
              </div>

              {/* Manual Confirmation Button - Server verifies buyer approval before capture */}
              <button
                type="button"
                id="checkout-confirm-approval-btn"
                onClick={handleCheckApprovalStatus}
                disabled={isCheckingApproval}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
              >
                {isCheckingApproval ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Approval with PayPal...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>I Have Approved on PayPal — Complete & Unlock</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelCheckout}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel Checkout & Select Another Package
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Server Processing & Verification */}
        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Capturing & Verifying with PayPal...</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Confirming buyer approval status with PayPal Live API, executing capture (${pkg.priceUSD} USD), and issuing cryptographically verified entitlement.
            </p>
          </div>
        )}

        {/* STEP 5: Success & Receipt */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Verified Order Succeeded
            </span>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {pkg.name} Unlocked!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Congratulations! Your entitlement for <strong className="text-slate-900 font-semibold">{plan.input.businessName}</strong> is verified and active. All 34 sections, financial cash flow models, and export tools are accessible.
            </p>

            {/* Official Receipt Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto mb-6 text-left text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-200 text-slate-700 font-bold">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>PayPal Official Transaction Receipt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Internal Order ID:</span>
                <span className="font-mono font-semibold text-slate-800">{currentOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="font-mono font-bold text-blue-700">{currentPayPalOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capture Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-700">{verifiedTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Account:</span>
                <span className="text-slate-700">{merchantEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Package Unlocked:</span>
                <span className="font-bold text-slate-900">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-semibold text-slate-800">${pkg.priceUSD}.00 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-bold text-emerald-600">Verified & Paid</span>
              </div>
            </div>

            <button
              id="checkout-view-unlocked-plan-btn"
              type="button"
              onClick={handleFinish}
              className="py-3.5 px-8 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>View Unlocked Business Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 6: Failure / Cancellation with Retry */}
        {step === 'error' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Did Not Complete</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              {errorMessage || 'The PayPal checkout was cancelled or could not be authorized. No funds were captured.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="py-3 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Return to Free Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
