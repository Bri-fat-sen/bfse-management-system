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
import AIFormAssistant, { QuickSuggestionChips } from "@/components/ai/AIFormAssistant";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId && open,
    staleTime: 5 * 60 * 1000,
  });

  // Handle AI suggestion application
  const handleAISuggestion = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle quick fill selection
  const handleQuickFill = (item) => {
    setFormData(prev => ({
      ...prev,
      category: item.category || prev.category,
      description: item.description || prev.description,
    }));
  };

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
    setShowAdvanced(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Quick Expense</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to save</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <QuickSuggestionChips type="expense" onSelect={handleQuickFill} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2"><span>{cat.icon}</span>{cat.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50">
                <Label className="text-red-700 font-medium text-xs">Amount *</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xs">Le</span>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                    autoFocus
                    className="pl-8 text-base font-semibold border-red-200 bg-white"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm">Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this for?"
                required
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Vendor</Label>
                <Input
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="Supplier name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-sm">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg border bg-gray-50">
                  <Label className="text-sm mb-2 block">Receipt (optional)</Label>
                  {formData.receipt_url ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 flex-1">Uploaded</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, receipt_url: '' }))} className="h-6 text-red-500">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} disabled={uploading} className="text-xs" />
                  )}
                </div>

                <div>
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={2}
                    className="mt-1.5"
                  />
                </div>

                <AIFormAssistant formType="expense" formData={formData} onSuggestion={handleAISuggestion} pastEntries={pastExpenses} categories={categories} />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={createExpenseMutation.isPending} className="flex-1 text-white bg-gradient-to-r from-red-500 to-red-600">
              {createExpenseMutation.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />Record</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}