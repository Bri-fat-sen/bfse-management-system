import { format } from "date-fns";

// Professional Sierra Leone themed report generator
export const generateProfessionalReport = ({
  reportType,
  title,
  subtitle,
  organisation,
  dateRange,
  preparedBy,
  executiveSummary,
  keyMetrics = [],
  sections = [],
  charts = [],
  tables = [],
  insights = [],
  recommendations = [],
  footer = true
}) => {
  const generatedDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
  const orgInitials = (organisation?.name || 'ORG').split(' ').map(w => w[0]).join('').slice(0, 3);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    :root {
      --sl-green: #1EB053;
      --sl-white: #FFFFFF;
      --sl-blue: #0072C6;
      --sl-navy: #0F1F3C;
      --sl-gold: #D4AF37;
      --sl-light-green: #ecfdf5;
      --sl-light-blue: #eff6ff;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page {
      size: A4 portrait;
      margin: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #1a1a2e;
      line-height: 1.6;
      font-size: 11px;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 0;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Cover Page Styles */
    .cover-page {
      background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 40%, var(--sl-navy) 100%);
      color: white;
      display: flex;
      flex-direction: column;
      min-height: 297mm;
      position: relative;
      overflow: hidden;
    }
    
    .cover-page::before {
      content: '';
      position: absolute;
      top: -20%;
      right: -15%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(30,176,83,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    
    .cover-page::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -20%;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(0,114,198,0.15) 0%, transparent 70%);
      border-radius: 50%;
    }
    
    .cover-flag-top {
      height: 16px;
      display: flex;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .cover-flag-top .green { flex: 1; background: var(--sl-green); }
    .cover-flag-top .white { flex: 1; background: var(--sl-white); }
    .cover-flag-top .blue { flex: 1; background: var(--sl-blue); }
    
    .cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 50px;
      position: relative;
      z-index: 1;
    }
    
    .cover-logo {
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    
    .cover-logo span {
      font-size: 36px;
      font-weight: 900;
      background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .cover-org-name {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: -1px;
      margin-bottom: 8px;
      text-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .cover-tagline {
      font-size: 14px;
      opacity: 0.85;
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: 600;
      margin-bottom: 60px;
    }
    
    .cover-report-type {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
      padding: 12px 28px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      box-shadow: 0 6px 20px rgba(30,176,83,0.4);
    }
    
    .cover-title {
      font-size: 52px;
      font-weight: 900;
      letter-spacing: -2px;
      line-height: 1.1;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .cover-subtitle {
      font-size: 18px;
      opacity: 0.9;
      font-weight: 400;
      margin-bottom: 50px;
      max-width: 500px;
    }
    
    .cover-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
      margin-top: auto;
    }
    
    .cover-meta-item {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    
    .cover-meta-label {
      font-size: 10px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .cover-meta-value {
      font-size: 14px;
      font-weight: 700;
    }
    
    .cover-footer {
      padding: 30px 50px;
      background: rgba(0,0,0,0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    
    .cover-footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .cover-footer-flag {
      font-size: 32px;
    }
    
    .cover-footer-text {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .cover-footer-right {
      text-align: right;
    }
    
    .cover-confidential {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.6;
      font-weight: 600;
    }
    
    /* Content Page Styles */
    .content-page {
      padding: 0;
    }
    
    .page-header {
      background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%);
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
    }
    
    .page-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .page-header-logo {
      width: 45px;
      height: 45px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .page-header-logo span {
      font-size: 16px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .page-header-title {
      font-size: 16px;
      font-weight: 700;
    }
    
    .page-header-subtitle {
      font-size: 11px;
      opacity: 0.8;
    }
    
    .page-header-right {
      text-align: right;
    }
    
    .page-number {
      font-size: 11px;
      opacity: 0.8;
    }
    
    .flag-divider {
      height: 6px;
      display: flex;
    }
    
    .flag-divider .green { flex: 1; background: var(--sl-green); }
    .flag-divider .white { flex: 1; background: var(--sl-white); }
    .flag-divider .blue { flex: 1; background: var(--sl-blue); }
    
    .page-content {
      padding: 40px;
    }
    
    /* Section Styles */
    .section {
      margin-bottom: 35px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, var(--sl-green) 0%, var(--sl-blue) 100%) 1;
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--sl-navy);
      letter-spacing: -0.5px;
    }
    
    .section-subtitle {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    
    /* Executive Summary */
    .executive-summary {
      background: linear-gradient(135deg, rgba(30,176,83,0.08) 0%, rgba(0,114,198,0.05) 100%);
      border-left: 6px solid var(--sl-green);
      padding: 24px 28px;
      border-radius: 0 16px 16px 0;
      margin-bottom: 35px;
    }
    
    .executive-summary-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--sl-navy);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .executive-summary-text {
      font-size: 13px;
      line-height: 1.8;
      color: #334155;
    }
    
    /* Key Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 35px;
    }
    
    .metric-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: var(--sl-green);
    }
    
    .metric-card:nth-child(2)::before { background: var(--sl-blue); }
    .metric-card:nth-child(3)::before { background: var(--sl-gold); }
    .metric-card:nth-child(4)::before { background: var(--sl-navy); }
    
    .metric-card.positive { border-color: #d1fae5; background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%); }
    .metric-card.negative { border-color: #fecaca; background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); }
    .metric-card.warning { border-color: #fef3c7; background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%); }
    
    .metric-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 900;
      color: var(--sl-navy);
      letter-spacing: -1px;
      margin-bottom: 4px;
    }
    
    .metric-card:first-child .metric-value { color: var(--sl-green); }
    .metric-card:nth-child(2) .metric-value { color: var(--sl-blue); }
    .metric-card:nth-child(3) .metric-value { color: var(--sl-gold); }
    .metric-card.positive .metric-value { color: #059669; }
    .metric-card.negative .metric-value { color: #dc2626; }
    
    .metric-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    
    .metric-change {
      font-size: 11px;
      margin-top: 8px;
      padding: 4px 10px;
      border-radius: 12px;
      display: inline-block;
      font-weight: 600;
    }
    
    .metric-change.up { background: #ecfdf5; color: #059669; }
    .metric-change.down { background: #fef2f2; color: #dc2626; }
    
    /* Data Table */
    .data-table-container {
      margin-bottom: 30px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
    }
    
    .data-table-title {
      background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%);
      color: white;
      padding: 14px 20px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    .data-table thead {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
    
    .data-table th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 700;
      color: var(--sl-navy);
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.8px;
      border-bottom: 2px solid var(--sl-green);
    }
    
    .data-table th:last-child {
      text-align: right;
    }
    
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    
    .data-table tr:nth-child(even) {
      background: #fafbfc;
    }
    
    .data-table tr:hover {
      background: #f0f9ff;
    }
    
    .data-table .amount {
      text-align: right;
      font-weight: 700;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
    }
    
    .data-table .total-row {
      background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%) !important;
      color: white;
      font-weight: 800;
    }
    
    .data-table .total-row td {
      border: none;
      padding: 16px 12px;
    }
    
    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
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
    
    .status-badge.success { background: #ecfdf5; color: #059669; }
    .status-badge.warning { background: #fffbeb; color: #d97706; }
    .status-badge.danger { background: #fef2f2; color: #dc2626; }
    .status-badge.info { background: #eff6ff; color: #0072C6; }
    
    /* Chart Placeholder */
    .chart-container {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 25px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .chart-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--sl-navy);
    }
    
    .chart-legend {
      display: flex;
      gap: 16px;
    }
    
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #64748b;
    }
    
    .chart-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    
    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 150px;
      padding: 20px 0;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .chart-bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .chart-bar {
      width: 100%;
      max-width: 40px;
      border-radius: 6px 6px 0 0;
      transition: all 0.3s ease;
    }
    
    .chart-bar.primary { background: linear-gradient(180deg, var(--sl-green) 0%, #059669 100%); }
    .chart-bar.secondary { background: linear-gradient(180deg, var(--sl-blue) 0%, #0F1F3C 100%); }
    
    .chart-bar-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
    }
    
    /* Insights Box */
    .insights-box {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-left: 6px solid var(--sl-gold);
      border-radius: 0 14px 14px 0;
      padding: 22px 26px;
      margin-bottom: 25px;
    }
    
    .insights-title {
      font-size: 13px;
      font-weight: 800;
      color: #92400e;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .insights-list {
      list-style: none;
      padding: 0;
    }
    
    .insights-list li {
      font-size: 12px;
      color: #78350f;
      margin-bottom: 10px;
      padding-left: 24px;
      position: relative;
      line-height: 1.5;
    }
    
    .insights-list li::before {
      content: '💡';
      position: absolute;
      left: 0;
      top: 0;
    }
    
    /* Recommendations Box */
    .recommendations-box {
      background: linear-gradient(135deg, var(--sl-light-green) 0%, #d1fae5 100%);
      border-left: 6px solid var(--sl-green);
      border-radius: 0 14px 14px 0;
      padding: 22px 26px;
      margin-bottom: 25px;
    }
    
    .recommendations-title {
      font-size: 13px;
      font-weight: 800;
      color: #065f46;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .recommendations-list {
      list-style: none;
      padding: 0;
    }
    
    .recommendations-list li {
      font-size: 12px;
      color: #047857;
      margin-bottom: 10px;
      padding-left: 24px;
      position: relative;
      line-height: 1.5;
    }
    
    .recommendations-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      top: 0;
      font-weight: bold;
      color: var(--sl-green);
    }
    
    /* Page Footer */
    .page-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-top: 2px solid #e2e8f0;
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .page-footer-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .page-footer-flag {
      display: flex;
      width: 40px;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .page-footer-flag .green { flex: 1; background: var(--sl-green); }
    .page-footer-flag .white { flex: 1; background: var(--sl-white); border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .page-footer-flag .blue { flex: 1; background: var(--sl-blue); }
    
    .page-footer-text {
      font-size: 10px;
      color: #94a3b8;
    }
    
    .page-footer-right {
      text-align: right;
    }
    
    .page-footer-confidential {
      font-size: 9px;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Closing Page */
    .closing-page {
      background: linear-gradient(135deg, var(--sl-navy) 0%, #1a3a6e 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 297mm;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .closing-page::before {
      content: '';
      position: absolute;
      top: -30%;
      left: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(30,176,83,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    
    .closing-flag {
      font-size: 80px;
      margin-bottom: 30px;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    }
    
    .closing-thanks {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    
    .closing-org {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
    }
    
    .closing-contact {
      display: flex;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .closing-contact-item {
      background: rgba(255,255,255,0.1);
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 12px;
    }
    
    .closing-generated {
      font-size: 11px;
      opacity: 0.6;
      margin-top: 30px;
    }
    
    .closing-stripe {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 12px;
      display: flex;
    }
    
    .closing-stripe .green { flex: 1; background: var(--sl-green); }
    .closing-stripe .white { flex: 1; background: var(--sl-white); }
    .closing-stripe .blue { flex: 1; background: var(--sl-blue); }
    
    /* Print Styles */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        background: white !important;
      }
      
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
      
      .cover-page, .content-page, .closing-page {
        -webkit-print-color-adjust: exact !important;
      }
      
      .no-print {
        display: none !important;
      }
    }
  `;

  // Generate metric cards HTML
  const metricsHTML = keyMetrics.length > 0 ? `
    <div class="metrics-grid">
      ${keyMetrics.map((metric, idx) => `
        <div class="metric-card ${metric.trend || ''}">
          <div class="metric-icon">${metric.icon || ['📊', '💰', '📈', '🎯'][idx % 4]}</div>
          <div class="metric-value">${metric.value}</div>
          <div class="metric-label">${metric.label}</div>
          ${metric.change ? `<div class="metric-change ${metric.change > 0 ? 'up' : 'down'}">${metric.change > 0 ? '↑' : '↓'} ${Math.abs(metric.change)}%</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  // Generate tables HTML
  const tablesHTML = tables.map(table => `
    <div class="data-table-container">
      <div class="data-table-title">
        ${table.icon || '📋'} ${table.title}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            ${table.columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${table.rows.map((row, idx) => {
            const isTotal = (Array.isArray(row) ? row[0] : '').toString().toLowerCase().includes('total');
            return `
              <tr class="${isTotal ? 'total-row' : ''}">
                ${(Array.isArray(row) ? row : Object.values(row)).map((cell, cellIdx) => {
                  const isAmount = table.columns[cellIdx]?.toLowerCase().includes('amount') || 
                                  table.columns[cellIdx]?.toLowerCase().includes('value') ||
                                  table.columns[cellIdx]?.toLowerCase().includes('total');
                  const isStatus = table.columns[cellIdx]?.toLowerCase().includes('status');
                  
                  let statusClass = '';
                  if (isStatus && cell) {
                    const cellStr = cell.toString().toLowerCase();
                    if (['paid', 'approved', 'completed', 'active', 'present'].some(s => cellStr.includes(s))) statusClass = 'success';
                    else if (['pending', 'draft', 'scheduled'].some(s => cellStr.includes(s))) statusClass = 'warning';
                    else if (['rejected', 'cancelled', 'failed', 'absent'].some(s => cellStr.includes(s))) statusClass = 'danger';
                    else statusClass = 'info';
                  }
                  
                  return `<td class="${isAmount ? 'amount' : ''}">${isStatus && cell ? `<span class="status-badge ${statusClass}">${cell}</span>` : cell || '-'}</td>`;
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  // Generate insights HTML
  const insightsHTML = insights.length > 0 ? `
    <div class="insights-box">
      <div class="insights-title">💡 Key Insights</div>
      <ul class="insights-list">
        ${insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // Generate recommendations HTML
  const recommendationsHTML = recommendations.length > 0 ? `
    <div class="recommendations-box">
      <div class="recommendations-title">✅ Recommendations</div>
      <ul class="recommendations-list">
        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // Generate sections HTML
  const sectionsHTML = sections.map(section => `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${section.icon || '📊'}</div>
        <div>
          <div class="section-title">${section.title}</div>
          ${section.subtitle ? `<div class="section-subtitle">${section.subtitle}</div>` : ''}
        </div>
      </div>
      <div class="section-content">
        ${section.content || ''}
      </div>
    </div>
  `).join('');

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
        <!-- Cover Page -->
        <div class="page cover-page">
          <div class="cover-flag-top">
            <div class="green"></div>
            <div class="white"></div>
            <div class="blue"></div>
          </div>
          
          <div class="cover-content">
            <div class="cover-logo">
              <span>${orgInitials}</span>
            </div>
            <div class="cover-org-name">${organisation?.name || 'Organisation'}</div>
            <div class="cover-tagline">Business Management System</div>
            
            <div class="cover-report-type">📊 ${reportType || 'Business Report'}</div>
            <div class="cover-title">${title}</div>
            ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ''}
            
            <div class="cover-meta">
              ${dateRange ? `
                <div class="cover-meta-item">
                  <div class="cover-meta-label">Report Period</div>
                  <div class="cover-meta-value">${dateRange}</div>
                </div>
              ` : ''}
              <div class="cover-meta-item">
                <div class="cover-meta-label">Generated On</div>
                <div class="cover-meta-value">${format(new Date(), 'MMMM d, yyyy')}</div>
              </div>
              ${preparedBy ? `
                <div class="cover-meta-item">
                  <div class="cover-meta-label">Prepared By</div>
                  <div class="cover-meta-value">${preparedBy}</div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="cover-footer">
            <div class="cover-footer-left">
              <div class="cover-footer-flag">🇸🇱</div>
              <div class="cover-footer-text">Proudly serving Sierra Leone</div>
            </div>
            <div class="cover-footer-right">
              <div class="cover-confidential">Confidential Document</div>
            </div>
          </div>
        </div>
        
        <!-- Content Page(s) -->
        <div class="page content-page">
          <div class="page-header">
            <div class="page-header-left">
              <div class="page-header-logo"><span>${orgInitials}</span></div>
              <div>
                <div class="page-header-title">${title}</div>
                <div class="page-header-subtitle">${dateRange || format(new Date(), 'MMMM yyyy')}</div>
              </div>
            </div>
            <div class="page-header-right">
              <div class="page-number">${organisation?.name || ''}</div>
            </div>
          </div>
          
          <div class="flag-divider">
            <div class="green"></div>
            <div class="white"></div>
            <div class="blue"></div>
          </div>
          
          <div class="page-content">
            ${executiveSummary ? `
              <div class="executive-summary">
                <div class="executive-summary-title">📋 Executive Summary</div>
                <div class="executive-summary-text">${executiveSummary}</div>
              </div>
            ` : ''}
            
            ${metricsHTML}
            
            ${sectionsHTML}
            
            ${tablesHTML}
            
            ${insightsHTML}
            
            ${recommendationsHTML}
          </div>
          
          <div class="page-footer">
            <div class="page-footer-left">
              <div class="page-footer-flag">
                <div class="green"></div>
                <div class="white"></div>
                <div class="blue"></div>
              </div>
              <div class="page-footer-text">${organisation?.name || ''} • ${format(new Date(), 'yyyy')}</div>
            </div>
            <div class="page-footer-right">
              <div class="page-footer-confidential">Generated ${generatedDate}</div>
            </div>
          </div>
        </div>
        
        ${footer ? `
        <!-- Closing Page -->
        <div class="page closing-page">
          <div class="closing-flag">🇸🇱</div>
          <div class="closing-thanks">Thank You</div>
          <div class="closing-org">For using ${organisation?.name || 'Our'} Management System</div>
          
          <div class="closing-contact">
            ${organisation?.phone ? `<div class="closing-contact-item">📞 ${organisation.phone}</div>` : ''}
            ${organisation?.email ? `<div class="closing-contact-item">✉️ ${organisation.email}</div>` : ''}
            ${organisation?.address ? `<div class="closing-contact-item">📍 ${organisation.address}</div>` : ''}
          </div>
          
          <div class="closing-generated">
            Report ID: ${Date.now().toString(36).toUpperCase()} • Generated on ${generatedDate}
          </div>
          
          <div class="closing-stripe">
            <div class="green"></div>
            <div class="white"></div>
            <div class="blue"></div>
          </div>
        </div>
        ` : ''}
      </body>
    </html>
  `;
};

// Print the generated report
export const printProfessionalReport = (html) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

// Download as HTML (for PDF conversion)
export const downloadReportHTML = (html, filename) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'report.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  generateProfessionalReport,
  printProfessionalReport,
  downloadReportHTML
};