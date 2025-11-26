import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InteractionDialog({ open, onOpenChange, customer, currentEmployee, orgId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    interaction_type: "call",
    subject: "",
    description: "",
    outcome: "pending",
    interaction_date: format(new Date(), 'yyyy-MM-dd'),
    next_follow_up_date: ""
  });

  useEffect(() => {
    if (open) {
      setFormData({
        interaction_type: "call",
        subject: "",
        description: "",
        outcome: "pending",
        interaction_date: format(new Date(), 'yyyy-MM-dd'),
        next_follow_up_date: ""
      });
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      toast.success("Interaction logged successfully");
      onOpenChange(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      organisation_id: orgId,
      customer_id: customer.id,
      customer_name: customer.name,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Interaction with {customer?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select value={formData.interaction_type} onValueChange={(v) => setFormData({ ...formData, interaction_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={formData.outcome} onValueChange={(v) => setFormData({ ...formData, outcome: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="follow_up_needed">Follow Up Needed</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Subject</Label>
              <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.interaction_date} onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })} />
            </div>
            <div>
              <Label>Next Follow Up</Label>
              <Input type="date" value={formData.next_follow_up_date} onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#1EB053] hover:bg-[#178f43]">Log Interaction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}