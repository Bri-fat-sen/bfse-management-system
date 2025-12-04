// Branded document styles generator for receipts, invoices, and forms
// Uses organisation colors, logo, and Sierra Leone theming

export function getBrandedStyles(organisation) {
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  const navyColor = '#0F1F3C';
  
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    /* Brand Flag Stripe */
    .brand-stripe {
      height: 8px;
      display: flex;
    }
    .brand-stripe .primary { flex: 1; background-color: ${primaryColor} !important; }
    .brand-stripe .white { flex: 1; background-color: #FFFFFF !important; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; }
    .brand-stripe .secondary { flex: 1; background-color: ${secondaryColor} !important; }
    
    /* Logo Header */
    .brand-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
      -webkit-print-color-adjust: exact !important;
      color: white !important;
      padding: 24px 30px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .brand-header .logo-container {
      flex-shrink: 0;
    }
    .brand-header .logo-container img {
      max-height: 60px;
      max-width: 80px;
      object-fit: contain;
      background: white;
      padding: 8px;
      border-radius: 8px;
    }
    .brand-header .logo-placeholder {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
    }
    .brand-header .company-info {
      flex: 1;
    }
    .brand-header .company-name {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 4px;
      color: white !important;
      letter-spacing: 0.5px;
    }
    .brand-header .company-tagline {
      font-size: 13px;
      color: rgba(255,255,255,0.9) !important;
      margin-bottom: 6px;
    }
    .brand-header .company-details {
      font-size: 12px;
      color: rgba(255,255,255,0.8) !important;
      line-height: 1.5;
    }
    .brand-header .document-info {
      text-align: right;
      flex-shrink: 0;
    }
    .brand-header .document-type {
      font-size: 24px;
      font-weight: 700;
      color: white !important;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .brand-header .document-number {
      font-size: 14px;
      color: rgba(255,255,255,0.9) !important;
      margin-top: 4px;
      font-weight: 600;
    }
    .brand-header .document-date {
      font-size: 12px;
      color: rgba(255,255,255,0.8) !important;
      margin-top: 2px;
    }
    
    /* Content Section */
    .brand-content {
      background: white;
      padding: 24px 30px;
    }
    
    /* Info Bar */
    .brand-info-bar {
      background-color: ${primaryColor}10 !important;
      -webkit-print-color-adjust: exact !important;
      padding: 16px 24px;
      border-bottom: 2px solid ${primaryColor};
      font-size: 13px;
    }
    .brand-info-bar p { margin: 4px 0; }
    .brand-info-bar strong { color: ${primaryColor}; }
    
    /* Items Table */
    .brand-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .brand-table th {
      background: ${primaryColor}15 !important;
      -webkit-print-color-adjust: exact !important;
      padding: 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: ${primaryColor} !important;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-bottom: 2px solid ${primaryColor};
    }
    .brand-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .brand-table tr:last-child td {
      border-bottom: none;
    }
    .brand-table .amount {
      text-align: right;
      font-weight: 500;
    }
    
    /* Totals Section */
    .brand-totals {
      background-color: ${secondaryColor}10 !important;
      -webkit-print-color-adjust: exact !important;
      padding: 20px 24px;
      border-top: 3px solid ${secondaryColor};
    }
    .brand-totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .brand-totals-row.grand {
      font-size: 22px;
      font-weight: 700;
      color: ${primaryColor} !important;
      padding-top: 16px;
      margin-top: 12px;
      border-top: 3px solid ${primaryColor};
    }
    
    /* Status Badge */
    .brand-badge {
      display: inline-block;
      background-color: ${primaryColor} !important;
      -webkit-print-color-adjust: exact !important;
      color: white !important;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .brand-badge.pending {
      background-color: #f59e0b !important;
    }
    .brand-badge.paid {
      background-color: ${primaryColor} !important;
    }
    
    /* Footer */
    .brand-footer {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, ${navyColor} 0%, ${navyColor}ee 100%) !important;
      -webkit-print-color-adjust: exact !important;
      color: white !important;
      border-top: 4px solid ${primaryColor};
    }
    .brand-footer .thanks {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: white !important;
    }
    .brand-footer .tagline {
      font-size: 13px;
      color: rgba(255,255,255,0.9) !important;
    }
    .brand-footer .flag {
      margin-top: 12px;
      font-size: 24px;
    }
    .brand-footer .contact {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 11px;
      color: rgba(255,255,255,0.7) !important;
    }
    
    /* Registration Info */
    .brand-registration {
      background: #f8f9fa;
      padding: 12px 24px;
      font-size: 11px;
      color: #666;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .brand-registration span {
      display: flex;
      gap: 4px;
    }
    .brand-registration strong {
      color: #333;
    }
    
    /* Notes Box */
    .brand-notes {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid ${secondaryColor};
      margin: 20px 0;
    }
    .brand-notes h4 {
      color: ${secondaryColor};
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    /* Parties Section (for invoices) */
    .brand-parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 40px;
    }
    .brand-party {
      flex: 1;
    }
    .brand-party h3 {
      color: ${primaryColor} !important;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .brand-party p {
      font-size: 14px;
      line-height: 1.6;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .document-container { box-shadow: none; }
    }
  `;
}

export function getBrandedHeader(organisation, documentType, documentNumber, documentDate) {
  const logoHtml = organisation?.logo_url 
    ? `<img src="${organisation.logo_url}" alt="${organisation?.name}" />`
    : `<div class="logo-placeholder">🇸🇱</div>`;
    
  const registrationInfo = [];
  if (organisation?.tin_number) registrationInfo.push(`<span><strong>TIN:</strong> ${organisation.tin_number}</span>`);
  if (organisation?.business_registration_number) registrationInfo.push(`<span><strong>Reg:</strong> ${organisation.business_registration_number}</span>`);
  if (organisation?.gst_number) registrationInfo.push(`<span><strong>GST:</strong> ${organisation.gst_number}</span>`);
  
  return `
    <div class="brand-stripe">
      <div class="primary"></div>
      <div class="white"></div>
      <div class="secondary"></div>
    </div>
    
    <div class="brand-header">
      <div class="logo-container">
        ${logoHtml}
      </div>
      <div class="company-info">
        <div class="company-name">${organisation?.name || 'Our Company'}</div>
        ${organisation?.city ? `<div class="company-tagline">${organisation.city}, ${organisation?.country || 'Sierra Leone'}</div>` : ''}
        <div class="company-details">
          ${organisation?.address ? `${organisation.address}<br>` : ''}
          ${organisation?.phone ? `Tel: ${organisation.phone}` : ''}
          ${organisation?.email ? ` | ${organisation.email}` : ''}
          ${organisation?.website ? ` | ${organisation.website}` : ''}
        </div>
      </div>
      <div class="document-info">
        <div class="document-type">${documentType}</div>
        <div class="document-number">${documentNumber}</div>
        <div class="document-date">${documentDate}</div>
      </div>
    </div>
    
    ${registrationInfo.length > 0 ? `
      <div class="brand-registration">
        ${registrationInfo.join('')}
      </div>
    ` : ''}
  `;
}

export function getBrandedFooter(organisation) {
  return `
    <div class="brand-footer">
      <div class="thanks">Thank you for your business!</div>
      <div class="tagline">Proudly serving ${organisation?.city || 'Sierra Leone'}</div>
      <div class="flag">🇸🇱</div>
      <div class="contact">
        ${organisation?.name || ''} | ${organisation?.phone || ''} | ${organisation?.email || ''}
      </div>
    </div>
  `;
}