import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportData, fileName } = await req.json();

    // Get Google Drive access token from connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected. Please authorize Google Drive access.' 
      }, { status: 403 });
    }

    // Generate PDF from report data
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const marginLeft = 20;
    const marginRight = 20;

    // Flag stripe
    doc.setFillColor(30, 176, 83);
    doc.rect(marginLeft, 10, (pageWidth - marginLeft - marginRight) / 3, 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(marginLeft + (pageWidth - marginLeft - marginRight) / 3, 10, (pageWidth - marginLeft - marginRight) / 3, 3, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect(marginLeft + (2 * (pageWidth - marginLeft - marginRight) / 3), 10, (pageWidth - marginLeft - marginRight) / 3, 3, 'F');

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 31, 60);
    doc.text(reportData.title || 'Report', marginLeft, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(reportData.period || '', marginLeft, yPos);
    yPos += 15;

    // Summary
    if (reportData.summary) {
      reportData.summary.forEach(item => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(item.label, marginLeft, yPos);
        doc.setFont(undefined, 'bold');
        doc.text(String(item.value), pageWidth - marginRight, yPos, { align: 'right' });
        doc.setFont(undefined, 'normal');
        yPos += 8;
      });
      yPos += 10;
    }

    // Table
    if (reportData.columns && reportData.rows) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(30, 176, 83);
      doc.rect(marginLeft, yPos - 5, pageWidth - marginLeft - marginRight, 8, 'F');
      
      const colWidth = (pageWidth - marginLeft - marginRight) / reportData.columns.length;
      reportData.columns.forEach((col, i) => {
        doc.text(String(col).substring(0, 15), marginLeft + (i * colWidth) + 2, yPos);
      });
      yPos += 8;

      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      reportData.rows.slice(0, 40).forEach(row => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        row.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 20), marginLeft + (i * colWidth) + 2, yPos);
        });
        yPos += 6;
      });
    }

    const pdfBytes = doc.output('arraybuffer');
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Upload to Google Drive
    const metadata = {
      name: fileName,
      mimeType: 'application/pdf'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const multipartRequestBody = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/pdf\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Pdf +
      closeDelim;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Drive upload error:', errorText);
      return Response.json({ 
        error: 'Failed to upload to Google Drive',
        details: errorText 
      }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();

    return Response.json({
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: `https://drive.google.com/file/d/${result.id}/view`
    });

  } catch (error) {
    console.error('Save to Drive error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});