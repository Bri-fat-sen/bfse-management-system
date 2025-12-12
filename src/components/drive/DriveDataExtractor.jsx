import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Loader2, 
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DriveFileBrowser from "./DriveFileBrowser";

export default function DriveDataExtractor({ 
  open, 
  onOpenChange,
  orgId,
  currentEmployee 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState('select'); // select, extracting, review, importing
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  const extractMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.functions.invoke('extractDriveDocument', {
        fileId: file.id,
        fileName: file.name
      });
      return result.data;
    },
    onSuccess: (data) => {
      setExtractedData(data);
      setDocumentType(data.documentType);
      setStep('review');
      toast.success('Data extracted successfully', `Found ${data.recordCount} records`);
    },
    onError: (error) => {
      toast.error('Extraction failed', error.message);
      setStep('select');
    }
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const records = extractedData.data.records || extractedData.data.transactions || [];
      
      if (documentType === 'expense') {
        const expenses = records.map(r => ({
          organisation_id: orgId,
          date: r.date,
          category: r.category,
          description: r.description || r.notes || '',
          vendor: r.vendor || '',
          amount: r.amount,
          payment_method: r.payment_method || 'cash',
          recorded_by: currentEmployee?.id,
          recorded_by_name: currentEmployee?.full_name,
          status: 'pending',
          notes: r.notes || ''
        }));
        await base44.entities.Expense.bulkCreate(expenses);
        return { type: 'expense', count: expenses.length };
      } 
      else if (documentType === 'revenue' || documentType === 'invoice' || documentType === 'receipt') {
        const sales = records.map(r => ({
          organisation_id: orgId,
          sale_type: 'retail',
          customer_name: r.customer_name || 'Walk-in',
          customer_phone: r.customer_phone || '',
          employee_id: currentEmployee?.id,
          employee_name: currentEmployee?.full_name,
          items: r.items || [],
          total_amount: r.amount || r.total || 0,
          payment_method: r.payment_method || 'cash',
          payment_status: 'paid',
          notes: r.description || ''
        }));
        await base44.entities.Sale.bulkCreate(sales);
        return { type: 'sale', count: sales.length };
      }
      else if (documentType === 'bank_statement') {
        const transactions = extractedData.data.transactions || [];
        const expenses = transactions
          .filter(t => t.debit > 0)
          .map(t => ({
            organisation_id: orgId,
            date: t.date,
            category: 'other',
            description: t.description,
            vendor: t.description,
            amount: t.debit,
            payment_method: 'bank_transfer',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'approved',
            notes: `Ref: ${t.reference || ''}`
          }));
        await base44.entities.Expense.bulkCreate(expenses);
        return { type: 'bank_statement', count: expenses.length };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['sales']);
      toast.success('Import complete', `Imported ${result.count} ${result.type} records`);
      handleClose();
    },
    onError: (error) => {
      toast.error('Import failed', error.message);
    }
  });

  const handleFileSelect = (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') return;
    setSelectedFile(file);
    setStep('extracting');
    extractMutation.mutate(file);
  };

  const handleImport = () => {
    setStep('importing');
    importMutation.mutate();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedFile(null);
    setExtractedData(null);
    setDocumentType(null);
    onOpenChange(false);
  };

  const getDocTypeInfo = (type) => {
    const types = {
      expense: { icon: Receipt, color: 'text-red-500', bg: 'bg-red-50', label: 'Expense' },
      revenue: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50', label: 'Revenue' },
      bank_statement: { icon: FileSpreadsheet, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Bank Statement' },
      invoice: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Invoice' },
      receipt: { icon: Receipt, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Receipt' }
    };
    return types[type] || types.expense;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1EB053]" />
            AI Document Extraction
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Select a document</strong> from your Google Drive. AI will automatically extract financial data for import.
              </p>
            </div>
            <DriveFileBrowser onFileSelect={handleFileSelect} title="Select Document" />
          </div>
        )}

        {step === 'extracting' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-[#1EB053] animate-spin mb-4" />
            <p className="text-lg font-semibold">Extracting data with AI...</p>
            <p className="text-sm text-gray-500 mt-2">{selectedFile?.name}</p>
          </div>
        )}

        {step === 'review' && extractedData && (
          <div className="space-y-4">
            <Card className={getDocTypeInfo(documentType).bg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {React.createElement(getDocTypeInfo(documentType).icon, { 
                    className: `w-5 h-5 ${getDocTypeInfo(documentType).color}` 
                  })}
                  {getDocTypeInfo(documentType).label} - {extractedData.recordCount} Records
                </CardTitle>
                <p className="text-sm text-gray-600">{extractedData.fileName}</p>
              </CardHeader>
            </Card>

            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              {documentType === 'bank_statement' && extractedData.data.account_info && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-2">Account Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Account:</span> {extractedData.data.account_info.account_name}</div>
                    <div><span className="text-gray-600">Number:</span> {extractedData.data.account_info.account_number}</div>
                    <div><span className="text-gray-600">Opening:</span> SLE {extractedData.data.account_info.opening_balance?.toLocaleString()}</div>
                    <div><span className="text-gray-600">Closing:</span> SLE {extractedData.data.account_info.closing_balance?.toLocaleString()}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(extractedData.data.records || extractedData.data.transactions || []).map((record, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {record.description || record.vendor || record.customer_name || 'Transaction'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {record.date}
                          </Badge>
                          {record.category && (
                            <Badge variant="secondary" className="text-xs">
                              {record.category}
                            </Badge>
                          )}
                          {record.payment_method && (
                            <Badge variant="outline" className="text-xs">
                              {record.payment_method}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          record.debit ? 'text-red-600' : record.credit ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {record.debit && `- SLE ${record.debit.toLocaleString()}`}
                          {record.credit && `+ SLE ${record.credit.toLocaleString()}`}
                          {record.amount && `SLE ${record.amount.toLocaleString()}`}
                          {record.total && `SLE ${record.total.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                className="bg-[#1EB053] hover:bg-[#178f43]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import {extractedData.recordCount} Records
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-[#1EB053] animate-spin mb-4" />
            <p className="text-lg font-semibold">Importing records...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}