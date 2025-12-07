import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function ExpenseEntryTemplate({ organisation }) {
  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'expense-entry-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation);
    const header = getUnifiedHeader(organisation, {
      documentType: "EXPENSE ENTRY FORM",
      documentNumber: "TEMPLATE",
      documentDate: new Date().toLocaleDateString()
    });
    const footer = getUnifiedFooter(organisation);

    const content = `
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
        <h3>Expense Information</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>Date *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="form-input">____________________</div>
          </div>
        </div>
      </div>

      <div class="table-section">
        <h3>Expense Items</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th>DETAILS / DESCRIPTION *</th>
              <th style="width: 80px;">UNIT</th>
              <th style="width: 80px;">QTY</th>
              <th style="width: 100px;">UNIT COST (Le)</th>
              <th style="width: 120px;">TOTAL (Le) *</th>
              <th style="width: 120px;">VENDOR</th>
              <th style="width: 100px;">CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 15 }, (_, i) => `
              <tr>
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
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

      <div class="notes-section">
        <h4>Notes / Comments:</h4>
        <div class="notes-box">
          <div class="notes-line"></div>
          <div class="notes-line"></div>
          <div class="notes-line"></div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Prepared By</div>
          <div class="signature-date">Date: ______________</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Approved By</div>
          <div class="signature-date">Date: ______________</div>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Expense Entry Form</title>
          <style>${styles}</style>
        </head>
        <body>
          ${header}
          <div class="content">
            ${content}
          </div>
          ${footer}
        </body>
      </html>
    `;
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      size="sm"
      className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Template
    </Button>
  );
}