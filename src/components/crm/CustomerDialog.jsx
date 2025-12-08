import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  X, Check, Users, Phone, Mail, MapPin, Building2, 
  CreditCard, Tag, Calendar, UserCheck, Loader2
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";

export default function CustomerDialog({ open, onOpenChange, customer, orgId, employees = [], organisation }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    secondary_phone: "",
    customer_type: "individual",
    segment: "new",
    address: "",
    city: "",
    company_name: "",
    tax_id: "",
    tags: [],
    credit_limit: 0,
    preferred_payment_method: "cash",
    notes: "",
    status: "active",
    source: "walk_in",
    assigned_sales_rep_id: "",
    assigned_sales_rep_name: "",
    birthday: ""
  });

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (customer) {
      setFormData({
        ...formData,
        ...customer,
        tags: customer.tags || []
      });
      setShowAdvanced(true);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        secondary_phone: "",
        customer_type: "individual",
        segment: "new",
        address: "",
        city: "",
        company_name: "",
        tax_id: "",
        tags: [],
        credit_limit: 0,
        preferred_payment_method: "cash",
        notes: "",
        status: "active",
        source: "walk_in",
        assigned_sales_rep_id: "",
        assigned_sales_rep_name: "",
        birthday: ""
      });
      setShowAdvanced(false);
    }
  }, [customer, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer created", "Customer record has been added successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Create customer error:', error);
      toast.error("Failed to create customer", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer updated", "Customer information has been updated");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update customer error:', error);
      toast.error("Failed to update customer", error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, organisation_id: orgId };
    
    if (customer) {
      updateMutation.mutate({ id: customer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSalesRepChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setFormData({
      ...formData,
      assigned_sales_rep_id: empId,
      assigned_sales_rep_name: emp?.full_name || ""
    });
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
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
              <Label className="font-medium">Customer Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
                placeholder="Full name or business"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+232..." className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@..." className="mt-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={formData.customer_type} onValueChange={(v) => setFormData({ ...formData, customer_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Segment</Label>
                <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Address</Label>
                    <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Company Name</Label>
                    <Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Tax ID</Label>
                    <Input value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Credit Limit</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Le</span>
                      <Input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })} className="pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Payment Method</Label>
                    <Select value={formData.preferred_payment_method} onValueChange={(v) => setFormData({ ...formData, preferred_payment_method: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Tags</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs gap-1">
                          {tag}
                          <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm">Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="mt-1.5" />
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{customer ? 'Update' : 'Add'}</>}
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