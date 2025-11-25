import React, { useRef } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

export default function ReceiptDialog({ open, onOpenChange, sale, organisation }) {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale?.sale_number}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .logo { font-size: 16px; font-weight: bold; }
            .flag { display: flex; justify-content: center; gap: 2px; margin-bottom: 5px; }
            .flag span { width: 20px; height: 8px; }
            .green { background: #1EB053; }
            .white { background: #fff; border: 1px solid #ccc; }
            .blue { background: #0072C6; }
            .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white p-4 font-mono text-sm">
          {/* Header with SL Flag */}
          <div className="text-center border-b border-dashed pb-3 mb-3">
            <div className="flex justify-center gap-1 mb-2">
              <span className="w-6 h-2 bg-[#1EB053] rounded-sm" />
              <span className="w-6 h-2 bg-white border rounded-sm" />
              <span className="w-6 h-2 bg-[#0072C6] rounded-sm" />
            </div>
            <p className="font-bold text-lg">{organisation?.name || 'BFSE'}</p>
            <p className="text-xs text-gray-500">{organisation?.address || 'Freetown, Sierra Leone'}</p>
            <p className="text-xs text-gray-500">Tel: {organisation?.phone || '+232 XX XXX XXX'}</p>
          </div>

          {/* Sale Info */}
          <div className="text-xs text-gray-600 mb-3">
            <p>Receipt: {sale.sale_number}</p>
            <p>Date: {format(new Date(sale.created_date), 'dd/MM/yyyy HH:mm')}</p>
            <p>Cashier: {sale.employee_name}</p>
            {sale.customer_name && <p>Customer: {sale.customer_name}</p>}
          </div>

          {/* Items */}
          <div className="border-b border-dashed pb-3 mb-3">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span>Item</span>
              <span>Total</span>
            </div>
            {sale.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-xs mb-1">
                <span className="flex-1">
                  {item.product_name}
                  <span className="text-gray-500 ml-1">x{item.quantity}</span>
                </span>
                <span>SLE {item.total?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>SLE {sale.subtotal?.toLocaleString()}</span>
            </div>
            {sale.tax > 0 && (
              <div className="flex justify-between text-xs">
                <span>Tax (GST):</span>
                <span>SLE {sale.tax?.toLocaleString()}</span>
              </div>
            )}
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs">
                <span>Discount:</span>
                <span>-SLE {sale.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-dashed">
              <span>TOTAL:</span>
              <span>SLE {sale.total_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Payment:</span>
              <span className="capitalize">{sale.payment_method}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-dashed pt-3">
            <p>Thank you for your patronage!</p>
            <p>🇸🇱 Proudly Sierra Leonean</p>
            <p className="mt-2">*** End of Receipt ***</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1 bg-[#1EB053] hover:bg-[#178f43]">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}