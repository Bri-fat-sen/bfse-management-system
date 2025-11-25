import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Search, User, Package, ShoppingCart, Truck, 
  FileText, X, ArrowRight, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const entityConfig = {
  employees: { icon: User, color: "bg-blue-100 text-blue-600", page: "HR" },
  products: { icon: Package, color: "bg-green-100 text-green-600", page: "Inventory" },
  sales: { icon: ShoppingCart, color: "bg-purple-100 text-purple-600", page: "Sales" },
  trips: { icon: Truck, color: "bg-amber-100 text-amber-600", page: "Transport" },
};

export default function GlobalSearch({ orgId, isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
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

  // Filter results based on query
  const searchResults = query.length >= 2 ? {
    employees: employees.filter(e => 
      e.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      e.employee_code?.toLowerCase().includes(query.toLowerCase()) ||
      e.email?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    products: products.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.sku?.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    sales: sales.filter(s => 
      s.sale_number?.toLowerCase().includes(query.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
  } : { employees: [], products: [], sales: [] };

  const totalResults = Object.values(searchResults).flat().length;

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
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, products, sales..."
            className="border-0 focus-visible:ring-0 text-lg"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery("")}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

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
                </div>
              ) : (
                <div className="divide-y">
                  {/* Employees */}
                  {searchResults.employees.length > 0 && (
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
                  {searchResults.products.length > 0 && (
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
                  {searchResults.sales.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">SALES</p>
                      <div className="space-y-1">
                        {searchResults.sales.map((sale) => (
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
                              <p className="text-xs text-gray-500">{sale.customer_name || 'Walk-in'}</p>
                            </div>
                            <span className="text-sm font-medium text-[#1EB053]">
                              SLE {sale.total_amount?.toLocaleString()}
                            </span>
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
          <span>Press ESC to close</span>
          <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}