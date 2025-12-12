import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, folderId, fileName, fileContent, mimeType } = await req.json();

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected' 
      }, { status: 403 });
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    switch (action) {
      case 'getRootFolder': {
        const rootResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/root?fields=id,name`,
          { headers }
        );
        const rootData = await rootResponse.json();
        return Response.json({ success: true, folder: rootData });
      }

      case 'listFiles': {
        const q = folderId 
          ? `'${folderId}' in parents and trashed=false`
          : `trashed=false`;
        
        const listResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc&pageSize=100`,
          { headers }
        );
        const data = await listResponse.json();
        
        const sorted = (data.files || []).sort((a, b) => {
          const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
          const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return 0;
        });
        
        return Response.json({ success: true, files: sorted });
      }

      case 'uploadFile': {
        if (!folderId || !fileName || !fileContent) {
          return Response.json({ error: 'Missing fields' }, { status: 400 });
        }

        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const metadata = {
          name: fileName,
          mimeType: mimeType || 'application/pdf',
          parents: [folderId]
        };

        const multipartRequestBody = 
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType || 'application/pdf'}\r\n` +
          'Content-Transfer-Encoding: base64\r\n\r\n' +
          fileContent +
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
          return Response.json({ error: 'Upload failed', details: errorText }, { status: 500 });
        }

        const result = await uploadResponse.json();
        return Response.json({
          success: true,
          fileId: result.id,
          fileName: result.name,
          webViewLink: `https://drive.google.com/file/d/${result.id}/view`
        });
      }

      case 'downloadFile': {
        const downloadResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${folderId}?alt=media`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!downloadResponse.ok) {
          return Response.json({ error: 'Download failed' }, { status: 500 });
        }

        const fileData = await downloadResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)));
        
        return Response.json({
          success: true,
          content: base64,
          mimeType: downloadResponse.headers.get('content-type')
        });
      }

      case 'extractData': {
        const { fileId, fileUrl, detectedType } = await req.json();
        
        const prompt = `Analyze this financial document and extract ALL structured data.

Return a JSON object with this EXACT structure:
{
  "detected_type": "${detectedType || 'expense'}",
  "records": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "vendor": "string (if applicable)",
      "category": "fuel/maintenance/utilities/supplies/rent/salaries/transport/marketing/insurance/other",
      "invoice_number": "string (if found)",
      "payment_method": "cash/card/bank_transfer/mobile_money",
      "customer_name": "string (for revenue)",
      "items": [{"product": "string", "quantity": number, "price": number}] (for sales)
    }
  ]
}

Extract EVERY transaction, line item, expense, or revenue entry found. For bank statements, extract each transaction. For invoices, extract all line items. Be thorough.`;

        const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: prompt,
          file_urls: fileUrl,
          response_json_schema: {
            type: "object",
            properties: {
              detected_type: { type: "string" },
              records: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    description: { type: "string" },
                    amount: { type: "number" },
                    vendor: { type: "string" },
                    category: { type: "string" },
                    invoice_number: { type: "string" },
                    payment_method: { type: "string" },
                    customer_name: { type: "string" },
                    items: { type: "array" }
                  }
                }
              }
            }
          }
        });

        return Response.json({
          success: true,
          extractedData: llmResult
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Drive error:', error);
    return Response.json({ 
      error: 'Internal error',
      details: error.message 
    }, { status: 500 });
  }
});