import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sale, organisation, employeeName } = await req.json();

        if (!sale) {
            return Response.json({ error: 'Sale data is required' }, { status: 400 });
        }

        // Get admin users
        const employees = await base44.asServiceRole.entities.Employee.filter({ 
            organisation_id: organisation?.id 
        });
        
        const adminEmployees = employees.filter(e => 
            ['super_admin', 'org_admin', 'accountant'].includes(e.role) && e.email
        );

        if (adminEmployees.length === 0) {
            return Response.json({ success: true, message: 'No admin emails configured' });
        }

        // Format items for email
        const itemsHTML = sale.items?.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Le ${item.total?.toLocaleString()}</td>
            </tr>
        `).join('') || '';

        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .flag-stripe { height: 6px; display: flex; }
                    .flag-stripe div { flex: 1; }
                    .green { background: #1EB053; }
                    .white { background: #FFFFFF; }
                    .blue { background: #0072C6; }
                    .header { background: #0F1F3C; color: white; padding: 20px; }
                    .alert-banner { background: linear-gradient(135deg, #1EB053, #0072C6); color: white; padding: 15px; text-align: center; }
                    .content { padding: 25px; }
                    .sale-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1EB053; }
                    table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    th { background: #1EB053; color: white; padding: 10px; text-align: left; }
                    .total-box { background: #0F1F3C; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
                    .total-amount { font-size: 28px; font-weight: bold; color: #1EB053; }
                    .footer { padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
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
                        <h2 style="margin: 0;">🔔 New Sale Alert</h2>
                    </div>
                    <div class="alert-banner">
                        <strong>A new sale has been completed!</strong>
                    </div>
                    <div class="content">
                        <div class="sale-details">
                            <p><strong>📝 Sale #:</strong> ${sale.sale_number || sale.id}</p>
                            <p><strong>👤 Cashier:</strong> ${employeeName || sale.employee_name || 'Unknown'}</p>
                            <p><strong>🕐 Time:</strong> ${new Date(sale.created_date || Date.now()).toLocaleString()}</p>
                            <p><strong>📍 Type:</strong> ${sale.sale_type?.toUpperCase() || 'RETAIL'}</p>
                            <p><strong>💳 Payment:</strong> ${sale.payment_method?.toUpperCase() || 'CASH'}</p>
                            ${sale.customer_name ? `<p><strong>🧑 Customer:</strong> ${sale.customer_name}</p>` : ''}
                        </div>
                        
                        <h3 style="color: #0F1F3C; margin-bottom: 10px;">Items Sold:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>
                        
                        <div class="total-box">
                            <p style="margin: 0 0 5px 0; opacity: 0.8;">Total Sale Amount</p>
                            <div class="total-amount">Le ${sale.total_amount?.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>🇸🇱 ${organisation?.name || 'BRI-FAT-SEN ENTERPRISE'} - Auto Sale Report</p>
                        <p>This is an automated notification from your management system.</p>
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

        // Send email to all admins using MailerSend
        const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
        
        const emailPromises = adminEmployees.map(admin => 
            fetch('https://api.mailersend.com/v1/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${mailersendApiKey}`
                },
                body: JSON.stringify({
                    from: {
                        email: 'noreply@brifatsensystems.com',
                        name: organisation?.name || 'Sales Alert'
                    },
                    to: [{
                        email: admin.email,
                        name: admin.full_name || admin.first_name
                    }],
                    reply_to: {
                        email: organisation?.email || 'noreply@brifatsensystems.com',
                        name: organisation?.name || 'Sales Alert'
                    },
                    subject: `💰 New Sale: Le ${sale.total_amount?.toLocaleString()} - ${organisation?.name || 'BFSE'}`,
                    html: emailBody
                })
            })
        );

        await Promise.all(emailPromises);

        return Response.json({ 
            success: true, 
            message: `Sale report sent to ${adminEmployees.length} admin(s)`,
            recipients: adminEmployees.map(a => a.email)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});