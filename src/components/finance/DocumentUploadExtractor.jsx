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
  { value: "owner_contribution", label: "Owner Contribution" },
  { value: "ceo_contribution", label: "CEO Contribution" },
  { value: "investor_funding", label: "Investor Funding" },
  { value: "loan", label: "Loan" },
  { value: "grant", label: "Grant" },
  { value: "dividend", label: "Dividend Return" },
  { value: "sales_revenue", label: "Sales Revenue" },
  { value: "service_income", label: "Service Income" },
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
        ? `Extract all revenue/income line items from this document. 

First, identify ALL columns present in the table. Common columns include but are not limited to:
- NO/Item Number
- Description/Details
- Source/Type
- Amount
- Date
- Reference Number
- Any other columns present

Also look for a DATE in the document header or anywhere else.

For each row/line item found, extract ALL available data including:
- item_no: the NO/item number
- description: the description/details field
- amount: the amount value
- source: classify as one of: owner_contribution, ceo_contribution, investor_funding, loan, grant, dividend, sales_revenue, service_income. If no existing source fits, create a new descriptive name (lowercase, use underscores).
- contributor_name: name of contributor if present
- reference_number: reference/transaction number if present
- extra_columns: any other columns found as key-value pairs

Also list all column headers found in the document.
Extract ALL line items from the document.`
        : `Extract all expense line items from this document. 

First, identify ALL columns present in the table. Common columns include but are not limited to:
- NO/Item Number
- DETAILS/Description
- Estimated Qty, Estimated Unit Cost, Estimated Amount
- Actual Qty, Actual Unit Cost, Actual Amount
- Any other columns present (unit, supplier, notes, etc.)

Also look for a DATE in the document header or anywhere else.

For each row/line item found, extract ALL available data including:
- item_no: the NO/item number
- description: the DETAILS/description field
- estimated_qty: Estimated Qty value (if present)
- estimated_unit_cost: Estimated unit cost value (if present)
- estimated_amount: Estimated Amount/total (if present)
- actual_qty: ACTUAL QTY value (if present)
- actual_unit_cost: ACTUAL UNIT COST value (if present)
- actual_amount: ACTUAL AMOUNT/total (if present) - this is the main expense amount
- unit: unit of measurement (if present)
- vendor: vendor/supplier name (if present)
- extra_columns: any other columns found as key-value pairs
- category: classify based on description. Use existing categories if they match: fuel, maintenance, utilities, supplies, rent, salaries, transport, marketing, insurance, petty_cash. If no existing category fits well, create a new descriptive category name (lowercase, use underscores).

Also list all column headers found in the document.
Extract ALL line items from the document.`;

      const schema = isRevenue 
        ? {
            type: "object",
            properties: {
              document_date: { type: "string", description: "Date found in document in YYYY-MM-DD format" },
              column_headers: { type: "array", items: { type: "string" } },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item_no: { type: "string" },
                    description: { type: "string" },
                    amount: { type: "number" },
                    source: { type: "string" },
                    contributor_name: { type: "string" },
                    reference_number: { type: "string" },
                    extra_columns: { type: "object", additionalProperties: true }
                  }
                }
              }
            }
          }
        : {
            type: "object",
            properties: {
              document_date: { type: "string", description: "Date found in document in YYYY-MM-DD format" },
              column_headers: { type: "array", items: { type: "string" } },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item_no: { type: "string" },
                    description: { type: "string" },
                    estimated_qty: { type: "number" },
                    estimated_unit_cost: { type: "number" },
                    estimated_amount: { type: "number" },
                    actual_qty: { type: "number" },
                    actual_unit_cost: { type: "number" },
                    actual_amount: { type: "number" },
                    unit: { type: "string" },
                    vendor: { type: "string" },
                    extra_columns: { type: "object", additionalProperties: true },
                    category: { type: "string" }
                  }
                }
              }
            }
          };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
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

        const mappedData = items.map((item, idx) => ({
          id: `temp-${idx}`,
          selected: true,
          item_no: item.item_no || '',
          description: item.description || '',
          estimated_qty: item.estimated_qty || 0,
          estimated_unit_cost: item.estimated_unit_cost || 0,
          estimated_amount: item.estimated_amount || 0,
          actual_qty: item.actual_qty || 0,
          actual_unit_cost: item.actual_unit_cost || 0,
          amount: item.actual_amount || item.amount || 0,
          unit: item.unit || '',
          vendor: item.vendor || '',
          contributor_name: item.contributor_name || '',
          reference_number: item.reference_number || '',
          extra_columns: item.extra_columns || {},
          category: (item.category || item.source || 'other').toLowerCase().replace(/\s+/g, '_'),
          date: docDate,
          status: 'pending'
        }));

        setExtractedData(mappedData);
        toast.success("Data extracted", `Found ${items.length} item(s) in document${columnHeaders.length > 0 ? ` with ${columnHeaders.length} columns` : ''}${docDate !== format(new Date(), 'yyyy-MM-dd') ? ` (Date: ${docDate})` : ''}`);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 w-[95vw] [&>button]:hidden">
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

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
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

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className={isRevenue ? "min-w-[700px]" : "min-w-[1100px]"}>
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
                        <TableHead className="text-xs">{isRevenue ? 'DESCRIPTION' : 'DETAILS'}</TableHead>
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
                        {isRevenue && <TableHead className="text-xs">Contributor</TableHead>}
                        {!isRevenue && <TableHead className="text-xs">Vendor</TableHead>}
                        <TableHead className="text-xs">{isRevenue ? 'Source' : 'Category'}</TableHead>
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