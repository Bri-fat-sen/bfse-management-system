import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { FolderPlus, Palette, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_COLORS = [
  { name: "Green", value: "#1EB053" },
  { name: "Blue", value: "#0072C6" },
  { name: "Gold", value: "#D4AF37" },
  { name: "Red", value: "#DC2626" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#EA580C" },
  { name: "Teal", value: "#0D9488" },
  { name: "Pink", value: "#DB2777" },
];

export default function CategoryManager({ 
  open, 
  onOpenChange, 
  categories = [],
  orgId 
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    color: "#1EB053"
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      toast.success("Category created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      toast.success("Category updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", parent_category_id: "", color: "#1EB053" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      organisation_id: orgId,
      ...formData,
      parent_category_id: formData.parent_category_id || null
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent_category_id: category.parent_category_id || "",
      color: category.color || "#1EB053"
    });
    setShowForm(true);
  };

  const parentCategories = categories.filter(c => !c.parent_category_id);
  const getSubcategories = (parentId) => categories.filter(c => c.parent_category_id === parentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#1EB053]" />
            Manage Product Categories
          </DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4">
            <Button onClick={() => setShowForm(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
              <FolderPlus className="w-4 h-4 mr-2" />
              Add Category
            </Button>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No categories yet</p>
                <p className="text-sm">Create your first product category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parentCategories.map((category) => (
                  <div key={category.id}>
                    <Card className="border-l-4" style={{ borderLeftColor: category.color }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-gray-500">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => deleteMutation.mutate(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Subcategories */}
                    {getSubcategories(category.id).length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {getSubcategories(category.id).map((sub) => (
                          <Card key={sub.id} className="border-l-4" style={{ borderLeftColor: sub.color }}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge style={{ backgroundColor: sub.color }}>{sub.name}</Badge>
                                  {sub.description && (
                                    <span className="text-sm text-gray-500">{sub.description}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(sub)}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-red-500"
                                    onClick={() => deleteMutation.mutate(sub.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Beverages"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Parent Category (Optional)</Label>
              <Select
                value={formData.parent_category_id}
                onValueChange={(v) => setFormData({ ...formData, parent_category_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None (Top Level)</SelectItem>
                  {parentCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color.value ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1EB053] hover:bg-[#178f43]">
                {editingCategory ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}