import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Search, User, Package, ShoppingCart, Truck, 
  FileText, X, ArrowRight, Clock, DollarSign, Users,
  Calendar, Building2, AlertCircle, Filter, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const entityConfig = {
  employees: { icon: User, color: "bg-blue-100 text-blue-600", page: "HR" },
  products: { icon: Package, color: "bg-green-100 text-green-600", page: "Inventory" },
  sales: { icon: ShoppingCart, color: "bg-purple-100 text-purple-600", page: "Sales" },
  trips: { icon: Truck, color: "bg-amber-100 text-amber-600", page: "Transport" },
  expenses: { icon: DollarSign, color: "bg-red-100 text-red-600", page: "Finance" },
  customers: { icon: Users, color: "bg-indigo-100 text-indigo-600", page: "CRM" },
  meetings: { icon: Calendar, color: "bg-pink-100 text-pink-600", page: "Calendar" },
  suppliers: { icon: Building2, color: "bg-orange-100 text-orange-600", page: "Suppliers" },
  vehicles: { icon: Truck, color: "bg-cyan-100 text-cyan-600", page: "Transport" },
};

export default function GlobalSearch({ orgId, isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { data: employees = [] } = useQuery({
    queryKey: ['searchEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['searchProducts', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['searchSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['searchTrips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['searchExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['searchCustomers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['searchMeetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 100),
    enabled: !!orgId,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['searchSuppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['searchVehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Enhanced filter results based on query
  const searchResults = query.length >= 2 ? {
    employees: employees.filter(e => 
      e.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      e.employee_code?.toLowerCase().includes(query.toLowerCase()) ||
      e.email?.toLowerCase().includes(query.toLowerCase()) ||
      e.phone?.toLowerCase().includes(query.toLowerCase()) ||
      e.position?.toLowerCase().includes(query.toLowerCase()) ||
      e.department?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    products: products.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.sku?.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    sales: sales.filter(s => 
      s.sale_number?.toLowerCase().includes(query.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
      s.customer_phone?.toLowerCase().includes(query.toLowerCase()) ||
      s.employee_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    trips: trips.filter(t => 
      t.vehicle_registration?.toLowerCase().includes(query.toLowerCase()) ||
      t.driver_name?.toLowerCase().includes(query.toLowerCase()) ||
      t.route_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    expenses: expenses.filter(e => 
      e.category?.toLowerCase().includes(query.toLowerCase()) ||
      e.description?.toLowerCase().includes(query.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(query.toLowerCase()) ||
      e.recorded_by_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    customers: customers.filter(c => 
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase()) ||
      c.company?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    meetings: meetings.filter(m => 
      m.title?.toLowerCase().includes(query.toLowerCase()) ||
      m.description?.toLowerCase().includes(query.toLowerCase()) ||
      m.organizer_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    suppliers: suppliers.filter(s => 
      s.name?.toLowerCase().includes(query.toLowerCase()) ||
      s.contact_person?.toLowerCase().includes(query.toLowerCase()) ||
      s.phone?.toLowerCase().includes(query.toLowerCase()) ||
      s.email?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    vehicles: vehicles.filter(v => 
      v.registration_number?.toLowerCase().includes(query.toLowerCase()) ||
      v.brand?.toLowerCase().includes(query.toLowerCase()) ||
      v.model?.toLowerCase().includes(query.toLowerCase()) ||
      v.assigned_driver_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
  } : { employees: [], products: [], sales: [], trips: [], expenses: [], customers: [], meetings: [], suppliers: [], vehicles: [] };

  // Filter by active filter
  const filteredResults = activeFilter === "all" 
    ? searchResults 
    : { [activeFilter]: searchResults[activeFilter] };

  const totalResults = Object.values(filteredResults).flat().length;
  const allTotalResults = Object.values(searchResults).flat().length;

  const saveRecentSearch = (item) => {
    const newSearches = [item, ...recentSearches.filter(s => s.id !== item.id)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const handleResultClick = (type, item) => {
    saveRecentSearch({ id: item.id, type, name: item.full_name || item.name || item.sale_number });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Sierra Leone Flag Stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything... (employees, products, sales, customers, expenses, meetings, etc.)"
            className="border-0 focus-visible:ring-0 text-base"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery("")}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        {query.length >= 2 && (
          <div className="px-4 pt-3 border-b">
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent p-0 gap-1">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
                  All ({allTotalResults})
                </TabsTrigger>
                {searchResults.employees.length > 0 && (
                  <TabsTrigger value="employees" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <User className="w-3 h-3 mr-1" />
                    Employees ({searchResults.employees.length})
                  </TabsTrigger>
                )}
                {searchResults.products.length > 0 && (
                  <TabsTrigger value="products" className="text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    <Package className="w-3 h-3 mr-1" />
                    Products ({searchResults.products.length})
                  </TabsTrigger>
                )}
                {searchResults.sales.length > 0 && (
                  <TabsTrigger value="sales" className="text-xs data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Sales ({searchResults.sales.length})
                  </TabsTrigger>
                )}
                {searchResults.customers.length > 0 && (
                  <TabsTrigger value="customers" className="text-xs data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                    <Users className="w-3 h-3 mr-1" />
                    Customers ({searchResults.customers.length})
                  </TabsTrigger>
                )}
                {searchResults.expenses.length > 0 && (
                  <TabsTrigger value="expenses" className="text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Expenses ({searchResults.expenses.length})
                  </TabsTrigger>
                )}
                {searchResults.trips.length > 0 && (
                  <TabsTrigger value="trips" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                    <Truck className="w-3 h-3 mr-1" />
                    Trips ({searchResults.trips.length})
                  </TabsTrigger>
                )}
                {searchResults.meetings.length > 0 && (
                  <TabsTrigger value="meetings" className="text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                    <Calendar className="w-3 h-3 mr-1" />
                    Meetings ({searchResults.meetings.length})
                  </TabsTrigger>
                )}
                {searchResults.suppliers.length > 0 && (
                  <TabsTrigger value="suppliers" className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <Building2 className="w-3 h-3 mr-1" />
                    Suppliers ({searchResults.suppliers.length})
                  </TabsTrigger>
                )}
                {searchResults.vehicles.length > 0 && (
                  <TabsTrigger value="vehicles" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                    <Truck className="w-3 h-3 mr-1" />
                    Vehicles ({searchResults.vehicles.length})
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent Searches
              </p>
              <div className="space-y-1">
                {recentSearches.map((item, idx) => {
                  const config = entityConfig[item.type] || entityConfig.products;
                  const Icon = config.icon;
                  return (
                    <Link
                      key={idx}
                      to={createPageUrl(config.page)}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.length >= 2 && (
            <>
              {totalResults === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No results found for "{query}"</p>
                  <p className="text-xs mt-2">Try searching by name, code, phone, or other details</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Employees */}
                  {filteredResults.employees?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">EMPLOYEES</p>
                      <div className="space-y-1">
                        {searchResults.employees.map((emp) => (
                          <Link
                            key={emp.id}
                            to={createPageUrl("HR")}
                            onClick={() => handleResultClick('employees', emp)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{emp.full_name}</p>
                              <p className="text-xs text-gray-500">{emp.position} • {emp.department}</p>
                            </div>
                            <Badge variant="outline">{emp.employee_code}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {filteredResults.products?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">PRODUCTS</p>
                      <div className="space-y-1">
                        {searchResults.products.map((product) => (
                          <Link
                            key={product.id}
                            to={createPageUrl("Inventory")}
                            onClick={() => handleResultClick('products', product)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                            </div>
                            <Badge className={product.stock_quantity <= product.low_stock_threshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              Stock: {product.stock_quantity}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales */}
                  {filteredResults.sales?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">SALES</p>
                      <div className="space-y-1">
                        {filteredResults.sales.map((sale) => (
                          <Link
                            key={sale.id}
                            to={createPageUrl("Sales")}
                            onClick={() => handleResultClick('sales', sale)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{sale.sale_number || `Sale #${sale.id.slice(-6)}`}</p>
                              <p className="text-xs text-gray-500">{sale.customer_name || 'Walk-in'} • {format(new Date(sale.created_date), 'MMM d, yyyy')}</p>
                            </div>
                            <span className="text-sm font-medium text-[#1EB053]">
                              Le {sale.total_amount?.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers */}
                  {filteredResults.customers?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">CUSTOMERS</p>
                      <div className="space-y-1">
                        {filteredResults.customers.map((customer) => (
                          <Link
                            key={customer.id}
                            to={createPageUrl("CRM")}
                            onClick={() => handleResultClick('customers', customer)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.phone} {customer.company && `• ${customer.company}`}</p>
                            </div>
                            <Badge variant="outline">{customer.type || 'Customer'}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expenses */}
                  {filteredResults.expenses?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">EXPENSES</p>
                      <div className="space-y-1">
                        {filteredResults.expenses.map((expense) => (
                          <Link
                            key={expense.id}
                            to={createPageUrl("Finance")}
                            onClick={() => handleResultClick('expenses', expense)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{expense.category}</p>
                              <p className="text-xs text-gray-500">{expense.description || expense.vendor} • {format(new Date(expense.date), 'MMM d, yyyy')}</p>
                            </div>
                            <span className="text-sm font-medium text-red-600">
                              Le {expense.amount?.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trips */}
                  {filteredResults.trips?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">TRIPS</p>
                      <div className="space-y-1">
                        {filteredResults.trips.map((trip) => (
                          <Link
                            key={trip.id}
                            to={createPageUrl("Transport")}
                            onClick={() => handleResultClick('trips', trip)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{trip.vehicle_registration}</p>
                              <p className="text-xs text-gray-500">{trip.route_name} • {trip.driver_name}</p>
                            </div>
                            <Badge className={trip.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                              {trip.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meetings */}
                  {filteredResults.meetings?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">MEETINGS</p>
                      <div className="space-y-1">
                        {filteredResults.meetings.map((meeting) => (
                          <Link
                            key={meeting.id}
                            to={createPageUrl("Calendar")}
                            onClick={() => handleResultClick('meetings', meeting)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{meeting.title}</p>
                              <p className="text-xs text-gray-500">{format(new Date(meeting.date), 'MMM d, yyyy')} at {meeting.start_time}</p>
                            </div>
                            <Badge variant="outline">{meeting.meeting_type}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suppliers */}
                  {filteredResults.suppliers?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">SUPPLIERS</p>
                      <div className="space-y-1">
                        {filteredResults.suppliers.map((supplier) => (
                          <Link
                            key={supplier.id}
                            to={createPageUrl("Suppliers")}
                            onClick={() => handleResultClick('suppliers', supplier)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{supplier.name}</p>
                              <p className="text-xs text-gray-500">{supplier.contact_person} • {supplier.phone}</p>
                            </div>
                            <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {supplier.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicles */}
                  {filteredResults.vehicles?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">VEHICLES</p>
                      <div className="space-y-1">
                        {filteredResults.vehicles.map((vehicle) => (
                          <Link
                            key={vehicle.id}
                            to={createPageUrl("Transport")}
                            onClick={() => handleResultClick('vehicles', vehicle)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{vehicle.registration_number}</p>
                              <p className="text-xs text-gray-500">{vehicle.brand} {vehicle.model} • {vehicle.assigned_driver_name || 'Unassigned'}</p>
                            </div>
                            <Badge className={vehicle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {vehicle.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="p-3 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">ESC</kbd> to close</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Smart search across all modules
              </span>
            </div>
            <span className="font-medium text-gray-700">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}