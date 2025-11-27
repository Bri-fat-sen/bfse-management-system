import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  Package,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useOffline } from "@/components/offline/OfflineManager";

export default function MobileQuickSale({ 
  open, 
  onOpenChange, 
  orgId, 
  currentEmployee,
  onSaleComplete 
}) {
  const offlineContext = useOffline();
  const isOnline = offlineContext?.isOnline ?? true;
  const queueAction = offlineContext?.queueAction ?? null;
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && open,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins for offline
  });

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  ).slice(0, 10);

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
      if (product.stock_quantity < 1) {
        toast.error("Out of stock");
        return;
      }
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.unit_price,
        total: product.unit_price
      }]);
    }
    setSearchTerm("");
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        const product = products.find(p => p.id === productId);
        if (newQty > (product?.stock_quantity || 0)) {
          toast.error("Stock limit reached");
          return item;
        }
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
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    
    const saleData = {
      organisation_id: orgId,
      sale_number: `QS-${format(new Date(), 'yyyyMMddHHmmss')}`,
      sale_type: 'retail',
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      items: cart,
      subtotal: cartTotal,
      total_amount: cartTotal,
      payment_method: paymentMethod,
      payment_status: 'paid'
    };

    try {
      if (isOnline) {
        await base44.entities.Sale.create(saleData);
        
        // Update stock
        for (const item of cart) {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            await base44.entities.Product.update(item.product_id, {
              stock_quantity: Math.max(0, product.stock_quantity - item.quantity)
            });
          }
        }
        
        toast.success("Sale completed!", { description: `Le ${cartTotal.toLocaleString()}` });
      } else {
        // Queue for offline sync
        if (queueAction) {
          queueAction({ type: 'create_sale', data: saleData });
          toast.success("Sale saved offline", { description: "Will sync when online" });
        }
      }
      
      setCart([]);
      onSaleComplete?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Sale failed", { description: error.message });
    }
    
    setIsProcessing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#1EB053]" />
            Quick Sale
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search or scan product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="absolute left-4 right-4 top-28 z-10 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {product.unit_price?.toLocaleString()}</p>
                      <Plus className="w-5 h-5 text-[#0072C6] ml-auto" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Cart */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <ShoppingCart className="w-10 h-10 mb-2" />
                <p className="text-sm">Search and add products</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Le {item.unit_price?.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product_id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product_id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-sm">Le {item.total?.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Payment & Total */}
          {cart.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              {/* Payment Method */}
              <div className="flex gap-2">
                {[
                  { value: 'cash', icon: Banknote, label: 'Cash' },
                  { value: 'card', icon: CreditCard, label: 'Card' },
                  { value: 'mobile_money', icon: Smartphone, label: 'Mobile' },
                ].map(method => (
                  <Button
                    key={method.value}
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    className={`flex-1 ${paymentMethod === method.value ? 'bg-[#1EB053]' : ''}`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <method.icon className="w-4 h-4 mr-1" />
                    {method.label}
                  </Button>
                ))}
              </div>

              {/* Total & Complete */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-[#1EB053]">Le {cartTotal.toLocaleString()}</p>
                </div>
                <Button
                  size="lg"
                  onClick={completeSale}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-8"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}