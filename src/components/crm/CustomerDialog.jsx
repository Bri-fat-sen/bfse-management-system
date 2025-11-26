import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { User, Building2, Phone, Mail, MapPin, Tag, Save } from "lucide-react";

export default function CustomerDialog({ open, onOpenChange, customer, orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    alt_phone: "",
    email: "",
    company_name: "",
    address: "",
    city: "",
    country: "Sierra Leone",
    customer_type: "individual",
    segment: "new",
    source: "walk_in",
    credit_limit: 0,
    birthday: "",
    preferred_contact_method: "phone",
    notes: "",
    tags: []
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
        alt_phone: customer.alt_phone || "",
        email: customer.email || "",
        company_name: customer.company_name || "",
        address: customer.address || "",
        city: customer.city || "",
        country: customer.country || "Sierra Leone",
        customer_type: customer.customer_type || "individual",
        segment: customer.segment || "new",
        source: customer.source || "walk_in",
        credit_limit: customer.credit_limit || 0,
        birthday: customer.birthday || "",
        preferred_contact_method: customer.preferred_contact_method || "phone",
        notes: customer.notes || "",
        tags: customer.tags || []
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        alt_phone: "",
        email: "",
        company_name: "",
        address: "",
        city: "",
        country: "Sierra Leone",
        customer_type: "individual",
        segment: "new",
        source: "walk_in",
        credit_limit: 0,
        birthday: "",
        preferred_contact_method: "phone",
        notes: "",
        tags: []
      });
    }
  }, [customer, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer created successfully');
      onOpenChange(false);
    },
    onError: (error) => toast.error('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer updated successfully');
      onOpenChange(false);
    },
    onError: (error) => toast.error('Failed to update customer'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.phone) {
      toast.error('First name and phone are required');
      return;
    }

    const customerData = {
      ...formData,
      organisation_id: orgId,
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      customer_code: customer?.customer_code || `CUS-${Date.now().toString(36).toUpperCase()}`
    };

    if (customer) {
      updateMutation.mutate({ id: customer.id, data: customerData });
    } else {
      createMutation.mutate(customerData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
              <User className="w-4 h-4 text-white" />
            </div>
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+232 XX XXX XXXX"
                />
              </div>
              <div>
                <Label>Alternative Phone</Label>
                <Input
                  value={formData.alt_phone}
                  onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                  placeholder="+232 XX XXX XXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Preferred Contact</Label>
                <Select
                  value={formData.preferred_contact_method}
                  onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Business Information
            </h3>
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Company Ltd."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Type</Label>
                <Select
                  value={formData.customer_type}
                  onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Credit Limit (Le)</Label>
              <Input
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </h3>
            <div>
              <Label>Street Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Freetown"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Sierra Leone"
                />
              </div>
            </div>
          </div>

          {/* Segmentation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Segmentation
            </h3>
            <div>
              <Label>Customer Segment</Label>
              <Select
                value={formData.segment}
                onValueChange={(value) => setFormData({ ...formData, segment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="loyal">Loyal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this customer..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {customer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}