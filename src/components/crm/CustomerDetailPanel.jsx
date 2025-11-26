import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Phone, Mail, MapPin, Building2, Calendar, DollarSign,
  ShoppingCart, MessageSquare, Edit, Star, TrendingUp,
  Clock, Plus, Send, User, FileText
} from "lucide-react";

export default function CustomerDetailPanel({ 
  open, 
  onOpenChange, 
  customer, 
  sales = [],
  orgId,
  currentEmployee,
  onEdit 
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [newInteraction, setNewInteraction] = useState({
    type: "note",
    subject: "",
    description: ""
  });

  const queryClient = useQueryClient();

  const { data: interactions = [] } = useQuery({
    queryKey: ['customerInteractions', customer?.id],
    queryFn: () => base44.entities.CustomerInteraction.filter({ 
      customer_id: customer?.id 
    }, '-created_date'),
    enabled: !!customer?.id,
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customerInteractions']);
      toast.success('Interaction recorded');
      setNewInteraction({ type: "note", subject: "", description: "" });
    },
  });

  const handleAddInteraction = () => {
    if (!newInteraction.description) {
      toast.error('Please enter a description');
      return;
    }

    createInteractionMutation.mutate({
      organisation_id: orgId,
      customer_id: customer.id,
      customer_name: customer.full_name || `${customer.first_name} ${customer.last_name}`,
      interaction_type: newInteraction.type,
      subject: newInteraction.subject,
      description: newInteraction.description,
      recorded_by_id: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      outcome: "pending"
    });
  };

  if (!customer) return null;

  const segmentColors = {
    new: "bg-blue-100 text-blue-800",
    regular: "bg-green-100 text-green-800",
    loyal: "bg-purple-100 text-purple-800",
    vip: "bg-amber-100 text-amber-800",
    at_risk: "bg-red-100 text-red-800",
    churned: "bg-gray-100 text-gray-800"
  };

  const interactionIcons = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    visit: MapPin,
    sms: MessageSquare,
    whatsapp: MessageSquare,
    note: FileText,
    complaint: MessageSquare,
    follow_up: Clock
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={customer.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl">
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl">
                  {customer.full_name || `${customer.first_name} ${customer.last_name || ''}`}
                </SheetTitle>
                {customer.segment === 'vip' && (
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={segmentColors[customer.segment]}>
                  {customer.segment}
                </Badge>
                <Badge variant="outline">{customer.customer_type}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{customer.customer_code}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="purchases" className="flex-1">Purchases</TabsTrigger>
            <TabsTrigger value="interactions" className="flex-1">Interactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{customer.address}, {customer.city}</span>
                  </div>
                )}
                {customer.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{customer.company_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Purchase Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="text-lg font-bold text-[#1EB053]">
                      Le {(customer.total_spent || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total Purchases</p>
                    <p className="text-lg font-bold">{customer.total_purchases || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Avg Order Value</p>
                    <p className="text-lg font-bold">
                      Le {(customer.average_order_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Loyalty Points</p>
                    <p className="text-lg font-bold text-[#D4AF37]">
                      {customer.loyalty_points || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {customer.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {sales.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No purchases yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sales.map((sale) => (
                      <div key={sale.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{sale.sale_number}</p>
                            <p className="text-sm text-gray-500">
                              {sale.created_date && format(new Date(sale.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#1EB053]">
                              Le {(sale.total_amount || 0).toLocaleString()}
                            </p>
                            <Badge variant="secondary">{sale.payment_method}</Badge>
                          </div>
                        </div>
                        {sale.items && sale.items.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            {sale.items.slice(0, 2).map((item, i) => (
                              <span key={i}>
                                {item.product_name} x{item.quantity}
                                {i < Math.min(sale.items.length, 2) - 1 && ', '}
                              </span>
                            ))}
                            {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="mt-4 space-y-4">
            {/* Add New Interaction */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Log Interaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={newInteraction.type}
                  onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="visit">Store Visit</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Describe the interaction..."
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                  rows={3}
                />
                <Button 
                  className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                  onClick={handleAddInteraction}
                  disabled={createInteractionMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Save Interaction
                </Button>
              </CardContent>
            </Card>

            {/* Interaction History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Interaction History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {interactions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No interactions recorded</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {interactions.map((interaction) => {
                      const Icon = interactionIcons[interaction.interaction_type] || MessageSquare;
                      return (
                        <div key={interaction.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {interaction.interaction_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {interaction.created_date && format(new Date(interaction.created_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className="text-sm mt-2">{interaction.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                by {interaction.recorded_by_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}