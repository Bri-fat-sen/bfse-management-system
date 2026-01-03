import React, { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Filter,
  X,
  CalendarIcon,
  User,
  HardDrive,
  Tag,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedDocumentFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  availableUploaders = [],
  onClearAll
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const toggleTag = (tag) => {
    const current = localFilters.tags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updateFilter('tags', updated);
  };

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'category' && value === 'all') return false;
    if (key === 'tags' && (!value || value.length === 0)) return false;
    if (!value || value === '' || value === 'all') return false;
    return true;
  }).length;

  return (
    <div className="flex items-center gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`relative h-12 px-6 rounded-2xl border-2 transition-all ${
              activeFilterCount > 0
                ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white border-transparent shadow-lg'
                : 'border-gray-200 hover:border-[#1EB053]'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-white text-[#0072C6] border-0 font-black">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-6" align="start">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1EB053]" />
                Advanced Filters
              </h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearAll();
                    setLocalFilters({});
                    setIsOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#0072C6]" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal border-2 border-gray-200 rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateFrom ? format(new Date(localFilters.dateFrom), 'MMM d, yyyy') : 'Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateFrom ? new Date(localFilters.dateFrom) : undefined}
                      onSelect={(date) => updateFilter('dateFrom', date?.toISOString())}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal border-2 border-gray-200 rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateTo ? format(new Date(localFilters.dateTo), 'MMM d, yyyy') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateTo ? new Date(localFilters.dateTo) : undefined}
                      onSelect={(date) => updateFilter('dateTo', date?.toISOString())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* File Size */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#0072C6]" />
                File Size
              </label>
              <Select value={localFilters.fileSize || 'all'} onValueChange={(value) => updateFilter('fileSize', value)}>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any size</SelectItem>
                  <SelectItem value="small">Small (&lt; 100 KB)</SelectItem>
                  <SelectItem value="medium">Medium (100 KB - 1 MB)</SelectItem>
                  <SelectItem value="large">Large (1 MB - 10 MB)</SelectItem>
                  <SelectItem value="xlarge">Very Large (&gt; 10 MB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Uploader */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0072C6]" />
                Uploaded By
              </label>
              <Select value={localFilters.uploadedBy || 'all'} onValueChange={(value) => updateFilter('uploadedBy', value)}>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Anyone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anyone</SelectItem>
                  {availableUploaders.map((uploader) => (
                    <SelectItem key={uploader.id} value={uploader.id}>
                      {uploader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Multi-tag Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0072C6]" />
                Tags (Select Multiple)
              </label>
              <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {availableTags.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No tags available</p>
                  ) : (
                    availableTags.map((tag) => {
                      const isSelected = (localFilters.tags || []).includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-[#1EB053]'
                          }`}
                        >
                          {tag}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>
              {(localFilters.tags || []).length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {localFilters.tags.length} tag{localFilters.tags.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Linked Records Filter */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#0072C6]" />
                Linked Records
              </label>
              <Select value={localFilters.linkedRecords || 'all'} onValueChange={(value) => updateFilter('linkedRecords', value)}>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="with_links">With Linked Records</SelectItem>
                  <SelectItem value="without_links">Without Links</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t-2 border-gray-200">
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full h-12 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#0072C6] hover:to-[#1EB053] text-white border-0 font-bold"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-wrap gap-2"
          >
            {localFilters.dateFrom && (
              <Badge className="bg-blue-100 text-blue-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                From: {format(new Date(localFilters.dateFrom), 'MMM d')}
                <button onClick={() => updateFilter('dateFrom', null)} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.dateTo && (
              <Badge className="bg-blue-100 text-blue-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                To: {format(new Date(localFilters.dateTo), 'MMM d')}
                <button onClick={() => updateFilter('dateTo', null)} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.fileSize && localFilters.fileSize !== 'all' && (
              <Badge className="bg-purple-100 text-purple-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                Size: {localFilters.fileSize}
                <button onClick={() => updateFilter('fileSize', 'all')} className="hover:bg-purple-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.uploadedBy && localFilters.uploadedBy !== 'all' && (
              <Badge className="bg-green-100 text-green-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                Uploader: {availableUploaders.find(u => u.id === localFilters.uploadedBy)?.name || 'Unknown'}
                <button onClick={() => updateFilter('uploadedBy', 'all')} className="hover:bg-green-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(localFilters.tags || []).length > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                Tags: {localFilters.tags.length}
                <button onClick={() => updateFilter('tags', [])} className="hover:bg-amber-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.linkedRecords && localFilters.linkedRecords !== 'all' && (
              <Badge className="bg-cyan-100 text-cyan-800 border-0 gap-2 px-3 py-1.5 font-semibold">
                Links: {localFilters.linkedRecords === 'with_links' ? 'With' : 'Without'}
                <button onClick={() => updateFilter('linkedRecords', 'all')} className="hover:bg-cyan-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}