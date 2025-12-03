// Unified PDF Styles - Receipt-inspired design for all documents
// Provides consistent branding across receipts, invoices, payslips, and reports

/**
 * Get unified PDF styles based on organisation branding
 * @param {Object} organisation - Organisation object with branding info
 * @param {string} documentType - Type: 'receipt', 'invoice', 'payslip', 'report'
 */
export function getUnifiedPDFStyles(organisation, documentType = 'receipt') {
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  const navyColor = '#0F1F3C';
  
  // Size adjustments based on document type
  const sizes = {
    receipt: { maxWidth: '420px', headerPadding: '20px 24px', contentPadding: '16px 24px' },
    invoice: { maxWidth: '800px', headerPadding: '28px 40px', contentPadding: '24px 40px' },
    payslip: { maxWidth: '800px', headerPadding: '28px 40px', contentPadding: '24px 40px' },
    report: { maxWidth: '900px', headerPadding: '28px 40px', contentPadding: '24px 40px' }
  };
  
  const size = sizes[documentType] || sizes.report;

  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --navy: ${navyColor};
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
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
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    
    body { 
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--gray-50);
      padding: 20px;
      color: var(--gray-800);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .document {
      max-width: ${size.maxWidth};
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
    .flag-stripe .white { flex: 1; background: #fff !important; }
    .flag-stripe .secondary { flex: 1; background: var(--secondary) !important; }
    
    /* Header - Gradient Style */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
      color: white !important;
      padding: ${size.headerPadding};
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.08;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.5) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .logo-box {
      width: 56px;
      height: 56px;
      background: white;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .logo-box img {
      max-width: 44px;
      max-height: 44px;
      object-fit: contain;
    }
    
    .logo-box .initials {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .company-info h1 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }
    
    .company-info .address {
      font-size: 12px;
      opacity: 0.85;
    }
    
    .header-right {
      text-align: right;
    }
    
    .header-right .doc-type {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    
    .header-right .doc-number {
      font-size: 16px;
      font-weight: 700;
    }
    
    .header-right .doc-date {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 4px;
    }
    
    /* Info Bar */
    .info-bar {
      background: var(--gray-50);
      padding: 14px ${size.contentPadding.split(' ')[1]};
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 13px;
    }
    
    .info-bar .info-item {
      display: flex;
      gap: 6px;
    }
    
    .info-bar .info-item .label {
      color: var(--gray-500);
    }
    
    .info-bar .info-item .value {
      font-weight: 600;
      color: var(--gray-800);
    }
    
    /* Content Area */
    .content {
      padding: ${size.contentPadding};
    }
    
    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    
    .summary-card .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--gray-500);
      margin-bottom: 6px;
    }
    
    .summary-card .value {
      font-size: 20px;
      font-weight: 700;
      color: var(--gray-800);
    }
    
    .summary-card .subtext {
      font-size: 11px;
      color: var(--gray-400);
      margin-top: 4px;
    }
    
    .summary-card.highlight-green { border-left: 4px solid var(--success); }
    .summary-card.highlight-red { border-left: 4px solid var(--danger); }
    .summary-card.highlight-gold { border-left: 4px solid var(--warning); }
    .summary-card.highlight-blue { border-left: 4px solid var(--secondary); }
    
    /* Section Title */
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: var(--gray-700);
      margin: 24px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--gray-200);
    }
    
    .section-title .icon {
      font-size: 16px;
    }
    
    /* Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }
    
    .data-table thead {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
      color: white !important;
    }
    
    .data-table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table th.amount {
      text-align: right;
    }
    
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }
    
    .data-table td.amount {
      text-align: right;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      font-weight: 600;
    }
    
    .data-table tbody tr:hover {
      background: var(--gray-50);
    }
    
    .data-table tbody tr.total-row {
      background: var(--gray-100) !important;
      font-weight: 700;
    }
    
    .data-table tbody tr.total-row td {
      border-top: 2px solid var(--gray-300);
    }
    
    /* Parties Grid (for invoices) */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .party h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--gray-400);
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .party p {
      font-size: 13px;
      color: var(--gray-700);
      margin: 4px 0;
    }
    
    /* Breakdown Grid */
    .breakdown-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      font-size: 12px;
      min-width: 160px;
    }
    
    .breakdown-item .label {
      color: var(--gray-600);
      text-transform: capitalize;
    }
    
    .breakdown-item .value {
      font-weight: 600;
      color: var(--gray-800);
    }
    
    /* Totals Box */
    .totals-box {
      margin-left: auto;
      width: 280px;
      border: 2px solid var(--gray-200);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid var(--gray-100);
    }
    
    .totals-row:last-child {
      border-bottom: none;
    }
    
    .totals-row.grand {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
      color: white !important;
      font-weight: 700;
      font-size: 18px;
    }
    
    /* Net Pay Box (Payslips) */
    .net-pay-box {
      margin-top: 20px;
      padding: 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
      border-radius: 16px;
      color: white !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 24px;
      font-weight: 800;
      box-shadow: 0 8px 24px rgba(30, 176, 83, 0.3);
    }
    
    .net-pay-box .label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .net-pay-box .amount {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }
    
    /* Note Box */
    .note-box {
      background: var(--gray-50);
      border-left: 4px solid var(--warning);
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      margin-top: 20px;
    }
    
    .note-box h4 {
      font-size: 12px;
      font-weight: 600;
      color: var(--warning);
      margin-bottom: 6px;
    }
    
    .note-box p {
      font-size: 13px;
      color: var(--gray-600);
    }
    
    /* Badges */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge.success { background: #dcfce7; color: #166534; }
    .badge.warning { background: #fef3c7; color: #92400e; }
    .badge.danger { background: #fee2e2; color: #991b1b; }
    .badge.info { background: #e0f2fe; color: #075985; }
    .badge.paid { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    
    /* Footer */
    .footer {
      background: var(--navy) !important;
      color: white !important;
      padding: 24px ${size.contentPadding.split(' ')[1]};
      text-align: center;
    }
    
    .footer .thanks {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .footer .tagline {
      font-size: 13px;
      opacity: 0.85;
    }
    
    .footer .flag {
      margin: 12px 0;
      font-size: 22px;
    }
    
    .footer .contact {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* Print Styles */
    @media print {
      html, body {
        padding: 0;
        margin: 0;
        background: white !important;
      }
      
      .document {
        box-shadow: none;
        max-width: 100%;
        border-radius: 0;
      }
      
      .header, .footer, .totals-row.grand, .net-pay-box, .data-table thead {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    
    @page {
      margin: 10mm;
      size: A4 portrait;
    }
  `;
}

/**
 * Generate unified header HTML
 */
export function getUnifiedHeader(organisation, docType, docNumber, docDate, documentType = 'receipt') {
  const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  
  return `
    <div class="flag-stripe">
      <div class="primary"></div>
      <div class="white"></div>
      <div class="secondary"></div>
    </div>
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-box">
            ${organisation?.logo_url 
              ? `<img src="${organisation.logo_url}" alt="${organisation.name}">` 
              : `<span class="initials">${orgInitials}</span>`
            }
          </div>
          <div class="company-info">
            <h1>${organisation?.name || 'Organisation'}</h1>
            <div class="address">${organisation?.address || ''} ${organisation?.city ? '• ' + organisation.city : ''}, ${organisation?.country || 'Sierra Leone'}</div>
          </div>
        </div>
        <div class="header-right">
          <div class="doc-type">${docType}</div>
          <div class="doc-number">${docNumber}</div>
          <div class="doc-date">${docDate}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate unified footer HTML
 */
export function getUnifiedFooter(organisation) {
  return `
    <div class="footer">
      <div class="thanks">Thank you for your business!</div>
      <div class="tagline">Proudly serving Sierra Leone</div>
      <div class="flag">🇸🇱</div>
      <div class="contact">
        ${organisation?.name || ''} ${organisation?.phone ? '• ' + organisation.phone : ''} ${organisation?.email ? '• ' + organisation.email : ''}
      </div>
    </div>
  `;
}

/**
 * Generate a complete unified PDF document
 */
export function generateUnifiedPDF({
  documentType = 'report',
  title,
  docNumber,
  docDate,
  organisation,
  infoBar = [],
  summaryCards = [],
  sections = [],
  notes = null,
  showFooter = true
}) {
  const styles = getUnifiedPDFStyles(organisation, documentType);
  const generatedDate = new Date().toLocaleString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
  const finalDocNumber = docNumber || `${documentType.toUpperCase().slice(0,3)}-${Date.now().toString(36).toUpperCase()}`;
  const finalDocDate = docDate || generatedDate;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${organisation?.name || 'Document'}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="document">
          ${getUnifiedHeader(organisation, title, finalDocNumber, finalDocDate, documentType)}
          
          ${infoBar.length > 0 ? `
            <div class="info-bar">
              ${infoBar.map(item => `
                <div class="info-item">
                  <span class="label">${item.label}:</span>
                  <span class="value">${item.value}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="content">
            ${summaryCards.length > 0 ? `
              <div class="summary-cards">
                ${summaryCards.map(card => `
                  <div class="summary-card ${card.highlight ? 'highlight-' + card.highlight : ''}">
                    <div class="label">${card.label}</div>
                    <div class="value">${card.value}</div>
                    ${card.subtext ? `<div class="subtext">${card.subtext}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.map(section => `
              ${section.title ? `
                <div class="section-title">
                  ${section.icon ? `<div class="icon">${section.icon}</div>` : ''}
                  ${section.title}
                </div>
              ` : ''}
              
              ${section.table ? `
                <table class="data-table">
                  <thead>
                    <tr>
                      ${section.table.columns.map((col, i) => `
                        <th class="${i === section.table.columns.length - 1 ? 'amount' : ''}">${col}</th>
                      `).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${section.table.rows.map((row, rowIdx) => {
                      const cells = Array.isArray(row) ? row : Object.values(row);
                      const firstCell = cells[0]?.toString().toLowerCase() || '';
                      const isTotal = firstCell.includes('total') || firstCell.includes('net') || firstCell.includes('grand');
                      return `
                        <tr class="${isTotal ? 'total-row' : ''}">
                          ${cells.map((cell, i) => `
                            <td class="${i === cells.length - 1 ? 'amount' : ''}">${cell ?? '-'}</td>
                          `).join('')}
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              ` : ''}
              
              ${section.content ? section.content : ''}
            `).join('')}
            
            ${notes ? `
              <div class="note-box">
                <h4>Notes</h4>
                <p>${notes}</p>
              </div>
            ` : ''}
          </div>
          
          ${showFooter ? getUnifiedFooter(organisation) : ''}
        </div>
      </body>
    </html>
  `;
}

/**
 * Print a unified PDF document using hidden iframe for cleaner experience
 */
export function printUnifiedPDF(html, filename = 'document.pdf') {
  // Create a hidden iframe for better PDF generation
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  
  // Wait for content to load then trigger print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Remove iframe after print dialog closes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 500);
  };
}

/**
 * Download unified PDF (via print dialog) using hidden iframe
 */
export function downloadUnifiedPDF(html, filename = 'document') {
  printUnifiedPDF(html, `${filename}.pdf`);
}