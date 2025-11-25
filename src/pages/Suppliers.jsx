import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  MoreVertical,
  Eye,
  ShoppingCart
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import SupplierDialog from "@/components/suppliers/SupplierDialog";
import SupplierDetailDialog from "@/components/suppliers/SupplierDetailDialog";
import PurchaseOrderDialog from "@/components/suppliers/PurchaseOrderDialog";
import PurchaseOrderList from "@/components/suppliers/PurchaseOrderList";
import ReceiveOrderDialog from "@/components/suppliers/ReceiveOrderDialog";
import { PermissionGate } from "@/components/permissions/PermissionGate";

export default function Suppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("suppliers");
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPODialog, setShowPODialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

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

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders', orgId],
    queryFn: () => base44.entities.PurchaseOrder.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplierProducts', orgId],
    queryFn: () => base44.entities.SupplierProduct.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id) => base44.entities.Supplier.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Supplier deleted successfully" });
    },
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const pendingOrders = purchaseOrders.filter(po => ['pending', 'approved', 'ordered', 'partial'].includes(po.status)).length;
  const totalSpent = purchaseOrders.filter(po => po.payment_status === 'paid').reduce((sum, po) => sum + (po.total_amount || 0), 0);

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    blocked: "bg-red-100 text-red-800"
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailDialog(true);
  };

  const handleCreatePO = (supplier) => {
    setSelectedSupplier(supplier);
    setShowPODialog(true);
  };

  const handleReceiveOrder = (po) => {
    setSelectedPO(po);
    setShowReceiveDialog(true);
  };

  return (
    <PermissionGate module="inventory" action="view" showDenied>
      <div className="space-y-6">
        <PageHeader
          title="Supplier Management"
          subtitle="Manage suppliers, purchase orders, and pricing"
          action={() => {
            setEditingSupplier(null);
            setShowSupplierDialog(true);
          }}
          actionLabel="Add Supplier"
          actionIcon={Truck}
        >
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedSupplier(null);
              setShowPODialog(true);
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Purchase Order
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Suppliers"
            value={suppliers.length}
            icon={Truck}
            color="blue"
          />
          <StatCard
            title="Active Suppliers"
            value={activeSuppliers}
            icon={Star}
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            icon={Clock}
            color="gold"
          />
          <StatCard
            title="Total Spent (YTD)"
            value={`Le ${totalSpent.toLocaleString()}`}
            icon={DollarSign}
            color="navy"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="mt-6">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers by name, code, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No Suppliers Found"
                description="Add your first supplier to start managing purchases"
                action={() => setShowSupplierDialog(true)}
                actionLabel="Add Supplier"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map((supplier) => {
                  const supplierPOs = purchaseOrders.filter(po => po.supplier_id === supplier.id);
                  const productCount = supplierProducts.filter(sp => sp.supplier_id === supplier.id).length;
                  
                  return (
                    <Card key={supplier.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                              <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{supplier.name}</h3>
                              <p className="text-sm text-gray-500">{supplier.code || 'No code'}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewSupplier(supplier)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreatePO(supplier)}>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Create PO
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingSupplier(supplier);
                                setShowSupplierDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteSupplierMutation.mutate(supplier.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm">
                          {supplier.contact_person && (
                            <p className="text-gray-600">{supplier.contact_person}</p>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Phone className="w-3 h-3" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.city && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {supplier.city}, {supplier.country || 'Sierra Leone'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Badge className={statusColors[supplier.status]}>
                            {supplier.status}
                          </Badge>
                          <Badge variant="outline">
                            <Package className="w-3 h-3 mr-1" />
                            {productCount} products
                          </Badge>
                          <Badge variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            {supplierPOs.length} orders
                          </Badge>
                        </div>

                        {supplier.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < supplier.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <PurchaseOrderList
              purchaseOrders={purchaseOrders}
              suppliers={suppliers}
              onReceive={handleReceiveOrder}
              orgId={orgId}
              currentEmployee={currentEmployee}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <SupplierDialog
          open={showSupplierDialog}
          onOpenChange={setShowSupplierDialog}
          supplier={editingSupplier}
          orgId={orgId}
        />

        <SupplierDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          supplier={selectedSupplier}
          supplierProducts={supplierProducts.filter(sp => sp.supplier_id === selectedSupplier?.id)}
          purchaseOrders={purchaseOrders.filter(po => po.supplier_id === selectedSupplier?.id)}
          products={products}
          orgId={orgId}
        />

        <PurchaseOrderDialog
          open={showPODialog}
          onOpenChange={setShowPODialog}
          supplier={selectedSupplier}
          suppliers={suppliers}
          products={products}
          supplierProducts={supplierProducts}
          warehouses={warehouses}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <ReceiveOrderDialog
          open={showReceiveDialog}
          onOpenChange={setShowReceiveDialog}
          purchaseOrder={selectedPO}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />
      </div>
    </PermissionGate>
  );
}