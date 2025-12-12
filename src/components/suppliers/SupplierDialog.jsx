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
  const [activeSection, setActiveSection] = useState('basic');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    setRating(supplier?.rating || 0);
    setCashOnly(supplier?.cash_only || false);
    if (open) {
      setActiveSection('basic');
    }
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

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'business', label: 'Business', icon: CreditCard },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {supplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <p className="text-white/80 text-sm">
                  {supplier ? `Updating: ${supplier.name}` : 'Register a new supplier partner'}
                </p>
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
            
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Building2 className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Supplier Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Supplier Name *</Label>
                    <Input name="name" defaultValue={supplier?.name} required className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Supplier Code</Label>
                    <Input name="code" defaultValue={supplier?.code} className="mt-1.5 border-gray-200" placeholder="e.g., SUP-001" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select name="status" defaultValue={supplier?.status || "active"}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div className="sm:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <Label className="text-amber-700 font-medium mb-2 block">Supplier Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <Phone className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Contact Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Contact Person</Label>
                    <Input name="contact_person" defaultValue={supplier?.contact_person} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input name="email" type="email" defaultValue={supplier?.email} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Phone</Label>
                    <Input name="phone" defaultValue={supplier?.phone} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Alternate Phone</Label>
                    <Input name="alternate_phone" defaultValue={supplier?.alternate_phone} className="mt-1.5 border-gray-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Address
                    </Label>
                    <Input name="address" defaultValue={supplier?.address} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">City</Label>
                    <Input name="city" defaultValue={supplier?.city} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Country</Label>
                    <Input name="country" defaultValue={supplier?.country || 'Sierra Leone'} className="mt-1.5 border-gray-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Business Section */}
            {activeSection === 'business' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Business Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Payment Terms</Label>
                    <Select name="payment_terms" defaultValue={supplier?.payment_terms || "net_30"}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
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
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Lead Time (Days)
                    </Label>
                    <Input name="default_lead_time_days" type="number" min="1" defaultValue={supplier?.default_lead_time_days || 7} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Tax ID / NRA Number</Label>
                    <Input name="tax_id" defaultValue={supplier?.tax_id} className="mt-1.5 border-gray-200" />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-orange-50 border border-orange-200 flex-1">
                      <Checkbox 
                        id="cash_only" 
                        checked={cashOnly} 
                        onCheckedChange={setCashOnly}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span className="text-sm font-medium text-orange-700">Cash Only Account</span>
                    </label>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Bank Name</Label>
                    <Input name="bank_name" defaultValue={supplier?.bank_name} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Bank Account</Label>
                    <Input name="bank_account" defaultValue={supplier?.bank_account} className="mt-1.5 border-gray-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Notes
                    </Label>
                    <Textarea name="notes" defaultValue={supplier?.notes} className="mt-1.5 border-gray-200" rows={3} />
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
              disabled={isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{supplier ? 'Update' : 'Create'} Supplier</>
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