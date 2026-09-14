import React, { useState, useEffect, useRef } from 'react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { InvoiceModal } from './InvoiceModal';
import { InvoiceData, downloadInvoicePdf } from '../utils/invoiceGenerator';
import { PlanEntitlement } from '../types';
import { db, getUserProfile } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  FileText, 
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PayPalReturnViewProps {
  onSuccess: (entitlement: PlanEntitlement, planId?: string) => void;
  onCancel: (planId?: string) => void;
  onRetry: (planId?: string, packageId?: 'pro' | 'investor') => void;
}

export const PayPalReturnView: React.FC<PayPalReturnViewProps> = ({
  onSuccess,
  onCancel,
  onRetry,
}) => {
  const { user } = useAuth();

  const [status, setStatus] = useState<'loading' | 'capturing' | 'success' | 'cancelled' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [providerOrderId, setProviderOrderId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [planTitle, setPlanTitle] = useState<string>('Business Plan');
  const [packageId, setPackageId] = useState<'pro' | 'investor'>('pro');
  const [amountPaid, setAmountPaid] = useState<number>(29);
  const [transactionId, setTransactionId] = useState<string>('');
  const [grantedEntitlement, setGrantedEntitlement] = useState<PlanEntitlement | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Prevent double capture attempts in React strict mode
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const parseParams = () => {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      
      // Look for PayPal parameters
      const token = searchParams.get('token') || '';
      const payerId = searchParams.get('PayerID') || '';
      const qOrderId = searchParams.get('orderId') || '';
      const qPlanId = searchParams.get('planId') || '';
      const qPackageId = (searchParams.get('packageId') || searchParams.get('package') || 'pro') as 'pro' | 'investor';
      
      const isCancelledPath = 
        window.location.pathname.includes('/payment-cancel') || 
        searchParams.get('cancel') === 'true' ||
        searchParams.get('status') === 'cancelled';

      return { token, payerId, qOrderId, qPlanId, qPackageId, isCancelledPath };
    };

    const runFlow = async () => {
      const { token, payerId, qOrderId, qPlanId, qPackageId, isCancelledPath } = parseParams();

      const effectiveToken = token || '';
      const effectiveOrderId = qOrderId || (effectiveToken ? `ORD-${effectiveToken.substring(0, 10)}` : '');
      const effectivePlanId = qPlanId || '';

      setOrderId(effectiveOrderId);
      setProviderOrderId(effectiveToken);
      setPlanId(effectivePlanId);
      setPackageId(qPackageId === 'investor' ? 'investor' : 'pro');
      setAmountPaid(qPackageId === 'investor' ? 69 : 29);

      // 1. If cancellation route was triggered
      if (isCancelledPath) {
        setStatus('cancelled');
        if (effectiveOrderId || effectiveToken) {
          try {
            await paymentService.cancelOrder(effectiveOrderId, effectiveToken);
          } catch {
            // Non-blocking
          }
        }
        return;
      }

      // 2. Return without token: check if there's any active order to restore
      if (!effectiveToken && !effectiveOrderId) {
        setStatus('error');
        setErrorMessage('No payment reference found in return URL. Please retry checkout from your business plan.');
        return;
      }

      // 3. Initiate payment capture & verification
      setStatus('capturing');

      try {
        // Step A: Lookup order on server first to see if it was already completed
        console.log('[PayPal Return] Looking up order status on server for:', effectiveToken || effectiveOrderId);
        const lookup = await paymentService.lookupOrder(effectiveToken || effectiveOrderId);
        
        let targetPackage = qPackageId;
        let targetPlan = effectivePlanId;
        let resolvedOrderId = effectiveOrderId;

        if (lookup && lookup.order) {
          if (lookup.order.productPackage) {
            targetPackage = lookup.order.productPackage;
            setPackageId(targetPackage);
            setAmountPaid(targetPackage === 'investor' ? 69 : 29);
          }
          if (lookup.order.planId) {
            targetPlan = lookup.order.planId;
            setPlanId(targetPlan);
          }
          if (lookup.order.orderId) {
            resolvedOrderId = lookup.order.orderId;
            setOrderId(resolvedOrderId);
          }
        }

        // Try to fetch plan title from Firestore for display
        if (targetPlan) {
          try {
            const planDoc = await getDoc(doc(db, 'business_plans', targetPlan));
            if (planDoc.exists()) {
              const data = planDoc.data();
              if (data?.title || data?.input?.businessName) {
                setPlanTitle(data.title || data.input?.businessName);
              }
            }
          } catch {
            // Fallback default
          }
        }

        // Step B: If order is ALREADY paid or completed (idempotency), take existing token
        if (lookup && lookup.isCompleted && lookup.order) {
          console.log('[PayPal Return] Order is already paid. Fetching existing entitlement...');
          const txId = lookup.order.providerTransactionId || effectiveToken || `TXN-${Date.now()}`;
          setTransactionId(txId);

          await finalizeSuccess({
            orderId: resolvedOrderId,
            planId: targetPlan,
            packageId: targetPackage,
            transactionId: txId,
            verificationToken: `VERIFIED_${txId}`,
            providerOrderId: effectiveToken
          });
          return;
        }

        // Step C: Execute direct capture with PayPal Live API
        console.log('[PayPal Return] Capturing PayPal order with server:', {
          orderId: resolvedOrderId,
          providerOrderId: effectiveToken
        });

        const captureRes = await paymentService.captureOrder(resolvedOrderId, effectiveToken);

        if (!captureRes.success) {
          if (captureRes.error?.includes('approval')) {
            setStatus('error');
            setErrorMessage('PayPal indicated that buyer authorization was not completed. You may retry your payment safely.');
            return;
          }
          throw new Error(captureRes.error || 'Payment capture could not be completed with PayPal.');
        }

        const finalTxId = captureRes.transactionId || effectiveToken || `TXN-PP-${Date.now()}`;
        const finalPackage = (captureRes.packageId || targetPackage) as 'pro' | 'investor';
        setTransactionId(finalTxId);
        setPackageId(finalPackage);
        setAmountPaid(finalPackage === 'investor' ? 69 : 29);

        // Step D: Verify entitlement cryptographically
        const verifyRes = await paymentService.verifyPayment(
          resolvedOrderId,
          targetPlan,
          captureRes.verificationToken
        );

        if (!verifyRes.verified) {
          throw new Error(verifyRes.error || 'Cryptographic server verification failed.');
        }

        // Step E: Finalize and grant entitlement
        await finalizeSuccess({
          orderId: resolvedOrderId,
          planId: targetPlan,
          packageId: finalPackage,
          transactionId: finalTxId,
          verificationToken: captureRes.verificationToken || `TOKEN-${Date.now()}`,
          providerOrderId: effectiveToken
        });

      } catch (err: any) {
        console.error('[PayPal Return] Error finalizing return payment:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Payment capture failed. Please try again.');
      }
    };

    runFlow();
  }, []);

  /**
   * Finalize success: update Firestore, update localStorage, build invoice, and set success state
   */
  const finalizeSuccess = async (params: {
    orderId: string;
    planId: string;
    packageId: 'pro' | 'investor';
    transactionId: string;
    verificationToken: string;
    providerOrderId: string;
  }) => {
    const isInvestor = params.packageId === 'investor';
    const entId = `ent_${params.planId || Date.now()}`;
    const nowIso = new Date().toISOString();
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const entitlement: PlanEntitlement = {
      id: entId,
      userId: user?.uid || 'user',
      planId: params.planId,
      packageId: params.packageId,
      status: 'active',
      grantedAt: nowIso,
      orderId: params.orderId,
      verificationToken: params.verificationToken,
      features: {
        canViewFull34Sections: true,
        canExportPDF: true,
        canExportInvestorPDF: isInvestor,
        hasFundingAndInvestorPack: isInvestor,
        hasFinancialForecasts: true,
        hasMarketingStrategy: true,
        hasLaunchAndGrowthPlan: true,
        unlockedSections: []
      }
    };

    // 1. Update Firestore entitlements & business_plans
    try {
      if (params.planId) {
        await setDoc(doc(db, 'entitlements', entId), entitlement, { merge: true });
        await updateDoc(doc(db, 'business_plans', params.planId), {
          status: 'paid',
          packageId: params.packageId,
          entitlementId: entId,
          updatedAt: nowIso
        });
      }
    } catch (fsErr) {
      console.debug('[PayPal Return] Firestore entitlement write deferred:', fsErr);
    }

    // 2. Cache locally for instant offline/offline resilience
    try {
      if (params.planId) {
        localStorage.setItem(`gbg_entitlement_${params.planId}`, JSON.stringify(entitlement));
      }
    } catch {
      // Non-blocking
    }

    // 3. Build official Invoice record
    const invoice: InvoiceData = {
      invoiceNumber: `INV-${params.orderId.replace('ORD-', '')}`,
      orderId: params.orderId,
      paymentDate: nowFormatted,
      customerName: user?.displayName || user?.email?.split('@')[0] || 'Valued Entrepreneur',
      customerEmail: user?.email || 'customer@globalbusinessgenerator.com',
      businessPlanName: planTitle,
      packagePurchased: isInvestor ? 'Investor / Funding Package' : 'Pro Business Plan',
      packageId: params.packageId,
      amountPaid: isInvestor ? 69 : 29,
      currency: 'USD',
      paypalTransactionId: params.transactionId,
      paypalOrderId: params.providerOrderId || undefined,
      paymentStatus: 'PAID',
      purchaseType: 'Single Plan Digital License',
      accessType: 'Permanent Unrestricted Lifetime Access',
      supportEmail: 'topogabolekwe@gmail.com',
      merchantName: 'Global Business Generator'
    };

    setGrantedEntitlement(entitlement);
    setInvoiceData(invoice);
    setStatus('success');
  };

  const handleContinueToPlan = () => {
    if (grantedEntitlement) {
      onSuccess(grantedEntitlement, planId);
    } else {
      onCancel(planId);
    }
  };

  const handleRetryPayment = () => {
    onRetry(planId, packageId);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Top brand header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
              GBG
            </div>
            <span className="text-white font-bold text-sm tracking-tight">
              Global Business Generator
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>PayPal Live Verified</span>
          </div>
        </div>

        {/* STATE 1: CAPTURING & VERIFYING */}
        {(status === 'loading' || status === 'capturing') && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Confirming Your Payment...
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Communicating with PayPal Live to capture your payment and unlock your business plan.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span className="font-semibold text-slate-800">
                  {packageId === 'investor' ? 'Investor / Funding Package ($69)' : 'Pro Business Plan ($29)'}
                </span>
              </div>
              {providerOrderId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Order ID:</span>
                  <span className="font-mono text-slate-700">{providerOrderId}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Please do not close or refresh this tab while verification completes.
            </p>
          </div>
        )}

        {/* STATE 2: SUCCESSFUL PAYMENT & PLAN UNLOCKED */}
        {status === 'success' && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-sm text-slate-600">
                Your business plan has been fully unlocked and upgraded.
              </p>
            </div>

            {/* Verified Receipt Summary Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                <span className="text-slate-600 font-medium">Package Purchased:</span>
                <span className="font-bold text-slate-900">
                  {packageId === 'investor' ? 'Investor / Funding Package' : 'Pro Business Plan'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                <span className="text-slate-600 font-medium">Amount Paid:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  ${amountPaid}.00 USD
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                <span className="text-slate-600 font-medium">PayPal Transaction ID:</span>
                <span className="font-mono font-semibold text-slate-800 truncate max-w-[200px]">
                  {transactionId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Access Entitlement:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Unrestricted
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                id="btn-continue-to-unlocked-plan"
                onClick={handleContinueToPlan}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <span>Continue to My Business Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-view-invoice-receipt"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Receipt</span>
                </button>

                <button
                  type="button"
                  id="btn-download-pdf-invoice"
                  onClick={() => invoiceData && downloadInvoicePdf(invoiceData)}
                  className="py-2.5 px-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STATE 3: CANCELLED PAYMENT */}
        {status === 'cancelled' && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-9 h-9 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Payment Cancelled
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your PayPal checkout was cancelled. No charges were made to your PayPal account or card.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-semibold text-slate-800">{planTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Package:</span>
                <span className="font-semibold text-slate-800">
                  {packageId === 'investor' ? 'Investor Package ($69)' : 'Pro Business Plan ($29)'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="btn-retry-payment"
                onClick={handleRetryPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>

              <button
                type="button"
                id="btn-return-free-plan"
                onClick={() => onCancel(planId)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Return to Free Plan
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: ERROR STATE */}
        {status === 'error' && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-400 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-9 h-9 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Payment Did Not Complete
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'PayPal was unable to finalize your payment transaction.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="btn-retry-failed-payment"
                onClick={handleRetryPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>

              <button
                type="button"
                id="btn-return-to-free-plan-error"
                onClick={() => onCancel(planId)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Return to Free Plan
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Need assistance? Email merchant support at <span className="font-medium text-slate-600">topogabolekwe@gmail.com</span>.
            </p>
          </div>
        )}

      </div>

      {/* Full Invoice Modal */}
      {invoiceData && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          invoice={invoiceData}
        />
      )}
    </div>
  );
};
