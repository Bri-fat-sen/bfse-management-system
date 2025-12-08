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
  FileText, X, ArrowRight, Clock, Building2, Users, DollarSign,
  Calendar, Filter, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const entityConfig = {
  employees: { icon: User, color: "bg-blue-100 text-blue-600", page: "HR", label: "Employees" },
  products: { icon: Package, color: "bg-green-100 text-green-600", page: "Inventory", label: "Products" },
  sales: { icon: ShoppingCart, color: "bg-purple-100 text-purple-600", page: "Sales", label: "Sales" },
  trips: { icon: Truck, color: "bg-amber-100 text-amber-600", page: "Transport", label: "Trips" },
  customers: { icon: Users, color: "bg-pink-100 text-pink-600", page: "CRM", label: "Customers" },
  suppliers: { icon: Building2, color: "bg-indigo-100 text-indigo-600", page: "Suppliers", label: "Suppliers" },
  expenses: { icon: DollarSign, color: "bg-red-100 text-red-600", page: "Finance", label: "Expenses" },
  meetings: { icon: Calendar, color: "bg-cyan-100 text-cyan-600", page: "Calendar", label: "Meetings" },
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
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['searchTrips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['searchCustomers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['searchSuppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['searchExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['searchMeetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 50),
    enabled: !!orgId,
  });

  // Advanced filter results based on query
  const searchResults = query.length >= 2 ? {
    employees: employees.filter(e => 
      e.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      e.employee_code?.toLowerCase().includes(query.toLowerCase()) ||
      e.email?.toLowerCase().includes(query.toLowerCase()) ||
      e.phone?.toLowerCase().includes(query.toLowerCase()) ||
      e.department?.toLowerCase().includes(query.toLowerCase()) ||
      e.position?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "employees" ? 15 : 5),
    products: products.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.sku?.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "products" ? 15 : 5),
    sales: sales.filter(s => 
      s.sale_number?.toLowerCase().includes(query.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
      s.customer_phone?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "sales" ? 15 : 5),
    trips: trips.filter(t =>
      t.vehicle_registration?.toLowerCase().includes(query.toLowerCase()) ||
      t.driver_name?.toLowerCase().includes(query.toLowerCase()) ||
      t.route_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "trips" ? 15 : 5),
    customers: customers.filter(c =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase()) ||
      c.company?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "customers" ? 15 : 5),
    suppliers: suppliers.filter(s =>
      s.name?.toLowerCase().includes(query.toLowerCase()) ||
      s.contact_person?.toLowerCase().includes(query.toLowerCase()) ||
      s.email?.toLowerCase().includes(query.toLowerCase()) ||
      s.phone?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "suppliers" ? 15 : 5),
    expenses: expenses.filter(e =>
      e.description?.toLowerCase().includes(query.toLowerCase()) ||
      e.category?.toLowerCase().includes(query.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "expenses" ? 15 : 5),
    meetings: meetings.filter(m =>
      m.title?.toLowerCase().includes(query.toLowerCase()) ||
      m.description?.toLowerCase().includes(query.toLowerCase()) ||
      m.organizer_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, activeFilter === "meetings" ? 15 : 5),
  } : { employees: [], products: [], sales: [], trips: [], customers: [], suppliers: [], expenses: [], meetings: [] };

  // Filter by active tab
  const filteredResults = activeFilter === "all" 
    ? searchResults 
    : { [activeFilter]: searchResults[activeFilter] };

  const totalResults = Object.values(filteredResults).flat().length;

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
            placeholder="Search anything: employees, products, sales, customers, suppliers..."
            className="border-0 focus-visible:ring-0 text-lg"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery("")}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        {query.length >= 2 && (
          <div className="px-4 py-2 border-b bg-gray-50">
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
              <TabsList className="w-full flex-wrap h-auto bg-transparent justify-start gap-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                  All ({Object.values(searchResults).flat().length})
                </TabsTrigger>
                {Object.entries(searchResults).map(([key, items]) => items.length > 0 && (
                  <TabsTrigger key={key} value={key} className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                    {entityConfig[key]?.label || key} ({items.length})
                  </TabsTrigger>
                ))}
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
                  <p className="text-xs mt-1">Try different keywords or check your spelling</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Employees */}
                  {filteredResults.employees?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <User className="w-3 h-3" /> EMPLOYEES ({filteredResults.employees.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.employees.map((emp) => (
                          <Link
                            key={emp.id}
                            to={createPageUrl("HR")}
                            onClick={() => handleResultClick('employees', emp)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{emp.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{emp.position} • {emp.department}</p>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">{emp.employee_code}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {filteredResults.products?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Package className="w-3 h-3" /> PRODUCTS ({filteredResults.products.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.products.map((product) => (
                          <Link
                            key={product.id}
                            to={createPageUrl("Inventory")}
                            onClick={() => handleResultClick('products', product)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {product.category} • SKU: {product.sku || 'N/A'}
                              </p>
                            </div>
                            <Badge className={`flex-shrink-0 ${product.stock_quantity <= product.low_stock_threshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {product.stock_quantity}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales */}
                  {filteredResults.sales?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" /> SALES ({filteredResults.sales.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.sales.map((sale) => (
                          <Link
                            key={sale.id}
                            to={createPageUrl("Sales")}
                            onClick={() => handleResultClick('sales', sale)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{sale.sale_number || `Sale #${sale.id.slice(-6)}`}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {sale.customer_name || 'Walk-in'} • {format(new Date(sale.created_date), 'MMM d')}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-[#1EB053] flex-shrink-0">
                              Le {sale.total_amount?.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trips */}
                  {filteredResults.trips?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Truck className="w-3 h-3" /> TRIPS ({filteredResults.trips.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.trips.map((trip) => (
                          <Link
                            key={trip.id}
                            to={createPageUrl("Transport")}
                            onClick={() => handleResultClick('trips', trip)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{trip.route_name || 'Trip'}</p>
                              <p className="text-xs text-gray-500 truncate">{trip.driver_name} • {trip.vehicle_registration}</p>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">{trip.status}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers */}
                  {filteredResults.customers?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Users className="w-3 h-3" /> CUSTOMERS ({filteredResults.customers.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.customers.map((customer) => (
                          <Link
                            key={customer.id}
                            to={createPageUrl("CRM")}
                            onClick={() => handleResultClick('customers', customer)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{customer.name}</p>
                              <p className="text-xs text-gray-500 truncate">{customer.phone} • {customer.email}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suppliers */}
                  {filteredResults.suppliers?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Building2 className="w-3 h-3" /> SUPPLIERS ({filteredResults.suppliers.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.suppliers.map((supplier) => (
                          <Link
                            key={supplier.id}
                            to={createPageUrl("Suppliers")}
                            onClick={() => handleResultClick('suppliers', supplier)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{supplier.name}</p>
                              <p className="text-xs text-gray-500 truncate">{supplier.contact_person}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expenses */}
                  {filteredResults.expenses?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> EXPENSES ({filteredResults.expenses.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.expenses.map((expense) => (
                          <Link
                            key={expense.id}
                            to={createPageUrl("Finance")}
                            onClick={() => handleResultClick('expenses', expense)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{expense.description}</p>
                              <p className="text-xs text-gray-500 truncate">{expense.category} • {expense.vendor}</p>
                            </div>
                            <span className="text-sm font-medium text-red-600 flex-shrink-0">
                              Le {expense.amount?.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meetings */}
                  {filteredResults.meetings?.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> MEETINGS ({filteredResults.meetings.length})
                      </p>
                      <div className="space-y-1">
                        {filteredResults.meetings.map((meeting) => (
                          <Link
                            key={meeting.id}
                            to={createPageUrl("Calendar")}
                            onClick={() => handleResultClick('meetings', meeting)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{meeting.title}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {meeting.organizer_name} • {format(new Date(meeting.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">{meeting.status}</Badge>
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
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">ESC</kbd> to close
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">↑↓</kbd> navigate
            </span>
          </div>
          <span className="font-medium">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
        </div>
        
        {/* Sierra Leone Flag Stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}