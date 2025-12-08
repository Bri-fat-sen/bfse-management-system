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
      setShowAdvanced(false);
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
      description: formData.get('description') || '',
      unit_price: parseFloat(formData.get('unit_price')) || 0,
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      wholesale_price: parseFloat(formData.get('wholesale_price')) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity')) || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold')) || 10,
      reorder_point: parseInt(formData.get('reorder_point')) || 10,
      reorder_quantity: parseInt(formData.get('reorder_quantity')) || 50,
      lead_time_days: parseInt(formData.get('lead_time_days')) || 7,
      unit: unit,
      location_ids: selectedLocations,
      is_active: true,
    };
    onSubmit(data);
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (open && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
        {/* Flag Header */}
        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <Package className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Quick Add Product'}
                </h2>
                <p className="text-xs text-gray-500">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl+Enter</kbd> to save
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Essential Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="font-medium text-gray-900">Product Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={editingProduct?.name} 
                  required 
                  autoFocus
                  className="mt-1.5 text-base"
                  placeholder="e.g., Premium Water 500ml"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5">
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
                  <Label>Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Gram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="ml">mL</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing - Highlighted */}
            <div className="p-4 rounded-xl border-2 border-[#1EB053]/20 bg-[#1EB053]/5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: primaryColor }} />
                Pricing (SLE)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Retail *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1EB053] font-bold text-xs">Le</span>
                    <Input 
                      name="unit_price" 
                      type="number" 
                      defaultValue={editingProduct?.unit_price} 
                      required 
                      className="pl-8 font-semibold"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Wholesale</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#0072C6] font-bold text-xs">Le</span>
                    <Input 
                      name="wholesale_price" 
                      type="number" 
                      defaultValue={editingProduct?.wholesale_price} 
                      className="pl-8 font-semibold"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Cost</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">Le</span>
                    <Input 
                      name="cost_price" 
                      type="number" 
                      defaultValue={editingProduct?.cost_price} 
                      className="pl-8"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock & Quick Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Initial Stock</Label>
                <Input 
                  name="stock_quantity" 
                  type="number" 
                  defaultValue={editingProduct?.stock_quantity || 0} 
                  className="mt-1.5"
                  min="0"
                />
              </div>
              <div>
                <Label>Low Stock Alert</Label>
                <Input 
                  name="low_stock_threshold" 
                  type="number" 
                  defaultValue={editingProduct?.low_stock_threshold || 10} 
                  className="mt-1.5"
                  min="0"
                />
              </div>
            </div>

            {/* Locations - Simplified */}
            {allLocations.length > 0 && (
              <div className="p-4 border rounded-xl bg-gray-50">
                <Label className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locations {selectedLocations.length > 0 && `(${selectedLocations.length})`}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {allLocations.map((location) => {
                    const isSelected = selectedLocations.includes(location.id);
                    return (
                      <Button
                        key={location.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedLocations(prev => 
                            isSelected 
                              ? prev.filter(id => id !== location.id)
                              : [...prev, location.id]
                          );
                        }}
                        className={isSelected ? 'bg-[#1EB053] hover:bg-[#16803d]' : ''}
                      >
                        {location.type === 'warehouse' ? (
                          <Warehouse className="w-3 h-3 mr-1" />
                        ) : (
                          <Truck className="w-3 h-3 mr-1" />
                        )}
                        {location.name}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">Leave empty to make available at all locations</p>
              </div>
            )}

            {/* Advanced Options - Collapsible */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>Advanced Options</span>
                <span className="text-xs text-gray-400">{showAdvanced ? 'Hide' : 'Show'}</span>
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-xs">SKU / Barcode</Label>
                    <Input 
                      name="sku" 
                      defaultValue={editingProduct?.sku} 
                      className="mt-1.5"
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reorder Point</Label>
                    <Input 
                      name="reorder_point" 
                      type="number" 
                      defaultValue={editingProduct?.reorder_point || 10} 
                      className="mt-1.5"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reorder Qty</Label>
                    <Input 
                      name="reorder_quantity" 
                      type="number" 
                      defaultValue={editingProduct?.reorder_quantity || 50} 
                      className="mt-1.5"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Lead Time (Days)</Label>
                    <Input 
                      name="lead_time_days" 
                      type="number" 
                      defaultValue={editingProduct?.lead_time_days || 7} 
                      className="mt-1.5"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea 
                      name="description" 
                      defaultValue={editingProduct?.description} 
                      className="mt-1.5 min-h-[60px]"
                      placeholder="Optional notes about this product"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Update' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Flag Footer */}
        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}