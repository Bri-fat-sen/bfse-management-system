import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Receipt, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

export default function PrintFormsButtons({ organisation }) {
  const toast = useToast();
  const [printingExpense, setPrintingExpense] = useState(false);
  const [printingRevenue, setPrintingRevenue] = useState(false);

  const generateExpenseFormHTML = () => {
    const today = format(new Date(), 'MMMM d, yyyy');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expense Form - ${organisation?.name || 'Organisation'}</title>
        <style>
          @page { size: A4; margin: 1cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #0F1F3C;
            padding: 20px;
          }
          .header {
            border-bottom: 4px solid;
            border-image: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%) 1;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .org-logo { max-height: 60px; margin-bottom: 10px; }
          .org-info h1 { color: #0F1F3C; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .org-info p { color: #666; font-size: 11px; }
          .form-title { 
            background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
          }
          .form-section { margin: 20px 0; }
          .section-title {
            background: #f0f0f0;
            padding: 8px 12px;
            border-left: 4px solid #1EB053;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
          .form-field { flex: 1; }
          .form-field label {
            display: block;
            font-size: 11px;
            font-weight: bold;
            color: #0F1F3C;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .form-field input, .form-field select, .form-field textarea {
            width: 100%;
            border: 1.5px solid #ddd;
            border-radius: 4px;
            padding: 8px 10px;
            font-size: 13px;
            font-family: inherit;
          }
          .form-field textarea { min-height: 60px; resize: vertical; }
          .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 8px; }
          .checkbox-item { display: flex; align-items: center; gap: 6px; }
          .checkbox-item input { width: 16px; height: 16px; }
          .checkbox-item label { font-size: 12px; font-weight: normal; }
          .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
          }
          .signature-box {
            border-top: 2px solid #0F1F3C;
            padding-top: 8px;
          }
          .signature-box p { font-size: 11px; font-weight: bold; color: #666; }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 4px solid;
            border-image: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%) 1;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${organisation?.logo_url ? `<img src="${organisation.logo_url}" alt="Logo" class="org-logo">` : ''}
          <div class="org-info">
            <h1>${organisation?.name || 'Organisation Name'}</h1>
            <p>🇸🇱 ${organisation?.address || ''}, ${organisation?.city || ''} • Tel: ${organisation?.phone || ''} • Email: ${organisation?.email || ''}</p>
          </div>
        </div>

        <div class="form-title">EXPENSE REQUEST FORM</div>

        <div class="form-section">
          <div class="section-title">Expense Information</div>
          
          <div class="form-row">
            <div class="form-field">
              <label>Date</label>
              <input type="date" value="${today}" />
            </div>
            <div class="form-field">
              <label>Expense No.</label>
              <input type="text" placeholder="Auto-generated" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Category</label>
              <select>
                <option value="">Select category</option>
                <option value="fuel">Fuel</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="rent">Rent</option>
                <option value="salaries">Salaries</option>
                <option value="transport">Transport</option>
                <option value="marketing">Marketing</option>
                <option value="insurance">Insurance</option>
                <option value="petty_cash">Petty Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Amount (Le)</label>
              <input type="text" placeholder="0.00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Description</label>
              <textarea placeholder="What was this expense for?"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Vendor/Supplier</label>
              <input type="text" placeholder="Vendor name" />
            </div>
            <div class="form-field">
              <label>Payment Method</label>
              <select>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Notes</label>
              <textarea placeholder="Additional details"></textarea>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p>Requested By</p>
          </div>
          <div class="signature-box">
            <p>Approved By</p>
          </div>
          <div class="signature-box">
            <p>Date</p>
          </div>
        </div>

        <div class="footer">
          <p>🇸🇱 ${organisation?.name || 'Organisation'} • Generated on ${today}</p>
          <p style="margin-top: 5px; font-style: italic;">This is an official expense form. All fields must be completed accurately.</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateRevenueFormHTML = () => {
    const today = format(new Date(), 'MMMM d, yyyy');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Revenue Form - ${organisation?.name || 'Organisation'}</title>
        <style>
          @page { size: A4; margin: 1cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #0F1F3C;
            padding: 20px;
          }
          .header {
            border-bottom: 4px solid;
            border-image: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%) 1;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .org-logo { max-height: 60px; margin-bottom: 10px; }
          .org-info h1 { color: #0F1F3C; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .org-info p { color: #666; font-size: 11px; }
          .form-title { 
            background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
          }
          .form-section { margin: 20px 0; }
          .section-title {
            background: #f0f0f0;
            padding: 8px 12px;
            border-left: 4px solid #1EB053;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
          .form-field { flex: 1; }
          .form-field label {
            display: block;
            font-size: 11px;
            font-weight: bold;
            color: #0F1F3C;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .form-field input, .form-field select, .form-field textarea {
            width: 100%;
            border: 1.5px solid #ddd;
            border-radius: 4px;
            padding: 8px 10px;
            font-size: 13px;
            font-family: inherit;
          }
          .form-field textarea { min-height: 60px; resize: vertical; }
          .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
          }
          .signature-box {
            border-top: 2px solid #0F1F3C;
            padding-top: 8px;
          }
          .signature-box p { font-size: 11px; font-weight: bold; color: #666; }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 4px solid;
            border-image: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%) 1;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${organisation?.logo_url ? `<img src="${organisation.logo_url}" alt="Logo" class="org-logo">` : ''}
          <div class="org-info">
            <h1>${organisation?.name || 'Organisation Name'}</h1>
            <p>🇸🇱 ${organisation?.address || ''}, ${organisation?.city || ''} • Tel: ${organisation?.phone || ''} • Email: ${organisation?.email || ''}</p>
          </div>
        </div>

        <div class="form-title">REVENUE / CONTRIBUTION FORM</div>

        <div class="form-section">
          <div class="section-title">Revenue Information</div>
          
          <div class="form-row">
            <div class="form-field">
              <label>Date</label>
              <input type="date" value="${today}" />
            </div>
            <div class="form-field">
              <label>Reference No.</label>
              <input type="text" placeholder="Auto-generated" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Source Type</label>
              <select>
                <option value="">Select source</option>
                <option value="owner_contribution">Owner Contribution</option>
                <option value="ceo_contribution">CEO Contribution</option>
                <option value="investor_funding">Investor Funding</option>
                <option value="loan">Loan</option>
                <option value="grant">Grant</option>
                <option value="dividend">Dividend Return</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Amount (Le)</label>
              <input type="text" placeholder="0.00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Contributor Name</label>
              <input type="text" placeholder="Name of owner, CEO, or investor" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Payment Method</label>
              <select>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Reference Number</label>
              <input type="text" placeholder="Bank ref or transaction ID" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Purpose</label>
              <textarea placeholder="e.g., Capital injection, Working capital"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Notes</label>
              <textarea placeholder="Additional details"></textarea>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p>Received By</p>
          </div>
          <div class="signature-box">
            <p>Approved By</p>
          </div>
          <div class="signature-box">
            <p>Date</p>
          </div>
        </div>

        <div class="footer">
          <p>🇸🇱 ${organisation?.name || 'Organisation'} • Generated on ${today}</p>
          <p style="margin-top: 5px; font-style: italic;">This is an official revenue form. All fields must be completed accurately.</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintForm = (type) => {
    if (type === 'expense') {
      setPrintingExpense(true);
    } else {
      setPrintingRevenue(true);
    }

    const html = type === 'expense' ? generateExpenseFormHTML() : generateRevenueFormHTML();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        setPrintingExpense(false);
        setPrintingRevenue(false);
        toast.success("Form ready", `${type === 'expense' ? 'Expense' : 'Revenue'} form opened for printing`);
      }, 500);
    } else {
      setPrintingExpense(false);
      setPrintingRevenue(false);
      toast.error("Print failed", "Please allow popups for this site");
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        onClick={() => handlePrintForm('expense')}
        disabled={printingExpense}
        className="border-red-500 text-red-600 hover:bg-red-50"
      >
        {printingExpense ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Receipt className="w-4 h-4 mr-2" />
        )}
        Print Expense Form
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handlePrintForm('revenue')}
        disabled={printingRevenue}
        className="border-[#1EB053] text-[#1EB053] hover:bg-[#1EB053]/10"
      >
        {printingRevenue ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <DollarSign className="w-4 h-4 mr-2" />
        )}
        Print Revenue Form
      </Button>
    </div>
  );
}