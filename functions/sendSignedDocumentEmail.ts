import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      documentTitle, 
      documentContent, 
      employeeName, 
      employeeEmail,
      organisationName,
      organisationId,
      signedAt 
    } = await req.json();

    // Generate PDF from document content
    const doc = new jsPDF();
    
    // Strip HTML tags for text content
    const stripHtml = (html) => {
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    };

    const textContent = stripHtml(documentContent);

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(15, 31, 60);
    doc.text(documentTitle, 20, 20);

    // Add organization name
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(organisationName || 'Organization', 20, 30);

    // Add Sierra Leone flag colors bar
    doc.setFillColor(30, 176, 83);
    doc.rect(20, 35, 56, 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(76, 35, 57, 3, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect(133, 35, 57, 3, 'F');

    // Add document content
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    
    const lines = doc.splitTextToSize(textContent, 170);
    let y = 50;
    const pageHeight = doc.internal.pageSize.height;
    
    for (const line of lines) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 5;
    }

    // Add signature footer
    y = Math.min(y + 20, pageHeight - 40);
    doc.setFontSize(10);
    doc.setTextColor(30, 176, 83);
    doc.text(`Digitally signed by: ${employeeName}`, 20, y);
    doc.text(`Date: ${new Date(signedAt).toLocaleDateString()}`, 20, y + 7);
    doc.setTextColor(0, 114, 198);
    doc.text('🇸🇱 Republic of Sierra Leone', 20, y + 14);

    // Get PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // Fetch admins and super admins from the organization
    const allEmployees = await base44.asServiceRole.entities.Employee.filter({ 
      organisation_id: organisationId 
    });
    
    const adminEmails = allEmployees
      .filter(emp => ['super_admin', 'org_admin', 'hr_admin'].includes(emp.role))
      .map(emp => emp.email || emp.user_email)
      .filter(Boolean);

    // Create email HTML
    const createEmailHtml = (recipientName, isAdmin = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0F1F3C 0%, #1a2f4c 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .flag-bar {
      height: 6px;
      background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.8;
    }
    .body {
      padding: 30px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #1EB053;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .badge {
      display: inline-block;
      background: #1EB053;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="flag-bar"></div>
    <div class="header">
      <h1>📄 Document Signed</h1>
      <p>${organisationName || 'Your Organization'}</p>
    </div>
    <div class="body">
      <p>Dear ${recipientName},</p>
      ${isAdmin ? `
      <p><strong>${employeeName}</strong> has successfully signed the following document:</p>
      ` : `
      <p>You have successfully signed the following document:</p>
      `}
      
      <div class="info-box">
        <strong>Document:</strong> ${documentTitle}<br/>
        <strong>Signed by:</strong> ${employeeName}<br/>
        <strong>Date:</strong> ${new Date(signedAt).toLocaleString()}
        <br/>
        <span class="badge">✓ Digitally Verified</span>
      </div>
      
      <p>A signed PDF copy of this document is attached to this email for your records.</p>
      
      <p>Please keep this document in a safe place. If you have any questions, please contact HR.</p>
    </div>
    <div class="flag-bar"></div>
    <div class="footer">
      <p>🇸🇱 Republic of Sierra Leone</p>
      <p>${organisationName} HR Management System</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email to employee
    if (employeeEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: employeeEmail,
          subject: `✓ Signed Document: ${documentTitle}`,
          body: createEmailHtml(employeeName, false)
        });
      } catch (emailErr) {
        console.error('Failed to send email to employee:', emailErr);
      }
    }

    // Send email to all admins
    const emailPromises = adminEmails.map(async (adminEmail) => {
      try {
        const admin = allEmployees.find(e => (e.email || e.user_email) === adminEmail);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `✓ Document Signed: ${documentTitle} by ${employeeName}`,
          body: createEmailHtml(admin?.full_name || 'Admin', true)
        });
      } catch (emailErr) {
        console.error('Failed to send email to admin:', adminEmail, emailErr);
      }
    });

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      emailsSent: adminEmails.length + (employeeEmail ? 1 : 0),
      pdfGenerated: true
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});