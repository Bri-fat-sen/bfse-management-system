// Unified PDF Styles - Matches receipt design but adapts for different document types
// Uses consistent branding with Sierra Leone theming

import { format } from "date-fns";

// Document size configurations
const DOCUMENT_SIZES = {
  receipt: { maxWidth: '420px', padding: '20px' },
  invoice: { maxWidth: '800px', padding: '40px' },
  payslip: { maxWidth: '800px', padding: '32px' },
  report: { maxWidth: '210mm', padding: '48px' },
  letter: { maxWidth: '210mm', padding: '40px' }
};

// Get base styles that match receipt design
export function getUnifiedPDFStyles(organisation, documentType = 'report') {
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  const navyColor = '#0F1F3C';
  const size = DOCUMENT_SIZES[documentType] || DOCUMENT_SIZES.report;
  
  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    
    body { 
      font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
      background: #f5f5f5;
      padding: 24px;
      color: #333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Document Container */
    .document {
      max-width: ${size.maxWidth};
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
    }
    
    /* Flag Stripe Accent */
    .flag-stripe {
      height: 6px;
      display: flex;
    }
    .flag-stripe .primary { flex: 1; background-color: ${primaryColor} !important; }
    .flag-stripe .white { flex: 1; background-color: #FFFFFF !important; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; }
    .flag-stripe .secondary { flex: 1; background-color: ${secondaryColor} !important; }
    
    /* Gradient Header - Receipt Style */
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
      color: white !important;
      padding: ${documentType === 'receipt' ? '20px' : '32px'} ${size.padding};
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.05;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      ${documentType === 'receipt' ? 'flex-direction: column; text-align: center;' : ''}
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      ${documentType === 'receipt' ? 'flex-direction: column;' : ''}
    }
    
    .logo-box {
      width: ${documentType === 'receipt' ? '50px' : '60px'};
      height: ${documentType === 'receipt' ? '50px' : '60px'};
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    
    .logo-box img {
      max-width: 85%;
      max-height: 85%;
      object-fit: contain;
    }
    
    .logo-box .initials {
      font-size: ${documentType === 'receipt' ? '18px' : '22px'};
      font-weight: 800;
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .company-info h1 {
      font-size: ${documentType === 'receipt' ? '18px' : '24px'};
      font-weight: 700;
      color: white !important;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    
    .company-info .tagline {
      font-size: ${documentType === 'receipt' ? '11px' : '13px'};
      opacity: 0.85;
    }
    
    .doc-info {
      text-align: right;
      ${documentType === 'receipt' ? 'text-align: center; margin-top: 12px;' : ''}
    }
    
    .doc-info .doc-type {
      font-size: ${documentType === 'receipt' ? '10px' : '11px'};
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.8;
    }
    
    .doc-info .doc-number {
      font-size: ${documentType === 'receipt' ? '14px' : '18px'};
      font-weight: 700;
      margin-top: 4px;
    }
    
    .doc-info .doc-date {
      font-size: ${documentType === 'receipt' ? '11px' : '12px'};
      opacity: 0.8;
      margin-top: 2px;
    }
    
    /* Info Bar */
    .info-bar {
      background: ${primaryColor}08 !important;
      border-bottom: 2px solid ${primaryColor};
      padding: 16px ${size.padding};
      font-size: 13px;
    }
    
    .info-bar p { margin: 4px 0; }
    .info-bar strong { color: ${primaryColor}; }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    
    .info-item {
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid ${primaryColor}20;
    }
    
    .info-item .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .info-item .value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    /* Content Section */
    .content {
      padding: ${size.padding};
    }
    
    /* Section Headers */
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 24px 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid ${primaryColor}20;
      color: ${navyColor};
      font-size: 14px;
      font-weight: 700;
    }
    
    .section-title .icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    
    /* Summary Cards Grid */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(${documentType === 'receipt' ? '100%' : '160px'}, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #eee;
      position: relative;
      overflow: hidden;
    }
    
    .summary-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor});
    }
    
    .summary-card:nth-child(2)::before { background: linear-gradient(90deg, ${secondaryColor}, #8b5cf6); }
    .summary-card:nth-child(3)::before { background: linear-gradient(90deg, #f59e0b, #ef4444); }
    .summary-card:nth-child(4)::before { background: linear-gradient(90deg, #8b5cf6, #ec4899); }
    
    .summary-card.highlight-green::before { background: ${primaryColor}; }
    .summary-card.highlight-red::before { background: #ef4444; }
    .summary-card.highlight-blue::before { background: ${secondaryColor}; }
    
    .summary-card .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      margin-bottom: 8px;
    }
    
    .summary-card .value {
      font-size: ${documentType === 'receipt' ? '22px' : '28px'};
      font-weight: 800;
      color: ${navyColor};
      letter-spacing: -0.5px;
    }
    
    .summary-card:first-child .value { color: ${primaryColor}; }
    .summary-card:nth-child(2) .value { color: ${secondaryColor}; }
    .summary-card:nth-child(3) .value { color: #f59e0b; }
    .summary-card.highlight-green .value { color: ${primaryColor}; }
    .summary-card.highlight-red .value { color: #ef4444; }
    
    .summary-card .subtext {
      font-size: 11px;
      color: #999;
      margin-top: 6px;
    }
    
    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #eee;
    }
    
    .data-table thead {
      background: ${primaryColor}10 !important;
    }
    
    .data-table th {
      padding: ${documentType === 'receipt' ? '10px 12px' : '14px 16px'};
      text-align: left;
      font-size: ${documentType === 'receipt' ? '10px' : '11px'};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${primaryColor} !important;
      font-weight: 700;
      border-bottom: 2px solid ${primaryColor};
    }
    
    .data-table th.amount { text-align: right; }
    
    .data-table td {
      padding: ${documentType === 'receipt' ? '10px 12px' : '14px 16px'};
      border-bottom: 1px solid #f0f0f0;
      font-size: ${documentType === 'receipt' ? '13px' : '14px'};
      color: #444;
    }
    
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #fafafa; }
    
    .data-table td.amount {
      text-align: right;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      font-weight: 600;
    }
    
    .data-table tr.total-row {
      background: ${navyColor} !important;
    }
    
    .data-table tr.total-row td {
      color: white !important;
      font-weight: 700;
      font-size: ${documentType === 'receipt' ? '14px' : '15px'};
      border: none;
    }
    
    /* Status Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .badge.success { background: #ecfdf5; color: #059669; }
    .badge.warning { background: #fffbeb; color: #d97706; }
    .badge.danger { background: #fef2f2; color: #dc2626; }
    .badge.info { background: #eff6ff; color: #3b82f6; }
    .badge.primary { background: ${primaryColor}; color: white; }
    .badge.primary::before { background: white; }
    
    /* Totals Section */
    .totals-section {
      background: ${secondaryColor}08 !important;
      padding: 20px ${size.padding};
      border-top: 3px solid ${secondaryColor};
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    
    .totals-row.grand {
      font-size: ${documentType === 'receipt' ? '20px' : '24px'};
      font-weight: 800;
      color: ${primaryColor} !important;
      padding-top: 16px;
      margin-top: 12px;
      border-top: 3px solid ${primaryColor};
    }
    
    .totals-row .amount {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }
    
    /* Net Pay Box (Payslip) */
    .net-pay-box {
      margin: 24px 0;
      padding: 24px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
      border-radius: 16px;
      color: white !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 24px;
      font-weight: 800;
      box-shadow: 0 8px 24px ${primaryColor}40;
    }
    
    .net-pay-box .label { display: flex; align-items: center; gap: 8px; }
    .net-pay-box .amount { font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; }
    
    /* Notes/Info Box */
    .note-box {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 10px;
      border-left: 4px solid ${secondaryColor};
      margin: 20px 0;
    }
    
    .note-box h4 {
      color: ${secondaryColor};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 700;
    }
    
    .note-box p {
      font-size: 13px;
      color: #555;
      line-height: 1.6;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 24px ${size.padding};
      background: ${navyColor} !important;
      color: white !important;
      border-top: 4px solid ${primaryColor};
    }
    
    .footer .thanks {
      font-size: ${documentType === 'receipt' ? '14px' : '16px'};
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .footer .tagline {
      font-size: 13px;
      opacity: 0.85;
    }
    
    .footer .flag {
      margin-top: 12px;
      font-size: ${documentType === 'receipt' ? '20px' : '24px'};
    }
    
    .footer .contact {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* Two Column Parties (Invoice) */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 24px;
    }
    
    .party h3 {
      color: ${primaryColor} !important;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    .party p {
      font-size: 14px;
      line-height: 1.7;
    }
    
    /* Breakdown Grid */
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    
    .breakdown-item {
      background: #f8f9fa;
      padding: 14px 18px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #eee;
    }
    
    .breakdown-item .label { font-size: 13px; color: #666; }
    .breakdown-item .value { font-size: 15px; font-weight: 700; color: ${navyColor}; }
    
    /* Print Styles */
    @media print {
      body { background: white; padding: 0; }
      .document { box-shadow: none; max-width: 100%; }
      thead { display: table-header-group; }
      tbody tr { page-break-inside: avoid; }
    }
    
    @page {
      margin: 10mm;
      size: ${documentType === 'receipt' ? '80mm auto' : 'A4 portrait'};
    }
  `;
}

// Generate document header
export function getUnifiedHeader(organisation, docType, docNumber, docDate, documentType = 'report') {
  const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hasLogo = organisation?.logo_url;
  
  return `
    <div class="flag-stripe">
      <div class="primary"></div>
      <div class="white"></div>
      <div class="secondary"></div>
    </div>
    
    <div class="header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-box">
            ${hasLogo ? `<img src="${organisation.logo_url}" alt="${organisation.name}" />` : `<span class="initials">${orgInitials}</span>`}
          </div>
          <div class="company-info">
            <h1>${organisation?.name || 'Organisation'}</h1>
            <div class="tagline">${organisation?.address || ''} ${organisation?.city ? '• ' + organisation.city : ''}, ${organisation?.country || 'Sierra Leone'}</div>
          </div>
        </div>
        <div class="doc-info">
          <div class="doc-type">${docType}</div>
          <div class="doc-number">${docNumber}</div>
          <div class="doc-date">${docDate}</div>
        </div>
      </div>
    </div>
  `;
}

// Generate document footer
export function getUnifiedFooter(organisation) {
  return `
    <div class="footer">
      <div class="thanks">Thank you for your business!</div>
      <div class="tagline">Proudly serving ${organisation?.city || 'Sierra Leone'}</div>
      <div class="flag">🇸🇱</div>
      <div class="contact">
        ${organisation?.name || ''} ${organisation?.phone ? '• ' + organisation.phone : ''} ${organisation?.email ? '• ' + organisation.email : ''}
      </div>
    </div>
  `;
}

// Generate summary cards HTML
export function generateSummaryCards(cards) {
  return `
    <div class="summary-cards">
      ${cards.map(card => `
        <div class="summary-card ${card.highlight ? `highlight-${card.highlight}` : ''}">
          <div class="label">${card.label}</div>
          <div class="value">${card.value}</div>
          ${card.subtext ? `<div class="subtext">${card.subtext}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// Generate table HTML
export function generateTable(columns, rows, showTotal = false) {
  return `
    <table class="data-table">
      <thead>
        <tr>
          ${columns.map((col, i) => `<th class="${i === columns.length - 1 ? 'amount' : ''}">${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, rowIdx) => {
          const isTotal = showTotal && (row[0]?.toString().toLowerCase().includes('total') || rowIdx === rows.length - 1 && showTotal === 'last');
          return `
            <tr class="${isTotal ? 'total-row' : ''}">
              ${row.map((cell, cellIdx) => `<td class="${cellIdx === row.length - 1 ? 'amount' : ''}">${cell ?? '-'}</td>`).join('')}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Generate full document
export function generateUnifiedPDF({
  documentType = 'report',
  title,
  docNumber,
  docDate,
  organisation,
  summaryCards = [],
  sections = [],
  showFooter = true
}) {
  const formattedDate = docDate || format(new Date(), 'dd MMMM yyyy, HH:mm');
  const generatedNumber = docNumber || `DOC-${Date.now().toString(36).toUpperCase()}`;
  
  let sectionsHTML = '';
  
  sections.forEach(section => {
    if (section.title) {
      sectionsHTML += `<div class="section-title"><div class="icon">${section.icon || '📋'}</div>${section.title}</div>`;
    }
    
    if (section.cards) {
      sectionsHTML += generateSummaryCards(section.cards);
    }
    
    if (section.table) {
      sectionsHTML += generateTable(section.table.columns, section.table.rows, section.table.showTotal);
    }
    
    if (section.breakdown) {
      sectionsHTML += `
        <div class="breakdown-grid">
          ${Object.entries(section.breakdown).map(([key, val]) => `
            <div class="breakdown-item">
              <span class="label">${key}</span>
              <span class="value">${typeof val === 'number' ? val.toLocaleString() : val}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    if (section.totals) {
      sectionsHTML += `
        <div class="totals-section">
          ${section.totals.map(t => `
            <div class="totals-row ${t.isGrand ? 'grand' : ''}">
              <span>${t.label}</span>
              <span class="amount">${t.value}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    if (section.netPay) {
      sectionsHTML += `
        <div class="net-pay-box">
          <span class="label">💵 ${section.netPay.label || 'NET PAY'}</span>
          <span class="amount">${section.netPay.value}</span>
        </div>
      `;
    }
    
    if (section.note) {
      sectionsHTML += `
        <div class="note-box">
          <h4>${section.note.title || 'Note'}</h4>
          <p>${section.note.content}</p>
        </div>
      `;
    }
    
    if (section.html) {
      sectionsHTML += section.html;
    }
  });
  
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
          ${getUnifiedHeader(organisation, title, generatedNumber, formattedDate, documentType)}
          
          ${summaryCards.length > 0 ? `<div class="content">${generateSummaryCards(summaryCards)}</div>` : ''}
          
          <div class="content">
            ${sectionsHTML}
          </div>
          
          ${showFooter ? getUnifiedFooter(organisation) : ''}
        </div>
      </body>
    </html>
  `;
}

// Print utility
export function printUnifiedPDF(html) {
  const printWindow = window.open('', '', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}

// Download as PDF utility
export function downloadUnifiedPDF(html, filename = 'document') {
  const pdfWindow = window.open('', '_blank', 'width=900,height=700');
  if (pdfWindow) {
    pdfWindow.document.write(html);
    pdfWindow.document.close();
    pdfWindow.document.title = filename;
    setTimeout(() => pdfWindow.print(), 400);
  }
}

export default {
  getStyles: getUnifiedPDFStyles,
  getHeader: getUnifiedHeader,
  getFooter: getUnifiedFooter,
  generate: generateUnifiedPDF,
  print: printUnifiedPDF,
  downloadPDF: downloadUnifiedPDF
};