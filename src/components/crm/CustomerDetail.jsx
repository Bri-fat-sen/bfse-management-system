import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Phone, Mail, MapPin, Building2, Calendar, DollarSign,
  ShoppingCart, MessageSquare, Edit, Star, TrendingUp,
  Clock, Plus, ArrowLeft, Trash2, AlertTriangle
} from "lucide-react";
import InteractionDialog from "./InteractionDialog";

const segmentColors = {
  vip: "bg-amber-100 text-amber-800 border-amber-300",
  regular: "bg-blue-100 text-blue-800 border-blue-300",
  new: "bg-green-100 text-green-800 border-green-300",
  at_risk: "bg-orange-100 text-orange-800 border-orange-300",
  churned: "bg-gray-100 text-gray-800 border-gray-300"
};

const interactionIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  visit: MapPin,
  complaint: MessageSquare,
  inquiry: MessageSquare,
  follow_up: Clock,
  sale: ShoppingCart,
  support: MessageSquare,
  other: MessageSquare
};

export default function CustomerDetail({ customer, sales = [], interactions = [], onEdit, onBack, currentEmployee, orgId }) {
  const [interactionOpen, setInteractionOpen] = useState(false);

  const customerSales = sales.filter(s => s.customer_id === customer.id);
  const customerInteractions = interactions.filter(i => i.customer_id === customer.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl">
                {customer.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                {customer.segment === 'vip' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={segmentColors[customer.segment]}>{customer.segment?.toUpperCase()}</Badge>
                <Badge variant="outline">{customer.customer_type}</Badge>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>{customer.status}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInteractionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Log Interaction
            </Button>
            <Button onClick={onEdit} className="bg-[#0072C6]">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold">Le {(customer.total_spent || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{customer.total_purchases || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-2xl font-bold">Le {(customer.average_order_value || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Loyalty Points</p>
            <p className="text-2xl font-bold">{customer.loyalty_points || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
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
                <span>{customer.address}{customer.city ? `, ${customer.city}` : ''}</span>
              </div>
            )}
            {customer.company_name && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{customer.company_name}</span>
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Birthday: {format(new Date(customer.birthday), 'MMM d')}</span>
              </div>
            )}
            {customer.tags?.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Sales & Interactions */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">Purchase History ({customerSales.length})</TabsTrigger>
              <TabsTrigger value="interactions">Interactions ({customerInteractions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {customerSales.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No purchases yet</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {customerSales.map(sale => (
                        <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#1EB053]/10">
                              <ShoppingCart className="w-4 h-4 text-[#1EB053]" />
                            </div>
                            <div>
                              <p className="font-medium">{sale.sale_number || `Sale #${sale.id?.slice(-6)}`}</p>
                              <p className="text-sm text-gray-500">{format(new Date(sale.created_date), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                            <Badge variant="secondary" className="text-xs">{sale.payment_method}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="interactions" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {customerInteractions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No interactions logged</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {customerInteractions.map(interaction => {
                        const Icon = interactionIcons[interaction.interaction_type] || MessageSquare;
                        return (
                          <div key={interaction.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[#0072C6]/10">
                                  <Icon className="w-4 h-4 text-[#0072C6]" />
                                </div>
                                <div>
                                  <p className="font-medium capitalize">{interaction.interaction_type.replace('_', ' ')}</p>
                                  {interaction.subject && <p className="text-sm text-gray-700">{interaction.subject}</p>}
                                  {interaction.description && <p className="text-sm text-gray-500 mt-1">{interaction.description}</p>}
                                  <p className="text-xs text-gray-400 mt-2">By {interaction.employee_name} • {format(new Date(interaction.interaction_date), 'MMM d, yyyy')}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">{interaction.outcome}</Badge>
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
        </div>
      </div>

      <InteractionDialog
        open={interactionOpen}
        onOpenChange={setInteractionOpen}
        customer={customer}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />
    </div>
  );
}