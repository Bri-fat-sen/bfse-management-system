import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { background: linear-gradient(135deg, #1EB053, #0072C6); color: white; padding: 30px; text-align: center; }
                    .flag-stripe { height: 6px; display: flex; }
                    .flag-stripe div { flex: 1; }
                    .green { background: #1EB053; }
                    .white { background: #FFFFFF; }
                    .blue { background: #0072C6; }
                    .content { padding: 30px; }
                    .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #0F1F3C; color: white; padding: 12px; text-align: left; }
                    .totals { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-size: 20px; font-weight: bold; color: #1EB053; border-top: 2px solid #1EB053; padding-top: 10px; margin-top: 10px; }
                    .footer { background: #0F1F3C; color: white; padding: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="flag-stripe">
                        <div class="green"></div>
                        <div class="white"></div>
                        <div class="blue"></div>
                    </div>
                    <div class="header">
                        <h1 style="margin: 0;">🇸🇱 ${organisation?.name || 'BRI-FAT-SEN ENTERPRISE'}</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Sales Receipt</p>
                    </div>
                    <div class="content">
                        <div class="receipt-info">
                            <p><strong>Receipt #:</strong> ${sale.sale_number || sale.id}</p>
                            <p><strong>Date:</strong> ${new Date(sale.created_date || Date.now()).toLocaleString()}</p>
                            <p><strong>Customer:</strong> ${customerName || sale.customer_name || 'Walk-in Customer'}</p>
                            <p><strong>Payment Method:</strong> ${sale.payment_method?.toUpperCase() || 'CASH'}</p>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>
                        
                        <div class="totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>Le ${(sale.subtotal || sale.total_amount)?.toLocaleString()}</span>
                            </div>
                            ${sale.tax ? `<div class="total-row"><span>Tax:</span><span>Le ${sale.tax?.toLocaleString()}</span></div>` : ''}
                            ${sale.discount ? `<div class="total-row"><span>Discount:</span><span>-Le ${sale.discount?.toLocaleString()}</span></div>` : ''}
                            <div class="total-row grand-total">
                                <span>Total:</span>
                                <span>Le ${sale.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <p style="text-align: center; margin-top: 30px; color: #666;">
                            Thank you for your business! 🙏
                        </p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">🇸🇱 Proudly serving Sierra Leone</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">${organisation?.address || 'Freetown, Sierra Leone'} | ${organisation?.phone || ''}</p>
                    </div>
                    <div class="flag-stripe">
                        <div class="green"></div>
                        <div class="white"></div>
                        <div class="blue"></div>
                    </div>
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
                html: emailBody
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