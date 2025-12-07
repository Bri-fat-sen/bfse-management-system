import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function EmployeeEntryTemplate({ organisation }) {
  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'employee-entry-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation, 'report');
    const header = getUnifiedHeader(organisation, 'Employee Onboarding Form', 'EMPLOYEE-FORM', new Date().toLocaleDateString(), 'report');
    const footer = getUnifiedFooter(organisation);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Employee Onboarding Form - ${organisation?.name || 'Organisation'}</title>
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
        <h3>📋 Instructions - EMPLOYEE ENTRY FORM</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: EMPLOYEE ENTRY FORM</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>Provide accurate employee information</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in HR section</li>
          <li>The system will automatically extract and create employee records</li>
        </ol>
      </div>

      <!-- Personal Information -->
      <div class="form-section">
        <div class="section-title">
          <div class="icon">👤</div>
          Personal Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>First Name <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Last Name <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Employee Code <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Phone Number <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Email Address</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Address</label>
            <div class="input-box"></div>
          </div>
        </div>
      </div>

      <!-- Employment Details -->
      <div class="form-section">
        <div class="section-title">
          <div class="icon">💼</div>
          Employment Details
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Position / Role <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Department</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Hire Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Base Salary (Le) <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Salary Type</label>
            <div class="input-box">☐ Monthly  ☐ Hourly  ☐ Daily</div>
          </div>
          <div class="form-field">
            <label>Status</label>
            <div class="input-box">☐ Active  ☐ Inactive</div>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="form-section">
        <div class="section-title">
          <div class="icon">🚨</div>
          Emergency Contact
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Emergency Contact Name</label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Emergency Contact Phone</label>
            <div class="input-box"></div>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Employee Signature:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
        <div class="signature-box">
          <p><strong>HR Manager:</strong></p>
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
      size="sm"
      className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Template
    </Button>
  );
}