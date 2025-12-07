import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function BatchTemplatePrint({ organisation }) {
  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(getTemplateHTML());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getTemplateHTML = () => {
    const orgName = organisation?.name || 'Organisation';
    const orgLogo = organisation?.logo_url || '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Batch Entry Form</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      background: white;
    }
    
    @media print {
      body { margin: 0; }
      .page { 
        margin: 0; 
        border: none; 
        box-shadow: none;
        page-break-after: always;
      }
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 15px;
      border-bottom: 3px solid #1EB053;
      margin-bottom: 20px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .company-info h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #0F1F3C;
      margin-bottom: 3px;
    }
    
    .company-info p {
      font-size: 9pt;
      color: #666;
    }
    
    .form-title {
      text-align: right;
    }
    
    .form-title h2 {
      font-size: 16pt;
      font-weight: bold;
      color: #0072C6;
      margin-bottom: 5px;
    }
    
    .form-title p {
      font-size: 9pt;
      color: #666;
    }
    
    /* Sierra Leone Flag */
    .sl-flag {
      height: 6px;
      display: flex;
      margin: 15px 0;
    }
    
    .sl-flag div {
      flex: 1;
    }
    
    .sl-green { background: #1EB053; }
    .sl-white { background: #FFFFFF; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
    .sl-blue { background: #0072C6; }
    
    /* Instructions */
    .instructions {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #1EB053;
    }
    
    .instructions h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 8px;
      color: #0F1F3C;
    }
    
    .instructions ol {
      margin-left: 20px;
      font-size: 9pt;
      color: #555;
    }
    
    .instructions li {
      margin-bottom: 4px;
    }
    
    /* Form Fields */
    .form-section {
      margin-bottom: 25px;
    }
    
    .form-section h3 {
      font-size: 12pt;
      font-weight: bold;
      color: #0F1F3C;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 2px solid #1EB053;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    .form-field label {
      font-size: 9pt;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    
    .form-field label .required {
      color: #dc2626;
    }
    
    .form-field .input-box {
      border: 1.5px solid #cbd5e1;
      border-radius: 4px;
      padding: 8px 10px;
      min-height: 32px;
      background: white;
    }
    
    .form-field .input-box.large {
      min-height: 60px;
    }
    
    /* Table for batch items */
    .batch-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9pt;
    }
    
    .batch-table thead {
      background: #f1f5f9;
    }
    
    .batch-table th,
    .batch-table td {
      border: 1px solid #cbd5e1;
      padding: 8px;
      text-align: left;
    }
    
    .batch-table th {
      font-weight: 600;
      color: #0F1F3C;
    }
    
    .batch-table td {
      height: 32px;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #e2e8f0;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 20px;
    }
    
    .signature-box {
      border-top: 1.5px solid #333;
      padding-top: 8px;
    }
    
    .signature-box p {
      font-size: 9pt;
      color: #666;
    }
    
    .footer-note {
      text-align: center;
      font-size: 8pt;
      color: #999;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        ${orgLogo ? `<img src="${orgLogo}" alt="Logo" class="logo" />` : ''}
        <div class="company-info">
          <h1>${orgName}</h1>
          <p>Inventory Management System</p>
        </div>
      </div>
      <div class="form-title">
        <h2>Batch Entry Form</h2>
        <p>Please fill in clearly with black ink</p>
      </div>
    </div>

    <!-- Sierra Leone Flag -->
    <div class="sl-flag">
      <div class="sl-green"></div>
      <div class="sl-white"></div>
      <div class="sl-blue"></div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h3>📋 Instructions</h3>
      <ol>
        <li>Fill in all required fields (*) with clear, legible handwriting</li>
        <li>Use black or blue ink only</li>
        <li>Write batch number, product name, quantity, and dates clearly</li>
        <li>After completing, scan or photograph this form</li>
        <li>Upload the image using the "Upload Batch Form" feature</li>
        <li>The system will automatically extract and create batch records</li>
      </ol>
    </div>

    <!-- Batch Information -->
    <div class="form-section">
      <h3>📦 Batch Information</h3>
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
          <label>Production Date <span class="required">*</span></label>
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
          <label>Quality Status</label>
          <div class="input-box"></div>
        </div>
        <div class="form-field full-width">
          <label>Notes / Comments</label>
          <div class="input-box large"></div>
        </div>
      </div>
    </div>

    <!-- Allocation Table -->
    <div class="form-section">
      <h3>📍 Stock Allocation (Optional)</h3>
      <table class="batch-table">
        <thead>
          <tr>
            <th>Location Name</th>
            <th>Quantity</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Prepared By:</strong></p>
          <p style="margin-top: 40px;">Name: _______________________</p>
          <p>Date: _______________________</p>
        </div>
        <div class="signature-box">
          <p><strong>Verified By:</strong></p>
          <p style="margin-top: 40px;">Name: _______________________</p>
          <p>Date: _______________________</p>
        </div>
      </div>
      <p class="footer-note">
        🇸🇱 ${orgName} • Batch Entry Form • Sierra Leone
      </p>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Template
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Entry Form Preview</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: getTemplateHTML() }} />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="bg-[#1EB053] hover:bg-[#16803d] text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}