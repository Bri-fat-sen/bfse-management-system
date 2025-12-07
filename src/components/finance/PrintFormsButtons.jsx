import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Receipt, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function PrintFormsButtons({ organisation }) {
  const toast = useToast();
  const [printingExpense, setPrintingExpense] = useState(false);
  const [printingRevenue, setPrintingRevenue] = useState(false);

  const generateExpenseFormHTML = () => {
    const styles = getUnifiedPDFStyles(organisation, 'report');
    const header = getUnifiedHeader(organisation, 'Expense Entry Form', 'EXPENSE-FORM', new Date().toLocaleDateString(), 'report');
    const footer = getUnifiedFooter(organisation);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expense Entry Form - ${organisation?.name || 'Organisation'}</title>
  <style>${styles}
    .instructions {
      background: var(--gray-50);
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid var(--primary);
    }
    
    .instructions h3 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--gray-800);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .instructions ol {
      margin-left: 20px;
      font-size: 12px;
      color: var(--gray-600);
      line-height: 1.8;
    }
    
    .instructions li {
      margin-bottom: 6px;
    }
    
    .form-section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    .form-field label {
      font-size: 11px;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 6px;
    }
    
    .form-field label .required {
      color: var(--danger);
      font-weight: 700;
    }
    
    .form-field .input-box {
      border: 2px solid var(--gray-200);
      border-radius: 6px;
      padding: 10px 12px;
      min-height: 40px;
      background: white;
      transition: border-color 0.2s;
    }
    
    .form-field .input-box.large {
      min-height: 80px;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    
    .signature-box {
      border-top: 2px solid var(--gray-800);
      padding-top: 10px;
    }
    
    .signature-box p {
      font-size: 11px;
      color: var(--gray-600);
      margin-top: 4px;
    }
    
    .signature-box strong {
      color: var(--gray-800);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="document">
    ${header}
    
    <div class="content">
      <div class="instructions">
        <h3>📋 Instructions - EXPENSE ENTRY FORM</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: EXPENSE ENTRY FORM</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>Write expense details, amounts, and dates clearly</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in Expense Management or Finance section</li>
          <li>The system will automatically extract and create expense records</li>
        </ol>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">💰</div>
          Expense Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="input-box"></div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">📋</div>
          Expense Items
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th>DETAILS / DESCRIPTION <span class="required">*</span></th>
              <th style="width: 80px;">UNIT</th>
              <th style="width: 80px;">QTY</th>
              <th style="width: 100px;">UNIT COST (Le)</th>
              <th style="width: 120px;">TOTAL (Le) <span class="required">*</span></th>
              <th style="width: 120px;">VENDOR</th>
              <th style="width: 100px;">CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 15 }, (_, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5" style="text-align: right; font-weight: bold;">TOTAL:</td>
              <td style="font-weight: bold;">Le ______________</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="form-section">
        <div class="form-field full-width">
          <label>Notes / Comments</label>
          <div class="input-box large"></div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Prepared By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
        <div class="signature-box">
          <p><strong>Approved By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
      </div>
    </div>
    
    ${footer}
  </div>
</body>
</html>
    `;
  };

  const generateRevenueFormHTML = () => {
    const styles = getUnifiedPDFStyles(organisation, 'report');
    const header = getUnifiedHeader(organisation, 'Revenue Entry Form', 'REVENUE-FORM', new Date().toLocaleDateString(), 'report');
    const footer = getUnifiedFooter(organisation);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revenue Entry Form - ${organisation?.name || 'Organisation'}</title>
  <style>${styles}
    .instructions {
      background: var(--gray-50);
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid var(--primary);
    }
    
    .instructions h3 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--gray-800);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .instructions ol {
      margin-left: 20px;
      font-size: 12px;
      color: var(--gray-600);
      line-height: 1.8;
    }
    
    .instructions li {
      margin-bottom: 6px;
    }
    
    .form-section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    .form-field label {
      font-size: 11px;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 6px;
    }
    
    .form-field label .required {
      color: var(--danger);
      font-weight: 700;
    }
    
    .form-field .input-box {
      border: 2px solid var(--gray-200);
      border-radius: 6px;
      padding: 10px 12px;
      min-height: 40px;
      background: white;
      transition: border-color 0.2s;
    }
    
    .form-field .input-box.large {
      min-height: 80px;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    
    .signature-box {
      border-top: 2px solid var(--gray-800);
      padding-top: 10px;
    }
    
    .signature-box p {
      font-size: 11px;
      color: var(--gray-600);
      margin-top: 4px;
    }
    
    .signature-box strong {
      color: var(--gray-800);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="document">
    ${header}
    
    <div class="content">
      <div class="instructions">
        <h3>📋 Instructions - REVENUE ENTRY FORM</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: REVENUE ENTRY FORM</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>Write revenue details, amounts, and sources clearly</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in Finance section</li>
          <li>The system will automatically extract and create revenue records</li>
        </ol>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">📈</div>
          Revenue Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="input-box"></div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">📋</div>
          Revenue Items
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th>DESCRIPTION / PURPOSE <span class="required">*</span></th>
              <th style="width: 150px;">CONTRIBUTOR / CUSTOMER</th>
              <th style="width: 120px;">AMOUNT (Le) <span class="required">*</span></th>
              <th style="width: 120px;">SOURCE / CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 15 }, (_, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL:</td>
              <td style="font-weight: bold;">Le ______________</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="form-section">
        <div class="form-field full-width">
          <label>Notes / Comments</label>
          <div class="input-box large"></div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Recorded By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
        <div class="signature-box">
          <p><strong>Verified By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
      </div>
    </div>
    
    ${footer}
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