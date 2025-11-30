// Sierra Leone themed export styles for PDF/Print exports
export const getSierraLeoneStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
    background: #ffffff;
    padding: 0;
    color: #1a1a2e;
    line-height: 1.6;
  }
  .document {
    max-width: 100%;
    margin: 0 auto;
    background: white;
    position: relative;
  }
  .flag-stripe {
    height: 12px;
    display: flex;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .flag-stripe .green { 
    flex: 1; 
    background: #1EB053; 
  }
  .flag-stripe .white { 
    flex: 1; 
    background: #FFFFFF; 
  }
  .flag-stripe .blue { 
    flex: 1; 
    background: #0072C6; 
  }
  .header {
    background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 50%, #0F1F3C 100%);
    color: white;
    padding: 40px 48px;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(30,176,83,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .header::after {
    content: '';
    position: absolute;
    top: -30%;
    left: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(0,114,198,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .header .org-logo {
    width: 85px;
    height: 85px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
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
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .header .org-name {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 6px;
    letter-spacing: -0.8px;
    text-shadow: 0 3px 8px rgba(0,0,0,0.2);
    position: relative;
    z-index: 1;
  }
  .header .tagline {
    font-size: 13px;
    opacity: 0.95;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    font-weight: 600;
    position: relative;
    z-index: 1;
  }
  .header .address {
    font-size: 14px;
    opacity: 0.92;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .header .address span {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.1);
    padding: 6px 12px;
    border-radius: 6px;
    backdrop-filter: blur(10px);
  }
  .report-title {
    background: linear-gradient(135deg, rgba(30,176,83,0.08) 0%, rgba(0,114,198,0.05) 100%);
    color: #0F1F3C;
    padding: 24px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid;
    border-image: linear-gradient(90deg, #1EB053 0%, #0072C6 100%) 1;
  }
  .report-title h1 {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .report-title .date {
    font-size: 13px;
    color: #64748b;
    background: white;
    padding: 8px 18px;
    border-radius: 24px;
    font-weight: 600;
    border: 2px solid #e2e8f0;
  }
  .content {
    padding: 48px;
    background: white;
  }
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
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 24px 20px;
    text-align: center;
    border: 2px solid #e2e8f0;
    border-top: 6px solid #1EB053;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, rgba(30,176,83,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .summary-card:nth-child(2) { border-top-color: #0072C6; }
  .summary-card:nth-child(2)::before { background: linear-gradient(180deg, rgba(0,114,198,0.05) 0%, transparent 60%); }
  .summary-card:nth-child(3) { border-top-color: #D4AF37; }
  .summary-card:nth-child(3)::before { background: linear-gradient(180deg, rgba(212,175,55,0.05) 0%, transparent 60%); }
  .summary-card:nth-child(4) { border-top-color: #0F1F3C; }
  .summary-card:nth-child(4)::before { background: linear-gradient(180deg, rgba(15,31,60,0.05) 0%, transparent 60%); }
  .summary-card.highlight-green { border-top-color: #1EB053; background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); border-color: #d1fae5; }
  .summary-card.highlight-red { border-top-color: #EF4444; background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border-color: #fecaca; }
  .summary-card.highlight-gold { border-top-color: #D4AF37; background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-color: #fef3c7; }
  .summary-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  .summary-value {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -1px;
    position: relative;
    z-index: 1;
  }
  .summary-card:first-child .summary-value { 
    background: linear-gradient(135deg, #1EB053 0%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .summary-card:nth-child(2) .summary-value { 
    background: linear-gradient(135deg, #0072C6 0%, #0F1F3C 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .summary-card:nth-child(3) .summary-value { 
    background: linear-gradient(135deg, #D4AF37 0%, #b8941f 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .summary-card:nth-child(4) .summary-value { color: #0F1F3C; }
  .summary-card.highlight-green .summary-value { color: #059669; }
  .summary-card.highlight-red .summary-value { color: #dc2626; }
  .summary-subtitle {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
    position: relative;
    z-index: 1;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 28px;
    font-size: 13px;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 2px solid #e2e8f0;
  }
  thead {
    background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%);
  }
  th {
    color: white;
    padding: 18px 16px;
    text-align: left;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1.2px;
    border-bottom: 3px solid #1EB053;
  }
  th:first-child { border-radius: 0; }
  th:last-child { border-radius: 0; text-align: right; }
  td {
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
    background: white;
    font-size: 13px;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  tr:last-child td {
    border-bottom: 2px solid #e2e8f0;
  }
  tr:hover td {
    background: #f0f9ff;
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
    background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 50%, #0F1F3C 100%);
    color: white;
    padding: 36px 48px;
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
    height: 6px;
    background: linear-gradient(90deg, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .footer::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(30,176,83,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .footer .thanks {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
  }
  .footer .pride {
    font-size: 14px;
    opacity: 0.92;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }
  .footer .sl-flag {
    margin-top: 18px;
    font-size: 42px;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
    position: relative;
    z-index: 1;
  }
  .footer .generated-info {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid rgba(255,255,255,0.2);
    font-size: 11px;
    opacity: 0.8;
    position: relative;
    z-index: 1;
    letter-spacing: 0.3px;
  }
  .section-title {
    font-size: 18px;
    font-weight: 800;
    color: #0F1F3C;
    margin: 40px 0 20px 0;
    padding: 16px 20px;
    background: linear-gradient(90deg, rgba(30,176,83,0.1) 0%, rgba(0,114,198,0.05) 100%);
    border-left: 6px solid;
    border-image: linear-gradient(180deg, #1EB053 0%, #0072C6 100%) 1;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 0 8px 8px 0;
  }
  .section-title::before {
    content: '📊';
    font-size: 20px;
  }
  .totals-row {
    background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%) !important;
    color: white !important;
    font-weight: 800;
    font-size: 14px !important;
  }
  .totals-row td {
    border: none;
    padding: 20px 16px;
    background: transparent !important;
    color: white;
    border-top: 3px solid #1EB053 !important;
  }
  .category-breakdown {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
    padding: 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border-radius: 12px;
    border: 2px solid #e2e8f0;
  }
  .category-tag {
    background: white;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    border-left: 5px solid #1EB053;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .category-tag strong {
    color: #0F1F3C;
    font-weight: 700;
  }
  .category-tag:nth-child(2n) { border-left-color: #0072C6; }
  .category-tag:nth-child(3n) { border-left-color: #D4AF37; }
  .category-tag:nth-child(4n) { border-left-color: #0F1F3C; }
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
    .flag-stripe { height: 12px !important; display: flex !important; }
    .flag-stripe .green { background: #1EB053 !important; }
    .flag-stripe .white { background: #FFFFFF !important; }
    .flag-stripe .blue { background: #0072C6 !important; }
    .header { 
      background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%) !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      page-break-after: avoid;
    }
    .report-title {
      background: linear-gradient(135deg, rgba(30,176,83,0.08) 0%, rgba(0,114,198,0.05) 100%) !important;
      color: #0F1F3C !important;
      border-bottom: 4px solid !important;
      border-image: linear-gradient(90deg, #1EB053 0%, #0072C6 100%) 1 !important;
      page-break-after: avoid;
    }
    .content {
      page-break-inside: avoid;
    }
    thead { 
      background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%) !important; 
      -webkit-print-color-adjust: exact !important;
    }
    th { 
      background: transparent !important;
      color: white !important;
      border-bottom: 3px solid #1EB053 !important;
      -webkit-print-color-adjust: exact !important;
    }
    tr:nth-child(even) td { background-color: #f8fafc !important; }
    .summary-card { 
      background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%) !important; 
      border-top: 6px solid #1EB053 !important;
      box-shadow: none !important;
      border: 2px solid #e2e8f0 !important;
      page-break-inside: avoid;
    }
    .summary-card:nth-child(2) { border-top-color: #0072C6 !important; }
    .summary-card:nth-child(3) { border-top-color: #D4AF37 !important; }
    .summary-card:nth-child(4) { border-top-color: #0F1F3C !important; }
    .summary-card.highlight-green { border-top-color: #1EB053 !important; background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%) !important; }
    .summary-card.highlight-red { border-top-color: #EF4444 !important; background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%) !important; }
    .summary-card.highlight-gold { border-top-color: #D4AF37 !important; background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%) !important; }
    .footer { 
      background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%) !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      page-break-before: avoid;
    }
    .totals-row { 
      background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%) !important; 
      -webkit-print-color-adjust: exact !important;
    }
    .totals-row td { background: transparent !important; color: white !important; }
    .status-badge.success { background: #ecfdf5 !important; color: #059669 !important; border: 1px solid #d1fae5 !important; }
    .status-badge.warning { background: #fffbeb !important; color: #d97706 !important; border: 1px solid #fef3c7 !important; }
    .status-badge.danger { background: #fef2f2 !important; color: #dc2626 !important; border: 1px solid #fecaca !important; }
    .status-badge.info { background: #eff6ff !important; color: #0072C6 !important; border: 1px solid #dbeafe !important; }
    table { box-shadow: none !important; page-break-inside: auto; }
    tbody tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    .watermark { display: none; }
    .section-title {
      background: linear-gradient(90deg, rgba(30,176,83,0.1) 0%, rgba(0,114,198,0.05) 100%) !important;
      -webkit-print-color-adjust: exact !important;
    }
    .category-breakdown {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
      -webkit-print-color-adjust: exact !important;
    }
    .notes-section {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
      border-left: 4px solid #D4AF37 !important;
      -webkit-print-color-adjust: exact !important;
    }
  }
  @page {
    margin: 15mm;
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
            <div class="org-name">${organisation?.name || 'Organisation'}</div>
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
              <div class="thanks">Thank you for using ${organisation?.name || 'Our'} Management System</div>
              <div class="pride">Proudly serving businesses across Sierra Leone 🇸🇱</div>
              <div class="sl-flag">🇸🇱</div>
              <div class="generated-info">
                Report generated on ${generatedDate} | Document ID: ${Date.now().toString(36).toUpperCase()}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="watermark">🇸🇱 ${organisation?.name || 'Management'}</div>
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

export const exportToCSV = (columns, rows, filename, organisation = null) => {
  let csvContent = '';
  
  // Add organisation header if provided
  if (organisation) {
    csvContent += `"${organisation.name || 'Organisation'}"\n`;
    if (organisation.address) csvContent += `"${organisation.address}${organisation.city ? ', ' + organisation.city : ''}"\n`;
    if (organisation.phone) csvContent += `"Phone: ${organisation.phone}"\n`;
    if (organisation.email) csvContent += `"Email: ${organisation.email}"\n`;
    csvContent += `"Generated: ${new Date().toLocaleString('en-GB')}"\n`;
    csvContent += '\n'; // Empty row before data
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