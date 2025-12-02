import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Send, 
  Loader2, 
  Printer, 
  Download,
  Building2,
  Calendar,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function InvoiceDialog({ 
  open, 
  onOpenChange, 
  cart, 
  cartTotal, 
  customer,
  organisation,
  currentEmployee,
  onInvoiceCreated
}) {
  const [invoiceData, setInvoiceData] = useState({
    customer_name: customer?.name || '',
    customer_email: customer?.email || '',
    customer_phone: customer?.phone || '',
    customer_address: customer?.address || '',
    company_name: customer?.company_name || '',
    tax_id: customer?.tax_id || '',
    payment_terms: '30', // days
    notes: '',
    include_tax: false,
    tax_rate: 15
  });
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const taxAmount = invoiceData.include_tax ? (cartTotal * invoiceData.tax_rate / 100) : 0;
  const totalWithTax = cartTotal + taxAmount;
  const dueDate = addDays(new Date(), parseInt(invoiceData.payment_terms) || 30);
  const invoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const getInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            ${getUnifiedPDFStyles(organisation, 'invoice')}
            
            /* Invoice-specific styles */
            .totals-wrapper {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
            }
            .totals-box {
              width: 300px;
              border: 2px solid ${primaryColor}20;
              border-radius: 12px;
              overflow: hidden;
            }
            .totals-box .row {
              display: flex;
              justify-content: space-between;
              padding: 12px 16px;
              font-size: 14px;
            }
            .totals-box .row:not(:last-child) {
              border-bottom: 1px solid #eee;
            }
            .totals-box .row.grand {
              background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
              color: white;
              font-weight: 700;
              font-size: 18px;
            }
            .payment-box {
              background: ${primaryColor}10;
              padding: 16px 20px;
              border-radius: 10px;
              border-left: 4px solid ${primaryColor};
              margin-top: 24px;
            }
            .payment-box h4 {
              color: ${primaryColor};
              margin-bottom: 8px;
              font-weight: 600;
              font-size: 13px;
            }
            .payment-box p {
              font-size: 13px;
              color: #555;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="document">
            ${getUnifiedHeader(organisation, 'Invoice', invoiceNumber, format(new Date(), 'dd MMM yyyy'), 'invoice')}
            
            <div class="content">
              <div class="parties-grid">
                <div class="party">
                  <h3>Bill To</h3>
                  ${invoiceData.company_name ? `<p><strong>${invoiceData.company_name}</strong></p>` : ''}
                  <p>${invoiceData.customer_name}</p>
                  ${invoiceData.customer_address ? `<p>${invoiceData.customer_address}</p>` : ''}
                  ${invoiceData.customer_phone ? `<p>Tel: ${invoiceData.customer_phone}</p>` : ''}
                  ${invoiceData.customer_email ? `<p>Email: ${invoiceData.customer_email}</p>` : ''}
                  ${invoiceData.tax_id ? `<p>Tax ID: ${invoiceData.tax_id}</p>` : ''}
                </div>
                <div class="party" style="text-align: right;">
                  <h3>Payment Terms</h3>
                  <p>Net ${invoiceData.payment_terms} days</p>
                  <p style="margin-top: 12px;"><strong>Due Date:</strong></p>
                  <p style="font-size: 16px; font-weight: 600; color: ${secondaryColor};">${format(dueDate, 'dd MMMM yyyy')}</p>
                  <p style="margin-top: 10px;"><span class="badge warning">PENDING</span></p>
                </div>
              </div>
              
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="width: 60px;">Qty</th>
                    <th class="amount" style="width: 120px;">Unit Price</th>
                    <th class="amount" style="width: 120px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.map(item => `
                    <tr>
                      <td>${item.product_name}</td>
                      <td>${item.quantity}</td>
                      <td class="amount">SLE ${item.unit_price?.toLocaleString()}</td>
                      <td class="amount">SLE ${item.total?.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals-wrapper">
                <div class="totals-box">
                  <div class="row">
                    <span>Subtotal</span>
                    <span>SLE ${cartTotal.toLocaleString()}</span>
                  </div>
                  ${invoiceData.include_tax ? `
                    <div class="row">
                      <span>GST (${invoiceData.tax_rate}%)</span>
                      <span>SLE ${taxAmount.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  <div class="row grand">
                    <span>Total Due</span>
                    <span>SLE ${totalWithTax.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              ${invoiceData.notes ? `
                <div class="note-box">
                  <h4>Notes</h4>
                  <p>${invoiceData.notes}</p>
                </div>
              ` : ''}
              
              <div class="payment-box">
                <h4>Payment Information</h4>
                <p>Please make payment within ${invoiceData.payment_terms} days to avoid late fees.</p>
                <p>For questions regarding this invoice, please contact us at ${organisation?.phone || ''} or ${organisation?.email || ''}.</p>
              </div>
            </div>
            
            ${getUnifiedFooter(organisation)}
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(getInvoiceHTML());
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(getInvoiceHTML());
    printWindow.document.close();
    printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
    toast.info("Choose 'Save as PDF' in the print dialog");
  };

  const handleSendInvoice = async () => {
    if (!invoiceData.customer_email) {
      toast.error("Please enter customer email");
      return;
    }

    setIsSending(true);
    try {
      const response = await base44.functions.invoke('sendEmailMailersend', {
        to: invoiceData.customer_email,
        toName: invoiceData.customer_name,
        subject: `Invoice ${invoiceNumber} from ${organisation?.name || 'Our Company'} - Payment Due ${format(dueDate, 'dd MMM yyyy')}`,
        htmlContent: getInvoiceHTML(),
        textContent: `Invoice ${invoiceNumber}\n\nDear ${invoiceData.customer_name},\n\nPlease find attached your invoice for SLE ${totalWithTax.toLocaleString()}.\n\nPayment Due: ${format(dueDate, 'dd MMMM yyyy')}\n\nThank you for your business!`,
        fromName: organisation?.name || 'Our Company',
        replyTo: organisation?.email
      });
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      toast.success("Invoice sent!", { description: `Sent to ${invoiceData.customer_email}` });
    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send invoice", { description: error.message || "Please try again" });
    }
    setIsSending(false);
  };

  const handleCreateInvoiceSale = async () => {
    setIsCreating(true);
    try {
      const saleData = {
        sale_number: invoiceNumber,
        sale_type: 'warehouse',
        customer_name: invoiceData.customer_name,
        customer_id: customer?.id,
        customer_phone: invoiceData.customer_phone,
        items: cart,
        subtotal: cartTotal,
        tax: taxAmount,
        total_amount: totalWithTax,
        payment_method: 'credit',
        payment_status: 'pending',
        notes: `Invoice sent to ${invoiceData.customer_email}. Due: ${format(dueDate, 'dd MMM yyyy')}. ${invoiceData.notes}`
      };

      if (onInvoiceCreated) {
        onInvoiceCreated(saleData);
      }

      // Send invoice email
      if (invoiceData.customer_email) {
        await handleSendInvoice();
      }

      toast.success("Invoice created", { description: `Invoice ${invoiceNumber} created and sent` });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create invoice");
    }
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {organisation?.logo_url && (
              <img src={organisation.logo_url} alt="" className="h-8 object-contain" />
            )}
            <div className="flex h-1 w-16 rounded-full overflow-hidden">
              <div className="flex-1" style={{ backgroundColor: primaryColor }} />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
            </div>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: secondaryColor }} />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
              <Building2 className="w-4 h-4" /> Customer Details
            </h3>
            
            <div>
              <Label>Company Name</Label>
              <Input
                value={invoiceData.company_name}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Business name (optional)"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Contact Name *</Label>
              <Input
                value={invoiceData.customer_name}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Contact person"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={invoiceData.customer_email}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="billing@company.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={invoiceData.customer_phone}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="+232 XX XXX XXX"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={invoiceData.customer_address}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customer_address: e.target.value }))}
                placeholder="Billing address"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tax ID / TIN</Label>
              <Input
                value={invoiceData.tax_id}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, tax_id: e.target.value }))}
                placeholder="Customer tax ID"
                className="mt-1"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4" /> Invoice Details
            </h3>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-mono font-bold text-lg">{invoiceNumber}</p>
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Select 
                value={invoiceData.payment_terms} 
                onValueChange={(v) => setInvoiceData(prev => ({ ...prev, payment_terms: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Net 7 days</SelectItem>
                  <SelectItem value="14">Net 14 days</SelectItem>
                  <SelectItem value="30">Net 30 days</SelectItem>
                  <SelectItem value="45">Net 45 days</SelectItem>
                  <SelectItem value="60">Net 60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Due Date</p>
              <p className="font-semibold text-blue-800">{format(dueDate, 'dd MMMM yyyy')}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include_tax"
                checked={invoiceData.include_tax}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, include_tax: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="include_tax">Include GST ({invoiceData.tax_rate}%)</Label>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for the customer..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <div 
              className="p-4 rounded-xl border"
              style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)` }}
            >
              <h4 className="font-semibold mb-3">Invoice Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items ({cart.length})</span>
                  <span>SLE {cartTotal.toLocaleString()}</span>
                </div>
                {invoiceData.include_tax && (
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({invoiceData.tax_rate}%)</span>
                    <span>SLE {taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total Due</span>
                  <span style={{ color: primaryColor }}>SLE {totalWithTax.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
          <div className="flex gap-2 flex-1">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSendInvoice}
              disabled={isSending || !invoiceData.customer_email}
            >
              {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Only
            </Button>
            <Button
              onClick={handleCreateInvoiceSale}
              disabled={isCreating || !invoiceData.customer_name}
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Create & Send Invoice
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}