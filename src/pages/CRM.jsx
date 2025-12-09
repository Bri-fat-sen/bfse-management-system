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
  TrendingUp, ShoppingCart, DollarSign, UserCheck, BarChart3
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import CustomerDialog from "@/components/crm/CustomerDialog";
import CustomerDetail from "@/components/crm/CustomerDetail";
import CRMAnalytics from "@/components/crm/CRMAnalytics";
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
  const [activeTab, setActiveTab] = useState("customers");

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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
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

  if (!user) {
    return <LoadingSpinner message="Loading CRM..." subtitle="Fetching customer data" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingCustomers) {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track relationships and grow your business</p>
          </div>
        </div>
        <Button
          onClick={handleNew}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all h-11 sm:h-12 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Tabs for Customers and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative mb-6">
          <TabsList className="bg-white border-2 border-gray-200 p-1.5 w-full sm:w-auto rounded-xl shadow-sm">
            <TabsTrigger 
              value="customers" 
              className="flex-1 sm:flex-none text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Users className="w-4 h-4 mr-2" /> 
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex-1 sm:flex-none text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-2" /> 
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analytics" className="mt-6">
          <CRMAnalytics 
            customers={customers} 
            sales={sales} 
            interactions={interactions} 
            employees={employees}
          />
        </TabsContent>

        <TabsContent value="customers" className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-t-4 border-t-[#1EB053] shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Customers</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent mt-1">
                      {totalCustomers}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1EB053]/20 to-[#0e7f3d]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#1EB053]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-amber-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">VIP Customers</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mt-1">
                      {vipCustomers}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <Star className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0072C6] shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#0072C6] to-[#005a9e] bg-clip-text text-transparent mt-1">
                      Le {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0072C6]/20 to-[#005a9e]/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-[#0072C6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Avg Value</p>
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mt-1">
                      Le {avgOrderValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-t-4 border-t-[#1EB053] shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                    <Search className="w-4 h-4 text-[#1EB053]" />
                  </div>
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-14 h-12 border-2 border-gray-200 focus:border-[#1EB053] rounded-xl shadow-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
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
                    <SelectTrigger className="w-full sm:w-[160px] h-12 border-2 border-gray-200 rounded-xl">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
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
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          {filteredCustomers.length === 0 ? (
            <Card className="border-t-4 border-t-gray-300">
              <CardContent className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No customers found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {search || segmentFilter !== 'all' || typeFilter !== 'all' 
                    ? "Try adjusting your filters" 
                    : "Get started by adding your first customer"}
                </p>
                {!search && segmentFilter === 'all' && typeFilter === 'all' && (
                  <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all" onClick={handleNew}>
                    <Plus className="w-4 h-4 mr-2" /> Add First Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => (
                <Card
                  key={customer.id}
                  className="group cursor-pointer transition-all hover:shadow-xl border-2 border-gray-200 hover:border-[#1EB053] hover:-translate-y-1 overflow-hidden"
                  onClick={() => setViewCustomer(customer)}
                >
                  {/* Top accent stripe */}
                  <div className="h-1 flex">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-14 h-14 ring-2 ring-gray-100 group-hover:ring-[#1EB053] transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl font-bold">
                            {customer.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {customer.segment === 'vip' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{customer.name}</h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge className={cn("text-xs font-semibold", segmentColors[customer.segment])}>
                            {customer.segment}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {customer.customer_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-[#1EB053]" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                          <Mail className="w-4 h-4 text-[#0072C6]" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Total Spent</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent">
                            Le {(customer.total_spent || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Orders</p>
                          <p className="text-lg font-bold text-gray-900">
                            {customer.total_purchases || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </TabsContent>
      </Tabs>

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