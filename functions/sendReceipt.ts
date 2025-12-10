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