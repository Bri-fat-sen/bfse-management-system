import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export default function PayslipGenerator({ payroll, employee, organisation }) {
  const generatePayslipHTML = () => {
    const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 3);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payslip - ${employee?.full_name} - ${format(new Date(payroll?.period_start), 'MMMM yyyy')}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            :root {
              --sl-green: #1EB053;
              --sl-white: #FFFFFF;
              --sl-blue: #0072C6;
              --sl-navy: #0F1F3C;
              --sl-gold: #D4AF37;
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #f0f4f8;
              padding: 24px;
              color: #1e293b;
              line-height: 1.5;
            }
            
            .payslip-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 0;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            }
            
            /* Flag Bar */
            .flag-bar {
              height: 10px;
              display: flex;
            }
            .flag-bar > div { flex: 1; }
            .flag-bar .green { background: var(--sl-green); }
            .flag-bar .white { background: var(--sl-white); }
            .flag-bar .blue { background: var(--sl-blue); }
            
            /* Header */
            .payslip-header {
              background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 40%, var(--sl-navy) 100%);
              color: white;
              padding: 32px 36px;
              position: relative;
              overflow: hidden;
            }
            
            .payslip-header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -10%;
              width: 400px;
              height: 400px;
              background: radial-gradient(circle, rgba(30,176,83,0.15) 0%, transparent 70%);
              border-radius: 50%;
            }
            
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              position: relative;
              z-index: 1;
            }
            
            .company-brand {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .company-logo {
              width: 70px;
              height: 70px;
              background: white;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              font-weight: 800;
              box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            }
            
            .company-logo span {
              background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            
            .company-details h1 {
              font-size: 26px;
              font-weight: 800;
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }
            
            .company-details .address {
              font-size: 12px;
              opacity: 0.9;
              margin-top: 6px;
            }
            
            .payslip-badge {
              text-align: right;
            }
            
            .payslip-badge h2 {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 3px;
              opacity: 0.9;
              margin-bottom: 4px;
            }
            
            .payslip-badge .period {
              font-size: 20px;
              font-weight: 700;
            }
            
            .payslip-badge .flag {
              font-size: 32px;
              margin-top: 8px;
              opacity: 0.4;
            }
            
            /* Employee Info */
            .employee-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
              border-bottom: 4px solid;
              border-image: linear-gradient(90deg, var(--sl-green) 0%, var(--sl-blue) 100%) 1;
            }
            
            .info-section {
              padding: 24px 36px;
              background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            }
            
            .info-section:first-child {
              border-right: 1px solid #e2e8f0;
            }
            
            .info-section h3 {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: var(--sl-blue);
              margin-bottom: 14px;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .info-section h3::before {
              content: '';
              width: 4px;
              height: 16px;
              background: linear-gradient(180deg, var(--sl-green) 0%, var(--sl-blue) 100%);
              border-radius: 2px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
              border-bottom: 1px dashed #e2e8f0;
            }
            
            .info-row:last-child {
              border-bottom: none;
            }
            
            .info-row .label {
              color: #64748b;
              font-weight: 500;
            }
            
            .info-row .value {
              font-weight: 600;
              color: var(--sl-navy);
            }
            
            /* Earnings & Deductions */
            .pay-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
            }
            
            .breakdown-section {
              padding: 28px 36px;
            }
            
            .breakdown-section.earnings {
              background: linear-gradient(135deg, rgba(30,176,83,0.03) 0%, white 100%);
              border-right: 1px solid #e2e8f0;
            }
            
            .breakdown-section.deductions {
              background: linear-gradient(135deg, rgba(239,68,68,0.03) 0%, white 100%);
            }
            
            .breakdown-section h3 {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 700;
              padding-bottom: 12px;
              margin-bottom: 16px;
              border-bottom: 3px solid;
            }
            
            .breakdown-section.earnings h3 {
              color: var(--sl-green);
              border-color: var(--sl-green);
            }
            
            .breakdown-section.deductions h3 {
              color: #dc2626;
              border-color: #dc2626;
            }
            
            .pay-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 0;
              font-size: 13px;
              border-bottom: 1px dashed #e2e8f0;
            }
            
            .pay-item:last-of-type {
              border-bottom: none;
            }
            
            .pay-item .label {
              color: #475569;
            }
            
            .pay-item .amount {
              font-weight: 600;
              font-family: 'Monaco', 'Consolas', monospace;
              font-size: 13px;
            }
            
            .pay-item.subtotal {
              margin-top: 16px;
              padding-top: 14px;
              border-top: 2px solid;
              font-weight: 700;
              font-size: 14px;
            }
            
            .breakdown-section.earnings .pay-item.subtotal {
              border-top-color: var(--sl-green);
            }
            
            .breakdown-section.earnings .pay-item.subtotal .amount {
              color: var(--sl-green);
            }
            
            .breakdown-section.deductions .pay-item.subtotal {
              border-top-color: #dc2626;
            }
            
            .breakdown-section.deductions .pay-item.subtotal .amount {
              color: #dc2626;
            }
            
            /* Statutory Note */
            .statutory-note {
              background: linear-gradient(90deg, rgba(0,114,198,0.08) 0%, rgba(30,176,83,0.05) 100%);
              padding: 14px 36px;
              font-size: 11px;
              color: var(--sl-blue);
              text-align: center;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
            }
            
            /* Net Pay Section */
            .net-pay-section {
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
              padding: 28px 36px;
            }
            
            .net-summary {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              padding: 8px 0;
            }
            
            .summary-row.net-pay {
              margin-top: 16px;
              padding: 20px 24px;
              background: linear-gradient(135deg, var(--sl-green) 0%, #059669 100%);
              border-radius: 12px;
              color: white;
              font-size: 24px;
              font-weight: 800;
              box-shadow: 0 6px 20px rgba(30,176,83,0.3);
            }
            
            .summary-row.net-pay .label {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .summary-row.net-pay .amount {
              font-family: 'Monaco', 'Consolas', monospace;
              letter-spacing: -0.5px;
            }
            
            /* Footer */
            .payslip-footer {
              background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 50%, var(--sl-navy) 100%);
              color: white;
              padding: 28px 36px;
              text-align: center;
              position: relative;
            }
            
            .payslip-footer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, var(--sl-green) 33.33%, var(--sl-white) 33.33%, var(--sl-white) 66.66%, var(--sl-blue) 66.66%);
            }
            
            .footer-flag {
              font-size: 36px;
              margin-bottom: 12px;
              filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
            }
            
            .footer-text {
              font-size: 12px;
              opacity: 0.9;
            }
            
            .footer-text .disclaimer {
              margin-bottom: 8px;
            }
            
            .footer-text .brand {
              font-size: 11px;
              opacity: 0.7;
            }
            
            /* Print Styles */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              html, body {
                padding: 0;
                margin: 0;
                background: white !important;
              }
              
              .payslip-container {
                box-shadow: none;
                max-width: 100%;
              }
              
              .payslip-header {
                -webkit-print-color-adjust: exact !important;
              }
              
              .net-pay-section .summary-row.net-pay {
                -webkit-print-color-adjust: exact !important;
              }
              
              .payslip-footer {
                -webkit-print-color-adjust: exact !important;
              }
            }
            
            @page {
              margin: 10mm;
              size: A4 portrait;
            }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <div class="flag-bar">
              <div class="green"></div>
              <div class="white"></div>
              <div class="blue"></div>
            </div>
            
            <div class="payslip-header">
              <div class="header-content">
                <div class="company-brand">
                  <div class="company-logo">
                    <span>${orgInitials}</span>
                  </div>
                  <div class="company-details">
                    <h1>${organisation?.name || 'Organisation'}</h1>
                    <div class="address">
                      ${organisation?.address ? `📍 ${organisation.address}${organisation?.city ? `, ${organisation.city}` : ''}` : '📍 Freetown, Sierra Leone'}
                      ${organisation?.phone ? `<br>📞 ${organisation.phone}` : ''}
                    </div>
                  </div>
                </div>
                <div class="payslip-badge">
                  <h2>Payslip</h2>
                  <div class="period">${format(new Date(payroll?.period_start), 'MMMM yyyy')}</div>
                  <div class="flag">🇸🇱</div>
                </div>
              </div>
            </div>
            
            <div class="employee-info">
              <div class="info-section">
                <h3>Employee Details</h3>
                <div class="info-row">
                  <span class="label">Full Name</span>
                  <span class="value">${employee?.full_name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Employee ID</span>
                  <span class="value">${employee?.employee_code}</span>
                </div>
                <div class="info-row">
                  <span class="label">Department</span>
                  <span class="value">${employee?.department || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Position</span>
                  <span class="value">${employee?.position || 'N/A'}</span>
                </div>
              </div>
              <div class="info-section">
                <h3>Pay Period</h3>
                <div class="info-row">
                  <span class="label">Period Start</span>
                  <span class="value">${format(new Date(payroll?.period_start), 'dd MMMM yyyy')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Period End</span>
                  <span class="value">${format(new Date(payroll?.period_end), 'dd MMMM yyyy')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Date</span>
                  <span class="value">${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMMM yyyy') : 'Pending'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Method</span>
                  <span class="value">${(payroll?.payment_method || 'Bank Transfer').replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
            
            <div class="pay-breakdown">
              <div class="breakdown-section earnings">
                <h3>💰 Earnings</h3>
                <div class="pay-item">
                  <span class="label">Base Salary</span>
                  <span class="amount">SLE ${payroll?.base_salary?.toLocaleString()}</span>
                </div>
                ${payroll?.overtime_pay > 0 ? `
                  <div class="pay-item">
                    <span class="label">Overtime (${payroll.overtime_hours} hrs)</span>
                    <span class="amount">SLE ${payroll.overtime_pay.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${(payroll?.allowances || []).map(a => `
                  <div class="pay-item">
                    <span class="label">${a.name}</span>
                    <span class="amount">SLE ${parseFloat(a.amount).toLocaleString()}</span>
                  </div>
                `).join('')}
                <div class="pay-item subtotal">
                  <span class="label">Total Earnings</span>
                  <span class="amount">SLE ${payroll?.gross_pay?.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="breakdown-section deductions">
                <h3>📉 Deductions</h3>
                ${payroll?.nassit_employee > 0 ? `
                  <div class="pay-item">
                    <span class="label">NASSIT (5%) *</span>
                    <span class="amount">SLE ${payroll.nassit_employee.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${payroll?.paye_tax > 0 ? `
                  <div class="pay-item">
                    <span class="label">PAYE Tax *</span>
                    <span class="amount">SLE ${payroll.paye_tax.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${(payroll?.deductions || []).filter(d => !d.statutory).map(d => `
                  <div class="pay-item">
                    <span class="label">${d.name}</span>
                    <span class="amount">SLE ${parseFloat(d.amount).toLocaleString()}</span>
                  </div>
                `).join('')}
                ${(payroll?.total_deductions || 0) === 0 ? `
                  <div class="pay-item">
                    <span class="label">No deductions</span>
                    <span class="amount">SLE 0</span>
                  </div>
                ` : ''}
                <div class="pay-item subtotal">
                  <span class="label">Total Deductions</span>
                  <span class="amount">SLE ${payroll?.total_deductions?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
            
            <div class="statutory-note">
              * Statutory deductions include NASSIT (5% employee contribution) and PAYE Tax as per Sierra Leone Finance Act regulations
            </div>
            
            <div class="net-pay-section">
              <div class="net-summary">
                <div class="summary-row">
                  <span class="label">Gross Pay</span>
                  <span class="value">SLE ${payroll?.gross_pay?.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Total Deductions</span>
                  <span class="value" style="color: #dc2626;">- SLE ${payroll?.total_deductions?.toLocaleString()}</span>
                </div>
                <div class="summary-row net-pay">
                  <span class="label">💵 NET PAY</span>
                  <span class="amount">SLE ${payroll?.net_pay?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="payslip-footer">
              <div class="footer-flag">🇸🇱</div>
              <div class="footer-text">
                <div class="disclaimer">This is a computer-generated payslip and does not require a signature.</div>
                <div class="brand">${organisation?.name || 'Organisation'} Management System • Proudly Sierra Leonean</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = generatePayslipHTML();
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownload = () => {
    const html = generatePayslipHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip-${employee?.full_name}-${format(new Date(payroll?.period_start), 'MMM-yyyy')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!payroll || !employee) return null;

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-1" />
        Print
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
  );
}