import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Receipt, Upload } from "lucide-react";

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

export default function ExpenseDialog({ open, onOpenChange, orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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
      toast({ title: "Expense recorded successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to record expense", variant: "destructive" });
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
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, receipt_url: file_url }));
      toast({ title: "Receipt uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    createExpenseMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-500" />
            Record Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
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
            <div>
              <Label className="text-xs text-gray-500">Amount (SLE) *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Description *</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Vendor/Supplier</Label>
              <Input
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="e.g. Freetown Fuel Station"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Receipt (optional)</Label>
            <div className="mt-1 flex items-center gap-3">
              {formData.receipt_url ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg flex-1">
                  <Receipt className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 truncate">Receipt uploaded</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, receipt_url: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    disabled={uploading}
                  />
                </div>
              )}
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600"
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}