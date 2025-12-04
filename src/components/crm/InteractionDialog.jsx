import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { 
  X, Check, Loader2, MessageSquare, Phone, Mail, Calendar,
  Users, FileText
} from "lucide-react";

const interactionTypes = [
  { value: "call", label: "Phone Call", icon: "📞" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "meeting", label: "Meeting", icon: "🤝" },
  { value: "visit", label: "Visit", icon: "🏢" },
  { value: "complaint", label: "Complaint", icon: "⚠️" },
  { value: "inquiry", label: "Inquiry", icon: "❓" },
  { value: "follow_up", label: "Follow Up", icon: "🔄" },
  { value: "support", label: "Support", icon: "🛠️" },
  { value: "other", label: "Other", icon: "📋" },
];

const outcomes = [
  { value: "successful", label: "Successful", color: "bg-green-100 text-green-700" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "follow_up_needed", label: "Follow Up Needed", color: "bg-blue-100 text-blue-700" },
  { value: "no_response", label: "No Response", color: "bg-gray-100 text-gray-700" },
  { value: "negative", label: "Negative", color: "bg-red-100 text-red-700" },
];

export default function InteractionDialog({ open, onOpenChange, customer, currentEmployee, orgId, organisation }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('type');
  const [formData, setFormData] = useState({
    interaction_type: "call",
    subject: "",
    description: "",
    outcome: "pending",
    interaction_date: format(new Date(), 'yyyy-MM-dd'),
    next_follow_up_date: ""
  });

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

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
      setActiveSection('type');
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      toast.success("Interaction logged", "Customer interaction has been recorded");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Create interaction error:', error);
      toast.error("Failed to log interaction", error.message);
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

  const sections = [
    { id: 'type', label: 'Type', icon: MessageSquare },
    { id: 'details', label: 'Details', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
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
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Log Interaction</h2>
                <p className="text-white/80 text-sm">with {customer?.name}</p>
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
            
            {/* Type Section */}
            {activeSection === 'type' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <MessageSquare className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Interaction Type</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Type *</Label>
                    <Select value={formData.interaction_type} onValueChange={(v) => setFormData({ ...formData, interaction_type: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {interactionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Outcome</Label>
                    <Select value={formData.outcome} onValueChange={(v) => setFormData({ ...formData, outcome: v })}>
                      <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {outcomes.map(o => (
                          <SelectItem key={o.value} value={o.value}>
                            <span className={`px-2 py-0.5 rounded ${o.color}`}>{o.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Subject</Label>
                  <Input 
                    value={formData.subject} 
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                    className="mt-1.5 border-gray-200"
                    placeholder="Brief summary of the interaction"
                  />
                </div>
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <FileText className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Details & Follow Up</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Interaction Date
                    </Label>
                    <Input 
                      type="date" 
                      value={formData.interaction_date} 
                      onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })} 
                      className="mt-2 border-[#1EB053]/30 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Next Follow Up
                    </Label>
                    <Input 
                      type="date" 
                      value={formData.next_follow_up_date} 
                      onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })} 
                      className="mt-2 border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    rows={5} 
                    className="mt-1.5 border-gray-200"
                    placeholder="Detailed notes about the interaction..."
                  />
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
              disabled={createMutation.isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Log Interaction</>
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