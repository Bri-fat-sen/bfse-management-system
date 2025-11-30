import React from "react";
import { format } from "date-fns";

// Professional Sierra Leone themed report generator
export const generateProfessionalReport = ({
  title,
  subtitle,
  organisation,
  dateRange,
  summaryCards = [],
  sections = [],
  charts = [],
  footer = true,
  watermark = true,
  reportType = 'standard' // standard, financial, compliance, hr
}) => {
  const generatedDate = format(new Date(), 'MMMM d, yyyy • h:mm a');
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 3);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${organisation?.name || 'Report'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --sl-green: #1EB053;
            --sl-white: #FFFFFF;
            --sl-blue: #0072C6;
            --sl-navy: #0F1F3C;
            --sl-gold: #D4AF37;
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
            font-size: 13px;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            min-height: 297mm;
            position: relative;
          }
          
          /* Premium Header */
          .report-header {
            background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 40%, var(--sl-navy) 100%);
            color: white;
            padding: 0;
            position: relative;
            overflow: hidden;
          }
          
          .header-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.6;
          }
          
          .flag-bar {
            height: 8px;
            display: flex;
          }
          .flag-bar > div { flex: 1; }
          .flag-bar .green { background: var(--sl-green); }
          .flag-bar .white { background: var(--sl-white); }
          .flag-bar .blue { background: var(--sl-blue); }
          
          .header-content {
            padding: 32px 40px;
            position: relative;
            z-index: 1;
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          
          .org-branding {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .org-logo {
            width: 72px;
            height: 72px;
            background: white;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          
          .org-logo span {
            background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .org-details h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
          }
          
          .org-details .tagline {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.85;
            font-weight: 600;
          }
          
          .org-contact {
            display: flex;
            gap: 16px;
            margin-top: 10px;
            font-size: 12px;
            opacity: 0.9;
          }
          
          .org-contact span {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.15);
            padding: 5px 12px;
            border-radius: 6px;
            font-weight: 500;
          }
          
          .org-contact {
            flex-wrap: wrap;
          }
          
          .header-flag {
            font-size: 48px;
            opacity: 0.3;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          }
          
          /* Report Title Section */
          .report-title-section {
            background: linear-gradient(90deg, rgba(30,176,83,0.06) 0%, rgba(0,114,198,0.04) 100%);
            padding: 24px 40px;
            border-bottom: 4px solid;
            border-image: linear-gradient(90deg, var(--sl-green) 0%, var(--sl-blue) 100%) 1;
          }
          
          .report-title-inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .report-title h2 {
            font-size: 22px;
            font-weight: 700;
            color: var(--sl-navy);
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .report-title h2::before {
            content: '📊';
            font-size: 24px;
          }
          
          .report-title .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          
          .report-meta .date-range {
            font-weight: 600;
            color: var(--sl-navy);
            background: white;
            padding: 6px 14px;
            border-radius: 20px;
            border: 2px solid #e2e8f0;
            display: inline-block;
          }
          
          .report-meta .report-id {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 6px;
          }
          
          /* Content Area */
          .report-content {
            padding: 40px;
          }
          
          /* Summary Cards */
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 36px;
          }
          
          .summary-card {
            background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
            border: 2px solid #e2e8f0;
            border-top: 6px solid var(--sl-green);
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
            position: relative;
          }
          
          .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: linear-gradient(180deg, rgba(30,176,83,0.04) 0%, transparent 60%);
            border-radius: 0 0 10px 10px;
            pointer-events: none;
          }
          
          .summary-card:nth-child(2) { border-top-color: var(--sl-blue); }
          .summary-card:nth-child(2)::before { background: linear-gradient(180deg, rgba(0,114,198,0.04) 0%, transparent 60%); }
          .summary-card:nth-child(3) { border-top-color: var(--sl-gold); }
          .summary-card:nth-child(3)::before { background: linear-gradient(180deg, rgba(212,175,55,0.04) 0%, transparent 60%); }
          .summary-card:nth-child(4) { border-top-color: var(--sl-navy); }
          .summary-card:nth-child(4)::before { background: linear-gradient(180deg, rgba(15,31,60,0.04) 0%, transparent 60%); }
          
          .summary-card.highlight-green { background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); border-color: #d1fae5; }
          .summary-card.highlight-red { background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border-color: #fecaca; border-top-color: #ef4444; }
          .summary-card.highlight-blue { background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); border-color: #dbeafe; }
          
          .summary-card .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
          }
          
          .summary-card .value {
            font-size: 26px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -1px;
            position: relative;
            z-index: 1;
          }
          
          .summary-card:first-child .value { color: var(--sl-green); }
          .summary-card:nth-child(2) .value { color: var(--sl-blue); }
          .summary-card:nth-child(3) .value { color: var(--sl-gold); }
          .summary-card:nth-child(4) .value { color: var(--sl-navy); }
          .summary-card.highlight-red .value { color: #dc2626; }
          
          .summary-card .subtext {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 6px;
            position: relative;
            z-index: 1;
          }
          
          /* Section Titles */
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--sl-navy);
            margin: 32px 0 16px 0;
            padding: 14px 18px;
            background: linear-gradient(90deg, rgba(30,176,83,0.08) 0%, rgba(0,114,198,0.04) 100%);
            border-left: 6px solid;
            border-image: linear-gradient(180deg, var(--sl-green) 0%, var(--sl-blue) 100%) 1;
            border-radius: 0 8px 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            border: 2px solid #e2e8f0;
          }
          
          thead {
            background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%);
          }
          
          th {
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            border-bottom: 3px solid var(--sl-green);
          }
          
          th:last-child {
            text-align: right;
          }
          
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e2e8f0;
            background: white;
          }
          
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          .amount-cell {
            text-align: right;
            font-family: 'Monaco', 'Consolas', monospace;
            font-weight: 600;
          }
          
          .positive { color: var(--sl-green); }
          .negative { color: #dc2626; }
          
          .total-row {
            background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%) !important;
          }
          
          .total-row td {
            color: white;
            font-weight: 700;
            font-size: 13px;
            border: none;
            background: transparent !important;
            border-top: 3px solid var(--sl-green);
          }
          
          /* Status Badges */
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }
          
          .status-success { background: #ecfdf5; color: #059669; }
          .status-warning { background: #fffbeb; color: #d97706; }
          .status-danger { background: #fef2f2; color: #dc2626; }
          .status-info { background: #eff6ff; color: var(--sl-blue); }
          
          /* Info Boxes */
          .info-box {
            padding: 16px 20px;
            border-radius: 10px;
            margin: 16px 0;
          }
          
          .info-box.success {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-left: 5px solid var(--sl-green);
          }
          
          .info-box.warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-left: 5px solid var(--sl-gold);
          }
          
          .info-box.info {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 5px solid var(--sl-blue);
          }
          
          .info-box h4 {
            font-weight: 700;
            font-size: 13px;
            margin-bottom: 6px;
          }
          
          .info-box p, .info-box li {
            font-size: 12px;
            color: #475569;
          }
          
          /* Breakdown Grid */
          .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 10px;
            margin: 16px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border: 2px solid #e2e8f0;
            border-radius: 10px;
          }
          
          .breakdown-item {
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 4px solid var(--sl-green);
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          }
          
          .breakdown-item:nth-child(2n) { border-left-color: var(--sl-blue); }
          .breakdown-item:nth-child(3n) { border-left-color: var(--sl-gold); }
          .breakdown-item:nth-child(4n) { border-left-color: var(--sl-navy); }
          
          .breakdown-item .label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          
          .breakdown-item .value {
            font-size: 13px;
            font-weight: 700;
            color: var(--sl-navy);
          }
          
          /* Footer */
          .report-footer {
            background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 50%, var(--sl-navy) 100%);
            color: white;
            padding: 32px 40px;
            margin-top: 40px;
            position: relative;
          }
          
          .report-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, var(--sl-green) 33.33%, var(--sl-white) 33.33%, var(--sl-white) 66.66%, var(--sl-blue) 66.66%);
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .footer-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .footer-flag {
            font-size: 48px;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          }
          
          .footer-text h4 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          
          .footer-text p {
            font-size: 12px;
            opacity: 0.9;
            line-height: 1.4;
          }
          
          .footer-meta {
            text-align: right;
            font-size: 11px;
            opacity: 0.7;
          }
          
          .footer-meta .report-id {
            font-family: 'Monaco', 'Consolas', monospace;
            background: rgba(255,255,255,0.1);
            padding: 4px 10px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 6px;
          }
          
          /* Watermark */
          .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 0.5;
          }
          
          /* Page Break */
          .page-break {
            page-break-before: always;
            margin-top: 40px;
          }
          
          /* Print Styles */
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
            
            .report-container {
              box-shadow: none;
              max-width: 100%;
            }
            
            .report-header {
              -webkit-print-color-adjust: exact !important;
            }
            
            .header-pattern {
              display: none;
            }
            
            thead {
              display: table-header-group;
              -webkit-print-color-adjust: exact !important;
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
            
            .info-box {
              page-break-inside: avoid;
            }
          }
          
          @page {
            margin: 12mm;
            size: A4 portrait;
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Header -->
          <div class="report-header">
            <div class="header-pattern"></div>
            <div class="flag-bar">
              <div class="green"></div>
              <div class="white"></div>
              <div class="blue"></div>
            </div>
            <div class="header-content">
              <div class="header-top">
                <div class="org-branding">
                  <div class="org-logo">
                    ${organisation?.logo_url 
                      ? `<img src="${organisation.logo_url}" alt="Logo" style="max-width:100%;max-height:100%;object-fit:contain;">` 
                      : `<span>${orgInitials}</span>`
                    }
                  </div>
                  <div class="org-details">
                    <h1>${organisation?.name || 'Business Report'}</h1>
                    <div class="tagline">${organisation?.country || 'Sierra Leone'} • Business Management</div>
                    <div class="org-contact">
                      ${organisation?.address || organisation?.city ? `<span>📍 ${organisation?.address || ''}${organisation?.address && organisation?.city ? ', ' : ''}${organisation?.city || ''}</span>` : '<span>📍 Sierra Leone</span>'}
                      ${organisation?.phone ? `<span>📞 ${organisation.phone}</span>` : ''}
                      ${organisation?.email ? `<span>✉️ ${organisation.email}</span>` : ''}
                      ${organisation?.tin_number ? `<span>🏛️ TIN: ${organisation.tin_number}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="header-flag">🇸🇱</div>
              </div>
            </div>
          </div>
          
          <!-- Report Title -->
          <div class="report-title-section">
            <div class="report-title-inner">
              <div class="report-title">
                <h2>${title}</h2>
                ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
              </div>
              <div class="report-meta">
                ${dateRange ? `<div class="date-range">📅 ${dateRange}</div>` : ''}
                <div class="report-id">Report ID: ${reportId}</div>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="report-content">
            ${summaryCards.length > 0 ? `
              <div class="summary-cards">
                ${summaryCards.map((card, idx) => `
                  <div class="summary-card ${card.highlight ? `highlight-${card.highlight}` : ''}">
                    <div class="label">${card.label}</div>
                    <div class="value">${card.value}</div>
                    ${card.subtext ? `<div class="subtext">${card.subtext}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.map(section => {
              let sectionHTML = '';
              
              if (section.title) {
                sectionHTML += `<div class="section-title">${section.icon || '📋'} ${section.title}</div>`;
              }
              
              if (section.breakdown) {
                sectionHTML += `
                  <div class="breakdown-grid">
                    ${Object.entries(section.breakdown).map(([key, val]) => `
                      <div class="breakdown-item">
                        <span class="label">${key}</span>
                        <span class="value">${typeof val === 'number' ? `SLE ${val.toLocaleString()}` : val}</span>
                      </div>
                    `).join('')}
                  </div>
                `;
              }
              
              if (section.infoBox) {
                sectionHTML += `
                  <div class="info-box ${section.infoBox.type || 'info'}">
                    <h4>${section.infoBox.title}</h4>
                    ${section.infoBox.content}
                  </div>
                `;
              }
              
              if (section.table) {
                sectionHTML += `
                  <table>
                    <thead>
                      <tr>
                        ${section.table.columns.map(col => `<th>${col}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${section.table.rows.map((row, rowIdx) => {
                        const isTotal = row[0]?.toString().toLowerCase().includes('total') || 
                                       row[0]?.toString().toLowerCase().includes('grand');
                        return `
                          <tr class="${isTotal ? 'total-row' : ''}">
                            ${row.map((cell, cellIdx) => {
                              const isAmount = section.table.columns[cellIdx]?.toLowerCase().includes('amount') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('pay') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('revenue') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('tax') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('cost') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('total') ||
                                             section.table.columns[cellIdx]?.toLowerCase().includes('sle');
                              const isStatus = section.table.columns[cellIdx]?.toLowerCase().includes('status');
                              
                              let cellClass = isAmount ? 'amount-cell' : '';
                              let cellContent = cell ?? '-';
                              
                              if (isStatus && cell) {
                                const statusLower = cell.toString().toLowerCase();
                                let statusClass = 'status-info';
                                if (['paid', 'approved', 'completed', 'active', 'success', 'present'].some(s => statusLower.includes(s))) {
                                  statusClass = 'status-success';
                                } else if (['pending', 'draft', 'warning', 'late'].some(s => statusLower.includes(s))) {
                                  statusClass = 'status-warning';
                                } else if (['rejected', 'cancelled', 'failed', 'absent', 'overdue'].some(s => statusLower.includes(s))) {
                                  statusClass = 'status-danger';
                                }
                                cellContent = `<span class="status-badge ${statusClass}">${cell}</span>`;
                              }
                              
                              return `<td class="${cellClass}">${cellContent}</td>`;
                            }).join('')}
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                `;
              }
              
              if (section.html) {
                sectionHTML += section.html;
              }
              
              return sectionHTML;
            }).join('')}
          </div>
          
          ${footer ? `
            <!-- Footer -->
            <div class="report-footer">
              <div class="footer-content">
                <div class="footer-left">
                  <div class="footer-flag">🇸🇱</div>
                  <div class="footer-text">
                    <h4>${organisation?.name || 'Business Report'}</h4>
                    <p>${organisation?.address ? organisation.address + (organisation?.city ? ', ' + organisation.city : '') : 'Sierra Leone'}</p>
                    <p style="font-size: 11px; opacity: 0.8; margin-top: 4px;">
                      ${organisation?.phone ? '📞 ' + organisation.phone : ''} 
                      ${organisation?.phone && organisation?.email ? ' • ' : ''}
                      ${organisation?.email ? '✉️ ' + organisation.email : ''}
                    </p>
                  </div>
                </div>
                <div class="footer-meta">
                  <div>Generated: ${generatedDate}</div>
                  <div class="report-id">${reportId}</div>
                  ${organisation?.tin_number ? `<div style="margin-top: 4px;">TIN: ${organisation.tin_number}</div>` : ''}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        ${watermark ? `<div class="watermark">🇸🇱 ${organisation?.name || 'Management System'}</div>` : ''}
      </body>
    </html>
  `;
};

export const printProfessionalReport = (html, filename = 'report') => {
  // Open in new window and trigger print-to-PDF
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Auto-trigger print dialog (user can save as PDF)
  setTimeout(() => {
    printWindow.print();
  }, 400);
};

export const downloadProfessionalReportAsPDF = async (html, filename = 'report') => {
  // Open the report in a new window for proper PDF generation
  const pdfWindow = window.open('', '_blank', 'width=900,height=800');
  
  if (!pdfWindow) {
    alert('Please allow popups to download the PDF report');
    return;
  }
  
  // Write HTML content
  pdfWindow.document.write(html);
  pdfWindow.document.close();
  
  // Set the document title for the PDF filename
  pdfWindow.document.title = filename;
  
  // Wait for content and fonts to load, then trigger print
  pdfWindow.onload = () => {
    setTimeout(() => {
      pdfWindow.print();
    }, 600);
  };
  
  // Fallback if onload doesn't fire
  setTimeout(() => {
    pdfWindow.print();
  }, 800);
};

export const downloadProfessionalReport = (html, filename) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  generate: generateProfessionalReport,
  print: printProfessionalReport,
  downloadPDF: downloadProfessionalReportAsPDF,
  download: downloadProfessionalReport
};