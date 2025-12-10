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
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔔 New Sale Alert</h1>
                        <p style="margin: 8px 0 0; opacity: 0.95; font-size: 16px;">A new sale has been completed</p>
                    </div>

                    <div style="padding: 30px;">
                        <div style="margin-bottom: 25px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #1EB053;">
                            <h2 style="margin: 0 0 15px; font-size: 18px; color: #0F1F3C;">Sale Details</h2>
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Sale #:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${sale.sale_number || sale.id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Cashier:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${employeeName || sale.employee_name || 'Unknown'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Time:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${new Date(sale.created_date || Date.now()).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Type:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${sale.sale_type?.toUpperCase() || 'RETAIL'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Payment:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${sale.payment_method?.toUpperCase() || 'CASH'}</td>
                                </tr>
                                ${sale.customer_name ? `
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280;">Customer:</td>
                                    <td style="padding: 6px 0; font-weight: 600; text-align: right;">${sale.customer_name}</td>
                                </tr>` : ''}
                            </table>
                        </div>

                        <h2 style="margin: 0 0 15px; font-size: 18px; color: #0F1F3C;">Items Sold</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f9fafb;">
                                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Product</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>

                        <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 25px; border-radius: 8px; text-align: center; color: white;">
                            <p style="margin: 0 0 8px; opacity: 0.9; font-size: 14px;">Total Sale Amount</p>
                            <div style="font-size: 32px; font-weight: bold;">Le ${sale.total_amount?.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style="height: 6px; display: flex;">
                        <div style="flex: 1; background-color: #1EB053;"></div>
                        <div style="flex: 1; background-color: #FFFFFF;"></div>
                        <div style="flex: 1; background-color: #0072C6;"></div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">🇸🇱 ${organisation?.name || 'BRI-FAT-SEN ENTERPRISE'}</p>
                    <p style="margin: 5px 0 0;">This is an automated notification from your management system</p>
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