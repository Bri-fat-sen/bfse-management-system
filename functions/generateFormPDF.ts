import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formType, organisation } = await req.json();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    const orgName = organisation?.name || 'Organisation';
    const orgAddress = organisation?.address || '';
    const orgCity = organisation?.city || '';
    const orgPhone = organisation?.phone || '';
    const orgEmail = organisation?.email || '';
    const primaryColor = organisation?.primary_color || '#1EB053';
    const secondaryColor = organisation?.secondary_color || '#0072C6';

    // Parse colors
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

    // Sierra Leone Flag Stripe
    doc.setFillColor(30, 176, 83); // Green
    doc.rect(0, 0, pageWidth / 3, 6, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 6, 'F');
    doc.setFillColor(0, 114, 198); // Blue
    doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 6, 'F');

    // Header Background with gradient effect
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 6, pageWidth, 35, 'F');

    // Organisation Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(orgName, margin, 22);

    // Address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const addressText = [orgAddress, orgCity, organisation?.country || 'Sierra Leone'].filter(Boolean).join(', ');
    doc.text(addressText, margin, 30);

    // Date on right
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('en-GB'), pageWidth - margin, 22, { align: 'right' });
    if (orgPhone) {
      doc.text(orgPhone, pageWidth - margin, 30, { align: 'right' });
    }

    yPos = 50;

    // Form configurations
    const formConfigs = {
      expense_fuel: {
        title: 'Fuel Expense Form',
        icon: '⛽',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Vehicle Registration', width: 0.35 }, { label: 'Driver Name', width: 0.35 }] },
          { row: [{ label: 'Fuel Station', width: 0.5 }, { label: 'Current Mileage (km)', width: 0.5 }] }
        ],
        table: {
          title: 'Fuel Details',
          columns: ['Fuel Type', 'Litres', 'Price per Litre (Le)', 'Total (Le)'],
          rows: 2,
          hasTotal: true
        },
        extraFields: [
          { row: [{ label: 'Receipt Number', width: 0.5 }, { label: 'Notes', width: 0.5 }] }
        ]
      },
      expense_maintenance: {
        title: 'Maintenance Expense Form',
        icon: '🔧',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Vehicle Registration', width: 0.35 }, { label: 'Current Mileage', width: 0.35 }] }
        ],
        checkboxes: ['Oil Change', 'Tire Rotation', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Battery', 'Electrical', 'Other'],
        table: {
          title: 'Parts Replaced',
          columns: ['Part Name', 'Qty', 'Unit Cost (Le)', 'Total (Le)'],
          rows: 3,
          hasTotal: true
        },
        extraFields: [
          { row: [{ label: 'Vendor/Mechanic', width: 0.5 }, { label: 'Next Service Date', width: 0.5 }] }
        ]
      },
      expense_utilities: {
        title: 'Utilities Expense Form',
        icon: '⚡',
        fields: [
          { row: [{ label: 'Date', width: 0.5 }, { label: 'Bill Period', width: 0.5 }] }
        ],
        checkboxes: ['Electricity', 'Water', 'Internet', 'Phone', 'Generator Fuel'],
        table: {
          title: 'Utility Details',
          columns: ['Description', 'Meter Reading', 'Units', 'Amount (Le)'],
          rows: 2,
          hasTotal: true
        },
        extraFields: [
          { row: [{ label: 'Account Number', width: 0.5 }, { label: 'Receipt Number', width: 0.5 }] }
        ]
      },
      expense_supplies: {
        title: 'Supplies Expense Form',
        icon: '📦',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Supplier', width: 0.35 }, { label: 'Invoice No.', width: 0.35 }] }
        ],
        table: {
          title: 'Items Purchased',
          columns: ['Item Description', 'Qty', 'Unit Price (Le)', 'Total (Le)'],
          rows: 4,
          hasTotal: true
        }
      },
      expense_general: {
        title: 'General Expense Form',
        icon: '📋',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Invoice No.', width: 0.35 }, { label: 'Vendor', width: 0.35 }] }
        ],
        table: {
          title: 'Expense Details',
          columns: ['Description', 'Qty', 'Unit Price (Le)', 'Total (Le)'],
          rows: 3,
          hasTotal: true
        },
        checkboxes: ['Cash', 'Bank Transfer', 'Mobile Money']
      },
      revenue_retail_sales: {
        title: 'Retail Sales Form',
        icon: '🛒',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Receipt No.', width: 0.35 }, { label: 'Sales Person', width: 0.35 }] },
          { row: [{ label: 'Customer Name', width: 0.5 }, { label: 'Customer Phone', width: 0.5 }] }
        ],
        table: {
          title: 'Items Sold',
          columns: ['Product', 'Qty', 'Unit Price (Le)', 'Total (Le)'],
          rows: 4,
          hasTotal: true
        },
        checkboxes: ['Cash', 'Mobile Money', 'Card', 'Credit']
      }
    };

    // Get form config or use general
    const config = formConfigs[formType] || formConfigs.expense_general;

    // Form Title Bar - compact
    doc.setFillColor(248, 250, 252);
    doc.rect(0, yPos - 5, pageWidth, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(0, yPos + 7, pageWidth, yPos + 7);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, margin, yPos + 3);

    yPos += 14;

    // Helper function to draw field - compact version
    const drawField = (label, x, width, height = 10) => {
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text(label.toUpperCase(), x, yPos);
      
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yPos + 2, width - 4, height, 2, 2, 'FD');
    };

    // Draw fields - more compact spacing
    if (config.fields) {
      config.fields.forEach(fieldRow => {
        let xPos = margin;
        const availableWidth = pageWidth - (margin * 2);
        
        fieldRow.row.forEach(field => {
          const fieldWidth = availableWidth * field.width;
          drawField(field.label, xPos, fieldWidth);
          xPos += fieldWidth;
        });
        yPos += 18;
      });
    }

    // Draw checkboxes - compact single row
    if (config.checkboxes) {
      yPos += 3;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F');
      
      let xPos = margin + 4;
      config.checkboxes.forEach((checkbox, i) => {
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.rect(xPos, yPos + 3.5, 4, 4, 'FD');
        
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(checkbox, xPos + 5.5, yPos + 7);
        
        xPos += doc.getTextWidth(checkbox) + 12;
        if (xPos > pageWidth - margin - 25 && i < config.checkboxes.length - 1) {
          xPos = margin + 4;
          yPos += 8;
        }
      });
      yPos += 15;
    }

    // Helper to draw a table - compact version
    const drawTable = (tableConfig, startY) => {
      let y = startY + 3;
      const tableWidth = pageWidth - (margin * 2);
      const colCount = tableConfig.columns.length;
      const colWidth = tableWidth / colCount;
      const rowHeight = 8;
      
      // Section title - compact
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, tableWidth, 8, 1, 1, 'F');
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(margin, y, 2, 8, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(tableConfig.title, margin + 6, y + 5.5);
      y += 10;

      // Table header - compact
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(margin, y, tableWidth, 7, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      
      tableConfig.columns.forEach((col, i) => {
        doc.text(col.toUpperCase(), margin + (i * colWidth) + 2, y + 5);
      });
      y += 7;

      // Table rows - compact
      for (let i = 0; i < tableConfig.rows; i++) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, tableWidth, rowHeight, 'FD');
        
        // Column dividers
        for (let j = 1; j < colCount; j++) {
          doc.line(margin + (j * colWidth), y, margin + (j * colWidth), y + rowHeight);
        }
        
        // Prefill first column if specified
        if (tableConfig.prefillRows && tableConfig.prefillRows[i]) {
          doc.setFontSize(7);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          doc.text(tableConfig.prefillRows[i], margin + 2, y + 5.5);
        }
        y += rowHeight;
      }

      // Labour row for maintenance forms
      if (tableConfig.labourRow) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, tableWidth, rowHeight, 'FD');
        for (let j = 1; j < colCount; j++) {
          doc.line(margin + (j * colWidth), y, margin + (j * colWidth), y + rowHeight);
        }
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text('Labour Cost', margin + 2, y + 5.5);
        y += rowHeight;
      }

      // Discount row for sales forms
      if (tableConfig.discountRow) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, tableWidth, rowHeight, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text('Discount', margin + 2, y + 5.5);
        y += rowHeight;
      }

      // Total row - compact
      if (tableConfig.hasTotal) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, tableWidth, rowHeight, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, y, margin + tableWidth, y);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(tableConfig.totalLabel || 'TOTAL AMOUNT', margin + 3, y + 5.5);
        
        // Last column for total value
        doc.setFillColor(255, 255, 255);
        doc.rect(margin + ((colCount - 1) * colWidth) + 1, y + 1, colWidth - 2, rowHeight - 2, 'F');
        y += rowHeight;
      }
      
      return y;
    };

    // Draw main table
    if (config.table) {
      yPos = drawTable(config.table, yPos);
    }

    // Draw second table if exists (for trip forms)
    if (config.table2) {
      yPos = drawTable(config.table2, yPos + 5);
    }

    // Extra fields after table - compact
    if (config.extraFields) {
      yPos += 6;
      config.extraFields.forEach(fieldRow => {
        let xPos = margin;
        const availableWidth = pageWidth - (margin * 2);
        
        fieldRow.row.forEach(field => {
          const fieldWidth = availableWidth * field.width;
          drawField(field.label, xPos, fieldWidth);
          xPos += fieldWidth;
        });
        yPos += 18;
      });
    }

    // Footer height
    const footerHeight = 18;
    const footerY = pageHeight - footerHeight;
    
    // Calculate max content area (leave space for signature + footer)
    const signatureHeight = 35;
    const maxContentY = footerY - signatureHeight;
    
    // If content exceeds page, we need to constrain - but signature always fits
    const signatureY = Math.min(yPos + 10, maxContentY);
    const sigWidth = (pageWidth - (margin * 2) - 15) / 2;
    
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, signatureY + 20, margin + sigWidth, signatureY + 20);
    doc.line(margin + sigWidth + 15, signatureY + 20, pageWidth - margin, signatureY + 20);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared By (Name & Signature)', margin + (sigWidth / 2), signatureY + 26, { align: 'center' });
    doc.text('Approved By (Name & Signature)', margin + sigWidth + 15 + (sigWidth / 2), signatureY + 26, { align: 'center' });

    // Footer - compact
    doc.setFillColor(navy.r, navy.g, navy.b);
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');

    // Footer flag stripe - compact
    const barWidth = 14;
    const barHeight = 5;
    const barY = footerY + 6;
    const barStartX = (pageWidth - (barWidth * 3 + 4)) / 2;
    
    doc.setFillColor(30, 176, 83);
    doc.roundedRect(barStartX, barY, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(barStartX + barWidth + 2, barY, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(0, 114, 198);
    doc.roundedRect(barStartX + (barWidth * 2) + 4, barY, barWidth, barHeight, 1, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('For Manual Record Keeping', pageWidth / 2, footerY + 15, { align: 'center' });

    // Generate PDF
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${config.title.replace(/\s+/g, '_')}.pdf"`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});