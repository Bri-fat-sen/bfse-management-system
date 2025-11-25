import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Package, CreditCard, Truck, Plus, Minus, X, Search, Check, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper, FormWrapperContent } from "./FormWrapper";
import { FormInput, FormTextarea, FormSelect, FormField, FormSection } from "./FormField";
import { FormStepperNavigation } from "./FormStepper";

const STEPS = [
  { id: 1, title: "Customer", icon: User },
  { id: 2, title: "Products", icon: Package },
  { id: 3, title: "Payment", icon: CreditCard },
  { id: 4, title: "Review", icon: Check },
];

export default function CustomerOrderForm({ orgId, products = [], currentEmployee, onSuccess, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    delivery_required: false,
    delivery_address: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    method: "cash",
    status: "pending",
    discount: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Sale.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: "Order Created!", description: "Order has been placed successfully" });
      onSuccess?.();
    },
  });

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      p.stock_quantity > 0
    ), [products, searchTerm]);

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
        const newQty = Math.max(1, Math.min(item.quantity + delta, product?.stock_quantity || 99));
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = payment.discount || 0;
  const total = subtotal - discount;

  const handleSubmit = () => {
    if (!customer.name || cart.length === 0) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      sale_number: `ORD-${Date.now().toString(36).toUpperCase()}`,
      sale_type: "retail",
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      customer_name: customer.name,
      customer_phone: customer.phone,
      items: cart,
      subtotal: subtotal,
      discount: discount,
      total_amount: total,
      payment_method: payment.method,
      payment_status: payment.status,
      notes: `${customer.notes}${customer.delivery_required ? ` | Delivery: ${customer.delivery_address}` : ''}`,
    });
  };

  return (
    <FormWrapper maxWidth="4xl">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5c] text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">New Order</h2>
              <p className="text-white/70 text-sm">Create a customer order</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Order Total</p>
            <p className="text-2xl font-bold text-[#1EB053]">Le {total.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  step === s.id 
                    ? 'bg-white text-[#0F1F3C] shadow-lg' 
                    : step > s.id 
                      ? 'bg-[#1EB053]/20 text-[#1EB053]' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.id ? 'bg-[#1EB053]' : 'bg-white/20'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <FormWrapperContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Customer */}
          {step === 1 && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormSection title="Customer Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Customer Name"
                    icon={User}
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Full name"
                  />
                  <FormInput
                    label="Phone Number"
                    icon={Phone}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+232 XX XXX XXXX"
                  />
                  <FormInput
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="customer@email.com"
                  />
                  <FormInput
                    label="Address"
                    icon={MapPin}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Customer address"
                  />
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="delivery"
                      checked={customer.delivery_required}
                      onCheckedChange={(checked) => setCustomer({ ...customer, delivery_required: checked })}
                    />
                    <label htmlFor="delivery" className="font-medium flex items-center gap-2 cursor-pointer">
                      <Truck className="w-4 h-4 text-[#0072C6]" /> Delivery Required
                    </label>
                  </div>
                  
                  {customer.delivery_required && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <FormTextarea
                        label="Delivery Address"
                        value={customer.delivery_address}
                        onChange={(e) => setCustomer({ ...customer, delivery_address: e.target.value })}
                        placeholder="Full delivery address with landmarks..."
                      />
                    </motion.div>
                  )}
                </div>

                <FormTextarea
                  label="Order Notes"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  className="mt-4"
                />
              </FormSection>
            </motion.div>
          )}

          {/* Step 2: Products */}
          {step === 2 && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Products</h2>
                <Badge variant="secondary">{cart.length} items in cart</Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {/* Products Grid */}
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find(c => c.product_id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          inCart ? 'border-[#1EB053] bg-[#1EB053]/5' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#1EB053]">Le {product.unit_price?.toLocaleString()}</p>
                            {inCart && (
                              <Badge className="bg-[#1EB053]">{inCart.quantity} added</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Order Items
                  </h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Click products to add</p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-500">Le {item.unit_price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => removeFromCart(item.product_id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="pt-2 border-t mt-3">
                        <div className="flex justify-between font-bold">
                          <span>Subtotal</span>
                          <span className="text-[#1EB053]">Le {subtotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormSection title="Payment Details">
                <FormField label="Payment Method">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: "cash", label: "Cash", icon: "💵" },
                      { value: "card", label: "Card", icon: "💳" },
                      { value: "mobile_money", label: "Mobile Money", icon: "📱" },
                      { value: "credit", label: "Credit", icon: "📋" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPayment({ ...payment, method: method.value })}
                        className={`p-4 rounded-xl text-center transition-all border-2 ${
                          payment.method === method.value
                            ? 'border-[#1EB053] bg-[#1EB053]/10 shadow-md scale-[1.02]'
                            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{method.icon}</span>
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <FormSelect
                    label="Payment Status"
                    value={payment.status}
                    onValueChange={(v) => setPayment({ ...payment, status: v })}
                    options={[
                      { value: "paid", label: "Paid" },
                      { value: "pending", label: "Pending" },
                      { value: "partial", label: "Partial" }
                    ]}
                  />
                  <FormInput
                    label="Discount (Le)"
                    type="number"
                    value={payment.discount}
                    onChange={(e) => setPayment({ ...payment, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Le {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-Le {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#1EB053]">Le {total.toLocaleString()}</span>
                  </div>
                </div>
              </FormSection>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-500 text-sm mb-2">Customer</h3>
                  <p className="font-bold">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  {customer.delivery_required && (
                    <Badge className="mt-2 bg-[#0072C6]">
                      <Truck className="w-3 h-3 mr-1" /> Delivery
                    </Badge>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-500 text-sm mb-2">Payment</h3>
                  <p className="font-bold capitalize">{payment.method.replace('_', ' ')}</p>
                  <Badge className={payment.status === 'paid' ? 'bg-[#1EB053]' : 'bg-amber-500'}>
                    {payment.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-500 text-sm mb-3">Items ({cart.length})</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">Le {item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 mt-3 border-t">
                  <span>Total</span>
                  <span className="text-[#1EB053]">Le {total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FormStepperNavigation
          currentStep={step}
          totalSteps={4}
          onPrevious={() => setStep(s => s - 1)}
          onNext={() => setStep(s => s + 1)}
          onSubmit={handleSubmit}
          onCancel={onClose}
          canProceed={(step === 1 && customer.name) || (step === 2 && cart.length > 0) || step > 2}
          isLoading={createMutation.isPending}
          nextLabel="Continue"
          submitLabel="Place Order"
        />
      </FormWrapperContent>
    </FormWrapper>
  );
}