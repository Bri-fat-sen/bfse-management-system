import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, Download, Settings2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const safeNum = (val) => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export default function PayslipGenerator({ payroll, employee, organisation }) {
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({
    showLogo: true,
    showBankDetails: true,
    showAttendance: true,
    showTaxBreakdown: true,
    showEmployerCost: false,
    colorScheme: 'green', // green, blue, purple
    layout: 'modern' // modern, classic, compact
  });

  const colorSchemes = {
    green: { primary: '#1EB053', secondary: '#059669', accent: '#10b981' },
    blue: { primary: '#0072C6', secondary: '#0284c7', accent: '#3b82f6' },
    purple: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' }
  };

  const colors = colorSchemes[options.colorScheme];

  const generatePayslipHTML = () => {
    const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const hasLogo = options.showLogo && organisation?.logo_url;
    
    // Calculate detailed breakdowns
    const basePay = safeNum(payroll?.base_salary);
    const proratedSalary = safeNum(payroll?.prorated_salary) || basePay;
    const overtimePay = safeNum(payroll?.overtime_pay);
    const weekendPay = safeNum(payroll?.weekend_pay);
    const holidayPay = safeNum(payroll?.holiday_pay);
    const totalBonuses = safeNum(payroll?.total_bonuses);
    const totalAllowances = safeNum(payroll?.total_allowances);
    const grossPay = safeNum(payroll?.gross_pay);
    const nassitEmployee = safeNum(payroll?.nassit_employee);
    const nassitEmployer = safeNum(payroll?.nassit_employer);
    const payeTax = safeNum(payroll?.paye_tax);
    const totalDeductions = safeNum(payroll?.total_deductions);
    const netPay = safeNum(payroll?.net_pay);
    const employerCost = safeNum(payroll?.employer_cost);
    
    const allowances = payroll?.allowances || [];
    const bonuses = payroll?.bonuses || [];
    const deductions = (payroll?.deductions || []).filter(d => 
      d.type !== 'statutory' && !d.name?.toLowerCase().includes('nassit') && !d.name?.toLowerCase().includes('paye')
    );
    
    const daysWorked = safeNum(payroll?.days_worked);
    const hoursWorked = safeNum(payroll?.hours_worked);
    const overtimeHours = safeNum(payroll?.overtime_hours);
    const weekendHours = safeNum(payroll?.weekend_hours);
    const holidayHours = safeNum(payroll?.holiday_hours);
    
    const taxBracket = payroll?.calculation_details?.tax_bracket || 'N/A';
    const effectiveTaxRate = safeNum(payroll?.calculation_details?.effective_tax_rate);
    const hourlyRate = safeNum(payroll?.calculation_details?.hourly_rate);
    const dailyRate = safeNum(payroll?.calculation_details?.daily_rate);
    const frequency = payroll?.payroll_frequency || 'monthly';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payslip - ${employee?.full_name} - ${format(new Date(payroll?.period_start), 'MMMM yyyy')}</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #0f172a;
              --primary-light: #1e293b;
              --accent: ${colors.accent};
              --success: ${colors.primary};
              --success-dark: ${colors.secondary};
              --danger: #ef4444;
              --gray-50: #f8fafc;
              --gray-100: #f1f5f9;
              --gray-200: #e2e8f0;
              --gray-400: #94a3b8;
              --gray-500: #64748b;
              --gray-600: #475569;
              --gray-700: #334155;
              --gray-800: #1e293b;
              --gray-900: #0f172a;
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background: var(--gray-50);
              padding: 24px;
              color: var(--gray-800);
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
            }
            
            .payslip-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            }
            
            /* Header Accent */
            .header-accent {
              height: 4px;
              background: linear-gradient(90deg, var(--success), var(--accent));
            }
            
            /* Header */
            .payslip-header {
              background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
              color: white;
              padding: 32px 40px;
              position: relative;
              overflow: hidden;
            }
            
            .header-bg {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              opacity: 0.05;
              background-image: 
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%);
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
              width: 56px;
              height: 56px;
              background: white;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              font-weight: 800;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
              overflow: hidden;
            }
            
            .company-logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              padding: 4px;
            }
            
            .company-logo span {
              background: linear-gradient(135deg, var(--success), var(--accent));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            
            /* Attendance Info */
            .attendance-section {
              background: var(--gray-50);
              padding: 16px 40px;
              border-bottom: 1px solid var(--gray-200);
            }
            
            .attendance-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
            }
            
            .attendance-item {
              text-align: center;
            }
            
            .attendance-item .value {
              font-size: 18px;
              font-weight: 700;
              color: var(--gray-800);
            }
            
            .attendance-item .label {
              font-size: 11px;
              color: var(--gray-500);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            /* Rate Cards */
            .rate-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 12px;
            }
            
            .rate-card {
              background: white;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid var(--gray-200);
              text-align: center;
            }
            
            .rate-card .value {
              font-size: 14px;
              font-weight: 600;
              color: var(--success);
            }
            
            .rate-card .label {
              font-size: 10px;
              color: var(--gray-500);
              margin-top: 2px;
            }
            
            /* Tax Breakdown */
            .tax-breakdown {
              background: #fef3c7;
              border: 1px solid #fcd34d;
              border-radius: 8px;
              padding: 12px 16px;
              margin-top: 12px;
            }
            
            .tax-breakdown h4 {
              font-size: 11px;
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .tax-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              padding: 4px 0;
            }
            
            .tax-row .label { color: #a16207; }
            .tax-row .value { font-weight: 600; color: #92400e; }
            
            /* Employer Cost Section */
            .employer-cost-section {
              background: var(--gray-100);
              padding: 16px 40px;
              border-top: 1px dashed var(--gray-300);
            }
            
            .employer-cost-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              text-align: center;
            }
            
            .employer-cost-item .value {
              font-size: 16px;
              font-weight: 700;
              color: var(--gray-700);
            }
            
            .employer-cost-item .label {
              font-size: 11px;
              color: var(--gray-500);
            }
            
            .employer-cost-item.total .value {
              color: var(--primary);
              font-size: 18px;
            }
            
            .company-details h1 {
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }
            
            .company-details .address {
              font-size: 12px;
              opacity: 0.8;
            }
            
            .payslip-badge {
              text-align: right;
            }
            
            .payslip-badge h2 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              opacity: 0.7;
              margin-bottom: 4px;
            }
            
            .payslip-badge .period {
              font-size: 18px;
              font-weight: 700;
            }
            
            /* Employee Info */
            .employee-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border-bottom: 1px solid var(--gray-200);
            }
            
            .info-section {
              padding: 24px 40px;
              background: var(--gray-50);
            }
            
            .info-section:first-child {
              border-right: 1px solid var(--gray-200);
            }
            
            .info-section h3 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--gray-400);
              margin-bottom: 16px;
              font-weight: 600;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
              border-bottom: 1px dashed var(--gray-200);
            }
            
            .info-row:last-child {
              border-bottom: none;
            }
            
            .info-row .label {
              color: var(--gray-500);
            }
            
            .info-row .value {
              font-weight: 600;
              color: var(--gray-800);
            }
            
            /* Pay Breakdown */
            .pay-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
            }
            
            .breakdown-section {
              padding: 28px 40px;
            }
            
            .breakdown-section.earnings {
              border-right: 1px solid var(--gray-200);
            }
            
            .breakdown-section h3 {
              font-size: 13px;
              font-weight: 700;
              padding-bottom: 12px;
              margin-bottom: 16px;
              border-bottom: 2px solid;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .breakdown-section.earnings h3 {
              color: var(--success);
              border-color: var(--success);
            }
            
            .breakdown-section.deductions h3 {
              color: var(--danger);
              border-color: var(--danger);
            }
            
            .pay-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 0;
              font-size: 13px;
              border-bottom: 1px dashed var(--gray-200);
            }
            
            .pay-item:last-of-type {
              border-bottom: none;
            }
            
            .pay-item .label {
              color: var(--gray-600);
            }
            
            .pay-item .amount {
              font-weight: 600;
              font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
              font-size: 13px;
            }
            
            .pay-item.subtotal {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid var(--gray-200);
              font-weight: 700;
              font-size: 14px;
            }
            
            .breakdown-section.earnings .pay-item.subtotal .amount {
              color: var(--success);
            }
            
            .breakdown-section.deductions .pay-item.subtotal .amount {
              color: var(--danger);
            }
            
            /* Statutory Note */
            .statutory-note {
              background: var(--gray-50);
              padding: 12px 40px;
              font-size: 11px;
              color: var(--gray-500);
              text-align: center;
              border-top: 1px solid var(--gray-200);
              border-bottom: 1px solid var(--gray-200);
            }
            
            /* Net Pay Section */
            .net-pay-section {
              padding: 28px 40px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              padding: 8px 0;
            }
            
            .summary-row.net-pay {
              margin-top: 20px;
              padding: 24px;
              background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
              border-radius: 16px;
              color: white;
              font-size: 24px;
              font-weight: 800;
              box-shadow: 0 8px 24px rgba(30, 176, 83, 0.3);
            }
            
            .summary-row.net-pay .label {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .summary-row.net-pay .amount {
              font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            }
            
            /* Footer */
            .footer-accent {
              height: 4px;
              background: linear-gradient(90deg, var(--success), var(--accent));
            }
            
            .payslip-footer {
              background: var(--gray-900);
              color: white;
              padding: 24px 40px;
              text-align: center;
            }
            
            .footer-text {
              font-size: 12px;
              opacity: 0.7;
            }
            
            .footer-brand {
              margin-top: 8px;
              font-size: 11px;
              opacity: 0.5;
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
                border-radius: 0;
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
            <div class="header-accent"></div>
            
            <div class="payslip-header">
              <div class="header-bg"></div>
              <div class="header-content">
                <div class="company-brand">
                  <div class="company-logo">
                    <span>${orgInitials}</span>
                  </div>
                  <div class="company-details">
                    <h1>${organisation?.name || 'Organisation'}</h1>
                    <div class="address">
                      ${organisation?.address ? `${organisation.address}${organisation?.city ? `, ${organisation.city}` : ''}` : 'Sierra Leone'}
                    </div>
                  </div>
                </div>
                <div class="payslip-badge">
                  <h2>Payslip</h2>
                  <div class="period">${format(new Date(payroll?.period_start), 'MMMM yyyy')}</div>
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
              * Statutory deductions include NASSIT (5% employee contribution) and PAYE Tax as per Sierra Leone regulations
            </div>
            
            <div class="net-pay-section">
              <div class="summary-row">
                <span class="label">Gross Pay</span>
                <span class="value">SLE ${payroll?.gross_pay?.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span class="label">Total Deductions</span>
                <span class="value" style="color: var(--danger);">- SLE ${payroll?.total_deductions?.toLocaleString()}</span>
              </div>
              <div class="summary-row net-pay">
                <span class="label">💵 NET PAY</span>
                <span class="amount">SLE ${payroll?.net_pay?.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="footer-accent"></div>
            <div class="payslip-footer">
              <div class="footer-text">This is a computer-generated payslip and does not require a signature.</div>
              <div class="footer-brand">${organisation?.name || 'Organisation'} • Sierra Leone</div>
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