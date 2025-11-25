import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
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
  Folder,
  ArrowRightLeft,
  FileText,
  Bell,
  MapPin,
  Calendar,
  Layers
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import StockAdjustmentDialog from "@/components/inventory/StockAdjustmentDialog";
import CategoryManager from "@/components/inventory/CategoryManager";
import StockLevelsView from "@/components/inventory/StockLevelsView";
import StockAlerts from "@/components/inventory/StockAlerts";
import InventoryReports from "@/components/inventory/InventoryReports";
import StockTransferDialog from "@/components/inventory/StockTransferDialog";
import BatchTrackingTab from "@/components/inventory/BatchTrackingTab";
import ExpiryAlertsCard from "@/components/inventory/ExpiryAlertsCard";
import BatchReportsTab from "@/components/inventory/BatchReportsTab";
import { PermissionGate } from "@/components/permissions/PermissionGate";

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 100),
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
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast({ title: "Product created successfully" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    },
  });

  // Get unique categories from products + custom categories
  const allCategories = [...new Set([
    ...products.map(p => p.category).filter(Boolean),
    ...categories.map(c => c.name)
  ])];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * (p.cost_price || 0)), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.stock_quantity * (p.unit_price || 0)), 0);
  const activeAlertsCount = stockAlerts.filter(a => a.status === 'active').length + lowStockProducts.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      name: formData.get('name'),
      sku: formData.get('sku'),
      barcode: formData.get('barcode'),
      category: formData.get('category'),
      description: formData.get('description'),
      unit_price: parseFloat(formData.get('unit_price')) || 0,
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      wholesale_price: parseFloat(formData.get('wholesale_price')) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity')) || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold')) || 10,
      unit: formData.get('unit'),
      is_active: true,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  return (
    <PermissionGate module="inventory" action="view" showDenied>
      <div className="space-y-6">
        <PageHeader
          title="Inventory Management"
          subtitle="Manage products, stock levels, and warehouses"
          action={() => {
            setEditingProduct(null);
            setShowProductDialog(true);
          }}
          actionLabel="Add Product"
        >
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Folder className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button variant="outline" onClick={() => setShowTransferDialog(true)}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer
          </Button>
          <Button variant="outline" onClick={() => setShowStockDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Adjust Stock
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Products"
            value={products.length}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Low Stock"
            value={lowStockProducts.length}
            icon={AlertTriangle}
            color="gold"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockProducts.length}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Stock Value (Cost)"
            value={`Le ${totalValue.toLocaleString()}`}
            icon={Warehouse}
            color="green"
            subtitle={`Retail: Le ${totalRetailValue.toLocaleString()}`}
          />
          <StatCard
            title="Active Alerts"
            value={activeAlertsCount}
            icon={Bell}
            color="navy"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stock_levels">
              <MapPin className="w-4 h-4 mr-1" />
              Stock by Location
            </TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              <Bell className="w-4 h-4 mr-1" />
              Alerts
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeAlertsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="batches">
              <Layers className="w-4 h-4 mr-1" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-1" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="batch_reports">
              <Calendar className="w-4 h-4 mr-1" />
              Expiry Reports
            </TabsTrigger>
            <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

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
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">SKU</th>
                          <th className="text-left p-4 font-medium">Category</th>
                          <th className="text-right p-4 font-medium">Cost</th>
                          <th className="text-right p-4 font-medium">Price</th>
                          <th className="text-right p-4 font-medium">Stock</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);
                          const isOutOfStock = product.stock_quantity === 0;
                          return (
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
                                  <div>
                                    <span className="font-medium">{product.name}</span>
                                    {product.barcode && (
                                      <p className="text-xs text-gray-400">{product.barcode}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600">{product.sku || '-'}</td>
                              <td className="p-4">
                                <Badge variant="secondary" style={{ 
                                  backgroundColor: categories.find(c => c.name === product.category)?.color + '20',
                                  color: categories.find(c => c.name === product.category)?.color
                                }}>
                                  {product.category || 'Other'}
                                </Badge>
                              </td>
                              <td className="p-4 text-right text-gray-600">Le {(product.cost_price || 0).toLocaleString()}</td>
                              <td className="p-4 text-right font-medium text-[#1EB053]">Le {(product.unit_price || 0).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "secondary"}
                                       className={isLowStock && !isOutOfStock ? "bg-[#D4AF37] text-white" : ""}>
                                  {product.stock_quantity} {product.unit || 'pcs'}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <PermissionGate module="inventory" action="edit">
                                  <div className="flex items-center justify-end gap-2">
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
                                    <PermissionGate module="inventory" action="delete">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500"
                                        onClick={() => deleteProductMutation.mutate(product.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </PermissionGate>
                                  </div>
                                </PermissionGate>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stock Levels Tab */}
          <TabsContent value="stock_levels" className="mt-6">
            <StockLevelsView
              products={products}
              warehouses={warehouses}
              stockLevels={stockLevels}
              orgId={orgId}
            />
          </TabsContent>

          {/* Movements Tab */}
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
                    description="Stock movements will be recorded when sales or adjustments are made"
                  />
                ) : (
                  <div className="space-y-3">
                    {stockMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            movement.movement_type === 'in' ? 'bg-green-100' : 
                            movement.movement_type === 'out' ? 'bg-red-100' : 
                            movement.movement_type === 'transfer' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {movement.movement_type === 'in' ? (
                              <Download className="w-5 h-5 text-green-600" />
                            ) : movement.movement_type === 'transfer' ? (
                              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Upload className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{movement.product_name}</p>
                            <p className="text-sm text-gray-500">
                              {movement.warehouse_name || 'Main'} • {movement.reference_type}
                              {movement.notes && ` • ${movement.notes}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            movement.movement_type === 'in' ? 'text-green-600' : 
                            movement.movement_type === 'out' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {movement.movement_type === 'in' ? '+' : movement.movement_type === 'out' ? '-' : '↔'}{movement.quantity}
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

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-4">
              <ExpiryAlertsCard
                orgId={orgId}
                currentEmployee={currentEmployee}
              />
              <StockAlerts
                alerts={stockAlerts}
                products={products}
                orgId={orgId}
                currentEmployee={currentEmployee}
              />
            </div>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="mt-6">
            <BatchTrackingTab
              products={products}
              warehouses={warehouses}
              orgId={orgId}
              currentEmployee={currentEmployee}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <InventoryReports
              products={products}
              stockMovements={stockMovements}
              categories={categories}
              warehouses={warehouses}
            />
          </TabsContent>

          {/* Batch Reports Tab */}
          <TabsContent value="batch_reports" className="mt-6">
            <BatchReportsTab
              batches={inventoryBatches}
              products={products}
              warehouses={warehouses}
            />
          </TabsContent>

          {/* Warehouses Tab */}
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
                    {warehouses.map((warehouse) => {
                      const warehouseProducts = stockLevels.filter(sl => sl.warehouse_id === warehouse.id);
                      const totalItems = warehouseProducts.reduce((sum, sl) => sum + sl.quantity, 0);
                      return (
                        <Card key={warehouse.id} className="border-t-4 border-t-[#0072C6]">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                                <Warehouse className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{warehouse.name}</h3>
                                <p className="text-sm text-gray-500">{warehouse.address || warehouse.city}</p>
                                <p className="text-sm text-gray-500">Manager: {warehouse.manager_name || 'Not assigned'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">{warehouseProducts.length} products</Badge>
                                  <Badge variant="outline">{totalItems} units</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <StockAdjustmentDialog
          open={showStockDialog}
          onOpenChange={setShowStockDialog}
          products={products}
          warehouses={warehouses}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <CategoryManager
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
          categories={categories}
          orgId={orgId}
        />

        <StockTransferDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          products={products}
          warehouses={warehouses}
          stockLevels={stockLevels}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        {/* Product Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Product Name</Label>
                  <Input name="name" defaultValue={editingProduct?.name} required className="mt-1" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input name="sku" defaultValue={editingProduct?.sku} className="mt-1" placeholder="e.g., PRD-001" />
                </div>
                <div>
                  <Label>Barcode</Label>
                  <Input name="barcode" defaultValue={editingProduct?.barcode} className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select name="category" defaultValue={editingProduct?.category || ""}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select name="unit" defaultValue={editingProduct?.unit || "piece"}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="litre">Litre</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cost Price (Le)</Label>
                  <Input name="cost_price" type="number" step="0.01" defaultValue={editingProduct?.cost_price} className="mt-1" />
                </div>
                <div>
                  <Label>Selling Price (Le)</Label>
                  <Input name="unit_price" type="number" step="0.01" defaultValue={editingProduct?.unit_price} required className="mt-1" />
                </div>
                <div>
                  <Label>Wholesale Price (Le)</Label>
                  <Input name="wholesale_price" type="number" step="0.01" defaultValue={editingProduct?.wholesale_price} className="mt-1" />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input name="stock_quantity" type="number" defaultValue={editingProduct?.stock_quantity || 0} className="mt-1" />
                </div>
                <div>
                  <Label>Low Stock Alert</Label>
                  <Input name="low_stock_threshold" type="number" defaultValue={editingProduct?.low_stock_threshold || 10} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editingProduct?.description} className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#1EB053] hover:bg-[#178f43]">
                  {editingProduct ? 'Update' : 'Create'} Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
}