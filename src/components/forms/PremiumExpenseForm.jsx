import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Receipt,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Fuel,
  Wrench,
  Zap,
  ShoppingBag,
  Home,
  Users,
  Truck,
  Megaphone,
  Shield,
  Coins,
  MoreHorizontal,
  Camera,
  Loader2,
  CheckCircle2,
  X
} from "lucide-react";

const CATEGORIES = [
  { value: "fuel", label: "Fuel", icon: Fuel, color: "bg-orange-500" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, color: "bg-blue-500" },
  { value: "utilities", label: "Utilities", icon: Zap, color: "bg-yellow-500" },
  { value: "supplies", label: "Supplies", icon: ShoppingBag, color: "bg-pink-500" },
  { value: "rent", label: "Rent", icon: Home, color: "bg-purple-500" },
  { value: "salaries", label: "Salaries", icon: Users, color: "bg-green-500" },
  { value: "transport", label: "Transport", icon: Truck, color: "bg-cyan-500" },
  { value: "marketing", label: "Marketing", icon: Megaphone, color: "bg-red-500" },
  { value: "insurance", label: "Insurance", icon: Shield, color: "bg-indigo-500" },
  { value: "petty_cash", label: "Petty Cash", icon: Coins, color: "bg-amber-500" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "bg-gray-500" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "card", label: "Card", icon: "💳" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "mobile_money", label: "Mobile Money", icon: "📱" },
];

export default function PremiumExpenseForm({ open, onOpenChange, orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    vendor: "",
    payment_method: "cash",
    receipt_url: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({
      ...data,
      organisation_id: orgId,
      amount: parseFloat(data.amount),
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      status: "pending"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ 
        title: "Expense Submitted",
        description: `Le ${parseFloat(formData.amount).toLocaleString()} expense has been recorded.`
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      category: "", amount: "", description: "",
      date: new Date().toISOString().split('T')[0],
      vendor: "", payment_method: "cash", receipt_url: "", notes: ""
    });
    setReceiptPreview(null);
    setErrors({});
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, receipt_url: file_url });
      setReceiptPreview(file_url);
      toast({ title: "Receipt uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category);

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5c]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-32 h-32 bg-[#1EB053] rounded-full blur-3xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#0072C6] rounded-full blur-3xl" />
          </div>
          <DialogHeader className="relative p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              Record Expense
            </DialogTitle>
            <p className="text-white/70 text-sm mt-1">Track and manage business expenses</p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[500px] space-y-6">
          {/* Category Selection */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Category *</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    formData.category === cat.value
                      ? 'border-[#1EB053] bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{cat.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {CATEGORIES.slice(8).map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${
                    formData.category === cat.value
                      ? 'border-[#1EB053] bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium">{cat.label}</span>
                </motion.button>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-2">{errors.category}</p>}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Amount (Le) *</Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className={`pl-10 h-12 text-lg font-semibold ${errors.amount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Date *</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`pl-10 h-12 ${errors.date ? 'border-red-500' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Description *</Label>
            <div className="relative mt-1.5">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the expense"
                className={`pl-10 min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Vendor */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Vendor / Supplier</Label>
            <div className="relative mt-1.5">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Who was this paid to?"
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: method.value })}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    formData.payment_method === method.value
                      ? 'border-[#0072C6] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-xs font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Receipt / Invoice</Label>
            {receiptPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-green-300 bg-green-50">
                <img src={receiptPreview} alt="Receipt" className="w-full h-32 object-cover" />
                <button
                  onClick={() => { setReceiptPreview(null); setFormData({ ...formData, receipt_url: "" }); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1EB053] hover:bg-green-50 transition-all">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-[#1EB053] animate-spin" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600">Click to upload receipt</span>
                    <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              className="mt-1.5 min-h-[60px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            {formData.amount && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-bold text-[#1EB053]">Le {parseFloat(formData.amount || 0).toLocaleString()}</p>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-6"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Submit Expense</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}