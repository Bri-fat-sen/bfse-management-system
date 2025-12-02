import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

const FORM_CONFIGS = {
  expense_fuel: { title: 'Fuel Expense Form', icon: '⛽', fields: ['Date', 'Vehicle Registration', 'Driver Name', 'Fuel Station', 'Current Mileage (km)'], tableHeaders: ['Fuel Type', 'Litres', 'Price/Litre (Le)', 'Total (Le)'] },
  expense_maintenance: { title: 'Maintenance Expense Form', icon: '🔧', fields: ['Date', 'Vehicle Registration', 'Current Mileage', 'Vendor/Mechanic'], tableHeaders: ['Part Name', 'Qty', 'Unit Cost (Le)', 'Total (Le)'] },
  expense_utilities: { title: 'Utilities Expense Form', icon: '⚡', fields: ['Date', 'Bill Period', 'Account Number', 'Receipt Number'], tableHeaders: ['Description', 'Meter Reading', 'Units', 'Amount (Le)'] },
  expense_supplies: { title: 'Supplies Expense Form', icon: '📦', fields: ['Date', 'Supplier', 'Invoice No.'], tableHeaders: ['Item Description', 'Qty', 'Unit Price (Le)', 'Total (Le)'] },
  expense_rent: { title: 'Rent Expense Form', icon: '🏢', fields: ['Date Paid', 'Rent Period', 'Landlord Name', 'Receipt Number'], tableHeaders: ['Property/Location', 'Address', 'Monthly Rent (Le)'] },
  expense_salaries: { title: 'Salary/Wages Form', icon: '👥', fields: ['Pay Period', 'Payment Date'], tableHeaders: ['Employee', 'Position', 'Days', 'Basic (Le)', 'Net Pay (Le)'] },
  expense_transport: { title: 'Transport Expense Form', icon: '🚌', fields: ['Date', 'Employee Name'], tableHeaders: ['From', 'To', 'Purpose', 'Amount (Le)'] },
  expense_marketing: { title: 'Marketing Expense Form', icon: '📢', fields: ['Date', 'Campaign Name'], tableHeaders: ['Description', 'Vendor', 'Amount (Le)'] },
  expense_insurance: { title: 'Insurance Expense Form', icon: '🛡', fields: ['Date Paid', 'Policy Number', 'Insurance Company', 'Expiry Date'], tableHeaders: ['Item Insured', 'Coverage Period', 'Premium (Le)'] },
  expense_petty_cash: { title: 'Petty Cash Form', icon: '💰', fields: ['Date', 'Requested By', 'Opening Balance (Le)', 'Closing Balance (Le)'], tableHeaders: ['Date', 'Description', 'Amount (Le)', 'Receipt #'] },
  expense_truck_contract: { title: 'Truck Contract Expense Form', icon: '🚛', fields: ['Contract Number', 'Date', 'Vehicle', 'Driver'], tableHeaders: ['Category', 'Description', 'Amount (Le)'] },
  expense_general: { title: 'General Expense Form', icon: '📋', fields: ['Date', 'Invoice No.', 'Vendor'], tableHeaders: ['Description', 'Qty', 'Unit Price (Le)', 'Total (Le)'] },
  revenue_retail_sales: { title: 'Retail Sales Form', icon: '🛒', fields: ['Date', 'Receipt No.', 'Sales Person', 'Customer Name', 'Customer Phone'], tableHeaders: ['Product', 'Qty', 'Unit Price (Le)', 'Total (Le)'] },
  revenue_warehouse_sales: { title: 'Warehouse/Wholesale Sales Form', icon: '📦', fields: ['Date', 'Invoice No.', 'Customer/Business', 'Delivery Address'], tableHeaders: ['Product', 'SKU', 'Qty', 'Price (Le)', 'Total (Le)'] },
  revenue_vehicle_sales: { title: 'Vehicle Sales Form', icon: '🚐', fields: ['Date', 'Vehicle', 'Driver', 'Route/Location', 'Customer'], tableHeaders: ['Product', 'Qty', 'Unit Price (Le)', 'Total (Le)'] },
  revenue_trip: { title: 'Trip Revenue Form', icon: '🗺', fields: ['Date', 'Trip No.', 'Vehicle', 'Driver', 'Route'], tableHeaders: ['Description', 'Amount (Le)'] },
  revenue_truck_contract: { title: 'Truck Contract Revenue Form', icon: '🚛', fields: ['Contract No.', 'Date', 'Client', 'Vehicle', 'Driver', 'Pickup Location', 'Delivery Location'], tableHeaders: ['Description', 'Amount (Le)'] },
  revenue_other: { title: 'Other Income Form', icon: '💵', fields: ['Date', 'Reference No.', 'Received From'], tableHeaders: ['Description', 'Amount (Le)'] }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { formType, organisation } = await req.json();
    
    if (!formType || !FORM_CONFIGS[formType]) {
      return new Response(JSON.stringify({ error: 'Invalid form type' }), { status: 400 });
    }

    const config = FORM_CONFIGS[formType];
    const orgName = organisation?.name || 'Organisation';
    const orgAddress = organisation?.address || '';
    const orgCity = organisation?.city || '';
    const orgPhone = organisation?.phone || '';
    const orgEmail = organisation?.email || '';
    const today = new Date().toLocaleDateString('en-GB');

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 10;

    // Sierra Leone Flag Stripe
    doc.setFillColor(30, 176, 83); // Green
    doc.rect(0, 0, pageWidth / 3, 5, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 5, 'F');
    doc.setFillColor(0, 114, 198); // Blue
    doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 5, 'F');

    // Header Background
    doc.setFillColor(15, 31, 60); // Navy
    doc.rect(0, 5, pageWidth, 30, 'F');

    // Organisation Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(orgName, margin, 20);

    // Address
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const addressLine = [orgAddress, orgCity, 'Sierra Leone'].filter(Boolean).join(', ');
    doc.text(addressLine, margin, 27);

    // Date on right
    doc.setFontSize(10);
    doc.text(today, pageWidth - margin, 20, { align: 'right' });
    doc.setFontSize(8);
    doc.text('DATA ENTRY FORM', pageWidth - margin, 27, { align: 'right' });

    y = 45;

    // Form Title
    doc.setTextColor(15, 31, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, margin, y);
    y += 12;

    // Input Fields
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    const fieldWidth = (pageWidth - margin * 2 - 10) / 2;
    let fieldX = margin;
    let fieldY = y;
    let fieldCount = 0;

    config.fields.forEach((field, index) => {
      // Label
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(field.toUpperCase(), fieldX, fieldY);
      
      // Input box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(fieldX, fieldY + 2, fieldWidth, 8);

      fieldCount++;
      if (fieldCount % 2 === 0) {
        fieldX = margin;
        fieldY += 18;
      } else {
        fieldX = margin + fieldWidth + 10;
      }
    });

    if (fieldCount % 2 !== 0) {
      fieldY += 18;
    }
    y = fieldY + 5;

    // Table Section
    doc.setFillColor(30, 176, 83);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    const colCount = config.tableHeaders.length;
    const colWidth = (pageWidth - margin * 2) / colCount;
    
    config.tableHeaders.forEach((header, i) => {
      doc.text(header, margin + (i * colWidth) + 3, y + 5.5);
    });

    y += 8;

    // Table rows
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    const rowHeight = 10;
    const numRows = 5;

    for (let row = 0; row < numRows; row++) {
      doc.setDrawColor(220, 220, 220);
      for (let col = 0; col < colCount; col++) {
        doc.rect(margin + (col * colWidth), y, colWidth, rowHeight);
      }
      y += rowHeight;
    }

    // Total Row
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 31, 60);
    doc.text('TOTAL', margin + 3, y + 6.5);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight);
    y += rowHeight + 15;

    // Signature Section
    const sigWidth = (pageWidth - margin * 2 - 20) / 2;
    
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 20, margin + sigWidth, y + 20);
    doc.line(margin + sigWidth + 20, y + 20, pageWidth - margin, y + 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared By (Name & Signature)', margin, y + 27);
    doc.text('Approved By (Name & Signature)', margin + sigWidth + 20, y + 27);

    // Footer
    const footerY = 275;
    doc.setFillColor(15, 31, 60);
    doc.rect(0, footerY, pageWidth, 22, 'F');

    // Footer flag stripe
    const stripeWidth = 20;
    const stripeHeight = 4;
    const stripeX = (pageWidth - stripeWidth * 3) / 2;
    doc.setFillColor(30, 176, 83);
    doc.rect(stripeX, footerY + 8, stripeWidth, stripeHeight, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(stripeX + stripeWidth, footerY + 8, stripeWidth, stripeHeight, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect(stripeX + stripeWidth * 2, footerY + 8, stripeWidth, stripeHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const contactLine = [orgName, orgPhone, orgEmail].filter(Boolean).join(' • ');
    doc.text(contactLine, pageWidth / 2, footerY + 18, { align: 'center' });

    // Generate PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    return new Response(JSON.stringify({ 
      pdf: pdfBase64,
      filename: `${config.title.replace(/\s+/g, '_')}.pdf`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});