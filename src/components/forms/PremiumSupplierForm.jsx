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
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileText,
  Star,
  Loader2,
  CheckCircle2,
  Sparkles,
  Plus
} from "lucide-react";

const SUPPLIER_TYPES = [
  { value: "manufacturer", label: "Manufacturer", icon: "🏭", description: "Direct from factory" },
  { value: "wholesaler", label: "Wholesaler", icon: "📦", description: "Bulk distributor" },
  { value: "distributor", label: "Distributor", icon: "🚚", description: "Regional supplier" },
  { value: "retailer", label: "Retailer", icon: "🏪", description: "Retail supplier" },
  { value: "importer", label: "Importer", icon: "🌍", description: "International goods" },
  { value: "local", label: "Local Vendor", icon: "🏠", description: "Local business" },
];

const PAYMENT_TERMS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "net_7", label: "Net 7 Days" },
  { value: "net_15", label: "Net 15 Days" },
  { value: "net_30", label: "Net 30 Days" },
  { value: "net_60", label: "Net 60 Days" },
  { value: "prepaid", label: "Prepaid" },
];

export default function PremiumSupplierForm({ open, onOpenChange, orgId, editSupplier = null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: editSupplier?.name || "",
    supplier_type: editSupplier?.supplier_type || "",
    contact_person: editSupplier?.contact_person || "",
    email: editSupplier?.email || "",
    phone: editSupplier?.phone || "",
    alt_phone: editSupplier?.alt_phone || "",
    address: editSupplier?.address || "",
    city: editSupplier?.city || "",
    country: editSupplier?.country || "Sierra Leone",
    website: editSupplier?.website || "",
    payment_terms: editSupplier?.payment_terms || "cod",
    credit_limit: editSupplier?.credit_limit || "",
    tax_id: editSupplier?.tax_id || "",
    bank_name: editSupplier?.bank_name || "",
    bank_account: editSupplier?.bank_account || "",
    notes: editSupplier?.notes || "",
    rating: editSupplier?.rating || 0,
    is_active: editSupplier?.is_active ?? true,
  });

  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organisation_id: orgId,
        credit_limit: parseFloat(data.credit_limit) || 0,
      };
      return editSupplier
        ? base44.entities.Supplier.update(editSupplier.id, payload)
        : base44.entities.Supplier.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: editSupplier ? "Supplier Updated" : "Supplier Added",
        description: `${formData.name} has been ${editSupplier ? 'updated' : 'added'} successfully.`
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
      name: "", supplier_type: "", contact_person: "", email: "", phone: "",
      alt_phone: "", address: "", city: "", country: "Sierra Leone", website: "",
      payment_terms: "cod", credit_limit: "", tax_id: "", bank_name: "",
      bank_account: "", notes: "", rating: 0, is_active: true
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Supplier name is required";
    if (!formData.supplier_type) newErrors.supplier_type = "Supplier type is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0072C6] to-[#1EB053]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-10 -translate-y-10" />
          </div>
          <DialogHeader className="relative p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              {editSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              Manage your supplier information and relationships
            </p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[500px] space-y-6">
          {/* Supplier Type */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Supplier Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPLIER_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, supplier_type: type.value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    formData.supplier_type === type.value
                      ? 'border-[#0072C6] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className="font-medium text-sm mt-1">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </motion.button>
              ))}
            </div>
            {errors.supplier_type && <p className="text-red-500 text-xs mt-2">{errors.supplier_type}</p>}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-sm font-semibold text-gray-700">Company Name *</Label>
              <div className="relative mt-1.5">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  className={`pl-10 h-11 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Contact Person</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Primary contact"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@email.com"
                  className={`pl-10 h-11 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Phone *</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+232 XX XXX XXX"
                  className={`pl-10 h-11 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Alternative Phone</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.alt_phone}
                  onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                  placeholder="+232 XX XXX XXX"
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Address</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                className="pl-10 min-h-[70px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Freetown"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Sierra Leone"
                className="mt-1.5 h-11"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Website</Label>
            <div className="relative mt-1.5">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Payment & Credit */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Payment Terms</Label>
                <Select value={formData.payment_terms} onValueChange={(v) => setFormData({ ...formData, payment_terms: v })}>
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map(term => (
                      <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Credit Limit (Le)</Label>
                <Input
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  placeholder="0"
                  className="mt-1 h-10 bg-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Bank Name</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Bank name"
                  className="mt-1 h-10 bg-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Account Number</Label>
                <Input
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  placeholder="Account number"
                  className="mt-1 h-10 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Supplier Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this supplier..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-2 bg-gradient-to-r from-[#0072C6] to-[#1EB053] px-6"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> {editSupplier ? 'Update' : 'Add'} Supplier</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}