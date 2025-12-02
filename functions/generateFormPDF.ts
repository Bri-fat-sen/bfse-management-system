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

    // Form configurations - all form types
    const formConfigs = {
      // EXPENSE FORMS
      expense_fuel: {
        title: 'Fuel Expense Form',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Vehicle Registration', width: 0.35 }, { label: 'Driver Name', width: 0.35 }] },
          { row: [{ label: 'Fuel Station', width: 0.5 }, { label: 'Current Mileage (km)', width: 0.5 }] }
        ],
        checkboxes: ['Petrol', 'Diesel'],
        table: { title: 'Fuel Details', columns: ['Fuel Type', 'Litres', 'Price/L (Le)', 'Total (Le)'], rows: 1, hasTotal: true },
        extraFields: [{ row: [{ label: 'Receipt Number', width: 0.5 }, { label: 'Notes', width: 0.5 }] }]
      },
      expense_maintenance: {
        title: 'Maintenance Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.3 }, { label: 'Vehicle Registration', width: 0.35 }, { label: 'Current Mileage', width: 0.35 }] }],
        checkboxes: ['Oil Change', 'Tires', 'Brakes', 'Engine', 'Battery', 'Electrical', 'Other'],
        table: { title: 'Parts Replaced', columns: ['Part Name', 'Qty', 'Cost (Le)', 'Total (Le)'], rows: 2, hasTotal: true, labourRow: true },
        extraFields: [{ row: [{ label: 'Vendor/Mechanic', width: 0.5 }, { label: 'Next Service Date', width: 0.5 }] }]
      },
      expense_utilities: {
        title: 'Utilities Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.5 }, { label: 'Bill Period', width: 0.5 }] }],
        checkboxes: ['Electricity', 'Water', 'Internet', 'Phone', 'Generator'],
        table: { title: 'Utility Details', columns: ['Description', 'Reading', 'Units', 'Amount (Le)'], rows: 1, hasTotal: true },
        extraFields: [{ row: [{ label: 'Account Number', width: 0.5 }, { label: 'Receipt Number', width: 0.5 }] }]
      },
      expense_supplies: {
        title: 'Supplies Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.3 }, { label: 'Supplier', width: 0.35 }, { label: 'Invoice No.', width: 0.35 }] }],
        table: { title: 'Items Purchased', columns: ['Item', 'Qty', 'Price (Le)', 'Total (Le)'], rows: 3, hasTotal: true }
      },
      expense_rent: {
        title: 'Rent Expense Form',
        fields: [{ row: [{ label: 'Date Paid', width: 0.5 }, { label: 'Rent Period', width: 0.5 }] }],
        checkboxes: ['Office', 'Warehouse', 'Shop', 'Parking'],
        table: { title: 'Property Details', columns: ['Property/Location', 'Address', 'Rent (Le)'], rows: 1, hasTotal: true },
        extraFields: [{ row: [{ label: 'Landlord Name', width: 0.5 }, { label: 'Receipt Number', width: 0.5 }] }]
      },
      expense_salaries: {
        title: 'Salary / Wages Form',
        fields: [{ row: [{ label: 'Pay Period', width: 0.5 }, { label: 'Payment Date', width: 0.5 }] }],
        table: { title: 'Employee Payments', columns: ['Employee', 'Position', 'Days', 'Basic', 'Allow.', 'Deduct.', 'Net Pay'], rows: 3, hasTotal: true }
      },
      expense_transport: {
        title: 'Transport Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.5 }, { label: 'Employee Name', width: 0.5 }] }],
        table: { title: 'Trip Details', columns: ['From', 'To', 'Purpose', 'Amount (Le)'], rows: 2, hasTotal: true }
      },
      expense_marketing: {
        title: 'Marketing Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.5 }, { label: 'Campaign Name', width: 0.5 }] }],
        checkboxes: ['Radio/TV', 'Print', 'Social Media', 'Event', 'Billboard'],
        table: { title: 'Marketing Details', columns: ['Description', 'Vendor', 'Amount (Le)'], rows: 1, hasTotal: true }
      },
      expense_insurance: {
        title: 'Insurance Expense Form',
        fields: [{ row: [{ label: 'Date Paid', width: 0.5 }, { label: 'Policy Number', width: 0.5 }] }],
        checkboxes: ['Vehicle', 'Property', 'Business', 'Cargo'],
        table: { title: 'Insurance Details', columns: ['Item Insured', 'Coverage Period', 'Premium (Le)'], rows: 1, hasTotal: true },
        extraFields: [{ row: [{ label: 'Insurance Company', width: 0.5 }, { label: 'Expiry Date', width: 0.5 }] }]
      },
      expense_petty_cash: {
        title: 'Petty Cash Form',
        fields: [
          { row: [{ label: 'Date', width: 0.5 }, { label: 'Requested By', width: 0.5 }] },
          { row: [{ label: 'Opening Balance (Le)', width: 0.5 }, { label: 'Closing Balance (Le)', width: 0.5 }] }
        ],
        table: { title: 'Expense Items', columns: ['Date', 'Description', 'Amount (Le)', 'Receipt #'], rows: 3, hasTotal: true }
      },
      expense_truck_contract: {
        title: 'Truck Contract Expense Form',
        fields: [
          { row: [{ label: 'Contract Number', width: 0.5 }, { label: 'Date', width: 0.5 }] },
          { row: [{ label: 'Vehicle', width: 0.5 }, { label: 'Driver', width: 0.5 }] }
        ],
        table: { title: 'Contract Expenses', columns: ['Category', 'Description', 'Amount (Le)'], rows: 5, hasTotal: true, prefillRows: ['Fuel', 'Tolls', 'Loading', 'Unloading', 'Food/Accommodation'] }
      },
      expense_general: {
        title: 'General Expense Form',
        fields: [{ row: [{ label: 'Date', width: 0.3 }, { label: 'Invoice No.', width: 0.35 }, { label: 'Vendor', width: 0.35 }] }],
        table: { title: 'Expense Details', columns: ['Description', 'Qty', 'Price (Le)', 'Total (Le)'], rows: 2, hasTotal: true },
        checkboxes: ['Cash', 'Bank Transfer', 'Mobile Money']
      },
      // REVENUE FORMS
      revenue_retail_sales: {
        title: 'Retail Sales Form',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Receipt No.', width: 0.35 }, { label: 'Sales Person', width: 0.35 }] },
          { row: [{ label: 'Customer Name', width: 0.5 }, { label: 'Customer Phone', width: 0.5 }] }
        ],
        table: { title: 'Items Sold', columns: ['Product', 'Qty', 'Price (Le)', 'Total (Le)'], rows: 3, hasTotal: true, discountRow: true },
        checkboxes: ['Cash', 'Mobile Money', 'Card', 'Credit']
      },
      revenue_warehouse_sales: {
        title: 'Warehouse/Wholesale Sales Form',
        fields: [
          { row: [{ label: 'Date', width: 0.5 }, { label: 'Invoice No.', width: 0.5 }] },
          { row: [{ label: 'Customer/Business', width: 0.5 }, { label: 'Delivery Address', width: 0.5 }] }
        ],
        table: { title: 'Items Sold', columns: ['Product', 'SKU', 'Qty', 'W/Sale Price', 'Total (Le)'], rows: 2, hasTotal: true, discountRow: true }
      },
      revenue_vehicle_sales: {
        title: 'Vehicle Sales Form',
        fields: [
          { row: [{ label: 'Date', width: 0.3 }, { label: 'Vehicle', width: 0.35 }, { label: 'Driver', width: 0.35 }] },
          { row: [{ label: 'Route/Location', width: 0.5 }, { label: 'Customer', width: 0.5 }] }
        ],
        table: { title: 'Items Sold', columns: ['Product', 'Qty', 'Price (Le)', 'Total (Le)'], rows: 2, hasTotal: true }
      },
      revenue_trip: {
        title: 'Trip Revenue Form',
        fields: [
          { row: [{ label: 'Date', width: 0.5 }, { label: 'Trip No.', width: 0.5 }] },
          { row: [{ label: 'Vehicle', width: 0.33 }, { label: 'Driver', width: 0.33 }, { label: 'Route', width: 0.34 }] }
        ],
        table: { title: 'Trip Revenue', columns: ['Description', 'Amount (Le)'], rows: 3, hasTotal: true, prefillRows: ['Number of Passengers', 'Ticket Price per Passenger', 'Total Ticket Revenue'] },
        table2: { title: 'Trip Expenses', columns: ['Expense Type', 'Amount (Le)'], rows: 2, hasTotal: true, totalLabel: 'NET REVENUE', prefillRows: ['Fuel Cost', 'Other Expenses'] }
      },
      revenue_truck_contract: {
        title: 'Truck Contract Revenue Form',
        fields: [
          { row: [{ label: 'Contract No.', width: 0.5 }, { label: 'Date', width: 0.5 }] },
          { row: [{ label: 'Client', width: 0.33 }, { label: 'Vehicle', width: 0.33 }, { label: 'Driver', width: 0.34 }] },
          { row: [{ label: 'Pickup Location', width: 0.5 }, { label: 'Delivery Location', width: 0.5 }] }
        ],
        table: { title: 'Contract Summary', columns: ['Description', 'Amount (Le)'], rows: 4, hasTotal: true, totalLabel: 'NET REVENUE', prefillRows: ['Contract Amount', 'Less: Fuel', 'Less: Tolls', 'Less: Other Expenses'] }
      },
      revenue_other: {
        title: 'Other Income Form',
        fields: [{ row: [{ label: 'Date', width: 0.5 }, { label: 'Reference No.', width: 0.5 }] }],
        checkboxes: ['Service Fee', 'Rental Income', 'Commission', 'Refund', 'Other'],
        table: { title: 'Income Details', columns: ['Description', 'Amount (Le)'], rows: 1, hasTotal: true },
        extraFields: [{ row: [{ label: 'Received From', width: 0.5 }, { label: 'Notes', width: 0.5 }] }]
      }
    };

    // Get form config or use general
    const config = formConfigs[formType] || formConfigs.expense_general;

    // Form Title Bar
    doc.setFillColor(248, 250, 252);
    doc.rect(0, yPos - 5, pageWidth, 15, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(0, yPos + 10, pageWidth, yPos + 10);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, margin, yPos + 5);

    yPos += 20;

    // Helper function to draw field
    const drawField = (label, x, width, height = 12) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text(label.toUpperCase(), x, yPos);
      
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yPos + 2, width - 5, height, 2, 2, 'FD');
    };

    // Draw fields
    if (config.fields) {
      config.fields.forEach(fieldRow => {
        let xPos = margin;
        const availableWidth = pageWidth - (margin * 2);
        
        fieldRow.row.forEach(field => {
          const fieldWidth = availableWidth * field.width;
          drawField(field.label, xPos, fieldWidth);
          xPos += fieldWidth;
        });
        yPos += 22;
      });
    }

    // Draw checkboxes
    if (config.checkboxes) {
      yPos += 5;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 15, 2, 2, 'F');
      
      let xPos = margin + 5;
      config.checkboxes.forEach((checkbox, i) => {
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.rect(xPos, yPos + 4, 5, 5, 'FD');
        
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(checkbox, xPos + 7, yPos + 8);
        
        xPos += doc.getTextWidth(checkbox) + 15;
        if (xPos > pageWidth - margin - 30 && i < config.checkboxes.length - 1) {
          xPos = margin + 5;
          yPos += 10;
        }
      });
      yPos += 20;
    }

    // Draw table
    if (config.table) {
      yPos += 5;
      
      // Section title
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 10, 2, 2, 'F');
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(margin, yPos, 3, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(config.table.title, margin + 8, yPos + 7);
      yPos += 15;

      // Table header
      const tableWidth = pageWidth - (margin * 2);
      const colWidth = tableWidth / config.table.columns.length;
      
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(margin, yPos, tableWidth, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      config.table.columns.forEach((col, i) => {
        doc.text(col.toUpperCase(), margin + (i * colWidth) + 3, yPos + 7);
      });
      yPos += 10;

      // Table rows
      for (let i = 0; i < config.table.rows; i++) {
        doc.setDrawColor(241, 245, 249);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, yPos, tableWidth, 12, 'FD');
        
        // Column dividers
        for (let j = 1; j < config.table.columns.length; j++) {
          doc.line(margin + (j * colWidth), yPos, margin + (j * colWidth), yPos + 12);
        }
        yPos += 12;
      }

      // Total row
      if (config.table.hasTotal) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos, tableWidth, 12, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, yPos, margin + tableWidth, yPos);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT', margin + 5, yPos + 8);
        
        // Last column border for total
        doc.setFillColor(255, 255, 255);
        doc.rect(margin + ((config.table.columns.length - 1) * colWidth), yPos + 1, colWidth - 1, 10, 'F');
        yPos += 12;
      }
    }

    // Extra fields after table
    if (config.extraFields) {
      yPos += 10;
      config.extraFields.forEach(fieldRow => {
        let xPos = margin;
        const availableWidth = pageWidth - (margin * 2);
        
        fieldRow.row.forEach(field => {
          const fieldWidth = availableWidth * field.width;
          drawField(field.label, xPos, fieldWidth);
          xPos += fieldWidth;
        });
        yPos += 22;
      });
    }

    // Signature section
    yPos += 20;
    const sigWidth = (pageWidth - (margin * 2) - 20) / 2;
    
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, yPos + 30, margin + sigWidth, yPos + 30);
    doc.line(margin + sigWidth + 20, yPos + 30, pageWidth - margin, yPos + 30);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared By (Name & Signature)', margin + (sigWidth / 2), yPos + 38, { align: 'center' });
    doc.text('Approved By (Name & Signature)', margin + sigWidth + 20 + (sigWidth / 2), yPos + 38, { align: 'center' });

    // Footer
    const footerY = pageHeight - 25;
    doc.setFillColor(navy.r, navy.g, navy.b);
    doc.rect(0, footerY, pageWidth, 25, 'F');

    // Footer flag stripe
    const barWidth = 20;
    const barHeight = 8;
    const barY = footerY + 8;
    const barStartX = (pageWidth - (barWidth * 3 + 4)) / 2;
    
    doc.setFillColor(30, 176, 83);
    doc.roundedRect(barStartX, barY, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(barStartX + barWidth + 2, barY, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(0, 114, 198);
    doc.roundedRect(barStartX + (barWidth * 2) + 4, barY, barWidth, barHeight, 1, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('For Manual Record Keeping', pageWidth / 2, footerY + 22, { align: 'center' });

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