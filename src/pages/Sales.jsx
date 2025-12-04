import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeNumber, safeInt, formatNumber, calculateLineTotal, calculateSaleTotals } from "@/components/utils/calculations";
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
  Store,
  Users,
  Eye,
  Download,
  MoreVertical,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import ReceiptDialog from "@/components/sales/ReceiptDialog";
import InvoiceDialog from "@/components/sales/InvoiceDialog";

export default function Sales() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saleType, setSaleType] = useState(null); // Will be set based on role
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("pos");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Will be set based on assigned location
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [autoSetupDone, setAutoSetupDone] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch stock levels for the selected location
  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId, selectedLocation],
    queryFn: () => base44.entities.StockLevel.filter({ 
      organisation_id: orgId, 
      warehouse_id: selectedLocation 
    }),
    enabled: !!orgId && !!selectedLocation,
  });

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  ).slice(0, 5);

  // Create a map of product stock at selected location
  const locationStockMap = React.useMemo(() => {
    const map = {};
    stockLevels.forEach(sl => {
      // Use quantity if available_quantity is 0 or undefined
      const availableQty = sl.available_quantity || sl.quantity || 0;
      map[sl.product_id] = availableQty;
    });
    return map;
  }, [stockLevels]);

  // Get location options based on sale type, filtered by allowed_sale_types
  const getLocationOptions = () => {
    switch (saleType) {
      case 'vehicle':
        return vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }));
      case 'warehouse':
        const warehouseLocations = warehouses.filter(w => 
          !w.allowed_sale_types || w.allowed_sale_types.length === 0 || w.allowed_sale_types.includes('warehouse')
        );
        return warehouseLocations.length > 0 
          ? warehouseLocations.map(w => ({ id: w.id, name: w.name, type: 'warehouse' }))
          : [{ id: 'default_warehouse', name: 'Main Warehouse', type: 'warehouse' }];
      case 'retail':
      default:
        const retailLocations = warehouses.filter(w => 
          !w.allowed_sale_types || w.allowed_sale_types.length === 0 || w.allowed_sale_types.includes('retail')
        );
        return retailLocations.length > 0 
          ? retailLocations.map(w => ({ id: w.id, name: w.name, type: 'store' }))
          : [{ id: 'main_store', name: 'Main Store', type: 'store' }];
    }
  };

  const locationOptions = getLocationOptions();
  const selectedLocationData = locationOptions.find(l => l.id === selectedLocation);

  // Auto-setup sale type and location based on employee role and assigned location
  React.useEffect(() => {
    if (autoSetupDone || !currentEmployee) return;
    
    const role = currentEmployee.role;
    const assignedLocationId = currentEmployee.assigned_location_id;
    const assignedLocationType = currentEmployee.assigned_location_type;
    
    // Determine default sale type based on role
    let defaultSaleType = 'retail';
    if (role === 'driver' || role === 'vehicle_sales') {
      defaultSaleType = 'vehicle';
    } else if (role === 'warehouse_manager') {
      defaultSaleType = 'warehouse';
    } else if (role === 'retail_cashier') {
      defaultSaleType = 'retail';
    }
    
    // If employee has assigned location, use its type
    if (assignedLocationType === 'vehicle') {
      defaultSaleType = 'vehicle';
    } else if (assignedLocationType === 'warehouse') {
      defaultSaleType = 'warehouse';
    } else if (assignedLocationType === 'store') {
      defaultSaleType = 'retail';
    }
    
    setSaleType(defaultSaleType);
    
    // Set assigned location if available
    if (assignedLocationId) {
      setSelectedLocation(assignedLocationId);
    }
    
    setAutoSetupDone(true);
  }, [currentEmployee, autoSetupDone]);

  // Auto-select location if only one option available (after initial setup)
  React.useEffect(() => {
    if (!autoSetupDone || !saleType) return;
    
    const options = getLocationOptions();
    // Only auto-select if no location is set and there's only one option
    if (!selectedLocation && options.length === 1) {
      setSelectedLocation(options[0].id);
    }
  }, [locationOptions, selectedLocation, autoSetupDone, saleType]);

  // Reset location and cart when sale type changes (but not on initial setup)
  React.useEffect(() => {
    if (!autoSetupDone || !saleType) return;
    
    const options = getLocationOptions();
    // Don't reset if this is the employee's assigned location type
    const isAssignedType = (
      (currentEmployee?.assigned_location_type === 'vehicle' && saleType === 'vehicle') ||
      (currentEmployee?.assigned_location_type === 'warehouse' && saleType === 'warehouse') ||
      (currentEmployee?.assigned_location_type === 'store' && saleType === 'retail')
    );
    
    if (!isAssignedType) {
      // Auto-select if only one option
      if (options.length === 1) {
        setSelectedLocation(options[0].id);
      } else if (selectedLocation && !options.find(o => o.id === selectedLocation)) {
        setSelectedLocation("");
      }
    }
    setCart([]);
  }, [saleType, warehouses.length, vehicles.length]);

  // Clear cart when location changes (stock is location-specific)
  React.useEffect(() => {
    if (cart.length > 0) {
      setCart([]);
    }
  }, [selectedLocation]);

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
      toast.success("Sale Completed", { description: "The sale has been recorded successfully." });

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

  const deleteSaleMutation = useMutation({
    mutationFn: (saleId) => base44.entities.Sale.delete(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Sale Deleted", { description: "The sale has been removed." });
    },
  });

  const handleViewReceipt = (sale) => {
    setLastSale(sale);
    setShowReceipt(true);
  };

  const handleDeleteSale = (sale) => {
    if (window.confirm(`Are you sure you want to delete sale ${sale.sale_number}? This action cannot be undone.`)) {
      deleteSaleMutation.mutate(sale.id);
    }
  };

  // Filter products and add location-specific stock
  const filteredProducts = React.useMemo(() => {
    return (products || [])
      .filter(p => p && (
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
      .map(p => {
        // For default locations (main_store, default_warehouse), use product stock directly
        const isDefaultLocation = !selectedLocation || selectedLocation.startsWith('main_') || selectedLocation.startsWith('default_');
        
        // Check if we have a specific stock level for this product at this location
        const locationStock = locationStockMap[p.id];
        
        // Use location stock if available and not a default location, otherwise fall back to product stock
        let stockValue;
        if (isDefaultLocation) {
          stockValue = p.stock_quantity ?? 0;
        } else if (locationStock !== undefined && locationStock > 0) {
          stockValue = locationStock;
        } else {
          // If no stock level record but product has stock, use product stock
          stockValue = p.stock_quantity ?? 0;
        }
        
        return {
          ...p,
          location_stock: stockValue
        };
      });
  }, [products, searchTerm, selectedLocation, locationStockMap]);

  const addToCart = (product) => {
    // For default locations, always allow (no strict location requirement)
    if (!selectedLocation && locationOptions.length > 1) {
      toast.error("Select Location", { description: `Please select a ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'} first.` });
      return;
    }

    const availableStock = product.location_stock ?? product.stock_quantity ?? 0;
    const existing = cart.find(item => item.product_id === product.id);
    
    if (existing) {
      if (existing.quantity >= availableStock) {
        toast.error("Stock Limit", { description: `Only ${availableStock} available at this location.` });
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      if (availableStock < 1) {
        toast.error("Out of Stock", { description: "This product is not available at this location." });
        return;
      }
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: saleType === 'warehouse' ? (product.wholesale_price || product.unit_price) : product.unit_price,
        total: saleType === 'warehouse' ? (product.wholesale_price || product.unit_price) : product.unit_price
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    const product = filteredProducts.find(p => p.id === productId);
    const availableStock = product?.location_stock ?? 0;
    
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > availableStock) {
          toast.error("Stock Limit", { description: `Only ${availableStock} available at this location.` });
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
    if (!selectedLocation) {
      toast.error("Location Required", { description: `Please select a ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'} for this sale.` });
      return;
    }

    const saleData = {
      organisation_id: orgId,
      sale_number: `SL-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`,
      sale_type: saleType,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      customer_name: selectedCustomer?.name || customerName,
      customer_id: selectedCustomer?.id || null,
      customer_phone: selectedCustomer?.phone || null,
      items: cart,
      subtotal: cartTotal,
      total_amount: cartTotal,
      payment_method: paymentMethod,
      payment_status: "paid",
      vehicle_id: saleType === 'vehicle' ? selectedLocation : null,
      location: selectedLocationData?.name || ''
    };
    
    createSaleMutation.mutate(saleData);

    // Update customer stats if a customer is linked
    if (selectedCustomer) {
      const newTotalSpent = (selectedCustomer.total_spent || 0) + cartTotal;
      const newTotalPurchases = (selectedCustomer.total_purchases || 0) + 1;
      await base44.entities.Customer.update(selectedCustomer.id, {
        total_spent: newTotalSpent,
        total_purchases: newTotalPurchases,
        average_order_value: newTotalSpent / newTotalPurchases,
        last_purchase_date: format(new Date(), 'yyyy-MM-dd'),
        loyalty_points: (selectedCustomer.loyalty_points || 0) + Math.floor(cartTotal / 1000)
      });

      // Log customer interaction
      await base44.entities.CustomerInteraction.create({
        organisation_id: orgId,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        interaction_type: 'sale',
        subject: `Purchase - ${saleData.sale_number}`,
        description: `Completed ${saleType} sale of Le ${cartTotal.toLocaleString()}`,
        outcome: 'successful',
        interaction_date: format(new Date(), 'yyyy-MM-dd'),
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        related_sale_id: saleData.sale_number
      });

      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }

    setSelectedCustomer(null);
    setCustomerSearch("");

    // Update stock quantities at the location and create stock movements
    for (const item of cart) {
      const product = products.find(p => p.id === item.product_id);
      const currentLocationStock = locationStockMap[item.product_id] ?? 0;
      
      if (product) {
        const newLocationStock = Math.max(0, currentLocationStock - item.quantity);
        
        // Update stock level at the specific location
        const existingStockLevel = stockLevels.find(sl => sl.product_id === item.product_id);
        if (existingStockLevel) {
          await base44.entities.StockLevel.update(existingStockLevel.id, {
            quantity: newLocationStock,
            available_quantity: newLocationStock
          });
        }
        
        // Also update product's total stock
        const newTotalStock = Math.max(0, product.stock_quantity - item.quantity);
        await base44.entities.Product.update(item.product_id, {
          stock_quantity: newTotalStock
        });

        // Create stock movement record
        await base44.entities.StockMovement.create({
          organisation_id: orgId,
          product_id: item.product_id,
          product_name: item.product_name,
          warehouse_id: selectedLocation,
          warehouse_name: selectedLocationData?.name,
          movement_type: "out",
          quantity: item.quantity,
          previous_stock: currentLocationStock,
          new_stock: newLocationStock,
          reference_type: "sale",
          reference_id: saleData.sale_number,
          recorded_by: currentEmployee?.id,
          recorded_by_name: currentEmployee?.full_name,
          notes: `${saleType} sale to ${customerName || 'Walk-in Customer'} from ${selectedLocationData?.name}`
        });

        // Real-time stock alert generation
        const threshold = product.reorder_point || product.low_stock_threshold || 10;
        const reorderPoint = product.reorder_point || 10;
        
        // Create reorder suggestion if stock falls below reorder point
        if (newTotalStock <= reorderPoint && newTotalStock >= 0) {
          const existingSuggestions = await base44.entities.ReorderSuggestion.filter({
            organisation_id: orgId,
            product_id: item.product_id,
            status: 'pending'
          });
          
          if (existingSuggestions.length === 0) {
            await base44.entities.ReorderSuggestion.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              current_stock: newTotalStock,
              reorder_point: reorderPoint,
              suggested_quantity: product.reorder_quantity || 50,
              priority: newTotalStock === 0 ? 'critical' : newTotalStock <= 5 ? 'high' : 'medium',
              status: 'pending',
              supplier_id: product.preferred_supplier_id,
              supplier_name: product.preferred_supplier_name,
              estimated_cost: (product.reorder_quantity || 50) * (product.cost_price || 0),
            });
          }
        }

        // Create stock alert
        if (newLocationStock <= threshold && newLocationStock > 0) {
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
              warehouse_id: selectedLocation,
              warehouse_name: selectedLocationData?.name,
              alert_type: 'low_stock',
              current_quantity: newLocationStock,
              threshold_quantity: threshold,
              status: 'active'
            });
            
            // Show notification
            toast.warning("Low Stock Alert", { 
              description: `${item.product_name} is running low (${newLocationStock} left)` 
            });
          }
        } else if (newLocationStock === 0) {
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
              warehouse_id: selectedLocation,
              warehouse_name: selectedLocationData?.name,
              alert_type: 'out_of_stock',
              current_quantity: 0,
              threshold_quantity: threshold,
              status: 'active'
            });
            
            // Show critical notification
            toast.error("Out of Stock", { 
              description: `${item.product_name} is now out of stock!` 
            });
          }
        }
      }
    }
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
    queryClient.invalidateQueries({ queryKey: ['reorderSuggestions'] });

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

  // Determine if user can change sale type (admins can, role-specific users cannot)
  const canChangeSaleType = ['super_admin', 'org_admin', 'warehouse_manager'].includes(currentEmployee?.role) || 
    !currentEmployee?.assigned_location_id;
  
  // Determine if user can change location
  const canChangeLocation = ['super_admin', 'org_admin', 'warehouse_manager'].includes(currentEmployee?.role) || 
    !currentEmployee?.assigned_location_id;

  if (!user) {
    return <LoadingSpinner message="Loading Sales..." subtitle="Setting up your point of sale" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingProducts || !saleType) {
    return <LoadingSpinner message="Loading Sales..." subtitle="Setting up your point of sale" fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & POS"
        subtitle="Process sales and view transactions"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100 p-1 w-full">
          <TabsTrigger value="pos" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            POS
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Sale Type & Location Selection */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Sale Type</label>
                    <Select value={saleType} onValueChange={setSaleType} disabled={!canChangeSaleType}>
                      <SelectTrigger className={!canChangeSaleType ? "bg-gray-50" : ""}>
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
                    {!canChangeSaleType && (
                      <p className="text-xs text-gray-400 mt-1">Based on your role assignment</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                      {saleType === 'vehicle' ? 'Select Vehicle' : saleType === 'warehouse' ? 'Select Warehouse' : 'Select Store'}
                    </label>
                    <Select value={selectedLocation || ""} onValueChange={setSelectedLocation} disabled={!canChangeLocation}>
                      <SelectTrigger className={!selectedLocation ? "border-amber-300 bg-amber-50" : !canChangeLocation ? "bg-gray-50" : ""}>
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
                    {!canChangeLocation && currentEmployee?.assigned_location_name && (
                      <p className="text-xs text-gray-400 mt-1">Assigned to: {currentEmployee.assigned_location_name}</p>
                    )}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                  {filteredProducts.map((product) => {
                    const stockAtLocation = product.location_stock;
                    const isOutOfStock = stockAtLocation < 1;
                    
                    return (
                      <Card
                        key={product.id}
                        className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
                          isOutOfStock ? 'opacity-50' : ''
                        }`}
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-2 sm:p-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-14 sm:h-20 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-14 sm:h-20 bg-gradient-to-br from-[#1EB053]/20 to-[#1D5FC3]/20 rounded-lg mb-2 flex items-center justify-center">
                              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#1D5FC3]" />
                            </div>
                          )}
                          <h3 className="font-medium text-xs sm:text-sm truncate">{product.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[#1EB053] font-bold text-xs sm:text-sm">
                              Le {(saleType === 'warehouse' ? (product.wholesale_price || product.unit_price) : product.unit_price)?.toLocaleString()}
                            </p>
                            <Badge 
                              variant={stockAtLocation > 0 ? "secondary" : "destructive"} 
                              className="text-[10px] sm:text-xs"
                              title={selectedLocation ? "Stock at this location" : "Total stock"}
                            >
                              {stockAtLocation}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart */}
            <Card className="h-fit sticky top-20 lg:top-24">
              <CardHeader className="border-b p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                    <p className="text-sm">Cart is empty</p>
                    <p className="text-xs sm:text-sm">Click products to add</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
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
                    <Button
                      variant="outline"
                      className="w-full border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
                      onClick={() => setShowInvoice(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Invoice
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
                          <p className="text-xs text-gray-400">
                            {format(new Date(sale.created_date), 'dd MMM yyyy, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{sale.sale_type}</Badge>
                            <Badge variant="outline">{sale.payment_method}</Badge>
                            <Badge 
                              variant="outline" 
                              className={sale.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                            >
                              {sale.payment_status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewReceipt(sale)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Receipt
                            </DropdownMenuItem>
                            {sale.payment_status === 'paid' && (
                              <DropdownMenuItem onClick={() => handleViewReceipt(sale)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSale(sale)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Sale
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={showInvoice}
        onOpenChange={setShowInvoice}
        cart={cart}
        cartTotal={cartTotal}
        customer={selectedCustomer}
        organisation={organisation?.[0]}
        currentEmployee={currentEmployee}
        onInvoiceCreated={async (saleData) => {
          const fullSaleData = {
            ...saleData,
            organisation_id: orgId,
            employee_id: currentEmployee?.id,
            employee_name: currentEmployee?.full_name,
            vehicle_id: saleType === 'vehicle' ? selectedLocation : null,
            location: selectedLocationData?.name || ''
          };
          createSaleMutation.mutate(fullSaleData);
          setCart([]);
          setSelectedCustomer(null);
        }}
      />

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> Link Customer (Optional)
              </label>
              {selectedCustomer ? (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">{selectedCustomer.name}</p>
                    <p className="text-sm text-green-600">{selectedCustomer.phone || selectedCustomer.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-1 relative">
                  <Input
                    placeholder="Search customers by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && filteredCustomers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch("");
                            setCustomerName(customer.name);
                          }}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone} • {customer.segment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!selectedCustomer && (
              <div>
                <label className="text-sm font-medium">Or Enter Customer Name</label>
                <Input
                  placeholder="Walk-in customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

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