import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, User, Calendar, DollarSign, MapPin, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

export default function ContractGenerator({ open, onOpenChange, orgId, currentEmployee }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [contractData, setContractData] = useState({});
  const [previewContent, setPreviewContent] = useState("");
  const [generatedContract, setGeneratedContract] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ 
      organisation_id: orgId,
      category: 'contract'
    }),
    enabled: !!orgId && open,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId && open,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organisation.list();
      return orgs.find(o => o.id === orgId);
    },
    enabled: !!orgId && open,
  });

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional contract document by filling this template with the provided data.

Template:
${selectedTemplate.content}

Client/Customer Data:
${JSON.stringify(data.clientData, null, 2)}

Organisation Data:
${JSON.stringify(data.orgData, null, 2)}

Additional Contract Details:
${JSON.stringify(data.contractDetails, null, 2)}

Instructions:
1. Replace all template placeholders with actual data
2. Fill in dates in proper format (e.g., ${format(new Date(), 'MMMM d, yyyy')})
3. Calculate any amounts if needed
4. Ensure all fields are populated
5. Maintain professional formatting
6. Keep the contract structure and legal language intact
7. Return the complete, ready-to-use contract text

Return ONLY the final contract text with all placeholders filled.`,
        response_json_schema: {
          type: "object",
          properties: {
            contract_text: { type: "string" },
            summary: { type: "string" },
            key_terms: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (result) => {
      setPreviewContent(result.contract_text);
      setGeneratedContract(result);
      toast.success("Contract Generated", "Review and download when ready");
    },
    onError: (error) => {
      toast.error("Generation Failed", error.message);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (contractText) => {
      const contractTitle = `${selectedTemplate.name} - ${selectedCustomer.name}`;
      const fileName = `${contractTitle} - ${format(new Date(), 'yyyy-MM-dd')}.txt`;
      
      // Create a blob and upload
      const blob = new Blob([contractText], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: 'text/plain' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Save as uploaded document
      await base44.entities.UploadedDocument.create({
        organisation_id: orgId,
        file_name: fileName,
        file_url: file_url,
        file_type: 'text/plain',
        file_size: blob.size,
        category: 'contract',
        uploaded_by_id: currentEmployee?.id,
        uploaded_by_name: currentEmployee?.full_name,
        description: `Generated contract for ${selectedCustomer.name}`,
        tags: ['contract', 'generated', selectedTemplate.name, selectedCustomer.name]
      });

      return file_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uploadedDocuments']);
      toast.success("Contract Saved", "Available in Documents");
      handleReset();
      onOpenChange(false);
    }
  });

  const handleGenerateContract = () => {
    if (!selectedTemplate || !selectedCustomer) {
      toast.error("Missing Selection", "Select both template and customer");
      return;
    }

    const clientData = {
      name: selectedCustomer.name,
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || '',
      address: selectedCustomer.address || '',
      company: selectedCustomer.company || '',
      ...contractData
    };

    const orgData = {
      name: organisation?.name || '',
      address: organisation?.address || '',
      city: organisation?.city || '',
      country: organisation?.country || '',
      phone: organisation?.phone || '',
      email: organisation?.email || '',
      tin_number: organisation?.tin_number || '',
    };

    const contractDetails = {
      contract_date: contractData.contract_date || format(new Date(), 'yyyy-MM-dd'),
      start_date: contractData.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: contractData.end_date || '',
      amount: contractData.amount || '',
      terms: contractData.terms || '',
      payment_schedule: contractData.payment_schedule || '',
      ...contractData
    };

    generateMutation.mutate({ clientData, orgData, contractDetails });
  };

  const handleDownload = () => {
    if (!previewContent) return;
    
    const blob = new Blob([previewContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name} - ${selectedCustomer.name} - ${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded", "Contract saved to your device");
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setSelectedCustomer(null);
    setContractData({});
    setPreviewContent("");
    setGeneratedContract(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="h-1 flex -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
            Generate Contract from Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {!previewContent ? (
            <>
              {/* Template Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Contract Template</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-[#0072C6] bg-blue-50'
                          : 'border-gray-200 hover:border-[#1EB053]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-[#0072C6] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{template.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {templates.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No contract templates available. Create one in Document Templates first.
                  </p>
                )}
              </div>

              {/* Customer Selection */}
              {selectedTemplate && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select Client/Customer</Label>
                  <Select
                    value={selectedCustomer?.id || ''}
                    onValueChange={(id) => {
                      const customer = customers.find(c => c.id === id);
                      setSelectedCustomer(customer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {customer.name}
                            {customer.company && ` (${customer.company})`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Contract Details */}
              {selectedCustomer && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Contract Details
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Contract Date</Label>
                      <Input
                        type="date"
                        value={contractData.contract_date || format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setContractData({ ...contractData, contract_date: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Input
                        type="date"
                        value={contractData.start_date || ''}
                        onChange={(e) => setContractData({ ...contractData, start_date: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Input
                        type="date"
                        value={contractData.end_date || ''}
                        onChange={(e) => setContractData({ ...contractData, end_date: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Contract Amount</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={contractData.amount || ''}
                        onChange={(e) => setContractData({ ...contractData, amount: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Payment Schedule</Label>
                    <Input
                      placeholder="e.g., Monthly, Quarterly, Upon completion"
                      value={contractData.payment_schedule || ''}
                      onChange={(e) => setContractData({ ...contractData, payment_schedule: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Special Terms</Label>
                    <Input
                      placeholder="Additional terms or conditions"
                      value={contractData.terms || ''}
                      onChange={(e) => setContractData({ ...contractData, terms: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Customer Info Preview */}
              {selectedCustomer && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Client Information</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.company || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Generated Contract Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Generated Contract
                  </h4>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-700">Ready</Badge>
                  </div>
                </div>

                {generatedContract?.key_terms && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-semibold text-amber-900 mb-2">Key Terms</p>
                    <ul className="text-xs space-y-1">
                      {generatedContract.key_terms.map((term, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-white border rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{previewContent}</pre>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          {!previewContent ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateContract}
                disabled={!selectedTemplate || !selectedCustomer || generateMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Contract
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                Generate Another
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => saveMutation.mutate(previewContent)}
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Save Contract
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="h-1 flex -mb-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}