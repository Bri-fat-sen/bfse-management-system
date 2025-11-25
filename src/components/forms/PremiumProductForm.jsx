import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Camera,
  Barcode,
  DollarSign,
  Boxes,
  Tag,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Droplets
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Package },
  { id: 2, title: "Pricing", icon: DollarSign },
  { id: 3, title: "Inventory", icon: Boxes },
];

const CATEGORIES = [
  { value: "Water", icon: "💧", color: "bg-blue-500" },
  { value: "Beverages", icon: "🥤", color: "bg-orange-500" },
  { value: "Food", icon: "🍞", color: "bg-amber-500" },
  { value: "Electronics", icon: "📱", color: "bg-purple-500" },
  { value: "Clothing", icon: "👕", color: "bg-pink-500" },
  { value: "Health", icon: "💊", color: "bg-red-500" },
  { value: "Household", icon: "🏠", color: "bg-green-500" },
  { value: "Other", icon: "📦", color: "bg-gray-500" },
];

const UNITS = ["piece", "bottle", "pack", "carton", "kg", "liter", "box", "set"];

export default function PremiumProductForm({ open, onOpenChange, orgId, warehouses = [], editProduct = null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(editProduct?.image_url || null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: editProduct?.name || "",
    sku: editProduct?.sku || "",
    barcode: editProduct?.barcode || "",
    category: editProduct?.category || "",
    description: editProduct?.description || "",
    unit: editProduct?.unit || "piece",
    unit_price: editProduct?.unit_price || "",
    cost_price: editProduct?.cost_price || "",
    wholesale_price: editProduct?.wholesale_price || "",
    stock_quantity: editProduct?.stock_quantity || 0,
    low_stock_threshold: editProduct?.low_stock_threshold || 10,
    warehouse_id: editProduct?.warehouse_id || "",
    is_active: editProduct?.is_active ?? true,
    is_water_product: editProduct?.is_water_product || false,
    expiry_date: editProduct?.expiry_date || "",
    image_url: editProduct?.image_url || "",
  });

  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organisation_id: orgId,
        unit_price: parseFloat(data.unit_price) || 0,
        cost_price: parseFloat(data.cost_price) || 0,
        wholesale_price: parseFloat(data.wholesale_price) || 0,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        low_stock_threshold: parseInt(data.low_stock_threshold) || 10,
      };
      return editProduct
        ? base44.entities.Product.update(editProduct.id, payload)
        : base44.entities.Product.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: editProduct ? "Product Updated" : "Product Added",
        description: `${formData.name} has been ${editProduct ? 'updated' : 'added'} successfully.`
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: "", sku: "", barcode: "", category: "", description: "",
      unit: "piece", unit_price: "", cost_price: "", wholesale_price: "",
      stock_quantity: 0, low_stock_threshold: 10, warehouse_id: "",
      is_active: true, is_water_product: false, expiry_date: "", image_url: ""
    });
    setImagePreview(null);
    setErrors({});
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      setImagePreview(file_url);
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Product name is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2) {
      if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
        newErrors.unit_price = "Valid selling price is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      mutation.mutate(formData);
    }
  };

  const generateSKU = () => {
    const prefix = formData.category?.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, sku: `${prefix}-${random}` });
  };

  const profitMargin = formData.unit_price && formData.cost_price
    ? (((parseFloat(formData.unit_price) - parseFloat(formData.cost_price)) / parseFloat(formData.unit_price)) * 100).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M20 20.5V18H0v-2h20v-2.5L25 18l-5 2.5z\"/%3E%3C/g%3E%3C/svg%3E')]" />
          <DialogHeader className="relative p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              {editProduct ? 'Update product details' : 'Add a new product to your inventory'}
            </p>
          </DialogHeader>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.id
                      ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg scale-110'
                      : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className={`w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl ${
                        imagePreview ? '' : 'bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20'
                      }`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Product Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      className={`mt-1.5 h-11 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">SKU</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="PRD-XXXXXX"
                          className="h-11"
                        />
                        <Button type="button" variant="outline" onClick={generateSKU} className="h-11 px-3">
                          <Tag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Barcode</Label>
                      <div className="relative mt-1.5">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="Scan or enter"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Category *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat.value}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, category: cat.value })}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                            formData.category === cat.value
                              ? 'border-[#1EB053] bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="text-xs font-medium">{cat.value}</span>
                        </motion.button>
                      ))}
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-2">{errors.category}</p>}
                  </div>

                  {/* Water Product Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Water Product</p>
                        <p className="text-xs text-blue-600">Mark this as a water/beverage product</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_water_product}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_water_product: checked })}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description..."
                      className="mt-1.5 min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Pricing */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Selling Price (Le) *</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={formData.unit_price}
                          onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                          placeholder="0"
                          className={`pl-10 h-12 text-lg font-semibold ${errors.unit_price ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.unit_price && <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Cost Price (Le)</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={formData.cost_price}
                          onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                          placeholder="0"
                          className="pl-10 h-12 text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Wholesale Price (Le)</Label>
                    <div className="relative mt-1.5">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                        placeholder="0"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  {/* Profit Margin Display */}
                  {profitMargin !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border-2 ${
                        parseFloat(profitMargin) >= 20
                          ? 'bg-green-50 border-green-300'
                          : parseFloat(profitMargin) >= 10
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Profit Margin</p>
                          <p className="text-2xl font-bold">{profitMargin}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Profit per unit</p>
                          <p className="text-lg font-semibold text-green-600">
                            Le {(parseFloat(formData.unit_price) - parseFloat(formData.cost_price)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Unit of Measure</Label>
                    <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                      <SelectTrigger className="mt-1.5 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit} value={unit} className="capitalize">{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Inventory */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Initial Stock Quantity</Label>
                      <Input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Low Stock Alert</Label>
                      <Input
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                        placeholder="10"
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  {warehouses.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Warehouse</Label>
                      <Select value={formData.warehouse_id} onValueChange={(v) => setFormData({ ...formData, warehouse_id: v })}>
                        <SelectTrigger className="mt-1.5 h-11">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map(wh => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Expiry Date</Label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="mt-1.5 h-11"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div>
                      <p className="font-medium">Product Active</p>
                      <p className="text-xs text-gray-500">Show this product in POS</p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl border border-[#1EB053]/20">
                    <h4 className="font-semibold text-gray-800 mb-3">📦 Product Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Name:</span> {formData.name || '-'}</p>
                      <p><span className="text-gray-500">Category:</span> {formData.category || '-'}</p>
                      <p><span className="text-gray-500">Price:</span> Le {parseFloat(formData.unit_price || 0).toLocaleString()}</p>
                      <p><span className="text-gray-500">Stock:</span> {formData.stock_quantity} {formData.unit}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === i + 1 ? 'w-6 bg-[#1EB053]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <Button onClick={nextStep} className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {editProduct ? 'Update' : 'Add'} Product</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}