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
    const baseSalary = safeNum(payroll?.base_salary);
    const proratedSalary = safeNum(payroll?.prorated_salary) || baseSalary;
    const overtimePay = safeNum(payroll?.overtime_pay);
    const weekendPay = safeNum(payroll?.weekend_pay);
    const holidayPay = safeNum(payroll?.holiday_pay);
    const totalAllowances = safeNum(payroll?.total_allowances);
    const totalBonuses = safeNum(payroll?.total_bonuses);
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
      d.type !== 'statutory' && !d.name?.includes('NASSIT') && !d.name?.includes('PAYE')
    );

    const frequencyLabel = {
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly'
    }[payroll?.payroll_frequency] || 'Monthly';

    const taxBracket = payroll?.calculation_details?.tax_bracket || 'N/A';
    const effectiveTaxRate = payroll?.calculation_details?.effective_tax_rate || 0;

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
              --accent: ${colors.primary};
              --accent-secondary: ${colors.secondary};
              --success: #10b981;
              --danger: #ef4444;
              --warning: #f59e0b;
              --gray-50: #f8fafc;
              --gray-100: #f1f5f9;
              --gray-200: #e2e8f0;
              --gray-300: #cbd5e1;
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
              padding: ${options.layout === 'compact' ? '16px' : '24px'};
              color: var(--gray-800);
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
            }
            
            .payslip-container {
              max-width: ${options.layout === 'compact' ? '700px' : '850px'};
              margin: 0 auto;
              background: white;
              border-radius: ${options.layout === 'classic' ? '8px' : '16px'};
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            }
            
            /* Sierra Leone Flag Stripe */
            .sl-stripe {
              height: 6px;
              background: linear-gradient(90deg, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
            }
            
            /* Header Accent */
            .header-accent {
              height: 4px;
              background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
            }
            
            /* Header */
            .payslip-header {
              background: ${options.layout === 'classic' 
                ? 'white' 
                : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)'};
              color: ${options.layout === 'classic' ? 'var(--gray-800)' : 'white'};
              padding: ${options.layout === 'compact' ? '24px 28px' : '32px 40px'};
              position: relative;
              overflow: hidden;
              ${options.layout === 'classic' ? 'border-bottom: 2px solid var(--gray-200);' : ''}
            }
            
            .header-bg {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              opacity: 0.05;
              background-image: 
                radial-gradient(circle at 20% 80%, rgba(30, 176, 83, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(0, 114, 198, 0.4) 0%, transparent 50%);
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
              width: ${options.layout === 'compact' ? '48px' : '64px'};
              height: ${options.layout === 'compact' ? '48px' : '64px'};
              background: ${options.layout === 'classic' ? 'var(--gray-100)' : 'white'};
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${options.layout === 'compact' ? '18px' : '22px'};
              font-weight: 800;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            
            .company-logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            
            .company-logo span {
              background: linear-gradient(135deg, #1EB053, #0072C6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            
            .company-details h1 {
              font-size: ${options.layout === 'compact' ? '18px' : '22px'};
              font-weight: 700;
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }
            
            .company-details .address {
              font-size: 12px;
              opacity: 0.8;
            }
            
            .company-details .contact {
              font-size: 11px;
              opacity: 0.7;
              margin-top: 4px;
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
              font-size: ${options.layout === 'compact' ? '16px' : '18px'};
              font-weight: 700;
            }
            
            .payslip-badge .frequency {
              font-size: 11px;
              opacity: 0.7;
              margin-top: 4px;
              padding: 2px 8px;
              background: rgba(255,255,255,0.15);
              border-radius: 4px;
              display: inline-block;
            }
            
            /* Employee Info */
            .employee-info {
              display: grid;
              grid-template-columns: ${options.layout === 'compact' ? '1fr' : '1fr 1fr'};
              border-bottom: 1px solid var(--gray-200);
            }
            
            .info-section {
              padding: ${options.layout === 'compact' ? '16px 28px' : '24px 40px'};
              background: var(--gray-50);
            }
            
            .info-section:first-child {
              ${options.layout !== 'compact' ? 'border-right: 1px solid var(--gray-200);' : 'border-bottom: 1px solid var(--gray-200);'}
            }
            
            .info-section h3 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--gray-400);
              margin-bottom: 12px;
              font-weight: 600;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 12px;
              border-bottom: 1px dashed var(--gray-200);
            }
            
            .info-row:last-child { border-bottom: none; }
            
            .info-row .label { color: var(--gray-500); }
            .info-row .value { font-weight: 600; color: var(--gray-800); }
            
            /* Attendance Section */
            .attendance-section {
              padding: 16px 40px;
              background: linear-gradient(135deg, rgba(30, 176, 83, 0.05), rgba(0, 114, 198, 0.05));
              border-bottom: 1px solid var(--gray-200);
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
            }
            
            .attendance-stat {
              text-align: center;
              padding: 12px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .attendance-stat .value {
              font-size: 20px;
              font-weight: 700;
              color: var(--accent);
            }
            
            .attendance-stat .label {
              font-size: 10px;
              color: var(--gray-500);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 4px;
            }
            
            /* Pay Breakdown */
            .pay-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
            }
            
            .breakdown-section {
              padding: ${options.layout === 'compact' ? '20px 28px' : '28px 40px'};
            }
            
            .breakdown-section.earnings { border-right: 1px solid var(--gray-200); }
            
            .breakdown-section h3 {
              font-size: 13px;
              font-weight: 700;
              padding-bottom: 10px;
              margin-bottom: 12px;
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
            
            .breakdown-category {
              margin-bottom: 16px;
            }
            
            .breakdown-category h4 {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--gray-400);
              margin-bottom: 8px;
              padding-bottom: 4px;
              border-bottom: 1px solid var(--gray-100);
            }
            
            .pay-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              font-size: 12px;
              border-bottom: 1px dashed var(--gray-100);
            }
            
            .pay-item:last-of-type { border-bottom: none; }
            .pay-item .label { color: var(--gray-600); }
            .pay-item .label small { color: var(--gray-400); font-size: 10px; }
            
            .pay-item .amount {
              font-weight: 600;
              font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
              font-size: 12px;
            }
            
            .pay-item.subtotal {
              margin-top: 12px;
              padding-top: 12px;
              border-top: 2px solid var(--gray-200);
              font-weight: 700;
              font-size: 13px;
            }
            
            .breakdown-section.earnings .pay-item.subtotal .amount { color: var(--success); }
            .breakdown-section.deductions .pay-item.subtotal .amount { color: var(--danger); }
            
            /* Tax Breakdown Section */
            .tax-breakdown {
              background: #fef3c7;
              padding: 16px 40px;
              border-top: 1px solid var(--gray-200);
              border-bottom: 1px solid var(--gray-200);
            }
            
            .tax-breakdown h4 {
              font-size: 11px;
              font-weight: 600;
              color: var(--warning);
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .tax-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
            }
            
            .tax-item {
              background: white;
              padding: 12px;
              border-radius: 8px;
              text-align: center;
            }
            
            .tax-item .value {
              font-size: 16px;
              font-weight: 700;
              color: var(--gray-800);
            }
            
            .tax-item .label {
              font-size: 10px;
              color: var(--gray-500);
              margin-top: 4px;
            }
            
            /* Statutory Note */
            .statutory-note {
              background: var(--gray-50);
              padding: 12px 40px;
              font-size: 10px;
              color: var(--gray-500);
              text-align: center;
              border-top: 1px solid var(--gray-200);
              border-bottom: 1px solid var(--gray-200);
            }
            
            /* Net Pay Section */
            .net-pay-section {
              padding: ${options.layout === 'compact' ? '20px 28px' : '28px 40px'};
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 20px;
            }
            
            .summary-card {
              padding: 16px;
              border-radius: 12px;
              text-align: center;
            }
            
            .summary-card.gross { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
            .summary-card.deductions { background: linear-gradient(135deg, #fef2f2, #fecaca); }
            .summary-card.employer { background: linear-gradient(135deg, #f5f3ff, #e9d5ff); }
            
            .summary-card .value {
              font-size: 18px;
              font-weight: 700;
              font-family: 'SF Mono', monospace;
            }
            
            .summary-card.gross .value { color: var(--success); }
            .summary-card.deductions .value { color: var(--danger); }
            .summary-card.employer .value { color: #7c3aed; }
            
            .summary-card .label {
              font-size: 11px;
              color: var(--gray-500);
              margin-top: 4px;
            }
            
            .net-pay-box {
              padding: 24px;
              background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
              border-radius: 16px;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 8px 24px rgba(30, 176, 83, 0.3);
            }
            
            .net-pay-box .label {
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .net-pay-box .amount {
              font-size: 28px;
              font-weight: 800;
              font-family: 'SF Mono', monospace;
            }
            
            .net-pay-box .amount-words {
              font-size: 11px;
              opacity: 0.8;
              margin-top: 4px;
            }
            
            /* Bank Details */
            .bank-details {
              margin-top: 20px;
              padding: 16px;
              background: var(--gray-50);
              border-radius: 12px;
              border: 1px dashed var(--gray-300);
            }
            
            .bank-details h4 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--gray-400);
              margin-bottom: 12px;
            }
            
            .bank-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            
            .bank-item .label { font-size: 10px; color: var(--gray-500); }
            .bank-item .value { font-size: 13px; font-weight: 600; }
            
            /* Employer Cost Section */
            .employer-cost {
              margin-top: 16px;
              padding: 16px;
              background: linear-gradient(135deg, #f5f3ff, #ede9fe);
              border-radius: 12px;
            }
            
            .employer-cost h4 {
              font-size: 11px;
              color: #7c3aed;
              margin-bottom: 12px;
              font-weight: 600;
            }
            
            .employer-cost-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }
            
            .employer-cost-item {
              text-align: center;
              padding: 12px;
              background: white;
              border-radius: 8px;
            }
            
            .employer-cost-item .value {
              font-size: 14px;
              font-weight: 700;
              color: #7c3aed;
            }
            
            .employer-cost-item .label {
              font-size: 9px;
              color: var(--gray-500);
              margin-top: 4px;
            }
            
            /* Footer */
            .footer-accent {
              height: 4px;
              background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
            }
            
            .payslip-footer {
              background: var(--gray-900);
              color: white;
              padding: 20px 40px;
              text-align: center;
            }
            
            .footer-text { font-size: 11px; opacity: 0.7; }
            .footer-brand { margin-top: 8px; font-size: 10px; opacity: 0.5; }
            .footer-generated { margin-top: 4px; font-size: 9px; opacity: 0.4; }
            
            /* Print Styles */
            @media print {
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              html, body { padding: 0; margin: 0; background: white !important; }
              .payslip-container { box-shadow: none; max-width: 100%; border-radius: 0; }
            }
            
            @page { margin: 10mm; size: A4 portrait; }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <div class="sl-stripe"></div>
            <div class="header-accent"></div>
            
            <div class="payslip-header">
              ${options.layout !== 'classic' ? '<div class="header-bg"></div>' : ''}
              <div class="header-content">
                <div class="company-brand">
                  <div class="company-logo">
                    ${hasLogo 
                      ? `<img src="${organisation.logo_url}" alt="${organisation.name}" />`
                      : `<span>${orgInitials}</span>`
                    }
                  </div>
                  <div class="company-details">
                    <h1>${organisation?.name || 'Organisation'}</h1>
                    <div class="address">
                      ${organisation?.address ? `${organisation.address}${organisation?.city ? `, ${organisation.city}` : ''}` : ''}
                      ${organisation?.country || 'Sierra Leone'}
                    </div>
                    ${organisation?.phone || organisation?.email ? `
                      <div class="contact">
                        ${organisation?.phone ? `📞 ${organisation.phone}` : ''} 
                        ${organisation?.email ? `✉️ ${organisation.email}` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
                <div class="payslip-badge">
                  <h2>Payslip</h2>
                  <div class="period">${format(new Date(payroll?.period_start), 'MMMM yyyy')}</div>
                  <div class="frequency">${frequencyLabel} Pay</div>
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
                  <span class="value">${employee?.position || employee?.role?.replace(/_/g, ' ') || 'N/A'}</span>
                </div>
                ${employee?.assigned_location_name ? `
                <div class="info-row">
                  <span class="label">Location</span>
                  <span class="value">${employee.assigned_location_name}</span>
                </div>
                ` : ''}
              </div>
              <div class="info-section">
                <h3>Pay Period</h3>
                <div class="info-row">
                  <span class="label">Period</span>
                  <span class="value">${format(new Date(payroll?.period_start), 'dd MMM')} - ${format(new Date(payroll?.period_end), 'dd MMM yyyy')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Date</span>
                  <span class="value">${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMMM yyyy') : 'Pending'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Method</span>
                  <span class="value">${(payroll?.payment_method || 'Bank Transfer').replace(/_/g, ' ')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Status</span>
                  <span class="value" style="color: ${payroll?.status === 'paid' ? 'var(--success)' : 'var(--warning)'};">
                    ${(payroll?.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            ${options.showAttendance ? `
            <div class="attendance-section">
              <div class="attendance-stat">
                <div class="value">${safeNum(payroll?.days_worked)}</div>
                <div class="label">Days Worked</div>
              </div>
              <div class="attendance-stat">
                <div class="value">${safeNum(payroll?.hours_worked)}</div>
                <div class="label">Regular Hours</div>
              </div>
              <div class="attendance-stat">
                <div class="value">${safeNum(payroll?.overtime_hours)}</div>
                <div class="label">Overtime Hours</div>
              </div>
              <div class="attendance-stat">
                <div class="value">${safeNum(payroll?.weekend_hours) + safeNum(payroll?.holiday_hours)}</div>
                <div class="label">Weekend/Holiday</div>
              </div>
            </div>
            ` : ''}
            
            <div class="pay-breakdown">
              <div class="breakdown-section earnings">
                <h3>💰 Earnings</h3>
                
                <div class="breakdown-category">
                  <h4>Base Pay</h4>
                  <div class="pay-item">
                    <span class="label">
                      Base Salary
                      ${proratedSalary !== baseSalary ? `<small>(prorated)</small>` : ''}
                    </span>
                    <span class="amount">Le ${proratedSalary.toLocaleString()}</span>
                  </div>
                </div>
                
                ${(overtimePay > 0 || weekendPay > 0 || holidayPay > 0) ? `
                <div class="breakdown-category">
                  <h4>Overtime & Premium Pay</h4>
                  ${overtimePay > 0 ? `
                    <div class="pay-item">
                      <span class="label">Overtime <small>(${safeNum(payroll?.overtime_hours)}h @ ${payroll?.overtime_rate_multiplier || 1.5}x)</small></span>
                      <span class="amount">Le ${overtimePay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${weekendPay > 0 ? `
                    <div class="pay-item">
                      <span class="label">Weekend Pay <small>(${safeNum(payroll?.weekend_hours)}h @ 2x)</small></span>
                      <span class="amount">Le ${weekendPay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${holidayPay > 0 ? `
                    <div class="pay-item">
                      <span class="label">Holiday Pay <small>(${safeNum(payroll?.holiday_hours)}h @ 2.5x)</small></span>
                      <span class="amount">Le ${holidayPay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                </div>
                ` : ''}
                
                ${allowances.length > 0 ? `
                <div class="breakdown-category">
                  <h4>Allowances</h4>
                  ${allowances.map(a => `
                    <div class="pay-item">
                      <span class="label">${a.name}</span>
                      <span class="amount">Le ${safeNum(a.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                ${bonuses.length > 0 ? `
                <div class="breakdown-category">
                  <h4>Bonuses</h4>
                  ${bonuses.map(b => `
                    <div class="pay-item">
                      <span class="label">${b.name} <small>(${b.type || 'bonus'})</small></span>
                      <span class="amount">Le ${safeNum(b.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                <div class="pay-item subtotal">
                  <span class="label">Gross Pay</span>
                  <span class="amount">Le ${grossPay.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="breakdown-section deductions">
                <h3>📉 Deductions</h3>
                
                <div class="breakdown-category">
                  <h4>Statutory Deductions</h4>
                  ${nassitEmployee > 0 ? `
                    <div class="pay-item">
                      <span class="label">NASSIT Employee <small>(5%)</small></span>
                      <span class="amount">Le ${nassitEmployee.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${payeTax > 0 ? `
                    <div class="pay-item">
                      <span class="label">PAYE Tax <small>(${effectiveTaxRate}%)</small></span>
                      <span class="amount">Le ${payeTax.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${nassitEmployee === 0 && payeTax === 0 ? `
                    <div class="pay-item">
                      <span class="label">No statutory deductions</span>
                      <span class="amount">Le 0</span>
                    </div>
                  ` : ''}
                </div>
                
                ${deductions.length > 0 ? `
                <div class="breakdown-category">
                  <h4>Other Deductions</h4>
                  ${deductions.map(d => `
                    <div class="pay-item">
                      <span class="label">${d.name} <small>(${d.type || 'other'})</small></span>
                      <span class="amount">Le ${safeNum(d.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                <div class="pay-item subtotal">
                  <span class="label">Total Deductions</span>
                  <span class="amount">Le ${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            ${options.showTaxBreakdown ? `
            <div class="tax-breakdown">
              <h4>🏛️ Tax Information (Sierra Leone)</h4>
              <div class="tax-grid">
                <div class="tax-item">
                  <div class="value">${taxBracket}</div>
                  <div class="label">Tax Bracket</div>
                </div>
                <div class="tax-item">
                  <div class="value">${effectiveTaxRate}%</div>
                  <div class="label">Effective Rate</div>
                </div>
                <div class="tax-item">
                  <div class="value">Le ${(nassitEmployee + payeTax).toLocaleString()}</div>
                  <div class="label">Total Statutory</div>
                </div>
              </div>
            </div>
            ` : ''}
            
            <div class="statutory-note">
              🇸🇱 Statutory deductions per Sierra Leone Finance Act 2024: NASSIT (5% employee, 10% employer) and PAYE progressive tax brackets
            </div>
            
            <div class="net-pay-section">
              <div class="summary-grid">
                <div class="summary-card gross">
                  <div class="value">Le ${grossPay.toLocaleString()}</div>
                  <div class="label">Gross Pay</div>
                </div>
                <div class="summary-card deductions">
                  <div class="value">- Le ${totalDeductions.toLocaleString()}</div>
                  <div class="label">Total Deductions</div>
                </div>
                ${options.showEmployerCost ? `
                <div class="summary-card employer">
                  <div class="value">Le ${employerCost.toLocaleString()}</div>
                  <div class="label">Employer Cost</div>
                </div>
                ` : `
                <div class="summary-card" style="background: var(--gray-50);">
                  <div class="value" style="color: var(--gray-600);">${frequencyLabel}</div>
                  <div class="label">Pay Frequency</div>
                </div>
                `}
              </div>
              
              <div class="net-pay-box">
                <div>
                  <div class="label">💵 NET PAY</div>
                  <div class="amount-words">(Amount payable to employee)</div>
                </div>
                <div style="text-align: right;">
                  <div class="amount">Le ${netPay.toLocaleString()}</div>
                </div>
              </div>
              
              ${options.showBankDetails && (employee?.bank_name || payroll?.bank_name) ? `
              <div class="bank-details">
                <h4>🏦 Bank Details</h4>
                <div class="bank-grid">
                  <div class="bank-item">
                    <div class="label">Bank Name</div>
                    <div class="value">${payroll?.bank_name || employee?.bank_name || 'N/A'}</div>
                  </div>
                  <div class="bank-item">
                    <div class="label">Account Number</div>
                    <div class="value">${payroll?.bank_account || employee?.bank_account || 'N/A'}</div>
                  </div>
                </div>
              </div>
              ` : ''}
              
              ${options.showEmployerCost ? `
              <div class="employer-cost">
                <h4>👔 Employer Contribution Summary</h4>
                <div class="employer-cost-grid">
                  <div class="employer-cost-item">
                    <div class="value">Le ${grossPay.toLocaleString()}</div>
                    <div class="label">Gross Salary</div>
                  </div>
                  <div class="employer-cost-item">
                    <div class="value">Le ${nassitEmployer.toLocaleString()}</div>
                    <div class="label">NASSIT (10%)</div>
                  </div>
                  <div class="employer-cost-item">
                    <div class="value">Le ${employerCost.toLocaleString()}</div>
                    <div class="label">Total Cost</div>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="footer-accent"></div>
            <div class="payslip-footer">
              <div class="footer-text">This is a computer-generated payslip and does not require a signature.</div>
              <div class="footer-brand">${organisation?.name || 'Organisation'} • Sierra Leone 🇸🇱</div>
              <div class="footer-generated">Generated on ${format(new Date(), 'dd MMMM yyyy, HH:mm')}</div>
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