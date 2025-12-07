import { Filter, Package, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InventoryFilters({ filters, onFiltersChange, categories, locations }) {
  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.stockStatus !== 'all' || 
    filters.location !== 'all';

  return (
    <div className="space-y-3">
      {/* Filter Selects */}
      <div className="flex flex-wrap gap-2">
        <Select 
          value={filters.category} 
          onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.stockStatus} 
          onValueChange={(value) => onFiltersChange({ ...filters, stockStatus: value })}
        >
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <Package className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.location} 
          onValueChange={(value) => onFiltersChange({ ...filters, location: value })}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ category: 'all', stockStatus: 'all', location: 'all' })}
            className="h-9 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Active:</span>
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.category}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, category: 'all' })}
              />
            </Badge>
          )}
          {filters.stockStatus !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.stockStatus.replace('_', ' ')}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, stockStatus: 'all' })}
              />
            </Badge>
          )}
          {filters.location !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {locations.find(l => l.id === filters.location)?.name}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, location: 'all' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}