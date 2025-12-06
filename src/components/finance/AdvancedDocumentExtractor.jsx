import React, { useState, useMemo } from "react";
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
  Upload, Loader2, FileUp, CheckCircle, Eye, ZoomIn, ZoomOut,
  RotateCw, Download, Sparkles, AlertCircle, Info, X, RefreshCw,
  FileText, Image as ImageIcon, Table as TableIcon, ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const RECORD_TYPES = [
  { value: "expense", label: "Expenses", icon: "💰", color: "red" },
  { value: "revenue", label: "Revenue/Sales", icon: "📈", color: "green" },
  { value: "production", label: "Production Batches", icon: "🏭", color: "blue" },
  { value: "inventory", label: "Stock/Inventory", icon: "📦", color: "purple" },
  { value: "payroll", label: "Payroll Items", icon: "👥", color: "amber" },
];

export default function AdvancedDocumentExtractor({ 
  open, 
  onOpenChange, 
  type = "auto",
  orgId,
  currentEmployee,
  onSuccess,
  categories,
  products = [],
  employees = [],
  warehouses = [],
  customers = [],
  vehicles = [],
  selectedLocation,
  selectedSaleType,
}) {
  const toast = useToast();
  const [uploadStage, setUploadStage] = useState("upload"); // upload, analyzing, preview, editing
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  
  // Document analysis results
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [detectedType, setDetectedType] = useState(type === "auto" ? null : type);
  const [extractedData, setExtractedData] = useState([]);
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  
  // Preview controls
  const [viewMode, setViewMode] = useState("split"); // split, document, table
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Validation & confidence
  const [validationResults, setValidationResults] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const [currencyMode, setCurrencyMode] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // Stage 1: Advanced Document Analysis with AI
  const analyzeDocument = async (file_url, file) => {
    setUploadStage("analyzing");
    
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an advanced document analysis AI. Analyze this business document comprehensively.

**Primary Analysis:**
1. Document Type Detection:
   - Identify if this is: invoice, receipt, purchase order, expense report, budget, sales report, inventory list, payroll sheet, production log, bank statement
   - Determine the appropriate record type: expense, revenue, production, inventory, or payroll

2. Document Structure:
   - List ALL table headers/column names found (exact text)
   - Identify the table structure (rows, columns, merged cells)
   - Detect if there are multiple tables
   - Find any summary rows (totals, subtotals)

3. Key Metadata:
   - Document date (any format - convert to YYYY-MM-DD)
   - Document number/reference
   - Issuer/vendor/customer name
   - Total amount if shown
   - Currency mentioned (SLE/SLL/other)

4. Data Quality Assessment:
   - Are numbers clearly readable?
   - Are there any handwritten portions?
   - Image quality score (1-10)
   - Potential OCR challenges

5. Business Context:
   - What type of transaction does this represent?
   - What business process does this belong to?
   - Any compliance or regulatory information?

Provide detailed, accurate analysis with high confidence.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          document_type: { type: "string" },
          record_type: { 
            type: "string", 
            enum: ["expense", "revenue", "production", "inventory", "payroll"],
          },
          confidence: { type: "number", description: "0-100 confidence score" },
          table_structure: {
            type: "object",
            properties: {
              column_headers: { type: "array", items: { type: "string" } },
              estimated_rows: { type: "number" },
              has_subtotals: { type: "boolean" },
              has_merged_cells: { type: "boolean" },
              multiple_tables: { type: "boolean" }
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
              has_handwriting: { type: "boolean" },
              ocr_challenges: { type: "array", items: { type: "string" } },
              image_quality: { type: "number" }
            }
          },
          business_context: {
            type: "object",
            properties: {
              transaction_type: { type: "string" },
              business_process: { type: "string" },
              compliance_notes: { type: "array", items: { type: "string" } }
            }
          },
          extraction_recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Suggestions for optimal data extraction"
          }
        }
      }
    });

    return analysisResult;
  };

  // Stage 2: Advanced Data Extraction with Multi-Pass
  const extractDocumentData = async (file_url, analysis) => {
    const recordType = detectedType || analysis.record_type;
    
    // Build dynamic schema based on detected structure
    const extractionPrompt = `Extract ALL data from this ${analysis.document_type} document with maximum accuracy.

**Document Context:**
- Type: ${recordType}
- Columns detected: ${analysis.table_structure.column_headers.join(', ')}
- Estimated rows: ${analysis.table_structure.estimated_rows}

**Extraction Instructions:**
1. Extract EVERY SINGLE ROW from the table - do not skip or summarize
2. For each row, capture ALL column values accurately
3. Handle missing values gracefully (use null/0 as appropriate)
4. Parse numbers correctly (remove commas, handle decimals)
5. Preserve original descriptions/text exactly
6. If there are multiple tables, extract from all of them
7. Skip only true header rows and summary/total rows

**Data Quality:**
- Cross-reference extracted amounts with any totals shown
- Flag any inconsistencies or unclear values
- Provide extraction confidence per row (0-100)

Return structured data with maximum accuracy.`;

    const dataExtractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row_number: { type: "number" },
                confidence: { type: "number", description: "Extraction confidence 0-100" },
                data: {
                  type: "object",
                  additionalProperties: true,
                  description: "All column data as key-value pairs"
                },
                flags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Any data quality flags"
                }
              }
            }
          },
          validation: {
            type: "object",
            properties: {
              total_rows_extracted: { type: "number" },
              avg_confidence: { type: "number" },
              flagged_rows: { type: "number" },
              extraction_issues: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    return dataExtractionResult;
  };

  // Stage 3: Smart Validation & Auto-Correction
  const validateAndCorrectData = async (rawData, analysis) => {
    const validationPrompt = `Validate and auto-correct this extracted data:

**Raw Data:** ${JSON.stringify(rawData.rows.slice(0, 20))}

**Validation Tasks:**
1. Check number formatting (ensure decimals are correct)
2. Verify calculations (qty × unit_cost should equal amount)
3. Validate dates are in YYYY-MM-DD format
4. Check for duplicate rows
5. Identify outliers or suspicious values
6. Auto-categorize based on descriptions
7. Suggest vendor/customer matching

Return validated data with corrections and confidence scores.`;

    const validationResult = await base44.integrations.Core.InvokeLLM({
      prompt: validationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          validated_rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original_row_number: { type: "number" },
                corrected_data: { type: "object", additionalProperties: true },
                corrections_made: { type: "array", items: { type: "string" } },
                validation_score: { type: "number" },
                suggested_category: { type: "string" },
                warnings: { type: "array", items: { type: "string" } }
              }
            }
          },
          overall_quality: {
            type: "object",
            properties: {
              accuracy_score: { type: "number" },
              completeness_score: { type: "number" },
              issues_found: { type: "number" },
              auto_corrections: { type: "number" }
            }
          }
        }
      }
    });

    return validationResult;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ask about currency first
    if (currencyMode === null) {
      setPendingFile(file);
      setShowCurrencyDialog(true);
      return;
    }

    await processFile(file);
  };

  const processFile = async (file) => {
    setUploadLoading(true);
    setShowCurrencyDialog(false);
    setFileName(file.name);
    setFileType(file.type);
    
    try {
      // Stage 1: Upload file
      toast.info("Uploading document...", "Processing your file");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);

      // Stage 2: Advanced Analysis
      toast.info("Analyzing document...", "AI is reading the document structure");
      const analysis = await analyzeDocument(file_url, file);
      setDocumentAnalysis(analysis);
      setDetectedType(type === "auto" ? analysis.record_type : type);
      setExtractedColumns(analysis.table_structure?.column_headers || []);
      setDocumentMetadata(analysis.metadata);
      setConfidenceScore(analysis.confidence || 0);
      setTotalPages(1); // Could be enhanced to detect actual page count

      setUploadStage("preview");
      toast.success("Analysis complete", `${analysis.confidence}% confidence - ${analysis.table_structure.estimated_rows} rows detected`);

      // Stage 3: Extract data
      toast.info("Extracting data...", "Reading all rows from the document");
      const rawExtraction = await extractDocumentData(file_url, analysis);

      // Stage 4: Validate & Correct
      toast.info("Validating data...", "Checking accuracy and auto-correcting");
      const validation = await validateAndCorrectData(rawExtraction, analysis);
      setValidationResults(validation.overall_quality);

      // Process and map data
      const conversionFactor = currencyMode === 'sll' ? 1000 : 1;
      const mappedData = validation.validated_rows.map((row, idx) => {
        const data = row.corrected_data || {};
        
        // Smart amount detection
        const rawAmount = parseFloat(data.amount || data.actual_total || data.actual_amount || 
                         data.total || data.price || data.value || 0);
        const amount = rawAmount / conversionFactor;

        return {
          id: `row-${idx}`,
          selected: true,
          row_number: row.original_row_number || idx + 1,
          confidence: row.validation_score || 85,
          description: data.description || data.details || data.item || '',
          amount: amount,
          category: row.suggested_category || 'other',
          date: analysis.metadata?.date || format(new Date(), 'yyyy-MM-dd'),
          vendor: data.vendor || data.supplier || analysis.metadata?.issuer_name || '',
          quantity: parseFloat(data.qty || data.quantity || data.actual_qty || 0),
          unit_price: parseFloat(data.unit_price || data.price || data.actual_unit_cost || 0) / conversionFactor,
          warnings: row.warnings || [],
          corrections: row.corrections_made || [],
          raw_data: data
        };
      }).filter(item => item.description || item.amount > 0);

      setExtractedData(mappedData);
      setUploadStage("editing");
      
      const avgConfidence = validation.overall_quality?.accuracy_score || 85;
      toast.success(
        "Extraction complete", 
        `${mappedData.length} rows extracted with ${avgConfidence.toFixed(0)}% accuracy`
      );

    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Processing failed", error.message);
      setUploadStage("upload");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!fileUrl || !pendingFile) return;
    await processFile(pendingFile);
  };

  const handleCreateRecords = async () => {
    const selectedItems = extractedData.filter(e => e.selected);
    if (selectedItems.length === 0) {
      toast.warning("No items selected");
      return;
    }

    setUploadLoading(true);
    try {
      let created = 0;
      
      for (const item of selectedItems) {
        if (detectedType === "expense") {
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
            notes: item.corrections.length > 0 
              ? `AI auto-corrected: ${item.corrections.join(', ')}`
              : 'Imported via advanced AI extraction'
          });
          created++;
        } else if (detectedType === "revenue") {
          await base44.entities.Revenue.create({
            organisation_id: orgId,
            source: item.category,
            contributor_name: item.vendor || item.description,
            amount: item.amount,
            date: item.date,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'confirmed',
            notes: 'AI-extracted from document'
          });
          created++;
        }
        // Add other record types as needed...
      }

      toast.success("Records created", `Successfully created ${created} ${RECORD_TYPES.find(r => r.value === detectedType)?.label}`);
      onOpenChange(false);
      resetState();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      toast.error("Failed to create records", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const resetState = () => {
    setUploadStage("upload");
    setFileUrl(null);
    setFileName("");
    setExtractedData([]);
    setDocumentAnalysis(null);
    setValidationResults(null);
    setPendingFile(null);
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
  const selectedTotal = extractedData.filter(e => e.selected).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetState(); onOpenChange(isOpen); }}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-hidden p-0 [&>button]:hidden">
        {/* Header */}
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

          {/* Progress Indicator */}
          {uploadStage !== "upload" && (
            <div className="mt-4 flex items-center gap-2">
              {["analyzing", "preview", "editing"].map((stage, idx) => (
                <React.Fragment key={stage}>
                  <div className={`flex items-center gap-2 ${
                    uploadStage === stage ? 'text-white' : 
                    ["analyzing", "preview", "editing"].indexOf(uploadStage) > idx ? 'text-white' : 'text-white/50'
                  }`}>
                    {["analyzing", "preview", "editing"].indexOf(uploadStage) > idx ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : uploadStage === stage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current" />
                    )}
                    <span className="text-sm capitalize">{stage}</span>
                  </div>
                  {idx < 2 && <ChevronRight className="w-4 h-4 text-white/50" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(98vh-180px)]">
          
          {/* Upload Stage */}
          {uploadStage === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#0072C6] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.csv,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
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
                        Upload Business Document
                      </p>
                      <p className="text-sm text-gray-500">
                        AI will analyze structure, extract data, validate accuracy
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

              {/* Features */}
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
                      <p className="text-xs text-gray-500">Verifies accuracy & auto-corrects</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analysis Stage */}
          {uploadStage === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-[#0072C6] animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Analyzing Document...</p>
              <p className="text-sm text-gray-500">AI is reading structure and metadata</p>
            </div>
          )}

          {/* Preview Stage */}
          {uploadStage === "preview" && documentAnalysis && (
            <div className="space-y-4">
              {/* Analysis Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl">
                      {RECORD_TYPES.find(r => r.value === detectedType)?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">
                          {RECORD_TYPES.find(r => r.value === detectedType)?.label}
                        </h3>
                        <Badge className={`${confidenceScore >= 90 ? 'bg-green-100 text-green-700' : confidenceScore >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {confidenceScore}% confidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{documentAnalysis.document_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rows:</span>
                          <span className="ml-2 font-medium">{documentAnalysis.table_structure?.estimated_rows || 0}</span>
                        </div>
                        {documentMetadata?.date && (
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-2 font-medium">{documentMetadata.date}</span>
                          </div>
                        )}
                        {documentMetadata?.total_amount && (
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-2 font-medium">Le {documentMetadata.total_amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {documentAnalysis.extraction_recommendations?.length > 0 && (
                        <div className="mt-3 p-2 bg-white/60 rounded text-xs">
                          <p className="font-medium text-blue-800 mb-1">📋 Recommendations:</p>
                          <ul className="list-disc list-inside text-blue-700">
                            {documentAnalysis.extraction_recommendations.slice(0, 2).map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2">
                <Button onClick={handleReanalyze} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analyze
                </Button>
                <Button onClick={() => setUploadStage("editing")} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                  Continue to Edit
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Editing Stage - Split View */}
          {uploadStage === "editing" && extractedData.length > 0 && (
            <div className="space-y-4">
              {/* View Controls */}
              <div className="flex items-center justify-between">
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="split" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Split View
                    </TabsTrigger>
                    <TabsTrigger value="document" className="text-xs">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Document
                    </TabsTrigger>
                    <TabsTrigger value="table" className="text-xs">
                      <TableIcon className="w-3 h-3 mr-1" />
                      Table Only
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {validationResults && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Quality:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {validationResults.accuracy_score?.toFixed(0)}%
                      </span>
                    </div>
                    {validationResults.auto_corrections > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {validationResults.auto_corrections} auto-corrected
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Split/Document View */}
              {(viewMode === "split" || viewMode === "document") && fileUrl && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative bg-gray-900">
                      {fileType.includes('pdf') ? (
                        <iframe 
                          src={fileUrl} 
                          className="w-full h-[400px] bg-white"
                          title="Document Preview"
                        />
                      ) : (
                        <div className="relative">
                          <img 
                            src={fileUrl} 
                            alt="Document" 
                            className="w-full h-auto max-h-[400px] object-contain"
                            style={{ transform: `scale(${zoom/100})`, transformOrigin: 'center top' }}
                          />
                        </div>
                      )}
                      
                      {/* Zoom Controls */}
                      <div className="absolute bottom-4 right-4 flex gap-1 bg-black/70 rounded-lg p-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => setZoom(Math.max(50, zoom - 10))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="px-2 py-1 text-white text-sm min-w-[60px] text-center">{zoom}%</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => setZoom(Math.min(200, zoom + 10))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Table */}
              {viewMode !== "document" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Extracted Data ({extractedData.length} rows)</h3>
                    <div className="flex gap-2">
                      <Select value={detectedType} onValueChange={setDetectedType}>
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

                  {/* Columns Info */}
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

                  {/* Data Table */}
                  <div className="border rounded-lg overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50">
                        <TableRow>
                          <TableHead className="w-10">
                            <input
                              type="checkbox"
                              checked={extractedData.every(e => e.selected)}
                              onChange={(e) => setExtractedData(prev => prev.map(item => ({ ...item, selected: e.target.checked })))}
                            />
                          </TableHead>
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs min-w-[200px]">Description</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                          <TableHead className="text-xs">Category</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Quality</TableHead>
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
                              />
                            </TableCell>
                            <TableCell className="text-xs">{item.row_number}</TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="h-8 text-xs"
                              />
                              {item.warnings.length > 0 && (
                                <p className="text-xs text-amber-600 mt-1">⚠️ {item.warnings[0]}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                value={item.amount}
                                onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-8 text-xs text-right font-bold"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.category}
                                onValueChange={(v) => updateItem(item.id, 'category', v)}
                              >
                                <SelectTrigger className="h-8 text-xs w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(categories || []).map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
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
                                className="h-8 text-xs w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${
                                item.confidence >= 90 ? 'bg-green-100 text-green-700' :
                                item.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.confidence}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Summary Footer */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                <div>
                  <p className="font-semibold">{selectedCount} items selected</p>
                  <p className="text-sm text-gray-500">Total: Le {selectedTotal.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setUploadStage("upload")}>
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
            </div>
          )}
        </div>

        {/* Currency Dialog */}
        <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
          <DialogContent className="max-w-md">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">💱</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Document Currency?</h3>
                <p className="text-sm text-gray-600">
                  Select the currency used in the document
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-auto py-4 text-left hover:border-green-500 hover:bg-green-50"
                  onClick={() => {
                    setCurrencyMode('sle');
                    if (pendingFile) processFile(pendingFile);
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
                    if (pendingFile) processFile(pendingFile);
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

        {/* Bottom Stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}