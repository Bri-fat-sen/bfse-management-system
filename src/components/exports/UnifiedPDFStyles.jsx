// Unified PDF Styles - Receipt-inspired design for all documents
// Provides consistent branding across receipts, invoices, payslips, and reports

import { format } from "date-fns";

/**
 * Get unified PDF styles based on document type
 * @param {Object} organisation - Organisation data with colors, logo, etc.
 * @param {string} documentType - 'receipt' | 'invoice' | 'payslip' | 'report'
 */
export const getUnifiedPDFStyles = (organisation, documentType = 'receipt') => {
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  const navyColor = '#0F1F3C';
  
  // Size configurations based on document type
  const sizes = {
    receipt: { maxWidth: '320px', padding: '16px', fontSize: '12px' },
    invoice: { maxWidth: '800px', padding: '32px', fontSize: '14px' },
    payslip: { maxWidth: '800px', padding: '32px', fontSize: '13px' },
    report: { maxWidth: '210mm', padding: '32px', fontSize: '14px' }
  };
  
  const config = sizes[documentType] || sizes.report;

  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --navy: ${navyColor};
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
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --info: #3b82f6;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--gray-50);
      color: var(--gray-800);
      line-height: 1.6;
      font-size: ${config.fontSize};
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 20px;
    }
    
    .document {
      max-width: ${config.maxWidth};
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
    
    /* Flag Stripe - Sierra Leone inspired */
    .flag-stripe {
      height: 6px;
      display: flex;
    }
    .flag-stripe .primary { flex: 1; background: var(--primary) !important; }
    .flag-stripe .white { flex: 1; background: white !important; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .flag-stripe .secondary { flex: 1; background: var(--secondary) !important; }
    
    /* Header - Gradient style */
    .header {
      background: linear-gradient(135deg, var(--navy) 0%, var(--gray-800) 100%) !important;
      color: white !important;
      padding: 24px ${config.padding};
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.08;
      background-image: 
        radial-gradient(circle at 20% 80%, var(--primary) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, var(--secondary) 0%, transparent 50%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .logo {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      padding: 4px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .company-info h1 {
      font-size: ${documentType === 'receipt' ? '16px' : '20px'};
      font-weight: 700;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    
    .company-info .address {
      font-size: 11px;
      opacity: 0.8;
      max-width: 200px;
    }
    
    .doc-badge {
      text-align: right;
    }
    
    .doc-badge .type {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
      margin-bottom: 4px;
    }
    
    .doc-badge .number {
      font-size: ${documentType === 'receipt' ? '14px' : '16px'};
      font-weight: 700;
    }
    
    .doc-badge .date {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
    }
    
    /* Info Bar */
    .info-bar {
      background: var(--gray-50);
      padding: 12px ${config.padding};
      border-bottom: 1px solid var(--gray-200);
      font-size: 12px;
      color: var(--gray-600);
    }
    
    /* Content Area */
    .content {
      padding: ${config.padding};
    }
    
    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(${documentType === 'receipt' ? '100px' : '140px'}, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: var(--gray-50);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      border: 1px solid var(--gray-100);
    }
    
    .summary-card .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--gray-500);
      margin-bottom: 4px;
    }
    
    .summary-card .value {
      font-size: ${documentType === 'receipt' ? '16px' : '20px'};
      font-weight: 700;
      color: var(--gray-800);
    }
    
    .summary-card .subtext {
      font-size: 10px;
      color: var(--gray-400);
      margin-top: 2px;
    }
    
    .summary-card.highlight-green { border-left: 3px solid var(--success); background: #ecfdf5; }
    .summary-card.highlight-red { border-left: 3px solid var(--danger); background: #fef2f2; }
    .summary-card.highlight-blue { border-left: 3px solid var(--info); background: #eff6ff; }
    .summary-card.highlight-gold { border-left: 3px solid #d4af37; background: #fefce8; }
    
    /* Section Title */
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--gray-700);
      margin: 20px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary);
    }
    
    .section-title .icon {
      font-size: 14px;
    }
    
    /* Data Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${documentType === 'receipt' ? '11px' : '13px'};
      margin-bottom: 16px;
    }
    
    .data-table thead {
      background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
      color: white !important;
    }
    
    .data-table th {
      padding: ${documentType === 'receipt' ? '8px 6px' : '12px 16px'};
      text-align: left;
      font-weight: 600;
      font-size: ${documentType === 'receipt' ? '10px' : '11px'};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table th.amount { text-align: right; }
    
    .data-table td {
      padding: ${documentType === 'receipt' ? '8px 6px' : '12px 16px'};
      border-bottom: 1px solid var(--gray-100);
    }
    
    .data-table td.amount {
      text-align: right;
      font-weight: 600;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }
    
    .data-table tbody tr:hover {
      background: var(--gray-50);
    }
    
    .data-table .total-row {
      background: var(--gray-100) !important;
      font-weight: 700;
    }
    
    .data-table .total-row td {
      border-top: 2px solid var(--gray-300);
    }
    
    /* Breakdown Grid */
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: var(--gray-50);
      border-radius: 8px;
      border: 1px solid var(--gray-100);
    }
    
    .breakdown-item .label {
      font-size: 11px;
      color: var(--gray-600);
      text-transform: capitalize;
    }
    
    .breakdown-item .value {
      font-size: 12px;
      font-weight: 600;
      color: var(--gray-800);
    }
    
    /* Parties Grid (for invoices) */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      padding: 16px;
      background: var(--gray-50);
      border-radius: 10px;
    }
    
    .party h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--gray-400);
      margin-bottom: 8px;
    }
    
    .party p {
      font-size: 13px;
      color: var(--gray-700);
      line-height: 1.5;
    }
    
    /* Badges */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge.success { background: #dcfce7; color: #166534; }
    .badge.warning { background: #fef3c7; color: #92400e; }
    .badge.danger { background: #fee2e2; color: #991b1b; }
    .badge.info { background: #dbeafe; color: #1e40af; }
    
    /* Note Box */
    .note-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
    }
    
    .note-box h4 {
      font-size: 11px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 4px;
    }
    
    .note-box p {
      font-size: 12px;
      color: #a16207;
      line-height: 1.5;
    }
    
    /* Net Pay Box (for payslips) */
    .net-pay-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 20px 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 14px;
      color: white;
      box-shadow: 0 8px 24px rgba(30, 176, 83, 0.3);
    }
    
    .net-pay-box .label {
      font-size: 14px;
      font-weight: 600;
    }
    
    .net-pay-box .amount {
      font-size: 24px;
      font-weight: 800;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }
    
    /* Totals Box (for receipts/invoices) */
    .totals-box {
      background: var(--gray-50);
      border-radius: 10px;
      overflow: hidden;
      margin-top: 16px;
    }
    
    .totals-box .row {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 13px;
    }
    
    .totals-box .row:not(:last-child) {
      border-bottom: 1px dashed var(--gray-200);
    }
    
    .totals-box .row.grand {
      background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
      color: white !important;
      font-weight: 700;
      font-size: 16px;
    }
    
    /* Footer */
    .footer {
      background: var(--navy) !important;
      color: white !important;
      padding: 20px ${config.padding};
      text-align: center;
    }
    
    .footer .thanks {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .footer .tagline {
      font-size: 11px;
      opacity: 0.8;
    }
    
    .footer .flag {
      font-size: 20px;
      margin: 10px 0;
    }
    
    .footer .contact {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.2);
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
      
      .document {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
    }
    
    @page {
      margin: 10mm;
      size: ${documentType === 'receipt' ? '80mm auto' : 'A4 portrait'};
    }
  `;
};

/**
 * Generate unified header HTML
 */
export const getUnifiedHeader = (organisation, docType, docNumber, date, documentType = 'receipt') => {
  const org = organisation || {};
  const orgName = org.name || 'Business';
  const orgInitials = orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  
  return `
    <div class="flag-stripe">
      <div class="primary"></div>
      <div class="white"></div>
      <div class="secondary"></div>
    </div>
    <div class="header">
      <div class="header-content">
        <div class="brand">
          <div class="logo">
            ${org.logo_url 
              ? `<img src="${org.logo_url}" alt="${orgName}" />` 
              : `<span class="logo-text">${orgInitials}</span>`
            }
          </div>
          <div class="company-info">
            <h1>${orgName}</h1>
            <div class="address">
              ${org.address || ''}${org.city ? `, ${org.city}` : ''}
              ${org.phone ? ` • ${org.phone}` : ''}
            </div>
          </div>
        </div>
        <div class="doc-badge">
          <div class="type">${docType}</div>
          <div class="number">${docNumber}</div>
          <div class="date">${date}</div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate unified footer HTML
 */
export const getUnifiedFooter = (organisation) => {
  const org = organisation || {};
  
  return `
    <div class="footer">
      <div class="thanks">Thank you for your business!</div>
      <div class="tagline">Proudly serving ${org.city || 'Sierra Leone'}</div>
      <div class="flag">🇸🇱</div>
      <div class="contact">
        ${org.name || ''} ${org.phone ? `• ${org.phone}` : ''} ${org.email ? `• ${org.email}` : ''}
      </div>
    </div>
  `;
};

/**
 * Generate complete unified PDF document
 */
export const generateUnifiedPDF = ({
  documentType = 'report',
  title,
  docNumber,
  date,
  organisation,
  summaryCards = [],
  sections = [],
  infoBar = null,
  footer = true
}) => {
  const generatedDate = date || format(new Date(), 'dd MMM yyyy, h:mm a');
  const reportId = docNumber || `DOC-${Date.now().toString(36).toUpperCase()}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${organisation?.name || 'Document'}</title>
        <style>${getUnifiedPDFStyles(organisation, documentType)}</style>
      </head>
      <body>
        <div class="document">
          ${getUnifiedHeader(organisation, title, reportId, generatedDate, documentType)}
          
          ${infoBar ? `
            <div class="info-bar">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                ${infoBar}
              </div>
            </div>
          ` : ''}
          
          <div class="content">
            ${summaryCards.length > 0 ? `
              <div class="summary-cards">
                ${summaryCards.map(card => `
                  <div class="summary-card ${card.highlight ? `highlight-${card.highlight}` : ''}">
                    <div class="label">${card.label}</div>
                    <div class="value">${card.value}</div>
                    ${card.subtext ? `<div class="subtext">${card.subtext}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.map(section => {
              let html = '';
              
              if (section.title) {
                html += `<div class="section-title"><div class="icon">${section.icon || '📋'}</div>${section.title}</div>`;
              }
              
              if (section.breakdown) {
                html += `<div class="breakdown-grid">${Object.entries(section.breakdown).map(([k, v]) => `
                  <div class="breakdown-item">
                    <span class="label">${k}</span>
                    <span class="value">${typeof v === 'number' ? `SLE ${v.toLocaleString()}` : v}</span>
                  </div>
                `).join('')}</div>`;
              }
              
              if (section.table) {
                html += `
                  <table class="data-table">
                    <thead><tr>${section.table.columns.map((c, i) => `<th class="${i === section.table.columns.length - 1 ? 'amount' : ''}">${c}</th>`).join('')}</tr></thead>
                    <tbody>${section.table.rows.map(row => `<tr>${row.map((cell, i) => `<td class="${i === row.length - 1 ? 'amount' : ''}">${cell ?? '-'}</td>`).join('')}</tr>`).join('')}</tbody>
                  </table>
                `;
              }
              
              if (section.note) {
                html += `<div class="note-box"><h4>${section.note.title || 'Note'}</h4><p>${section.note.content}</p></div>`;
              }
              
              if (section.html) {
                html += section.html;
              }
              
              return html;
            }).join('')}
          </div>
          
          ${footer ? getUnifiedFooter(organisation) : ''}
        </div>
      </body>
    </html>
  `;
};

/**
 * Print unified PDF
 */
export const printUnifiedPDF = (html) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to print this document');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 400);
};

/**
 * Download unified PDF as HTML file
 */
export const downloadUnifiedPDF = (html, filename = 'document') => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  getStyles: getUnifiedPDFStyles,
  getHeader: getUnifiedHeader,
  getFooter: getUnifiedFooter,
  generate: generateUnifiedPDF,
  print: printUnifiedPDF,
  download: downloadUnifiedPDF
};