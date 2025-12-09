import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportData, reportType, exportOptions = {}, aiAnalysis, monthlyTrend } = await req.json();
    const doc = new jsPDF();
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPos > 270 - requiredSpace) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Sierra Leone Flag Colors Header
    const drawFlagStripe = (y) => {
      const stripeHeight = 3;
      const stripeWidth = contentWidth / 3;
      doc.setFillColor(30, 176, 83); // Green
      doc.rect(marginLeft, y, stripeWidth, stripeHeight, 'F');
      doc.setFillColor(255, 255, 255); // White
      doc.rect(marginLeft + stripeWidth, y, stripeWidth, stripeHeight, 'F');
      doc.setFillColor(0, 114, 198); // Blue
      doc.rect(marginLeft + (stripeWidth * 2), y, stripeWidth, stripeHeight, 'F');
    };

    // Header with flag stripe
    drawFlagStripe(10);
    yPos = 18;

    // Logo
    if (exportOptions.includeLogo && reportData.organisation?.logo_url) {
      try {
        const logoResponse = await fetch(reportData.organisation.logo_url);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await blobToBase64(logoBlob);
        doc.addImage(logoBase64, 'PNG', marginLeft, yPos, 25, 25);
      } catch (e) {
        console.log('Logo load failed:', e);
      }
    }

    // Organisation name and report title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(reportData.organisation?.name || 'Organisation', exportOptions.includeLogo ? marginLeft + 30 : marginLeft, yPos + 8);
    
    doc.setFontSize(16);
    doc.setTextColor(30, 176, 83);
    doc.text(reportData.title || 'Financial Report', exportOptions.includeLogo ? marginLeft + 30 : marginLeft, yPos + 16);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(reportData.period || reportData.asOf || '', exportOptions.includeLogo ? marginLeft + 30 : marginLeft, yPos + 22);
    
    yPos += 35;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 10;

    // Report Type Specific Content
    if (reportType === "pl_statement") {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Revenue Section
      reportData.sections.forEach((section, idx) => {
        checkPageBreak(40);
        
        // Section header
        doc.setFillColor(section.title === "REVENUE" ? 232 : 254, section.title === "REVENUE" ? 245 : 226, section.title === "REVENUE" ? 233 : 226);
        doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(section.title === "REVENUE" ? 21 : 127, section.title === "REVENUE" ? 128 : 29, section.title === "REVENUE" ? 61 : 29);
        doc.text(section.title, marginLeft + 2, yPos + 5.5);
        yPos += 10;

        // Items
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        
        section.items.forEach(item => {
          checkPageBreak(8);
          doc.text(item.label, marginLeft + 5, yPos);
          doc.text(`Le ${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
          yPos += 7;
        });

        // Subsections if any
        if (section.subsections) {
          section.subsections.forEach(sub => {
            checkPageBreak(20);
            doc.setFont(undefined, 'bold');
            doc.text(sub.title, marginLeft + 5, yPos);
            yPos += 6;
            doc.setFont(undefined, 'normal');
            sub.items.forEach(item => {
              checkPageBreak(8);
              doc.text(item.label, marginLeft + 10, yPos);
              doc.text(`Le ${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
              yPos += 7;
            });
          });
        }

        // Total
        if (section.total) {
          checkPageBreak(10);
          doc.setFillColor(section.title === "REVENUE" ? 209 : 254, section.title === "REVENUE" ? 250 : 202, section.title === "REVENUE" ? 229 : 202);
          doc.rect(marginLeft, yPos - 2, contentWidth, 9, 'F');
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(section.total.label, marginLeft + 5, yPos + 4);
          doc.text(`Le ${section.total.amount.toLocaleString()}`, pageWidth - marginRight, yPos + 4, { align: 'right' });
          yPos += 12;
        }
        yPos += 5;
      });

      // Net Profit
      checkPageBreak(15);
      const profitable = reportData.netProfit >= 0;
      doc.setFillColor(profitable ? 227 : 255, profitable ? 242 : 237, 253);
      doc.rect(marginLeft, yPos, contentWidth, 12, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(profitable ? 0 : 234, profitable ? 114 : 88, profitable ? 198 : 88);
      doc.text('NET PROFIT', marginLeft + 5, yPos + 8);
      doc.text(`Le ${reportData.netProfit.toLocaleString()}`, pageWidth - marginRight, yPos + 8, { align: 'right' });
      yPos += 15;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Profit Margin: ${reportData.profitMargin.toFixed(2)}%`, marginLeft + 5, yPos);
      yPos += 10;
    }

    if (reportType === "balance_sheet") {
      reportData.sections.forEach(section => {
        checkPageBreak(40);
        
        // Section header
        const colors = {
          ASSETS: { bg: [232, 245, 233], text: [21, 128, 61] },
          LIABILITIES: { bg: [254, 226, 226], text: [127, 29, 29] },
          EQUITY: { bg: [227, 242, 253], text: [0, 114, 198] }
        };
        const color = colors[section.title] || { bg: [240, 240, 240], text: [0, 0, 0] };
        
        doc.setFillColor(...color.bg);
        doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...color.text);
        doc.text(section.title, marginLeft + 2, yPos + 5.5);
        yPos += 10;

        // Subsections
        if (section.subsections) {
          section.subsections.forEach(sub => {
            checkPageBreak(20);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(80, 80, 80);
            doc.text(sub.title, marginLeft + 5, yPos);
            yPos += 6;
            
            doc.setFont(undefined, 'normal');
            sub.items.forEach(item => {
              checkPageBreak(8);
              doc.text(item.label, marginLeft + 10, yPos);
              doc.text(`Le ${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
              yPos += 7;
            });
          });
        }

        // Direct items
        if (section.items) {
          doc.setFont(undefined, 'normal');
          doc.setTextColor(60, 60, 60);
          section.items.forEach(item => {
            checkPageBreak(8);
            doc.text(item.label, marginLeft + 5, yPos);
            doc.text(`Le ${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
            yPos += 7;
          });
        }

        // Total
        if (section.total) {
          checkPageBreak(10);
          doc.setFillColor(...color.bg);
          doc.rect(marginLeft, yPos - 2, contentWidth, 9, 'F');
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(section.total.label, marginLeft + 5, yPos + 4);
          doc.text(`Le ${section.total.amount.toLocaleString()}`, pageWidth - marginRight, yPos + 4, { align: 'right' });
          yPos += 12;
        }
        yPos += 5;
      });
    }

    if (reportType === "cash_flow") {
      reportData.sections.forEach(section => {
        checkPageBreak(40);
        
        const colors = {
          bg: [227, 242, 253],
          text: [0, 114, 198]
        };
        
        doc.setFillColor(...colors.bg);
        doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.text);
        doc.text(section.title, marginLeft + 2, yPos + 5.5);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        
        section.items.forEach(item => {
          checkPageBreak(8);
          const isNegative = item.amount < 0;
          doc.setTextColor(isNegative ? 220 : 34, isNegative ? 38 : 197, isNegative ? 38 : 94);
          doc.text(item.label, marginLeft + 5, yPos);
          doc.text(`Le ${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
          doc.setTextColor(60, 60, 60);
          yPos += 7;
        });

        if (section.total) {
          checkPageBreak(10);
          doc.setFillColor(...colors.bg);
          doc.rect(marginLeft, yPos - 2, contentWidth, 9, 'F');
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(section.total.label, marginLeft + 5, yPos + 4);
          doc.text(`Le ${section.total.amount.toLocaleString()}`, pageWidth - marginRight, yPos + 4, { align: 'right' });
          yPos += 12;
        }
        yPos += 5;
      });

      // Net Cash Flow
      checkPageBreak(15);
      const positive = reportData.netCashFlow >= 0;
      doc.setFillColor(positive ? 209 : 255, positive ? 250 : 237, positive ? 229 : 213);
      doc.rect(marginLeft, yPos, contentWidth, 12, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(positive ? 0 : 234, positive ? 114 : 88, positive ? 198 : 88);
      doc.text('NET CASH FLOW', marginLeft + 5, yPos + 8);
      doc.text(`Le ${reportData.netCashFlow.toLocaleString()}`, pageWidth - marginRight, yPos + 8, { align: 'right' });
      yPos += 15;
    }

    // AI Analysis (if included)
    if (exportOptions.includeAIAnalysis && aiAnalysis) {
      doc.addPage();
      yPos = 20;
      
      drawFlagStripe(10);
      yPos = 18;

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 176, 83);
      doc.text('AI Financial Analysis', marginLeft, yPos);
      yPos += 12;

      // Executive Summary
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Executive Summary', marginLeft, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      const summaryLines = doc.splitTextToSize(aiAnalysis.executive_summary, contentWidth);
      summaryLines.forEach(line => {
        checkPageBreak();
        doc.text(line, marginLeft, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Key Insights
      if (aiAnalysis.key_insights?.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 114, 198);
        doc.text('Key Insights', marginLeft, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        aiAnalysis.key_insights.forEach((insight, idx) => {
          checkPageBreak(10);
          const lines = doc.splitTextToSize(`${idx + 1}. ${insight}`, contentWidth - 5);
          lines.forEach(line => {
            doc.text(line, marginLeft + 2, yPos);
            yPos += 5;
          });
        });
        yPos += 5;
      }

      // Recommendations
      if (aiAnalysis.recommendations?.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 176, 83);
        doc.text('Recommendations', marginLeft, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        aiAnalysis.recommendations.forEach((rec, idx) => {
          checkPageBreak(10);
          const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, contentWidth - 5);
          lines.forEach(line => {
            doc.text(line, marginLeft + 2, yPos);
            yPos += 5;
          });
        });
      }
    }

    // Footer on all pages
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawFlagStripe(doc.internal.pageSize.height - 8);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-GB')} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportData.title.replace(/\s/g, '_')}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper to convert blob to base64
async function blobToBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:image/png;base64,' + btoa(binary);
}