import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/Toast";
import { 
  Star, Truck, X, Check, Building2, Phone, Mail, MapPin, 
  CreditCard, Clock, FileText, Loader2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PAYMENT_TERMS = [
  { value: "immediate", label: "Immediate Payment" },
  { value: "net_7", label: "Net 7 Days" },
  { value: "net_15", label: "Net 15 Days" },
  { value: "net_30", label: "Net 30 Days" },
  { value: "net_60", label: "Net 60 Days" },
];

export default function SupplierDialog({ 
  open, 
  onOpenChange, 
  supplier,
  orgId,
  organisation
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(supplier?.rating || 0);
  const [cashOnly, setCashOnly] = useState(supplier?.cash_only || false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    setRating(supplier?.rating || 0);
    setCashOnly(supplier?.cash_only || false);
    setShowAdvanced(!!supplier);
  }, [supplier, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Supplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onOpenChange(false);
      toast.success("Supplier created", "Supplier has been added successfully");
    },
    onError: (error) => {
      console.error('Create supplier error:', error);
      toast.error("Failed to create supplier", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Supplier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onOpenChange(false);
      toast.success("Supplier updated", "Supplier information has been updated");
    },
    onError: (error) => {
      console.error('Update supplier error:', error);
      toast.error("Failed to update supplier", error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      name: formData.get('name'),
      code: formData.get('code'),
      contact_person: formData.get('contact_person'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      alternate_phone: formData.get('alternate_phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country') || 'Sierra Leone',
      payment_terms: formData.get('payment_terms'),
      default_lead_time_days: parseInt(formData.get('default_lead_time_days')) || 7,
      tax_id: formData.get('tax_id'),
      bank_name: formData.get('bank_name'),
      bank_account: formData.get('bank_account'),
      notes: formData.get('notes'),
      rating: rating,
      cash_only: cashOnly,
      status: formData.get('status') || 'active',
    };

    if (supplier) {
      updateMutation.mutate({ id: supplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
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
            <div>
              <Label className="font-medium">Supplier Name *</Label>
              <Input name="name" defaultValue={supplier?.name} required autoFocus className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Contact Person</Label>
                <Input name="contact_person" defaultValue={supplier?.contact_person} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Phone</Label>
                <Input name="phone" defaultValue={supplier?.phone} className="mt-1.5" />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Label className="text-amber-700 font-medium mb-2 block">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-7 h-7 ${star <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Details
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input name="email" type="email" defaultValue={supplier?.email} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Alt. Phone</Label>
                    <Input name="alternate_phone" defaultValue={supplier?.alternate_phone} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">City</Label>
                    <Input name="city" defaultValue={supplier?.city} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Code</Label>
                    <Input name="code" defaultValue={supplier?.code} placeholder="SUP-001" className="mt-1.5" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Address</Label>
                    <Input name="address" defaultValue={supplier?.address} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Payment Terms</Label>
                    <Select name="payment_terms" defaultValue={supplier?.payment_terms || "net_30"}>
                      <SelectTrigger className="mt-1.5">
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
                    <Label className="text-sm">Lead Time (Days)</Label>
                    <Input name="default_lead_time_days" type="number" min="1" defaultValue={supplier?.default_lead_time_days || 7} className="mt-1.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-orange-50 border border-orange-200">
                      <Checkbox checked={cashOnly} onCheckedChange={setCashOnly} />
                      <span className="text-sm text-orange-700">Cash Only Supplier</span>
                    </label>
                  </div>
                  <div>
                    <Label className="text-sm">Bank</Label>
                    <Input name="bank_name" defaultValue={supplier?.bank_name} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Account</Label>
                    <Input name="bank_account" defaultValue={supplier?.bank_account} className="mt-1.5" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Notes</Label>
                    <Textarea name="notes" defaultValue={supplier?.notes} className="mt-1.5" rows={2} />
                  </div>
                </div>
              </div>
            )}

            <input type="hidden" name="country" defaultValue={supplier?.country || 'Sierra Leone'} />
            <input type="hidden" name="tax_id" defaultValue={supplier?.tax_id} />
            <input type="hidden" name="status" defaultValue={supplier?.status || 'active'} />
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{supplier ? 'Update' : 'Add'}</>}
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