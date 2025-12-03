import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, Receipt, Upload, X, Check, DollarSign, 
  Calendar, CreditCard, FileText, Building2
} from "lucide-react";
import AIFormAssistant from "./AIFormAssistant";

const categories = [
  { value: "fuel", label: "Fuel", icon: "⛽" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "supplies", label: "Office Supplies", icon: "📎" },
  { value: "rent", label: "Rent", icon: "🏢" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "marketing", label: "Marketing", icon: "📣" },
  { value: "insurance", label: "Insurance", icon: "🛡️" },
  { value: "petty_cash", label: "Petty Cash", icon: "💵" },
  { value: "other", label: "Other", icon: "📋" },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
];

export default function ExpenseDialog({ open, onOpenChange, orgId, currentEmployee, organisation }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('details');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const [formData, setFormData] = useState({
    category: 'other',
    description: '',
    amount: '',
    vendor: '',
    payment_method: 'cash',
    date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    notes: '',
  });

  // Fetch past expenses for AI suggestions
  const { data: pastExpenses = [] } = useQuery({
    queryKey: ['pastExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 100),
    enabled: !!orgId && open,
    staleTime: 5 * 60 * 1000,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({
      ...data,
      organisation_id: orgId,
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      amount: parseFloat(data.amount) || 0,
      status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Expense recorded successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to record expense");
    },
  });

  const resetForm = () => {
    setFormData({
      category: 'other',
      description: '',
      amount: '',
      vendor: '',
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0],
      receipt_url: '',
      notes: '',
    });
    setActiveSection('details');
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, receipt_url: file_url }));
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error("Please fill required fields");
      return;
    }
    createExpenseMutation.mutate(formData);
  };

  const sections = [
    { id: 'details', label: 'Details', icon: Receipt },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Record Expense</h2>
                <p className="text-white/80 text-sm">Track business expenditure</p>
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

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Expense Details</h3>
                </div>

                {/* AI Form Assistant */}
                <AIFormAssistant
                  formType="expense"
                  formData={formData}
                  setFormData={setFormData}
                  pastEntries={pastExpenses}
                  categories={categories}
                  organisation={organisation}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              {cat.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                    <Label className="text-red-700 font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Amount (SLE) *
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">Le</span>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        required
                        className="pl-10 text-lg font-semibold border-red-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Description *</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What was this expense for?"
                      required
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Vendor/Supplier
                    </Label>
                    <Input
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      placeholder="e.g. Freetown Fuel Station"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {activeSection === 'payment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Payment & Receipt</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Payment Method</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Receipt Upload */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
                      <Upload className="w-4 h-4" /> Receipt (optional)
                    </Label>
                    {formData.receipt_url ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">Receipt uploaded</p>
                          <p className="text-xs text-green-600">File attached successfully</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, receipt_url: '' }))}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptUpload}
                          disabled={uploading}
                          className="border-gray-200"
                        />
                        {uploading && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Notes
                    </Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows={3}
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createExpenseMutation.isPending}
              className="w-full sm:flex-1 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {createExpenseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Record Expense</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}