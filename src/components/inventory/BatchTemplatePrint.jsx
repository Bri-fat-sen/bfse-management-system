import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function BatchTemplatePrint({ organisation }) {
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'batch-entry-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation, 'report');
    const header = getUnifiedHeader(organisation, 'Batch Entry Form', 'BATCH-FORM', new Date().toLocaleDateString(), 'report');
    const footer = getUnifiedFooter(organisation);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch Entry Form - ${organisation?.name || 'Organisation'}</title>
  <style>${styles}
    /* Additional form-specific styles */
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
    
    .form-field .input-box:focus-within {
      border-color: var(--primary);
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
      <!-- Instructions -->
      <div class="instructions">
        <h3>📋 Instructions - BATCH ENTRY FORM</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: PRODUCTION BATCH ENTRY FORM</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>Write batch number, product name, quantity, and dates clearly</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload the image using the "Upload Form" button in the Batch Management tab</li>
          <li>The system will automatically extract and create production batch records</li>
        </ol>
      </div>

      <!-- Batch Information -->
      <div class="form-section">
        <div class="section-title">
          <div class="icon">📦</div>
          Batch Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Batch Number <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Product Name <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Manufacturing Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Expiry Date</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Quantity Produced <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Warehouse</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Rolls</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Weight (kg)</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Cost Price (Le)</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Quality Status</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field full-width">
            <label>Notes / Comments</label>
            <div class="input-box large"></div>
          </div>
        </div>
      </div>

      <!-- Stock Allocation -->
      <div class="form-section">
        <div class="section-title">
          <div class="icon">📍</div>
          Stock Allocation (Optional)
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Location Name</th>
              <th>Quantity</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Prepared By:</strong></p>
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

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Template
    </Button>
  );
}