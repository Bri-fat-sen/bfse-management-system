import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeNumber, safeInt, formatNumber, calculateLineTotal, calculateSaleTotals } from "@/components/utils/calculations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  FileText,
  Upload,
  Printer
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
import { notifyAdmins } from "@/components/notifications/notificationHelper";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import ReceiptDialog from "@/components/sales/ReceiptDialog";
import InvoiceDialog from "@/components/sales/InvoiceDialog";
import DocumentUploadExtractor from "@/components/finance/DocumentUploadExtractor";
import PrintableFormsDownload from "@/components/finance/PrintableFormsDownload";

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
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFormsDialog, setShowFormsDialog] = useState(false);
  const [selectedSaleIds, setSelectedSaleIds] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch stock levels for the selected location
  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId, selectedLocation],
    queryFn: () => base44.entities.StockLevel.filter({ 
      organisation_id: orgId, 
      warehouse_id: selectedLocation 
    }),
    enabled: !!orgId && !!selectedLocation,
    staleTime: 0,
    refetchOnWindowFocus: true,
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
        return warehouseLocations.map(w => ({ id: w.id, name: w.name, type: 'warehouse' }));
      case 'retail':
      default:
        const retailLocations = warehouses.filter(w => 
          !w.allowed_sale_types || w.allowed_sale_types.length === 0 || w.allowed_sale_types.includes('retail')
        );
        return retailLocations.map(w => ({ id: w.id, name: w.name, type: 'store' }));
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
  const prevLocationRef = React.useRef(selectedLocation);
  React.useEffect(() => {
    if (prevLocationRef.current && prevLocationRef.current !== selectedLocation && cart.length > 0) {
      setCart([]);
    }
    prevLocationRef.current = selectedLocation;
  }, [selectedLocation, cart.length]);

  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      // Create the sale first
      const sale = await base44.entities.Sale.create(saleData);
      
      // Notify admins about the sale
      if (employees.length > 0) {
        await notifyAdmins({
          orgId,
          employees,
          type: 'system',
          title: 'New Sale Completed',
          message: `${currentEmployee?.full_name} completed a ${saleData.sale_type} sale for Le ${saleData.total_amount?.toLocaleString()}`,
          priority: 'normal'
        }).catch(err => console.log('Notification failed:', err));
      }
      
      // Update stock quantities for each item
      for (const item of saleData.items) {
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
          const newTotalStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
          await base44.entities.Product.update(item.product_id, {
            stock_quantity: newTotalStock
          });

          // Create stock movement record
          await base44.entities.StockMovement.create({
            organisation_id: orgId,
            product_id: item.product_id,
            product_name: item.product_name,
            warehouse_id: saleData.selectedLocation,
            warehouse_name: saleData.locationName,
            movement_type: "out",
            quantity: item.quantity,
            previous_stock: currentLocationStock,
            new_stock: newLocationStock,
            reference_type: "sale",
            reference_id: saleData.sale_number,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            notes: `${saleData.sale_type} sale to ${saleData.customer_name || 'Walk-in Customer'} from ${saleData.locationName}`
          });

          // Create reorder suggestion if needed
          const reorderPoint = product.reorder_point || 10;
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

          // Create stock alert if needed
          const threshold = product.reorder_point || product.low_stock_threshold || 10;
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
                warehouse_id: saleData.selectedLocation,
                warehouse_name: saleData.locationName,
                alert_type: 'low_stock',
                current_quantity: newLocationStock,
                threshold_quantity: threshold,
                status: 'active'
              });
              
              // Notify warehouse managers
              if (employees.length > 0) {
                await notifyAdmins({
                  orgId,
                  employees,
                  type: 'low_stock',
                  title: 'Low Stock Alert',
                  message: `${item.product_name} is running low at ${saleData.locationName} - Only ${newLocationStock} remaining`,
                  priority: 'high',
                  sendEmail: true
                }).catch(err => console.log('Stock alert notification failed:', err));
              }
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
                warehouse_id: saleData.selectedLocation,
                warehouse_name: saleData.locationName,
                alert_type: 'out_of_stock',
                current_quantity: 0,
                threshold_quantity: threshold,
                status: 'active'
              });
              
              // Notify warehouse managers - URGENT
              if (employees.length > 0) {
                await notifyAdmins({
                  orgId,
                  employees,
                  type: 'alert',
                  title: 'OUT OF STOCK - Urgent',
                  message: `${item.product_name} is OUT OF STOCK at ${saleData.locationName}`,
                  priority: 'urgent',
                  sendEmail: true
                }).catch(err => console.log('Out of stock notification failed:', err));
              }
            }
          }
        }
      }
      
      return sale;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales', orgId] });
      queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels', orgId, selectedLocation] });
      queryClient.invalidateQueries({ queryKey: ['reorderSuggestions', orgId] });
      setLastSale(data);
      setCart([]);
      setShowCheckout(false);
      setShowReceipt(true);
      setCustomerName("");
      toast.success("Sale completed successfully");

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
    onError: (error) => {
      console.error('Create sale error:', error);
      toast.error("Failed to complete sale");
    }
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (sale) => {
      // Restore stock for each item
      if (sale.items && sale.items.length > 0) {
        const locationId = sale.vehicle_id || sale.warehouse_id;
        
        for (const item of sale.items) {
          const product = await base44.entities.Product.filter({ id: item.product_id });
          const productData = product?.[0];
          
          if (productData) {
            // Find stock level at the location
            const stockLevel = await base44.entities.StockLevel.filter({
              organisation_id: orgId,
              product_id: item.product_id,
              warehouse_id: locationId
            });
            
            const existingStock = stockLevel?.[0];
            const currentLocationStock = existingStock?.quantity || 0;
            const newLocationStock = currentLocationStock + item.quantity;
            
            // Update stock level at location
            if (existingStock) {
              await base44.entities.StockLevel.update(existingStock.id, {
                quantity: newLocationStock,
                available_quantity: newLocationStock
              });
            } else {
              // Create stock level if it doesn't exist
              await base44.entities.StockLevel.create({
                organisation_id: orgId,
                product_id: item.product_id,
                product_name: item.product_name,
                warehouse_id: locationId,
                warehouse_name: sale.location,
                quantity: item.quantity,
                available_quantity: item.quantity
              });
            }
            
            // Update product total stock
            const newTotalStock = (productData.stock_quantity || 0) + item.quantity;
            await base44.entities.Product.update(item.product_id, {
              stock_quantity: newTotalStock
            });
            
            // Create stock movement record
            await base44.entities.StockMovement.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: locationId,
              warehouse_name: sale.location,
              movement_type: "in",
              quantity: item.quantity,
              previous_stock: currentLocationStock,
              new_stock: newLocationStock,
              reference_type: "manual",
              reference_id: sale.sale_number,
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name,
              notes: `Stock returned from deleted sale ${sale.sale_number}`
            });
          }
        }
      }
      
      // Delete the sale
      await base44.entities.Sale.delete(sale.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', orgId] });
      queryClient.invalidateQueries({ queryKey: ['products', orgId] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels', orgId] });
      toast.success("Sale deleted and stock restored successfully");
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      console.error('Delete sale error:', error);
      toast.error("Failed to delete sale");
    }
  });

  const bulkDeleteSalesMutation = useMutation({
    mutationFn: async (saleIds) => {
      const salesToDelete = sales.filter(s => saleIds.includes(s.id));
      
      // Restore stock for each sale
      for (const sale of salesToDelete) {
        if (sale.items && sale.items.length > 0) {
          const locationId = sale.vehicle_id || sale.warehouse_id;
          
          for (const item of sale.items) {
            const product = await base44.entities.Product.filter({ id: item.product_id });
            const productData = product?.[0];
            
            if (productData) {
              const stockLevel = await base44.entities.StockLevel.filter({
                organisation_id: orgId,
                product_id: item.product_id,
                warehouse_id: locationId
              });
              
              const existingStock = stockLevel?.[0];
              const currentLocationStock = existingStock?.quantity || 0;
              const newLocationStock = currentLocationStock + item.quantity;
              
              if (existingStock) {
                await base44.entities.StockLevel.update(existingStock.id, {
                  quantity: newLocationStock,
                  available_quantity: newLocationStock
                });
              }
              
              const newTotalStock = (productData.stock_quantity || 0) + item.quantity;
              await base44.entities.Product.update(item.product_id, {
                stock_quantity: newTotalStock
              });
            }
          }
        }
      }
      
      // Delete all sales
      await Promise.all(saleIds.map(id => base44.entities.Sale.delete(id)));
    },
    onSuccess: (_, saleIds) => {
      queryClient.invalidateQueries({ queryKey: ['sales', orgId] });
      toast.success(`${saleIds.length} sales deleted successfully`);
      setSelectedSaleIds([]);
      setShowBulkDeleteDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to delete sales");
    }
  });

  const handleViewReceipt = (sale) => {
    setLastSale(sale);
    setShowReceipt(true);
  };

  const handleDeleteSale = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteConfirm(true);
  };

  // Filter products and add location-specific stock
  const filteredProducts = React.useMemo(() => {
    return (products || [])
      .filter(p => p && (
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
      .map(p => {
        // Check if we have a specific stock level for this product at this location
        const locationStock = locationStockMap[p.id];
        
        // Use location stock if available, otherwise fall back to product stock
        const stockValue = locationStock !== undefined ? locationStock : (p.stock_quantity ?? 0);
        
        return {
          ...p,
          location_stock: stockValue
        };
      });
  }, [products, searchTerm, selectedLocation, locationStockMap]);

  const addToCart = (product) => {
    if (!selectedLocation) {
      toast.error(`Please select a ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'} first`);
      return;
    }

    const availableStock = product.location_stock ?? product.stock_quantity ?? 0;
    const existing = cart.find(item => item.product_id === product.id);
    
    if (existing) {
      if (existing.quantity >= availableStock) {
        toast.error(`Only ${availableStock} available at this location`);
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      if (availableStock < 1) {
        toast.error("This product is not available at this location");
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
          toast.error(`Only ${availableStock} available at this location`);
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const setQuantityDirect = (productId, value) => {
    const product = filteredProducts.find(p => p.id === productId);
    const availableStock = product?.location_stock ?? 0;
    
    // Allow empty value temporarily while typing
    if (value === '') {
      setCart(cart.map(item => 
        item.product_id === productId ? { ...item, quantity: '' } : item
      ));
      return;
    }
    
    const qty = parseInt(value) || 1;
    
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, Math.min(qty, availableStock));
        if (qty > availableStock) {
          toast.error(`Only ${availableStock} available at this location`);
        }
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const validateQuantity = (productId) => {
    setCart(cart.map(item => {
      if (item.product_id === productId && (item.quantity === '' || item.quantity < 1)) {
        return { ...item, quantity: 1, total: item.unit_price };
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
      toast.error(`Please select a ${saleType === 'vehicle' ? 'vehicle' : saleType === 'warehouse' ? 'warehouse' : 'store'} for this sale`);
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
      warehouse_id: saleType !== 'vehicle' ? selectedLocation : null,
      location: selectedLocationData?.name || '',
      // Pass these for stock updates
      selectedLocation: selectedLocation,
      locationName: selectedLocationData?.name
    };
    
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

      queryClient.invalidateQueries({ queryKey: ['customers', orgId] });
    }

    setSelectedCustomer(null);
    setCustomerSearch("");
    
    createSaleMutation.mutate(saleData);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
              <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
              Point of Sale
            </h1>
            <p className="text-sm text-gray-500 mt-1">Process sales and manage transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFormsDialog(true)}
            variant="outline"
            className="gap-2 border-gray-300 hover:border-[#0072C6] hover:bg-[#0072C6]/5"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Forms</span>
          </Button>
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative mb-6">
          <TabsList className="bg-white border-2 border-gray-200 p-1.5 w-full rounded-xl shadow-sm">
            <TabsTrigger 
              value="pos" 
              className="flex-1 text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Point of Sale
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Sales History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Sale Type & Location Selection */}
              <Card className="border-t-4 border-t-[#1EB053] shadow-lg">
                <CardContent className="p-3 sm:p-4">
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
                            Warehouse Sales
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
                  <div className="mt-3 p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border border-[#1EB053]/30 rounded-xl flex items-center gap-2 text-sm">
                    <div className="p-2 bg-white rounded-lg">
                      {saleType === 'vehicle' && <Truck className="w-4 h-4 text-purple-600" />}
                      {saleType === 'warehouse' && <Warehouse className="w-4 h-4 text-blue-600" />}
                      {saleType === 'retail' && <Store className="w-4 h-4 text-green-600" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Selling from</p>
                      <p className="font-bold text-gray-900">{selectedLocationData.name}</p>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>

              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                  <Search className="w-4 h-4 text-[#1EB053]" />
                </div>
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 h-12 border-2 border-gray-200 focus:border-[#1EB053] rounded-xl shadow-sm"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {filteredProducts.map((product) => {
                    const stockAtLocation = product.location_stock;
                    const isOutOfStock = stockAtLocation < 1;
                    const isLowStock = stockAtLocation > 0 && stockAtLocation <= (product.low_stock_threshold || 10);
                    
                    return (
                      <Card
                        key={product.id}
                        className={cn(
                          "group cursor-pointer transition-all hover:shadow-xl border-2",
                          isOutOfStock ? 'opacity-50 border-red-200 bg-red-50/30' : 
                          isLowStock ? 'border-amber-200 bg-amber-50/30' : 
                          'border-gray-200 hover:border-[#1EB053] hover:-translate-y-1'
                        )}
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="relative mb-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-16 sm:h-24 object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-16 sm:h-24 bg-gradient-to-br from-[#1EB053]/20 via-white to-[#0072C6]/20 rounded-xl flex items-center justify-center group-hover:from-[#1EB053]/30 group-hover:to-[#0072C6]/30 transition-all">
                                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#0072C6]" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge 
                                className={cn(
                                  "text-[10px] font-bold shadow-lg",
                                  isOutOfStock ? "bg-red-500" : 
                                  isLowStock ? "bg-amber-500" : 
                                  "bg-gradient-to-r from-[#1EB053] to-[#0e7f3d]"
                                )}
                                title={selectedLocation ? "Stock at this location" : "Total stock"}
                              >
                                {stockAtLocation}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="font-semibold text-xs sm:text-sm truncate text-gray-900 mb-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Price</p>
                              <p className="font-bold text-sm sm:text-base bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent">
                                Le {(saleType === 'warehouse' ? (product.wholesale_price || product.unit_price) : product.unit_price)?.toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart */}
            <Card className="h-fit sticky top-20 lg:top-24 border-t-4 border-t-[#0072C6] shadow-xl">
              <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
                      <ShoppingCart className="w-5 h-5 text-[#0072C6]" />
                    </div>
                    <div>
                      <span className="block text-gray-900">Shopping Cart</span>
                      <span className="text-xs text-gray-500 font-normal">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  </CardTitle>
                  {cart.length > 0 && (
                    <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                      {cart.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-full blur-xl" />
                      <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Your cart is empty</p>
                    <p className="text-xs text-gray-500">Add products to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-72 overflow-y-auto mb-4 pr-1">
                      {cart.map((item) => (
                        <div key={item.product_id} className="group p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Le {item.unit_price.toLocaleString()} × {item.quantity}</p>
                              <p className="text-sm font-bold text-[#1EB053] mt-1">Le {item.total.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-gray-300"
                                onClick={() => updateQuantity(item.product_id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => setQuantityDirect(item.product_id, e.target.value)}
                                onBlur={() => validateQuantity(item.product_id)}
                                className="w-14 h-8 text-center font-bold text-sm p-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-gray-300"
                                onClick={() => updateQuantity(item.product_id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200">
                      <div className="p-4 bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5 rounded-xl border border-[#1EB053]/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Subtotal</span>
                          <span className="text-sm font-semibold">Le {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-base font-bold text-gray-900">Total</span>
                          <span className="text-xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0e7f3d] bg-clip-text text-transparent">
                            Le {cartTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all text-base font-semibold"
                        onClick={() => setShowCheckout(true)}
                      >
                        <Receipt className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-11 border-2 border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/5 font-semibold"
                        onClick={() => setShowInvoice(true)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Invoice
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sales</CardTitle>
                {selectedSaleIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedSaleIds.length} Selected
                  </Button>
                )}
              </div>
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
                    <div key={sale.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 ${selectedSaleIds.includes(sale.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <input
                          type="checkbox"
                          checked={selectedSaleIds.includes(sale.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedSaleIds(prev =>
                              prev.includes(sale.id) ? prev.filter(id => id !== sale.id) : [...prev, sale.id]
                            );
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
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
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Sale"
        description={`Are you sure you want to delete sale ${saleToDelete?.sale_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (saleToDelete) {
            deleteSaleMutation.mutate(saleToDelete);
            setSaleToDelete(null);
          }
        }}
        isLoading={deleteSaleMutation.isPending}
      />

      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Sales"
        description={`Are you sure you want to delete ${selectedSaleIds.length} sale(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={() => bulkDeleteSalesMutation.mutate(selectedSaleIds)}
        isLoading={bulkDeleteSalesMutation.isPending}
      />

      {/* Document Upload Dialog */}
      <DocumentUploadExtractor
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        type="auto"
        orgId={orgId}
        currentEmployee={currentEmployee}
        products={products}
        customers={customers}
        warehouses={warehouses}
        vehicles={vehicles}
        saleTypes={['retail', 'warehouse', 'vehicle']}
        selectedLocation={selectedLocation}
        selectedSaleType={saleType}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['sales', orgId] });
          queryClient.invalidateQueries({ queryKey: ['customers', orgId] });
        }}
      />

      {/* Printable Forms Dialog */}
      <PrintableFormsDownload
        open={showFormsDialog}
        onOpenChange={setShowFormsDialog}
        organisation={organisation?.[0]}
        filterForms={['revenue_retail_sales', 'revenue_warehouse_sales', 'revenue_vehicle_sales']}
      />
    </div>
  );
}