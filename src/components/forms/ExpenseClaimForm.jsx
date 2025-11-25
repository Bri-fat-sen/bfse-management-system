import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Receipt, Upload, Calendar, DollarSign, FileText, Camera, X, Plus, Check, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([{ description: "", amount: "", category: "other" }]);
  
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
      toast({ title: "Expense Submitted!", description: "Your claim is pending approval" });
      onSuccess?.();
    },
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
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
      toast({ title: "Receipt uploaded!" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!items.some(item => item.description && item.amount)) {
      toast({ title: "Please add at least one expense item", variant: "destructive" });
      return;
    }

    // Create one expense per item or combine them
    const mainCategory = items[0]?.category || "other";
    const description = items.map(i => `${i.description}: Le ${parseFloat(i.amount || 0).toLocaleString()}`).join('; ');

    createMutation.mutate({
      organisation_id: orgId,
      category: mainCategory,
      description: description,
      amount: totalAmount,
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
    <Card className="max-w-2xl mx-auto border-0 shadow-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
      
      <CardHeader className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white pb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Expense Claim</CardTitle>
            <p className="text-white/80 text-sm mt-0.5">Submit expenses for reimbursement</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 -mt-4">
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
            
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-1">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="What was this expense for?"
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Le</span>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        placeholder="0"
                        className="pl-10"
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
            <div>
              <Label className="text-gray-700 font-medium">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(v) => updateField('payment_method', v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-gray-700 font-medium">Vendor / Supplier</Label>
              <Input
                value={formData.vendor}
                onChange={(e) => updateField('vendor', e.target.value)}
                placeholder="Where was this purchased?"
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <Label className="text-gray-700 font-medium mb-2 block">Receipt / Proof</Label>
            {formData.receipt_url ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm flex-1">Receipt uploaded</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => updateField('receipt_url', '')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1EB053] hover:bg-[#1EB053]/5 transition-colors">
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
          </div>

          {/* Notes */}
          <div>
            <Label className="text-gray-700 font-medium">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional context..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          {/* Total & Submit */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
              <span className="font-medium text-gray-700">Total Claim Amount</span>
              <span className="text-2xl font-bold text-[#1EB053]">Le {totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || totalAmount === 0}
                className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90"
              >
                {createMutation.isPending ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}