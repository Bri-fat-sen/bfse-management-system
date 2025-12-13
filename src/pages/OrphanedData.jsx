import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Trash2, 
  AlertTriangle, 
  Package, 
  Users, 
  Clock, 
  DollarSign,
  Truck,
  MessageSquare,
  Calendar,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";

const ENTITY_CONFIG = [
  // Employee references
  { name: "Attendance", icon: Clock, parentField: "employee_id", parentEntity: "Employee" },
  { name: "Payroll", icon: DollarSign, parentField: "employee_id", parentEntity: "Employee" },
  { name: "Sale", icon: DollarSign, parentField: "employee_id", parentEntity: "Employee" },
  { name: "Trip", icon: Truck, parentField: "driver_id", parentEntity: "Employee" },
  { name: "Expense", icon: DollarSign, parentField: "recorded_by", parentEntity: "Employee" },
  { name: "Revenue", icon: DollarSign, parentField: "recorded_by", parentEntity: "Employee" },
  { name: "ChatMessage", icon: MessageSquare, parentField: "sender_id", parentEntity: "Employee" },
  { name: "Meeting", icon: Calendar, parentField: "organizer_id", parentEntity: "Employee" },
  { name: "LeaveRequest", icon: Calendar, parentField: "employee_id", parentEntity: "Employee" },
  { name: "PerformanceReview", icon: FileText, parentField: "employee_id", parentEntity: "Employee" },
  { name: "Notification", icon: MessageSquare, parentField: "recipient_id", parentEntity: "Employee" },
  { name: "Task", icon: FileText, parentField: "assigned_to", parentEntity: "Employee" },
  { name: "EmployeeDocument", icon: FileText, parentField: "employee_id", parentEntity: "Employee" },
  { name: "ActivityLog", icon: Clock, parentField: "employee_id", parentEntity: "Employee" },
  { name: "BankDeposit", icon: DollarSign, parentField: "deposited_by", parentEntity: "Employee" },
  { name: "PayrollAudit", icon: DollarSign, parentField: "employee_id", parentEntity: "Employee" },
  { name: "WorkSchedule", icon: Clock, parentField: "employee_id", parentEntity: "Employee" },
  { name: "TruckContract", icon: Truck, parentField: "driver_id", parentEntity: "Employee" },
  { name: "VehicleMaintenance", icon: Truck, parentField: "performed_by", parentEntity: "Employee" },
  { name: "ProductionBatch", icon: Package, parentField: "supervisor_id", parentEntity: "Employee" },
  { name: "SavedReport", icon: FileText, parentField: "created_by_id", parentEntity: "Employee" },
  { name: "Budget", icon: DollarSign, parentField: "assigned_to_id", parentEntity: "Employee" },
  { name: "Budget", icon: DollarSign, parentField: "created_by_id", parentEntity: "Employee", secondCheck: true },
  { name: "PayrollRun", icon: DollarSign, parentField: "created_by_id", parentEntity: "Employee" },
  { name: "PayrollRun", icon: DollarSign, parentField: "submitted_by_id", parentEntity: "Employee", secondCheck: true },
  { name: "PayrollRun", icon: DollarSign, parentField: "reviewed_by_id", parentEntity: "Employee", thirdCheck: true },
  { name: "PayrollRun", icon: DollarSign, parentField: "approved_by_id", parentEntity: "Employee", fourthCheck: true },
  
  // Product references
  { name: "StockMovement", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "StockLevel", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "InventoryBatch", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "SupplierProduct", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "SerializedItem", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "ReorderSuggestion", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "StockAlert", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "InventoryAudit", icon: Package, parentField: "product_id", parentEntity: "Product" },
  { name: "ProductionBatch", icon: Package, parentField: "product_id", parentEntity: "Product", secondCheck: true },
  
  // Warehouse references
  { name: "StockLevel", icon: Package, parentField: "warehouse_id", parentEntity: "Warehouse", secondCheck: true },
  { name: "StockMovement", icon: Package, parentField: "warehouse_id", parentEntity: "Warehouse", secondCheck: true },
  { name: "Vehicle", icon: Truck, parentField: "parent_warehouse_id", parentEntity: "Warehouse" },
  { name: "Budget", icon: DollarSign, parentField: "location_id", parentEntity: "Warehouse", thirdCheck: true },
  
  // Vehicle references
  { name: "Trip", icon: Truck, parentField: "vehicle_id", parentEntity: "Vehicle", secondCheck: true },
  { name: "TruckContract", icon: Truck, parentField: "vehicle_id", parentEntity: "Vehicle", secondCheck: true },
  { name: "VehicleMaintenance", icon: Truck, parentField: "vehicle_id", parentEntity: "Vehicle", secondCheck: true },
  
  // Supplier references
  { name: "SupplierProduct", icon: Package, parentField: "supplier_id", parentEntity: "Supplier", secondCheck: true },
  { name: "PurchaseOrder", icon: FileText, parentField: "supplier_id", parentEntity: "Supplier" },
  { name: "SupplierPriceHistory", icon: DollarSign, parentField: "supplier_id", parentEntity: "Supplier" },
  
  // Customer references
  { name: "Sale", icon: DollarSign, parentField: "customer_id", parentEntity: "Customer", secondCheck: true },
  { name: "CustomerInteraction", icon: MessageSquare, parentField: "customer_id", parentEntity: "Customer" },
  
  // Route references
  { name: "Trip", icon: Truck, parentField: "route_id", parentEntity: "Route", thirdCheck: true },
];

