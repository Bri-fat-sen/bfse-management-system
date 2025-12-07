import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Warehouse,
  Filter,
  Download,
  Upload,
  FolderTree,
  MapPin,
  Bell,
  FileText,
  RefreshCw,
  Truck,
  Store,
  X,
  ArrowLeftRight,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import StockAdjustmentDialog from "@/components/inventory/StockAdjustmentDialog";
import CategoryManager from "@/components/inventory/CategoryManager";
import StockLocations from "@/components/inventory/StockLocations";
import StockAlerts from "@/components/inventory/StockAlerts";
import InventoryReport from "@/components/inventory/InventoryReport";
import BatchManagement from "@/components/inventory/BatchManagement";
import ExpiryAlerts from "@/components/inventory/ExpiryAlerts";
import BatchReports from "@/components/inventory/BatchReports";
import StockTransferDialog from "@/components/inventory/StockTransferDialog";
import ProductDetailsDialog from "@/components/inventory/ProductDetailsDialog";
import AIInventoryRecommendations from "@/components/ai/AIInventoryRecommendations";
import SerialNumberManager from "@/components/inventory/SerialNumberManager";
import ReorderSuggestions from "@/components/inventory/ReorderSuggestions";
import MultiLocationStock from "@/components/inventory/MultiLocationStock";
import LowStockNotificationBanner from "@/components/inventory/LowStockNotificationBanner";
import InventoryAuditLog from "@/components/inventory/InventoryAuditLog";
import ProductFormDialog from "@/components/inventory/ProductFormDialog";

const DEFAULT_CATEGORIES = ["Water", "Beverages", "Food", "Electronics", "Clothing", "Other"];

