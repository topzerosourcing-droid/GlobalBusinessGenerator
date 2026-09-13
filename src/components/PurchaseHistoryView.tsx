import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  FileText, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { OrderRecord, BusinessPlan } from '../types';
import { paymentGateway } from '../services/paymentService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PurchaseHistoryViewProps {
  userId: string;
  plans: BusinessPlan[];
  onOpenPlan: (plan: BusinessPlan) => void;
  onNavigateToPlans: () => void;
}

export const PurchaseHistoryView: React.FC<PurchaseHistoryViewProps> = ({
  userId,
  plans,
  onOpenPlan,
  onNavigateToPlans
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadUserOrders() {
      setLoading(true);
      try {
        // Fetch from server API
        const serverOrders = await paymentGateway.getUserOrders(userId);

        // Also attempt to query Firestore orders
        let fsOrders: OrderRecord[] = [];
        try {
          const q = query(collection(db, 'orders'), where('userId', '==', userId));
          const snap = await getDocs(q);
          fsOrders = snap.docs.map(doc => doc.data() as OrderRecord);
        } catch (fsErr) {
          console.debug('[PurchaseHistory] Firestore query deferred:', fsErr);
        }

        // Merge orders deduplicated by orderId
        const orderMap = new Map<string, OrderRecord>();
        serverOrders.forEach(o => orderMap.set(o.orderId, o));
        fsOrders.forEach(o => orderMap.set(o.orderId, { ...orderMap.get(o.orderId), ...o }));

        if (mounted) {
          const sorted = Array.from(orderMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
        }
      } catch (err) {
        console.error('[PurchaseHistory] Load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUserOrders();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const filteredOrders = orders.filter(o => {
    const matchTerm = searchTerm.toLowerCase();
    const associatedPlan = plans.find(p => p.id === o.planId);
    const planName = associatedPlan?.input.businessName.toLowerCase() || '';
    return (
      o.orderId.toLowerCase().includes(matchTerm) ||
      o.productPackage.toLowerCase().includes(matchTerm) ||
      planName.includes(matchTerm)
    );
  });

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid & Unlocked</span>
          </span>
        );
      case 'payment_pending':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refunded</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div id="purchase-history-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
            <Receipt className="h-3.5 w-3.5" />
            <span>Billing & Entitlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Purchase History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review verified licenses, one-time package receipts, and direct access links to your unlocked business plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
            </input>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-3" />
            Loading purchase history...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No purchases found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't upgraded any business plans yet. Free plans can be previewed or upgraded anytime with instant unlock.
            </p>
            <button
              onClick={onNavigateToPlans}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <span>View Your Plans</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Business Plan</th>
                  <th className="py-3 px-4">Package Type</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Access Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const associatedPlan = plans.find(p => p.id === order.planId);
                  const isInvestor = order.productPackage === 'investor';

                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-900 font-bold text-[11px]">
                          {order.orderId}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {associatedPlan ? (
                          <div className="flex items-center space-x-1.5">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate max-w-[200px]">{associatedPlan.input.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">{order.planId}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                          isInvestor
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isInvestor && <Sparkles className="w-3 h-3" />}
                          <span className="capitalize">{order.productPackage}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ${order.amount} {order.currency}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {associatedPlan ? (
                          <button
                            id={`btn-open-plan-${order.orderId}`}
                            onClick={() => onOpenPlan(associatedPlan)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-200/80"
                          >
                            <span>Open Plan</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security & Verification Guarantee */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Every purchase includes a cryptographically signed HMAC-SHA256 entitlement token and lifetime plan access.
          </span>
        </div>
        <span className="font-semibold text-slate-700 shrink-0">
          Zero monthly subscription fees.
        </span>
      </div>
    </div>
  );
};
