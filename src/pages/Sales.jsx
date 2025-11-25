import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  X,
  Store,
  Warehouse,
  Truck,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("pos");
  const [saleType, setSaleType] = useState("retail");
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const createSaleMutation = useMutation({
    mutationFn: (saleData) => base44.entities.Sale.create(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
      setShowPayment(false);
      setCustomerName("");
      setCustomerPhone("");
    },
  });

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      const price = saleType === "warehouse" ? (product.wholesale_price || product.unit_price) : product.unit_price;
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: price,
        total: price
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = 0; // Can be configured
  const total = subtotal + tax;

  const handleCompleteSale = async () => {
    const saleNumber = `SL-${Date.now()}`;
    await createSaleMutation.mutateAsync({
      organisation_id: orgId,
      sale_number: saleNumber,
      sale_type: saleType,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: cart,
      subtotal,
      tax,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: "paid"
    });
  };

  // Stats
  const todaySales = sales.filter(s => 
    s.created_date && format(new Date(s.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const saleTypeIcons = {
    retail: Store,
    warehouse: Warehouse,
    vehicle: Truck
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales & POS" 
        subtitle="Process sales and view transactions"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          <TabsTrigger value="history">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="mt-6">
          {/* Sale Type Selector */}
          <div className="flex gap-3 mb-6">
            {["retail", "warehouse", "vehicle"].map((type) => {
              const Icon = saleTypeIcons[type];
              return (
                <Button
                  key={type}
                  variant={saleType === type ? "default" : "outline"}
                  onClick={() => setSaleType(type)}
                  className={saleType === type ? "sl-gradient" : ""}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#1EB053] border-2 border-transparent"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-24 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <p className="text-[#1EB053] font-bold mt-1">
                        Le {(saleType === "warehouse" ? (product.wholesale_price || product.unit_price) : product.unit_price)?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {product.stock_quantity || 0}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-0 shadow-lg">
                <CardHeader className="pb-2 bg-gradient-to-r from-[#0F1F3C] to-[#1D5FC3] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Current Sale
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Cart is empty</p>
                      <p className="text-sm">Click products to add them</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-500">Le {item.unit_price?.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>Le {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Tax</span>
                      <span>Le {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#1EB053]">Le {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 sl-gradient"
                    disabled={cart.length === 0}
                    onClick={() => setShowPayment(true)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Today's Sales"
              value={todaySales.length}
              icon={ShoppingCart}
              color="green"
            />
            <StatCard
              title="Today's Revenue"
              value={`Le ${todayRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Average Sale"
              value={`Le ${todaySales.length > 0 ? Math.round(todayRevenue / todaySales.length).toLocaleString() : 0}`}
              icon={TrendingUp}
              color="gold"
            />
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.sale_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {sale.sale_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.customer_name || "-"}</TableCell>
                      <TableCell>{sale.items?.length || 0}</TableCell>
                      <TableCell className="font-medium">Le {sale.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          sale.payment_method === "cash" ? "bg-green-100 text-green-800" :
                          sale.payment_method === "card" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }>
                          {sale.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.created_date && format(new Date(sale.created_date), 'MMM d, HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-3xl font-bold text-[#1EB053]">Le {total.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="Customer Phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "cash", icon: Banknote, label: "Cash" },
                { value: "card", icon: CreditCard, label: "Card" },
                { value: "mobile_money", icon: Smartphone, label: "Mobile" }
              ].map((method) => (
                <Button
                  key={method.value}
                  variant={paymentMethod === method.value ? "default" : "outline"}
                  className={`flex-col h-20 ${paymentMethod === method.value ? "sl-gradient" : ""}`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <method.icon className="w-5 h-5 mb-1" />
                  {method.label}
                </Button>
              ))}
            </div>

            <Button 
              className="w-full sl-gradient"
              onClick={handleCompleteSale}
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