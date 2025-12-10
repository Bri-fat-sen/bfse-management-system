import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { purchaseOrderId } = await req.json();

    const pos = await base44.asServiceRole.entities.PurchaseOrder.filter({ id: purchaseOrderId });
    const po = pos[0];

    if (!po) {
      return Response.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ id: po.supplier_id });
    const supplier = suppliers[0];

    if (!supplier?.email) {
      return Response.json({ error: 'Supplier email not found' }, { status: 400 });
    }

    const orgs = await base44.asServiceRole.entities.Organisation.filter({ id: po.organisation_id });
    const org = orgs[0];

    const itemsHtml = po.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity_ordered} ${item.unit || 'piece'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">Le ${item.unit_cost?.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">Le ${item.total?.toLocaleString()}</td>
      </tr>
    `).join('');

    const htmlContent = `
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
            ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="max-width: 120px; max-height: 60px; margin-bottom: 15px;">` : ''}
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Purchase Order</h1>
            <p style="margin: 8px 0 0; opacity: 0.95; font-size: 18px;">#${po.po_number}</p>
          </div>

          <div style="padding: 30px;">
            <div style="margin-bottom: 25px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
              <h2 style="margin: 0 0 15px; font-size: 18px; color: #0F1F3C;">Order Details</h2>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">From:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right;">${org?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">To:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right;">${supplier.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Order Date:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right;">${po.order_date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Expected Delivery:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right;">${po.expected_delivery_date || 'TBD'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Delivery Location:</td>
                  <td style="padding: 6px 0; font-weight: 600; text-align: right;">${po.warehouse_name || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <h2 style="margin: 0 0 15px; font-size: 18px; color: #0F1F3C;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Item</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Unit Cost</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background: linear-gradient(to right, rgba(30, 176, 83, 0.05), rgba(0, 114, 198, 0.05)); padding: 20px; border-radius: 8px; margin-top: 20px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600;">Le ${po.subtotal?.toLocaleString()}</td>
                </tr>
                ${po.shipping_cost > 0 ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Shipping:</td>
                  <td style="padding: 6px 0; text-align: right;">Le ${po.shipping_cost?.toLocaleString()}</td>
                </tr>` : ''}
                ${po.tax_amount > 0 ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Tax:</td>
                  <td style="padding: 6px 0; text-align: right;">Le ${po.tax_amount?.toLocaleString()}</td>
                </tr>` : ''}
                <tr style="border-top: 2px solid #1EB053;">
                  <td style="padding: 12px 0 0; font-size: 18px; font-weight: bold; color: #0F1F3C;">Total Amount:</td>
                  <td style="padding: 12px 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #1EB053;">Le ${po.total_amount?.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            ${po.notes ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Notes:</strong> ${po.notes}</p>
            </div>` : ''}

            <p style="margin-top: 30px; font-size: 13px; color: #6b7280; line-height: 1.6;">
              Please confirm receipt of this purchase order and provide an estimated delivery date. 
              If you have any questions, please contact us at ${org?.email || org?.phone || 'your earliest convenience'}.
            </p>
          </div>

          <div style="height: 6px; display: flex;">
            <div style="flex: 1; background-color: #1EB053;"></div>
            <div style="flex: 1; background-color: #FFFFFF;"></div>
            <div style="flex: 1; background-color: #0072C6;"></div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">${org?.name || 'Your Company'}</p>
          ${org?.address ? `<p style="margin: 5px 0 0;">${org.address}</p>` : ''}
          ${org?.phone ? `<p style="margin: 5px 0 0;">📞 ${org.phone}</p>` : ''}
        </div>
      </body>
      </html>
    `;

    const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
    
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailersendApiKey}`
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@trial-jpzkmgq6pqr4059v.mlsender.net',
          name: org?.name || 'Purchase Order System'
        },
        to: [{
          email: supplier.email,
          name: supplier.name
        }],
        subject: `Purchase Order #${po.po_number} from ${org?.name || 'Your Company'}`,
        html: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MailerSend error:', error);
      return Response.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      message: `Purchase order sent to ${supplier.email}`
    });

  } catch (error) {
    console.error('Send PO error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});