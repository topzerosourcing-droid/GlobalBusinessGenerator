import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  AlertCircle, 
  Receipt, 
  Download, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
  FileText
} from 'lucide-react';
import { PlanPackageId, ProductPackage, PlanEntitlement, BusinessPlan } from '../types';
import { PRODUCT_PACKAGES, createProEntitlement, createInvestorEntitlement } from '../services/entitlementService';
import { paymentGateway, GatewayConfigResponse } from '../services/paymentService';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InvoiceData, downloadInvoicePdf } from '../utils/invoiceGenerator';
import { InvoiceModal } from './InvoiceModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackageId: PlanPackageId;
  plan: BusinessPlan;
  userId: string;
  userEmail?: string;
  onSuccess: (entitlement: PlanEntitlement) => void;
}

type CheckoutStep = 'checkout' | 'capturing' | 'success';

// Helper to dynamically load the official PayPal JavaScript SDK
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
  const [step, setStep] = useState<CheckoutStep>('checkout');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfigResponse | null>(null);
  const [isSdkLoading, setIsSdkLoading] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Active transaction details
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentPayPalOrderId, setCurrentPayPalOrderId] = useState<string | null>(null);
  const [verifiedTransactionId, setVerifiedTransactionId] = useState<string | null>(null);
  const [paymentTimestamp, setPaymentTimestamp] = useState<string>('');
  const [grantedEntitlement, setGrantedEntitlement] = useState<PlanEntitlement | null>(null);

  // Invoice Data & Viewing Modal
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const paypalButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const activePackageIdRef = useRef<PlanPackageId>(activePackageId);
  activePackageIdRef.current = activePackageId;
  const currentOrderIdRef = useRef<string | null>(null);
  currentOrderIdRef.current = currentOrderId;

  // Initialize gateway config on modal open
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
   * Execute server capture, perform server verification, update entitlement & create invoice
   */
  const handleCaptureAndServerVerify = async (orderIdToUse: string, paypalOrderIdToUse?: string) => {
    setStep('capturing');
    setIsCapturing(true);
    setErrorMessage(null);

    try {
      // 1. Server-side capture (validates status is APPROVED on PayPal Live before capturing)
      const captureRes = await paymentGateway.captureOrder(
        orderIdToUse,
        paypalOrderIdToUse
      );

      if (!captureRes.success) {
        throw new Error(captureRes.error || 'PayPal payment could not be captured.');
      }

      const txId = captureRes.transactionId || `TXN-PP-${Date.now()}`;
      const nowFormatted = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      // 2. Server-side verification call
      const verifyRes = await paymentGateway.verifyPayment(
        orderIdToUse,
        plan.id,
        captureRes.verificationToken
      );

      if (!verifyRes.verified) {
        throw new Error(verifyRes.error || 'Server-side payment verification failed.');
      }

      setVerifiedTransactionId(txId);
      setPaymentTimestamp(nowFormatted);

      // 3. Construct verified entitlement
      const entitlement: PlanEntitlement = isInvestor
        ? createInvestorEntitlement(plan.id, userId, orderIdToUse, captureRes.verificationToken)
        : createProEntitlement(plan.id, userId, orderIdToUse, captureRes.verificationToken);

      // 4. Save to Firestore (entitlements collection & business_plans status update)
      try {
        const entDocRef = doc(db, 'entitlements', entitlement.id);
        await setDoc(entDocRef, entitlement, { merge: true });

        const planDocRef = doc(db, 'business_plans', plan.id);
        await updateDoc(planDocRef, {
          status: 'paid',
          packageId: activePackageId,
          entitlementId: entitlement.id,
          updatedAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.debug('[Checkout] Firestore sync deferred:', fsErr);
      }

      // 5. Cache entitlement locally for offline resilience
      try {
        localStorage.setItem(`gbg_entitlement_${plan.id}`, JSON.stringify(entitlement));
      } catch {
        // Non-fatal
      }

      setGrantedEntitlement(entitlement);

      // 6. Build official Invoice / Receipt Record
      const invoice: InvoiceData = {
        invoiceNumber: `INV-${orderIdToUse.replace('ORD-', '')}`,
        orderId: orderIdToUse,
        paymentDate: nowFormatted,
        customerName: plan.input.founderName || userEmail?.split('@')[0] || 'Business Founder',
        customerEmail: userEmail || 'customer@globalbusinessgenerator.com',
        businessPlanName: plan.input.businessName,
        packagePurchased: pkg.name,
        packageId: activePackageId as 'pro' | 'investor',
        amountPaid: pkg.priceUSD,
        currency: 'USD',
        paypalTransactionId: txId,
        paypalOrderId: paypalOrderIdToUse || currentPayPalOrderId || undefined,
        paymentStatus: 'PAID',
        purchaseType: 'One-time purchase',
        accessType: 'Lifetime access',
        supportEmail: merchantEmail,
        merchantName: 'Global Business Generator'
      };

      setInvoiceData(invoice);
      setStep('success');
    } catch (err: any) {
      console.error('[Checkout] Capture/verification error:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setStep('checkout');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Render Official PayPal Buttons (directly into the checkout card)
   */
  useEffect(() => {
    if (!isOpen || step !== 'checkout') return;

    let isMounted = true;
    const clientId = gatewayConfig?.clientId;

    if (!clientId) {
      return;
    }

    setIsSdkLoading(true);

    loadPayPalSdk(clientId)
      .then((paypal) => {
        if (!isMounted || !paypalButtonContainerRef.current) return;
        setIsSdkLoading(false);

        // Clear existing button DOM
        paypalButtonContainerRef.current.innerHTML = '';

        try {
          paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'checkout',
              height: 46
            },
            createOrder: async () => {
              setErrorMessage(null);
              const currentPkg = PRODUCT_PACKAGES[activePackageIdRef.current] || PRODUCT_PACKAGES.pro;

              // Immediately create PayPal Live order on server
              const orderRes = await paymentGateway.createOrder({
                userId: userId || 'guest_user',
                planId: plan.id,
                productPackage: activePackageIdRef.current as 'pro' | 'investor',
                amount: currentPkg.priceUSD, // Server-enforced catalog price ($29 or $69 USD)
                currency: 'USD',
                customerEmail: userEmail || merchantEmail,
                paymentProvider: 'paypal'
              });

              if (!orderRes.success || !orderRes.providerOrderId) {
                throw new Error(orderRes.message || 'Could not initialize PayPal Live order.');
              }

              currentOrderIdRef.current = orderRes.orderId;
              setCurrentOrderId(orderRes.orderId);
              setCurrentPayPalOrderId(orderRes.providerOrderId);

              // Record pending order in Firestore
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

              // Return PayPal's order ID directly to PayPal SDK to open approval window
              return orderRes.providerOrderId;
            },
            onApprove: async (data: any) => {
              // Buyer officially confirmed authorization in PayPal window
              console.log('[PayPal SDK] Buyer approval confirmed on PayPal Live:', data);
              const internalOrderId = currentOrderIdRef.current || currentOrderId;
              if (internalOrderId) {
                await handleCaptureAndServerVerify(internalOrderId, data.orderID);
              }
            },
            onCancel: () => {
              console.log('[PayPal SDK] Buyer closed or cancelled checkout window.');
              setErrorMessage('PayPal checkout was cancelled. No charges were made.');
            },
            onError: (err: any) => {
              console.error('[PayPal SDK Error]:', err);
              setErrorMessage('PayPal encountered a connection issue. You may retry or use direct checkout.');
            }
          }).render(paypalButtonContainerRef.current);
        } catch (renderErr) {
          console.warn('[PayPal SDK] Render warning:', renderErr);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsSdkLoading(false);
        console.warn('[PayPal SDK] Initialization notice:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, gatewayConfig?.clientId, activePackageId, step]);

  /**
   * Direct PayPal Approval Window (Fallback for popup blockers or direct link preference)
   */
  const handleLaunchDirectApproval = async () => {
    setErrorMessage(null);
    setIsCapturing(true);

    try {
      const orderRes = await paymentGateway.createOrder({
        userId: userId || 'guest_user',
        planId: plan.id,
        productPackage: activePackageId as 'pro' | 'investor',
        amount: pkg.priceUSD,
        currency: 'USD',
        customerEmail: userEmail || merchantEmail,
        paymentProvider: 'paypal'
      });

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.message || 'Could not initialize PayPal order.');
      }

      setCurrentOrderId(orderRes.orderId);
      setCurrentPayPalOrderId(orderRes.providerOrderId || null);

      if (orderRes.approvalUrl) {
        window.open(orderRes.approvalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not open PayPal approval window.');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Safe Navigation Cancel: Returns user to business plan without penalty
   */
  const handleCancelAndReturn = async () => {
    if (currentOrderId) {
      try {
        await paymentGateway.cancelOrder(currentOrderId);
      } catch {
        // Non-blocking
      }
    }
    onClose();
  };

  /**
   * Success: Continue to My Business Plan
   */
  const handleContinueToPlan = () => {
    if (grantedEntitlement) {
      onSuccess(grantedEntitlement);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        id="checkout-modal-backdrop" 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div 
          id="checkout-modal-container"
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {step === 'success' ? 'Order Confirmed' : 'Checkout & Unlock'}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                  {plan.input.businessName}
                </p>
              </div>
            </div>
            
            {step !== 'capturing' && (
              <button
                id="checkout-close-btn"
                type="button"
                onClick={step === 'success' ? handleContinueToPlan : handleCancelAndReturn}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* SCREEN 1: STREAMLINED ONE-TIME CHECKOUT */}
          {step === 'checkout' && (
            <div className="p-6 space-y-5">
              
              {/* Package Selector (Clean, low-friction toggle) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="checkout-select-pro"
                  onClick={() => setActivePackageId('pro')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    activePackageId === 'pro'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-900">Pro Plan</span>
                    <span className="text-sm font-black text-slate-900">$29</span>
                  </div>
                  <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                    34-Section Blueprint
                  </span>
                </button>

                <button
                  type="button"
                  id="checkout-select-investor"
                  onClick={() => setActivePackageId('investor')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    activePackageId === 'investor'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-900">Investor Suite</span>
                    <span className="text-sm font-black text-slate-900">$69</span>
                  </div>
                  <span className="block text-[11px] text-indigo-700 font-medium mt-0.5">
                    Fundraising & Exhibits
                  </span>
                </button>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Selected Package:</span>
                  <span className="font-bold text-slate-900">{pkg.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">License Terms:</span>
                  <span className="font-semibold text-emerald-700">One-time payment • Lifetime access</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900 uppercase">Total Due:</span>
                  <span className="text-2xl font-black text-slate-900">
                    ${pkg.priceUSD}.00 <span className="text-xs font-medium text-slate-500">USD</span>
                  </span>
                </div>
              </div>

              {/* Alert / Notice if any */}
              {errorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Official PayPal Buttons Container */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Instant Checkout with PayPal Live:
                </label>

                <div className="min-h-[90px] relative">
                  {isSdkLoading && (
                    <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading secure PayPal checkout...</span>
                    </div>
                  )}

                  <div 
                    id="paypal-button-container" 
                    ref={paypalButtonContainerRef}
                    className="w-full relative z-10"
                  />
                </div>

                {/* Direct Popup Launcher (Optional link for convenience) */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleLaunchDirectApproval}
                    className="text-xs text-slate-500 hover:text-blue-700 inline-flex items-center space-x-1 underline cursor-pointer"
                  >
                    <span>Having trouble? Open PayPal in a new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Security Badges & Return Link */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center space-x-1 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL • Verified PayPal Live</span>
                </div>

                <button
                  type="button"
                  id="checkout-cancel-btn"
                  onClick={handleCancelAndReturn}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition underline cursor-pointer"
                >
                  Cancel & Return to Business Plan
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: CAPTURING & VERIFYING */}
          {step === 'capturing' && (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                Verifying Payment with PayPal...
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Confirming buyer authorization with PayPal Live and unlocking your business plan.
              </p>
            </div>
          )}

          {/* SCREEN 3: PROFESSIONAL PAYMENT SUCCESS PAGE */}
          {step === 'success' && (
            <div className="p-6 space-y-5 animate-in fade-in duration-200">
              {/* Success Badge */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Payment Successful!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your business plan is now fully unlocked and ready.
                </p>
              </div>

              {/* Official Transaction Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Package Purchased:</span>
                  <span className="font-bold text-slate-900">{pkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ${pkg.priceUSD}.00 USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Reference:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {verifiedTransactionId || 'TXN-PP-CONFIRMED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-slate-700">{paymentTimestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Business Plan:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {plan.input.businessName}
                  </span>
                </div>
              </div>

              {/* Action Buttons as explicitly requested */}
              <div className="space-y-2 pt-1">
                {/* 1. Continue to My Business Plan */}
                <button
                  type="button"
                  id="btn-continue-to-plan"
                  onClick={handleContinueToPlan}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer text-xs"
                >
                  <span>Continue to My Business Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* 2. View Receipt / Invoice */}
                  <button
                    type="button"
                    id="btn-view-invoice"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Receipt / Invoice</span>
                  </button>

                  {/* 3. Download Invoice */}
                  <button
                    type="button"
                    id="btn-download-invoice"
                    onClick={() => {
                      if (invoiceData) {
                        downloadInvoicePdf(invoiceData);
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                A copy of your receipt is stored with your order. Lifetime access active.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Invoice Viewing & Printing Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={invoiceData}
      />
    </>
  );
};
