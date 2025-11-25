import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Warehouse,
  Droplets,
  Edit,
  MoreVertical,
  ArrowUpCircle,
  ArrowDownCircle,
  Factory
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', orgId],
    queryFn: () => base44.entities.ProductionBatch.filter({ organisation_id: orgId }, '-production_date', 50),
    enabled: !!orgId,
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['movements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductionBatch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setShowBatchDialog(false);
    },
  });

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price || 0), 0);
  const waterProducts = products.filter(p => p.is_water_product);

  const handleSaveProduct = async (formData) => {
    const data = {
      ...formData,
      organisation_id: orgId
    };
    
    if (editingProduct) {
      await updateProductMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createProductMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory & Production" 
        subtitle="Manage products, stock, and water production"
        action={() => setShowProductDialog(true)}
        actionLabel="Add Product"
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
          color="red"
        />
        <StatCard
          title="Stock Value"
          value={`Le ${totalValue.toLocaleString()}`}
          icon={Warehouse}
          color="green"
        />
        <StatCard
          title="Water Products"
          value={waterProducts.length}
          icon={Droplets}
          color="navy"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="production">Water Production</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.is_water_product && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <Droplets className="w-3 h-3 mr-1" />
                                Water
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.sku || "-"}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell>Le {product.unit_price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={product.stock_quantity <= (product.low_stock_threshold || 10) ? "text-red-600 font-medium" : ""}>
                          {product.stock_quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.stock_quantity <= (product.low_stock_threshold || 10) ? (
                          <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingProduct(product);
                              setShowProductDialog(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowBatchDialog(true)} className="sl-gradient">
              <Factory className="w-4 h-4 mr-2" />
              New Production Batch
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Production Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_number}</TableCell>
                      <TableCell>{batch.product_name}</TableCell>
                      <TableCell>{batch.production_date && format(new Date(batch.production_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{batch.quantity_produced}</TableCell>
                      <TableCell>
                        <Badge className={
                          batch.quality_status === "passed" ? "bg-green-100 text-green-800" :
                          batch.quality_status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {batch.quality_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{batch.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Stock Change</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.created_date && format(new Date(movement.created_date), 'MMM d, HH:mm')}</TableCell>
                      <TableCell>{movement.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{movement.movement_type}</Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.movement_type === 'in' ? (
                            <ArrowUpCircle className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4" />
                          )}
                          {movement.previous_stock} → {movement.new_stock}
                        </span>
                      </TableCell>
                      <TableCell>{movement.recorded_by_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                      <Warehouse className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500">{warehouse.address}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">Manager: {warehouse.manager_name || "Not assigned"}</p>
                    <p className="text-sm text-gray-500">Phone: {warehouse.phone || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowProductDialog(false);
              setEditingProduct(null);
            }}
            isLoading={createProductMutation.isPending || updateProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Batch Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Production Batch</DialogTitle>
          </DialogHeader>
          <BatchForm 
            products={waterProducts}
            orgId={orgId}
            employeeName={currentEmployee?.full_name}
            employeeId={currentEmployee?.id}
            onSave={async (data) => {
              await createBatchMutation.mutateAsync(data);
            }}
            onCancel={() => setShowBatchDialog(false)}
            isLoading={createBatchMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "",
    unit_price: product?.unit_price || 0,
    cost_price: product?.cost_price || 0,
    wholesale_price: product?.wholesale_price || 0,
    stock_quantity: product?.stock_quantity || 0,
    low_stock_threshold: product?.low_stock_threshold || 10,
    unit: product?.unit || "piece",
    is_water_product: product?.is_water_product || false
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Product Name</Label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <Label>SKU</Label>
          <Input 
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="SKU code"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Category"
          />
        </div>
        <div>
          <Label>Unit Price (Le)</Label>
          <Input 
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Cost Price (Le)</Label>
          <Input 
            type="number"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Wholesale Price (Le)</Label>
          <Input 
            type="number"
            value={formData.wholesale_price}
            onChange={(e) => setFormData({ ...formData, wholesale_price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Current Stock</Label>
          <Input 
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Low Stock Alert</Label>
          <Input 
            type="number"
            value={formData.low_stock_threshold}
            onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select 
            value={formData.unit}
            onValueChange={(v) => setFormData({ ...formData, unit: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="piece">Piece</SelectItem>
              <SelectItem value="pack">Pack</SelectItem>
              <SelectItem value="bottle">Bottle</SelectItem>
              <SelectItem value="carton">Carton</SelectItem>
              <SelectItem value="kg">Kilogram</SelectItem>
              <SelectItem value="liter">Liter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input 
            type="checkbox"
            checked={formData.is_water_product}
            onChange={(e) => setFormData({ ...formData, is_water_product: e.target.checked })}
            className="w-4 h-4"
          />
          <Label>Water Product</Label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading} className="sl-gradient">
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </div>
  );
}

function BatchForm({ products, orgId, employeeId, employeeName, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    batch_number: `BATCH-${Date.now()}`,
    product_id: "",
    product_name: "",
    production_date: format(new Date(), 'yyyy-MM-dd'),
    quantity_produced: 0,
    quality_status: "pending",
    status: "in_progress"
  });

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setFormData({ 
      ...formData, 
      product_id: productId,
      product_name: product?.name || ""
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Batch Number</Label>
        <Input value={formData.batch_number} disabled />
      </div>
      <div>
        <Label>Product</Label>
        <Select value={formData.product_id} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select water product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Production Date</Label>
        <Input 
          type="date"
          value={formData.production_date}
          onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
        />
      </div>
      <div>
        <Label>Quantity Produced</Label>
        <Input 
          type="number"
          value={formData.quantity_produced}
          onChange={(e) => setFormData({ ...formData, quantity_produced: Number(e.target.value) })}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({
            ...formData,
            organisation_id: orgId,
            supervisor_id: employeeId,
            supervisor_name: employeeName
          })} 
          disabled={isLoading || !formData.product_id}
          className="sl-gradient"
        >
          {isLoading ? "Creating..." : "Create Batch"}
        </Button>
      </div>
    </div>
  );
}