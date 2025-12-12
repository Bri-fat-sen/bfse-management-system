import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId, fileName, documentType } = await req.json();

    if (!fileId) {
      return Response.json({ error: 'File ID required' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected' 
      }, { status: 403 });
    }

    // Download file from Drive
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!downloadResponse.ok) {
      return Response.json({ error: 'Failed to download file' }, { status: 500 });
    }

    const fileData = await downloadResponse.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileData)));

    // Get file metadata
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const metadata = await metadataResponse.json();

    // Step 1: Detect document type if not provided
    let detectedType = documentType;
    if (!detectedType) {
      const typePrompt = `Analyze this financial document and determine its type. 
      Return ONLY one word from: expense, revenue, bank_statement, invoice, receipt, payroll
      
      Document name: ${metadata.name || fileName}`;

      const typeResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: typePrompt,
        file_urls: [`data:${metadata.mimeType};base64,${base64Content}`]
      });

      detectedType = (typeResult || '').toLowerCase().trim();
    }

    // Step 2: Extract structured data based on type
    const schemas = {
      expense: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format" },
                category: { type: "string", description: "expense category: fuel, maintenance, utilities, supplies, rent, salaries, transport, marketing, insurance, petty_cash, other" },
                description: { type: "string" },
                vendor: { type: "string" },
                amount: { type: "number" },
                payment_method: { type: "string", description: "cash, card, bank_transfer, or mobile_money" },
                invoice_number: { type: "string" },
                receipt_number: { type: "string" },
                notes: { type: "string" }
              },
              required: ["date", "category", "amount"]
            }
          }
        }
      },
      revenue: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format" },
                customer_name: { type: "string" },
                customer_phone: { type: "string" },
                description: { type: "string" },
                amount: { type: "number" },
                payment_method: { type: "string", description: "cash, card, bank_transfer, or mobile_money" },
                invoice_number: { type: "string" },
                receipt_number: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product_name: { type: "string" },
                      quantity: { type: "number" },
                      unit_price: { type: "number" }
                    }
                  }
                }
              },
              required: ["date", "amount"]
            }
          }
        }
      },
      bank_statement: {
        type: "object",
        properties: {
          account_info: {
            type: "object",
            properties: {
              account_name: { type: "string" },
              account_number: { type: "string" },
              bank_name: { type: "string" },
              statement_period: { type: "string" },
              opening_balance: { type: "number" },
              closing_balance: { type: "number" }
            }
          },
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format" },
                description: { type: "string" },
                reference: { type: "string" },
                debit: { type: "number" },
                credit: { type: "number" },
                balance: { type: "number" },
                transaction_type: { type: "string", description: "deposit, withdrawal, transfer, fee, interest" }
              },
              required: ["date", "description"]
            }
          }
        }
      },
      invoice: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: {
              type: "object",
              properties: {
                invoice_number: { type: "string" },
                invoice_date: { type: "string", description: "Date in YYYY-MM-DD format" },
                due_date: { type: "string", description: "Date in YYYY-MM-DD format" },
                vendor_name: { type: "string" },
                vendor_address: { type: "string" },
                customer_name: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      quantity: { type: "number" },
                      unit_price: { type: "number" },
                      amount: { type: "number" }
                    }
                  }
                },
                subtotal: { type: "number" },
                tax: { type: "number" },
                total: { type: "number" },
                payment_terms: { type: "string" }
              },
              required: ["invoice_number", "invoice_date", "total"]
            }
          }
        }
      }
    };

    const extractPrompt = {
      expense: `Extract ALL expense records from this document. Include date, category, description, vendor, amount, payment method, and any invoice/receipt numbers. Convert amounts to numbers only (no currency symbols).`,
      revenue: `Extract ALL revenue/sales records from this document. Include date, customer info, amounts, payment methods, invoice numbers, and itemized details if available.`,
      bank_statement: `Extract bank account information and ALL transactions from this statement. Include dates, descriptions, debits, credits, balances, and transaction types. Convert amounts to numbers only.`,
      invoice: `Extract ALL invoice details including invoice number, dates, vendor/customer info, itemized line items with quantities and prices, and totals.`,
      receipt: `Extract ALL receipt information including date, vendor, items purchased, quantities, prices, and total amount.`,
      payroll: `Extract ALL payroll records including employee names, dates, gross pay, deductions, net pay, and payment details.`
    };

    const schema = schemas[detectedType] || schemas.expense;
    const prompt = extractPrompt[detectedType] || extractPrompt.expense;

    const extractedData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nDocument: ${metadata.name || fileName}\n\nReturn structured data only, no explanations.`,
      file_urls: [`data:${metadata.mimeType};base64,${base64Content}`],
      response_json_schema: schema
    });

    return Response.json({
      success: true,
      documentType: detectedType,
      fileName: metadata.name || fileName,
      data: extractedData,
      recordCount: extractedData?.records?.length || extractedData?.transactions?.length || 0
    });

  } catch (error) {
    console.error('Extract error:', error);
    return Response.json({ 
      error: 'Extraction failed',
      details: error.message 
    }, { status: 500 });
  }
});