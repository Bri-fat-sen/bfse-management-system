import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

const safeNum = (val) => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatMonth = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payroll, employee, organisation, recipientEmail, subject, message } = await req.json();

    if (!payroll || !employee || !recipientEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Sierra Leone Flag Stripe
    doc.setFillColor(30, 176, 83);
    doc.rect(0, 0, pageWidth / 3, 5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 5, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect((2 * pageWidth) / 3, 0, pageWidth / 3, 5, 'F');

    // Header
    let yPos = 20;
    doc.setFontSize(24);
    doc.setTextColor(30, 176, 83);
    doc.setFont('helvetica', 'bold');
    doc.text(organisation?.name || 'Organisation', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(16);
    doc.setTextColor(0, 114, 198);
    doc.text('PAYSLIP', pageWidth / 2, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(formatMonth(payroll.period_start), pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Employee Info Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, (pageWidth - 28) / 2 - 2, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, yPos, (pageWidth - 28) / 2 - 2, 35);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE DETAILS', 18, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Full Name:', 18, yPos + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(employee.full_name, 45, yPos + 13);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Employee ID:', 18, yPos + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(employee.employee_code, 45, yPos + 19);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Department:', 18, yPos + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(employee.department || 'N/A', 45, yPos + 25);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Position:', 18, yPos + 31);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(employee.position || 'N/A', 45, yPos + 31);

    // Pay Period Box
    doc.setFillColor(248, 250, 252);
    doc.rect(pageWidth / 2 + 2, yPos, (pageWidth - 28) / 2 - 2, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(pageWidth / 2 + 2, yPos, (pageWidth - 28) / 2 - 2, 35);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('PAY PERIOD', pageWidth / 2 + 6, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Period Start:', pageWidth / 2 + 6, yPos + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatDate(payroll.period_start), pageWidth / 2 + 32, yPos + 13);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Period End:', pageWidth / 2 + 6, yPos + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatDate(payroll.period_end), pageWidth / 2 + 32, yPos + 19);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Payment Date:', pageWidth / 2 + 6, yPos + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(payroll.payment_date ? formatDate(payroll.payment_date) : 'Pending', pageWidth / 2 + 32, yPos + 25);

    yPos += 45;

    // Earnings Section
    doc.setFillColor(30, 176, 83);
    doc.rect(14, yPos, (pageWidth - 28) / 2 - 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EARNINGS', 18, yPos + 5.5);

    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');

    const basePay = safeNum(payroll.base_salary);
    const grossPay = safeNum(payroll.gross_pay);
    const totalBonuses = safeNum(payroll.total_bonuses);
    const totalAllowances = safeNum(payroll.total_allowances);

    doc.text('Base Salary', 18, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Le ${basePay.toLocaleString()}`, pageWidth / 2 - 6, yPos, { align: 'right' });
    yPos += 6;

    if (totalBonuses > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Bonuses', 18, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`Le ${totalBonuses.toLocaleString()}`, pageWidth / 2 - 6, yPos, { align: 'right' });
      yPos += 6;
    }

    if (totalAllowances > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Allowances', 18, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`Le ${totalAllowances.toLocaleString()}`, pageWidth / 2 - 6, yPos, { align: 'right' });
      yPos += 6;
    }

    yPos += 2;
    doc.setDrawColor(30, 176, 83);
    doc.setLineWidth(0.5);
    doc.line(18, yPos, pageWidth / 2 - 6, yPos);
    yPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(30, 176, 83);
    doc.text('GROSS PAY', 18, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Le ${grossPay.toLocaleString()}`, pageWidth / 2 - 6, yPos, { align: 'right' });

    // Deductions Section
    yPos = 115;
    doc.setFillColor(239, 68, 68);
    doc.rect(pageWidth / 2 + 2, yPos, (pageWidth - 28) / 2 - 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DEDUCTIONS', pageWidth / 2 + 6, yPos + 5.5);

    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');

    const nassitEmployee = safeNum(payroll.nassit_employee);
    const payeTax = safeNum(payroll.paye_tax);
    const totalDeductions = safeNum(payroll.total_deductions);

    if (nassitEmployee > 0) {
      doc.text('NASSIT Employee (5%)', pageWidth / 2 + 6, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`Le ${nassitEmployee.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;
    }

    if (payeTax > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('PAYE Tax', pageWidth / 2 + 6, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`Le ${payeTax.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;
    }

    yPos += 2;
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 + 6, yPos, pageWidth - 20, yPos);
    yPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DEDUCTIONS', pageWidth / 2 + 6, yPos);
    doc.text(`Le ${totalDeductions.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });

    // Net Pay Box
    yPos += 15;
    doc.setFillColor(240, 253, 244);
    doc.rect(14, yPos, pageWidth - 28, 20, 'F');
    doc.setDrawColor(30, 176, 83);
    doc.setLineWidth(1);
    doc.rect(14, yPos, pageWidth - 28, 20);

    doc.setFontSize(12);
    doc.setTextColor(30, 176, 83);
    doc.setFont('helvetica', 'bold');
    doc.text('NET PAY', 18, yPos + 7);

    doc.setFontSize(16);
    const netPay = safeNum(payroll.net_pay);
    doc.text(`Le ${netPay.toLocaleString()}`, pageWidth - 18, yPos + 13, { align: 'right' });

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated payslip. No signature required.', pageWidth / 2, yPos, { align: 'center' });

    // Bottom flag stripe
    doc.setFillColor(30, 176, 83);
    doc.rect(0, pageHeight - 5, pageWidth / 3, 5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth / 3, pageHeight - 5, pageWidth / 3, 5, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect((2 * pageWidth) / 3, pageHeight - 5, pageWidth / 3, 5, 'F');

    // Convert PDF to base64
    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Send email using MailerSend
    const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
    if (!mailersendApiKey) {
      return Response.json({ error: 'MAILERSEND_API_KEY not configured' }, { status: 500 });
    }

    const emailPayload = {
      from: {
        email: 'noreply@trial-z3m5jgr7yjvl7oqw.mlsender.net',
        name: organisation?.name || 'HR Department'
      },
      to: [{ email: recipientEmail, name: employee.full_name }],
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>'),
      attachments: [{
        filename: `Payslip-${employee.full_name.replace(/\s+/g, '-')}-${formatMonth(payroll.period_start).replace(/\s+/g, '-')}.pdf`,
        content: pdfBase64,
        disposition: 'attachment'
      }]
    };

    const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailersendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('MailerSend error:', errorText);
      return Response.json({ 
        error: 'Failed to send email',
        details: errorText 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      message: 'Payslip sent successfully'
    });

  } catch (error) {
    console.error('Send payslip error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});