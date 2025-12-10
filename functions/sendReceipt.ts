import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sale, customerEmail, customerName, organisation } = await req.json();

        if (!sale || !customerEmail) {
            return Response.json({ error: 'Sale data and customer email are required' }, { status: 400 });
        }

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 15;

        // Sierra Leone flag stripe at top
        doc.setFillColor(30, 176, 83);
        doc.rect(0, 0, pageWidth / 3, 8, 'F');
        doc.setFillColor(255, 255, 255);
        doc.rect(pageWidth / 3, 0, pageWidth / 3, 8, 'F');
        doc.setFillColor(0, 114, 198);
        doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 8, 'F');

        yPos = 20;

        // Header
        doc.setFillColor(30, 176, 83);
        doc.rect(0, yPos, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('SALES RECEIPT', pageWidth / 2, yPos + 15, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`#${sale.sale_number || sale.id}`, pageWidth / 2, yPos + 28, { align: 'center' });

        yPos = 70;

        // Receipt Info Box
        doc.setDrawColor(30, 176, 83);
        doc.setLineWidth(0.5);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'FD');
        
        doc.setTextColor(15, 31, 60);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('RECEIPT DETAILS:', 20, yPos + 8);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.text(`Date: ${new Date(sale.created_date || Date.now()).toLocaleString()}`, 20, yPos + 16);
        doc.text(`Customer: ${customerName || sale.customer_name || 'Walk-in Customer'}`, 20, yPos + 23);
        doc.text(`Payment: ${sale.payment_method?.toUpperCase() || 'CASH'}`, 20, yPos + 30);

        yPos = 120;

        // Items Table Header
        doc.setFillColor(30, 176, 83);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('ITEM', 20, yPos + 7);
        doc.text('QTY', 110, yPos + 7);
        doc.text('PRICE', 135, yPos + 7);
        doc.text('TOTAL', 170, yPos + 7, { align: 'right' });

        yPos += 10;

        // Items
        doc.setFont(undefined, 'normal');
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(8);

        sale.items.forEach((item, idx) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            const bgColor = idx % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
            doc.setFillColor(...bgColor);
            doc.rect(15, yPos, pageWidth - 30, 12, 'F');
            doc.setDrawColor(229, 231, 235);
            doc.line(15, yPos + 12, pageWidth - 15, yPos + 12);

            doc.text(item.product_name, 20, yPos + 8, { maxWidth: 85 });
            doc.text(`${item.quantity}`, 110, yPos + 8);
            doc.text(`Le ${item.unit_price?.toLocaleString() || 0}`, 135, yPos + 8);
            doc.setFont(undefined, 'bold');
            doc.text(`Le ${item.total?.toLocaleString() || 0}`, 195, yPos + 8, { align: 'right' });
            doc.setFont(undefined, 'normal');

            yPos += 12;
        });

        yPos += 5;

        // Totals
        doc.setDrawColor(30, 176, 83);
        doc.setLineWidth(2);
        doc.line(125, yPos, pageWidth - 15, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('Subtotal:', 130, yPos);
        doc.setTextColor(15, 31, 60);
        doc.text(`Le ${(sale.subtotal || sale.total_amount)?.toLocaleString() || 0}`, 195, yPos, { align: 'right' });
        yPos += 7;

        if (sale.tax > 0) {
            doc.setTextColor(107, 114, 128);
            doc.text('Tax:', 130, yPos);
            doc.setTextColor(15, 31, 60);
            doc.text(`Le ${sale.tax?.toLocaleString()}`, 195, yPos, { align: 'right' });
            yPos += 7;
        }

        if (sale.discount > 0) {
            doc.setTextColor(107, 114, 128);
            doc.text('Discount:', 130, yPos);
            doc.setTextColor(15, 31, 60);
            doc.text(`-Le ${sale.discount?.toLocaleString()}`, 195, yPos, { align: 'right' });
            yPos += 7;
        }

        doc.setDrawColor(30, 176, 83);
        doc.setLineWidth(1);
        doc.line(125, yPos, pageWidth - 15, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 176, 83);
        doc.text('TOTAL AMOUNT:', 130, yPos);
        doc.setFontSize(13);
        doc.text(`Le ${sale.total_amount?.toLocaleString() || 0}`, 195, yPos, { align: 'right' });

        // Footer stripe
        const footerY = doc.internal.pageSize.getHeight() - 8;
        doc.setFillColor(30, 176, 83);
        doc.rect(0, footerY, pageWidth / 3, 8, 'F');
        doc.setFillColor(255, 255, 255);
        doc.rect(pageWidth / 3, footerY, pageWidth / 3, 8, 'F');
        doc.setFillColor(0, 114, 198);
        doc.rect((pageWidth / 3) * 2, footerY, pageWidth / 3, 8, 'F');

        const pdfBase64 = doc.output('datauristring').split(',')[1];

        // Format items for email
        const itemsHTML = sale.items?.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Le ${item.unit_price?.toLocaleString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Le ${item.total?.toLocaleString()}</td>
            </tr>
        `).join('') || '';

        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px;">
                <div style="max-width: 700px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Sierra Leone colors -->
                    <div style="height: 6px; display: flex;">
                        <div style="flex: 1; background-color: #1EB053;"></div>
                        <div style="flex: 1; background-color: #FFFFFF;"></div>
                        <div style="flex: 1; background-color: #0072C6;"></div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 30px; text-align: center; color: white;">
                        ${organisation?.logo_url ? `<img src="${organisation.logo_url}" alt="${organisation.name}" style="max-width: 120px; max-height: 60px; margin-bottom: 15px;">` : ''}
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sales Receipt</h1>
                        <p style="margin: 8px 0 0; opacity: 0.95; font-size: 18px;">#${sale.sale_number || sale.id}</p>
                    </div>

                    <div style="padding: 30px;">
                        <div style="margin-bottom: 25px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Date:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${new Date(sale.created_date || Date.now()).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Customer:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${customerName || sale.customer_name || 'Walk-in Customer'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Payment Method:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${sale.payment_method?.toUpperCase() || 'CASH'}</td>
                                </tr>
                            </table>
                        </div>

                        <h2 style="margin: 0 0 15px; font-size: 18px; color: #0F1F3C;">Items Purchased</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f9fafb;">
                                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Item</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Qty</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Price</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>

                        <div style="background: linear-gradient(to right, rgba(30, 176, 83, 0.05), rgba(0, 114, 198, 0.05)); padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
                                    <td style="padding: 6px 0; text-align: right; font-weight: 600;">Le ${(sale.subtotal || sale.total_amount)?.toLocaleString()}</td>
                                </tr>
                                ${sale.tax ? `
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Tax:</td>
                                    <td style="padding: 6px 0; text-align: right;">Le ${sale.tax?.toLocaleString()}</td>
                                </tr>` : ''}
                                ${sale.discount ? `
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Discount:</td>
                                    <td style="padding: 6px 0; text-align: right;">-Le ${sale.discount?.toLocaleString()}</td>
                                </tr>` : ''}
                                <tr style="border-top: 2px solid #1EB053;">
                                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: bold; color: #0F1F3C;">Total Amount:</td>
                                    <td style="padding: 12px 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #1EB053;">Le ${sale.total_amount?.toLocaleString()}</td>
                                </tr>
                            </table>
                        </div>

                        <p style="margin-top: 30px; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.6;">
                            Thank you for your business! 🙏
                        </p>
                    </div>

                    <div style="height: 6px; display: flex;">
                        <div style="flex: 1; background-color: #1EB053;"></div>
                        <div style="flex: 1; background-color: #FFFFFF;"></div>
                        <div style="flex: 1; background-color: #0072C6;"></div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">🇸🇱 ${organisation?.name || 'BRI-FAT-SEN ENTERPRISE'}</p>
                    ${organisation?.address ? `<p style="margin: 5px 0 0;">${organisation.address}</p>` : ''}
                    ${organisation?.phone ? `<p style="margin: 5px 0 0;">📞 ${organisation.phone}</p>` : ''}
                </div>
            </body>
            </html>
        `;

        // Send email using MailerSend
        const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
        
        const response = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mailersendApiKey}`
            },
            body: JSON.stringify({
                from: {
                    email: 'noreply@brifatsensystems.com',
                    name: organisation?.name || 'Sales Receipt'
                },
                to: [{
                    email: customerEmail,
                    name: customerName || sale.customer_name || 'Customer'
                }],
                reply_to: {
                    email: organisation?.email || 'noreply@brifatsensystems.com',
                    name: organisation?.name || 'Sales Receipt'
                },
                subject: `Your Receipt from ${organisation?.name || 'BRI-FAT-SEN ENTERPRISE'} - #${sale.sale_number || sale.id}`,
                html: emailBody,
                attachments: [{
                    content: pdfBase64,
                    filename: `Receipt-${sale.sale_number || sale.id}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment'
                }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('MailerSend error:', error);
            return Response.json({ error: 'Failed to send email', details: error }, { status: 500 });
        }

        return Response.json({ success: true, message: 'Receipt sent successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});