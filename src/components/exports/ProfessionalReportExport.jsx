import React from "react";
import { format } from "date-fns";
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "./UnifiedPDFStyles";
import { base44 } from "@/api/base44Client";

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
  const primaryColor = org.primary_color || '#1EB053';
  const secondaryColor = org.secondary_color || '#0072C6';
  const navyColor = '#0F1F3C';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${orgName}</title>
        <style>
          ${getUnifiedPDFStyles(org, 'report')}
          
          /* Additional report-specific overrides */
          :root {
            --sl-green: ${primaryColor};
            --sl-blue: ${secondaryColor};
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
        </style>
      </head>
      <body>
        <div class="document">
          ${getUnifiedHeader(org, title, reportId, generatedDate, 'report')}
          
          <!-- Title/Subtitle Bar -->
          ${subtitle || dateRange ? `
          <div class="info-bar">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              ${subtitle ? `<p>${subtitle}</p>` : ''}
              ${dateRange ? `<p><strong>Period:</strong> ${dateRange}</p>` : ''}
            </div>
          </div>
          ` : ''}
          
          <!-- Content -->
          <div class="content">
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
                sectionHTML += `
                  <div class="section-title">
                    <div class="icon">${section.icon || '📋'}</div>
                    ${section.title}
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
                sectionHTML += `
                  <div class="note-box">
                    <h4>${section.infoBox.title}</h4>
                    <p>${section.infoBox.content}</p>
                  </div>
                `;
              }
              
              if (section.table) {
                sectionHTML += `
                  <table class="data-table">
                    <thead>
                      <tr>
                        ${section.table.columns.map((col, i) => `<th class="${i === section.table.columns.length - 1 ? 'amount' : ''}">${col}</th>`).join('')}
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
                              const isAmount = colName.includes('amount') || colName.includes('pay') || colName.includes('total') || colName.includes('sle') || colName.includes('cost');
                              const isStatus = colName.includes('status');
                              
                              let cellContent = cell ?? '-';
                              
                              if (isStatus && cell) {
                                const statusLower = cell.toString().toLowerCase();
                                let badgeClass = 'info';
                                if (['paid', 'approved', 'completed', 'active', 'present'].some(s => statusLower.includes(s))) badgeClass = 'success';
                                else if (['pending', 'draft', 'warning', 'late'].some(s => statusLower.includes(s))) badgeClass = 'warning';
                                else if (['rejected', 'cancelled', 'failed', 'absent'].some(s => statusLower.includes(s))) badgeClass = 'danger';
                                cellContent = `<span class="badge ${badgeClass}">${cell}</span>`;
                              }
                              
                              return `<td class="${isAmount ? 'amount' : ''}">${cellContent}</td>`;
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
          
          ${footer ? getUnifiedFooter(org) : ''}
        </div>
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