import React from "react";
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
import { Star } from "lucide-react";
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
  orgId 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(supplier?.rating || 0);
  const [cashOnly, setCashOnly] = React.useState(supplier?.cash_only || false);

  React.useEffect(() => {
    setRating(supplier?.rating || 0);
    setCashOnly(supplier?.cash_only || false);
  }, [supplier]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Supplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onOpenChange(false);
      toast({ title: "Supplier created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Supplier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onOpenChange(false);
      toast({ title: "Supplier updated successfully" });
    },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label>Supplier Name *</Label>
              <Input name="name" defaultValue={supplier?.name} required className="mt-1" />
            </div>
            <div>
              <Label>Supplier Code</Label>
              <Input name="code" defaultValue={supplier?.code} className="mt-1" placeholder="e.g., SUP-001" />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input name="contact_person" defaultValue={supplier?.contact_person} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue={supplier?.email} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" defaultValue={supplier?.phone} className="mt-1" />
            </div>
            <div>
              <Label>Alternate Phone</Label>
              <Input name="alternate_phone" defaultValue={supplier?.alternate_phone} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input name="address" defaultValue={supplier?.address} className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input name="city" defaultValue={supplier?.city} className="mt-1" />
            </div>
            <div>
              <Label>Country</Label>
              <Input name="country" defaultValue={supplier?.country || 'Sierra Leone'} className="mt-1" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Business Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Select name="payment_terms" defaultValue={supplier?.payment_terms || "net_30"}>
                  <SelectTrigger className="mt-1">
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
                <Label>Default Lead Time (Days)</Label>
                <Input name="default_lead_time_days" type="number" min="1" defaultValue={supplier?.default_lead_time_days || 7} className="mt-1" />
              </div>
              <div>
                <Label>Tax ID / NRA Number</Label>
                <Input name="tax_id" defaultValue={supplier?.tax_id} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={supplier?.status || "active"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="cash_only" 
                  checked={cashOnly} 
                  onCheckedChange={setCashOnly}
                />
                <Label htmlFor="cash_only" className="text-sm font-normal cursor-pointer">
                  Cash Only Account
                </Label>
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input name="bank_name" defaultValue={supplier?.bank_name} className="mt-1" />
              </div>
              <div>
                <Label>Bank Account</Label>
                <Input name="bank_account" defaultValue={supplier?.bank_account} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${star <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={supplier?.notes} className="mt-1" rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1EB053] hover:bg-[#178f43]" disabled={createMutation.isPending || updateMutation.isPending}>
              {supplier ? 'Update' : 'Create'} Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}