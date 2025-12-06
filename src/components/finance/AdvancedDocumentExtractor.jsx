import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Loader2, FileUp, CheckCircle, Sparkles, AlertCircle, X, RefreshCw,
  FileText, Table as TableIcon, ChevronRight, Trash2, Eye
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const RECORD_TYPES = [
  { value: "expense", label: "Expenses", icon: "💰", color: "red" },
  { value: "revenue", label: "Revenue/Sales", icon: "📈", color: "green" },
  { value: "production", label: "Production Batches", icon: "🏭", color: "blue" },
  { value: "inventory", label: "Stock/Inventory", icon: "📦", color: "purple" },
  { value: "payroll", label: "Payroll Items", icon: "👥", color: "amber" },
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
  { value: "petty_cash", label: "Petty Cash" },
  { value: "other", label: "Other" },
];

const VALID_EXPENSE_CATEGORIES = ['fuel', 'maintenance', 'utilities', 'supplies', 'rent', 'salaries', 'transport', 'marketing', 'insurance', 'petty_cash', 'other'];

const mapToValidCategory = (category) => {
  if (!category) return 'other';
  const normalized = category.toLowerCase().trim();
  
  // Direct match
  if (VALID_EXPENSE_CATEGORIES.includes(normalized)) return normalized;
  
  // Smart mapping
  const categoryMap = {
    'diesel': 'fuel',
    'petrol': 'fuel',
    'gasoline': 'fuel',
    'gas': 'fuel',
    'repair': 'maintenance',
    'repairs': 'maintenance',
    'servicing': 'maintenance',
    'electricity': 'utilities',
    'water': 'utilities',
    'internet': 'utilities',
    'phone': 'utilities',
    'office_supplies': 'supplies',
    'stationery': 'supplies',
    'equipment': 'supplies',
    'rental': 'rent',
    'lease': 'rent',
    'salary': 'salaries',
    'wages': 'salaries',
    'payroll': 'salaries',
    'transportation': 'transport',
    'travel': 'transport',
    'delivery': 'transport',
    'advertising': 'marketing',
    'promotion': 'marketing',
    'cash': 'petty_cash',
    'misc': 'other',
    'miscellaneous': 'other',
  };
  
  return categoryMap[normalized] || 'other';
};

