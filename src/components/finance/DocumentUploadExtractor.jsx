import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Loader2,
  FileUp,
  CheckCircle,
  Hammer
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const DEFAULT_EXPENSE_CATEGORIES = [
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "utilities", label: "Utilities" },
  { value: "supplies", label: "Supplies" },
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "marketing", label: "Marketing" },
  { value: "insurance", label: "Insurance" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "other", label: "Other" }
];

const DEFAULT_REVENUE_SOURCES = [
  { value: "retail_sales", label: "Retail Sales" },
  { value: "wholesale_sales", label: "Wholesale Sales" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "transport_revenue", label: "Transport Revenue" },
  { value: "contract_revenue", label: "Contract Revenue" },
  { value: "service_income", label: "Service Income" },
  { value: "owner_contribution", label: "Owner Contribution" },
  { value: "ceo_contribution", label: "CEO Contribution" },
  { value: "investor_funding", label: "Investor Funding" },
  { value: "loan", label: "Loan" },
  { value: "grant", label: "Grant" },
  { value: "dividend", label: "Dividend Return" },
  { value: "other", label: "Other" }
];

const RECORD_TYPES = [
  { value: "expense", label: "Expenses", icon: "💰", description: "Operating costs, purchases, bills" },
  { value: "revenue", label: "Revenue/Income", icon: "📈", description: "Sales, contributions, funding" },
  { value: "production", label: "Production Batches", icon: "🏭", description: "Manufacturing, production runs" },
  { value: "inventory", label: "Stock/Inventory", icon: "📦", description: "Stock receipts, inventory adjustments" },
  { value: "payroll", label: "Payroll Items", icon: "👥", description: "Salaries, bonuses, deductions" },
];

