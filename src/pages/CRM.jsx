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
import { cn } from "@/lib/utils";
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

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
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

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
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
          className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all h-11 rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>

      {/* Tabs for Customers and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative mb-6">
          <TabsList className="bg-white border-2 border-gray-200 p-1.5 w-full rounded-xl shadow-sm">
            <TabsTrigger 
              value="customers" 
              className="flex-1 text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Users className="w-4 h-4 mr-2" /> 
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex-1 text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
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
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Total Customers</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent">{totalCustomers}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1EB053]/10 to-[#0e7f3d]/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#1EB053]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-amber-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">VIP Customers</p>
                    <p className="text-3xl font-bold text-amber-600">{vipCustomers}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Star className="w-7 h-7 text-amber-600 fill-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0072C6] shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Total Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0072C6]">Le {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0072C6]/10 to-[#005a9e]/10 flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-[#0072C6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Avg Value</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">Le {avgOrderValue.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-t-4 border-t-[#1EB053] shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                    <Search className="w-4 h-4 text-[#1EB053]" />
                  </div>
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-14 h-12 border-2 border-gray-200 focus:border-[#1EB053] rounded-xl shadow-sm"
                  />
                </div>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 border-2 border-gray-200 rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="vip">⭐ VIP</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 border-2 border-gray-200 rounded-xl">
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
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card className="border-t-4 border-t-[#0072C6] shadow-lg">
            <CardHeader className="bg-gradient-to-br from-gray-50 to-white border-b">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
                  <UserCheck className="w-5 h-5 text-[#0072C6]" />
                </div>
                <div>
                  <span className="text-gray-900">Customer Directory</span>
                  <p className="text-xs font-normal text-gray-500 mt-0.5">{filteredCustomers.length} customers found</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-full blur-xl" />
                    <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No customers found</p>
                  <p className="text-xs text-gray-500 mb-6">Start building your customer base</p>
                  <Button 
                    className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all" 
                    onClick={handleNew}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add First Customer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-[#1EB053] hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setViewCustomer(customer)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity" />
                          <Avatar className="w-14 h-14 relative border-2 border-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-lg font-bold">
                              {customer.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{customer.name}</p>
                            {customer.segment === 'vip' && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 shadow-sm">
                                <Star className="w-3 h-3 mr-1 fill-white" />
                                VIP
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {customer.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-gray-400" /> 
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-gray-400" /> 
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="font-bold text-lg bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent">
                            Le {(customer.total_spent || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                            <ShoppingCart className="w-3 h-3" />
                            {customer.total_purchases || 0} orders
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={cn("font-medium", segmentColors[customer.segment])}>
                            {customer.segment}
                          </Badge>
                          <Badge variant="outline" className="border-gray-300">
                            {customer.customer_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        orgId={orgId}
        employees={employees}
        organisation={organisation?.[0]}
      />
    </div>
  );
}