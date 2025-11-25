import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QuickSale({ products, currentEmployee, orgId, location }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock_quantity > 0
  ).slice(0, 8);

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) return;
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
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const completeSaleMutation = useMutation({
    mutationFn: async () => {
      const saleData = {
        organisation_id: orgId,
        sale_number: `SL-${Date.now().toString(36).toUpperCase()}`,
        sale_type: 'retail',
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        items: cart,
        subtotal: cartTotal,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        payment_status: "paid",
        location: location || 'Mobile POS'
      };
      
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
      toast({ title: "Sale Complete!", description: `Total: Le ${cartTotal.toLocaleString()}` });
      setCart([]);
      setShowCheckout(false);
    }
  });

  return (
    <Card className="border-t-4 border-t-[#1EB053]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5 text-[#1EB053]" />
            Quick Sale
          </span>
          {cart.length > 0 && (
            <Badge className="bg-[#1EB053]">{cart.length} items</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12"
        />

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 active:scale-95 transition-all"
            >
              <p className="font-medium text-sm truncate">{product.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[#1EB053] font-bold text-sm">Le {product.unit_price?.toLocaleString()}</span>
                <Badge variant="outline" className="text-xs">{product.stock_quantity}</Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">{item.product_name}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.product_id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-[#1EB053]">Le {cartTotal.toLocaleString()}</span>
            </div>
            <Button 
              onClick={() => setShowCheckout(true)}
              className="w-full h-12 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              Checkout
            </Button>
          </div>
        )}

        {/* Checkout Dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Complete Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-[#1EB053]">Le {cartTotal.toLocaleString()}</p>
                <p className="text-gray-500">{cart.length} items</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'cash', icon: Banknote, label: 'Cash' },
                  { value: 'card', icon: CreditCard, label: 'Card' },
                  { value: 'mobile_money', icon: Smartphone, label: 'Mobile' },
                ].map((method) => (
                  <Button
                    key={method.value}
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    className={`h-16 flex-col ${paymentMethod === method.value ? "bg-[#1EB053]" : ""}`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <method.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{method.label}</span>
                  </Button>
                ))}
              </div>
              <Button 
                onClick={() => completeSaleMutation.mutate()}
                disabled={completeSaleMutation.isPending}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {completeSaleMutation.isPending ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}