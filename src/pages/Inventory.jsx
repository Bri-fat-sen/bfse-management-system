import React, { useState, useEffect } from "react";
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
  FolderTree,
  MapPin,
  Bell,
  FileText,
  RefreshCw
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
import StockLocations from "@/components/inventory/StockLocations";
import StockAlerts from "@/components/inventory/StockAlerts";
import InventoryReport from "@/components/inventory/InventoryReport";
import BatchManagement from "@/components/inventory/BatchManagement";
import ExpiryAlerts from "@/components/inventory/ExpiryAlerts";
import BatchReports from "@/components/inventory/BatchReports";

const DEFAULT_CATEGORIES = ["Water", "Beverages", "Food", "Electronics", "Clothing", "Other"];

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
  const [showLocationsDialog, setShowLocationsDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

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

  // Auto-generate stock alerts for low stock items
  useEffect(() => {
    const checkStockAlerts = async () => {
      if (!products.length || !orgId) return;
      
      for (const product of products) {
        const threshold = product.low_stock_threshold || 10;
        const existingAlert = stockAlerts.find(
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
    };
    
    checkStockAlerts();
  }, [products, stockAlerts, orgId]);

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price || 0), 0);
  const activeAlerts = stockAlerts.filter(a => a.status === 'active');
  const categoryList = categories.length > 0 ? categories.map(c => c.name) : DEFAULT_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      name: formData.get('name'),
      sku: formData.get('sku'),
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
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStockDialog(true)}
            className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/10 hover:text-[#1EB053] transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Adjustment
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryDialog(true)}
            className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10 hover:text-[#0072C6] transition-all"
          >
            <FolderTree className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowLocationsDialog(true)}
            className="border-[#0F1F3C]/30 hover:border-[#0F1F3C] hover:bg-[#0F1F3C]/10 hover:text-[#0F1F3C] transition-all"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Locations
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAlertsDialog(true)}
            className={activeAlerts.length > 0 
              ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100" 
              : "border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
            }
          >
            <Bell className="w-4 h-4 mr-2" />
            Alerts {activeAlerts.length > 0 && `(${activeAlerts.length})`}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowReportDialog(true)}
            className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/10 hover:text-[#1EB053] transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
        </PageHeader>

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
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Products
          </TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Stock Movements
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Warehouses
          </TabsTrigger>
          <TabsTrigger value="batches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-1" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="expiry" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Expiry
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
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
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
                                onClick={() => deleteProductMutation.mutate(product.id)}
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

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name</Label>
                <Input name="name" defaultValue={editingProduct?.name} required className="mt-1" />
              </div>
              <div>
                <Label>SKU</Label>
                <Input name="sku" defaultValue={editingProduct?.sku} className="mt-1" />
              </div>
              <div>
                <Label>Category</Label>
                <Select name="category" defaultValue={editingProduct?.category || "Other"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Price (Le)</Label>
                <Input name="unit_price" type="number" defaultValue={editingProduct?.unit_price} required className="mt-1" />
              </div>
              <div>
                <Label>Cost Price (Le)</Label>
                <Input name="cost_price" type="number" defaultValue={editingProduct?.cost_price} className="mt-1" />
              </div>
              <div>
                <Label>Wholesale Price (Le)</Label>
                <Input name="wholesale_price" type="number" defaultValue={editingProduct?.wholesale_price} className="mt-1" />
              </div>
              <div>
                <Label>Unit</Label>
                <Input name="unit" defaultValue={editingProduct?.unit || "piece"} className="mt-1" />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input name="stock_quantity" type="number" defaultValue={editingProduct?.stock_quantity || 0} className="mt-1" />
              </div>
              <div>
                <Label>Low Stock Threshold</Label>
                <Input name="low_stock_threshold" type="number" defaultValue={editingProduct?.low_stock_threshold || 10} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingProduct?.description} className="mt-1" />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}