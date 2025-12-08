import { useState, useEffect } from "react";
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
  const [category, setCategory] = useState('Other');
  const [unit, setUnit] = useState('piece');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (open) {
      setSelectedLocations(editingProduct?.location_ids || []);
      setCategory(editingProduct?.category || 'Other');
      setUnit(editingProduct?.unit || 'piece');
      setShowAdvanced(!!editingProduct);
    } else {
      setSelectedLocations([]);
      setCategory('Other');
      setUnit('piece');
      setShowAdvanced(false);
    }
  }, [open, editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku') || `SKU-${Date.now()}`,
      category: category,
      description: formData.get('description'),
      unit_price: parseFloat(formData.get('unit_price')) || 0,
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      wholesale_price: parseFloat(formData.get('wholesale_price')) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity')) || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold')) || 10,
      reorder_point: parseInt(formData.get('reorder_point')) || 10,
      reorder_quantity: parseInt(formData.get('reorder_quantity')) || 50,
      lead_time_days: parseInt(formData.get('lead_time_days')) || 7,
      is_serialized: false,
      track_batches: false,
      unit: unit,
      location_ids: selectedLocations,
      is_active: true,
    };
    onSubmit(data);
    if (!editingProduct) {
      e.target.reset();
      setCategory('Other');
      setUnit('piece');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header */}
        <div 
          className="px-4 sm:px-6 py-3 sm:py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {editingProduct ? 'Edit Product' : 'Quick Add Product'}
                </h2>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {editingProduct ? editingProduct.name : 'Fill essentials, save instantly'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(85vh-180px)] sm:max-h-[calc(90vh-200px)]">
          <div className="p-4 sm:p-6 space-y-4">
            {/* Quick Essentials */}
            <div className="space-y-4">
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    Product Name *
                  </Label>
                  <Input 
                    name="name" 
                    defaultValue={editingProduct?.name} 
                    required 
                    className="mt-1.5 border-gray-200 focus:border-[#1EB053]"
                    placeholder="e.g., Premium Water 500ml"
                    autoFocus
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 font-medium">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
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
                  <Label className="text-gray-700 font-medium">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="mt-1.5 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing - Most Important */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                  <Label className="text-[#1EB053] font-medium text-xs">Retail Price *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1EB053] font-bold text-xs">Le</span>
                    <Input 
                      name="unit_price" 
                      type="number" 
                      defaultValue={editingProduct?.unit_price} 
                      required 
                      className="pl-8 text-base font-semibold border-[#1EB053]/30"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border-2 border-gray-200 bg-gray-50">
                  <Label className="text-gray-600 font-medium text-xs">Cost Price</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Le</span>
                    <Input 
                      name="cost_price" 
                      type="number" 
                      defaultValue={editingProduct?.cost_price || 0} 
                      className="pl-8 text-base font-semibold border-gray-200"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div>
                <Label className="text-gray-700 font-medium">Initial Stock Quantity</Label>
                <Input 
                  name="stock_quantity" 
                  type="number" 
                  defaultValue={editingProduct?.stock_quantity || 0} 
                  className="mt-1.5 border-gray-200"
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Advanced Toggle */}
              {!editingProduct && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
                </Button>
              )}

              {/* Advanced Fields - Collapsible */}
              {(showAdvanced || editingProduct) && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-600 text-xs">SKU/Barcode</Label>
                      <Input 
                        name="sku" 
                        defaultValue={editingProduct?.sku} 
                        className="mt-1 border-gray-200 text-sm"
                        placeholder="Auto-generated"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-600 text-xs">Wholesale Price</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Le</span>
                        <Input 
                          name="wholesale_price" 
                          type="number" 
                          defaultValue={editingProduct?.wholesale_price || 0} 
                          className="pl-7 border-gray-200 text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-600 text-xs">Low Stock Alert</Label>
                      <Input 
                        name="low_stock_threshold" 
                        type="number" 
                        defaultValue={editingProduct?.low_stock_threshold || 10} 
                        className="mt-1 border-gray-200 text-sm"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-600 text-xs">Reorder Qty</Label>
                      <Input 
                        name="reorder_quantity" 
                        type="number" 
                        defaultValue={editingProduct?.reorder_quantity || 50} 
                        className="mt-1 border-gray-200 text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600 text-xs">Description</Label>
                    <Textarea 
                      name="description" 
                      defaultValue={editingProduct?.description} 
                      className="mt-1 border-gray-200 min-h-[60px] text-sm"
                      placeholder="Optional details..."
                    />
                  </div>

                  {/* Locations - Only if editing or advanced shown */}
                  {allLocations.length > 0 && (
                    <div>
                      <Label className="text-gray-600 text-xs mb-2 block">Locations (optional)</Label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
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
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm ${
                                isSelected 
                                  ? 'bg-[#1EB053]/10 border border-[#1EB053]' 
                                  : 'bg-white border border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {isWarehouse ? (
                                <Warehouse className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              ) : (
                                <Truck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              )}
                              <span className="flex-1 text-gray-700">{location.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#1EB053] flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden fields with defaults */}
            <input type="hidden" name="reorder_point" value={editingProduct?.reorder_point || 10} />
            <input type="hidden" name="lead_time_days" value={editingProduct?.lead_time_days || 7} />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-3 sm:p-4 flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 sm:flex-none sm:w-24"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Update' : 'Add Product'}
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