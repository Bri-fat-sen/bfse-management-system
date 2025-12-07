import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function StockAdjustmentTemplate({ organisation }) {
  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'stock-adjustment-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation);
    const header = getUnifiedHeader(organisation, {
      documentType: "STOCK ADJUSTMENT FORM",
      documentNumber: "TEMPLATE",
      documentDate: new Date().toLocaleDateString()
    });
    const footer = getUnifiedFooter(organisation);

    const content = `
      <div class="instructions">
        <h3>📋 Instructions - STOCK ADJUSTMENT FORM</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: INVENTORY STOCK ADJUSTMENT FORM</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>Indicate clearly whether stock is IN (received) or OUT (issued)</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in Inventory section</li>
          <li>The system will automatically extract and create stock movement records</li>
        </ol>
      </div>

      <div class="form-section">
        <h3>Stock Movement Information</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>Date *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Warehouse / Location *</label>
            <div class="form-input">____________________</div>
          </div>
        </div>
      </div>

      <div class="table-section">
        <h3>Stock Items</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th>PRODUCT NAME / SKU *</th>
              <th style="width: 100px;">STOCK IN<br/>(Received)</th>
              <th style="width: 100px;">STOCK OUT<br/>(Issued)</th>
              <th style="width: 80px;">UNIT</th>
              <th style="width: 150px;">NOTES / REASON</th>
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
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="notes-section">
        <h4>Additional Notes / Comments:</h4>
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
          <title>Stock Adjustment Form</title>
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
      className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/5"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Template
    </Button>
  );
}