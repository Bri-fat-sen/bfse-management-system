import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { UserPlus, Send } from "lucide-react";

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Organisation Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "retail_cashier", label: "Retail Cashier" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "driver", label: "Driver" },
  { value: "accountant", label: "Accountant" },
  { value: "support_staff", label: "Support Staff" },
  { value: "read_only", label: "Read Only" },
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support"];

export default function SendInviteEmailDialog({ open, onOpenChange, organisation, inviterName }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("read_only");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const inviteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('inviteUser', {
        email: email.trim(),
        full_name: fullName.trim(),
        organisation_id: organisation?.id,
        role,
        department: department.trim(),
        position: position.trim(),
        send_email: true,
      });
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (data.email_sent) {
        toast.success("User invited successfully", `${fullName} has been added and welcome email sent`);
      } else {
        toast.warning("User invited (email issue)", data.message || `${fullName} added but email wasn't sent. Please inform them manually.`);
      }
      
      setEmail("");
      setFullName("");
      setRole("read_only");
      setDepartment("");
      setPosition("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to invite user", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !fullName) {
      toast.error("Missing information", "Please provide both email and full name");
      return;
    }
    inviteUserMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#1EB053]" />
            Invite User to Platform
          </DialogTitle>
          <DialogDescription>
            Create a new user account and send them a welcome email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Manager"
                className="mt-1"
              />
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>✓ User account will be created automatically</strong>
            </p>
            <p className="text-xs text-green-700 mt-1">
              They can log in immediately using Google SSO with their email
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteUserMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {inviteUserMutation.isPending ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2 animate-pulse" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invite User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}