import React, { useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import {
  Filter,
  Calendar,
  Users,
  Tag,
  CreditCard,
  ChevronDown,
  X,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DATE_PRESETS = [
  { label: 'Today', value: 'today', getDates: () => ({ start: format(new Date(), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Yesterday', value: 'yesterday', getDates: () => ({ start: format(subDays(new Date(), 1), 'yyyy-MM-dd'), end: format(subDays(new Date(), 1), 'yyyy-MM-dd') }) },
  { label: 'Last 7 Days', value: 'week', getDates: () => ({ start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 30 Days', value: 'month', getDates: () => ({ start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This Month', value: 'this_month', getDates: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
  { label: 'Last Month', value: 'last_month', getDates: () => ({ start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') }) },
  { label: 'Last 3 Months', value: 'quarter', getDates: () => ({ start: format(subMonths(new Date(), 3), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This Year', value: 'year', getDates: () => ({ start: format(startOfYear(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Custom', value: 'custom', getDates: null },
];

const CATEGORIES = ['fuel', 'maintenance', 'utilities', 'supplies', 'rent', 'salaries', 'transport', 'marketing', 'insurance', 'petty_cash', 'other'];
const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'credit', 'bank_transfer'];
const SALE_TYPES = ['retail', 'wholesale', 'vehicle'];
const STATUSES = ['paid', 'pending', 'partial', 'approved', 'rejected', 'completed', 'cancelled'];

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  employees = [],
  showEmployeeFilter = true,
  showCategoryFilter = true,
  showPaymentFilter = true,
  showSaleTypeFilter = false,
  showStatusFilter = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFilterCount = [
    filters.employee_ids?.length > 0,
    filters.categories?.length > 0,
    filters.payment_methods?.length > 0,
    filters.sale_types?.length > 0,
    filters.statuses?.length > 0,
  ].filter(Boolean).length;

  const handleDatePreset = (preset) => {
    if (preset.getDates) {
      const { start, end } = preset.getDates();
      onFiltersChange({ ...filters, date_range: preset.value, start_date: start, end_date: end });
    } else {
      onFiltersChange({ ...filters, date_range: 'custom' });
    }
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value) 
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      date_range: 'month',
      start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      employee_ids: [],
      categories: [],
      payment_methods: [],
      sale_types: [],
      statuses: []
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Presets */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {DATE_PRESETS.slice(0, 5).map((preset) => (
                <Button
                  key={preset.value}
                  variant={filters.date_range === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDatePreset(preset)}
                  className={filters.date_range === preset.value ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
                >
                  {preset.label}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    More <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  {DATE_PRESETS.slice(5).map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleDatePreset(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.date_range === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => onFiltersChange({ ...filters, start_date: e.target.value })}
                className="w-36 h-8"
              />
              <span className="text-gray-500 text-sm">to</span>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => onFiltersChange({ ...filters, end_date: e.target.value })}
                className="w-36 h-8"
              />
            </div>
          )}

          {/* Advanced Filters Button */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-[#1EB053]">{activeFilterCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Advanced Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Employee Filter */}
                {showEmployeeFilter && employees.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" /> Employees
                    </Label>
                    <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-2">
                      {employees.map(emp => (
                        <div key={emp.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`emp-${emp.id}`}
                            checked={filters.employee_ids?.includes(emp.id)}
                            onCheckedChange={() => toggleArrayFilter('employee_ids', emp.id)}
                          />
                          <label htmlFor={`emp-${emp.id}`} className="text-sm cursor-pointer">
                            {emp.full_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                {showCategoryFilter && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4" /> Categories
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map(cat => (
                        <Badge
                          key={cat}
                          variant={filters.categories?.includes(cat) ? "default" : "outline"}
                          className={`cursor-pointer ${filters.categories?.includes(cat) ? 'bg-[#1EB053]' : ''}`}
                          onClick={() => toggleArrayFilter('categories', cat)}
                        >
                          {cat.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Method Filter */}
                {showPaymentFilter && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" /> Payment Methods
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {PAYMENT_METHODS.map(method => (
                        <Badge
                          key={method}
                          variant={filters.payment_methods?.includes(method) ? "default" : "outline"}
                          className={`cursor-pointer ${filters.payment_methods?.includes(method) ? 'bg-[#0072C6]' : ''}`}
                          onClick={() => toggleArrayFilter('payment_methods', method)}
                        >
                          {method.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sale Type Filter */}
                {showSaleTypeFilter && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sale Types</Label>
                    <div className="flex flex-wrap gap-1">
                      {SALE_TYPES.map(type => (
                        <Badge
                          key={type}
                          variant={filters.sale_types?.includes(type) ? "default" : "outline"}
                          className={`cursor-pointer ${filters.sale_types?.includes(type) ? 'bg-[#D4AF37]' : ''}`}
                          onClick={() => toggleArrayFilter('sale_types', type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Filter */}
                {showStatusFilter && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map(status => (
                        <Badge
                          key={status}
                          variant={filters.statuses?.includes(status) ? "default" : "outline"}
                          className={`cursor-pointer ${filters.statuses?.includes(status) ? 'bg-[#0F1F3C]' : ''}`}
                          onClick={() => toggleArrayFilter('statuses', status)}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-[#1EB053] hover:bg-[#178f43]" 
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {filters.employee_ids?.map(id => {
              const emp = employees.find(e => e.id === id);
              return emp && (
                <Badge key={id} variant="secondary" className="gap-1">
                  {emp.full_name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('employee_ids', id)} />
                </Badge>
              );
            })}
            {filters.categories?.map(cat => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat.replace(/_/g, ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('categories', cat)} />
              </Badge>
            ))}
            {filters.payment_methods?.map(method => (
              <Badge key={method} variant="secondary" className="gap-1">
                {method.replace(/_/g, ' ')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('payment_methods', method)} />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}