export default function OrphanedData() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all parent entities for reference
  const { data: employees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch ALL employees to find ones with missing org_id
  const { data: allEmployeesRaw = [] } = useQuery({
    queryKey: ['allEmployeesRaw'],
    queryFn: () => base44.entities.Employee.list(),
    staleTime: 60000,
  });

  // Fetch all organisations
  const { data: allOrganisations = [] } = useQuery({
    queryKey: ['allOrganisations'],
    queryFn: () => base44.entities.Organisation.list(),
    staleTime: 60000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['allProducts', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['allWarehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['allVehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['allSuppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['allCustomers', orgId],
    queryFn: () => base44.entities.Customer.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['allRoutes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const employeeIds = useMemo(() => new Set(employees.map(e => e.id)), [employees]);
  const productIds = useMemo(() => new Set(products.map(p => p.id)), [products]);
  const warehouseIds = useMemo(() => new Set(warehouses.map(w => w.id)), [warehouses]);
  const vehicleIds = useMemo(() => new Set(vehicles.map(v => v.id)), [vehicles]);
  const supplierIds = useMemo(() => new Set(suppliers.map(s => s.id)), [suppliers]);
  const customerIds = useMemo(() => new Set(customers.map(c => c.id)), [customers]);
  const routeIds = useMemo(() => new Set(routes.map(r => r.id)), [routes]);
  const organisationIds = useMemo(() => new Set(allOrganisations.map(o => o.id)), [allOrganisations]);

  // Find employees with missing or invalid organisation_id
  const orphanedEmployees = useMemo(() => {
    return allEmployeesRaw.filter(emp => !emp.organisation_id || !organisationIds.has(emp.organisation_id));
  }, [allEmployeesRaw, organisationIds]);

  // Find organisations with no employees or data
  const orphanedOrganisations = useMemo(() => {
    return allOrganisations.filter(org => {
      const hasEmployees = allEmployeesRaw.some(emp => emp.organisation_id === org.id);
      const hasProducts = products.some(p => p.organisation_id === org.id);
      const hasWarehouses = warehouses.some(w => w.organisation_id === org.id);
      const hasVehicles = vehicles.some(v => v.organisation_id === org.id);
      const hasSuppliers = suppliers.some(s => s.organisation_id === org.id);
      const hasCustomers = customers.some(c => c.organisation_id === org.id);
      const hasRoutes = routes.some(r => r.organisation_id === org.id);
      
      return !hasEmployees && !hasProducts && !hasWarehouses && !hasVehicles && !hasSuppliers && !hasCustomers && !hasRoutes;
    });
  }, [allOrganisations, allEmployeesRaw, products, warehouses, vehicles, suppliers, customers, routes]);

  // Fetch data for each entity type
  const entityQueries = ENTITY_CONFIG.map(config => {
    return useQuery({
      queryKey: [config.name.toLowerCase(), orgId],
      queryFn: async () => {
        try {
          const records = await base44.entities[config.name].filter({ organisation_id: orgId });
          return { name: config.name, records, config };
        } catch (e) {
          return { name: config.name, records: [], config };
        }
      },
      enabled: !!orgId,
    });
  });

  const isLoading = entityQueries.some(q => q.isLoading);

  // Calculate orphaned records for each entity
  const orphanedData = useMemo(() => {
    const result = [];
    const processed = new Map(); // Track which entity+field combos we've checked
    
    entityQueries.forEach(query => {
      if (!query.data) return;
      
      const { name, records, config } = query.data;
      
      // Get parent IDs based on parent entity type
      let parentIds;
      switch(config.parentEntity) {
        case "Employee": parentIds = employeeIds; break;
        case "Product": parentIds = productIds; break;
        case "Warehouse": parentIds = warehouseIds; break;
        case "Vehicle": parentIds = vehicleIds; break;
        case "Supplier": parentIds = supplierIds; break;
        case "Customer": parentIds = customerIds; break;
        case "Route": parentIds = routeIds; break;
        default: return;
      }
      
      const orphaned = records.filter(record => {
        const parentId = record[config.parentField];
        return parentId && !parentIds.has(parentId);
      });
      
      if (orphaned.length > 0) {
        const key = `${name}-${config.parentField}`;
        if (!processed.has(key)) {
          result.push({
            entity: name,
            icon: config.icon,
            orphanedRecords: orphaned,
            parentField: config.parentField,
            parentEntity: config.parentEntity,
            totalRecords: records.length,
          });
          processed.set(key, true);
        }
      }
    });
    
    return result;
  }, [entityQueries, employeeIds, productIds, warehouseIds, vehicleIds, supplierIds, customerIds, routeIds]);

  const totalOrphaned = orphanedData.reduce((sum, d) => sum + d.orphanedRecords.length, 0);

  const handleSelectAll = (entity) => {
    const entityData = orphanedData.find(d => d.entity === entity);
    if (!entityData) return;
    
    const allIds = entityData.orphanedRecords.map(r => r.id);
    const allSelected = allIds.every(id => selectedRecords.includes(id));
    
    if (allSelected) {
      setSelectedRecords(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedRecords(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const deleteOrphanedMutation = useMutation({
    mutationFn: async ({ entity, recordIds }) => {
      for (const id of recordIds) {
        await base44.entities[entity].delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSelectedRecords([]);
      toast.success("Deleted", "Orphaned records have been removed");
    },
    onError: (error) => {
      toast.error("Delete failed", error.message);
    }
  });

  const handleDeleteSelected = async () => {
    if (!selectedEntity || selectedRecords.length === 0) return;
    
    setIsDeleting(true);
    try {
      await deleteOrphanedMutation.mutateAsync({ 
        entity: selectedEntity, 
        recordIds: selectedRecords 
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteAllForEntity = async (entity) => {
    const entityData = orphanedData.find(d => d.entity === entity);
    if (!entityData) return;
    
    setSelectedEntity(entity);
    setSelectedRecords(entityData.orphanedRecords.map(r => r.id));
    setShowDeleteDialog(true);
  };

  const handleDeleteAllOrphaned = async () => {
    setIsDeleting(true);
    try {
      for (const data of orphanedData) {
        const recordIds = data.orphanedRecords.map(r => r.id);
        for (const id of recordIds) {
          await base44.entities[data.entity].delete(id);
        }
      }
      queryClient.invalidateQueries();
      toast.success("Cleanup complete", `Deleted ${totalOrphaned} orphaned records`);
    } catch (error) {
      toast.error("Cleanup failed", error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user || isLoading) {
    return <LoadingSpinner message="Scanning for orphaned data..." />;
  }

  return (
    <ProtectedPage module="settings" requiredPermission="can_delete">
      <div className="space-y-4 sm:space-y-6">
        {/* Sierra Leone Stripe */}
        <div className="h-1 w-full flex rounded-full overflow-hidden">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white border-y border-gray-200" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Modern Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl blur opacity-30" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center shadow-xl">
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Data Cleanup
            </h1>
            <p className="text-sm text-gray-500 mt-1">Remove records with invalid references</p>
          </div>
        </div>

        {/* Orphaned Employees Alert */}
        {orphanedEmployees.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Employees with missing organisation</p>
                    <p className="text-sm text-red-700 mb-3">
                      {orphanedEmployees.length} employee{orphanedEmployees.length !== 1 ? 's' : ''} found without valid organisation_id
                    </p>
                    <div className="space-y-2">
                      {orphanedEmployees.map(emp => (
                        <div key={emp.id} className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{emp.full_name || emp.first_name + ' ' + emp.last_name}</p>
                              <p className="text-sm text-gray-600">{emp.email || emp.user_email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Employee Code: {emp.employee_code} | Role: {emp.role?.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                {!emp.organisation_id ? 'Missing organisation_id' : 'Invalid organisation_id: ' + emp.organisation_id}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                const confirmDelete = window.confirm(`Delete employee ${emp.full_name || emp.email}?`);
                                if (confirmDelete) {
                                  base44.entities.Employee.delete(emp.id).then(() => {
                                    queryClient.invalidateQueries();
                                    toast.success("Employee deleted");
                                  }).catch(err => {
                                    toast.error("Delete failed", err.message);
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orphaned Organisations Alert */}
        {orphanedOrganisations.length > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800">Orphaned organisations</p>
                    <p className="text-sm text-orange-700 mb-3">
                      {orphanedOrganisations.length} organisation{orphanedOrganisations.length !== 1 ? 's' : ''} found with no employees or data
                    </p>
                    <div className="space-y-2">
                      {orphanedOrganisations.map(org => (
                        <div key={org.id} className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{org.name}</p>
                              <p className="text-sm text-gray-600">Code: {org.code}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {org.created_date?.split('T')[0] || 'Unknown'}
                              </p>
                              <p className="text-xs text-orange-600 mt-1">
                                No employees, products, or other data linked to this organisation
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                const confirmDelete = window.confirm(`Delete organisation "${org.name}"? This action cannot be undone.`);
                                if (confirmDelete) {
                                  base44.asServiceRole.entities.Organisation.delete(org.id).then(() => {
                                    queryClient.invalidateQueries();
                                    toast.success("Organisation deleted");
                                  }).catch(err => {
                                    toast.error("Delete failed", err.message);
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Orphaned</p>
                  <p className="text-3xl font-bold text-amber-600">{totalOrphaned + orphanedEmployees.length + orphanedOrganisations.length}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-[#0072C6]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Affected Entities</p>
                  <p className="text-3xl font-bold text-[#0072C6]">{orphanedData.length}</p>
                </div>
                <Package className="w-10 h-10 text-[#0072C6]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Active References</p>
                  <p className="text-3xl font-bold text-[#1EB053]">
                    {employees.length + products.length + warehouses.length + vehicles.length + suppliers.length + customers.length + routes.length}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-[#1EB053]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {totalOrphaned > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Orphaned data detected</p>
                    <p className="text-sm text-amber-700">
                      {totalOrphaned} records with invalid references detected
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedEntity(null);
                    setShowDeleteDialog(true);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Orphaned
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {totalOrphaned === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#1EB053] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">No Orphaned Data Found</h3>
              <p className="text-gray-500 mt-2">All records have valid parent references</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orphanedData.map(data => {
                  const Icon = data.icon;
                  return (
                    <Card key={data.entity} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{data.entity}</CardTitle>
                              <p className="text-xs text-gray-500">
                                Missing: {data.parentEntity}
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive">{data.orphanedRecords.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{data.orphanedRecords.length} of {data.totalRecords} orphaned</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteAllForEntity(data.entity)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete All
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4 space-y-4">
              {orphanedData.map(data => {
                const Icon = data.icon;
                const entityRecordIds = data.orphanedRecords.map(r => r.id);
                const allSelected = entityRecordIds.every(id => selectedRecords.includes(id));
                const someSelected = entityRecordIds.some(id => selectedRecords.includes(id));
                
                return (
                  <Card key={data.entity}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-amber-600" />
                          <CardTitle>{data.entity}</CardTitle>
                          <Badge variant="outline">{data.orphanedRecords.length} orphaned</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {someSelected && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedEntity(data.entity);
                                setShowDeleteDialog(true);
                              }}
                            >
                              Delete Selected ({selectedRecords.filter(id => entityRecordIds.includes(id)).length})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(data.entity)}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={allSelected}
                                  onCheckedChange={() => handleSelectAll(data.entity)}
                                />
                              </TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Missing {data.parentEntity}</TableHead>
                              <TableHead>Created Date</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.orphanedRecords.slice(0, 20).map(record => (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedRecords.includes(record.id)}
                                    onCheckedChange={() => handleSelectRecord(record.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {record.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-xs text-gray-500">
                                      {record[data.parentField]?.substring(0, 12)}...
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {record.created_date?.split('T')[0] || '-'}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500 max-w-48 truncate">
                                  {record.employee_name || record.product_name || record.description || record.notes || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {data.orphanedRecords.length > 20 && (
                          <p className="text-center text-sm text-gray-500 mt-2">
                            Showing 20 of {data.orphanedRecords.length} records
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedEntity ? (
                  <>
                    You are about to delete <strong>{selectedRecords.length}</strong> orphaned {selectedEntity} records.
                  </>
                ) : (
                  <>
                    You are about to delete <strong>all {totalOrphaned}</strong> orphaned records across all entities.
                  </>
                )}
                <br /><br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={selectedEntity ? handleDeleteSelected : handleDeleteAllOrphaned}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedPage>
  );
}