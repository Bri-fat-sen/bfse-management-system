import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { User, Phone, MapPin, UserCheck, Save, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonalInfoEditor({ employee, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    emergency_phone: ""
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        phone: employee.phone || "",
        email: employee.email || "",
        address: employee.address || "",
        emergency_contact: employee.emergency_contact || "",
        emergency_phone: employee.emergency_phone || ""
      });
    }
  }, [employee]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      queryClient.invalidateQueries({ queryKey: ['currentEmployee'] });
      toast.success("Personal information updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update information", { description: error.message });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#1EB053]" />
            Update Personal Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-[#1EB053]" />
              Contact Information
            </h3>
            
            <div>
              <Label className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                  <Mail className="w-3 h-3 text-blue-600" />
                </div>
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                  <Phone className="w-3 h-3 text-green-600" />
                </div>
                Phone Number
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+232 XX XXX XXXX"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-red-600" />
                </div>
                Address
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your full address"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-3 text-sm">
              <UserCheck className="w-4 h-4" />
              Emergency Contact
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Contact Name</Label>
                <Input
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Emergency contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Contact Phone</Label>
                <Input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  placeholder="+232 XX XXX XXXX"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="font-medium text-blue-700 mb-1">📝 Note:</p>
            <p>Only personal contact information can be updated here. For changes to your name, department, role, or salary, please contact HR administration.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-[#178f43]"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}