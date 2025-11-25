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
import { useToast } from "@/components/ui/use-toast";
import { Folder, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PRESET_COLORS = [
  "#1EB053", "#0072C6", "#D4AF37", "#E74C3C", "#9B59B6", 
  "#3498DB", "#1ABC9C", "#F39C12", "#E91E63", "#00BCD4"
];

export default function CategoryManager({ 
  open, 
  onOpenChange, 
  categories = [],
  orgId 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const createCategoryMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditingCategory(null);
      toast({ title: "Category created successfully" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditingCategory(null);
      toast({ title: "Category updated successfully" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Category deleted successfully" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      name: formData.get('name'),
      description: formData.get('description'),
      parent_category_id: formData.get('parent_category_id') || null,
      color: selectedColor,
      is_active: true,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const parentCategories = categories.filter(c => !c.parent_category_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#1EB053]" />
            Manage Categories
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category List */}
          {!showForm && (
            <>
              <div className="flex justify-end">
                <Button onClick={() => { setShowForm(true); setEditingCategory(null); }} className="bg-[#1EB053]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Folder className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500 truncate max-w-32">{category.description}</p>
                          )}
                          {category.parent_category_id && (
                            <p className="text-xs text-[#0072C6]">
                              Sub-category of: {categories.find(c => c.id === category.parent_category_id)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingCategory(category); setSelectedColor(category.color); setShowForm(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No categories yet</p>
                </div>
              )}
            </>
          )}

          {/* Category Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Category Name</Label>
                <Input 
                  name="name" 
                  defaultValue={editingCategory?.name}
                  required 
                  className="mt-1" 
                  placeholder="e.g., Beverages, Electronics"
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea 
                  name="description" 
                  defaultValue={editingCategory?.description}
                  className="mt-1" 
                  placeholder="Category description..."
                />
              </div>

              <div>
                <Label>Parent Category (Optional)</Label>
                <Select name="parent_category_id" defaultValue={editingCategory?.parent_category_id || ""}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None (Top-level category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None (Top-level)</SelectItem>
                    {parentCategories.filter(c => c.id !== editingCategory?.id).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#1EB053]"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}