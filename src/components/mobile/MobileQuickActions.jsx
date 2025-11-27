import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOffline } from "@/components/offline/OfflineManager";
import { format } from "date-fns";
import {
  ShoppingCart,
  Package,
  Truck,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  X,
  MapPin,
  Clock,
  AlertTriangle,
  Barcode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

// Quick Sale Component optimized for mobile
export function MobileQuickSale({ products, currentEmployee, orgId, warehouses }) {
  const queryClient = useQueryClient();
  const offlineContext = useOffline();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedLocation, setSelectedLocation] = useState(warehouses?.[0]?.id || "");

  const filteredProducts = (products || []).filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(p => p.stock_quantity > 0).slice(0, 12);

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        toast.error("Stock limit reached");
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.unit_price,
        total: product.unit_price
      }]);
    }
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
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

  const completeSaleMutation = useMutation({
    mutationFn: async () => {
      const saleData = {
        organisation_id: orgId,
        sale_number: `SL-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`,
        sale_type: 'retail',
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        items: cart,
        subtotal: cartTotal,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        payment_status: "paid",
        location: warehouses?.find(w => w.id === selectedLocation)?.name || 'Mobile POS'
      };

      // Check if offline
      if (offlineContext && !offlineContext.isOnline) {
        offlineContext.queueAction({ type: 'create_sale', data: saleData });
        return saleData;
      }
      
      const sale = await base44.entities.Sale.create(saleData);
      
      // Update stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await base44.entities.Product.update(item.product_id, {
            stock_quantity: Math.max(0, product.stock_quantity - item.quantity)
          });
        }
      }
      
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Sale Complete!", { description: `Total: Le ${cartTotal.toLocaleString()}` });
      setCart([]);
      setShowCheckout(false);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  });

  return (
    <div className="space-y-3">
      {/* Search with large touch target */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search or scan barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-14 pl-12 text-lg rounded-xl"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => toast.info("Barcode scanning coming soon")}
        >
          <Barcode className="w-5 h-5" />
        </Button>
      </div>

      {/* Product Grid - Large touch targets */}
      <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pb-2">
        {filteredProducts.map((product) => {
          const inCart = cart.find(c => c.product_id === product.id);
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className={`relative p-4 rounded-xl text-left transition-all active:scale-95 ${
                inCart ? 'bg-green-50 border-2 border-[#1EB053]' : 'bg-white border-2 border-gray-100'
              }`}
            >
              {inCart && (
                <Badge className="absolute -top-2 -right-2 bg-[#1EB053] h-6 w-6 p-0 flex items-center justify-center rounded-full">
                  {inCart.quantity}
                </Badge>
              )}
              <p className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#1EB053] font-bold">Le {product.unit_price?.toLocaleString()}</span>
                <Badge variant={product.stock_quantity < 10 ? "destructive" : "secondary"} className="text-xs">
                  {product.stock_quantity}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cart Summary - Fixed at bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">{cart.length} items</p>
              <p className="text-2xl font-bold text-[#1EB053]">Le {cartTotal.toLocaleString()}</p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowCheckout(true)}
              className="h-14 px-8 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-lg rounded-xl"
            >
              Checkout
            </Button>
          </div>
          
          {/* Quick cart view */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cart.map((item) => (
              <div key={item.product_id} className="flex-shrink-0 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <span className="text-sm font-medium truncate max-w-24">{item.product_name}</span>
                <span className="text-xs bg-white px-2 py-0.5 rounded">×{item.quantity}</span>
                <button onClick={() => removeFromCart(item.product_id)} className="text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Drawer */}
      <Drawer open={showCheckout} onOpenChange={setShowCheckout}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Complete Sale</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            {/* Items list */}
            <div className="max-h-40 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Le {item.unit_price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFromCart(item.product_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-center py-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-4xl font-bold text-[#1EB053]">Le {cartTotal.toLocaleString()}</p>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'cash', icon: Banknote, label: 'Cash', color: 'text-green-600' },
                { value: 'card', icon: CreditCard, label: 'Card', color: 'text-blue-600' },
                { value: 'mobile_money', icon: Smartphone, label: 'Mobile', color: 'text-purple-600' },
              ].map((method) => (
                <Button
                  key={method.value}
                  variant={paymentMethod === method.value ? "default" : "outline"}
                  className={`h-20 flex-col gap-2 ${paymentMethod === method.value ? "bg-[#1EB053] border-[#1EB053]" : ""}`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <method.icon className={`w-6 h-6 ${paymentMethod === method.value ? 'text-white' : method.color}`} />
                  <span className="text-sm">{method.label}</span>
                </Button>
              ))}
            </div>

            {/* Complete Button */}
            <Button 
              onClick={() => completeSaleMutation.mutate()}
              disabled={completeSaleMutation.isPending}
              className="w-full h-16 text-xl bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-xl"
            >
              {completeSaleMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Complete Sale
                </span>
              )}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Quick Stock Check Component
export function MobileStockCheck({ products, stockLevels, warehouses }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = (products || []).filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20);

  const getStockByLocation = (productId) => {
    return (stockLevels || []).filter(sl => sl.product_id === productId);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-14 pl-12 text-lg rounded-xl"
        />
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filteredProducts.map((product) => {
          const locationStock = getStockByLocation(product.id);
          const isLow = product.stock_quantity <= (product.low_stock_threshold || 10);
          
          return (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="w-full p-4 bg-white rounded-xl border text-left active:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
                </div>
                <div className="text-right">
                  <Badge variant={isLow ? "destructive" : "default"} className={!isLow ? "bg-[#1EB053]" : ""}>
                    {product.stock_quantity} in stock
                  </Badge>
                  {isLow && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Low stock
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stock Details Drawer */}
      <Drawer open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedProduct?.name}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">Total Stock</p>
                <p className="text-3xl font-bold text-[#1EB053]">{selectedProduct?.stock_quantity}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="text-xl font-bold">Le {selectedProduct?.unit_price?.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Stock by Location</p>
              <div className="space-y-2">
                {getStockByLocation(selectedProduct?.id).map((sl) => (
                  <div key={sl.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{sl.warehouse_name}</span>
                    </div>
                    <Badge>{sl.quantity}</Badge>
                  </div>
                ))}
                {getStockByLocation(selectedProduct?.id).length === 0 && (
                  <p className="text-center text-gray-500 py-4">No location-specific stock data</p>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Quick Delivery Update Component
export function MobileDeliveryUpdate({ currentEmployee, orgId }) {
  const queryClient = useQueryClient();
  const offlineContext = useOffline();
  
  const { data: trips = [] } = useQuery({
    queryKey: ['activeTrips', currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      organisation_id: orgId,
      driver_id: currentEmployee?.id,
      status: 'in_progress'
    }),
    enabled: !!currentEmployee?.id && !!orgId,
  });

  const updateTripMutation = useMutation({
    mutationFn: async ({ tripId, status, notes }) => {
      const updateData = { 
        status,
        ...(status === 'completed' && { actual_arrival: new Date().toISOString() }),
        notes
      };

      if (offlineContext && !offlineContext.isOnline) {
        offlineContext.queueAction({ type: 'update_trip', tripId, data: updateData });
        return updateData;
      }

      return base44.entities.Trip.update(tripId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTrips'] });
      toast.success("Delivery updated");
      if (navigator.vibrate) navigator.vibrate(100);
    }
  });

  if (trips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No active deliveries</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <Card key={trip.id} className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">{trip.route_name || 'Delivery'}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {trip.destination || 'No destination'}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => updateTripMutation.mutate({ tripId: trip.id, status: 'delayed', notes: 'Delayed' })}
              >
                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                Delayed
              </Button>
              <Button
                className="h-12 bg-[#1EB053]"
                onClick={() => updateTripMutation.mutate({ tripId: trip.id, status: 'completed' })}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Delivered
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default { MobileQuickSale, MobileStockCheck, MobileDeliveryUpdate };