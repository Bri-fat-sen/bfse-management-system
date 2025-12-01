import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Receipt, Camera, X, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FormWrapper, FormWrapperHeader, FormWrapperContent } from "./FormWrapper";
import { FormInput, FormTextarea, FormSelect, FormField, FormActions } from "./FormField";
import { safeNumber, formatNumber, safeSum } from "@/components/utils/calculations";

const CATEGORIES = [
  { value: "fuel", label: "Fuel & Transport", icon: "⛽", color: "bg-orange-100 text-orange-700" },
  { value: "maintenance", label: "Maintenance", icon: "🔧", color: "bg-blue-100 text-blue-700" },
  { value: "supplies", label: "Office Supplies", icon: "📦", color: "bg-purple-100 text-purple-700" },
  { value: "utilities", label: "Utilities", icon: "💡", color: "bg-yellow-100 text-yellow-700" },
  { value: "transport", label: "Travel", icon: "✈️", color: "bg-sky-100 text-sky-700" },
  { value: "marketing", label: "Marketing", icon: "📢", color: "bg-pink-100 text-pink-700" },
  { value: "petty_cash", label: "Petty Cash", icon: "💵", color: "bg-green-100 text-green-700" },
  { value: "other", label: "Other", icon: "📋", color: "bg-gray-100 text-gray-700" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
];

export default function ExpenseClaimForm({ orgId, currentEmployee, onSuccess, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([{ description: "", amount: "", category: "other" }]);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: "",
    payment_method: "cash",
    notes: "",
    receipt_url: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Expense Submitted!", { description: "Your claim is pending approval" });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to submit expense", { description: error.message });
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    // Clear errors when user types
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", amount: "", category: "other" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField('receipt_url', file_url);
      toast.success("Receipt uploaded!");
    } catch (error) {
      toast.error("Upload failed", { description: error.message });
    }
    setUploading(false);
  };

  // Use safe calculation for total
  const totalAmount = items.reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const validateForm = () => {
    const newErrors = {};
    
    // Check if at least one valid item exists
    const validItems = items.filter(item => item.description.trim() && safeNumber(item.amount) > 0);
    if (validItems.length === 0) {
      newErrors.items = "Please add at least one expense item with description and amount";
    }
    
    // Check for invalid amounts
    items.forEach((item, index) => {
      if (item.amount && safeNumber(item.amount) <= 0 && item.description) {
        newErrors[`item_${index}`] = "Amount must be greater than 0";
      }
    });
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Filter valid items only
    const validItems = items.filter(item => item.description.trim() && safeNumber(item.amount) > 0);
    
    // Create one expense per item or combine them
    const mainCategory = validItems[0]?.category || "other";
    const description = validItems.map(i => `${i.description}: Le ${formatNumber(safeNumber(i.amount))}`).join('; ');
    const calculatedTotal = validItems.reduce((sum, item) => sum + safeNumber(item.amount), 0);

    createMutation.mutate({
      organisation_id: orgId,
      category: mainCategory,
      description: description,
      amount: calculatedTotal,
      date: formData.date,
      vendor: formData.vendor,
      payment_method: formData.payment_method,
      receipt_url: formData.receipt_url,
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      notes: formData.notes,
      status: "pending",
    });
  };

  const selectedCategory = CATEGORIES.find(c => c.value === items[0]?.category);

  return (
    <FormWrapper>
      <FormWrapperHeader
        icon={Receipt}
        title="Expense Claim"
        subtitle="Submit expenses for reimbursement"
        variant="gradient"
      />
      <FormWrapperContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Category Select */}
          <div>
            <Label className="text-gray-700 font-medium mb-3 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => updateItem(0, 'category', cat.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    items[0]?.category === cat.value 
                      ? 'ring-2 ring-[#1EB053] bg-[#1EB053]/10' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expense Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Expense Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-[#1EB053]">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            
            {errors.items && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <X className="w-3 h-3" /> {errors.items}
              </p>
            )}
            
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 items-start p-4 bg-gray-50 rounded-xl ${errors[`item_${index}`] ? 'ring-2 ring-red-200' : ''}`}
              >
                <div className="flex-1">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="What was this expense for?"
                    className="mb-2"
                    required
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Le</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        placeholder="0"
                        className="pl-10"
                        required
                      />
                    </div>
                    <Select value={item.category} onValueChange={(v) => updateItem(index, 'category', v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            <span className="mr-2">{c.icon}</span> {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors[`item_${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}`]}</p>
                  )}
                  {safeNumber(item.amount) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">= Le {formatNumber(safeNumber(item.amount))}</p>
                  )}
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 mt-1">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
            />
            <FormSelect
              label="Payment Method"
              value={formData.payment_method}
              onValueChange={(v) => updateField('payment_method', v)}
              options={PAYMENT_METHODS}
            />
            <FormInput
              label="Vendor / Supplier"
              className="sm:col-span-2"
              value={formData.vendor}
              onChange={(e) => updateField('vendor', e.target.value)}
              placeholder="Where was this purchased?"
            />
          </div>

          {/* Receipt Upload */}
          <FormField label="Receipt / Proof">
            {formData.receipt_url ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm flex-1">Receipt uploaded</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => updateField('receipt_url', '')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1EB053] hover:bg-[#1EB053]/5 transition-all">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#1EB053]" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">Upload receipt photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} disabled={uploading} />
              </label>
            )}
          </FormField>

          {/* Notes */}
          <FormTextarea
            label="Additional Notes"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any additional context..."
            textareaClassName="min-h-[80px]"
          />

          {/* Total & Submit */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
              <span className="font-medium text-gray-700">Total Claim Amount</span>
              <span className="text-2xl font-bold text-[#1EB053]">Le {formatNumber(totalAmount)}</span>
            </div>
            
            {totalAmount === 0 && (
              <p className="text-amber-600 text-sm text-center mb-4">Add expense items with amounts to submit</p>
            )}
            
            <FormActions
              onCancel={onClose}
              submitLabel={createMutation.isPending ? "Submitting..." : "Submit Claim"}
              isLoading={createMutation.isPending}
              disabled={totalAmount === 0 || createMutation.isPending}
            />
          </div>
        </form>
      </FormWrapperContent>
    </FormWrapper>
  );
}