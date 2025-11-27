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

  const getInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .invoice { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); color: white; padding: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .header .company { flex: 1; }
            .header .company h1 { font-size: 28px; margin-bottom: 8px; }
            .header .company p { opacity: 0.9; font-size: 14px; }
            .header .invoice-info { text-align: right; }
            .header .invoice-info h2 { font-size: 24px; margin-bottom: 8px; }
            .header .invoice-info p { font-size: 14px; opacity: 0.9; }
            .flag-stripe { height: 6px; display: flex; }
            .flag-stripe .green { flex: 1; background: #1EB053; }
            .flag-stripe .white { flex: 1; background: #FFFFFF; }
            .flag-stripe .blue { flex: 1; background: #0072C6; }
            .body { padding: 30px; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .party { flex: 1; }
            .party h3 { color: #1EB053; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
            .party p { font-size: 14px; color: #333; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background: #f8f9fa; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #1EB053; }
            .items-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .items-table .amount { text-align: right; }
            .totals { display: flex; justify-content: flex-end; }
            .totals-table { width: 300px; }
            .totals-table tr td { padding: 8px 12px; font-size: 14px; }
            .totals-table tr td:last-child { text-align: right; }
            .totals-table .grand-total { background: #1EB053; color: white; font-weight: bold; font-size: 18px; }
            .footer { background: #0F1F3C; color: white; padding: 20px 30px; text-align: center; font-size: 12px; }
            .notes { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .notes h4 { color: #0072C6; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
            .payment-info { background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #1EB053; }
            .payment-info h4 { color: #1EB053; margin-bottom: 8px; }
            @media print { body { background: white; padding: 0; } .invoice { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="company">
                <h1>🇸🇱 ${organisation?.name || 'BFSE'}</h1>
                <p>${organisation?.address || 'Freetown'}, Sierra Leone</p>
                <p>Tel: ${organisation?.phone || '+232 XX XXX XXX'}</p>
                ${organisation?.email ? `<p>Email: ${organisation.email}</p>` : ''}
                ${organisation?.tin_number ? `<p>TIN: ${organisation.tin_number}</p>` : ''}
              </div>
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>${invoiceNumber}</strong></p>
                <p>Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
                <p>Due: ${format(dueDate, 'dd MMMM yyyy')}</p>
              </div>
            </div>
            
            <div class="flag-stripe">
              <div class="green"></div>
              <div class="white"></div>
              <div class="blue"></div>
            </div>
            
            <div class="body">
              <div class="parties">
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
                  <p style="margin-top: 10px;"><strong>Status:</strong></p>
                  <p style="color: #f59e0b; font-weight: bold;">PENDING</p>
                </div>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th class="amount">Unit Price</th>
                    <th class="amount">Amount</th>
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
              
              <div class="totals">
                <table class="totals-table">
                  <tr>
                    <td>Subtotal</td>
                    <td>SLE ${cartTotal.toLocaleString()}</td>
                  </tr>
                  ${invoiceData.include_tax ? `
                    <tr>
                      <td>GST (${invoiceData.tax_rate}%)</td>
                      <td>SLE ${taxAmount.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  <tr class="grand-total">
                    <td>Total Due</td>
                    <td>SLE ${totalWithTax.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              ${invoiceData.notes ? `
                <div class="notes">
                  <h4>Notes</h4>
                  <p>${invoiceData.notes}</p>
                </div>
              ` : ''}
              
              <div class="payment-info">
                <h4>Payment Information</h4>
                <p>Please make payment within ${invoiceData.payment_terms} days to avoid late fees.</p>
                <p>For questions regarding this invoice, please contact us.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your business! 🇸🇱</p>
              <p style="margin-top: 8px; opacity: 0.7;">This invoice was generated by ${organisation?.name || 'BFSE Management System'}</p>
            </div>
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
      await base44.functions.invoke('sendEmailMailersend', {
        to: invoiceData.customer_email,
        toName: invoiceData.customer_name,
        subject: `Invoice ${invoiceNumber} from ${organisation?.name || 'BFSE'} - Payment Due ${format(dueDate, 'dd MMM yyyy')}`,
        htmlContent: getInvoiceHTML(),
        textContent: `Invoice ${invoiceNumber}\n\nDear ${invoiceData.customer_name},\n\nPlease find attached your invoice for SLE ${totalWithTax.toLocaleString()}.\n\nPayment Due: ${format(dueDate, 'dd MMMM yyyy')}\n\nThank you for your business!`,
        fromName: organisation?.name || 'BFSE Management System',
        replyTo: organisation?.email
      });
      
      toast.success("Invoice sent!", { description: `Sent to ${invoiceData.customer_email}` });
    } catch (error) {
      toast.error("Failed to send invoice", { description: error.message });
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
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
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
            <div className="p-4 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl border">
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
                  <span className="text-[#1EB053]">SLE {totalWithTax.toLocaleString()}</span>
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
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
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