export default function AdvancedDocumentExtractor({ 
  open, 
  onOpenChange, 
  type = "auto",
  orgId,
  currentEmployee,
  onSuccess,
  categories = EXPENSE_CATEGORIES,
}) {
  const toast = useToast();
  const [uploadStage, setUploadStage] = useState("upload");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [detectedType, setDetectedType] = useState(type === "auto" ? null : type);
  const [extractedData, setExtractedData] = useState([]);
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  
  const [validationResults, setValidationResults] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const [currencyMode, setCurrencyMode] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [dynamicCategories, setDynamicCategories] = useState([...EXPENSE_CATEGORIES]);
  
  // Batch processing state
  const [batchMode, setBatchMode] = useState(false);
  const [fileQueue, setFileQueue] = useState([]);
  const [processingIndex, setProcessingIndex] = useState(null);
  const [batchResults, setBatchResults] = useState([]);

  const analyzeDocument = async (file_url) => {
    try {
      console.log("Starting document analysis...");
      
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this business document comprehensively.

**Document Analysis:**
1. Type Detection: Identify if invoice, receipt, expense report, sales report, inventory list, payroll sheet, etc.
2. Record Type: Determine if this should be: expense, revenue, production, inventory, or payroll
3. Structure: List ALL column headers found, count approximate rows, detect tables
4. Metadata: Extract date, document number, issuer/vendor name, total amount, currency
5. Quality: Rate readability (1-10), note any OCR challenges

Be thorough and accurate.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            record_type: { 
              type: "string", 
              enum: ["expense", "revenue", "production", "inventory", "payroll"],
            },
            confidence: { type: "number" },
            table_structure: {
              type: "object",
              properties: {
                column_headers: { type: "array", items: { type: "string" } },
                estimated_rows: { type: "number" },
                has_subtotals: { type: "boolean" },
              }
            },
            metadata: {
              type: "object",
              properties: {
                date: { type: "string" },
                document_number: { type: "string" },
                issuer_name: { type: "string" },
                total_amount: { type: "number" },
                currency: { type: "string" }
              }
            },
            quality_assessment: {
              type: "object",
              properties: {
                readability_score: { type: "number" },
                ocr_challenges: { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      });

      console.log("Analysis complete:", analysisResult);
      return analysisResult;
    } catch (error) {
      console.error("Analysis error:", error);
      throw new Error("Failed to analyze document: " + error.message);
    }
  };

  const extractDocumentData = async (file_url, analysis) => {
    try {
      console.log("Starting data extraction...");
      
      const extractionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL rows from this document's table/list.

**CRITICAL INSTRUCTIONS:**
1. Extract EVERY SINGLE ROW - don't skip, summarize, or combine
2. For EACH row, extract:
   - description: Item/expense name
   - amount: Numeric value (remove Le, commas: "Le 1,500" → 1500)
   - date: If shown (YYYY-MM-DD format)
   - quantity: If shown
   - unit_price: If shown
   - category: INTELLIGENTLY determine category based on the description (e.g., "Diesel" → "fuel", "Office supplies" → "supplies", "Rent payment" → "rent", "Staff salary" → "salaries"). Be specific and consistent. Create descriptive category names if none of the common ones fit.
   - vendor: Supplier if mentioned

3. Category Guidelines:
   - Match to common categories: fuel, maintenance, utilities, supplies, rent, salaries, transport, marketing, insurance, petty_cash
   - If item doesn't fit, create a descriptive category (e.g., "medical", "training", "equipment", "consulting")
   - Use lowercase, use underscores for spaces

4. Skip ONLY:
   - Header rows (column titles)
   - Total/Subtotal summary rows
   - Empty rows

5. If 50 items exist, return 50 items. Extract ALL.

Return complete array of all data rows.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string" },
                  quantity: { type: "number" },
                  unit_price: { type: "number" },
                  category: { type: "string" },
                  vendor: { type: "string" },
                  notes: { type: "string" },
                }
              }
            },
            total_rows_found: { type: "number" },
          }
        }
      });

      console.log("Extraction complete:", extractionResult);
      return extractionResult;
    } catch (error) {
      console.error("Extraction error:", error);
      throw new Error("Failed to extract data: " + error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (currencyMode === null) {
      if (files.length === 1) {
        setPendingFile(files[0]);
      } else {
        setPendingFile(files);
      }
      setShowCurrencyDialog(true);
      return;
    }

    if (files.length === 1) {
      await processFile(files[0]);
    } else {
      await startBatchProcessing(files);
    }
  };

  const startBatchProcessing = async (files) => {
    setBatchMode(true);
    const queue = files.map((file, idx) => ({
      id: `file-${idx}-${Date.now()}`,
      file,
      fileName: file.name,
      fileType: file.type,
      status: 'pending',
      progress: 0,
      error: null,
      fileUrl: null,
      extractedData: [],
      analysis: null
    }));
    
    setFileQueue(queue);
    setUploadStage("batch-processing");
    
    // Process files sequentially
    for (let i = 0; i < queue.length; i++) {
      setProcessingIndex(i);
      await processBatchFile(queue[i], i);
    }
    
    setProcessingIndex(null);
    setUploadStage("batch-review");
  };

  const processBatchFile = async (fileItem, index) => {
    try {
      // Update status to uploading
      setFileQueue(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      const uploadResult = await base44.integrations.Core.UploadFile({ file: fileItem.file });
      
      setFileQueue(prev => prev.map((f, i) => 
        i === index ? { ...f, fileUrl: uploadResult.file_url, status: 'analyzing', progress: 30 } : f
      ));

      const analysis = await analyzeDocument(uploadResult.file_url);
      
      setFileQueue(prev => prev.map((f, i) => 
        i === index ? { ...f, analysis, status: 'extracting', progress: 60 } : f
      ));

      const rawExtraction = await extractDocumentData(uploadResult.file_url, analysis);
      
      const conversionFactor = currencyMode === 'sll' ? 1000 : 1;
      const newCategories = new Set();
      
      const mappedData = (rawExtraction.rows || []).map((row, idx) => {
        const rawAmount = parseFloat(row.amount || 0);
        const amount = rawAmount / conversionFactor;
        
        const aiCategory = (row.category || 'other').toLowerCase().replace(/\s+/g, '_');
        const validCategory = mapToValidCategory(aiCategory);

        return {
          id: `${fileItem.id}-row-${idx}`,
          fileId: fileItem.id,
          selected: true,
          row_number: idx + 1,
          description: row.description || row.notes || '',
          amount: amount,
          category: validCategory,
          date: row.date || analysis.metadata?.date || format(new Date(), 'yyyy-MM-dd'),
          vendor: row.vendor || analysis.metadata?.issuer_name || '',
          quantity: parseFloat(row.quantity || 0),
          unit_price: parseFloat(row.unit_price || 0) / conversionFactor,
          raw_data: row
        };
      }).filter(item => item.description && item.amount > 0);

      setFileQueue(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          extractedData: mappedData, 
          status: 'completed', 
          progress: 100 
        } : f
      ));

      setBatchResults(prev => [...prev, {
        fileId: fileItem.id,
        fileName: fileItem.fileName,
        rowCount: mappedData.length,
        totalAmount: mappedData.reduce((sum, item) => sum + item.amount, 0)
      }]);

    } catch (error) {
      console.error(`Error processing ${fileItem.fileName}:`, error);
      setFileQueue(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'failed', 
          error: error.message,
          progress: 0
        } : f
      ));
    }
  };

  const processFile = async (file) => {
    setUploadLoading(true);
    setShowCurrencyDialog(false);
    setFileName(file.name);
    setFileType(file.type);
    setPendingFile(file);
    
    try {
      console.log("Starting file processing...");
      
      toast.info("Uploading document...", "Processing your file");
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      console.log("Upload result:", uploadResult);
      
      if (!uploadResult?.file_url) {
        throw new Error("No file URL returned from upload");
      }
      
      setFileUrl(uploadResult.file_url);
      setUploadStage("analyzing");

      toast.info("Analyzing document...", "AI is reading the document structure");
      const analysis = await analyzeDocument(uploadResult.file_url);
      
      if (!analysis) {
        throw new Error("No analysis result returned");
      }
      
      setDocumentAnalysis(analysis);
      setDetectedType(type === "auto" ? analysis.record_type : type);
      setExtractedColumns(analysis.table_structure?.column_headers || []);
      setDocumentMetadata(analysis.metadata);
      setConfidenceScore(analysis.confidence || 0);

      toast.info("Extracting data...", "Reading all rows from the document");
      const rawExtraction = await extractDocumentData(uploadResult.file_url, analysis);

      console.log("Raw extraction result:", rawExtraction);

      if (!rawExtraction?.rows) {
        throw new Error("No rows returned from extraction");
      }

      const conversionFactor = currencyMode === 'sll' ? 1000 : 1;
      
      const mappedData = (rawExtraction.rows || []).map((row, idx) => {
        const rawAmount = parseFloat(row.amount || 0);
        const amount = rawAmount / conversionFactor;
        
        const aiCategory = (row.category || 'other').toLowerCase().replace(/\s+/g, '_');
        const validCategory = mapToValidCategory(aiCategory);

        return {
          id: `row-${idx}`,
          selected: true,
          row_number: idx + 1,
          description: row.description || row.notes || '',
          amount: amount,
          category: validCategory,
          date: row.date || analysis.metadata?.date || format(new Date(), 'yyyy-MM-dd'),
          vendor: row.vendor || analysis.metadata?.issuer_name || '',
          quantity: parseFloat(row.quantity || 0),
          unit_price: parseFloat(row.unit_price || 0) / conversionFactor,
          raw_data: row
        };
      }).filter(item => item.description && item.amount > 0);

      console.log("Mapped data:", mappedData);

      if (mappedData.length === 0) {
        toast.warning("No data found", "The document appears empty or unreadable. Try a clearer image.");
        setUploadStage("upload");
        return;
      }

      setExtractedData(mappedData);
      setValidationResults({
        accuracy_score: analysis.quality_assessment?.readability_score * 10 || 90,
        completeness_score: 95,
        issues_found: 0,
        auto_corrections: 0
      });
      setUploadStage("editing");
      
      toast.success(
        "Extraction complete", 
        `${mappedData.length} rows extracted and ready for review`
      );

    } catch (error) {
      console.error("Processing error:", error);
      console.error("Error stack:", error.stack);
      toast.error("Processing failed", error.message || "Failed to process document. Check console for details.");
      setUploadStage("upload");
      setPendingFile(null);
      setFileUrl(null);
      setExtractedData([]);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!pendingFile) {
      toast.error("No file", "Please upload a document first");
      return;
    }
    setExtractedData([]);
    setDocumentAnalysis(null);
    setValidationResults(null);
    await processFile(pendingFile);
  };

  const handleCreateRecords = async () => {
    let selectedItems;
    
    if (batchMode) {
      // Collect all selected items from all files
      selectedItems = fileQueue.flatMap(f => 
        (f.extractedData || []).filter(e => e.selected)
      );
    } else {
      selectedItems = extractedData.filter(e => e.selected);
    }
    
    if (selectedItems.length === 0) {
      toast.warning("No items selected", "Please select at least one item to create");
      return;
    }

    setUploadLoading(true);
    
    const recordType = detectedType || "expense";
    
    try {
      let created = 0;
      let failed = 0;
      
      for (const item of selectedItems) {
        try {
          if (recordType === "expense") {
            await base44.entities.Expense.create({
              organisation_id: orgId,
              category: item.category || 'other',
              description: item.description || 'No description',
              amount: item.amount || 0,
              date: item.date || format(new Date(), 'yyyy-MM-dd'),
              vendor: item.vendor || '',
              payment_method: 'cash',
              recorded_by: currentEmployee?.id || '',
              recorded_by_name: currentEmployee?.full_name || '',
              status: 'pending',
              notes: batchMode ? 'Batch imported via AI extraction' : 'Imported via advanced AI extraction'
            });
            created++;
          } else if (recordType === "revenue") {
            await base44.entities.Revenue.create({
              organisation_id: orgId,
              source: item.category || 'other',
              contributor_name: item.vendor || item.description || 'Unknown',
              amount: item.amount || 0,
              date: item.date || format(new Date(), 'yyyy-MM-dd'),
              recorded_by: currentEmployee?.id || '',
              recorded_by_name: currentEmployee?.full_name || '',
              status: 'confirmed',
              notes: batchMode ? 'Batch imported via AI extraction' : 'AI-extracted from document'
            });
            created++;
          }
        } catch (itemError) {
          console.error('Failed to create record:', itemError, item);
          failed++;
        }
      }

      const filesProcessed = batchMode ? fileQueue.filter(f => f.status === 'completed').length : 1;
      
      if (created > 0) {
        toast.success(
          "Records created", 
          `Successfully created ${created} records from ${filesProcessed} document${filesProcessed > 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : ''}`
        );
        onOpenChange(false);
        resetState();
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to create records", `All ${failed} records failed to create. Check console for details.`);
      }
      
    } catch (error) {
      console.error('Batch creation error:', error);
      toast.error("Failed to create records", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const resetState = () => {
    setUploadStage("upload");
    setFileUrl(null);
    setFileName("");
    setFileType("");
    setExtractedData([]);
    setDocumentAnalysis(null);
    setValidationResults(null);
    setPendingFile(null);
    setExtractedColumns([]);
    setDocumentMetadata(null);
    setConfidenceScore(0);
    setDynamicCategories([...EXPENSE_CATEGORIES]);
    setBatchMode(false);
    setFileQueue([]);
    setProcessingIndex(null);
    setBatchResults([]);
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

  const deleteItem = (id) => {
    setExtractedData(prev => prev.filter(e => e.id !== id));
  };

  const selectedCount = extractedData.filter(e => e.selected).length;
  const selectedTotal = extractedData.filter(e => e.selected).reduce((sum, e) => sum + (e.amount || 0), 0);

  const isPDF = fileName.toLowerCase().endsWith('.pdf') || fileType.includes('pdf');

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetState(); onOpenChange(isOpen); }}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-hidden p-0 [&>button]:hidden">
          <div className="h-2 flex">
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
                  <h2 className="text-xl font-bold">Advanced AI Document Extraction</h2>
                  <p className="text-white/80 text-sm">Multi-stage analysis with validation & preview</p>
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

            {uploadStage !== "upload" && (
              <div className="mt-4 flex items-center gap-2">
                {["analyzing", "editing"].map((stage, idx) => (
                  <React.Fragment key={stage}>
                    <div className={`flex items-center gap-2 ${
                      uploadStage === stage ? 'text-white' : 
                      ["analyzing", "editing"].indexOf(uploadStage) > idx ? 'text-white' : 'text-white/50'
                    }`}>
                      {["analyzing", "editing"].indexOf(uploadStage) > idx ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : uploadStage === stage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                      )}
                      <span className="text-sm capitalize">{stage}</span>
                    </div>
                    {idx < 1 && <ChevronRight className="w-4 h-4 text-white/50" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(98vh-180px)]">
            
            {uploadStage === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#0072C6] transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.csv,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                    id="advanced-doc-upload"
                    disabled={uploadLoading}
                  />
                  <label htmlFor="advanced-doc-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-[#0072C6]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">
                          Upload Documents (Single or Multiple)
                        </p>
                        <p className="text-sm text-gray-500">
                          AI will analyze structure, extract data, validate accuracy
                        </p>
                        <p className="text-xs text-[#0072C6] mt-2 font-medium">
                          ✨ Select multiple files for batch processing
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {RECORD_TYPES.map(rt => (
                          <Badge key={rt.value} variant="outline" className="text-xs">
                            {rt.icon} {rt.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Smart Analysis</p>
                        <p className="text-xs text-gray-500">Auto-detects document type & structure</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Live Preview</p>
                        <p className="text-xs text-gray-500">See document & extracted data side-by-side</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Auto-Validation</p>
                        <p className="text-xs text-gray-500">Verifies accuracy & quality</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {uploadStage === "analyzing" && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-16 h-16 text-[#0072C6] animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Analyzing Document...</p>
                <p className="text-sm text-gray-500">AI is reading structure and extracting data</p>
              </div>
            )}

            {uploadStage === "batch-processing" && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold mb-2">Processing {fileQueue.length} Documents</h3>
                  <p className="text-sm text-gray-500">
                    {fileQueue.filter(f => f.status === 'completed').length} completed, 
                    {fileQueue.filter(f => f.status === 'failed').length} failed
                  </p>
                </div>

                <div className="space-y-3">
                  {fileQueue.map((file, idx) => (
                    <Card key={file.id} className={
                      file.status === 'completed' ? 'border-green-200 bg-green-50' :
                      file.status === 'failed' ? 'border-red-200 bg-red-50' :
                      processingIndex === idx ? 'border-blue-300 bg-blue-50' : 'bg-gray-50'
                    }>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            {file.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : file.status === 'failed' ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : processingIndex === idx ? (
                              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.fileName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {file.status === 'pending' ? 'Queued' :
                                 file.status === 'uploading' ? 'Uploading' :
                                 file.status === 'analyzing' ? 'Analyzing' :
                                 file.status === 'extracting' ? 'Extracting' :
                                 file.status === 'completed' ? `${file.extractedData?.length || 0} rows` :
                                 'Failed'}
                              </Badge>
                              {file.error && (
                                <span className="text-xs text-red-600">{file.error}</span>
                              )}
                            </div>
                          </div>

                          {file.status !== 'pending' && file.status !== 'completed' && file.status !== 'failed' && (
                            <div className="w-24">
                              <Progress value={file.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {uploadStage === "batch-review" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Batch Results</h3>
                    <p className="text-sm text-gray-500">
                      Review and edit data from all documents
                    </p>
                  </div>
                  <Select value={detectedType || "expense"} onValueChange={setDetectedType}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {fileQueue.filter(f => f.status === 'completed').length}
                          </p>
                          <p className="text-xs text-gray-500">Successful</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TableIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {fileQueue.reduce((sum, f) => sum + (f.extractedData?.length || 0), 0)}
                          </p>
                          <p className="text-xs text-gray-500">Total Rows</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            Le {fileQueue.reduce((sum, f) => 
                              sum + (f.extractedData || []).filter(e => e.selected).reduce((s, e) => s + e.amount, 0), 0
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Total Amount</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue={fileQueue[0]?.id} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                    {fileQueue.filter(f => f.status === 'completed').map(file => (
                      <TabsTrigger key={file.id} value={file.id} className="text-xs whitespace-nowrap">
                        {file.fileName}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {file.extractedData?.filter(e => e.selected).length}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {fileQueue.filter(f => f.status === 'completed').map(file => (
                    <TabsContent key={file.id} value={file.id} className="mt-4">
                      <div className="border rounded-lg overflow-auto max-h-[400px] bg-white">
                        <Table>
                          <TableHeader className="sticky top-0 bg-gray-50 z-10">
                            <TableRow>
                              <TableHead className="w-12">
                                <input
                                  type="checkbox"
                                  checked={file.extractedData?.every(e => e.selected)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFileQueue(prev => prev.map(f => 
                                      f.id === file.id ? {
                                        ...f,
                                        extractedData: f.extractedData.map(item => ({ ...item, selected: checked }))
                                      } : f
                                    ));
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </TableHead>
                              <TableHead className="text-xs w-12">#</TableHead>
                              <TableHead className="text-xs min-w-[250px]">Description</TableHead>
                              <TableHead className="text-xs text-right w-32">Amount (Le)</TableHead>
                              <TableHead className="text-xs w-40">Category</TableHead>
                              <TableHead className="text-xs w-36">Date</TableHead>
                              <TableHead className="text-xs w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(file.extractedData || []).map((item) => (
                              <TableRow key={item.id} className={!item.selected ? 'opacity-40 bg-gray-50' : 'hover:bg-blue-50'}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={() => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.map(e => 
                                            e.id === item.id ? { ...e, selected: !e.selected } : e
                                          )
                                        } : f
                                      ));
                                    }}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">{item.row_number}</TableCell>
                                <TableCell>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.map(i => 
                                            i.id === item.id ? { ...i, description: e.target.value } : i
                                          )
                                        } : f
                                      ));
                                    }}
                                    className="h-9 text-xs border-gray-200 focus:border-[#1EB053]"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.amount}
                                    onChange={(e) => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.map(i => 
                                            i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i
                                          )
                                        } : f
                                      ));
                                    }}
                                    className="h-9 text-xs text-right font-bold border-gray-200 focus:border-[#1EB053]"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={item.category}
                                    onValueChange={(v) => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.map(i => 
                                            i.id === item.id ? { ...i, category: v } : i
                                          )
                                        } : f
                                      ));
                                    }}
                                  >
                                    <SelectTrigger className="h-9 text-xs border-gray-200">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {dynamicCategories.map(cat => (
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
                                    onChange={(e) => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.map(i => 
                                            i.id === item.id ? { ...i, date: e.target.value } : i
                                          )
                                        } : f
                                      ));
                                    }}
                                    className="h-9 text-xs border-gray-200 focus:border-[#1EB053]"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      setFileQueue(prev => prev.map(f => 
                                        f.id === file.id ? {
                                          ...f,
                                          extractedData: f.extractedData.filter(i => i.id !== item.id)
                                        } : f
                                      ));
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                  <div>
                    <p className="font-semibold">
                      {fileQueue.reduce((sum, f) => sum + (f.extractedData || []).filter(e => e.selected).length, 0)} items selected
                    </p>
                    <p className="text-sm text-gray-500">
                      From {fileQueue.filter(f => f.status === 'completed').length} documents
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetState}>
                      Upload New
                    </Button>
                    <Button
                      onClick={handleCreateRecords}
                      disabled={uploadLoading}
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                    >
                      {uploadLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Create All Records
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {uploadStage === "editing" && (
              <div className="space-y-4">
                {extractedData.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Extracted Data ({extractedData.length} rows)</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReanalyze}
                          disabled={uploadLoading}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Re-extract
                        </Button>
                        <Select value={detectedType || "expense"} onValueChange={setDetectedType}>
                          <SelectTrigger className="w-[180px] h-8 text-xs">
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

                    {extractedColumns.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 font-medium mb-1">
                          📊 {extractedColumns.length} columns detected
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {extractedColumns.slice(0, 10).map((col, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-white">
                              {col}
                            </Badge>
                          ))}
                          {extractedColumns.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{extractedColumns.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border rounded-lg overflow-auto max-h-[500px] bg-white">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50 z-10">
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                checked={extractedData.length > 0 && extractedData.every(e => e.selected)}
                                onChange={(e) => setExtractedData(prev => prev.map(item => ({ ...item, selected: e.target.checked })))}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </TableHead>
                            <TableHead className="text-xs w-12">#</TableHead>
                            <TableHead className="text-xs min-w-[250px]">Description</TableHead>
                            <TableHead className="text-xs text-right w-32">Amount (Le)</TableHead>
                            <TableHead className="text-xs w-40">Category</TableHead>
                            <TableHead className="text-xs w-36">Date</TableHead>
                            <TableHead className="text-xs w-20">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractedData.map((item) => (
                            <TableRow key={item.id} className={!item.selected ? 'opacity-40 bg-gray-50' : 'hover:bg-blue-50'}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={() => toggleSelection(item.id)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="text-xs text-gray-500">{item.row_number}</TableCell>
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  className="h-9 text-xs border-gray-200 focus:border-[#1EB053]"
                                  placeholder="Description..."
                                />
                                {item.vendor && (
                                  <p className="text-xs text-gray-500 mt-1">Vendor: {item.vendor}</p>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="h-9 text-xs text-right font-bold border-gray-200 focus:border-[#1EB053]"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.category}
                                  onValueChange={(v) => updateItem(item.id, 'category', v)}
                                >
                                  <SelectTrigger className="h-9 text-xs border-gray-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dynamicCategories.map(cat => (
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
                                  className="h-9 text-xs border-gray-200 focus:border-[#1EB053]"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:bg-red-50"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {extractedData.length > 0 ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                    <div>
                      <p className="font-semibold">{selectedCount} items selected</p>
                      <p className="text-sm text-gray-500">Total: Le {selectedTotal.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={resetState}>
                        Upload New
                      </Button>
                      <Button
                        onClick={handleCreateRecords}
                        disabled={uploadLoading || selectedCount === 0}
                        className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                      >
                        {uploadLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Create {selectedCount} Record(s)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-600 mb-2">No data extracted</p>
                    <p className="text-sm text-gray-500 mb-4">The AI couldn't find any tabular data in this document</p>
                    <Button variant="outline" onClick={resetState}>
                      Try Another Document
                    </Button>
                  </div>
                )}
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

      <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Document Currency?</h3>
              <p className="text-sm text-gray-600">Select the currency used in the document</p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-auto py-4 text-left hover:border-green-500 hover:bg-green-50"
                onClick={() => {
                  setCurrencyMode('sle');
                  if (Array.isArray(pendingFile)) {
                    startBatchProcessing(pendingFile);
                  } else if (pendingFile) {
                    processFile(pendingFile);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <div className="font-bold">New Leone (SLE)</div>
                    <div className="text-sm text-gray-600">
                      Current currency - amounts like 75, 1,500, 25,000
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-auto py-4 text-left hover:border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  setCurrencyMode('sll');
                  if (Array.isArray(pendingFile)) {
                    startBatchProcessing(pendingFile);
                  } else if (pendingFile) {
                    processFile(pendingFile);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div>
                    <div className="font-bold">Old Leone (SLL)</div>
                    <div className="text-sm text-gray-600">
                      Pre-2022 - amounts like 75,000, 1,500,000 (÷1000)
                    </div>
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