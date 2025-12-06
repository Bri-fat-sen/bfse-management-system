import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Eye,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileImage,
  FileSpreadsheet,
  X,
  Maximize2,
  Grid3x3,
  List,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function AdvancedDocumentViewer({ 
  open, 
  onOpenChange,
  fileUrl,
  fileName,
  fileType
}) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState('preview'); // 'preview', 'grid', 'text'
  const [extractedText, setExtractedText] = useState('');
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [pagePreviews, setPagePreviews] = useState([]);

  useEffect(() => {
    if (open && fileUrl) {
      analyzeDocument();
    }
  }, [open, fileUrl]);

  const analyzeDocument = async () => {
    setLoading(true);
    try {
      // Use AI to analyze document structure and metadata
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and extract:
1. Document type (invoice, receipt, budget, expense_report, contract, form, table, etc)
2. Document title or header
3. Date (YYYY-MM-DD format if found)
4. Total number of pages (estimate if multi-page)
5. Main sections/headings found
6. Key entities mentioned (companies, people, amounts)
7. Table structure (if any tables present)
8. Currency mentioned (SLE, SLL, USD, etc)
9. Brief summary of content

Be detailed and accurate.`,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            title: { type: "string" },
            date: { type: "string" },
            estimated_pages: { type: "number", default: 1 },
            sections: { type: "array", items: { type: "string" } },
            entities: {
              type: "object",
              properties: {
                companies: { type: "array", items: { type: "string" } },
                people: { type: "array", items: { type: "string" } },
                amounts: { type: "array", items: { type: "number" } }
              }
            },
            has_tables: { type: "boolean" },
            table_info: {
              type: "object",
              properties: {
                column_count: { type: "number" },
                row_count: { type: "number" },
                headers: { type: "array", items: { type: "string" } }
              }
            },
            currency: { type: "string" },
            summary: { type: "string" }
          }
        }
      });

      setDocumentMetadata(analysis);
      setTotalPages(analysis.estimated_pages || 1);

      // Extract full text for search and analysis
      const textExtraction = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract all text from this document in a structured, readable format. 
        
Maintain the original structure with:
- Headings and sections
- Tables (format as markdown tables)
- Lists
- Paragraphs

Preserve ALL text content.`,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            full_text: { type: "string", description: "Complete document text with structure" },
            tables: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  headers: { type: "array", items: { type: "string" } },
                  rows: { type: "array", items: { type: "array", items: { type: "string" } } }
                }
              }
            }
          }
        }
      });

      setExtractedText(textExtraction.full_text || '');
      
      toast.success("Document analyzed", `${analysis.document_type} - ${analysis.estimated_pages} page(s)`);
    } catch (error) {
      console.error("Document analysis error:", error);
      toast.error("Failed to analyze document", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document';
    link.click();
  };

  const isPDF = fileType === 'application/pdf' || fileName?.endsWith('.pdf');
  const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isCSV = fileType === 'text/csv' || fileName?.endsWith('.csv');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh] p-0 w-[98vw] [&>button]:hidden">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                {isImage ? <FileImage className="w-5 h-5" /> :
                 isCSV ? <FileSpreadsheet className="w-5 h-5" /> :
                 <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold truncate">{fileName || 'Document Viewer'}</h3>
                {documentMetadata && (
                  <p className="text-xs text-white/80">
                    {documentMetadata.document_type} • {documentMetadata.date || 'No date'} • {totalPages} page(s)
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('preview')}
                className={`h-8 ${viewMode === 'preview' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 ${viewMode === 'grid' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('text')}
                className={`h-8 ${viewMode === 'text' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {viewMode === 'preview' && (
              <>
                <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="h-8 text-white hover:bg-white/20"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-white text-xs px-2">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="h-8 text-white hover:bg-white/20"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation((rotation + 90) % 360)}
                  className="h-8 text-white hover:bg-white/20"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>

            {totalPages > 1 && viewMode === 'preview' && (
              <div className="flex items-center gap-2 ml-auto bg-white/20 rounded-lg px-3 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#0072C6] animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Analyzing document with AI...</p>
                <p className="text-sm text-gray-400 mt-1">Extracting text, tables, and metadata</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'preview' && (
                <div className="flex justify-center">
                  <div 
                    className="bg-white shadow-2xl"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s'
                    }}
                  >
                    {isImage ? (
                      <img 
                        src={fileUrl} 
                        alt={fileName} 
                        className="max-w-full h-auto"
                      />
                    ) : isPDF ? (
                      <iframe
                        src={`${fileUrl}#page=${currentPage}`}
                        className="w-[800px] h-[1100px] border-0"
                        title={fileName}
                      />
                    ) : (
                      <div className="w-[800px] p-8">
                        <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'grid' && totalPages > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <Card 
                      key={pageNum}
                      className="cursor-pointer hover:ring-2 hover:ring-[#1EB053] transition-all"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        setViewMode('preview');
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-[8.5/11] bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs text-center font-medium">Page {pageNum}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {viewMode === 'text' && (
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-6">
                    {documentMetadata && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">AI Document Analysis</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <Badge className="ml-2">{documentMetadata.document_type}</Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-medium">{documentMetadata.date || 'N/A'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Title:</span>
                            <p className="font-medium mt-1">{documentMetadata.title}</p>
                          </div>
                          {documentMetadata.has_tables && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Tables:</span>
                              <p className="mt-1 text-sm">
                                {documentMetadata.table_info?.row_count} rows × {documentMetadata.table_info?.column_count} columns
                              </p>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-gray-600">Summary:</span>
                            <p className="mt-1 text-gray-700">{documentMetadata.summary}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-bold mb-4">Extracted Text</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
                          {extractedText || 'No text extracted yet'}
                        </pre>
                      </div>
                    </div>

                    {documentMetadata?.sections && documentMetadata.sections.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-bold mb-3">Document Sections</h4>
                        <div className="flex flex-wrap gap-2">
                          {documentMetadata.sections.map((section, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Bottom stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}