import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  FileText,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Ban,
  MoreVertical,
  Eye,
  Download,
  Printer,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SupplierDialog from "@/components/suppliers/SupplierDialog";
import SupplierProductsDialog from "@/components/suppliers/SupplierProductsDialog";
import PurchaseOrderDialog from "@/components/suppliers/PurchaseOrderDialog";
import ReceiveStockDialog from "@/components/suppliers/ReceiveStockDialog";
import PriceHistoryDialog from "@/components/suppliers/PriceHistoryDialog";
import ApprovalWorkflowManager from "@/components/suppliers/ApprovalWorkflowManager";
import { PermissionGate } from "@/components/permissions/PermissionGate";
import { format } from "date-fns";
import PrintableFormsDownload from "@/components/finance/PrintableFormsDownload";

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  ordered: { label: 'Ordered', color: 'bg-purple-100 text-purple-700', icon: ShoppingCart },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  received: { label: 'Received', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: Ban },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: Ban },
};

export default function Suppliers() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showDeletePOConfirm, setShowDeletePOConfirm] = useState(false);
  const [poToDelete, setPOToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("suppliers");
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPODialog, setShowPODialog] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receivingPO, setReceivingPO] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [priceHistorySupplier, setPriceHistorySupplier] = useState(null);
  const [showFormsDialog, setShowFormsDialog] = useState(false);
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);

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

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const result = await base44.entities.Supplier.filter({ organisation_id: orgId });
      return result || [];
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });

  const { data: purchaseOrders = [], isLoading: loadingPOs } = useQuery({
    queryKey: ['purchaseOrders', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const result = await base44.entities.PurchaseOrder.filter({ organisation_id: orgId }, '-created_date', 100);
      return result || [];
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const result = await base44.entities.Product.filter({ organisation_id: orgId });
      return result || [];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const result = await base44.entities.Warehouse.filter({ organisation_id: orgId });
      return result || [];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Supplier.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', orgId] });
      toast.success("Supplier deleted");
    },
    onError: (error) => {
      console.error('Delete supplier error:', error);
      toast.error("Failed to delete supplier", error.message);
    }
  });

  const deletePOMutation = useMutation({
    mutationFn: (id) => base44.entities.PurchaseOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', orgId] });
      toast.success("Purchase order deleted");
    },
    onError: (error) => {
      console.error('Delete PO error:', error);
      toast.error("Failed to delete purchase order", error.message);
    }
  });

  const updatePOMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', orgId] });
      toast.success("Purchase order updated");
    },
    onError: (error) => {
      console.error('Update PO error:', error);
      toast.error("Failed to update purchase order", error.message);
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: (purchaseOrderId) => base44.functions.invoke('sendPurchaseOrder', { purchaseOrderId }),
    onSuccess: (response) => {
      toast.success("Email sent", response.data.message);
    },
    onError: (error) => {
      console.error('Send email error:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error("Failed to send email", errorMsg);
    }
  });

  // Stats
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const pendingOrders = purchaseOrders.filter(po => ['pending', 'approved', 'ordered'].includes(po.status)).length;
  const totalSpent = purchaseOrders.filter(po => po.status === 'received').reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const avgLeadTime = suppliers.filter(s => s.default_lead_time_days).reduce((sum, s) => sum + s.default_lead_time_days, 0) / (suppliers.length || 1);

  // Filters
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= (rating || 0) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return <LoadingSpinner message="Loading Suppliers..." subtitle="Fetching supplier information" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Truck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingSuppliers) {
    return <LoadingSpinner message="Loading Suppliers..." subtitle="Fetching supplier information" fullScreen={true} />;
  }

  return (
    <PermissionGate module="inventory" action="view" showDenied>
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        <PageHeader
          title="Supplier Management"
          subtitle="Manage suppliers and purchase orders"
        >
          <div className="flex flex-wrap gap-2">
            <PermissionGate module="inventory" action="create" fallback={null}>
              <Button 
                size="sm" 
                className="bg-[#1EB053] hover:bg-[#178f43] text-xs sm:text-sm"
                onClick={() => {
                  setEditingSupplier(null);
                  setShowSupplierDialog(true);
                }}
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Supplier</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </PermissionGate>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => {
              setShowFormsDialog(true);
            }}>
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Print Forms</span>
              <span className="sm:hidden">Forms</span>
            </Button>
            <PermissionGate module="inventory" action="create" fallback={null}>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => {
                setEditingPO(null);
                setShowPODialog(true);
              }}>
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Purchase Order</span>
                <span className="sm:hidden">New PO</span>
              </Button>
            </PermissionGate>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => {
              setPriceHistorySupplier(null);
              setShowPriceHistory(true);
            }}>
              <TrendingUp className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Price History</span>
              <span className="sm:hidden">Prices</span>
            </Button>
            <PermissionGate module="settings" action="edit" fallback={null}>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setShowWorkflowManager(true)}>
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Approval Rules</span>
                <span className="sm:hidden">Rules</span>
              </Button>
            </PermissionGate>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1EB053]">{activeSuppliers}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#1EB053]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#f59e0b]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#f59e0b]">{pendingOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#f59e0b]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#0072C6]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Total Spent</p>
                  <p className="text-base sm:text-2xl font-bold text-[#0072C6] truncate">Le {totalSpent.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#0072C6]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#8b5cf6]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Lead Time</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#8b5cf6]">{Math.round(avgLeadTime)}d</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b5cf6]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-100 p-1 w-full grid grid-cols-2">
            <TabsTrigger value="suppliers" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">Suppliers</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">Orders</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={activeTab === 'suppliers' ? "Search suppliers..." : "Search orders..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {activeTab === 'suppliers' ? (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            {loadingSuppliers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <PermissionGate module="inventory" action="create" fallback={
                <EmptyState
                  icon={Truck}
                  title="No Suppliers Found"
                  description={searchTerm || statusFilter !== "all" ? "No suppliers match your filters" : "No suppliers have been added yet"}
                />
              }>
                <EmptyState
                  icon={Truck}
                  title="No Suppliers Found"
                  description="Add your first supplier to start managing your supply chain"
                  action={() => setShowSupplierDialog(true)}
                  actionLabel="Add Supplier"
                />
              </PermissionGate>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-lg transition-all border-t-4 border-t-[#1EB053]">
                    <CardContent className="p-3 sm:p-4">
                     <div className="flex items-start justify-between mb-3 gap-2">
                       <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                           {supplier.name?.charAt(0)}
                         </div>
                         <div className="min-w-0">
                           <h3 className="font-semibold text-sm sm:text-base truncate">{supplier.name}</h3>
                           <Badge variant="secondary" className={`text-[10px] sm:text-xs ${
                             supplier.status === 'active' ? 'bg-green-100 text-green-700' :
                             supplier.status === 'blocked' ? 'bg-red-100 text-red-700' :
                             'bg-gray-100 text-gray-700'
                           }`}>
                             {supplier.status}
                           </Badge>
                         </div>
                       </div>
                       <PermissionGate module="inventory" action="edit" fallback={null}>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="flex-shrink-0">
                               <MoreVertical className="w-4 h-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => {
                               setSelectedSupplier(supplier);
                               setShowProductsDialog(true);
                             }}>
                               <Package className="w-4 h-4 mr-2" />
                               Manage Products
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => {
                               setPriceHistorySupplier(supplier);
                               setShowPriceHistory(true);
                             }}>
                               <TrendingUp className="w-4 h-4 mr-2" />
                               Price History
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => {
                               setEditingSupplier(supplier);
                               setShowSupplierDialog(true);
                             }}>
                               <Edit className="w-4 h-4 mr-2" />
                               Edit
                             </DropdownMenuItem>
                             <PermissionGate module="inventory" action="delete" fallback={null}>
                               <DropdownMenuItem 
                                 className="text-red-600"
                                 onClick={() => {
                                   setSupplierToDelete(supplier);
                                   setShowDeleteConfirm(true);
                                 }}
                               >
                                 <Trash2 className="w-4 h-4 mr-2" />
                                 Delete
                               </DropdownMenuItem>
                             </PermissionGate>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </PermissionGate>
                     </div>

                     {renderStars(supplier.rating)}

                     <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                       {supplier.contact_person && (
                         <div className="flex items-center gap-2 truncate">
                           <span className="font-medium truncate">{supplier.contact_person}</span>
                         </div>
                       )}
                       {supplier.phone && (
                         <div className="flex items-center gap-2 truncate">
                           <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                           <span className="truncate">{supplier.phone}</span>
                         </div>
                       )}
                       {supplier.email && (
                         <div className="flex items-center gap-2 truncate">
                           <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                           <span className="truncate">{supplier.email}</span>
                         </div>
                       )}
                       {supplier.city && (
                         <div className="flex items-center gap-2 truncate">
                           <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                           <span className="truncate">{supplier.city}, {supplier.country}</span>
                         </div>
                       )}
                     </div>

                     <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t grid grid-cols-3 gap-2 text-xs sm:text-sm">
                       <div className="text-center">
                         <p className="text-gray-500 text-[10px] sm:text-xs">Lead Time</p>
                         <p className="font-medium">{supplier.default_lead_time_days || 7}d</p>
                       </div>
                       <div className="text-center">
                         <p className="text-gray-500 text-[10px] sm:text-xs">Orders</p>
                         <p className="font-medium">{supplier.total_orders || 0}</p>
                       </div>
                       <div className="text-center">
                         <p className="text-gray-500 text-[10px] sm:text-xs truncate">Spent</p>
                         <p className="font-bold text-[#1EB053] text-xs sm:text-sm truncate">Le {(supplier.total_spent || 0).toLocaleString()}</p>
                       </div>
                     </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="orders">
            {loadingPOs ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredPOs.length === 0 ? (
              <PermissionGate module="inventory" action="create" fallback={
                <EmptyState
                  icon={FileText}
                  title="No Purchase Orders"
                  description={searchTerm || statusFilter !== "all" ? "No orders match your filters" : "No purchase orders have been created yet"}
                />
              }>
                <EmptyState
                  icon={FileText}
                  title="No Purchase Orders"
                  description="Create your first purchase order to track supplier deliveries"
                  action={() => setShowPODialog(true)}
                  actionLabel="Create Order"
                />
              </PermissionGate>
            ) : (
              <>
              {/* Desktop Table View */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">PO Number</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Order Date</th>
                          <th className="text-left p-4 font-medium">Expected</th>
                          <th className="text-right p-4 font-medium">Amount</th>
                          <th className="text-center p-4 font-medium">Status</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPOs.map((po) => {
                          const statusConfig = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
                          const StatusIcon = statusConfig.icon;
                          return (
                            <tr key={po.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <span className="font-medium">{po.po_number}</span>
                                <p className="text-xs text-gray-500">{po.items?.length || 0} items</p>
                              </td>
                              <td className="p-4">{po.supplier_name}</td>
                              <td className="p-4 text-gray-600">{po.order_date && format(new Date(po.order_date), 'PP')}</td>
                              <td className="p-4 text-gray-600">{po.expected_delivery_date && format(new Date(po.expected_delivery_date), 'PP')}</td>
                              <td className="p-4 text-right font-bold text-[#1EB053]">Le {(po.total_amount || 0).toLocaleString()}</td>
                              <td className="p-4">
                                <div className="flex justify-center">
                                  <Badge className={statusConfig.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <PermissionGate module="inventory" action="edit" fallback={null}>
                                    {['ordered', 'partial'].includes(po.status) && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setReceivingPO(po);
                                          setShowReceiveDialog(true);
                                        }}
                                        className="text-[#1EB053] border-[#1EB053]"
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Receive
                                      </Button>
                                    )}
                                    {po.status === 'draft' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updatePOMutation.mutate({ id: po.id, data: { status: 'ordered' } })}
                                      >
                                        Send Order
                                      </Button>
                                    )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                       <DropdownMenuItem onClick={() => sendEmailMutation.mutate(po.id)}>
                                         <Mail className="w-4 h-4 mr-2" />
                                         Send to Supplier
                                       </DropdownMenuItem>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem onClick={() => {
                                         setEditingPO(po);
                                         setShowPODialog(true);
                                       }}>
                                         <Edit className="w-4 h-4 mr-2" />
                                         Edit
                                       </DropdownMenuItem>
                                        {po.status !== 'cancelled' && po.status !== 'received' && (
                                          <DropdownMenuItem 
                                            className="text-red-600"
                                            onClick={() => updatePOMutation.mutate({ id: po.id, data: { status: 'cancelled' } })}
                                          >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Cancel Order
                                          </DropdownMenuItem>
                                        )}
                                        {po.status === 'cancelled' && (
                                         <DropdownMenuItem 
                                           className="text-red-600"
                                           onClick={() => {
                                             setPOToDelete(po);
                                             setShowDeletePOConfirm(true);
                                           }}
                                         >
                                           <Trash2 className="w-4 h-4 mr-2" />
                                           Delete
                                         </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </PermissionGate>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredPOs.map((po) => {
                  const statusConfig = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <Card key={po.id} className="border-t-4 border-t-[#1EB053]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{po.po_number}</h3>
                            <p className="text-xs text-gray-500">{po.supplier_name}</p>
                          </div>
                          <Badge className={`${statusConfig.color} ml-2 flex-shrink-0 text-[10px]`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                          <div>
                            <p className="text-gray-500">Order Date</p>
                            <p className="font-medium">{po.order_date && format(new Date(po.order_date), 'PP')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expected</p>
                            <p className="font-medium">{po.expected_delivery_date && format(new Date(po.expected_delivery_date), 'PP')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Items</p>
                            <p className="font-medium">{po.items?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-bold text-[#1EB053]">Le {(po.total_amount || 0).toLocaleString()}</p>
                          </div>
                        </div>

                        <PermissionGate module="inventory" action="edit" fallback={null}>
                          <div className="flex gap-2 pt-3 border-t">
                            {['ordered', 'partial'].includes(po.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReceivingPO(po);
                                  setShowReceiveDialog(true);
                                }}
                                className="text-[#1EB053] border-[#1EB053] text-xs flex-1"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Receive
                              </Button>
                            )}
                            {po.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePOMutation.mutate({ id: po.id, data: { status: 'ordered' } })}
                                className="text-xs flex-1"
                              >
                                Send Order
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="flex-shrink-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => sendEmailMutation.mutate(po.id)}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send to Supplier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setEditingPO(po);
                                  setShowPODialog(true);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {po.status !== 'cancelled' && po.status !== 'received' && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => updatePOMutation.mutate({ id: po.id, data: { status: 'cancelled' } })}
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                                {po.status === 'cancelled' && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setPOToDelete(po);
                                      setShowDeletePOConfirm(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </PermissionGate>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Supplier Confirmation */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Supplier"
          description={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => {
            if (supplierToDelete) {
              deleteMutation.mutate(supplierToDelete.id);
              setSupplierToDelete(null);
            }
          }}
          isLoading={deleteMutation.isPending}
        />

        {/* Dialogs */}
        <SupplierDialog
          open={showSupplierDialog}
          onOpenChange={setShowSupplierDialog}
          supplier={editingSupplier}
          orgId={orgId}
          organisation={currentEmployee?.organisation_id ? { primary_color: '#1EB053', secondary_color: '#0072C6' } : null}
        />

        <SupplierProductsDialog
          open={showProductsDialog}
          onOpenChange={setShowProductsDialog}
          supplier={selectedSupplier}
          products={products}
          orgId={orgId}
        />

        <PurchaseOrderDialog
          open={showPODialog}
          onOpenChange={setShowPODialog}
          purchaseOrder={editingPO}
          suppliers={suppliers}
          products={products}
          warehouses={warehouses}
          orgId={orgId}
          currentEmployee={currentEmployee}
          organisation={currentEmployee?.organisation_id ? { primary_color: '#1EB053', secondary_color: '#0072C6' } : null}
        />

        <ReceiveStockDialog
          open={showReceiveDialog}
          onOpenChange={setShowReceiveDialog}
          purchaseOrder={receivingPO}
          products={products}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <PriceHistoryDialog
          open={showPriceHistory}
          onOpenChange={setShowPriceHistory}
          supplier={priceHistorySupplier}
          orgId={orgId}
        />

        {/* Printable Forms Dialog */}
        <PrintableFormsDownload
          open={showFormsDialog}
          onOpenChange={setShowFormsDialog}
          organisation={organisation?.[0]}
          filterForms={['expense_supplies', 'expense_general']}
        />

        {/* Approval Workflow Manager */}
        <ApprovalWorkflowManager
          open={showWorkflowManager}
          onOpenChange={setShowWorkflowManager}
          orgId={orgId}
        />
      </div>
    </PermissionGate>
  );
}