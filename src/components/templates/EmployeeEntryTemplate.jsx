import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function EmployeeEntryTemplate({ organisation }) {
  const handleDownload = () => {
    const html = getTemplateHTML();
    printUnifiedPDF(html, 'employee-entry-form.pdf');
  };

  const getTemplateHTML = () => {
    const styles = getUnifiedPDFStyles(organisation);
    const header = getUnifiedHeader(organisation, {
      documentType: "EMPLOYEE ONBOARDING FORM",
      documentNumber: "TEMPLATE",
      documentDate: new Date().toLocaleDateString()
    });
    const footer = getUnifiedFooter(organisation);

    const content = `
      <div class="instructions">
        <h3>📋 Instructions - EMPLOYEE ONBOARDING FORM</h3>
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

      <div class="form-section">
        <h3>Personal Information</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>First Name *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Last Name *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Employee Code *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Phone Number *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Email Address</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Address</label>
            <div class="form-input">____________________</div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Employment Details</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>Position / Role *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Department</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Hire Date *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Base Salary (Le) *</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Salary Type</label>
            <div class="form-input">☐ Monthly  ☐ Hourly  ☐ Daily</div>
          </div>
          <div class="form-field">
            <label>Status</label>
            <div class="form-input">☐ Active  ☐ Inactive</div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Emergency Contact</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>Emergency Contact Name</label>
            <div class="form-input">____________________</div>
          </div>
          <div class="form-field">
            <label>Emergency Contact Phone</label>
            <div class="form-input">____________________</div>
          </div>
        </div>
      </div>

      <div class="notes-section">
        <h4>Additional Notes:</h4>
        <div class="notes-box">
          <div class="notes-line"></div>
          <div class="notes-line"></div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Employee Signature</div>
          <div class="signature-date">Date: ______________</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">HR Manager</div>
          <div class="signature-date">Date: ______________</div>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Employee Entry Form</title>
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