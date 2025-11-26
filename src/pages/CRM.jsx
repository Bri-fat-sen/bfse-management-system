import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users, UserPlus, Search, Filter, Phone, Mail, MapPin,
  Building2, Tag, TrendingUp, DollarSign, Calendar,
  MessageSquare, MoreVertical, Star, AlertCircle, UserCheck,
  Download, Upload, Eye, Edit, Trash2, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import CustomerDialog from "@/components/crm/CustomerDialog";
import CustomerDetailPanel from "@/components/crm/CustomerDetailPanel";
import CustomerSegments from "@/components/crm/CustomerSegments";

export default function CRM() {
  const [activeTab, setActiveTab] = useState("customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }, '-created_date'),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['customerSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['customers']),
  });

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
      const matchesType = typeFilter === "all" || customer.customer_type === typeFilter;
      
      return matchesSearch && matchesSegment && matchesType;
    });
  }, [customers, searchTerm, segmentFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => c.segment === 'vip' || c.customer_type === 'vip').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const atRiskCustomers = customers.filter(c => c.segment === 'at_risk').length;
    
    return { totalCustomers, activeCustomers, vipCustomers, totalRevenue, atRiskCustomers };
  }, [customers]);

  const segmentColors = {
    new: "bg-blue-100 text-blue-800",
    regular: "bg-green-100 text-green-800",
    loyal: "bg-purple-100 text-purple-800",
    vip: "bg-amber-100 text-amber-800",
    at_risk: "bg-red-100 text-red-800",
    churned: "bg-gray-100 text-gray-800"
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailPanel(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Relationship Management"
        subtitle="Manage customers, track interactions, and grow relationships"
        action={() => {
          setEditingCustomer(null);
          setShowCustomerDialog(true);
        }}
        actionLabel="Add Customer"
        actionIcon={UserPlus}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-[#1EB053] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#0072C6] to-[#9333EA]" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Active</p>
                <p className="text-2xl font-bold">{stats.activeCustomers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-[#0072C6] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">VIP Customers</p>
                <p className="text-2xl font-bold">{stats.vipCustomers}</p>
              </div>
              <Star className="w-8 h-8 text-[#D4AF37] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">At Risk</p>
                <p className="text-2xl font-bold">{stats.atRiskCustomers}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Revenue</p>
                <p className="text-2xl font-bold">Le {(stats.totalRevenue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="customers" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            All Customers
          </TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <Tag className="w-4 h-4 mr-2" />
            Segments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-4">
          {/* Filters */}
          <Card className="mb-4 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="loyal">Loyal</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
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
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No customers found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={customer.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                            {customer.first_name?.[0]}{customer.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {customer.full_name || `${customer.first_name} ${customer.last_name || ''}`}
                            </h3>
                            {customer.segment === 'vip' && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                            <Badge className={segmentColors[customer.segment]}>
                              {customer.segment}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </span>
                            )}
                            {customer.company_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {customer.company_name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right hidden md:block">
                          <p className="font-semibold text-[#1EB053]">
                            Le {(customer.total_spent || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.total_purchases || 0} purchases
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewCustomer(customer);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomer(customer);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this customer?')) {
                                  deleteCustomerMutation.mutate(customer.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="mt-4">
          <CustomerSegments customers={customers} orgId={orgId} />
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <CustomerDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        customer={editingCustomer}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Customer Detail Panel */}
      <CustomerDetailPanel
        open={showDetailPanel}
        onOpenChange={setShowDetailPanel}
        customer={selectedCustomer}
        sales={sales.filter(s => s.customer_phone === selectedCustomer?.phone)}
        orgId={orgId}
        currentEmployee={currentEmployee}
        onEdit={handleEditCustomer}
      />
    </div>
  );
}