export default function Inventory() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showLocationsDialog, setShowLocationsDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Combine warehouses and vehicles into locations
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => base44.entities.ProductCategory.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['recentSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: reorderSuggestions = [] } = useQuery({
    queryKey: ['reorderSuggestions', orgId],
    queryFn: () => base44.entities.ReorderSuggestion.filter({ organisation_id: orgId, status: 'pending' }),
    enabled: !!orgId,
  });

  // Auto-generate stock alerts for low stock items (run only for authorized roles)
  const canManageAlerts = ['super_admin', 'org_admin', 'warehouse_manager'].includes(currentEmployee?.role);
  
  useEffect(() => {
    const checkStockAlerts = async () => {
      if (!products.length || !orgId || !canManageAlerts) return;
      
      try {
        // Get current alerts to check against
        const currentAlerts = await base44.entities.StockAlert.filter({ organisation_id: orgId, status: 'active' });
        
        for (const product of products) {
          const threshold = product.low_stock_threshold || 10;
          const existingAlert = currentAlerts.find(
            a => a.product_id === product.id && a.status === 'active'
          );
          
          if (product.stock_quantity === 0 && !existingAlert) {
            await base44.entities.StockAlert.create({
              organisation_id: orgId,
              product_id: product.id,
              product_name: product.name,
              warehouse_id: product.warehouse_id,
              alert_type: 'out_of_stock',
              current_quantity: 0,
              threshold_quantity: threshold,
              status: 'active'
            });
          } else if (product.stock_quantity > 0 && product.stock_quantity <= threshold && !existingAlert) {
            await base44.entities.StockAlert.create({
              organisation_id: orgId,
              product_id: product.id,
              product_name: product.name,
              warehouse_id: product.warehouse_id,
              alert_type: 'low_stock',
              current_quantity: product.stock_quantity,
              threshold_quantity: threshold,
              status: 'active'
            });
          }
        }
        
        // Refresh alerts after creating new ones
        queryClient.invalidateQueries({ queryKey: ['stockAlerts', orgId] });
      } catch (error) {
        // Silently fail - user may not have permission
        console.log('Stock alert check skipped - insufficient permissions');
      }
    };
    
    checkStockAlerts();
  }, [products, orgId, queryClient, canManageAlerts]);

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product created", "Product has been added to inventory");
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast.error("Failed to create product", error.message);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product updated", "Changes have been saved");
    },
    onError: (error) => {
      console.error('Update product error:', error);
      toast.error("Failed to update product", error.message);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      toast.success("Product deleted", "Product has been removed");
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      toast.error("Failed to delete product", error.message);
    }
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in_stock" && p.stock_quantity > 0) ||
                        (stockFilter === "low_stock" && p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10)) ||
                        (stockFilter === "out_of_stock" && p.stock_quantity === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price || 0), 0);
  const activeAlerts = stockAlerts.filter(a => a.status === 'active');
  const categoryList = categories.length > 0 ? categories.map(c => c.name) : DEFAULT_CATEGORIES;

  const handleProductSubmit = async (data) => {
    const productData = {
      organisation_id: orgId,
      ...data
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
      } else {
        await createProductMutation.mutateAsync(productData);
      }
    } catch (error) {
      console.error('Product save error:', error);
      toast.error("Failed to save product", error.message);
    }
  };

  if (!user) {
    return <LoadingSpinner message="Loading Inventory..." subtitle="Fetching your products and stock" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading Inventory..." subtitle="Fetching your products and stock" fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Manage products and stock"
        action={() => {
          setEditingProduct(null);
          setShowProductDialog(true);
        }}
        actionLabel="Add Product"
        >
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStockDialog(true)}
            className="text-xs sm:text-sm border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/10 hover:text-[#1EB053]"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Adjust</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTransferDialog(true)}
            className="text-xs sm:text-sm border-purple-400/30 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-600"
          >
            <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Transfer</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCategoryDialog(true)}
            className="text-xs sm:text-sm border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10 hover:text-[#0072C6]"
          >
            <FolderTree className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Categories</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAlertsDialog(true)}
            className={`text-xs sm:text-sm ${activeAlerts.length > 0 
              ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100" 
              : "border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            }`}
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Alerts</span>
            {activeAlerts.length > 0 && <Badge variant="destructive" className="ml-1 h-5 text-[10px]">{activeAlerts.length}</Badge>}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowReportDialog(true)}
            className="text-xs sm:text-sm border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/10 hover:text-[#1EB053]"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reports</span>
          </Button>
        </div>
        </PageHeader>

      {/* Low Stock Alert Banner */}
      <LowStockNotificationBanner 
        products={products}
        reorderSuggestions={reorderSuggestions}
      />

      {/* AI Recommendations */}
      <AIInventoryRecommendations 
        products={products}
        sales={sales}
        orgId={orgId}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="gold"
          subtitle={`${outOfStockProducts.length} out of stock`}
        />
        <StatCard
          title="Inventory Value"
          value={`Le ${totalValue.toLocaleString()}`}
          icon={Warehouse}
          color="green"
        />
        <StatCard
          title="Warehouses"
          value={warehouses.length}
          icon={Warehouse}
          color="navy"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Products
          </TabsTrigger>
          <TabsTrigger value="movements" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Movements
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Warehouses
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Batches
          </TabsTrigger>
          <TabsTrigger value="expiry" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Expiry
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Locations
          </TabsTrigger>
          <TabsTrigger value="serials" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Serial #
          </TabsTrigger>
          <TabsTrigger value="reorder" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white relative">
            Reorder
            {reorderSuggestions.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 text-[9px] px-1">{reorderSuggestions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryList.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-40">
                    <Package className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products - Mobile Cards & Desktop Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products Found"
              description="Start by adding your first product to the inventory"
              action={() => setShowProductDialog(true)}
              actionLabel="Add Product"
            />
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block md:hidden space-y-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#1D5FC3]/20 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-[#1D5FC3]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                            </div>
                            <Badge variant={product.stock_quantity <= product.low_stock_threshold ? "destructive" : "secondary"} className="flex-shrink-0">
                              {product.stock_quantity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {product.location_ids?.length > 0 ? (
                              product.location_ids.slice(0, 2).map(locId => {
                                const loc = allLocations.find(l => l.id === locId);
                                if (!loc) return null;
                                return (
                                  <Badge key={locId} variant="outline" className="text-[10px] px-1">
                                    {loc.type === 'warehouse' ? <Warehouse className="w-2 h-2" /> : <Truck className="w-2 h-2" />}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-gray-400">All</span>
                            )}
                            {product.location_ids?.length > 2 && (
                              <span className="text-[10px] text-gray-400">+{product.location_ids.length - 2}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{product.category || 'Other'}</Badge>
                              <span className="font-semibold text-[#1EB053]">Le {product.unit_price?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#0072C6]"
                                onClick={() => {
                                  setViewingProduct(product);
                                  setShowProductDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => {
                                  setProductToDelete(product);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">SKU</th>
                          <th className="text-left p-4 font-medium">Category</th>
                          <th className="text-left p-4 font-medium">Locations</th>
                          <th className="text-right p-4 font-medium">Price</th>
                          <th className="text-right p-4 font-medium">Stock</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#1D5FC3]/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-[#1D5FC3]" />
                                  </div>
                                )}
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{product.sku || '-'}</td>
                            <td className="p-4">
                              <Badge variant="secondary">{product.category || 'Other'}</Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {product.location_ids?.length > 0 ? (
                                  product.location_ids.slice(0, 2).map(locId => {
                                    const loc = allLocations.find(l => l.id === locId);
                                    if (!loc) return null;
                                    return (
                                      <Badge key={locId} variant="outline" className="text-xs flex items-center gap-1">
                                        {loc.type === 'warehouse' ? (
                                          <Warehouse className="w-3 h-3" />
                                        ) : (
                                          <Truck className="w-3 h-3" />
                                        )}
                                        <span className="truncate max-w-[60px]">{loc.name}</span>
                                      </Badge>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-gray-400">All locations</span>
                                )}
                                {product.location_ids?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{product.location_ids.length - 2}</Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right font-medium">Le {product.unit_price?.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <Badge variant={product.stock_quantity <= product.low_stock_threshold ? "destructive" : "secondary"}>
                                {product.stock_quantity} {product.unit}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-[#0072C6]"
                                  onClick={() => {
                                    setViewingProduct(product);
                                    setShowProductDetails(true);
                                  }}
                                  title="View details & history"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowProductDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {stockMovements.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No Stock Movements"
                  description="Stock movements will be recorded automatically when sales or adjustments are made"
                />
              ) : (
                <div className="space-y-3">
                  {stockMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          movement.movement_type === 'in' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {movement.movement_type === 'in' ? (
                            <Download className="w-5 h-5 text-green-600" />
                          ) : (
                            <Upload className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movement.product_name}</p>
                          <p className="text-sm text-gray-500">{movement.notes || movement.reference_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {movement.previous_stock} → {movement.new_stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
            </CardHeader>
            <CardContent>
              {warehouses.length === 0 ? (
                <EmptyState
                  icon={Warehouse}
                  title="No Warehouses"
                  description="Add warehouses to organize your inventory locations"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warehouses.map((warehouse) => (
                    <Card key={warehouse.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                            <Warehouse className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{warehouse.name}</h3>
                            <p className="text-sm text-gray-500">{warehouse.address}</p>
                            <p className="text-sm text-gray-500">Manager: {warehouse.manager_name || 'Not assigned'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="mt-6">
          <BatchManagement
            products={products}
            warehouses={warehouses}
            vehicles={vehicles}
            stockLevels={stockLevels}
            orgId={orgId}
            currentEmployee={currentEmployee}
          />
        </TabsContent>

        {/* Expiry Tab */}
        <TabsContent value="expiry" className="mt-6">
          <ExpiryAlerts orgId={orgId} currentEmployee={currentEmployee} />
          <div className="mt-6">
            <BatchReports batches={inventoryBatches} products={products} warehouses={warehouses} organisation={organisation?.[0]} />
          </div>
        </TabsContent>

        {/* Multi-Location Stock Tab */}
        <TabsContent value="locations" className="mt-6">
          <MultiLocationStock
            orgId={orgId}
            products={products}
            warehouses={warehouses}
            vehicles={vehicles}
            stockLevels={stockLevels}
            currentEmployee={currentEmployee}
          />
        </TabsContent>

        {/* Serial Numbers Tab */}
        <TabsContent value="serials" className="mt-6">
          <SerialNumberManager
            orgId={orgId}
            products={products}
            warehouses={warehouses}
            vehicles={vehicles}
          />
        </TabsContent>

        {/* Reorder Suggestions Tab */}
        <TabsContent value="reorder" className="mt-6">
          <ReorderSuggestions
            orgId={orgId}
            products={products}
            sales={sales}
            suppliers={suppliers}
            currentEmployee={currentEmployee}
          />
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-6">
          <InventoryAuditLog orgId={orgId} />
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        products={products}
        warehouses={warehouses}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Category Manager Dialog */}
      <CategoryManager
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        categories={categories}
        orgId={orgId}
      />

      {/* Stock Locations Dialog */}
      <StockLocations
        open={showLocationsDialog}
        onOpenChange={setShowLocationsDialog}
        products={products}
        warehouses={warehouses}
        stockLevels={stockLevels}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Stock Alerts Dialog */}
      <StockAlerts
        open={showAlertsDialog}
        onOpenChange={setShowAlertsDialog}
        alerts={stockAlerts}
        products={products}
        currentEmployee={currentEmployee}
      />

      {/* Inventory Reports Dialog */}
      <InventoryReport
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        products={products}
        stockMovements={stockMovements}
        warehouses={warehouses}
        categories={categories}
        organisation={organisation?.[0]}
      />

      {/* Stock Transfer Dialog */}
      <StockTransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        products={products}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={showProductDetails}
        onOpenChange={setShowProductDetails}
        product={viewingProduct}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        orgId={orgId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        isLoading={deleteProductMutation.isPending}
      />

      {/* Product Dialog */}
      <ProductFormDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editingProduct={editingProduct}
        onSubmit={handleProductSubmit}
        categoryList={categoryList}
        allLocations={allLocations}
        organisation={organisation?.[0]}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
      />
    </div>
  );
}