import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Hash, 
  Plus, 
  Search, 
  Package, 
  Warehouse, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SerialNumberManager({ orgId, products, warehouses, vehicles }) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("");

  const serializedProducts = products.filter(p => p.is_serialized);

  const { data: serializedItems = [], isLoading } = useQuery({
    queryKey: ['serializedItems', orgId],
    queryFn: () => base44.entities.SerializedItem.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SerializedItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serializedItems'] });
      setShowAddDialog(false);
      toast.success("Serial number added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SerializedItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serializedItems'] });
      toast.success("Item updated successfully");
    },
  });

  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: v.registration_number, type: 'vehicle' }))
  ];

  const filteredItems = serializedItems.filter(item => {
    const matchesSearch = 
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesProduct = !selectedProduct || item.product_id === selectedProduct;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const location = allLocations.find(l => l.id === formData.get('location_id'));

    // Parse multiple serial numbers (comma or newline separated)
    const serialNumbersRaw = formData.get('serial_numbers');
    const serialNumbers = serialNumbersRaw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

    serialNumbers.forEach(serial => {
      createMutation.mutate({
        organisation_id: orgId,
        product_id: formData.get('product_id'),
        product_name: product?.name,
        serial_number: serial,
        location_id: formData.get('location_id'),
        location_name: location?.name,
        location_type: location?.type || 'warehouse',
        status: 'in_stock',
        condition: formData.get('condition') || 'new',
        purchase_price: parseFloat(formData.get('purchase_price')) || 0,
        received_date: formData.get('received_date'),
        warranty_expiry: formData.get('warranty_expiry'),
        supplier_name: formData.get('supplier_name'),
        notes: formData.get('notes'),
      });
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      in_stock: "bg-green-100 text-green-800",
      sold: "bg-blue-100 text-blue-800",
      reserved: "bg-yellow-100 text-yellow-800",
      damaged: "bg-red-100 text-red-800",
      returned: "bg-purple-100 text-purple-800",
      in_transit: "bg-orange-100 text-orange-800",
    };
    return <Badge className={styles[status] || "bg-gray-100"}>{status?.replace(/_/g, ' ')}</Badge>;
  };

  const stats = {
    total: serializedItems.length,
    inStock: serializedItems.filter(i => i.status === 'in_stock').length,
    sold: serializedItems.filter(i => i.status === 'sold').length,
    damaged: serializedItems.filter(i => i.status === 'damaged').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Stock</p>
                <p className="text-xl font-bold text-green-600">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sold</p>
                <p className="text-xl font-bold text-blue-600">{stats.sold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Damaged</p>
                <p className="text-xl font-bold text-red-600">{stats.damaged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by serial number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-48">
                <Package className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Products</SelectItem>
                {serializedProducts.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
              <Plus className="w-4 h-4 mr-2" />
              Add Serial Numbers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Serialized Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Hash className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No serialized items found</p>
              <p className="text-sm">Add products with serial number tracking first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Warranty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.slice(0, 50).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.serial_number}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.location_type === 'warehouse' ? (
                            <Warehouse className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Truck className="w-3 h-3 text-purple-500" />
                          )}
                          <span className="text-sm">{item.location_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.condition}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.received_date ? format(new Date(item.received_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.warranty_expiry ? format(new Date(item.warranty_expiry), 'MMM d, yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Add Serial Numbers
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select name="product_id" required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select serialized product" />
                </SelectTrigger>
                <SelectContent>
                  {serializedProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {serializedProducts.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  No products with serial tracking enabled. Edit a product and enable "Track Serial Numbers".
                </p>
              )}
            </div>
            <div>
              <Label>Serial Numbers</Label>
              <Textarea 
                name="serial_numbers" 
                placeholder="Enter serial numbers (one per line or comma-separated)"
                className="mt-1 font-mono"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">You can add multiple serial numbers at once</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Select name="location_id" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.type === 'warehouse' ? '🏭' : '🚛'} {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select name="condition" defaultValue="new">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Price (Le)</Label>
                <Input name="purchase_price" type="number" className="mt-1" />
              </div>
              <div>
                <Label>Received Date</Label>
                <Input name="received_date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Warranty Expiry</Label>
                <Input name="warranty_expiry" type="date" className="mt-1" />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input name="supplier_name" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input name="notes" className="mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1EB053]" disabled={serializedProducts.length === 0}>
                Add Items
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}