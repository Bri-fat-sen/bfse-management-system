import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { generateExportHTML, printDocument, downloadHTML } from "@/components/exports/SierraLeoneExportStyles";

export default function PayslipGenerator({ payroll, employee, organisation }) {
  const generatePayslipHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Payslip - ${employee?.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              background: #f5f5f5;
              padding: 20px;
            }
            .payslip {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .flag-stripe {
              height: 8px;
              display: flex;
            }
            .flag-stripe .green { flex: 1; background: #1EB053; }
            .flag-stripe .white { flex: 1; background: #FFFFFF; }
            .flag-stripe .blue { flex: 1; background: #0072C6; }
            .header {
              background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
              color: white;
              padding: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info h1 { font-size: 24px; margin-bottom: 4px; }
            .company-info p { font-size: 12px; opacity: 0.9; }
            .payslip-title {
              text-align: right;
            }
            .payslip-title h2 { font-size: 20px; }
            .payslip-title p { font-size: 12px; opacity: 0.9; }
            .employee-section {
              padding: 20px 24px;
              background: #f8f9fa;
              border-bottom: 1px solid #eee;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .employee-section h3 {
              color: #0072C6;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .employee-section p {
              font-size: 14px;
              margin: 4px 0;
            }
            .employee-section strong { color: #333; }
            .earnings-deductions {
              padding: 24px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
            }
            .section h3 {
              font-size: 14px;
              text-transform: uppercase;
              padding-bottom: 10px;
              margin-bottom: 12px;
              border-bottom: 2px solid;
            }
            .section.earnings h3 { color: #1EB053; border-color: #1EB053; }
            .section.deductions h3 { color: #DC2626; border-color: #DC2626; }
            .line-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              border-bottom: 1px dashed #eee;
            }
            .line-item:last-child { border-bottom: none; }
            .line-item .label { color: #666; }
            .line-item .amount { font-weight: 600; }
            .totals {
              padding: 20px 24px;
              background: #f8f9fa;
              border-top: 2px solid #eee;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 16px;
            }
            .total-row.net-pay {
              font-size: 24px;
              font-weight: bold;
              color: #1EB053;
              padding-top: 16px;
              margin-top: 8px;
              border-top: 3px solid #1EB053;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background: #0F1F3C;
              color: white;
              font-size: 12px;
            }
            .footer .sl-flag { font-size: 20px; margin-bottom: 8px; }
            .statutory-note {
              padding: 12px 24px;
              background: #E3F2FD;
              font-size: 11px;
              color: #0072C6;
              text-align: center;
            }
            @media print {
              body { padding: 0; background: white; }
              .payslip { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="flag-stripe">
              <div class="green"></div>
              <div class="white"></div>
              <div class="blue"></div>
            </div>
            
            <div class="header">
              <div class="company-info" style="display: flex; align-items: center; gap: 16px;">
                ${organisation?.logo_url ? `
                  <img src="${organisation.logo_url}" alt="${organisation?.name}" style="height: 50px; object-fit: contain; background: white; padding: 6px; border-radius: 8px;" />
                ` : ''}
                <div>
                  <h1>${organisation?.name || 'BFSE'}</h1>
                  <p>${organisation?.address || 'Freetown'}, Sierra Leone</p>
                  <p>Tel: ${organisation?.phone || '+232 XX XXX XXX'}</p>
                </div>
              </div>
              <div class="payslip-title">
                <h2>PAYSLIP</h2>
                <p>${format(new Date(payroll?.period_start), 'MMMM yyyy')}</p>
              </div>
            </div>
            
            <div class="employee-section">
              <div>
                <h3>Employee Details</h3>
                <p><strong>Name:</strong> ${employee?.full_name}</p>
                <p><strong>Employee ID:</strong> ${employee?.employee_code}</p>
                <p><strong>Department:</strong> ${employee?.department || 'N/A'}</p>
                <p><strong>Position:</strong> ${employee?.position || 'N/A'}</p>
              </div>
              <div>
                <h3>Pay Period</h3>
                <p><strong>From:</strong> ${format(new Date(payroll?.period_start), 'dd MMMM yyyy')}</p>
                <p><strong>To:</strong> ${format(new Date(payroll?.period_end), 'dd MMMM yyyy')}</p>
                <p><strong>Pay Date:</strong> ${payroll?.payment_date ? format(new Date(payroll.payment_date), 'dd MMMM yyyy') : 'Pending'}</p>
              </div>
            </div>
            
            <div class="earnings-deductions">
              <div class="section earnings">
                <h3>Earnings</h3>
                <div class="line-item">
                  <span class="label">Base Salary</span>
                  <span class="amount">SLE ${payroll?.base_salary?.toLocaleString()}</span>
                </div>
                ${payroll?.overtime_pay > 0 ? `
                  <div class="line-item">
                    <span class="label">Overtime (${payroll.overtime_hours} hrs)</span>
                    <span class="amount">SLE ${payroll.overtime_pay.toLocaleString()}</span>
                  </div>
                ` : ''}
                ${payroll?.allowances?.map(a => `
                  <div class="line-item">
                    <span class="label">${a.name}</span>
                    <span class="amount">SLE ${parseFloat(a.amount).toLocaleString()}</span>
                  </div>
                `).join('') || ''}
                <div class="line-item" style="font-weight: bold; border-top: 1px solid #1EB053; margin-top: 8px; padding-top: 12px;">
                  <span class="label">Total Earnings</span>
                  <span class="amount" style="color: #1EB053;">SLE ${payroll?.gross_pay?.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="section deductions">
                <h3>Deductions</h3>
                ${payroll?.deductions?.map(d => `
                  <div class="line-item">
                    <span class="label">${d.name}${d.statutory ? ' *' : ''}</span>
                    <span class="amount">SLE ${parseFloat(d.amount).toLocaleString()}</span>
                  </div>
                `).join('') || '<div class="line-item"><span class="label">No deductions</span><span class="amount">SLE 0</span></div>'}
                <div class="line-item" style="font-weight: bold; border-top: 1px solid #DC2626; margin-top: 8px; padding-top: 12px;">
                  <span class="label">Total Deductions</span>
                  <span class="amount" style="color: #DC2626;">SLE ${payroll?.total_deductions?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="statutory-note">
              * Statutory deductions include NASSIT (5% employee contribution) and PAYE Tax as per Sierra Leone tax regulations
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Gross Pay</span>
                <span>SLE ${payroll?.gross_pay?.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Total Deductions</span>
                <span style="color: #DC2626;">- SLE ${payroll?.total_deductions?.toLocaleString()}</span>
              </div>
              <div class="total-row net-pay">
                <span>NET PAY</span>
                <span>SLE ${payroll?.net_pay?.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="sl-flag">🇸🇱</div>
              <p>This is a computer generated payslip and does not require a signature.</p>
              <p style="margin-top: 8px; opacity: 0.8;">${organisation?.name || 'BFSE'} Management System • Proudly Sierra Leonean</p>
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