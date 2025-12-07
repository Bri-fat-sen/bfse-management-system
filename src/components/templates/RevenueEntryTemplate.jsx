import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function RevenueEntryTemplate({ organisation }) {
  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'revenue-entry-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation);
    const header = getUnifiedHeader(organisation, {
      documentType: "REVENUE ENTRY FORM",
      documentNumber: "TEMPLATE",
      documentDate: new Date().toLocaleDateString()
    });
    const footer = getUnifiedFooter(organisation);

    const content = `
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
        <h3>Revenue Information</h3>
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
        <h3>Revenue Items</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th>DESCRIPTION / PURPOSE *</th>
              <th style="width: 150px;">CONTRIBUTOR / CUSTOMER</th>
              <th style="width: 120px;">AMOUNT (Le) *</th>
              <th style="width: 120px;">SOURCE / CATEGORY</th>
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
          <div class="signature-label">Recorded By</div>
          <div class="signature-date">Date: ______________</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Verified By</div>
          <div class="signature-date">Date: ______________</div>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Revenue Entry Form</title>
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