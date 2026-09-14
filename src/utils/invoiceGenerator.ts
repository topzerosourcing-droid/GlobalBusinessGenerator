import { jsPDF } from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  paymentDate: string;
  customerName: string;
  customerEmail: string;
  businessPlanName: string;
  packagePurchased: string;
  packageId: 'pro' | 'investor';
  amountPaid: number;
  currency: string;
  paypalTransactionId: string;
  paypalOrderId?: string;
  paymentStatus: 'PAID';
  purchaseType: string;
  accessType: string;
  supportEmail: string;
  merchantName: string;
}

/**
 * Generate and trigger download of an official PDF invoice for the purchase
 */
export function downloadInvoicePdf(invoice: InvoiceData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // slate-900
  const emeraldColor = [5, 150, 105]; // emerald-600
  const slateMuted = [100, 116, 139]; // slate-500
  const lightBg = [248, 250, 252]; // slate-50

  // 1. Header Banner
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(0, 0, 210, 45, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GLOBAL BUSINESS GENERATOR', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Strategic AI Business Planning • Bank & Investor Ready', 20, 28);
  doc.text('https://globalbusinessgenerator.vercel.app', 20, 33);

  // Status Badge (PAID)
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.roundedRect(145, 14, 45, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL RECEIPT: PAID', 148, 22);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // 2. Invoice Meta Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PAYMENT RECEIPT & INVOICE', 20, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);

  doc.text(`Receipt / Reference #: ${invoice.invoiceNumber}`, 20, 66);
  doc.text(`Internal Order ID: ${invoice.orderId}`, 20, 72);
  doc.text(`Payment Date: ${invoice.paymentDate}`, 20, 78);
  doc.text(`Payment Gateway: PayPal Live`, 20, 84);

  doc.text(`Billed To: ${invoice.customerName}`, 120, 66);
  doc.text(`Email: ${invoice.customerEmail}`, 120, 72);
  doc.text(`Business Plan: ${invoice.businessPlanName}`, 120, 78);
  doc.text(`Support: ${invoice.supportEmail}`, 120, 84);

  // 3. Line Items Table Header
  const tableTop = 96;
  doc.setFillColor(241, 245, 249);
  doc.rect(20, tableTop, 170, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ITEM / PACKAGE DESCRIPTION', 24, tableTop + 5.5);
  doc.text('TYPE', 120, tableTop + 5.5);
  doc.text('AMOUNT', 165, tableTop + 5.5);

  // 4. Line Item Content
  const itemRowY = tableTop + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoice.packagePurchased, 24, itemRowY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`• Full 34-Section Strategic Blueprint for "${invoice.businessPlanName}"`, 24, itemRowY + 6);
  doc.text('• 3-Year Cash-Flow & Revenue Forecasts, Break-Even & Operational Models', 24, itemRowY + 11);
  doc.text('• Bank-Grade Executive PDF Export & Presentation Suite', 24, itemRowY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text(invoice.purchaseType, 120, itemRowY);
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(invoice.accessType, 120, itemRowY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`$${invoice.amountPaid.toFixed(2)} ${invoice.currency}`, 165, itemRowY);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, itemRowY + 24, 190, itemRowY + 24);

  // 5. Totals
  const totalY = itemRowY + 34;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Subtotal:', 140, totalY);
  doc.text(`$${invoice.amountPaid.toFixed(2)}`, 175, totalY);

  doc.text('Tax (VAT/Sales Tax):', 140, totalY + 6);
  doc.text('$0.00', 175, totalY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Total Paid (USD):', 140, totalY + 14);
  doc.text(`$${invoice.amountPaid.toFixed(2)}`, 175, totalY + 14);

  // 6. Payment Confirmation Box
  const confirmBoxY = totalY + 26;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(20, confirmBoxY, 170, 32, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, confirmBoxY, 170, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PAYPAL VERIFIED TRANSACTION DETAILS', 26, confirmBoxY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`PayPal Capture Transaction ID: ${invoice.paypalTransactionId}`, 26, confirmBoxY + 15);
  if (invoice.paypalOrderId) {
    doc.text(`PayPal Order Reference: ${invoice.paypalOrderId}`, 26, confirmBoxY + 21);
  }
  doc.text(`Payment Status: ${invoice.paymentStatus} • Verified Server-Side • Non-recurring`, 26, confirmBoxY + 27);

  // 7. Footer / Terms
  const footerY = confirmBoxY + 44;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Terms & Guarantee: This is a verified one-time purchase with lifetime access for this business plan.', 20, footerY);
  doc.text(`For customer support, billing inquiries, or receipts, contact: ${invoice.supportEmail}`, 20, footerY + 5);
  doc.text('Global Business Generator • All Rights Reserved.', 20, footerY + 10);

  // Save the PDF
  const safePlanName = invoice.businessPlanName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
  doc.save(`Invoice_${safePlanName}_${invoice.orderId}.pdf`);
}
