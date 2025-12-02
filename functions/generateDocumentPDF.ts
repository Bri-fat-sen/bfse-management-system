import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentType, data, organisation } = await req.json();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    const orgName = organisation?.name || 'Organisation';
    const orgAddress = organisation?.address || '';
    const orgCity = organisation?.city || '';
    const orgCountry = organisation?.country || 'Sierra Leone';
    const orgPhone = organisation?.phone || '';
    const orgEmail = organisation?.email || '';
    const primaryColor = organisation?.primary_color || '#1EB053';
    const secondaryColor = organisation?.secondary_color || '#0072C6';

    // Parse colors helper
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 30, g: 176, b: 83 };
    };

    const primary = hexToRgb(primaryColor);
    const secondary = hexToRgb(secondaryColor);
    const navy = { r: 15, g: 31, b: 60 };

    // Draw Sierra Leone Flag Stripe - compact
    const drawFlagStripe = (y, height = 4) => {
      doc.setFillColor(30, 176, 83);
      doc.rect(0, y, pageWidth / 3, height, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth / 3, y, pageWidth / 3, height, 'F');
      doc.setFillColor(0, 114, 198);
      doc.rect((pageWidth / 3) * 2, y, pageWidth / 3, height, 'F');
    };

    // Draw Header - Receipt-style gradient design (compact for A4)
    const drawHeader = (title, docNumber, docDate) => {
      drawFlagStripe(0, 4);
      
      // Gradient header background
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 4, pageWidth, 26, 'F');
      
      // Organisation name - left
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(orgName, margin, 14);
      
      // Address - left
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const addressParts = [orgAddress, orgCity, orgCountry].filter(Boolean);
      doc.text(addressParts.join(', '), margin, 22);
      
      // Doc type and info - right
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), pageWidth - margin, 12, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(docNumber, pageWidth - margin, 19, { align: 'right' });
      doc.setFontSize(8);
      doc.text(docDate, pageWidth - margin, 26, { align: 'right' });
      
      return 34;
    };

    // Draw Footer - Receipt-style (compact for A4)
    const drawFooter = () => {
      const footerY = pageHeight - 16;
      doc.setFillColor(navy.r, navy.g, navy.b);
      doc.rect(0, footerY, pageWidth, 16, 'F');
      
      // Flag bar in footer
      const barWidth = 12;
      const barHeight = 4;
      const barY = footerY + 4;
      const barStartX = (pageWidth - (barWidth * 3 + 4)) / 2;
      
      doc.setFillColor(30, 176, 83);
      doc.roundedRect(barStartX, barY, barWidth, barHeight, 1, 1, 'F');
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(barStartX + barWidth + 2, barY, barWidth, barHeight, 1, 1, 'F');
      doc.setFillColor(0, 114, 198);
      doc.roundedRect(barStartX + (barWidth * 2) + 4, barY, barWidth, barHeight, 1, 1, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Thank You For Your Business', pageWidth / 2, footerY + 12, { align: 'center' });
    };

    // Format currency
    const formatCurrency = (amount) => {
      const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      return `SLE ${num.toLocaleString()}`;
    };

    let filename = 'document.pdf';

    // Generate based on document type
    switch (documentType) {
      case 'receipt': {
        const sale = data;
        filename = `Receipt-${sale?.sale_number || 'SALE'}.pdf`;
        
        yPos = drawHeader('Receipt', sale?.sale_number || 'RECEIPT', sale?.created_date ? new Date(sale.created_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'));
        
        // Info section
        doc.setFillColor(248, 250, 252);
        doc.rect(0, yPos, pageWidth, 18, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        let infoX = margin;
        if (sale?.employee_name) {
          doc.text(`Cashier: ${sale.employee_name}`, infoX, yPos + 8);
          infoX += 60;
        }
        if (sale?.customer_name) {
          doc.text(`Customer: ${sale.customer_name}`, infoX, yPos + 8);
          infoX += 60;
        }
        if (sale?.location) {
          doc.text(`Location: ${sale.location}`, infoX, yPos + 8);
        }
        yPos += 22;
        
        // Items table
        const items = sale?.items || [];
        const colWidths = [90, 25, 35, 30];
        
        // Header
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ITEM', margin + 3, yPos + 7);
        doc.text('QTY', margin + colWidths[0] + 3, yPos + 7);
        doc.text('PRICE', margin + colWidths[0] + colWidths[1] + 3, yPos + 7);
        doc.text('TOTAL', pageWidth - margin - 3, yPos + 7, { align: 'right' });
        yPos += 12;
        
        // Items
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        items.forEach((item, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPos - 2, pageWidth - (margin * 2), 10, 'F');
          }
          doc.text(item.product_name || 'Item', margin + 3, yPos + 4);
          doc.text(String(item.quantity || 1), margin + colWidths[0] + 3, yPos + 4);
          doc.text(formatCurrency(item.unit_price), margin + colWidths[0] + colWidths[1] + 3, yPos + 4);
          doc.text(formatCurrency(item.total), pageWidth - margin - 3, yPos + 4, { align: 'right' });
          yPos += 10;
        });
        
        yPos += 5;
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        
        // Totals
        doc.setFontSize(10);
        if (sale?.subtotal) {
          doc.text('Subtotal:', margin + 100, yPos);
          doc.text(formatCurrency(sale.subtotal), pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
        }
        if (sale?.tax && sale.tax > 0) {
          doc.text('Tax:', margin + 100, yPos);
          doc.text(formatCurrency(sale.tax), pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
        }
        if (sale?.discount && sale.discount > 0) {
          doc.text('Discount:', margin + 100, yPos);
          doc.text(`-${formatCurrency(sale.discount)}`, pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
        }
        
        // Grand Total
        yPos += 5;
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.roundedRect(margin + 80, yPos - 3, pageWidth - margin - 80 - margin, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL', margin + 90, yPos + 7);
        doc.text(formatCurrency(sale?.total_amount), pageWidth - margin - 5, yPos + 7, { align: 'right' });
        
        yPos += 20;
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment: ${(sale?.payment_method || 'cash').toUpperCase()}`, margin, yPos);
        
        drawFooter();
        break;
      }
      
      case 'invoice': {
        const invoice = data;
        filename = `Invoice-${invoice?.invoiceNumber || 'INV'}.pdf`;
        
        yPos = drawHeader('Invoice', invoice?.invoiceNumber || 'INVOICE', new Date().toLocaleDateString('en-GB'));
        
        // Bill To / Due Date section
        doc.setFillColor(248, 250, 252);
        doc.rect(0, yPos, pageWidth, 35, 'F');
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO', margin, yPos + 8);
        doc.text('PAYMENT TERMS', pageWidth / 2 + 10, yPos + 8);
        
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let billY = yPos + 15;
        if (invoice?.company_name) {
          doc.setFont('helvetica', 'bold');
          doc.text(invoice.company_name, margin, billY);
          billY += 6;
          doc.setFont('helvetica', 'normal');
        }
        if (invoice?.customer_name) {
          doc.text(invoice.customer_name, margin, billY);
          billY += 6;
        }
        if (invoice?.customer_phone) {
          doc.text(invoice.customer_phone, margin, billY);
        }
        
        // Due date
        doc.text(`Net ${invoice?.payment_terms || 30} days`, pageWidth / 2 + 10, yPos + 15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondary.r, secondary.g, secondary.b);
        doc.text(`Due: ${invoice?.dueDate || 'N/A'}`, pageWidth / 2 + 10, yPos + 24);
        
        yPos += 40;
        
        // Items table
        const items = invoice?.items || [];
        
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', margin + 3, yPos + 7);
        doc.text('QTY', margin + 85, yPos + 7);
        doc.text('UNIT PRICE', margin + 105, yPos + 7);
        doc.text('AMOUNT', pageWidth - margin - 3, yPos + 7, { align: 'right' });
        yPos += 12;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        items.forEach((item, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPos - 2, pageWidth - (margin * 2), 10, 'F');
          }
          doc.text(String(item.product_name || 'Item').substring(0, 40), margin + 3, yPos + 4);
          doc.text(String(item.quantity || 1), margin + 85, yPos + 4);
          doc.text(formatCurrency(item.unit_price), margin + 105, yPos + 4);
          doc.text(formatCurrency(item.total), pageWidth - margin - 3, yPos + 4, { align: 'right' });
          yPos += 10;
        });
        
        yPos += 10;
        
        // Totals box
        const totalsX = pageWidth - margin - 80;
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(totalsX - 5, yPos - 3, 85, 45, 2, 2, 'S');
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Subtotal', totalsX, yPos + 5);
        doc.setTextColor(51, 65, 85);
        doc.text(formatCurrency(invoice?.cartTotal), pageWidth - margin - 3, yPos + 5, { align: 'right' });
        
        if (invoice?.include_tax && invoice?.taxAmount > 0) {
          yPos += 10;
          doc.setTextColor(100, 116, 139);
          doc.text(`GST (${invoice?.tax_rate || 15}%)`, totalsX, yPos + 5);
          doc.setTextColor(51, 65, 85);
          doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin - 3, yPos + 5, { align: 'right' });
        }
        
        yPos += 15;
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.roundedRect(totalsX - 5, yPos, 85, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL DUE', totalsX, yPos + 8);
        doc.text(formatCurrency(invoice?.totalWithTax), pageWidth - margin - 3, yPos + 8, { align: 'right' });
        
        drawFooter();
        break;
      }
      
      case 'payslip': {
        const { payroll, employee } = data;
        filename = `Payslip-${employee?.full_name || 'Employee'}-${payroll?.period_start ? new Date(payroll.period_start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Period'}.pdf`;
        
        const periodLabel = payroll?.period_start ? new Date(payroll.period_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Pay Period';
        yPos = drawHeader('Payslip', periodLabel, payroll?.payment_date ? new Date(payroll.payment_date).toLocaleDateString('en-GB') : 'Pending');
        
        // Employee Info
        doc.setFillColor(248, 250, 252);
        doc.rect(0, yPos, pageWidth, 35, 'F');
        
        const infoCol1 = margin;
        const infoCol2 = pageWidth / 2 + 5;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text('EMPLOYEE DETAILS', infoCol1, yPos + 8);
        doc.text('PAY PERIOD', infoCol2, yPos + 8);
        
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Name: ${employee?.full_name || 'N/A'}`, infoCol1, yPos + 16);
        doc.text(`ID: ${employee?.employee_code || 'N/A'}`, infoCol1, yPos + 23);
        doc.text(`Dept: ${employee?.department || 'N/A'}`, infoCol1, yPos + 30);
        
        doc.text(`Start: ${payroll?.period_start ? new Date(payroll.period_start).toLocaleDateString('en-GB') : 'N/A'}`, infoCol2, yPos + 16);
        doc.text(`End: ${payroll?.period_end ? new Date(payroll.period_end).toLocaleDateString('en-GB') : 'N/A'}`, infoCol2, yPos + 23);
        doc.text(`Payment: ${(payroll?.payment_method || 'Bank Transfer').replace(/_/g, ' ')}`, infoCol2, yPos + 30);
        
        yPos += 40;
        
        // Earnings and Deductions side by side
        const colWidth = (pageWidth - (margin * 2) - 10) / 2;
        const leftCol = margin;
        const rightCol = margin + colWidth + 10;
        
        // Earnings Header
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(leftCol, yPos, colWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('EARNINGS', leftCol + 3, yPos + 6);
        
        // Deductions Header
        doc.setFillColor(220, 38, 38);
        doc.rect(rightCol, yPos, colWidth, 8, 'F');
        doc.text('DEDUCTIONS', rightCol + 3, yPos + 6);
        
        yPos += 12;
        let earningsY = yPos;
        let deductionsY = yPos;
        
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        // Earnings items
        const baseSalary = payroll?.base_salary || 0;
        const grossPay = payroll?.gross_pay || 0;
        
        doc.text('Base Salary', leftCol + 3, earningsY);
        doc.text(formatCurrency(baseSalary), leftCol + colWidth - 3, earningsY, { align: 'right' });
        earningsY += 8;
        
        if (payroll?.overtime_pay > 0) {
          doc.text('Overtime', leftCol + 3, earningsY);
          doc.text(formatCurrency(payroll.overtime_pay), leftCol + colWidth - 3, earningsY, { align: 'right' });
          earningsY += 8;
        }
        
        (payroll?.allowances || []).forEach(a => {
          doc.text(a.name, leftCol + 3, earningsY);
          doc.text(formatCurrency(a.amount), leftCol + colWidth - 3, earningsY, { align: 'right' });
          earningsY += 8;
        });
        
        (payroll?.bonuses || []).forEach(b => {
          doc.text(b.name, leftCol + 3, earningsY);
          doc.text(formatCurrency(b.amount), leftCol + colWidth - 3, earningsY, { align: 'right' });
          earningsY += 8;
        });
        
        // Deductions items
        const nassitEmployee = payroll?.nassit_employee || 0;
        const payeTax = payroll?.paye_tax || 0;
        const totalDeductions = payroll?.total_deductions || 0;
        
        if (nassitEmployee > 0) {
          doc.text('NASSIT (5%)', rightCol + 3, deductionsY);
          doc.text(formatCurrency(nassitEmployee), rightCol + colWidth - 3, deductionsY, { align: 'right' });
          deductionsY += 8;
        }
        
        if (payeTax > 0) {
          doc.text('PAYE Tax', rightCol + 3, deductionsY);
          doc.text(formatCurrency(payeTax), rightCol + colWidth - 3, deductionsY, { align: 'right' });
          deductionsY += 8;
        }
        
        (payroll?.deductions || []).filter(d => d.type !== 'statutory').forEach(d => {
          doc.text(d.name, rightCol + 3, deductionsY);
          doc.text(formatCurrency(d.amount), rightCol + colWidth - 3, deductionsY, { align: 'right' });
          deductionsY += 8;
        });
        
        // Subtotals
        const maxY = Math.max(earningsY, deductionsY) + 5;
        doc.setDrawColor(203, 213, 225);
        doc.line(leftCol, maxY, leftCol + colWidth, maxY);
        doc.line(rightCol, maxY, rightCol + colWidth, maxY);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Gross Pay', leftCol + 3, maxY + 8);
        doc.text(formatCurrency(grossPay), leftCol + colWidth - 3, maxY + 8, { align: 'right' });
        
        doc.text('Total Deductions', rightCol + 3, maxY + 8);
        doc.text(formatCurrency(totalDeductions), rightCol + colWidth - 3, maxY + 8, { align: 'right' });
        
        // Net Pay
        yPos = maxY + 20;
        const netPay = payroll?.net_pay || 0;
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 18, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('NET PAY', margin + 10, yPos + 12);
        doc.text(formatCurrency(netPay), pageWidth - margin - 10, yPos + 12, { align: 'right' });
        
        drawFooter();
        break;
      }
      
      case 'report': {
        const report = data;
        filename = `${(report?.title || 'Report').replace(/\s+/g, '_')}.pdf`;
        
        yPos = drawHeader(report?.title || 'Report', report?.reportId || `RPT-${Date.now().toString(36).toUpperCase()}`, report?.dateRange || new Date().toLocaleDateString('en-GB'));
        
        // Summary cards
        if (report?.summaryCards?.length > 0) {
          const cardWidth = (pageWidth - (margin * 2) - ((report.summaryCards.length - 1) * 5)) / Math.min(report.summaryCards.length, 4);
          let cardX = margin;
          
          report.summaryCards.forEach((card, i) => {
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(cardX, yPos, cardWidth, 25, 2, 2, 'F');
            
            // Highlight bar
            if (card.highlight === 'green') {
              doc.setFillColor(16, 185, 129);
            } else if (card.highlight === 'red') {
              doc.setFillColor(239, 68, 68);
            } else if (card.highlight === 'blue') {
              doc.setFillColor(59, 130, 246);
            } else {
              doc.setFillColor(primary.r, primary.g, primary.b);
            }
            doc.rect(cardX, yPos, 3, 25, 'F');
            
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text((card.label || '').toUpperCase(), cardX + 8, yPos + 8);
            
            doc.setFontSize(12);
            doc.setTextColor(51, 65, 85);
            doc.setFont('helvetica', 'bold');
            doc.text(String(card.value || '-'), cardX + 8, yPos + 18);
            
            cardX += cardWidth + 5;
          });
          
          yPos += 32;
        }
        
        // Sections with tables
        (report?.sections || []).forEach(section => {
          if (section.title) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
            doc.setFillColor(primary.r, primary.g, primary.b);
            doc.rect(margin, yPos, 3, 10, 'F');
            
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, margin + 8, yPos + 7);
            yPos += 15;
          }
          
          if (section.table) {
            const cols = section.table.columns || [];
            const rows = section.table.rows || [];
            const colWidth = (pageWidth - (margin * 2)) / cols.length;
            
            // Header
            doc.setFillColor(primary.r, primary.g, primary.b);
            doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            cols.forEach((col, i) => {
              doc.text(String(col).toUpperCase(), margin + (i * colWidth) + 3, yPos + 5);
            });
            yPos += 10;
            
            // Rows
            doc.setFont('helvetica', 'normal');
            rows.forEach((row, rowIdx) => {
              const cells = Array.isArray(row) ? row : Object.values(row);
              const isTotal = String(cells[0] || '').toLowerCase().includes('total');
              
              if (isTotal) {
                doc.setFillColor(241, 245, 249);
                doc.setFont('helvetica', 'bold');
              } else if (rowIdx % 2 === 0) {
                doc.setFillColor(248, 250, 252);
              } else {
                doc.setFillColor(255, 255, 255);
              }
              doc.rect(margin, yPos - 2, pageWidth - (margin * 2), 8, 'F');
              
              doc.setTextColor(51, 65, 85);
              doc.setFontSize(8);
              cells.forEach((cell, i) => {
                doc.text(String(cell ?? '-').substring(0, 25), margin + (i * colWidth) + 3, yPos + 3);
              });
              
              if (isTotal) doc.setFont('helvetica', 'normal');
              yPos += 8;
              
              if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
              }
            });
            
            yPos += 10;
          }
        });
        
        drawFooter();
        break;
      }
      
      default:
        return Response.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});