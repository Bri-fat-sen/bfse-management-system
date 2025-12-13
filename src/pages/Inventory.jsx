import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { format } from "date-fns";
import {
  Package,
  Search,
  Plus,
  TrendingUp,
  AlertTriangle,
  Warehouse,
  BarChart3,
  Grid3x3,
  List,
  Filter,
  RefreshCw,
  Download,
  Upload,
  ArrowLeftRight,
  Zap,
  Cloud
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/ui/StatCard";
import ProductCard from "@/components/inventory/ProductCard";
import ProductTable from "@/components/inventory/ProductTable";
import QuickStockAdjust from "@/components/inventory/QuickStockAdjust";
import QuickTransfer from "@/components/inventory/QuickTransfer";
import ProductFormDialog from "@/components/inventory/ProductFormDialog";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import StockMovementsList from "@/components/inventory/StockMovementsList";
import InventoryInsights from "@/components/inventory/InventoryInsights";
import BatchManagement from "@/components/inventory/BatchManagement";
import LocationStockView from "@/components/inventory/LocationStockView";
import ExportToGoogleDrive from "@/components/exports/ExportToGoogleDrive";
import ModernExportDialog from "@/components/exports/ModernExportDialog";

export default function Inventory() {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    stockStatus: "all",
    location: "all"
  });
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showQuickAdjust, setShowQuickAdjust] = useState(false);
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [productsToDelete, setProductsToDelete] = useState([]);
  const [showDriveExport, setShowDriveExport] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch current user and employee
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch organization
  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const currentOrg = organisation?.[0];

  // Fetch all inventory data
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return await base44.entities.Product.filter({ organisation_id: orgId }, '-created_date', 5000);
    },
    enabled: !!orgId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => base44.entities.ProductCategory.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }, '-created_date', 5000),
    enabled: !!orgId,
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Combine locations
  const allLocations = useMemo(() => [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number}`, type: 'vehicle' }))
  ], [warehouses, vehicles]);

  // Category list
  const categoryList = useMemo(() => 
    categories.length > 0 
      ? categories.map(c => c.name) 
      : ["Water", "Beverages", "Food", "Electronics", "Clothing", "Other"],
    [categories]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === "all" || p.category === filters.category;
      
      const matchesStock = filters.stockStatus === "all" ||
        (filters.stockStatus === "in_stock" && p.stock_quantity > (p.low_stock_threshold || 10)) ||
        (filters.stockStatus === "low_stock" && p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10)) ||
        (filters.stockStatus === "out_of_stock" && p.stock_quantity === 0);
      
      const matchesLocation = filters.location === "all" ||
        !p.location_ids?.length ||
        p.location_ids?.includes(filters.location);
      
      return matchesSearch && matchesCategory && matchesStock && matchesLocation;
    });
  }, [products, searchTerm, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * (p.cost_price || 0)), 0);
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10));
    const outOfStock = products.filter(p => p.stock_quantity === 0);
    const totalItems = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
    
    return {
      totalProducts: products.length,
      totalValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalItems
    };
  }, [products]);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create({ organisation_id: orgId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product created", "Product added successfully");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product updated", "Changes saved successfully");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product deleted", "Product removed successfully");
    },
  });

  if (loadingUser || (user && loadingEmployee)) {
    return <LoadingSpinner message="Loading Inventory..." fullScreen />;
  }

  if (!user || !currentEmployee || !orgId) {
    return <LoadingSpinner message="Loading Inventory..." fullScreen />;
  }

  if (productsLoading) {
    return <LoadingSpinner message="Loading Products..." fullScreen />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe Header */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setExportDialogOpen(true)}
            variant="outline"
            className="border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            onClick={() => setShowDriveExport(true)}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Cloud className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Drive</span>
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowProductDialog(true);
            }}
            className="bg-gradient-to-r from-[#1EB053] to-[#16803d] hover:from-[#16803d] hover:to-[#1EB053] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
          subtitle={`${stats.totalItems.toLocaleString()} items`}
        />
        <StatCard
          title="Inventory Value"
          value={`Le ${stats.totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="gold"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Locations"
          value={allLocations.length}
          icon={Warehouse}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-2 border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
          onClick={() => setShowQuickAdjust(true)}
        >
          <Zap className="w-5 h-5 text-[#1EB053]" />
          <span className="text-xs font-medium">Quick Adjust</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-2 border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/5"
          onClick={() => setShowQuickTransfer(true)}
        >
          <ArrowLeftRight className="w-5 h-5 text-[#0072C6]" />
          <span className="text-xs font-medium">Transfer</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-2 border-purple-400/30 hover:border-purple-500 hover:bg-purple-50"
          onClick={() => setActiveTab("batches")}
        >
          <Package className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-medium">Batches</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-2 border-amber-400/30 hover:border-amber-500 hover:bg-amber-50"
          onClick={() => setActiveTab("insights")}
        >
          <BarChart3 className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-medium">Insights</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 w-full justify-start overflow-x-auto">
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="movements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            Movements
          </TabsTrigger>
          <TabsTrigger 
            value="locations"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            Locations
          </TabsTrigger>
          <TabsTrigger 
            value="batches"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            Batches
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-4">
          {/* Search and Filters */}
          <Card className="border-t-4 border-t-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' : ''}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('table')}
                      className={viewMode === 'table' ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <InventoryFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categoryList}
                  locations={allLocations}
                />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {filteredProducts.length} of {products.length} products</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      toast.info("Refreshing inventory...");
                      await queryClient.invalidateQueries({ queryKey: ['products'] });
                      await queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
                      await queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
                      await queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
                      toast.success("Inventory refreshed");
                    }}
                    className="h-7"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filters.category !== 'all' || filters.stockStatus !== 'all' || filters.location !== 'all'
                    ? "Try adjusting your filters"
                    : "Get started by adding your first product"}
                </p>
                {!searchTerm && filters.category === 'all' && filters.stockStatus === 'all' && (
                  <Button onClick={() => setShowProductDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locations={allLocations}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setShowProductDialog(true);
                  }}
                  onDelete={(p) => {
                    setProductToDelete(p);
                    setShowDeleteConfirm(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              locations={allLocations}
              onEdit={(p) => {
                setEditingProduct(p);
                setShowProductDialog(true);
              }}
              onDelete={(p) => {
                setProductToDelete(p);
                setShowDeleteConfirm(true);
              }}
              onBulkDelete={(ids) => {
                setProductsToDelete(ids);
                setShowBulkDeleteConfirm(true);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <StockMovementsList
            movements={stockMovements}
            products={products}
            locations={allLocations}
          />
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <LocationStockView
            stockLevels={stockLevels}
            products={products}
            warehouses={warehouses}
            vehicles={vehicles}
            orgId={orgId}
          />
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <BatchManagement
            products={products}
            warehouses={warehouses}
            vehicles={vehicles}
            stockLevels={stockLevels}
            orgId={orgId}
            currentEmployee={currentEmployee}
            organisation={currentOrg}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <InventoryInsights
            products={products}
            stockMovements={stockMovements}
            stockLevels={stockLevels}
            orgId={orgId}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductFormDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editingProduct={editingProduct}
        onSubmit={(data) => {
          if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data });
          } else {
            createProductMutation.mutate(data);
          }
        }}
        categoryList={categoryList}
        allLocations={allLocations}
        organisation={currentOrg}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <QuickStockAdjust
        open={showQuickAdjust}
        onOpenChange={setShowQuickAdjust}
        products={products}
        warehouses={warehouses}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      <QuickTransfer
        open={showQuickTransfer}
        onOpenChange={setShowQuickTransfer}
        products={products}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        orgId={orgId}
        currentEmployee={currentEmployee}
        organisation={currentOrg}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        isLoading={deleteProductMutation.isPending}
      />

      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title="Delete Multiple Products"
        description={`Are you sure you want to delete ${productsToDelete.length} product(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={async () => {
          await Promise.all(productsToDelete.map(id => deleteProductMutation.mutateAsync(id)));
          setProductsToDelete([]);
        }}
        isLoading={deleteProductMutation.isPending}
      />

      <ExportToGoogleDrive
        open={showDriveExport}
        onOpenChange={setShowDriveExport}
        data={products}
        fileName={`inventory_export_${format(new Date(), 'yyyy-MM-dd')}`}
        dataType="inventory"
        orgId={orgId}
      />

      <ModernExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={filteredProducts.map(p => ({
          Product: p.name,
          SKU: p.sku || 'N/A',
          Category: p.category || 'N/A',
          'Stock Quantity': p.stock_quantity || 0,
          'Unit Price': `Le ${p.unit_price?.toLocaleString() || 0}`,
          'Cost Price': `Le ${p.cost_price?.toLocaleString() || 0}`,
          'Stock Value': `Le ${((p.stock_quantity || 0) * (p.cost_price || 0)).toLocaleString()}`,
          'Reorder Point': p.reorder_point || 0,
          Status: p.is_active ? 'Active' : 'Inactive',
        }))}
        reportTitle="Inventory Report"
        orgData={currentOrg}
      />
    </div>
  );
}