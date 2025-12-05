import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function DocumentUploadExtractor({ 
  open, 
  onOpenChange, 
  type = "expense", // "expense" or "revenue"
  orgId,
  currentEmployee,
  onSuccess,
  categories: customCategories
}) {
  const toast = useToast();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);

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

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const isRevenue = type === "revenue";
      const prompt = isRevenue 
        ? `TASK: Extract revenue/income data from the uploaded document.

READ THE DOCUMENT CAREFULLY. Look at:
1. The document title and header for the DATE (convert to YYYY-MM-DD format)
2. Any tables with line items, products, or transactions
3. ALL column headers - write them exactly as shown

FOR EACH LINE ITEM IN THE TABLE, extract these fields by reading the corresponding column:
- item_no: The row number or "NO" column value
- description: The exact text from the "Description", "Product", "Item", or "Details" column - copy word for word
- quantity: The number from "Qty", "Quantity", or count column
- unit_price: The number from "Unit Price", "Rate", "Price" column
- amount: The number from "Amount", "Total", "Subtotal" column (this is the money value)
- customer_name: Customer name if shown
- reference_number: Invoice number, receipt number if shown
- source: Choose the best match: retail_sales, wholesale_sales, transport_revenue, contract_revenue, service_income, owner_contribution, loan, grant, other

RULES:
- Extract EVERY row that has data - do not skip any
- Copy text exactly as written in the document
- If a cell is empty, leave that field empty
- Numbers should be extracted as numbers (remove currency symbols)
- The "amount" is usually in the rightmost numeric column`
        : `TASK: Extract expense data from the uploaded document.

READ THE DOCUMENT CAREFULLY. Look at:
1. The document title and header for the DATE (convert to YYYY-MM-DD format)
2. The main table with expense line items
3. ALL column headers - write them exactly as they appear in the document

COLUMN MAPPING - Match document columns to these fields:
- "NO" or "#" or row number → item_no
- "DETAILS" or "Description" or "Item" → description (COPY EXACT TEXT)
- "ESTIMATED QTY" or "Est. Qty" → estimated_qty
- "ESTIMATED UNIT COST" or "Est. Unit Price" → estimated_unit_cost  
- "ESTIMATED AMOUNT" or "Est. Total" → estimated_amount
- "ACTUAL QTY" or "Act. Qty" → actual_qty
- "ACTUAL UNIT COST" or "Act. Unit Price" → actual_unit_cost
- "ACTUAL AMOUNT" or "Act. Total" or rightmost amount column → actual_amount
- "UNIT" → unit (bags, pieces, kg, etc.)
- Any supplier or vendor name → vendor

FOR EACH ROW in the table:
1. Read the item number from the first column
2. Read the description/details text EXACTLY as written
3. Read each numeric value from its corresponding column
4. The main expense amount is usually in "ACTUAL AMOUNT" or the rightmost total column

CATEGORY: Based on the description, assign one of: fuel, maintenance, utilities, supplies, rent, materials, labor, equipment, transport, construction, or create a fitting category name.

RULES:
- Extract ALL rows with data - every single line item
- Copy the description text exactly as it appears
- Numbers only (no currency symbols like "Le" or commas)
- Empty cells = leave field empty or 0 for numbers
- Do NOT summarize or combine rows`;

      const schema = isRevenue 
        ? {
            type: "object",
            properties: {
              document_date: { type: "string", description: "Document date in YYYY-MM-DD format" },
              document_type: { type: "string", enum: ["sales_invoice", "receipt", "transport_log", "contract", "contribution", "other"] },
              column_headers: { type: "array", items: { type: "string" }, description: "Exact column headers from document" },
              items: {
                type: "array",
                description: "One object per table row",
                items: {
                  type: "object",
                  properties: {
                    item_no: { type: "string" },
                    description: { type: "string", description: "Exact text from description column" },
                    quantity: { type: "number" },
                    unit_price: { type: "number" },
                    amount: { type: "number", description: "The total/amount value for this line" },
                    source: { type: "string", enum: ["retail_sales", "wholesale_sales", "vehicle_sales", "transport_revenue", "contract_revenue", "service_income", "owner_contribution", "ceo_contribution", "investor_funding", "loan", "grant", "other"] },
                    customer_name: { type: "string" },
                    reference_number: { type: "string" }
                  }
                }
              }
            }
          }
        : {
            type: "object",
            properties: {
              document_date: { type: "string", description: "Document date in YYYY-MM-DD format" },
              document_type: { type: "string", enum: ["invoice", "bill", "purchase_order", "expense_report", "budget", "quotation", "other"] },
              column_headers: { type: "array", items: { type: "string" }, description: "Exact column headers from document table" },
              items: {
                type: "array",
                description: "One object per table row - extract every row",
                items: {
                  type: "object",
                  properties: {
                    item_no: { type: "string", description: "Value from NO or # column" },
                    description: { type: "string", description: "Exact text from DETAILS or Description column" },
                    unit: { type: "string", description: "Unit of measurement" },
                    estimated_qty: { type: "number" },
                    estimated_unit_cost: { type: "number" },
                    estimated_amount: { type: "number" },
                    actual_qty: { type: "number" },
                    actual_unit_cost: { type: "number" },
                    actual_amount: { type: "number", description: "Main expense amount from rightmost amount column" },
                    vendor: { type: "string" },
                    category: { type: "string", description: "Expense category based on description" }
                  }
                }
              }
            }
          };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt + "\n\nRespond with a JSON object containing document_date, document_type, column_headers (array of exact column names), and items (array with one object per row).",
        file_urls: [file_url],
        response_json_schema: schema
      });

      const items = result.items || result.expenses || [];
      const docDate = result.document_date || format(new Date(), 'yyyy-MM-dd');
      const columnHeaders = result.column_headers || [];
      
      setExtractedColumns(columnHeaders);
      
      if (items.length > 0) {
        const existingCategoryValues = categories.map(c => c.value);
        const newCategories = [];
        
        items.forEach(item => {
          const catValue = (item.category || item.source || 'other').toLowerCase().replace(/\s+/g, '_');
          if (!existingCategoryValues.includes(catValue) && !newCategories.find(c => c.value === catValue)) {
            const label = catValue.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newCategories.push({ value: catValue, label, icon: Hammer });
          }
        });

        if (newCategories.length > 0) {
          setDynamicCategories(prev => [...prev, ...newCategories]);
          toast.info("New categories added", `${newCategories.map(c => c.label).join(', ')}`);
        }

        const docType = result.document_type || '';
        
        const mappedData = items.map((item, idx) => {
          // Parse numbers - handle strings with commas or currency symbols
          const parseNum = (val) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            const cleaned = String(val).replace(/[^0-9.-]/g, '');
            return parseFloat(cleaned) || 0;
          };

          const estQty = parseNum(item.estimated_qty);
          const estUnitCost = parseNum(item.estimated_unit_cost);
          const estAmount = parseNum(item.estimated_amount);
          const actQty = parseNum(item.actual_qty);
          const actUnitCost = parseNum(item.actual_unit_cost);
          const actAmount = parseNum(item.actual_amount);
          const qty = parseNum(item.quantity);
          const unitPrice = parseNum(item.unit_price);
          const rawAmount = parseNum(item.amount);

          // Calculate estimated amount if not provided but qty and cost exist
          const calculatedEstAmount = estAmount || (estQty && estUnitCost ? estQty * estUnitCost : 0);
          // Calculate actual amount if not provided
          const calculatedActAmount = actAmount || (actQty && actUnitCost ? actQty * actUnitCost : 0);
          // Final amount priority: actual_amount > amount > calculated actual > estimated
          const finalAmount = calculatedActAmount || rawAmount || (qty && unitPrice ? qty * unitPrice : 0) || calculatedEstAmount;
          
          return {
            id: `temp-${idx}`,
            selected: finalAmount > 0 || item.description, // Only select if has amount or description
            item_no: item.item_no || String(idx + 1),
            description: (item.description || '').trim(),
            estimated_qty: estQty,
            estimated_unit_cost: estUnitCost,
            estimated_amount: calculatedEstAmount,
            actual_qty: actQty || qty,
            actual_unit_cost: actUnitCost || unitPrice,
            quantity: qty || actQty,
            unit_price: unitPrice || actUnitCost,
            amount: finalAmount,
            unit: (item.unit || '').trim(),
            vendor: (item.vendor || '').trim(),
            contributor_name: (item.contributor_name || item.customer_name || '').trim(),
            customer_name: (item.customer_name || '').trim(),
            reference_number: (item.reference_number || '').trim(),
            extra_columns: item.extra_columns || {},
            category: (item.category || item.source || 'other').toLowerCase().replace(/\s+/g, '_'),
            document_type: docType,
            date: docDate,
            status: 'pending'
          };
        }).filter(item => item.description || item.amount > 0); // Filter out empty rows

        setExtractedData(mappedData);
        const typeLabel = docType ? ` (${docType})` : '';
        toast.success("Data extracted", `Found ${items.length} item(s)${typeLabel}${columnHeaders.length > 0 ? ` with ${columnHeaders.length} columns` : ''}`);
      } else {
        toast.warning("No data found", "Could not find data in the document");
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
      const isRevenue = type === "revenue";
      
      for (const item of selectedItems) {
        if (isRevenue) {
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
        }
      }

      onOpenChange(false);
      setExtractedData([]);
      setExtractedColumns([]);
      toast.success("Records created", `${selectedItems.length} ${type}(s) added`);
      
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

  const isRevenue = type === "revenue";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 w-[98vw] [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Header with gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import {isRevenue ? 'Revenue' : 'Expenses'} from Document</h2>
              <p className="text-white/80 text-sm">Upload PDF, CSV, or images to extract {isRevenue ? 'revenue' : 'expense'} data</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Upload Area */}
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

          {/* Extracted Data Preview */}
          {extractedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Extracted {isRevenue ? 'Revenue' : 'Expenses'} ({extractedData.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setExtractedData([]); setExtractedColumns([]); }}
                >
                  Clear & Upload New
                </Button>
              </div>

              {/* Show extracted columns info */}
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

              <ScrollArea className="h-[calc(95vh-380px)] min-h-[300px] border rounded-lg">
                <div className={isRevenue ? "min-w-[900px]" : "min-w-[1200px]"}>
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
                        <TableHead className="text-xs">{isRevenue ? 'DESCRIPTION/PRODUCT' : 'DETAILS'}</TableHead>
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
                        {!isRevenue && <TableHead className="text-xs">Vendor</TableHead>}
                        <TableHead className="text-xs">{isRevenue ? 'Revenue Type' : 'Category'}</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
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
                                  onChange={(e) => updateItem(item.id, 'actual_qty', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_unit_cost || ''}
                                  onChange={(e) => updateItem(item.id, 'actual_unit_cost', parseFloat(e.target.value) || 0)}
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
                          {isRevenue ? (
                            <TableCell>
                              <Input
                                value={item.contributor_name || ''}
                                onChange={(e) => updateItem(item.id, 'contributor_name', e.target.value)}
                                className="h-7 text-xs w-28"
                              />
                            </TableCell>
                          ) : (
                            <TableCell>
                              <Input
                                value={item.vendor || ''}
                                onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                                className="h-7 text-xs w-24"
                              />
                            </TableCell>
                          )}
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
                          <TableCell>
                            <Input
                              type="date"
                              value={item.date || ''}
                              onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                              className="h-7 text-xs w-32"
                            />
                          </TableCell>
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
              </ScrollArea>

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
                  Create {extractedData.filter(e => e.selected).length} {isRevenue ? 'Revenue' : 'Expense'}(s)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}