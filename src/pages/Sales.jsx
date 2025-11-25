import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  X,
  Package,
  Filter,
  Truck,
  Warehouse,
  Store
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ReceiptDialog from "@/components/sales/ReceiptDialog";

export default function Sales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saleType, setSaleType] = useState("retail");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("pos");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

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

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Get location options based on sale type
  const getLocationOptions = () => {
    switch (saleType) {
      case 'vehicle':
        return vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }));
      case 'warehouse':
        return warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' }));
      case 'retail':
      default:
        return warehouses.length > 0 
          ? warehouses.map(w => ({ id: w.id, name: w.name, type: 'store' }))
          : [{ id: 'main_store', name: 'Main Store', type: 'store' }];
    }
  };

  const locationOptions = getLocationOptions();
  const selectedLocationData = locationOptions.find(l => l.id === selectedLocation);

  // Reset location when sale type changes
  React.useEffect(() => {
    setSelectedLocation("");
  }, [saleType]);

  const createSaleMutation = useMutation({
    mutationFn: (saleData) => base44.entities.Sale.create(saleData),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setLastSale(data);
      setCart([]);
      setShowCheckout(false);
      setShowReceipt(true);
      setCustomerName("");
      toast({
        title: "Sale Completed",
        description: "The sale has been recorded successfully.",
      });

      // Send auto sale report to admins
      try {
        await base44.functions.invoke('sendSaleReport', {
          sale: data,
          organisation: organisation?.[0],
          employeeName: currentEmployee?.full_name
        });
      } catch (error) {
        console.log('Sale report notification skipped:', error.message);
      }
    },
  });

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        toast({
          title: "Stock Limit",
          description: "Cannot add more than available stock.",
          variant: "destructive"
        });
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      if (product.stock_quantity < 1) {
        toast({
          title: "Out of Stock",
          description: "This product is out of stock.",
          variant: "destructive"
        });
        return;
      }
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: saleType === 'wholesale' ? (product.wholesale_price || product.unit_price) : product.unit_price,
        total: saleType === 'wholesale' ? (product.wholesale_price || product.unit_price) : product.unit_price
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > product?.stock_quantity) return item;
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const completeSale = async () => {
    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: `Please select a ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'} for this sale.`,
        variant: "destructive"
      });
      return;
    }

    const saleData = {
      organisation_id: orgId,
      sale_number: `SL-${Date.now().toString(36).toUpperCase()}`,
      sale_type: saleType,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      customer_name: customerName,
      items: cart,
      subtotal: cartTotal,
      total_amount: cartTotal,
      payment_method: paymentMethod,
      payment_status: "paid",
      vehicle_id: saleType === 'vehicle' ? selectedLocation : null,
      location: selectedLocationData?.name || ''
    };
    
    createSaleMutation.mutate(saleData);

    // Update stock quantities and create stock movements
    for (const item of cart) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const newQuantity = Math.max(0, product.stock_quantity - item.quantity);
        
        // Update product stock
        await base44.entities.Product.update(item.product_id, {
          stock_quantity: newQuantity
        });

        // Create stock movement record
        await base44.entities.StockMovement.create({
          organisation_id: orgId,
          product_id: item.product_id,
          product_name: item.product_name,
          warehouse_id: product.warehouse_id,
          movement_type: "out",
          quantity: item.quantity,
          previous_stock: product.stock_quantity,
          new_stock: newQuantity,
          reference_type: "sale",
          reference_id: saleData.sale_number,
          recorded_by: currentEmployee?.id,
          recorded_by_name: currentEmployee?.full_name,
          notes: `Sale to ${customerName || 'Walk-in Customer'}`
        });

        // Check and create low stock alert if needed
        const threshold = product.low_stock_threshold || 10;
        if (newQuantity <= threshold && newQuantity > 0) {
          const existingAlerts = await base44.entities.StockAlert.filter({
            organisation_id: orgId,
            product_id: item.product_id,
            status: 'active',
            alert_type: 'low_stock'
          });
          
          if (existingAlerts.length === 0) {
            await base44.entities.StockAlert.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: product.warehouse_id,
              alert_type: 'low_stock',
              current_quantity: newQuantity,
              threshold_quantity: threshold,
              status: 'active'
            });
          }
        } else if (newQuantity === 0) {
          const existingAlerts = await base44.entities.StockAlert.filter({
            organisation_id: orgId,
            product_id: item.product_id,
            status: 'active'
          });
          
          if (existingAlerts.length === 0) {
            await base44.entities.StockAlert.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: product.warehouse_id,
              alert_type: 'out_of_stock',
              current_quantity: 0,
              threshold_quantity: threshold,
              status: 'active'
            });
          }
        }
      }
    }

    // Log activity
    await base44.entities.ActivityLog.create({
      organisation_id: orgId,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      action_type: "sale",
      module: "POS",
      description: `Completed ${saleType} sale for Le ${cartTotal.toLocaleString()}`
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & POS"
        subtitle="Process sales and view transactions"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100 p-1">
          <TabsTrigger value="pos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Point of Sale
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Sales History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Sale Type & Location Selection */}
              <div className="bg-white rounded-xl p-4 border shadow-sm mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Sale Type</label>
                    <Select value={saleType} onValueChange={setSaleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-green-600" />
                            Retail (Store)
                          </div>
                        </SelectItem>
                        <SelectItem value="warehouse">
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4 text-blue-600" />
                            Wholesale
                          </div>
                        </SelectItem>
                        <SelectItem value="vehicle">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-purple-600" />
                            Vehicle Sales
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                      {saleType === 'vehicle' ? 'Select Vehicle' : saleType === 'warehouse' ? 'Select Warehouse' : 'Select Store'}
                    </label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className={!selectedLocation ? "border-amber-300 bg-amber-50" : ""}>
                        <SelectValue placeholder={`Choose ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No {saleType === 'vehicle' ? 'vehicles' : 'warehouses'} available
                          </div>
                        ) : (
                          locationOptions.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              <div className="flex items-center gap-2">
                                {loc.type === 'vehicle' && <Truck className="w-4 h-4 text-purple-500" />}
                                {loc.type === 'warehouse' && <Warehouse className="w-4 h-4 text-blue-500" />}
                                {loc.type === 'store' && <Store className="w-4 h-4 text-green-500" />}
                                {loc.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedLocationData && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700">
                    {saleType === 'vehicle' && <Truck className="w-4 h-4" />}
                    {saleType === 'warehouse' && <Warehouse className="w-4 h-4" />}
                    {saleType === 'retail' && <Store className="w-4 h-4" />}
                    <span>Selling from: <strong>{selectedLocationData.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No Products Found"
                  description="Add products to your inventory to start selling"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
                        product.stock_quantity < 1 ? 'opacity-50' : ''
                      }`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gradient-to-br from-[#1EB053]/20 to-[#1D5FC3]/20 rounded-lg mb-2 flex items-center justify-center">
                            <Package className="w-8 h-8 text-[#1D5FC3]" />
                          </div>
                        )}
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[#1EB053] font-bold">
                            Le {(saleType === 'warehouse' ? (product.wholesale_price || product.unit_price) : product.unit_price)?.toLocaleString()}
                          </p>
                          <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                            {product.stock_quantity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Card className="h-fit sticky top-24">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Click products to add</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Le {item.unit_price.toLocaleString()} each</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#1EB053]">Le {cartTotal.toLocaleString()}</span>
                    </div>
                    <Button
                      className="w-full sl-gradient"
                      size="lg"
                      onClick={() => setShowCheckout(true)}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : sales.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Sales Yet"
                  description="Sales will appear here once you make your first transaction"
                />
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => (
                    <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{sale.sale_number}</p>
                          <p className="text-sm text-gray-500">
                            {sale.customer_name || 'Walk-in Customer'} • {sale.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{sale.sale_type}</Badge>
                          <Badge variant="outline">{sale.payment_method}</Badge>
                          {sale.location && (
                            <Badge variant="outline" className="text-xs">
                              {sale.sale_type === 'vehicle' && <Truck className="w-3 h-3 mr-1" />}
                              {sale.sale_type === 'warehouse' && <Warehouse className="w-3 h-3 mr-1" />}
                              {sale.sale_type === 'retail' && <Store className="w-3 h-3 mr-1" />}
                              {sale.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={showReceipt}
        onOpenChange={setShowReceipt}
        sale={lastSale}
        organisation={organisation?.[0]}
      />

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer Name (Optional)</label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Location Info */}
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                {saleType === 'vehicle' && <Truck className="w-4 h-4 text-purple-600" />}
                {saleType === 'warehouse' && <Warehouse className="w-4 h-4 text-blue-600" />}
                {saleType === 'retail' && <Store className="w-4 h-4 text-green-600" />}
                <span className="text-gray-600">
                  {saleType === 'vehicle' ? 'Vehicle' : saleType === 'warehouse' ? 'Warehouse' : 'Store'}:
                </span>
                <span className="font-medium">{selectedLocationData?.name || 'Not selected'}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: 'cash', icon: Banknote, label: 'Cash' },
                  { value: 'card', icon: CreditCard, label: 'Card' },
                  { value: 'mobile_money', icon: Smartphone, label: 'Mobile' },
                ].map((method) => (
                  <Button
                    key={method.value}
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    className={paymentMethod === method.value ? "sl-gradient" : ""}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <method.icon className="w-4 h-4 mr-1" />
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>Le {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-[#1EB053]">Le {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              className="w-full sl-gradient"
              size="lg"
              onClick={completeSale}
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}