import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Filter, 
  Search, 
  RefreshCw,
  ArrowUpRight,
  PieChart,
  Calendar,
  Globe,
  Lock,
  ExternalLink,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { OrderRecord } from '../types';
import { paymentGateway, GatewayConfigResponse } from '../services/paymentService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState<OrderRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchOrders = async () => {
    try {
      // 1. Fetch live gateway config
      const cfg = await paymentGateway.getConfig();
      setGatewayConfig(cfg);

      // 2. Fetch from Server API
      const apiOrders = await paymentGateway.getAllOrdersAdmin();

      // 3. Also fetch from Firestore
      let fsOrders: OrderRecord[] = [];
      try {
        const snap = await getDocs(collection(db, 'orders'));
        fsOrders = snap.docs.map(doc => doc.data() as OrderRecord);
      } catch (err) {
        console.debug('[Admin] Firestore orders query deferred:', err);
      }

      // Merge and deduplicate
      const map = new Map<string, OrderRecord>();
      apiOrders.forEach(o => map.set(o.orderId, o));
      fsOrders.forEach(o => map.set(o.orderId, { ...map.get(o.orderId), ...o }));

      const list = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(list);
    } catch (err) {
      console.error('[Admin] Order fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleExecuteRefund = async () => {
    if (!refundTargetOrder) return;
    setIsRefunding(true);
    try {
      const res = await paymentGateway.refundPayment(refundTargetOrder.orderId, refundReason);
      if (res.success) {
        setRefundTargetOrder(null);
        setRefundReason('');
        await fetchOrders();
      } else {
        alert(res.error || 'Failed to process refund.');
      }
    } catch (err: any) {
      alert(err.message || 'Refund processing error.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Metrics Calculations
  const totalOrders = orders.length;
  const successfulPayments = orders.filter(o => o.status === 'paid' || (o.status as string) === 'completed').length;
  const failedPayments = orders.filter(o => o.status === 'failed').length;
  const refundedPayments = orders.filter(o => o.status === 'refunded').length;
  const pendingPayments = orders.filter(o => o.status === 'payment_pending' || o.status === 'pending').length;

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || (o.status as string) === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const refundedRevenue = orders
    .filter(o => o.status === 'refunded')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const proCount = orders.filter(o => o.productPackage === 'pro' && (o.status === 'paid' || (o.status as string) === 'completed')).length;
  const investorCount = orders.filter(o => o.productPackage === 'investor' && (o.status === 'paid' || (o.status as string) === 'completed')).length;

  const conversionRate = totalOrders > 0 
    ? ((successfulPayments / totalOrders) * 100).toFixed(1) 
    : '0.0';

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'paid'
        ? (o.status === 'paid' || (o.status as string) === 'completed')
        : o.status === statusFilter;

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      o.orderId.toLowerCase().includes(term) ||
      o.customerEmail?.toLowerCase().includes(term) ||
      o.planId.toLowerCase().includes(term) ||
      o.productPackage.toLowerCase().includes(term) ||
      o.providerOrderId?.toLowerCase().includes(term) ||
      o.providerTransactionId?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <div id="admin-orders-view" className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>PayPal Production Revenue & Order Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order & Entitlement Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking for global orders, customer PayPal payments, entitlements, refunds, and package conversion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Gateway Status Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold italic text-lg shadow-inner">
            P
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">PayPal Payment Gateway</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Live Production Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Merchant Account: <strong className="text-slate-200">{gatewayConfig?.merchantEmail || 'topogabolekwe@gmail.com'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Server-Authoritative Pricing</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>HMAC Signed Entitlements</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Webhook: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-emerald-400">/api/payments/webhook</code></span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${totalRevenue.toLocaleString()}
            <span className="text-xs font-semibold text-slate-400 ml-1">USD</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Net Settled Revenue</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
          <p className="text-[10px] text-slate-500 mt-1">Orders Initiated</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid / Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{successfulPayments}</div>
          <p className="text-[10px] text-slate-500 mt-1">Verified Entitlements</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{conversionRate}%</div>
          <p className="text-[10px] text-slate-500 mt-1">Order-to-Paid Rate</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Refunds</span>
            <RotateCcw className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{refundedPayments}</div>
          <p className="text-[10px] text-purple-600 font-bold mt-1">-${refundedRevenue} USD</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Failed</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{failedPayments}</div>
          <p className="text-[10px] text-slate-500 mt-1">Gateway Drops</p>
        </div>
      </div>

      {/* Package Breakdown Distribution Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pro Business Plan ($29 USD)
            </h4>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Full 34-Sections
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{proCount}</div>
          <p className="text-xs text-slate-500 mt-1">
            ${(proCount * 29).toLocaleString()} USD generated
          </p>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${successfulPayments > 0 ? (proCount / successfulPayments) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Investor Package ($69 USD)
            </h4>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Pitch & Grants
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{investorCount}</div>
          <p className="text-xs text-slate-500 mt-1">
            ${(investorCount * 69).toLocaleString()} USD generated
          </p>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full" 
              style={{ width: `${successfulPayments > 0 ? (investorCount / successfulPayments) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Average Order Value (AOV)
            </h4>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              PayPal Verified
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ${successfulPayments > 0 ? (totalRevenue / successfulPayments).toFixed(2) : '0.00'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            USD per converted checkout
          </p>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-3/4" />
          </div>
        </div>
      </div>

      {/* Orders Ledger Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="paid">Paid & Verified ({successfulPayments})</option>
              <option value="payment_pending">Pending Authorization ({pendingPayments})</option>
              <option value="refunded">Refunded ({refundedPayments})</option>
              <option value="failed">Failed / Dropped ({failedPayments})</option>
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order, PayPal ID, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ledger Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-3" />
            Loading PayPal order ledger...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching orders found for this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Internal Order ID & Date</th>
                  <th className="py-3 px-4">PayPal IDs (Order / Txn)</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isPaid = order.status === 'paid' || (order.status as string) === 'completed';
                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] font-bold text-slate-900">
                          {order.orderId}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-blue-700 font-semibold">
                          Order: {order.providerOrderId || '—'}
                        </div>
                        <div className="font-mono text-[10px] text-emerald-700">
                          Txn: {order.providerTransactionId || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{order.customerEmail || 'customer@globalbusinessgenerator.com'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Plan: {order.planId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full capitalize ${
                          order.productPackage === 'investor'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {order.productPackage === 'investor' ? 'Investor / Funding ($69)' : 'Pro Plan ($29)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-slate-900">
                        ${order.amount}.00 {order.currency}
                      </td>

                      <td className="py-3 px-4">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid</span>
                          </span>
                        )}
                        {(order.status === 'payment_pending' || order.status === 'pending') && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <span>Pending</span>
                          </span>
                        )}
                        {order.status === 'refunded' && (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <RotateCcw className="w-3 h-3" />
                            <span>Refunded</span>
                          </span>
                        )}
                        {order.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <Ban className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isPaid && (
                          <button
                            onClick={() => setRefundTargetOrder(order)}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition"
                          >
                            Refund
                          </button>
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

      {/* Admin Refund Confirmation Modal */}
      {refundTargetOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-purple-700 font-bold text-base mb-2">
              <RotateCcw className="w-5 h-5" />
              <span>Process Customer Refund</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Refunding this order will set its status to <strong className="text-purple-700">refunded</strong> and immediately revoke the plan entitlement on the server.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs space-y-1">
              <div><strong>Order ID:</strong> {refundTargetOrder.orderId}</div>
              <div><strong>PayPal Txn:</strong> {refundTargetOrder.providerTransactionId || 'N/A'}</div>
              <div><strong>Amount:</strong> ${refundTargetOrder.amount} {refundTargetOrder.currency}</div>
              <div><strong>Package:</strong> {refundTargetOrder.productPackage}</div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Refund (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Customer request within 30 days"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRefundTargetOrder(null)}
                disabled={isRefunding}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                disabled={isRefunding}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition"
              >
                {isRefunding ? 'Processing...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
