import React from 'react';
import { X, Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { InvoiceData, downloadInvoicePdf } from '../utils/invoiceGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadInvoicePdf(invoice);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print-hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Official Receipt & Invoice</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Formatted for on-screen & print) */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
                Global Business Generator
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                PAYMENT INVOICE
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Receipt #{invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                PAID & VERIFIED
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Date: <strong className="text-slate-800 font-semibold">{invoice.paymentDate}</strong>
              </p>
            </div>
          </div>

          {/* Customer & Merchant Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed To
              </span>
              <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
              <div className="text-slate-600">{invoice.customerEmail}</div>
              <div className="text-slate-500 pt-1">
                Business Plan: <span className="font-semibold text-slate-800">{invoice.businessPlanName}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Provider
              </span>
              <div className="font-bold text-slate-900 text-sm">PayPal Live</div>
              <div className="text-slate-600">Merchant: {invoice.merchantName}</div>
              <div className="text-slate-500 pt-1">
                Support: <span className="font-semibold text-slate-800">{invoice.supportEmail}</span>
              </div>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-right">Price (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{invoice.packagePurchased}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Full 34-section business plan blueprint, 3-year cash flow projections, financial models, and bank-grade PDF export.
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {invoice.purchaseType}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{invoice.accessType}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                    ${invoice.amountPaid.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right">Total Paid:</td>
                  <td className="py-3 px-4 text-right text-base text-emerald-700">
                    ${invoice.amountPaid.toFixed(2)} USD
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Box */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PayPal Live Verification Record</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PayPal Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.paypalTransactionId}</span>
            </div>
            {invoice.paypalOrderId && (
              <div className="flex justify-between text-slate-600">
                <span>PayPal Order Reference:</span>
                <span className="font-mono text-slate-800">{invoice.paypalOrderId}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Internal Order Reference:</span>
              <span className="font-mono text-slate-800">{invoice.orderId}</span>
            </div>
          </div>

          {/* Bottom Footer Notice */}
          <div className="pt-2 text-center text-xs text-slate-400">
            Thank you for building your business with Global Business Generator. Lifetime access granted for this plan.
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print-hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 inline-flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
