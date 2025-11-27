// Sierra Leone themed export styles for PDF/Print exports
export const getSierraLeoneStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
    background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
    padding: 24px;
    color: #1a1a2e;
    line-height: 1.5;
  }
  .document {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
  }
  .flag-stripe {
    height: 10px;
    display: flex;
    position: relative;
  }
  .flag-stripe .green { 
    flex: 1; 
    background: linear-gradient(180deg, #22c55e 0%, #1EB053 100%); 
  }
  .flag-stripe .white { 
    flex: 1; 
    background: linear-gradient(180deg, #FFFFFF 0%, #f8fafc 100%); 
    border-top: 1px solid #e2e8f0; 
    border-bottom: 1px solid #e2e8f0; 
  }
  .flag-stripe .blue { 
    flex: 1; 
    background: linear-gradient(180deg, #0284c7 0%, #0072C6 100%); 
  }
  .header {
    background: linear-gradient(135deg, #1EB053 0%, #059669 40%, #0072C6 100%);
    color: white;
    padding: 32px 36px;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .header::after {
    content: '🇸🇱';
    position: absolute;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 56px;
    opacity: 0.25;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  .header .org-logo {
    width: 70px;
    height: 70px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    padding: 6px;
  }
  .header .org-logo img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .header .org-logo span {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .header .org-name {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .header .tagline {
    font-size: 12px;
    opacity: 0.95;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 500;
  }
  .header .address {
    font-size: 13px;
    opacity: 0.9;
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .header .address span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .report-title {
    background: linear-gradient(135deg, #0F1F3C 0%, #1e3a5f 100%);
    color: white;
    padding: 18px 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #D4AF37;
  }
  .report-title h1 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .report-title .date {
    font-size: 13px;
    opacity: 0.85;
    background: rgba(255,255,255,0.1);
    padding: 6px 14px;
    border-radius: 20px;
  }
  .content {
    padding: 36px;
    background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 32px;
  }
  @media (max-width: 768px) {
    .summary-grid { grid-template-columns: repeat(2, 1fr); }
  }
  .summary-card {
    background: white;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    border-top: 5px solid #1EB053;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
  }
  .summary-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, rgba(30,176,83,0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  .summary-card:nth-child(2) { border-top-color: #0072C6; }
  .summary-card:nth-child(2)::after { background: linear-gradient(180deg, rgba(0,114,198,0.03) 0%, transparent 50%); }
  .summary-card:nth-child(3) { border-top-color: #D4AF37; }
  .summary-card:nth-child(3)::after { background: linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 50%); }
  .summary-card:nth-child(4) { border-top-color: #0F1F3C; }
  .summary-card:nth-child(4)::after { background: linear-gradient(180deg, rgba(15,31,60,0.03) 0%, transparent 50%); }
  .summary-card.highlight-green { border-top-color: #1EB053; background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%); }
  .summary-card.highlight-red { border-top-color: #EF4444; background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); }
  .summary-card.highlight-blue { border-top-color: #0072C6; background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%); }
  .summary-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .summary-value {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.5px;
  }
  .summary-card:first-child .summary-value { color: #1EB053; }
  .summary-card:nth-child(2) .summary-value { color: #0072C6; }
  .summary-card:nth-child(3) .summary-value { color: #D4AF37; }
  .summary-card:nth-child(4) .summary-value { color: #0F1F3C; }
  .summary-card.highlight-green .summary-value { color: #059669; }
  .summary-card.highlight-red .summary-value { color: #dc2626; }
  .summary-subtitle {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 24px;
    font-size: 13px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  thead {
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
  }
  th {
    color: white;
    padding: 16px 14px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.8px;
  }
  th:first-child { border-radius: 0; }
  th:last-child { border-radius: 0; }
  td {
    padding: 14px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
    background: white;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  tr:last-child td {
    border-bottom: none;
  }
  .amount { 
    text-align: right; 
    font-weight: 600;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 12px;
  }
  .amount.positive { color: #059669; }
  .amount.negative { color: #dc2626; }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 20px;
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
  .status-badge.info { background: #eff6ff; color: #0072C6; }
  .footer {
    background: linear-gradient(135deg, #0F1F3C 0%, #1e3a5f 50%, #0F1F3C 100%);
    color: white;
    padding: 28px 36px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
  }
  .footer .thanks {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
  }
  .footer .pride {
    font-size: 13px;
    opacity: 0.85;
  }
  .footer .sl-flag {
    margin-top: 14px;
    font-size: 32px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
  .footer .generated-info {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.15);
    font-size: 11px;
    opacity: 0.7;
  }
  .section-title {
    font-size: 17px;
    font-weight: 700;
    color: #0F1F3C;
    margin: 32px 0 18px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid transparent;
    background: linear-gradient(white, white), linear-gradient(90deg, #1EB053 0%, #0072C6 100%);
    background-origin: padding-box, border-box;
    background-clip: padding-box, border-box;
    border-bottom: 2px solid;
    border-image: linear-gradient(90deg, #1EB053 0%, #0072C6 100%) 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title::before {
    content: '';
    width: 5px;
    height: 24px;
    background: linear-gradient(180deg, #1EB053 0%, #0072C6 100%);
    border-radius: 3px;
  }
  .totals-row {
    background: linear-gradient(135deg, #0F1F3C 0%, #1e3a5f 100%) !important;
    color: white !important;
    font-weight: 700;
  }
  .totals-row td {
    border: none;
    padding: 16px 14px;
    background: transparent !important;
    color: white;
  }
  .category-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }
  .category-tag {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 500;
    border-left: 4px solid #1EB053;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .category-tag:nth-child(2n) { border-left-color: #0072C6; }
  .category-tag:nth-child(3n) { border-left-color: #D4AF37; }
  .notes-section {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-left: 4px solid #D4AF37;
    padding: 16px 20px;
    margin-top: 24px;
    border-radius: 0 12px 12px 0;
    font-size: 13px;
  }
  .notes-section .notes-title {
    font-weight: 600;
    color: #92400e;
    margin-bottom: 6px;
  }
  .watermark {
    position: fixed;
    bottom: 12px;
    right: 16px;
    font-size: 10px;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .page-number {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: #94a3b8;
  }
  @media print {
    * { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
      color-adjust: exact !important; 
    }
    html, body { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      padding: 0; 
      margin: 0;
      background: white !important; 
    }
    .document { 
      box-shadow: none; 
      border-radius: 0; 
      max-width: 100%;
    }
    .flag-stripe { height: 10px !important; display: flex !important; }
    .flag-stripe .green { background: #1EB053 !important; }
    .flag-stripe .white { background: #FFFFFF !important; }
    .flag-stripe .blue { background: #0072C6 !important; }
    .header { 
      background: #1EB053 !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
    }
    .report-title {
      background: #0F1F3C !important;
      color: white !important;
    }
    thead { background: #1EB053 !important; }
    th { 
      background: #1EB053 !important;
      color: white !important;
    }
    tr:nth-child(even) td { background-color: #f8fafc !important; }
    .summary-card { 
      background: #ffffff !important; 
      border-top: 5px solid #1EB053 !important;
      box-shadow: none !important;
      border: 1px solid #e2e8f0 !important;
    }
    .summary-card:nth-child(2) { border-top-color: #0072C6 !important; }
    .summary-card:nth-child(3) { border-top-color: #D4AF37 !important; }
    .summary-card:nth-child(4) { border-top-color: #0F1F3C !important; }
    .summary-card.highlight-green { border-top-color: #1EB053 !important; background: #ecfdf5 !important; }
    .summary-card.highlight-red { border-top-color: #EF4444 !important; background: #fef2f2 !important; }
    .footer { 
      background: #0F1F3C !important;
      color: white !important;
    }
    .totals-row { background: #0F1F3C !important; }
    .totals-row td { background: #0F1F3C !important; color: white !important; }
    .status-badge.success { background: #ecfdf5 !important; color: #059669 !important; }
    .status-badge.warning { background: #fffbeb !important; color: #d97706 !important; }
    .status-badge.danger { background: #fef2f2 !important; color: #dc2626 !important; }
    .status-badge.info { background: #eff6ff !important; color: #0072C6 !important; }
    table { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
  }
  @page {
    margin: 0.75cm;
    size: A4;
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
  const styles = getSierraLeoneStyles();
  const generatedDate = new Date().toLocaleString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  const orgInitials = (organisation?.name || 'BFSE').split(' ').map(w => w[0]).join('').slice(0, 3);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${organisation?.name || 'BFSE'}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="document">
          <div class="flag-stripe">
            <div class="green"></div>
            <div class="white"></div>
            <div class="blue"></div>
          </div>
          
          <div class="header">
            <div class="org-logo"><span>${orgInitials}</span></div>
            <div class="org-name">${organisation?.name || 'BRI-FAT-SEN Enterprise'}</div>
            <div class="tagline">Business Management System</div>
            <div class="address">
              <span>📍 ${organisation?.address || 'Freetown'}, Sierra Leone</span>
              ${organisation?.phone ? `<span>📞 ${organisation.phone}</span>` : ''}
              ${organisation?.email ? `<span>✉️ ${organisation.email}</span>` : ''}
            </div>
          </div>
          
          <div class="report-title">
            <h1>📊 ${title}</h1>
            <div class="date">
              ${dateRange || generatedDate}
            </div>
          </div>
          
          <div class="content">
            ${summary.length > 0 ? `
              <div class="summary-grid">
                ${summary.map((item, idx) => `
                  <div class="summary-card ${item.highlight ? `highlight-${item.highlight}` : ''}">
                    <div class="summary-label">${item.label}</div>
                    <div class="summary-value">${item.value}</div>
                    ${item.subtitle ? `<div class="summary-subtitle">${item.subtitle}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${categoryBreakdown ? `
              <div class="section-title">Category Breakdown</div>
              <div class="category-breakdown">
                ${Object.entries(categoryBreakdown).map(([cat, amount]) => `
                  <span class="category-tag"><strong>${cat.replace(/_/g, ' ')}:</strong> Le ${amount.toLocaleString()}</span>
                `).join('')}
              </div>
            ` : ''}
            
            ${columns.length > 0 && rows.length > 0 ? `
              <div class="section-title">Detailed Records</div>
              <table>
                <thead>
                  <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row, rowIdx) => {
                    const firstCell = (Array.isArray(row) ? row[0] : Object.values(row)[0])?.toString() || '';
                    const isTotal = firstCell.toLowerCase().includes('total') || 
                                   firstCell.toLowerCase().includes('net') ||
                                   firstCell.toLowerCase().includes('grand');
                    return `
                      <tr class="${isTotal ? 'totals-row' : ''}">
                        ${(Array.isArray(row) ? row : Object.values(row)).map((cell, cellIdx) => {
                          const colName = columns[cellIdx]?.toLowerCase() || '';
                          const isAmount = colName.includes('amount') || 
                                          colName.includes('value') ||
                                          colName.includes('price') ||
                                          colName.includes('pay') ||
                                          colName.includes('revenue') ||
                                          colName.includes('cost') ||
                                          colName.includes('total');
                          const isStatus = colName.includes('status');
                          
                          let statusClass = '';
                          if (isStatus && cell) {
                            const cellStr = cell.toString().toLowerCase();
                            if (['paid', 'approved', 'completed', 'active', 'in stock', 'success', 'present'].some(s => cellStr.includes(s))) {
                              statusClass = 'success';
                            } else if (['pending', 'low', 'warning', 'draft', 'scheduled'].some(s => cellStr.includes(s))) {
                              statusClass = 'warning';
                            } else if (['rejected', 'cancelled', 'out', 'critical', 'expired', 'failed', 'absent'].some(s => cellStr.includes(s))) {
                              statusClass = 'danger';
                            } else {
                              statusClass = 'info';
                            }
                          }
                          
                          const cellValue = cell ?? '-';
                          
                          return `<td class="${isAmount ? 'amount' : ''}">
                            ${isStatus && cell ? `<span class="status-badge ${statusClass}">${cellValue}</span>` : cellValue}
                          </td>`;
                        }).join('')}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: #94a3b8; padding: 48px; background: #f8fafc; border-radius: 12px; font-size: 14px;">No data available for this report</p>'}
            
            ${notes ? `
              <div class="notes-section">
                <div class="notes-title">📝 Notes</div>
                <div>${notes}</div>
              </div>
            ` : ''}
          </div>
          
          ${footer ? `
            <div class="footer">
              <div class="thanks">Thank you for using BRI-FAT-SEN Enterprise Management System</div>
              <div class="pride">Proudly serving businesses across Sierra Leone 🇸🇱</div>
              <div class="sl-flag">🇸🇱</div>
              <div class="generated-info">
                Report generated on ${generatedDate} | Document ID: ${Date.now().toString(36).toUpperCase()}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="watermark">🇸🇱 BFSE Management</div>
      </body>
    </html>
  `;
};

export const printDocument = (html) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

export const downloadHTML = (html, filename) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (columns, rows, filename) => {
  let csvContent = columns.join(',') + '\n';
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