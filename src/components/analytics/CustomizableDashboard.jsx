import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  LayoutGrid,
  Plus,
  GripVertical,
  X,
  Settings,
  Save,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

// Available widget types
const WIDGET_TYPES = [
  { id: 'sales_total', name: 'Total Sales', category: 'sales', size: 'small' },
  { id: 'sales_trend', name: 'Sales Trend Chart', category: 'sales', size: 'large' },
  { id: 'sales_by_payment', name: 'Sales by Payment Method', category: 'sales', size: 'medium' },
  { id: 'top_products', name: 'Top Products', category: 'sales', size: 'medium' },
  { id: 'expense_total', name: 'Total Expenses', category: 'expenses', size: 'small' },
  { id: 'expense_by_category', name: 'Expenses by Category', category: 'expenses', size: 'medium' },
  { id: 'profit_loss', name: 'Profit/Loss Summary', category: 'finance', size: 'small' },
  { id: 'profit_margin', name: 'Profit Margin', category: 'finance', size: 'small' },
  { id: 'inventory_status', name: 'Inventory Status', category: 'inventory', size: 'medium' },
  { id: 'low_stock_alert', name: 'Low Stock Alerts', category: 'inventory', size: 'medium' },
  { id: 'transport_revenue', name: 'Transport Revenue', category: 'transport', size: 'small' },
  { id: 'trips_summary', name: 'Trips Summary', category: 'transport', size: 'medium' },
  { id: 'employee_attendance', name: 'Attendance Overview', category: 'hr', size: 'medium' },
  { id: 'sales_prediction', name: 'Sales Prediction', category: 'analytics', size: 'large' },
  { id: 'inventory_risk', name: 'Inventory Risk', category: 'analytics', size: 'large' },
];

const WIDGET_CATEGORIES = [
  { id: 'sales', name: 'Sales', color: '#1EB053' },
  { id: 'expenses', name: 'Expenses', color: '#EF4444' },
  { id: 'finance', name: 'Finance', color: '#0072C6' },
  { id: 'inventory', name: 'Inventory', color: '#D4AF37' },
  { id: 'transport', name: 'Transport', color: '#9333EA' },
  { id: 'hr', name: 'HR', color: '#0F1F3C' },
  { id: 'analytics', name: 'Analytics', color: '#10B981' },
];

export default function CustomizableDashboard({ 
  widgets, 
  onWidgetsChange, 
  renderWidget,
  savedReports = [],
  orgId,
  currentEmployee
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const saveReportMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      setShowSaveDialog(false);
      setReportName('');
      setReportDescription('');
      toast({ title: "Dashboard saved successfully!" });
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({ ...item, position: index }));
    onWidgetsChange(updatedItems);
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `${widgetType.id}-${Date.now()}`,
      type: widgetType.id,
      position: widgets.length,
      size: widgetType.size,
      visible: true
    };
    onWidgetsChange([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    onWidgetsChange(widgets.filter(w => w.id !== widgetId));
  };

  const toggleWidgetVisibility = (widgetId) => {
    onWidgetsChange(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const toggleWidgetSize = (widgetId) => {
    const sizeOrder = ['small', 'medium', 'large'];
    onWidgetsChange(widgets.map(w => {
      if (w.id === widgetId) {
        const currentIndex = sizeOrder.indexOf(w.size);
        const nextSize = sizeOrder[(currentIndex + 1) % sizeOrder.length];
        return { ...w, size: nextSize };
      }
      return w;
    }));
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toast({ title: "Please enter a report name", variant: "destructive" });
      return;
    }

    saveReportMutation.mutate({
      organisation_id: orgId,
      created_by_id: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      name: reportName,
      description: reportDescription,
      report_type: 'custom',
      widgets: widgets
    });
  };

  const filteredWidgetTypes = WIDGET_TYPES.filter(w => 
    selectedCategory === 'all' || w.category === selectedCategory
  );

  const getSizeClass = (size) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={editMode ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            {editMode ? 'Done Editing' : 'Customize'}
          </Button>
          {editMode && (
            <Button variant="outline" size="sm" onClick={() => setShowAddWidget(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {widgets.filter(w => w.visible !== false).map((widget, index) => {
                const widgetType = WIDGET_TYPES.find(t => t.id === widget.type);
                const category = WIDGET_CATEGORIES.find(c => c.id === widgetType?.category);
                
                return (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={!editMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getSizeClass(widget.size)} ${
                          snapshot.isDragging ? 'opacity-75 shadow-2xl' : ''
                        } ${editMode ? 'ring-2 ring-dashed ring-gray-300 rounded-xl' : ''}`}
                      >
                        <Card className="h-full relative overflow-hidden">
                          {editMode && (
                            <div 
                              className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-between px-2 z-10"
                              {...provided.dragHandleProps}
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                <span className="text-xs font-medium text-gray-600">
                                  {widgetType?.name}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1 py-0"
                                  style={{ borderColor: category?.color, color: category?.color }}
                                >
                                  {widget.size}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => toggleWidgetSize(widget.id)}
                                >
                                  {widget.size === 'large' ? (
                                    <Minimize2 className="w-3 h-3" />
                                  ) : (
                                    <Maximize2 className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-600"
                                  onClick={() => removeWidget(widget.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className={editMode ? 'pt-8' : ''}>
                            {renderWidget(widget)}
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? "default" : "outline"}
                className={`cursor-pointer ${selectedCategory === 'all' ? 'bg-gray-800' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {WIDGET_CATEGORIES.map(cat => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer"
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : { borderColor: cat.color, color: cat.color }}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>

            {/* Widget List */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredWidgetTypes.map(widgetType => {
                const category = WIDGET_CATEGORIES.find(c => c.id === widgetType.category);
                const isAdded = widgets.some(w => w.type === widgetType.id);
                
                return (
                  <Card
                    key={widgetType.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isAdded ? 'opacity-50' : ''
                    }`}
                    onClick={() => !isAdded && addWidget(widgetType)}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category?.color }}
                        />
                      </div>
                      <p className="font-medium text-sm">{widgetType.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{widgetType.size}</Badge>
                        {isAdded && <Badge variant="secondary" className="text-[10px]">Added</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Report Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Name</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="My Custom Dashboard"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Description of this dashboard configuration"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-gray-500">
              {widgets.length} widgets will be saved in this configuration.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#1EB053] hover:bg-[#178f43]"
              onClick={handleSaveReport}
              disabled={saveReportMutation.isPending}
            >
              {saveReportMutation.isPending ? 'Saving...' : 'Save Dashboard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}