import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, Download, Settings2, Eye, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
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
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

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
    const primaryColor = organisation?.primary_color || colors.primary;
    const secondaryColor = organisation?.secondary_color || colors.secondary;
    
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
          <style>
            ${getUnifiedPDFStyles(organisation, 'payslip')}
            
            /* Payslip-specific styles */
            :root {
              --accent: ${colors.accent};
              --success: ${colors.primary};
              --success-dark: ${colors.secondary};
            }
            
            /* Attendance Info */
            .attendance-section {
              background: #f8fafc;
              padding: 16px 32px;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .attendance-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
            }
            
            .attendance-item {
              text-align: center;
            }
            
            .attendance-item .att-value {
              font-size: 18px;
              font-weight: 700;
              color: #1e293b;
            }
            
            .attendance-item .att-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
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
            
            .tax-row .tax-label { color: #a16207; }
            .tax-row .tax-value { font-weight: 600; color: #92400e; }
            
            /* Employer Cost Section */
            .employer-cost-section {
              background: #f1f5f9;
              padding: 16px 32px;
              border-top: 1px dashed #cbd5e1;
            }
            
            .employer-cost-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              text-align: center;
            }
            
            .employer-cost-item .ec-value {
              font-size: 16px;
              font-weight: 700;
              color: #334155;
            }
            
            .employer-cost-item .ec-label {
              font-size: 11px;
              color: #64748b;
            }
            
            .employer-cost-item.total .ec-value {
              color: #0f172a;
              font-size: 18px;
            }
            
            /* Employee Info Grid */
            .employee-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .info-section-box {
              padding: 24px 32px;
              background: #f8fafc;
            }
            
            .info-section-box:first-child {
              border-right: 1px solid #e2e8f0;
            }
            
            .info-section-box h3 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              margin-bottom: 16px;
              font-weight: 600;
            }
            
            .info-row-box {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
              border-bottom: 1px dashed #e2e8f0;
            }
            
            .info-row-box:last-child {
              border-bottom: none;
            }
            
            .info-row-box .ir-label {
              color: #64748b;
            }
            
            .info-row-box .ir-value {
              font-weight: 600;
              color: #1e293b;
            }
            
            /* Pay Breakdown */
            .pay-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
            }
            
            .breakdown-section {
              padding: 28px 32px;
            }
            
            .breakdown-section.earnings {
              border-right: 1px solid #e2e8f0;
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
              color: ${primaryColor};
              border-color: ${primaryColor};
            }
            
            .breakdown-section.deductions h3 {
              color: #ef4444;
              border-color: #ef4444;
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
            
            .pay-item .pi-label {
              color: #475569;
            }
            
            .pay-item .pi-amount {
              font-weight: 600;
              font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
              font-size: 13px;
            }
            
            .pay-item.subtotal {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid #e2e8f0;
              font-weight: 700;
              font-size: 14px;
            }
            
            .breakdown-section.earnings .pay-item.subtotal .pi-amount {
              color: ${primaryColor};
            }
            
            .breakdown-section.deductions .pay-item.subtotal .pi-amount {
              color: #ef4444;
            }
            
            /* Statutory Note */
            .statutory-note {
              background: #f8fafc;
              padding: 12px 32px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
            }
            
            /* Net Pay Section */
            .net-pay-section {
              padding: 28px 32px;
            }
            
            .summary-row-pay {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              padding: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="document">
            ${getUnifiedHeader(organisation, 'Payslip', format(new Date(payroll?.period_start), 'MMMM yyyy'), `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Pay`, 'payslip')}
            
            <div class="employee-info">
              <div class="info-section-box">
                <h3>Employee Details</h3>
                <div class="info-row-box">
                  <span class="ir-label">Full Name</span>
                  <span class="ir-value">${employee?.full_name}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Employee ID</span>
                  <span class="ir-value">${employee?.employee_code}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Department</span>
                  <span class="ir-value">${employee?.department || 'N/A'}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Position</span>
                  <span class="ir-value">${employee?.position || 'N/A'}</span>
                </div>
              </div>
              <div class="info-section-box">
                <h3>Pay Period</h3>
                <div class="info-row-box">
                  <span class="ir-label">Period Start</span>
                  <span class="ir-value">${format(new Date(payroll?.period_start), 'dd MMMM yyyy')}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Period End</span>
                  <span class="ir-value">${format(new Date(payroll?.period_end), 'dd MMMM yyyy')}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Payment Date</span>
                  <span class="ir-value">${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMMM yyyy') : 'Pending'}</span>
                </div>
                <div class="info-row-box">
                  <span class="ir-label">Payment Method</span>
                  <span class="ir-value">${(payroll?.payment_method || 'Bank Transfer').replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
            
            ${options.showAttendance ? `
            <div class="attendance-section">
              <div class="attendance-grid">
                <div class="attendance-item">
                  <div class="att-value">${daysWorked}</div>
                  <div class="att-label">Days Worked</div>
                </div>
                <div class="attendance-item">
                  <div class="att-value">${hoursWorked}</div>
                  <div class="att-label">Regular Hours</div>
                </div>
                <div class="attendance-item">
                  <div class="att-value">${overtimeHours}</div>
                  <div class="att-label">Overtime Hours</div>
                </div>
                <div class="attendance-item">
                  <div class="att-value">${weekendHours + holidayHours}</div>
                  <div class="att-label">Special Hours</div>
                </div>
                <div class="attendance-item">
                  <div class="att-value">Le ${hourlyRate.toLocaleString()}</div>
                  <div class="att-label">Hourly Rate</div>
                </div>
              </div>
            </div>
            ` : ''}
            
            <div class="pay-breakdown">
              <div class="breakdown-section earnings">
                <h3>💰 Earnings</h3>
                
                <!-- Base Pay Section -->
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Base Pay</div>
                  <div class="pay-item">
                    <span class="pi-label">Base Salary (${frequency})</span>
                    <span class="pi-amount">Le ${basePay.toLocaleString()}</span>
                  </div>
                  ${proratedSalary !== basePay ? `
                    <div class="pay-item">
                      <span class="pi-label">Prorated Amount</span>
                      <span class="pi-amount">Le ${proratedSalary.toLocaleString()}</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Overtime Section -->
                ${(overtimePay > 0 || weekendPay > 0 || holidayPay > 0) ? `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Overtime & Special Pay</div>
                  ${overtimePay > 0 ? `
                    <div class="pay-item">
                      <span class="pi-label">Overtime (${overtimeHours} hrs @ 1.5x)</span>
                      <span class="pi-amount">Le ${overtimePay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${weekendPay > 0 ? `
                    <div class="pay-item">
                      <span class="pi-label">Weekend (${weekendHours} hrs @ 2x)</span>
                      <span class="pi-amount">Le ${weekendPay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${holidayPay > 0 ? `
                    <div class="pay-item">
                      <span class="pi-label">Holiday (${holidayHours} hrs @ 2.5x)</span>
                      <span class="pi-amount">Le ${holidayPay.toLocaleString()}</span>
                    </div>
                  ` : ''}
                </div>
                ` : ''}
                
                <!-- Allowances Section -->
                ${allowances.length > 0 ? `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Allowances</div>
                  ${allowances.map(a => `
                    <div class="pay-item">
                      <span class="pi-label">${a.name}</span>
                      <span class="pi-amount">Le ${safeNum(a.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                <!-- Bonuses Section -->
                ${bonuses.length > 0 ? `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Bonuses</div>
                  ${bonuses.map(b => `
                    <div class="pay-item">
                      <span class="pi-label">${b.name}${b.type ? ` (${b.type.replace('_', ' ')})` : ''}</span>
                      <span class="pi-amount">Le ${safeNum(b.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                <div class="pay-item subtotal">
                  <span class="pi-label">Total Earnings (Gross)</span>
                  <span class="pi-amount">Le ${grossPay.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="breakdown-section deductions">
                <h3>📉 Deductions</h3>
                
                <!-- Statutory Deductions -->
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Statutory Deductions</div>
                  ${nassitEmployee > 0 ? `
                    <div class="pay-item">
                      <span class="pi-label">NASSIT Employee (5%)</span>
                      <span class="pi-amount">Le ${nassitEmployee.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${payeTax > 0 ? `
                    <div class="pay-item">
                      <span class="pi-label">PAYE Income Tax</span>
                      <span class="pi-amount">Le ${payeTax.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  ${nassitEmployee === 0 && payeTax === 0 ? `
                    <div class="pay-item">
                      <span class="pi-label" style="color: #94a3b8;">No statutory deductions</span>
                      <span class="pi-amount">Le 0</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Other Deductions -->
                ${deductions.length > 0 ? `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Other Deductions</div>
                  ${deductions.map(d => `
                    <div class="pay-item">
                      <span class="pi-label">${d.name}</span>
                      <span class="pi-amount">Le ${safeNum(d.amount).toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
                
                ${options.showTaxBreakdown && payeTax > 0 ? `
                <div class="tax-breakdown">
                  <h4>🇸🇱 Tax Information</h4>
                  <div class="tax-row">
                    <span class="tax-label">Tax Bracket</span>
                    <span class="tax-value">${taxBracket}</span>
                  </div>
                  <div class="tax-row">
                    <span class="tax-label">Effective Rate</span>
                    <span class="tax-value">${effectiveTaxRate.toFixed(2)}%</span>
                  </div>
                </div>
                ` : ''}
                
                <div class="pay-item subtotal">
                  <span class="pi-label">Total Deductions</span>
                  <span class="pi-amount">Le ${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="statutory-note">
              * Statutory deductions include NASSIT (5% employee contribution) and PAYE Tax as per Sierra Leone regulations
            </div>
            
            <div class="net-pay-section">
              <div class="summary-row-pay">
                <span>Gross Pay</span>
                <span>Le ${grossPay.toLocaleString()}</span>
              </div>
              <div class="summary-row-pay">
                <span>Total Deductions</span>
                <span style="color: #ef4444;">- Le ${totalDeductions.toLocaleString()}</span>
              </div>
              <div class="net-pay-box">
                <span class="label">💵 NET PAY</span>
                <span class="amount">Le ${netPay.toLocaleString()}</span>
              </div>
            </div>
            
            ${options.showEmployerCost ? `
            <div class="employer-cost-section">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; font-weight: 600; text-align: center;">Employer Contribution Summary</div>
              <div class="employer-cost-grid">
                <div class="employer-cost-item">
                  <div class="ec-value">Le ${grossPay.toLocaleString()}</div>
                  <div class="ec-label">Gross Salary</div>
                </div>
                <div class="employer-cost-item">
                  <div class="ec-value">+ Le ${nassitEmployer.toLocaleString()}</div>
                  <div class="ec-label">NASSIT Employer (10%)</div>
                </div>
                <div class="employer-cost-item total">
                  <div class="ec-value">Le ${employerCost.toLocaleString()}</div>
                  <div class="ec-label">Total Employer Cost</div>
                </div>
              </div>
            </div>
            ` : ''}
            
            ${getUnifiedFooter(organisation)}
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

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await base44.functions.invoke('generateDocumentPDF', {
        documentType: 'payslip',
        data: { payroll, employee },
        organisation
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip-${employee?.full_name}-${format(new Date(payroll?.period_start), 'MMM-yyyy')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payslip downloaded");
    } catch (error) {
      console.error('PDF error:', error);
      // Fallback to HTML
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
      toast.info("Downloaded as HTML");
    }
    setIsDownloading(false);
  };

  if (!payroll || !employee) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" variant="outline" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-1" />
        Print
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
      
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          <iframe
            srcDoc={generatePayslipHTML()}
            className="w-full h-[600px] border rounded-lg"
            title="Payslip Preview"
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">
            <Settings2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Payslip Options
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color Scheme</Label>
              <Select 
                value={options.colorScheme} 
                onValueChange={(v) => setOptions({...options, colorScheme: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#1EB053]" />
                      Sierra Leone Green
                    </div>
                  </SelectItem>
                  <SelectItem value="blue">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#0072C6]" />
                      Corporate Blue
                    </div>
                  </SelectItem>
                  <SelectItem value="purple">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#7c3aed]" />
                      Modern Purple
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Display Options</Label>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Show Company Logo</p>
                  <p className="text-xs text-gray-500">Display organization logo in header</p>
                </div>
                <Switch 
                  checked={options.showLogo} 
                  onCheckedChange={(v) => setOptions({...options, showLogo: v})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Show Attendance Data</p>
                  <p className="text-xs text-gray-500">Days worked, hours, and rates</p>
                </div>
                <Switch 
                  checked={options.showAttendance} 
                  onCheckedChange={(v) => setOptions({...options, showAttendance: v})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Show Tax Breakdown</p>
                  <p className="text-xs text-gray-500">Tax bracket and effective rate</p>
                </div>
                <Switch 
                  checked={options.showTaxBreakdown} 
                  onCheckedChange={(v) => setOptions({...options, showTaxBreakdown: v})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Show Employer Cost</p>
                  <p className="text-xs text-gray-500">Total cost including employer contributions</p>
                </div>
                <Switch 
                  checked={options.showEmployerCost} 
                  onCheckedChange={(v) => setOptions({...options, showEmployerCost: v})}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}