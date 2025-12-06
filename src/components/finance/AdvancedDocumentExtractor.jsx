import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, Loader2, CheckCircle, X, Sparkles, AlertCircle, 
  ZoomIn, ZoomOut, RotateCw, Trash2, RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const RECORD_TYPES = [
  { value: "expense", label: "Expenses", icon: "💰" },
  { value: "revenue", label: "Revenue/Sales", icon: "📈" },
];

const EXPENSE_CATEGORIES = [
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "utilities", label: "Utilities" },
  { value: "supplies", label: "Supplies" },
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "marketing", label: "Marketing" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export default function AdvancedDocumentExtractor({ 
  open, 
  onOpenChange, 
  orgId,
  currentEmployee,
  onSuccess,
}) {
  const toast = useToast();
  const [stage, setStage] = useState("upload"); // upload, processing, editing
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [recordType, setRecordType] = useState("expense");
  const [extractedData, setExtractedData] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [currencyMode, setCurrencyMode] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currencyMode === null) {
      setPendingFile(file);
      setShowCurrencyDialog(true);
    } else {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setLoading(true);
    setStage("processing");
    setFileName(file.name);
    setPendingFile(file);
    
    try {
      // Step 1: Upload
      toast.info("Uploading...", "Processing your document");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);

      // Step 2: Extract data with simple, direct prompt
      toast.info("Extracting data...", "AI is reading the document");
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL line items from this business document.

For EACH line item you find, extract:
- description: what the item/expense is
- amount: the numeric value (just the number, no currency symbols)
- date: if visible, otherwise leave empty
- category: type of expense/item if mentioned

CRITICAL RULES:
1. Extract EVERY SINGLE LINE - don't skip any rows
2. For amounts: Remove commas and currency symbols (Le 1,500.50 → 1500.50)
3. Skip only header rows and total rows
4. If you see 10 items, return 10 items. If you see 50, return 50.

Return an array of all items found.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      console.log("Extraction result:", result);

      const conversionFactor = currencyMode === 'sll' ? 1000 : 1;
      const items = (result?.items || [])
        .filter(item => item.description && item.amount > 0)
        .map((item, idx) => ({
          id: `item-${idx}`,
          selected: true,
          description: item.description,
          amount: (item.amount || 0) / conversionFactor,
          category: item.category || 'other',
          date: item.date || format(new Date(), 'yyyy-MM-dd'),
          vendor: ''
        }));

      console.log("Processed items:", items);

      if (items.length === 0) {
        toast.warning("No data found", "Couldn't extract any items. Try a clearer image or different document.");
        setStage("upload");
        return;
      }

      setExtractedData(items);
      setStage("editing");
      toast.success("Extraction complete", `Found ${items.length} items`);

    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Processing failed", error.message);
      setStage("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecords = async () => {
    const selected = extractedData.filter(e => e.selected);
    if (selected.length === 0) {
      toast.warning("No items selected");
      return;
    }

    setLoading(true);
    try {
      for (const item of selected) {
        if (recordType === "expense") {
          await base44.entities.Expense.create({
            organisation_id: orgId,
            category: item.category,
            description: item.description,
            amount: item.amount,
            date: item.date,
            vendor: item.vendor,
            payment_method: 'cash',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: 'AI extracted from document'
          });
        } else if (recordType === "revenue") {
          await base44.entities.Revenue.create({
            organisation_id: orgId,
            source: item.category,
            contributor_name: item.vendor || item.description,
            amount: item.amount,
            date: item.date,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'confirmed',
            notes: 'AI extracted from document'
          });
        }
      }

      toast.success("Records created", `Created ${selected.length} ${recordType} records`);
      resetState();
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create records", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStage("upload");
    setFileUrl(null);
    setFileName("");
    setExtractedData([]);
    setPendingFile(null);
    setZoom(100);
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

  const selectedCount = extractedData.filter(e => e.selected).length;
  const selectedTotal = extractedData.filter(e => e.selected).reduce((sum, e) => sum + e.amount, 0);

  const isPDF = fileName.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetState(); onOpenChange(isOpen); }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0 [&>button]:hidden">
          {/* Header */}
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Document Extraction</h2>
                  <p className="text-white/80 text-sm">Upload and extract data automatically</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            
            {/* Upload Stage */}
            {stage === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#0072C6] transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="doc-upload"
                    disabled={loading}
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-[#0072C6]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">
                          Upload Business Document
                        </p>
                        <p className="text-sm text-gray-500">
                          Invoices, receipts, expense reports - AI will extract all items
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {RECORD_TYPES.map(rt => (
                          <Badge key={rt.value} variant="outline" className="text-xs">
                            {rt.icon} {rt.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Processing Stage */}
            {stage === "processing" && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-16 h-16 text-[#0072C6] animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Processing Document...</p>
                <p className="text-sm text-gray-500">AI is extracting all data</p>
              </div>
            )}

            {/* Editing Stage */}
            {stage === "editing" && (
              <div className="space-y-4">
                {/* Document Preview */}
                {fileUrl && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative bg-white rounded-lg border overflow-hidden">
                        {isPDF ? (
                          <iframe 
                            src={fileUrl}
                            className="w-full h-[400px]"
                            title="Document"
                          />
                        ) : (
                          <div className="relative bg-gray-50 flex items-center justify-center p-4">
                            <img 
                              src={fileUrl} 
                              alt="Document" 
                              className="max-w-full h-auto"
                              style={{ 
                                transform: `scale(${zoom/100})`,
                                transition: 'transform 0.2s'
                              }}
                            />
                            <div className="absolute bottom-2 right-2 flex gap-1 bg-black/80 rounded-lg p-1.5">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                                <ZoomOut className="w-4 h-4" />
                              </Button>
                              <span className="px-2 text-white text-xs flex items-center">{zoom}%</span>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                                <ZoomIn className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setZoom(100)}>
                                <RotateCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Data Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Extracted Data ({extractedData.length} items)</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => pendingFile && processFile(pendingFile)} disabled={loading}>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Re-extract
                      </Button>
                      <Select value={recordType} onValueChange={setRecordType}>
                        <SelectTrigger className="w-[150px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECORD_TYPES.map(rt => (
                            <SelectItem key={rt.value} value={rt.value}>
                              {rt.icon} {rt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-auto max-h-[400px] bg-white">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50">
                        <TableRow>
                          <TableHead className="w-10">
                            <input
                              type="checkbox"
                              checked={extractedData.every(e => e.selected)}
                              onChange={(e) => setExtractedData(prev => prev.map(item => ({ ...item, selected: e.target.checked })))}
                              className="w-4 h-4"
                            />
                          </TableHead>
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs min-w-[200px]">Description</TableHead>
                          <TableHead className="text-xs text-right w-28">Amount (Le)</TableHead>
                          <TableHead className="text-xs w-36">Category</TableHead>
                          <TableHead className="text-xs w-32">Date</TableHead>
                          <TableHead className="text-xs w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedData.map((item, idx) => (
                          <TableRow key={item.id} className={!item.selected ? 'opacity-50' : ''}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleSelection(item.id)}
                                className="w-4 h-4"
                              />
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">{idx + 1}</TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.amount}
                                onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-8 text-xs text-right font-bold"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={item.category} onValueChange={(v) => updateItem(item.id, 'category', v)}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {EXPENSE_CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={item.date}
                                onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500"
                                onClick={() => setExtractedData(prev => prev.filter(e => e.id !== item.id))}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{selectedCount} items selected</p>
                    <p className="text-sm text-gray-500">Total: Le {selectedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetState}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRecords}
                      disabled={loading || selectedCount === 0}
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Create {selectedCount} Record(s)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Currency Dialog */}
      <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Document Currency?</h3>
              <p className="text-sm text-gray-600">Select currency used in the document</p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full py-6 text-left hover:border-green-500"
                onClick={() => {
                  setCurrencyMode('sle');
                  setShowCurrencyDialog(false);
                  if (pendingFile) processFile(pendingFile);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <div className="font-bold">New Leone (SLE)</div>
                    <div className="text-xs text-gray-600">Current - amounts like 75, 1,500</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full py-6 text-left hover:border-blue-500"
                onClick={() => {
                  setCurrencyMode('sll');
                  setShowCurrencyDialog(false);
                  if (pendingFile) processFile(pendingFile);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div>
                    <div className="font-bold">Old Leone (SLL)</div>
                    <div className="text-xs text-gray-600">Pre-2022 - divide by 1000</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}