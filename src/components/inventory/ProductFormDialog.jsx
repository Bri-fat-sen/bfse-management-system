import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Warehouse,
  Truck,
  MapPin,
  DollarSign,
  Hash,
  Layers,
  Clock,
  AlertTriangle,
  X,
  Check
} from "lucide-react";

export default function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  onSubmit,
  categoryList,
  allLocations,
  organisation,
  isLoading
}) {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (open) {
      setSelectedLocations(editingProduct?.location_ids || []);
      setActiveSection('basic');
    } else {
      setSelectedLocations([]);
    }
  }, [open, editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      category: formData.get('category'),
      description: formData.get('description'),
      unit_price: parseFloat(formData.get('unit_price')) || 0,
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      wholesale_price: parseFloat(formData.get('wholesale_price')) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity')) || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold')) || 10,
      reorder_point: parseInt(formData.get('reorder_point')) || 10,
      reorder_quantity: parseInt(formData.get('reorder_quantity')) || 50,
      lead_time_days: parseInt(formData.get('lead_time_days')) || 7,
      is_serialized: formData.get('is_serialized') === 'on',
      track_batches: formData.get('track_batches') === 'on',
      unit: formData.get('unit'),
      location_ids: selectedLocations,
      is_active: true,
    };
    onSubmit(data);
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'stock', label: 'Stock', icon: Layers },
    { id: 'locations', label: 'Locations', icon: MapPin },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h2>
                <p className="text-white/80 text-sm">
                  {editingProduct ? `Updating: ${editingProduct.name}` : 'Add a new product to inventory'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Package className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Product Name *</Label>
                    <Input 
                      name="name" 
                      defaultValue={editingProduct?.name} 
                      required 
                      className="mt-1.5 border-gray-200 focus:border-[#1EB053] focus:ring-[#1EB053]/20"
                      placeholder="e.g., Premium Bottled Water 500ml"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">SKU / Barcode</Label>
                    <div className="relative mt-1.5">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        name="sku" 
                        defaultValue={editingProduct?.sku} 
                        className="pl-10 border-gray-200"
                        placeholder="e.g., WAT-500-001"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Category</Label>
                    <Select name="category" defaultValue={editingProduct?.category || "Other"}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Unit of Measure</Label>
                    <Select name="unit" defaultValue={editingProduct?.unit || "piece"}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="ml">Milliliter (ml)</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="carton">Carton</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Initial Stock</Label>
                    <Input 
                      name="stock_quantity" 
                      type="number" 
                      defaultValue={editingProduct?.stock_quantity || 0} 
                      className="mt-1.5 border-gray-200"
                      min="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Description</Label>
                    <Textarea 
                      name="description" 
                      defaultValue={editingProduct?.description} 
                      className="mt-1.5 border-gray-200 min-h-[80px]"
                      placeholder="Product description, features, etc."
                    />
                  </div>

                  {/* Tracking Options */}
                  <div className="sm:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Tracking Options</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox 
                          name="is_serialized"
                          defaultChecked={editingProduct?.is_serialized}
                          className="data-[state=checked]:bg-[#1EB053] data-[state=checked]:border-[#1EB053]"
                        />
                        <span className="text-sm text-gray-600">Track Serial Numbers</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox 
                          name="track_batches"
                          defaultChecked={editingProduct?.track_batches}
                          className="data-[state=checked]:bg-[#0072C6] data-[state=checked]:border-[#0072C6]"
                        />
                        <span className="text-sm text-gray-600">Track Batches/Lots</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Section */}
            {activeSection === 'pricing' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <DollarSign className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Pricing Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium text-sm">Retail Price (SLE) *</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1EB053] font-bold">Le</span>
                      <Input 
                        name="unit_price" 
                        type="number" 
                        defaultValue={editingProduct?.unit_price} 
                        required 
                        className="pl-10 text-lg font-semibold border-[#1EB053]/30 focus:border-[#1EB053]"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Standard selling price</p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                    <Label className="text-[#0072C6] font-medium text-sm">Wholesale Price (SLE)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0072C6] font-bold">Le</span>
                      <Input 
                        name="wholesale_price" 
                        type="number" 
                        defaultValue={editingProduct?.wholesale_price} 
                        className="pl-10 text-lg font-semibold border-[#0072C6]/30 focus:border-[#0072C6]"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Bulk/wholesale price</p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                    <Label className="text-gray-600 font-medium text-sm">Cost Price (SLE)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Le</span>
                      <Input 
                        name="cost_price" 
                        type="number" 
                        defaultValue={editingProduct?.cost_price} 
                        className="pl-10 text-lg font-semibold border-gray-200"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your purchase cost</p>
                  </div>
                </div>

                {/* Profit Preview */}
                {editingProduct?.unit_price > 0 && editingProduct?.cost_price > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border border-[#1EB053]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estimated Profit Margin</span>
                      <span className="font-bold text-[#1EB053]">
                        {(((editingProduct.unit_price - editingProduct.cost_price) / editingProduct.unit_price) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Management Section */}
            {activeSection === 'stock' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Stock Management</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <Label className="text-amber-700 font-medium">Low Stock Alert</Label>
                    </div>
                    <Input 
                      name="low_stock_threshold" 
                      type="number" 
                      defaultValue={editingProduct?.low_stock_threshold || 10} 
                      className="border-amber-200 focus:border-amber-400"
                      min="0"
                    />
                    <p className="text-xs text-amber-600 mt-1">Alert when stock falls below this</p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-gray-600" />
                      <Label className="text-gray-700 font-medium">Reorder Point</Label>
                    </div>
                    <Input 
                      name="reorder_point" 
                      type="number" 
                      defaultValue={editingProduct?.reorder_point || 10} 
                      className="border-gray-200"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Suggest reorder at this level</p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <Label className="text-gray-700 font-medium">Reorder Quantity</Label>
                    </div>
                    <Input 
                      name="reorder_quantity" 
                      type="number" 
                      defaultValue={editingProduct?.reorder_quantity || 50} 
                      className="border-gray-200"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default quantity to order</p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <Label className="text-gray-700 font-medium">Lead Time (Days)</Label>
                    </div>
                    <Input 
                      name="lead_time_days" 
                      type="number" 
                      defaultValue={editingProduct?.lead_time_days || 7} 
                      className="border-gray-200"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supplier delivery time</p>
                  </div>
                </div>
              </div>
            )}

            {/* Locations Section */}
            {activeSection === 'locations' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Available Locations</h3>
                </div>

                <p className="text-sm text-gray-500">
                  Select where this product is available for sale. Leave empty for all locations.
                </p>

                {allLocations.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No locations available</p>
                    <p className="text-sm text-gray-400">Add warehouses or vehicles first</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                    {allLocations.map((location) => {
                      const isSelected = selectedLocations.includes(location.id);
                      const isWarehouse = location.type === 'warehouse';
                      
                      return (
                        <div
                          key={location.id}
                          onClick={() => {
                            setSelectedLocations(prev => 
                              isSelected 
                                ? prev.filter(id => id !== location.id)
                                : [...prev, location.id]
                            );
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-2 border-[#1EB053]' 
                              : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isWarehouse 
                              ? 'bg-blue-100' 
                              : 'bg-purple-100'
                          }`}>
                            {isWarehouse ? (
                              <Warehouse className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Truck className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{location.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected 
                              ? 'bg-[#1EB053] text-white' 
                              : 'bg-gray-200'
                          }`}>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedLocations.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-[#1EB053]/10 rounded-lg">
                    <Check className="w-4 h-4 text-[#1EB053]" />
                    <span className="text-sm text-[#1EB053] font-medium">
                      {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}