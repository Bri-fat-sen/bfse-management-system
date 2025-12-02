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
import { toast } from "sonner";

export default function CustomerDialog({ open, onOpenChange, customer, orgId, employees = [], organisation }) {
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState('basic');
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
    }
    if (open) {
      setActiveSection('basic');
    }
  }, [customer, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer created successfully");
      onOpenChange(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer updated successfully");
      onOpenChange(false);
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

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Users },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'business', label: 'Business', icon: CreditCard },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {customer ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <p className="text-white/80 text-sm">
                  {customer ? `Updating: ${customer.name}` : 'Register a new customer'}
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
                    <Users className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Customer Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Customer Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1.5 border-gray-200"
                      placeholder="Full name or business name"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Customer Type</Label>
                    <Select value={formData.customer_type} onValueChange={(v) => setFormData({ ...formData, customer_type: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Source</Label>
                    <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Segment</Label>
                    <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="churned">Churned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Secondary Phone</Label>
                    <Input value={formData.secondary_phone} onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Birthday
                    </Label>
                    <Input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Address
                    </Label>
                    <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <UserCheck className="w-3 h-3" /> Assigned Sales Rep
                    </Label>
                    <Select value={formData.assigned_sales_rep_id} onValueChange={handleSalesRepChange}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <h3 className="font-semibold text-gray-900">Business & Billing</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Company Name
                    </Label>
                    <Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Tax ID</Label>
                    <Input value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} className="mt-1.5 border-gray-200" />
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium">Credit Limit (Le)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1EB053] font-bold">Le</span>
                      <Input 
                        type="number" 
                        min="0"
                        step="1000"
                        value={formData.credit_limit} 
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setFormData({ ...formData, credit_limit: 0 });
                          } else {
                            const parsed = parseFloat(value);
                            setFormData({ ...formData, credit_limit: isNaN(parsed) ? 0 : Math.max(0, parsed) });
                          }
                        }}
                        className="pl-10 border-[#1EB053]/30 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Payment Method</Label>
                    <Select value={formData.preferred_payment_method} onValueChange={(v) => setFormData({ ...formData, preferred_payment_method: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Tags */}
                  <div className="sm:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4" /> Tags
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="border-gray-200"
                      />
                      <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="mt-1.5 border-gray-200" />
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
                <><Check className="w-4 h-4 mr-2" />{customer ? 'Update' : 'Create'} Customer</>
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