export default function DocumentUploadExtractor({ 
  open, 
  onOpenChange, 
  type = "auto", // "auto" will detect, or force a specific type
  orgId,
  currentEmployee,
  onSuccess,
  categories: customCategories,
  products = [],
  employees = [],
  warehouses = []
}) {
  const toast = useToast();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [detectedType, setDetectedType] = useState(type === "auto" ? null : type);
  const [documentSummary, setDocumentSummary] = useState(null);

  const baseCategories = type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_REVENUE_SOURCES;
  const categories = useMemo(() => {
    return [...(customCategories || baseCategories), ...dynamicCategories];
  }, [customCategories, baseCategories, dynamicCategories]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setExtractedData([]);
    setExtractedColumns([]);
    setDocumentSummary(null);
    setDetectedType(type === "auto" ? null : type);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // First, analyze document to detect what type of records to create
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and determine what type of business records should be created from it.

Available record types:
1. EXPENSE - Operating costs, purchases, bills, invoices for things bought, petty cash, maintenance costs
2. REVENUE - Sales receipts, income records, contributions, funding received, customer payments
3. PRODUCTION - Manufacturing records, production batches, batch numbers, product runs with quantities
4. INVENTORY - Stock receipts, goods received notes, inventory counts, stock adjustments
5. PAYROLL - Salary sheets, payroll records, employee payments, bonus lists, deduction schedules

Analyze the document content, headers, columns, and data to determine:
- What type of record this document represents
- A brief summary of what the document contains
- Key fields/columns detected
- Confidence level (high/medium/low)

Be specific about WHY you chose that record type.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            detected_type: { 
              type: "string", 
              enum: ["expense", "revenue", "production", "inventory", "payroll"],
              description: "The most appropriate record type for this document"
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            summary: { type: "string", description: "Brief summary of document content" },
            reasoning: { type: "string", description: "Why this record type was chosen" },
            key_columns: { type: "array", items: { type: "string" }, description: "Important columns/fields detected" },
            document_date: { type: "string", description: "Document date in YYYY-MM-DD format if found" },
            total_rows_estimate: { type: "number", description: "Estimated number of data rows" }
          }
        }
      });

      setDocumentSummary(analysisResult);
      const docType = type === "auto" ? analysisResult.detected_type : type;
      setDetectedType(docType);
      
      toast.info(
        `${RECORD_TYPES.find(r => r.value === docType)?.icon || '📄'} ${RECORD_TYPES.find(r => r.value === docType)?.label || docType} detected`,
        analysisResult.summary
      );

      // Now extract the actual data based on detected type
      const extractionSchema = {
        type: "object",
        properties: {
          document_info: {
            type: "object",
            properties: {
              date: { type: "string", description: "Document date in YYYY-MM-DD format" },
              title: { type: "string", description: "Document title or header" },
              type: { type: "string", description: "invoice, receipt, budget, expense_report, sales_report" },
              reference: { type: "string", description: "Document number or reference" }
            }
          },
          table_columns: {
            type: "array",
            items: { type: "string" },
            description: "List all column headers exactly as they appear in the table"
          },
          rows: {
            type: "array",
            description: "Extract every single row from the table - do not skip any",
            items: {
              type: "object",
              properties: {
                no: { type: "string", description: "Row number from NO or # column" },
                details: { type: "string", description: "Text from DETAILS, Description, or Item column - copy exactly" },
                unit: { type: "string", description: "Unit of measure (bags, pcs, kg, etc)" },
                est_qty: { type: "number", description: "Estimated quantity number" },
                est_unit_cost: { type: "number", description: "Estimated unit cost number" },
                est_total: { type: "number", description: "Estimated total/amount" },
                actual_qty: { type: "number", description: "Actual quantity number" },
                actual_unit_cost: { type: "number", description: "Actual unit cost number" },
                actual_total: { type: "number", description: "Actual total/amount - main value" },
                qty: { type: "number", description: "Quantity if only one qty column" },
                price: { type: "number", description: "Unit price if only one price column" },
                amount: { type: "number", description: "Amount/Total if only one amount column" },
                vendor: { type: "string", description: "Supplier or vendor name if shown" },
                customer: { type: "string", description: "Customer name if shown" },
                sku: { type: "string", description: "Product SKU or product code if shown" },
                product_name: { type: "string", description: "Product name if this is production data" },
                batch_number: { type: "string", description: "Batch number or lot number if shown" },
                expiry_date: { type: "string", description: "Expiry date in YYYY-MM-DD format if shown" },
                notes: { type: "string", description: "Any notes or remarks" },
                // Payroll specific
                employee_name: { type: "string", description: "Employee name" },
                employee_code: { type: "string", description: "Employee ID/code" },
                base_salary: { type: "number", description: "Base salary amount" },
                bonus: { type: "number", description: "Bonus amount" },
                deduction: { type: "number", description: "Deduction amount" },
                net_pay: { type: "number", description: "Net pay amount" },
                // Inventory specific
                warehouse: { type: "string", description: "Warehouse or location name" },
                stock_in: { type: "number", description: "Quantity received/added" },
                stock_out: { type: "number", description: "Quantity issued/removed" }
              }
            }
          }
        }
      };

      let result;
      let items = [];
      let docDate = analysisResult.document_date || format(new Date(), 'yyyy-MM-dd');
      let columnHeaders = analysisResult.key_columns || [];

      try {
        const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: file_url,
          json_schema: extractionSchema
        });

        if (extractResult.status === 'success' && extractResult.output) {
          result = extractResult.output;
          items = result.rows || [];
          docDate = result.document_info?.date || docDate;
          columnHeaders = result.table_columns || [];
          docType = result.document_info?.type || '';
        } else {
          throw new Error('Primary extraction failed');
        }
      } catch (primaryError) {
        console.log("ExtractDataFromUploadedFile failed, trying InvokeLLM:", primaryError);

        const fallbackResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Read this document and extract tabular data.

1. Find the document date (format as YYYY-MM-DD)
2. List ALL column headers from the table
3. For EACH row, extract:
   - no: the row number
   - details: the description/details text (copy exactly)
   - All numeric values from each column (qty, unit cost, amount, etc.)
   - vendor or customer name if present

Return every row - do not summarize or skip any data.`,
          file_urls: [file_url],
          response_json_schema: extractionSchema
        });

        result = fallbackResult;
        items = result.rows || [];
        docDate = result.document_info?.date || docDate;
        columnHeaders = result.table_columns || [];
        docType = result.document_info?.type || '';
      }

      setExtractedColumns(columnHeaders);

      const hasProductionData = items.some(item => 
        item.sku || item.batch_number || item.product_name || 
        (item.details && products.some(p => 
          p.sku && item.details.toLowerCase().includes(p.sku.toLowerCase())
        ))
      );

      if (hasProductionData && products.length > 0) {
        setDetectedType('production');
        toast.info("Production data detected", "SKU/batch information found - will create production batches");
      }

      if (items.length > 0) {
        const categorizeItem = (description) => {
          const desc = (description || '').toLowerCase();
          if (desc.includes('fuel') || desc.includes('diesel') || desc.includes('petrol')) return 'fuel';
          if (desc.includes('cement') || desc.includes('sand') || desc.includes('gravel') || desc.includes('block')) return 'materials';
          if (desc.includes('labor') || desc.includes('labour') || desc.includes('worker') || desc.includes('mason')) return 'labor';
          if (desc.includes('transport') || desc.includes('delivery') || desc.includes('hauling')) return 'transport';
          if (desc.includes('food') || desc.includes('meal') || desc.includes('lunch')) return 'supplies';
          if (desc.includes('rent')) return 'rent';
          if (desc.includes('water') || desc.includes('electric') || desc.includes('power')) return 'utilities';
          if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('fix')) return 'maintenance';
          if (desc.includes('equipment') || desc.includes('tool') || desc.includes('machine')) return 'equipment';
          if (desc.includes('iron') || desc.includes('steel') || desc.includes('rod') || desc.includes('nail')) return 'materials';
          if (desc.includes('paint') || desc.includes('finish')) return 'materials';
          return 'other';
        };

        const existingCategoryValues = categories.map(c => c.value);
        const newCategories = [];

        const matchProductBySku = (sku, description) => {
          if (!sku && !description) return null;
          const searchText = (sku || description || '').toLowerCase();
          return products.find(p => 
            (p.sku && searchText.includes(p.sku.toLowerCase())) ||
            (p.name && searchText.includes(p.name.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase() === searchText)
          );
        };

        const mappedData = items.map((item, idx) => {
          const matchedProduct = matchProductBySku(item.sku, item.product_name || item.details);
          const estAmount = parseFloat(item.est_total) || parseFloat(item.estimated_amount) || 0;
          const actAmount = parseFloat(item.actual_total) || parseFloat(item.actual_amount) || 0;
          const singleAmount = parseFloat(item.amount) || 0;
          const finalAmount = actAmount || singleAmount || estAmount || 0;

          const estQty = parseFloat(item.est_qty) || 0;
          const actQty = parseFloat(item.actual_qty) || parseFloat(item.qty) || 0;
          const estUnitCost = parseFloat(item.est_unit_cost) || 0;
          const actUnitCost = parseFloat(item.actual_unit_cost) || parseFloat(item.price) || 0;

          const description = item.details || item.description || '';
          const category = categorizeItem(description);

          if (!existingCategoryValues.includes(category) && !newCategories.find(c => c.value === category)) {
            const label = category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newCategories.push({ value: category, label, icon: Hammer });
          }

          return {
            id: `temp-${idx}`,
            selected: true,
            item_no: item.no || String(idx + 1),
            description: description,
            estimated_qty: estQty,
            estimated_unit_cost: estUnitCost,
            estimated_amount: estAmount,
            actual_qty: actQty,
            actual_unit_cost: actUnitCost,
            quantity: actQty || estQty,
            unit_price: actUnitCost || estUnitCost,
            amount: finalAmount,
            unit: item.unit || '',
            vendor: item.vendor || '',
            contributor_name: item.customer || '',
            customer_name: item.customer || '',
            reference_number: result.document_info?.reference || '',
            extra_columns: {},
            category: category,
            document_type: docType,
            date: docDate,
            status: 'pending',
            sku: item.sku || matchedProduct?.sku || '',
            product_id: matchedProduct?.id || '',
            product_name: item.product_name || matchedProduct?.name || '',
            batch_number: item.batch_number || '',
            expiry_date: item.expiry_date || '',
            is_production: !!(item.sku || item.batch_number || matchedProduct)
          };
        });

        const validData = mappedData.filter(item => 
          item.description.trim() !== '' || item.amount > 0
        );

        if (newCategories.length > 0) {
          setDynamicCategories(prev => [...prev, ...newCategories]);
          toast.info("New categories detected", `${newCategories.map(c => c.label).join(', ')}`);
        }

        setExtractedData(validData);
        const colInfo = columnHeaders.length > 0 ? ` (${columnHeaders.length} columns)` : '';
        toast.success("Data extracted", `Found ${validData.length} items${colInfo}`);
      } else {
        toast.warning("No data found", "Could not find table data in the document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateRecords = async () => {
    const selectedItems = extractedData.filter(e => e.selected);
    if (selectedItems.length === 0) {
      toast.warning("No items selected");
      return;
    }

    setUploadLoading(true);
    try {
      const isRevenue = detectedType === "revenue";
      const isProduction = detectedType === "production";
      
      let batchCount = 0;
      let expenseCount = 0;
      let revenueCount = 0;

      for (const item of selectedItems) {
        if (isProduction && item.product_id && item.is_production) {
          const batchNum = item.batch_number || `BATCH-${format(new Date(), 'yyyyMMdd')}-${String(batchCount + 1).padStart(3, '0')}`;
          
          await base44.entities.ProductionBatch.create({
            organisation_id: orgId,
            batch_number: batchNum,
            product_id: item.product_id,
            product_name: item.product_name || item.description,
            production_date: item.date || format(new Date(), 'yyyy-MM-dd'),
            expiry_date: item.expiry_date || '',
            quantity_produced: item.quantity || item.actual_qty || 0,
            quality_status: 'pending',
            supervisor_id: currentEmployee?.id,
            supervisor_name: currentEmployee?.full_name,
            status: 'completed',
            notes: `Imported from document. ${item.description || ''}`
          });
          batchCount++;
        } else if (isRevenue) {
          await base44.entities.Revenue.create({
            organisation_id: orgId,
            source: item.category,
            contributor_name: item.contributor_name || item.description,
            amount: item.amount || 0,
            date: item.date,
            reference_number: item.reference_number || '',
            purpose: item.description,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: `Imported from document`
          });
          revenueCount++;
        } else {
          await base44.entities.Expense.create({
            organisation_id: orgId,
            category: item.category,
            description: item.description,
            amount: item.amount || 0,
            date: item.date,
            vendor: item.vendor || '',
            payment_method: 'cash',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: item.estimated_amount > 0 
              ? `Est: ${item.estimated_qty} x Le${item.estimated_unit_cost.toLocaleString()} = Le${item.estimated_amount.toLocaleString()}`
              : 'Imported from document'
          });
          expenseCount++;
        }
      }

      onOpenChange(false);
      setExtractedData([]);
      setExtractedColumns([]);
      setDetectedType(type);
      
      const messages = [];
      if (batchCount > 0) messages.push(`${batchCount} production batch(es)`);
      if (expenseCount > 0) messages.push(`${expenseCount} expense(s)`);
      if (revenueCount > 0) messages.push(`${revenueCount} revenue(s)`);
      
      toast.success("Records created", messages.join(', ') + ' added');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to create records", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setExtractedData(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const updateItem = (id, field, value) => {
    setExtractedData(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const isRevenue = detectedType === "revenue";
  const isProduction = detectedType === "production";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 w-[98vw] [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import {isProduction ? 'Production Batches' : isRevenue ? 'Revenue' : 'Expenses'} from Document</h2>
              <p className="text-white/80 text-sm">Upload PDF, CSV, or images to extract {isProduction ? 'production batch' : isRevenue ? 'revenue' : 'expense'} data</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-140px)]">
          {extractedData.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0072C6] transition-colors">
              <input
                type="file"
                accept=".pdf,.csv,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="doc-upload-finance"
                disabled={uploadLoading}
              />
              <label htmlFor="doc-upload-finance" className="cursor-pointer">
                {uploadLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 text-[#0072C6] animate-spin" />
                    <p className="text-gray-600">Extracting data from document...</p>
                    <p className="text-sm text-gray-400">This may take a moment</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#0072C6]/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#0072C6]" />
                    </div>
                    <p className="text-gray-600 font-medium">Click to upload document</p>
                    <p className="text-sm text-gray-400">Supports PDF, CSV, and images (PNG, JPG)</p>
                    <p className="text-xs text-gray-400 mt-1">Tip: Save Word docs as PDF before uploading</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {extractedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-700">Extracted Data ({extractedData.length})</h3>
                  {detectedType !== type && (
                    <Badge className="bg-purple-100 text-purple-700">
                      {isProduction ? '🏭 Production Batches Detected' : isRevenue ? 'Revenue' : 'Expenses'}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {extractedData.some(e => e.is_production) && (
                    <Select value={detectedType} onValueChange={setDetectedType}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Create as Expenses</SelectItem>
                        <SelectItem value="revenue">Create as Revenue</SelectItem>
                        <SelectItem value="production">Create as Production Batches</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setExtractedData([]); setExtractedColumns([]); }}
                >
                  Clear & Upload New
                </Button>
              </div>

              {extractedColumns.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Columns detected from document:</p>
                  <div className="flex flex-wrap gap-1">
                    {extractedColumns.map((col, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-white">{col}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[calc(95vh-380px)] min-h-[300px] border rounded-lg overflow-auto">
                <div className={isProduction ? "min-w-[1200px]" : isRevenue ? "min-w-[900px]" : "min-w-[1400px]"}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            checked={extractedData.every(e => e.selected)}
                            onChange={(e) => setExtractedData(prev => prev.map(exp => ({ ...exp, selected: e.target.checked })))}
                            className="w-4 h-4"
                          />
                        </TableHead>
                        <TableHead className="text-xs">NO</TableHead>
                        {isProduction && <TableHead className="text-xs">SKU</TableHead>}
                        {isProduction && <TableHead className="text-xs">PRODUCT</TableHead>}
                        {isProduction && <TableHead className="text-xs">BATCH #</TableHead>}
                        <TableHead className="text-xs">{isProduction ? 'DESCRIPTION' : isRevenue ? 'DESCRIPTION/PRODUCT' : 'DETAILS'}</TableHead>
                        {isRevenue && (
                          <>
                            <TableHead className="text-xs text-center bg-blue-50">Qty</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Unit Price</TableHead>
                          </>
                        )}
                        {!isRevenue && (
                          <>
                            <TableHead className="text-xs">Unit</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Qty</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Unit Cost</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Amount</TableHead>
                            <TableHead className="text-xs text-center bg-green-50">Actual Qty</TableHead>
                            <TableHead className="text-xs text-center bg-green-50">Actual Unit Cost</TableHead>
                          </>
                        )}
                        <TableHead className="text-xs text-center bg-green-50">Amount</TableHead>
                        {isRevenue && <TableHead className="text-xs">Customer/Contributor</TableHead>}
                        {!isRevenue && !isProduction && <TableHead className="text-xs">Vendor</TableHead>}
                        {!isProduction && <TableHead className="text-xs">{isRevenue ? 'Revenue Type' : 'Category'}</TableHead>}
                        <TableHead className="text-xs">{isProduction ? 'Production Date' : 'Date'}</TableHead>
                        {isProduction && <TableHead className="text-xs">Expiry Date</TableHead>}
                        {extractedData.length > 0 && extractedData[0].extra_columns && Object.keys(extractedData[0].extra_columns).length > 0 && (
                          Object.keys(extractedData[0].extra_columns).map(key => (
                            <TableHead key={key} className="text-xs bg-purple-50">{key}</TableHead>
                          ))
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedData.map((item) => (
                        <TableRow key={item.id} className={!item.selected ? 'opacity-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelection(item.id)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="text-xs font-medium">{item.item_no || '-'}</TableCell>
                          {isProduction && (
                            <TableCell>
                              <Input
                                value={item.sku || ''}
                                onChange={(e) => {
                                  const sku = e.target.value;
                                  const matchedProduct = products.find(p => p.sku?.toLowerCase() === sku.toLowerCase());
                                  updateItem(item.id, 'sku', sku);
                                  if (matchedProduct) {
                                    updateItem(item.id, 'product_id', matchedProduct.id);
                                    updateItem(item.id, 'product_name', matchedProduct.name);
                                  }
                                }}
                                className="h-7 text-xs w-24"
                                placeholder="SKU"
                              />
                            </TableCell>
                          )}
                          {isProduction && (
                            <TableCell>
                              <Select
                                value={item.product_id || ''}
                                onValueChange={(v) => {
                                  const prod = products.find(p => p.id === v);
                                  updateItem(item.id, 'product_id', v);
                                  updateItem(item.id, 'product_name', prod?.name || '');
                                  updateItem(item.id, 'sku', prod?.sku || '');
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-36">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.sku ? `${p.sku} - ` : ''}{p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                          {isProduction && (
                            <TableCell>
                              <Input
                                value={item.batch_number || ''}
                                onChange={(e) => updateItem(item.id, 'batch_number', e.target.value)}
                                className="h-7 text-xs w-28"
                                placeholder="Batch #"
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              value={item.description || ''}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="h-7 text-xs min-w-[150px]"
                            />
                          </TableCell>
                          {isRevenue && (
                            <>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.unit_price || ''}
                                  onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                            </>
                          )}
                          {!isRevenue && (
                            <>
                              <TableCell>
                                <Input
                                  value={item.unit || ''}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                  className="h-7 text-xs w-16"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_qty || ''}
                                  onChange={(e) => updateItem(item.id, 'estimated_qty', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_unit_cost || ''}
                                  onChange={(e) => updateItem(item.id, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50 text-xs text-right font-medium text-blue-700">
                                Le {(item.estimated_amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_qty || ''}
                                  onChange={(e) => {
                                    const newQty = parseFloat(e.target.value) || 0;
                                    const newAmount = newQty * (item.actual_unit_cost || 0);
                                    updateItem(item.id, 'actual_qty', newQty);
                                    if (item.actual_unit_cost > 0) updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_unit_cost || ''}
                                  onChange={(e) => {
                                    const newCost = parseFloat(e.target.value) || 0;
                                    const newAmount = (item.actual_qty || 0) * newCost;
                                    updateItem(item.id, 'actual_unit_cost', newCost);
                                    if (item.actual_qty > 0) updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                            </>
                          )}
                          <TableCell className="bg-green-50/50">
                            <Input
                              type="number"
                              value={item.amount || ''}
                              onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="h-7 text-xs w-24 text-right font-medium"
                            />
                          </TableCell>
                          {isRevenue && (
                            <TableCell>
                              <Input
                                value={item.contributor_name || ''}
                                onChange={(e) => updateItem(item.id, 'contributor_name', e.target.value)}
                                className="h-7 text-xs w-28"
                              />
                            </TableCell>
                          )}
                          {!isRevenue && !isProduction && (
                            <TableCell>
                              <Input
                                value={item.vendor || ''}
                                onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                                className="h-7 text-xs w-24"
                              />
                            </TableCell>
                          )}
                          {!isProduction && (
                            <TableCell>
                              <Select
                                value={item.category}
                                onValueChange={(v) => updateItem(item.id, 'category', v)}
                              >
                                <SelectTrigger className="h-7 text-xs w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              type="date"
                              value={item.date || ''}
                              onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                              className="h-7 text-xs w-32"
                            />
                          </TableCell>
                          {isProduction && (
                            <TableCell>
                              <Input
                                type="date"
                                value={item.expiry_date || ''}
                                onChange={(e) => updateItem(item.id, 'expiry_date', e.target.value)}
                                className="h-7 text-xs w-32"
                              />
                            </TableCell>
                          )}
                          {item.extra_columns && Object.keys(item.extra_columns).length > 0 && (
                            Object.entries(item.extra_columns).map(([key, value]) => (
                              <TableCell key={key} className="bg-purple-50/50 text-xs">
                                {value?.toString() || '-'}
                              </TableCell>
                            ))
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {extractedData.filter(e => e.selected).length} item(s) selected
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: Le {extractedData.filter(e => e.selected).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleCreateRecords}
                  disabled={uploadLoading || extractedData.filter(e => e.selected).length === 0}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {uploadLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Create {extractedData.filter(e => e.selected).length} {isProduction ? 'Batch(es)' : isRevenue ? 'Revenue' : 'Expense'}(s)
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}