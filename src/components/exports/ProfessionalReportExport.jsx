import React from "react";
import { format } from "date-fns";
import { generateUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter, generateSummaryCards, generateTable } from "./UnifiedPDFStyles";

// Modern Professional Report Generator - Uses unified receipt-style design
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
  reportType = 'standard'
}) => {
  const generatedDate = format(new Date(), 'MMMM d, yyyy • h:mm a');
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  
  const org = organisation || {};
  const orgName = org.name || 'Business Report';
  const orgInitials = orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const orgAddress = org.address || '';
  const orgCity = org.city || '';
  const orgCountry = org.country || 'Sierra Leone';
  const orgPhone = org.phone || '';
  const orgEmail = org.email || '';
  const orgTIN = org.tin_number || '';
  const orgLogo = org.logo_url || '';

  // Use unified PDF styles for consistent receipt-like design
  const unifiedStyles = getUnifiedPDFStyles(organisation, 'report');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${orgName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #0f172a;
            --primary-light: #1e293b;
            --accent: ${org.secondary_color || '#0072C6'};
            --accent-light: #60a5fa;
            --success: ${org.primary_color || '#1EB053'};
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
            --sl-green: ${org.primary_color || '#1EB053'};
            --sl-blue: ${org.secondary_color || '#0072C6'};
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
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            min-height: 297mm;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          }
          
          /* Modern Header */
          .report-header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .header-accent {
            height: 4px;
            background: linear-gradient(90deg, var(--sl-green), var(--sl-blue));
          }
          
          .header-bg-pattern {
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
          
          .header-content {
            padding: 40px 48px;
            position: relative;
            z-index: 1;
          }
          
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .org-brand {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .org-logo-wrapper {
            width: 64px;
            height: 64px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          }
          
          .org-logo-wrapper img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
          }
          
          .org-logo-wrapper .initials {
            font-size: 22px;
            font-weight: 800;
            background: linear-gradient(135deg, var(--sl-green), var(--sl-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .org-info h1 {
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
          }
          
          .org-info .location {
            font-size: 13px;
            opacity: 0.8;
            font-weight: 500;
          }
          
          .header-meta {
            text-align: right;
          }
          
          .header-meta .date {
            font-size: 13px;
            opacity: 0.8;
            margin-bottom: 4px;
          }
          
          .header-meta .report-id {
            font-size: 11px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            opacity: 0.6;
            background: rgba(255,255,255,0.1);
            padding: 4px 12px;
            border-radius: 6px;
          }
          
          /* Title Section */
          .title-section {
            padding: 32px 48px;
            background: linear-gradient(180deg, var(--gray-50) 0%, white 100%);
            border-bottom: 1px solid var(--gray-200);
          }
          
          .title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .report-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .title-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--sl-green), var(--sl-blue));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .title-text h2 {
            font-size: 24px;
            font-weight: 700;
            color: var(--gray-900);
            letter-spacing: -0.5px;
          }
          
          .title-text .subtitle {
            font-size: 14px;
            color: var(--gray-500);
            margin-top: 2px;
          }
          
          .date-badge {
            background: white;
            border: 1px solid var(--gray-200);
            padding: 10px 20px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 600;
            color: var(--gray-700);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }
          
          /* Content */
          .report-content {
            padding: 40px 48px;
          }
          
          /* Summary Cards - Modern Glass Style */
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }
          
          .summary-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            position: relative;
            border: 1px solid var(--gray-100);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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
          .summary-card.highlight-blue::before { background: var(--accent); }
          
          .summary-card .label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--gray-400);
            margin-bottom: 12px;
          }
          
          .summary-card .value {
            font-size: 32px;
            font-weight: 800;
            color: var(--gray-900);
            letter-spacing: -1px;
            line-height: 1;
          }
          
          .summary-card:first-child .value { color: var(--sl-green); }
          .summary-card:nth-child(2) .value { color: var(--sl-blue); }
          .summary-card:nth-child(3) .value { color: #f59e0b; }
          .summary-card:nth-child(4) .value { color: #8b5cf6; }
          .summary-card.highlight-green .value { color: var(--success); }
          .summary-card.highlight-red .value { color: var(--danger); }
          
          .summary-card .subtext {
            font-size: 12px;
            color: var(--gray-400);
            margin-top: 8px;
          }
          
          /* Section Headers */
          .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 40px 0 20px 0;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--gray-100);
          }
          
          .section-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--gray-100), var(--gray-50));
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          
          .section-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: var(--gray-800);
          }
          
          /* Modern Tables */
          .table-wrapper {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid var(--gray-200);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            margin: 16px 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
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
          
          .amount-cell {
            text-align: right;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-weight: 600;
            font-size: 13px;
          }
          
          .positive { color: var(--success); }
          .negative { color: var(--danger); }
          
          .total-row {
            background: var(--gray-900) !important;
          }
          
          .total-row td {
            color: white !important;
            font-weight: 700;
            font-size: 14px;
            border: none;
            background: transparent !important;
          }
          
          .total-row:hover td {
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
          
          .status-success { background: #ecfdf5; color: #059669; }
          .status-warning { background: #fffbeb; color: #d97706; }
          .status-danger { background: #fef2f2; color: #dc2626; }
          .status-info { background: #eff6ff; color: #3b82f6; }
          
          /* Info Boxes */
          .info-box {
            padding: 20px 24px;
            border-radius: 12px;
            margin: 20px 0;
            display: flex;
            gap: 16px;
          }
          
          .info-box.success {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border: 1px solid #a7f3d0;
          }
          
          .info-box.warning {
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
            border: 1px solid #fde68a;
          }
          
          .info-box.info {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border: 1px solid #bfdbfe;
          }
          
          .info-box-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          }
          
          .info-box.success .info-box-icon { background: #d1fae5; }
          .info-box.warning .info-box-icon { background: #fef3c7; }
          .info-box.info .info-box-icon { background: #dbeafe; }
          
          .info-box-content h4 {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
            color: var(--gray-800);
          }
          
          .info-box-content p, .info-box-content li {
            font-size: 13px;
            color: var(--gray-600);
            line-height: 1.6;
          }
          
          /* Breakdown Grid */
          .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            margin: 20px 0;
          }
          
          .breakdown-item {
            background: var(--gray-50);
            padding: 16px 20px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--gray-100);
          }
          
          .breakdown-item .label {
            font-size: 13px;
            color: var(--gray-600);
            font-weight: 500;
          }
          
          .breakdown-item .value {
            font-size: 15px;
            font-weight: 700;
            color: var(--gray-800);
          }
          
          /* Footer */
          .report-footer {
            background: var(--gray-900);
            color: white;
            padding: 40px 48px;
            margin-top: 48px;
          }
          
          .footer-accent {
            height: 4px;
            background: linear-gradient(90deg, var(--sl-green), var(--sl-blue));
            margin-bottom: 0;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .footer-brand {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .footer-logo {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 16px;
            color: var(--gray-900);
          }
          
          .footer-info h4 {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .footer-info p {
            font-size: 13px;
            opacity: 0.7;
          }
          
          .footer-meta {
            text-align: right;
            font-size: 12px;
            opacity: 0.6;
          }
          
          .footer-meta .gen-date {
            margin-bottom: 4px;
          }
          
          .footer-meta .report-id {
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            background: rgba(255,255,255,0.1);
            padding: 4px 12px;
            border-radius: 6px;
            display: inline-block;
          }
          
          /* Watermark */
          .watermark {
            position: fixed;
            bottom: 16px;
            right: 24px;
            font-size: 11px;
            color: var(--gray-300);
            display: flex;
            align-items: center;
            gap: 6px;
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
            
            thead {
              display: table-header-group;
            }
            
            tbody tr {
              page-break-inside: avoid;
            }
            
            .summary-card {
              page-break-inside: avoid;
            }
            
            .section-header {
              page-break-after: avoid;
            }
            
            .table-wrapper {
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
            margin: 10mm;
            size: A4 portrait;
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Header -->
          <div class="report-header">
            <div class="header-accent"></div>
            <div class="header-bg-pattern"></div>
            <div class="header-content">
              <div class="header-row">
                <div class="org-brand">
                  <div class="org-logo-wrapper">
                    ${orgLogo 
                      ? `<img src="${orgLogo}" alt="${orgName}">` 
                      : `<span class="initials">${orgInitials}</span>`
                    }
                  </div>
                  <div class="org-info">
                    <h1>${orgName}</h1>
                    <div class="location">${orgAddress ? orgAddress + (orgCity ? ', ' + orgCity : '') : orgCountry}</div>
                  </div>
                </div>
                <div class="header-meta">
                  <div class="date">${generatedDate}</div>
                  <div class="report-id">${reportId}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Title Section -->
          <div class="title-section">
            <div class="title-row">
              <div class="report-title">
                <div class="title-icon">📊</div>
                <div class="title-text">
                  <h2>${title}</h2>
                  ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
                </div>
              </div>
              ${dateRange ? `<div class="date-badge">📅 ${dateRange}</div>` : ''}
            </div>
          </div>
          
          <!-- Content -->
          <div class="report-content">
            ${summaryCards.length > 0 ? `
              <div class="summary-grid">
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
                sectionHTML += `
                  <div class="section-header">
                    <div class="section-icon">${section.icon || '📋'}</div>
                    <h3>${section.title}</h3>
                  </div>
                `;
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
                const infoIcon = section.infoBox.type === 'success' ? '✅' : section.infoBox.type === 'warning' ? '⚠️' : 'ℹ️';
                sectionHTML += `
                  <div class="info-box ${section.infoBox.type || 'info'}">
                    <div class="info-box-icon">${infoIcon}</div>
                    <div class="info-box-content">
                      <h4>${section.infoBox.title}</h4>
                      <div>${section.infoBox.content}</div>
                    </div>
                  </div>
                `;
              }
              
              if (section.table) {
                sectionHTML += `
                  <div class="table-wrapper">
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
                                const colName = section.table.columns[cellIdx]?.toLowerCase() || '';
                                const isAmount = colName.includes('amount') ||
                                               colName.includes('pay') ||
                                               colName.includes('revenue') ||
                                               colName.includes('tax') ||
                                               colName.includes('cost') ||
                                               colName.includes('total') ||
                                               colName.includes('sle') ||
                                               colName.includes('net');
                                const isStatus = colName.includes('status');
                                
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
                  </div>
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
            <div class="footer-accent"></div>
            <div class="report-footer">
              <div class="footer-content">
                <div class="footer-brand">
                  <div class="footer-logo">${orgInitials}</div>
                  <div class="footer-info">
                    <h4>${orgName}</h4>
                    <p>${orgPhone ? orgPhone : ''} ${orgPhone && orgEmail ? '•' : ''} ${orgEmail ? orgEmail : ''}</p>
                  </div>
                </div>
                <div class="footer-meta">
                  <div class="gen-date">Generated: ${generatedDate}</div>
                  <div class="report-id">${reportId}</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        ${watermark ? `<div class="watermark">📄 ${orgName}</div>` : ''}
      </body>
    </html>
  `;
};

export const printProfessionalReport = (html, filename = 'report') => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 400);
};

export const downloadProfessionalReportAsPDF = async (html, filename = 'report') => {
  const pdfWindow = window.open('', '_blank', 'width=900,height=800');
  
  if (!pdfWindow) {
    alert('Please allow popups to download the PDF report');
    return;
  }
  
  pdfWindow.document.write(html);
  pdfWindow.document.close();
  pdfWindow.document.title = filename;
  
  setTimeout(() => {
    pdfWindow.print();
  }, 500);
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