import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Package, MapPin, Warehouse, Truck, X, ArrowUpDown } from "lucide-react";

export default function InventoryFilters({
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  locationFilter,
  setLocationFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categoryList,
  allLocations,
  searchTerm,
  setSearchTerm,
  totalProducts,
  filteredCount
}) {
  const hasActiveFilters = searchTerm || categoryFilter !== "all" || stockFilter !== "all" || locationFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 h-9">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryList.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-36 h-9">
            <Package className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-40 h-9">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {allLocations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>
                <div className="flex items-center gap-2">
                  {loc.type === 'warehouse' ? <Warehouse className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                  <span className="truncate max-w-[150px]">{loc.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32 h-9">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="value">Value</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-9 px-3"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setStockFilter("all");
              setLocationFilter("all");
            }}
            className="h-9 text-red-600"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Active:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Search: {searchTerm}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {categoryFilter}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setCategoryFilter("all")} />
            </Badge>
          )}
          {stockFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {stockFilter.replace('_', ' ')}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setStockFilter("all")} />
            </Badge>
          )}
          {locationFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {allLocations.find(l => l.id === locationFilter)?.name}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setLocationFilter("all")} />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Showing <strong>{filteredCount}</strong> of <strong>{totalProducts}</strong> products</span>
        <span>Sorted by <strong>{sortBy}</strong> ({sortOrder === 'asc' ? 'ascending' : 'descending'})</span>
      </div>
    </div>
  );
}