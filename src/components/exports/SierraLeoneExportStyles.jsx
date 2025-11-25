// Sierra Leone themed export styles for PDF/Print exports
export const getSierraLeoneStyles = () => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Segoe UI', Arial, sans-serif; 
    background: #f5f5f5;
    padding: 20px;
    color: #333;
  }
  .document {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .flag-stripe {
    height: 8px;
    display: flex;
  }
  .flag-stripe .green { flex: 1; background: #1EB053; }
  .flag-stripe .white { flex: 1; background: #FFFFFF; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
  .flag-stripe .blue { flex: 1; background: #0072C6; }
  .header {
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
    color: white;
    padding: 30px;
    position: relative;
  }
  .header::after {
    content: '🇸🇱';
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 48px;
    opacity: 0.3;
  }
  .header .org-name {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .header .tagline {
    font-size: 12px;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .header .address {
    font-size: 13px;
    opacity: 0.85;
    margin-top: 8px;
  }
  .report-title {
    background: #0F1F3C;
    color: white;
    padding: 16px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .report-title h1 {
    font-size: 18px;
    font-weight: 600;
  }
  .report-title .date {
    font-size: 13px;
    opacity: 0.8;
  }
  .content {
    padding: 30px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 30px;
  }
  .summary-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    border-top: 4px solid #1EB053;
    transition: transform 0.2s;
  }
  .summary-card:nth-child(2) { border-top-color: #0072C6; }
  .summary-card:nth-child(3) { border-top-color: #D4AF37; }
  .summary-card:nth-child(4) { border-top-color: #0F1F3C; }
  .summary-card.highlight-green { border-top-color: #1EB053; background: #E8F5E9; }
  .summary-card.highlight-red { border-top-color: #EF4444; background: #FEE2E2; }
  .summary-label {
    font-size: 11px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .summary-value {
    font-size: 22px;
    font-weight: bold;
    color: #1a1a1a;
  }
  .summary-card:first-child .summary-value { color: #1EB053; }
  .summary-card:nth-child(2) .summary-value { color: #0072C6; }
  .summary-card.highlight-green .summary-value { color: #1EB053; }
  .summary-card.highlight-red .summary-value { color: #EF4444; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    font-size: 13px;
  }
  thead {
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
  }
  th {
    color: white;
    padding: 14px 12px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }
  tr:nth-child(even) {
    background: #f8f9fa;
  }
  tr:hover {
    background: #E8F5E9;
  }
  .amount { 
    text-align: right; 
    font-weight: 600;
    font-family: 'Consolas', monospace;
  }
  .amount.positive { color: #1EB053; }
  .amount.negative { color: #EF4444; }
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .status-badge.success { background: #E8F5E9; color: #1EB053; }
  .status-badge.warning { background: #FFF3CD; color: #856404; }
  .status-badge.danger { background: #FEE2E2; color: #DC2626; }
  .status-badge.info { background: #E3F2FD; color: #0072C6; }
  .footer {
    background: linear-gradient(135deg, #0F1F3C 0%, #1a3a5c 100%);
    color: white;
    padding: 24px 30px;
    text-align: center;
  }
  .footer .thanks {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .footer .pride {
    font-size: 12px;
    opacity: 0.85;
  }
  .footer .sl-flag {
    margin-top: 10px;
    font-size: 28px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #0F1F3C;
    margin: 24px 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #1EB053;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(to bottom, #1EB053, #0072C6);
    border-radius: 2px;
  }
  .totals-row {
    background: #0F1F3C !important;
    color: white;
    font-weight: bold;
  }
  .totals-row td {
    border: none;
    padding: 14px 12px;
  }
  .category-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  .category-tag {
    background: #f0f0f0;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    border-left: 3px solid #1EB053;
  }
  .watermark {
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: #ccc;
  }
  @media print {
    body { padding: 0; background: white; }
    .document { box-shadow: none; border-radius: 0; }
    tr:hover { background: inherit; }
  }
  @page {
    margin: 0.5cm;
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
  footer = true
}) => {
  const styles = getSierraLeoneStyles();
  const generatedDate = new Date().toLocaleString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

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
            <div class="org-name">${organisation?.name || 'BFSE'}</div>
            <div class="tagline">Business Management System</div>
            <div class="address">
              ${organisation?.address || 'Freetown'}, Sierra Leone
              ${organisation?.phone ? `• Tel: ${organisation.phone}` : ''}
              ${organisation?.email ? `• ${organisation.email}` : ''}
            </div>
          </div>
          
          <div class="report-title">
            <h1>${title}</h1>
            <div class="date">
              ${dateRange || `Generated: ${generatedDate}`}
            </div>
          </div>
          
          <div class="content">
            ${summary.length > 0 ? `
              <div class="summary-grid">
                ${summary.map((item, idx) => `
                  <div class="summary-card ${item.highlight ? `highlight-${item.highlight}` : ''}">
                    <div class="summary-label">${item.label}</div>
                    <div class="summary-value">${item.value}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${categoryBreakdown ? `
              <div class="section-title">Category Breakdown</div>
              <div class="category-breakdown">
                ${Object.entries(categoryBreakdown).map(([cat, amount]) => `
                  <span class="category-tag">${cat.replace(/_/g, ' ')}: SLE ${amount.toLocaleString()}</span>
                `).join('')}
              </div>
            ` : ''}
            
            ${columns.length > 0 && rows.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row, rowIdx) => {
                    const isTotal = row[0]?.toString().toLowerCase().includes('total') || 
                                   row[0]?.toString().toLowerCase().includes('net');
                    return `
                      <tr class="${isTotal ? 'totals-row' : ''}">
                        ${(Array.isArray(row) ? row : Object.values(row)).map((cell, cellIdx) => {
                          const isAmount = columns[cellIdx]?.toLowerCase().includes('amount') || 
                                          columns[cellIdx]?.toLowerCase().includes('value') ||
                                          columns[cellIdx]?.toLowerCase().includes('price') ||
                                          columns[cellIdx]?.toLowerCase().includes('pay') ||
                                          columns[cellIdx]?.toLowerCase().includes('total');
                          const isStatus = columns[cellIdx]?.toLowerCase().includes('status');
                          
                          let statusClass = '';
                          if (isStatus) {
                            const cellStr = cell?.toString().toLowerCase();
                            if (['paid', 'approved', 'completed', 'active', 'in stock'].some(s => cellStr?.includes(s))) {
                              statusClass = 'success';
                            } else if (['pending', 'low', 'warning'].some(s => cellStr?.includes(s))) {
                              statusClass = 'warning';
                            } else if (['rejected', 'cancelled', 'out', 'critical', 'expired'].some(s => cellStr?.includes(s))) {
                              statusClass = 'danger';
                            } else {
                              statusClass = 'info';
                            }
                          }
                          
                          return `<td class="${isAmount ? 'amount' : ''}">
                            ${isStatus ? `<span class="status-badge ${statusClass}">${cell}</span>` : cell}
                          </td>`;
                        }).join('')}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: #666; padding: 40px;">No data available</p>'}
          </div>
          
          ${footer ? `
            <div class="footer">
              <div class="thanks">Thank you for using BFSE Management System</div>
              <div class="pride">Proudly serving businesses in Sierra Leone</div>
              <div class="sl-flag">🇸🇱</div>
            </div>
          ` : ''}
        </div>
        <div class="watermark">BFSE Management System</div>
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