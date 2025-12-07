import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  BarChart3,
  Grid3x3,
  List,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  ArrowUpDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryProductGrid from "@/components/inventory/InventoryProductGrid";
import InventoryProductList from "@/components/inventory/InventoryProductList";
import InventoryQuickActions from "@/components/inventory/InventoryQuickActions";
import ProductFormDialog from "@/components/inventory/ProductFormDialog";
import StockAdjustmentDialog from "@/components/inventory/StockAdjustmentDialog";
import StockTransferDialog from "@/components/inventory/StockTransferDialog";
import ProductDetailsDialog from "@/components/inventory/ProductDetailsDialog";
import InventoryInsights from "@/components/inventory/InventoryInsights";

export default function Inventory() {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // View state
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // Dialogs
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  
  // Selected items
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Fetch user and employee data
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all data with optimized queries
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return await base44.entities.Product.filter({ organisation_id: orgId }, '-created_date', 5000);
    },
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => base44.entities.ProductCategory.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const currentOrg = organisation?.[0];
  const primaryColor = currentOrg?.primary_color || '#1EB053';
  const secondaryColor = currentOrg?.secondary_color || '#0072C6';

  // Combine locations
  const allLocations = useMemo(() => [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ], [warehouses, vehicles]);

  // Category list
  const categoryList = useMemo(() => 
    categories.length > 0 ? categories.map(c => c.name) : ["Water", "Beverages", "Food", "Electronics", "Clothing", "Other"],
    [categories]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStock = stockFilter === "all" || 
                          (stockFilter === "in_stock" && p.stock_quantity > 0) ||
                          (stockFilter === "low_stock" && p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10)) ||
                          (stockFilter === "out_of_stock" && p.stock_quantity === 0);
      const matchesLocation = locationFilter === "all" || 
                             !p.location_ids?.length ||
                             p.location_ids?.includes(locationFilter);
      return matchesSearch && matchesCategory && matchesStock && matchesLocation;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch(sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'stock':
          aVal = a.stock_quantity || 0;
          bVal = b.stock_quantity || 0;
          break;
        case 'price':
          aVal = a.unit_price || 0;
          bVal = b.unit_price || 0;
          break;
        case 'value':
          aVal = (a.stock_quantity || 0) * (a.cost_price || 0);
          bVal = (b.stock_quantity || 0) * (b.cost_price || 0);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, stockFilter, locationFilter, sortBy, sortOrder]);

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product created", "Successfully added to inventory");
    },
    onError: (error) => {
      toast.error("Failed to create product", error.message);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast.success("Product updated", "Changes saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to update product", error.message);
    }
  });

  const handleProductSubmit = async (data) => {
    const productData = { organisation_id: orgId, ...data };
    if (editingProduct) {
      await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
    } else {
      await createProductMutation.mutateAsync(productData);
    }
  };

  if (!user || !currentEmployee || !orgId) {
    return <LoadingSpinner message="Loading Inventory..." fullScreen />;
  }

  if (productsLoading) {
    return <LoadingSpinner message="Loading Products..." fullScreen />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Flag Header */}
      <div className="h-1.5 rounded-full flex overflow-hidden shadow-sm">
        <div className="flex-1" style={{ backgroundColor: primaryColor }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-sm text-gray-500">Manage your products and stock</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setShowProductDialog(true);
          }}
          className="text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <InventoryStats 
        products={products}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {/* Quick Actions */}
      <InventoryQuickActions
        onAdjustStock={() => setShowStockDialog(true)}
        onTransferStock={() => setShowTransferDialog(true)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {/* Insights */}
      <InventoryInsights 
        products={products}
        primaryColor={primaryColor}
      />

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-11 w-11"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-11 w-11"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <InventoryFilters
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            categoryList={categoryList}
            allLocations={allLocations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            totalProducts={products.length}
            filteredCount={filteredProducts.length}
          />

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
              >
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || categoryFilter !== "all" || stockFilter !== "all" || locationFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by adding your first product"}
              </p>
              {!searchTerm && categoryFilter === "all" && stockFilter === "all" && locationFilter === "all" && (
                <Button 
                  onClick={() => setShowProductDialog(true)}
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                  className="text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <InventoryProductGrid
              products={filteredProducts}
              allLocations={allLocations}
              onViewProduct={(product) => {
                setViewingProduct(product);
                setShowProductDetails(true);
              }}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setShowProductDialog(true);
              }}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ) : (
            <InventoryProductList
              products={filteredProducts}
              allLocations={allLocations}
              onViewProduct={(product) => {
                setViewingProduct(product);
                setShowProductDetails(true);
              }}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setShowProductDialog(true);
              }}
              primaryColor={primaryColor}
            />
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editingProduct={editingProduct}
        onSubmit={handleProductSubmit}
        categoryList={categoryList}
        allLocations={allLocations}
        organisation={currentOrg}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <StockAdjustmentDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        products={products}
        warehouses={warehouses}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      <StockTransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        products={products}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        orgId={orgId}
        currentEmployee={currentEmployee}
        organisation={currentOrg}
      />

      <ProductDetailsDialog
        open={showProductDetails}
        onOpenChange={setShowProductDetails}
        product={viewingProduct}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        orgId={orgId}
      />
    </div>
  );
}