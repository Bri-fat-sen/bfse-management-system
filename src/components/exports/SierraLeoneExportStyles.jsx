// Modern Export Styles for PDF/Print exports
// Now uses unified receipt-style design
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "./UnifiedPDFStyles";

export const getSierraLeoneStyles = (organisation) => getUnifiedPDFStyles(organisation, 'report');

// Legacy styles kept for backwards compatibility
export const getLegacySierraLeoneStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --primary: #0f172a;
    --primary-light: #1e293b;
    --accent: #3b82f6;
    --accent-light: #60a5fa;
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
    --sl-green: #10b981;
    --sl-blue: #3b82f6;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body { 
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--gray-50);
    color: var(--gray-800);
    line-height: 1.7;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }
  
  .document {
    max-width: 210mm;
    margin: 0 auto;
    background: white;
    min-height: 297mm;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  }
  
  /* Modern Header */
  .header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: white;
    padding: 40px 48px;
    position: relative;
    overflow: hidden;
  }
  
  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--sl-green), var(--sl-blue));
  }
  
  .header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.05;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%);
  }
  
  .header .org-logo {
    width: 64px;
    height: 64px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding: 8px;
    position: relative;
    z-index: 1;
  }
  
  .header .org-logo img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .header .org-logo span {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--sl-green), var(--sl-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .header .org-name {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }
  
  .header .tagline {
    font-size: 13px;
    opacity: 0.8;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }
  
  .header .address {
    font-size: 13px;
    opacity: 0.7;
    margin-top: 12px;
    position: relative;
    z-index: 1;
  }
  
  /* Title Section */
  .report-title {
    padding: 32px 48px;
    background: linear-gradient(180deg, var(--gray-50) 0%, white 100%);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .report-title h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--gray-900);
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .report-title h1::before {
    content: '';
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--sl-green), var(--sl-blue));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .report-title .date {
    background: white;
    border: 1px solid var(--gray-200);
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .content {
    padding: 40px 48px;
    background: white;
  }
  
  /* Summary Cards */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 768px) {
    .summary-grid { grid-template-columns: repeat(2, 1fr); }
  }
  
  .summary-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    border: 1px solid var(--gray-100);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    position: relative;
    overflow: hidden;
  }
  
  .summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--sl-green), var(--sl-blue));
  }
  
  .summary-card:nth-child(2)::before {
    background: linear-gradient(90deg, var(--sl-blue), #8b5cf6);
  }
  
  .summary-card:nth-child(3)::before {
    background: linear-gradient(90deg, #f59e0b, #ef4444);
  }
  
  .summary-card:nth-child(4)::before {
    background: linear-gradient(90deg, #8b5cf6, #ec4899);
  }
  
  .summary-card.highlight-green::before { background: var(--success); }
  .summary-card.highlight-red::before { background: var(--danger); }
  .summary-card.highlight-gold::before { background: var(--warning); }
  
  .summary-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--gray-400);
    margin-bottom: 12px;
  }
  
  .summary-value {
    font-size: 32px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -1px;
    line-height: 1;
  }
  
  .summary-card:first-child .summary-value { color: var(--sl-green); }
  .summary-card:nth-child(2) .summary-value { color: var(--sl-blue); }
  .summary-card:nth-child(3) .summary-value { color: #f59e0b; }
  .summary-card:nth-child(4) .summary-value { color: #8b5cf6; }
  .summary-card.highlight-green .summary-value { color: var(--success); }
  .summary-card.highlight-red .summary-value { color: var(--danger); }
  
  .summary-subtitle {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 8px;
  }
  
  /* Section Headers */
  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 40px 0 20px 0;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--gray-100);
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-800);
  }
  
  .section-title::before {
    content: '📋';
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--gray-100), var(--gray-50));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  /* Modern Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    font-size: 13px;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--gray-200);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  }
  
  thead {
    background: var(--gray-50);
  }
  
  th {
    padding: 16px 20px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--gray-500);
    border-bottom: 1px solid var(--gray-200);
  }
  
  th:last-child {
    text-align: right;
  }
  
  td {
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-700);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover td {
    background: var(--gray-50);
  }
  
  .amount { 
    text-align: right; 
    font-weight: 600;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 13px;
  }
  
  .amount.positive { color: var(--success); }
  .amount.negative { color: var(--danger); }
  
  .totals-row {
    background: var(--gray-900) !important;
  }
  
  .totals-row td {
    color: white !important;
    font-weight: 700;
    font-size: 14px;
    border: none;
    background: transparent !important;
  }
  
  .totals-row:hover td {
    background: transparent !important;
  }
  
  /* Status Badges */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  
  .status-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  
  .status-badge.success { background: #ecfdf5; color: #059669; }
  .status-badge.warning { background: #fffbeb; color: #d97706; }
  .status-badge.danger { background: #fef2f2; color: #dc2626; }
  .status-badge.info { background: #eff6ff; color: #3b82f6; }
  
  /* Category Breakdown */
  .category-breakdown {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin: 20px 0;
  }
  
  .category-tag {
    background: var(--gray-50);
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .category-tag strong {
    color: var(--gray-800);
    font-weight: 700;
  }
  
  /* Notes Section */
  .notes-section {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1px solid #fde68a;
    padding: 20px 24px;
    margin-top: 24px;
    border-radius: 12px;
    font-size: 13px;
    display: flex;
    gap: 16px;
  }
  
  .notes-section .notes-title {
    font-weight: 700;
    color: #92400e;
    margin-bottom: 4px;
  }
  
  /* Footer */
  .footer {
    background: var(--gray-900);
    color: white;
    padding: 40px 48px;
    position: relative;
  }
  
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--sl-green), var(--sl-blue));
  }
  
  .footer .thanks {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .footer .pride {
    font-size: 13px;
    opacity: 0.7;
  }
  
  .footer .sl-flag {
    margin-top: 16px;
    font-size: 32px;
  }
  
  .footer .generated-info {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 11px;
    opacity: 0.6;
  }
  
  .watermark {
    position: fixed;
    bottom: 16px;
    right: 24px;
    font-size: 11px;
    color: var(--gray-300);
  }
  
  @media print {
    * { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
      color-adjust: exact !important; 
    }
    html, body { 
      padding: 0; 
      margin: 0;
      background: white !important; 
    }
    .document { 
      box-shadow: none; 
      max-width: 100%;
    }
    .header { 
      -webkit-print-color-adjust: exact !important;
    }
    thead { 
      display: table-header-group;
    }
    tbody tr { 
      page-break-inside: avoid; 
    }
    .summary-card { 
      page-break-inside: avoid;
    }
    .section-title {
      page-break-after: avoid;
    }
    table { 
      page-break-inside: auto; 
    }
    .watermark { 
      display: none; 
    }
  }
  
  @page {
    margin: 10mm;
    size: A4 portrait;
  }
`;

export const generateExportHTML = ({
  title,
  organisation,
  summary = [],
  columns = [],
  rows = [],
  categoryBreakdown = null,
  dateRange = null,
  notes = null,
  footer = true
}) => {
  const styles = getUnifiedPDFStyles(organisation, 'report');
  const generatedDate = new Date().toLocaleString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${organisation?.name || 'Report'}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="document">
          ${getUnifiedHeader(organisation, title, reportId, dateRange || generatedDate, 'report')}
          
          <div class="content">
            ${summary.length > 0 ? `
              <div class="summary-cards">
                ${summary.map((item, idx) => `
                  <div class="summary-card ${item.highlight ? `highlight-${item.highlight}` : ''}">
                    <div class="label">${item.label}</div>
                    <div class="value">${item.value}</div>
                    ${item.subtitle ? `<div class="subtext">${item.subtitle}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${categoryBreakdown ? `
              <div class="section-title"><div class="icon">📊</div>Category Breakdown</div>
              <div class="breakdown-grid">
                ${Object.entries(categoryBreakdown).map(([cat, amount]) => `
                  <div class="breakdown-item">
                    <span class="label">${cat.replace(/_/g, ' ')}</span>
                    <span class="value">SLE ${amount.toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${columns.length > 0 && rows.length > 0 ? `
              <div class="section-title"><div class="icon">📋</div>Detailed Records</div>
              <table class="data-table">
                <thead>
                  <tr>
                    ${columns.map((col, i) => `<th class="${i === columns.length - 1 ? 'amount' : ''}">${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row, rowIdx) => {
                    const firstCell = (Array.isArray(row) ? row[0] : Object.values(row)[0])?.toString() || '';
                    const isTotal = firstCell.toLowerCase().includes('total') || 
                                   firstCell.toLowerCase().includes('net') ||
                                   firstCell.toLowerCase().includes('grand');
                    return `
                      <tr class="${isTotal ? 'total-row' : ''}">
                        ${(Array.isArray(row) ? row : Object.values(row)).map((cell, cellIdx) => {
                          const colName = columns[cellIdx]?.toLowerCase() || '';
                          const isAmount = colName.includes('amount') || colName.includes('value') || colName.includes('price') || colName.includes('total') || colName.includes('cost');
                          const isStatus = colName.includes('status');
                          
                          let badgeClass = '';
                          if (isStatus && cell) {
                            const cellStr = cell.toString().toLowerCase();
                            if (['paid', 'approved', 'completed', 'active', 'success', 'present'].some(s => cellStr.includes(s))) badgeClass = 'success';
                            else if (['pending', 'low', 'warning', 'draft'].some(s => cellStr.includes(s))) badgeClass = 'warning';
                            else if (['rejected', 'cancelled', 'expired', 'failed', 'absent'].some(s => cellStr.includes(s))) badgeClass = 'danger';
                            else badgeClass = 'info';
                          }
                          
                          const cellValue = cell ?? '-';
                          
                          return `<td class="${isAmount ? 'amount' : ''}">
                            ${isStatus && cell ? `<span class="badge ${badgeClass}">${cellValue}</span>` : cellValue}
                          </td>`;
                        }).join('')}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: #94a3b8; padding: 48px; background: #f8fafc; border-radius: 12px;">No data available for this report</p>'}
            
            ${notes ? `
              <div class="note-box">
                <h4>Notes</h4>
                <p>${notes}</p>
              </div>
            ` : ''}
          </div>
          
          ${footer ? getUnifiedFooter(organisation) : ''}
        </div>
      </body>
    </html>
  `;
};

export const printDocument = (html, filename = 'report.pdf') => {
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
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };
};

export const downloadPDF = (html, filename = 'report.pdf') => {
  // Same as printDocument but with print-to-PDF intent
  printDocument(html, filename);
};

export const downloadHTML = (html, filename) => {
  // For HTML download (rarely used now)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToCSV = (columns, rows, filename, organisation = null) => {
  let csvContent = '';
  
  if (organisation) {
    csvContent += `"${organisation.name || 'Organisation'}"\n`;
    if (organisation.address) csvContent += `"${organisation.address}${organisation.city ? ', ' + organisation.city : ''}"\n`;
    if (organisation.phone) csvContent += `"Phone: ${organisation.phone}"\n`;
    if (organisation.email) csvContent += `"Email: ${organisation.email}"\n`;
    csvContent += `"Generated: ${new Date().toLocaleString('en-GB')}"\n`;
    csvContent += '\n';
  }
  
  csvContent += columns.join(',') + '\n';
  rows.forEach(row => {
    const rowData = Array.isArray(row) ? row : Object.values(row);
    csvContent += rowData.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};