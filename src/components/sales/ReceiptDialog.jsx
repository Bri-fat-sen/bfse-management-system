import React, { useRef, useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";

export default function ReceiptDialog({ open, onOpenChange, sale, organisation }) {
  const receiptRef = useRef(null);
  const { toast } = useToast();
  const [emailTo, setEmailTo] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt - ${sale?.sale_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              background: #f5f5f5;
              padding: 20px;
            }
            .receipt {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .flag-stripe {
              height: 8px;
              display: flex;
            }
            .flag-stripe .green { flex: 1; background-color: #1EB053 !important; -webkit-print-color-adjust: exact !important; }
            .flag-stripe .white { flex: 1; background-color: #FFFFFF !important; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
            .flag-stripe .blue { flex: 1; background-color: #0072C6 !important; -webkit-print-color-adjust: exact !important; }
            .header {
              background-color: #1EB053 !important;
              -webkit-print-color-adjust: exact !important;
              color: white !important;
              padding: 24px;
              text-align: center;
              border-bottom: 4px solid #0072C6;
            }
            .header .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 4px;
              color: white !important;
            }
            .header .tagline {
              font-size: 11px;
              color: rgba(255,255,255,0.9) !important;
            }
            .header .address {
              font-size: 12px;
              color: rgba(255,255,255,0.8) !important;
              margin-top: 8px;
            }
            .receipt-info {
              background-color: #f0fdf4 !important;
              -webkit-print-color-adjust: exact !important;
              padding: 16px 24px;
              border-bottom: 2px solid #1EB053;
              font-size: 13px;
              color: #333;
            }
            .receipt-info p { margin: 4px 0; }
            .items {
              padding: 20px 24px;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: 600;
              font-size: 12px;
              color: #1EB053 !important;
              text-transform: uppercase;
              padding-bottom: 10px;
              border-bottom: 2px dashed #1EB053;
              margin-bottom: 12px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              border-bottom: 1px dotted #ddd;
            }
            .item:last-child { border-bottom: none; }
            .item-name { flex: 1; }
            .item-qty { color: #0072C6 !important; font-size: 12px; font-weight: 600; }
            .totals {
              padding: 16px 24px;
              background-color: #e0f2fe !important;
              -webkit-print-color-adjust: exact !important;
              border-top: 3px solid #0072C6;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 14px;
            }
            .total-row.grand {
              font-size: 20px;
              font-weight: bold;
              color: #1EB053 !important;
              padding-top: 12px;
              margin-top: 8px;
              border-top: 3px solid #1EB053;
            }
            .payment-badge {
              display: inline-block;
              background-color: #1EB053 !important;
              -webkit-print-color-adjust: exact !important;
              color: white !important;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .footer {
              text-align: center;
              padding: 24px;
              background-color: #0F1F3C !important;
              -webkit-print-color-adjust: exact !important;
              color: white !important;
              border-top: 4px solid #1EB053;
            }
            .footer .thanks {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
              color: white !important;
            }
            .footer .pride {
              font-size: 13px;
              color: rgba(255,255,255,0.9) !important;
            }
            .footer .sl-flag {
              margin-top: 12px;
              font-size: 24px;
            }
            @media print {
              body { background: white; padding: 0; }
              .receipt { box-shadow: none; border: 2px solid #1EB053; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="flag-stripe">
              <div class="green"></div>
              <div class="white"></div>
              <div class="blue"></div>
            </div>
            
            <div class="header">
              <div class="logo">🇸🇱 ${organisation?.name || 'BFSE'}</div>
              <div class="tagline">Business Management System</div>
              <div class="address">
                ${organisation?.address || 'Freetown'}, Sierra Leone<br>
                Tel: ${organisation?.phone || '+232 XX XXX XXX'}
              </div>
            </div>
            
            <div class="receipt-info">
              <p><strong>Receipt:</strong> ${sale?.sale_number}</p>
              <p><strong>Date:</strong> ${format(new Date(sale?.created_date), 'dd MMMM yyyy, HH:mm')}</p>
              <p><strong>Cashier:</strong> ${sale?.employee_name || 'Staff'}</p>
              ${sale?.customer_name ? `<p><strong>Customer:</strong> ${sale.customer_name}</p>` : ''}
            </div>
            
            <div class="items">
              <div class="items-header">
                <span>Item</span>
                <span>Amount</span>
              </div>
              ${sale?.items?.map(item => `
                <div class="item">
                  <span class="item-name">
                    ${item.product_name}
                    <span class="item-qty"> × ${item.quantity}</span>
                  </span>
                  <span>SLE ${item.total?.toLocaleString()}</span>
                </div>
              `).join('') || ''}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>SLE ${sale?.subtotal?.toLocaleString()}</span>
              </div>
              ${sale?.tax > 0 ? `
                <div class="total-row">
                  <span>GST</span>
                  <span>SLE ${sale.tax?.toLocaleString()}</span>
                </div>
              ` : ''}
              ${sale?.discount > 0 ? `
                <div class="total-row">
                  <span>Discount</span>
                  <span>-SLE ${sale.discount?.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="total-row grand">
                <span>Total</span>
                <span>SLE ${sale?.total_amount?.toLocaleString()}</span>
              </div>
              <div class="total-row" style="margin-top: 12px;">
                <span>Payment</span>
                <span class="payment-badge">${sale?.payment_method}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="thanks">Thank you for your patronage!</div>
              <div class="pride">Proudly serving Sierra Leone</div>
              <div class="sl-flag">🇸🇱</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=500,height=700');
    printWindow.document.write(getReceiptHTML());
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const htmlContent = getReceiptHTML();
      
      // Open a new window with the receipt HTML
      const printWindow = window.open('', '_blank', 'width=500,height=700');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print dialog (user can save as PDF)
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 300);
        };
        
        toast({ 
          title: "Receipt ready", 
          description: "Choose 'Save as PDF' in the print dialog to download as PDF" 
        });
      } else {
        // Fallback: download as HTML if popup blocked
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt-${sale?.sale_number}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ 
          title: "Receipt downloaded", 
          description: "Open the file in browser and use Print > Save as PDF" 
        });
      }
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
    setDownloading(false);
  };

  const handleEmailReceipt = async () => {
    if (!emailTo) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const receiptHTML = getReceiptHTML();
      await base44.functions.invoke('sendEmailMailersend', {
        to: emailTo,
        toName: sale?.customer_name || 'Customer',
        subject: `Receipt - ${sale?.sale_number} from ${organisation?.name || 'BFSE'}`,
        htmlContent: receiptHTML,
        textContent: `Thank you for your purchase!\n\nReceipt: ${sale?.sale_number}\nTotal: SLE ${sale?.total_amount?.toLocaleString()}\nPayment: ${sale?.payment_method}\n\nThank you for your patronage!`,
        fromName: organisation?.name || 'BFSE Management System',
        replyTo: organisation?.email
      });
      toast({ 
        title: "Email sent successfully", 
        description: `Receipt sent to ${emailTo}` 
      });
      setShowEmailInput(false);
      setEmailTo("");
    } catch (error) {
      toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
    }
    setSending(false);
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
          {/* Flag stripe */}
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white p-4 text-center">
            <p className="font-bold text-lg">{organisation?.name || 'BFSE'}</p>
            <p className="text-xs opacity-80">{organisation?.address || 'Freetown'}, Sierra Leone</p>
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
              {sale?.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>
                    {item.product_name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="font-medium">SLE {item.total?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-dashed pt-3">
              <div className="flex justify-between text-lg font-bold text-[#1EB053]">
                <span>Total</span>
                <span>SLE {sale?.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Payment</span>
                <span className="capitalize bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
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