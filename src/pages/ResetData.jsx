import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Trash2, 
  RefreshCw,
  ShoppingCart,
  Package,
  Users,
  Truck,
  DollarSign,
  Clock,
  MessageSquare,
  FileText,
  Shield,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const DATA_CATEGORIES = [
  { 
    id: 'sales', 
    label: 'Sales & Transactions', 
    icon: ShoppingCart,
    entities: ['Sale'],
    description: 'All sales records and transactions'
  },
  { 
    id: 'inventory', 
    label: 'Inventory & Stock', 
    icon: Package,
    entities: ['Product', 'StockLevel', 'StockMovement', 'StockAlert', 'InventoryBatch', 'ProductionBatch', 'ProductCategory'],
    description: 'Products, stock levels, movements, and batches'
  },
  { 
    id: 'customers', 
    label: 'Customers & CRM', 
    icon: Users,
    entities: ['Customer', 'CustomerInteraction'],
    description: 'Customer records and interactions'
  },
  { 
    id: 'transport', 
    label: 'Transport & Logistics', 
    icon: Truck,
    entities: ['Vehicle', 'Trip', 'Route', 'TruckContract', 'VehicleMaintenance'],
    description: 'Vehicles, trips, routes, and contracts'
  },
  { 
    id: 'finance', 
    label: 'Finance & Expenses', 
    icon: DollarSign,
    entities: ['Expense', 'Payroll'],
    description: 'Expenses and payroll records'
  },
  { 
    id: 'hr', 
    label: 'HR & Attendance', 
    icon: Clock,
    entities: ['Attendance', 'LeaveRequest', 'PerformanceReview', 'EmployeeDocument', 'WorkSchedule'],
    description: 'Attendance, leave, and performance data'
  },
  { 
    id: 'communication', 
    label: 'Communication', 
    icon: MessageSquare,
    entities: ['ChatMessage', 'ChatRoom', 'Meeting', 'Notification'],
    description: 'Messages, meetings, and notifications'
  },
  { 
    id: 'suppliers', 
    label: 'Suppliers & Purchases', 
    icon: FileText,
    entities: ['Supplier', 'PurchaseOrder', 'SupplierProduct', 'SupplierPriceHistory'],
    description: 'Supplier data and purchase orders'
  },
  { 
    id: 'activity', 
    label: 'Activity Logs', 
    icon: Shield,
    entities: ['ActivityLog'],
    description: 'System activity and audit logs'
  },
];

export default function ResetData() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState({ current: 0, total: 0, entity: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const isSuperAdmin = currentEmployee?.role === 'super_admin';

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAll = () => {
    if (selectedCategories.length === DATA_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(DATA_CATEGORIES.map(c => c.id));
    }
  };

  const getEntitiesToDelete = () => {
    const entities = new Set();
    selectedCategories.forEach(catId => {
      const category = DATA_CATEGORIES.find(c => c.id === catId);
      category?.entities.forEach(e => entities.add(e));
    });
    return Array.from(entities);
  };

  const handleReset = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      toast.error("Please type the confirmation text exactly");
      return;
    }

    setIsResetting(true);
    const entities = getEntitiesToDelete();
    setResetProgress({ current: 0, total: entities.length, entity: '' });

    try {
      for (let i = 0; i < entities.length; i++) {
        const entityName = entities[i];
        setResetProgress({ current: i + 1, total: entities.length, entity: entityName });
        
        // Get all records for this entity in this org
        const records = await base44.entities[entityName].filter({ organisation_id: orgId });
        
        // Delete each record
        for (const record of records) {
          await base44.entities[entityName].delete(record.id);
        }
      }

      // Log the reset action
      await base44.entities.ActivityLog.create({
        organisation_id: orgId,
        action: 'data_reset',
        entity_type: 'System',
        description: `Data reset performed. Categories: ${selectedCategories.join(', ')}`,
        performed_by: currentEmployee?.id,
        performed_by_name: currentEmployee?.full_name,
      });

      toast.success("Data reset completed successfully");
      setShowConfirmDialog(false);
      setSelectedCategories([]);
      setConfirmText("");
    } catch (error) {
      toast.error("Error during reset: " + error.message);
    } finally {
      setIsResetting(false);
      setResetProgress({ current: 0, total: 0, entity: '' });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reset Data" subtitle="Start fresh with a clean database" />
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
            <p className="text-gray-500">Only Super Administrators can reset data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reset Data" 
        subtitle="Clear data and start fresh with a clean database"
      />

      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> This action will permanently delete all selected data. 
          This cannot be undone. Make sure to backup any important data before proceeding.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Data to Delete</CardTitle>
              <CardDescription>Choose which categories of data to clear</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedCategories.length === DATA_CATEGORIES.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATA_CATEGORIES.map(category => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => {}} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <category.icon className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-500'}`} />
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <p className="text-sm text-gray-500">{category.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Entities: {category.entities.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedCategories.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-medium text-red-800">
                  {selectedCategories.length} categories selected ({getEntitiesToDelete().length} entity types)
                </p>
                <p className="text-sm text-red-600">
                  All data in these categories will be permanently deleted
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="lg"
                onClick={() => setShowConfirmDialog(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Reset Selected Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Data Reset
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all selected data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {isResetting ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-12 h-12 mx-auto text-red-500 animate-spin mb-4" />
              <p className="font-medium">Deleting data...</p>
              <p className="text-sm text-gray-500 mt-2">
                Processing {resetProgress.entity} ({resetProgress.current}/{resetProgress.total})
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(resetProgress.current / resetProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800 mb-2">
                  <strong>You are about to delete:</strong>
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {selectedCategories.map(catId => {
                    const cat = DATA_CATEGORIES.find(c => c.id === catId);
                    return <li key={catId}>{cat?.label}</li>;
                  })}
                </ul>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Type <span className="font-mono bg-gray-100 px-1">DELETE ALL DATA</span> to confirm:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type confirmation text..."
                  className="font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReset}
              disabled={confirmText !== "DELETE ALL DATA" || isResetting}
            >
              {isResetting ? 'Deleting...' : 'Delete All Selected Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}