import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, DollarSign, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import DriveFileBrowser from "./DriveFileBrowser";

export default function DriveDataExtractor({ open, onOpenChange, orgId, currentEmployee }) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [recordType, setRecordType] = useState("expense");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setStep(2);
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const result = await base44.functions.invoke('googleDriveManager', {
        action: 'extractData',
        fileId: selectedFile.id,
        fileUrl: selectedFile.webViewLink,
        detectedType: recordType
      });

      if (result?.data?.success) {
        setExtractedData(result.data.extractedData);
        setStep(3);
        toast.success("Data extracted successfully", `Found ${result.data.extractedData.records?.length || 0} records`);
      } else {
        toast.error("Extraction failed", "Unable to extract data from file");
      }
    } catch (error) {
      console.error('Extract error:', error);
      toast.error("Extraction error", error.message);
    }
    setIsExtracting(false);
  };

  const handleImport = async () => {
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const record of extractedData.records) {
        try {
          if (recordType === "expense") {
            await base44.entities.Expense.create({
              organisation_id: orgId,
              category: record.category || "other",
              description: record.description,
              amount: record.amount,
              date: record.date,
              vendor: record.vendor,
              payment_method: record.payment_method || "bank_transfer",
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name,
              status: "approved"
            });
            successCount++;
          } else if (recordType === "revenue" || recordType === "sale") {
            await base44.entities.Sale.create({
              organisation_id: orgId,
              sale_type: "retail",
              customer_name: record.customer_name || "Drive Import",
              total_amount: record.amount,
              payment_method: record.payment_method || "bank_transfer",
              payment_status: "paid",
              employee_id: currentEmployee?.id,
              employee_name: currentEmployee?.full_name,
              items: record.items || [{ product_name: record.description, quantity: 1, unit_price: record.amount, total: record.amount }]
            });
            successCount++;
          }
        } catch (err) {
          console.error('Import record error:', err);
          errorCount++;
        }
      }

      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['sales']);

      if (successCount > 0) {
        toast.success("Import complete", `${successCount} records imported${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      }

      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error("Import failed", error.message);
    }
    setIsImporting(false);
  };

  const resetState = () => {
    setStep(1);
    setSelectedFile(null);
    setExtractedData(null);
    setRecordType("expense");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetState(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Extract Data from Google Drive
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-[#1EB053]' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <DriveFileBrowser onFileSelect={handleFileSelect} title="Select Document" />
        )}

        {step === 2 && selectedFile && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''} • 
                      {selectedFile.modifiedTime && format(new Date(selectedFile.modifiedTime), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Record Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        Expense
                      </div>
                    </SelectItem>
                    <SelectItem value="revenue">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Revenue / Sale
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleExtract} disabled={isExtracting} className="bg-[#1EB053] hover:bg-[#178f43]">
                {isExtracting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</> : <>Extract Data</>}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && extractedData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Extracted Records</span>
                  <Badge variant="secondary">{extractedData.records?.length || 0} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {extractedData.records?.map((record, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{record.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                            <span>{record.date}</span>
                            {record.vendor && <span>• {record.vendor}</span>}
                            {record.customer_name && <span>• {record.customer_name}</span>}
                            {record.category && <Badge variant="outline" className="text-xs">{record.category}</Badge>}
                            {record.invoice_number && <Badge variant="outline" className="text-xs">{record.invoice_number}</Badge>}
                          </div>
                        </div>
                        <p className="font-bold text-lg ml-4">
                          SLE {record.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleImport} disabled={isImporting} className="bg-[#1EB053] hover:bg-[#178f43]">
                {isImporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Import {extractedData.records?.length} Records</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}