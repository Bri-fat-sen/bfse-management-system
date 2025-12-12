import React, { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Download, Mail, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";
import { safeNumber, formatNumber } from "@/components/utils/calculations";

export default function ReceiptDialog({ open, onOpenChange, sale, organisation }) {
  const receiptRef = useRef(null);
  const [emailTo, setEmailTo] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      setEmailTo(sale?.customer_phone || "");
      setShowEmailInput(false);
      setSending(false);
      setDownloading(false);
    }
  }, [open, sale]);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  
  // Safe formatting helper
  const formatAmount = (amount) => formatNumber(safeNumber(amount));

  const getReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt - ${sale?.sale_number}</title>
          <style>
            ${getUnifiedPDFStyles(organisation, 'receipt')}
            
            /* Receipt-specific overrides */
            .totals-section {
              padding: 16px 24px;
              border-top: 2px dashed var(--gray-200);
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.grand {
              margin-top: 12px;
              padding: 16px;
              background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
              color: white !important;
              border-radius: 10px;
              font-size: 18px;
              font-weight: 700;
            }
            .payment-badge {
              display: inline-block;
              padding: 4px 12px;
              background: #dcfce7;
              color: #166534;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
            }
          </style>
        </head>
        <body>
          <div class="document">
            ${getUnifiedHeader(organisation, 'Receipt', sale?.sale_number, format(new Date(sale?.created_date), 'dd MMM yyyy, HH:mm'), 'receipt')}
            
            <div class="info-bar">
              <div class="info-item">
                <span class="label">Cashier:</span>
                <span class="value">${sale?.employee_name || 'Staff'}</span>
              </div>
              ${sale?.customer_name ? `
                <div class="info-item">
                  <span class="label">Customer:</span>
                  <span class="value">${sale.customer_name}</span>
                </div>
              ` : ''}
              ${sale?.location ? `
                <div class="info-item">
                  <span class="label">Location:</span>
                  <span class="value">${sale.location}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="content">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(sale?.items || []).map(item => `
                    <tr>
                      <td>
                        ${item.product_name || 'Item'}
                        <span style="color: var(--secondary); font-size: 12px; font-weight: 600;"> × ${safeNumber(item.quantity, 1)}</span>
                      </td>
                      <td class="amount">SLE ${formatNumber(safeNumber(item.total))}</td>
                    </tr>
                  `).join('') || ''}
                </tbody>
              </table>
            </div>
            
            <div class="totals-section">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>SLE ${formatAmount(sale?.subtotal)}</span>
              </div>
              ${safeNumber(sale?.tax) > 0 ? `
                <div class="totals-row">
                  <span>GST</span>
                  <span>SLE ${formatAmount(sale.tax)}</span>
                </div>
              ` : ''}
              ${safeNumber(sale?.discount) > 0 ? `
                <div class="totals-row">
                  <span>Discount</span>
                  <span>-SLE ${formatAmount(sale.discount)}</span>
                </div>
              ` : ''}
              <div class="totals-row grand">
                <span>Total</span>
                <span>SLE ${formatAmount(sale?.total_amount)}</span>
              </div>
              <div class="totals-row" style="margin-top: 12px;">
                <span>Payment</span>
                <span class="payment-badge">${sale?.payment_method}</span>
              </div>
            </div>
            
            ${getUnifiedFooter(organisation)}
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    // Use hidden iframe for cleaner PDF experience
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(getReceiptHTML());
    doc.close();
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);
    };
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await base44.functions.invoke('generateDocumentPDF', {
        documentType: 'receipt',
        data: sale,
        organisation: organisation
      });
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${sale?.sale_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback: Open print dialog for PDF save
      const htmlContent = getReceiptHTML();
      const pdfWindow = window.open('', '_blank', 'width=500,height=700');
      if (pdfWindow) {
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        pdfWindow.document.title = `Receipt-${sale?.sale_number}.pdf`;
        setTimeout(() => pdfWindow.print(), 500);
      }
      toast.info("Use print dialog to save as PDF");
    }
    setDownloading(false);
  };

  const handleEmailReceipt = async () => {
    if (!emailTo) {
      toast.error("Please enter an email address");
      return;
    }
    setSending(true);
    try {
      const receiptHTML = getReceiptHTML();
      const response = await base44.functions.invoke('sendEmailMailersend', {
        to: emailTo,
        toName: sale?.customer_name || 'Customer',
        subject: `Receipt - ${sale?.sale_number} from ${organisation?.name || 'Our Company'}`,
        htmlContent: receiptHTML,
        textContent: `Thank you for your purchase!\n\nReceipt: ${sale?.sale_number}\nTotal: SLE ${formatAmount(sale?.total_amount)}\nPayment: ${sale?.payment_method}\n\nThank you for your patronage!`,
        fromName: organisation?.name || 'Our Company',
        replyTo: organisation?.email
      });
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      toast.success("Email sent successfully", { 
        description: `Receipt sent to ${emailTo}` 
      });
      setShowEmailInput(false);
      setEmailTo("");
    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send email", { description: error.message || "Please try again" });
    }
    setSending(false);
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <span className="w-3 h-3 bg-[#1EB053] rounded-sm" />
              <span className="w-3 h-3 bg-white border rounded-sm" />
              <span className="w-3 h-3 bg-[#0072C6] rounded-sm" />
            </div>
            Receipt - {sale?.sale_number}
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div ref={receiptRef} className="bg-gray-50 rounded-xl overflow-hidden border">
          {/* Flag stripe with org colors */}
          <div className="h-2 flex">
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-1 bg-white" />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
          
          {/* Header with Logo */}
          <div 
            className="text-white p-4 text-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
          >
            {organisation?.logo_url && (
              <img 
                src={organisation.logo_url} 
                alt={organisation?.name}
                className="h-10 mx-auto mb-2 object-contain bg-white/20 rounded px-2 py-1"
              />
            )}
            <p className="font-bold text-lg">{organisation?.name || 'BFSE'}</p>
            <p className="text-xs opacity-80">{organisation?.address || 'Freetown'}, {organisation?.country || 'Sierra Leone'}</p>
          </div>

          <div className="p-4 space-y-3">
            {/* Info */}
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{format(new Date(sale?.created_date), 'dd MMM yyyy, HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{sale?.employee_name}</span>
              </div>
              {sale?.customer_name && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{sale.customer_name}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t border-dashed pt-3">
              {(sale?.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>
                    {item.product_name || 'Item'} <span className="text-gray-400">×{safeNumber(item.quantity, 1)}</span>
                  </span>
                  <span className="font-medium">SLE {formatAmount(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-dashed pt-3">
              <div className="flex justify-between text-lg font-bold" style={{ color: primaryColor }}>
                <span>Total</span>
                <span>SLE {formatAmount(sale?.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Payment</span>
                <span 
                  className="capitalize px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {sale?.payment_method}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <p>Thank you for your patronage! 🇸🇱</p>
            </div>
          </div>
        </div>

        {/* Email Input */}
        {showEmailInput && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                placeholder="customer@email.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleEmailReceipt} 
              disabled={sending}
              className="bg-[#0072C6] hover:bg-[#005a9e]"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handlePrint} className="bg-[#1EB053] hover:bg-[#178f43]">
            <Printer className="w-4 h-4 mr-1" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            variant="outline"
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
            Download
          </Button>
          <Button 
            onClick={() => setShowEmailInput(!showEmailInput)} 
            variant="outline"
            className={showEmailInput ? "border-[#0072C6] text-[#0072C6]" : ""}
          >
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
        </div>

        <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}