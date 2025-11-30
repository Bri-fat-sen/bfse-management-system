import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Plus, Search, Filter, Star, Phone, Mail,
  TrendingUp, ShoppingCart, DollarSign, UserCheck
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import CustomerDialog from "@/components/crm/CustomerDialog";
import CustomerDetail from "@/components/crm/CustomerDetail";
import LoadingSpinner from "@/components/ui/LoadingSpinner";


const segmentColors = {
  vip: "bg-amber-100 text-amber-800",
  regular: "bg-blue-100 text-blue-800",
  new: "bg-green-100 text-green-800",
  at_risk: "bg-orange-100 text-orange-800",
  churned: "bg-gray-100 text-gray-800"
};

export default function CRM() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', orgId],
    queryFn: () => base44.entities.CustomerInteraction.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  if (!user || !currentEmployee || !orgId || loadingCustomers) {
    return <LoadingSpinner message="Loading CRM..." subtitle="Fetching customer data" fullScreen={true} />;
  }

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchesSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    const matchesType = typeFilter === 'all' || c.customer_type === typeFilter;
    return matchesSearch && matchesSegment && matchesType;
  });

  // Stats
  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => c.segment === 'vip').length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  if (viewCustomer) {
    return (
      <CustomerDetail
        customer={viewCustomer}
        sales={sales}
        interactions={interactions}
        onEdit={() => handleEdit(viewCustomer)}
        onBack={() => setViewCustomer(null)}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Relationship Management"
        subtitle="Manage customers, track interactions, and grow relationships"
        action={handleNew}
        actionLabel="Add Customer"
        actionIcon={Plus}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Customers</p>
                <p className="text-2xl font-bold text-[#1EB053]">{totalCustomers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#f59e0b]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">VIP Customers</p>
                <p className="text-2xl font-bold text-[#f59e0b]">{vipCustomers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-[#0072C6]">Le {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#10b981]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Value</p>
                <p className="text-2xl font-bold text-[#10b981]">Le {avgOrderValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#1EB053]" />
            Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No customers found</p>
              <Button className="mt-4 bg-[#1EB053]" onClick={handleNew}>
                <Plus className="w-4 h-4 mr-2" /> Add First Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => setViewCustomer(customer)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                        {customer.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{customer.name}</p>
                        {customer.segment === 'vip' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                        {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="font-semibold text-[#1EB053]">Le {(customer.total_spent || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{customer.total_purchases || 0} orders</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={segmentColors[customer.segment]}>{customer.segment}</Badge>
                      <Badge variant="outline">{customer.customer_type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        orgId={orgId}
        employees={employees}
      />
    </div>
  );
}