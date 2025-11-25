import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Warehouse,
  Store,
  Truck,
  Plus,
  Users,
  MapPin,
  Phone,
  Edit,
  Trash2,
  MoreVertical,
  UserPlus,
  UserMinus,
  Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function Locations() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("warehouses");
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showAssignStaffDialog, setShowAssignStaffDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [locationType, setLocationType] = useState("warehouse");

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
  const isSuperAdmin = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['allStockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Get staff assigned to each location
  const getLocationStaff = (locationId) => {
    return employees.filter(emp => emp.assigned_location_id === locationId);
  };

  // Get stock count for location
  const getLocationStockCount = (locationId) => {
    return stockLevels
      .filter(sl => sl.warehouse_id === locationId)
      .reduce((sum, sl) => sum + (sl.quantity || 0), 0);
  };

  // Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: (data) => base44.entities.Warehouse.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Location created successfully");
      setShowLocationDialog(false);
      setEditingLocation(null);
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Warehouse.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Location updated successfully");
      setShowLocationDialog(false);
      setEditingLocation(null);
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id) => base44.entities.Warehouse.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({ title: "Location deleted" });
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: "Vehicle created successfully" });
      setShowLocationDialog(false);
      setEditingLocation(null);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: "Vehicle updated successfully" });
      setShowLocationDialog(false);
      setEditingLocation(null);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: "Vehicle deleted" });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Staff assignment updated" });
    },
  });

  const handleSaveLocation = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (locationType === 'vehicle') {
      const vehicleData = {
        organisation_id: orgId,
        registration_number: formData.get('registration_number'),
        vehicle_type: formData.get('vehicle_type') || 'van',
        brand: formData.get('brand'),
        model: formData.get('model'),
        capacity: parseInt(formData.get('capacity')) || 0,
        status: 'active',
      };
      
      if (editingLocation) {
        updateVehicleMutation.mutate({ id: editingLocation.id, data: vehicleData });
      } else {
        createVehicleMutation.mutate(vehicleData);
      }
    } else {
      const warehouseData = {
        organisation_id: orgId,
        name: formData.get('name'),
        code: formData.get('code'),
        address: formData.get('address'),
        city: formData.get('city'),
        phone: formData.get('phone'),
        capacity: formData.get('capacity'),
        is_active: true,
      };
      
      if (editingLocation) {
        updateWarehouseMutation.mutate({ id: editingLocation.id, data: warehouseData });
      } else {
        createWarehouseMutation.mutate(warehouseData);
      }
    }
  };

  const handleDeleteLocation = () => {
    if (!locationToDelete) return;
    
    if (locationToDelete.type === 'vehicle') {
      deleteVehicleMutation.mutate(locationToDelete.id);
    } else {
      deleteWarehouseMutation.mutate(locationToDelete.id);
    }
    setLocationToDelete(null);
  };

  const handleAssignStaff = async (employeeId) => {
    if (!selectedLocation) return;
    
    await updateEmployeeMutation.mutateAsync({
      id: employeeId,
      data: {
        assigned_location_id: selectedLocation.id,
        assigned_location_name: selectedLocation.name || selectedLocation.registration_number,
        assigned_location_type: selectedLocation.type,
      }
    });
  };

  const handleUnassignStaff = async (employeeId) => {
    await updateEmployeeMutation.mutateAsync({
      id: employeeId,
      data: {
        assigned_location_id: null,
        assigned_location_name: null,
        assigned_location_type: null,
      }
    });
  };

  const openAddLocation = (type) => {
    setLocationType(type);
    setEditingLocation(null);
    setShowLocationDialog(true);
  };

  const openEditLocation = (location, type) => {
    setLocationType(type);
    setEditingLocation(location);
    setShowLocationDialog(true);
  };

  const openAssignStaff = (location, type) => {
    setSelectedLocation({ ...location, type });
    setShowAssignStaffDialog(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-500">Only super admins can manage locations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const LocationCard = ({ location, type }) => {
    const staff = getLocationStaff(location.id);
    const stockCount = getLocationStockCount(location.id);
    const Icon = type === 'vehicle' ? Truck : type === 'store' ? Store : Warehouse;
    const name = type === 'vehicle' ? location.registration_number : location.name;
    
    return (
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                type === 'vehicle' ? 'bg-purple-100' : 
                type === 'store' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  type === 'vehicle' ? 'text-purple-600' : 
                  type === 'store' ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                {type === 'vehicle' ? (
                  <p className="text-sm text-gray-500">{location.brand} {location.model}</p>
                ) : (
                  <p className="text-sm text-gray-500">{location.city || location.address}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openAssignStaff(location, type)}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditLocation(location, type)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setLocationToDelete({ ...location, type })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Users className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <p className="text-lg font-bold">{staff.length}</p>
              <p className="text-xs text-gray-500">Staff</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Package className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <p className="text-lg font-bold">{stockCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Stock Units</p>
            </div>
          </div>

          {staff.length > 0 && (
            <div className="flex -space-x-2">
              {staff.slice(0, 5).map((s) => (
                <Avatar key={s.id} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={s.profile_photo} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                    {s.first_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {staff.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                  +{staff.length - 5}
                </div>
              )}
            </div>
          )}

          <Badge 
            variant={location.is_active !== false && location.status !== 'inactive' ? 'outline' : 'secondary'}
            className="mt-3"
          >
            {location.is_active !== false && location.status !== 'inactive' ? 'Active' : 'Inactive'}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        subtitle="Manage warehouses, stores, and vehicles"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="warehouses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Warehouse className="w-4 h-4 mr-2" />
              Warehouses/Stores
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Truck className="w-4 h-4 mr-2" />
              Vehicles
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => openAddLocation(activeTab === 'vehicles' ? 'vehicle' : 'warehouse')}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'vehicles' ? 'Vehicle' : 'Location'}
          </Button>
        </div>

        <TabsContent value="warehouses">
          {warehouses.length === 0 ? (
            <EmptyState
              icon={Warehouse}
              title="No Locations Yet"
              description="Create warehouses or stores to manage inventory and staff"
              action={() => openAddLocation('warehouse')}
              actionLabel="Add Location"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map((warehouse) => (
                <LocationCard key={warehouse.id} location={warehouse} type="warehouse" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicles">
          {vehicles.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No Vehicles Yet"
              description="Add vehicles for mobile sales and deliveries"
              action={() => openAddLocation('vehicle')}
              actionLabel="Add Vehicle"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <LocationCard key={vehicle.id} location={vehicle} type="vehicle" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit' : 'Add'} {locationType === 'vehicle' ? 'Vehicle' : 'Location'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLocation} className="space-y-4">
            {locationType === 'vehicle' ? (
              <>
                <div>
                  <Label>Registration Number *</Label>
                  <Input
                    name="registration_number"
                    defaultValue={editingLocation?.registration_number}
                    placeholder="e.g. ABC-1234"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand</Label>
                    <Input
                      name="brand"
                      defaultValue={editingLocation?.brand}
                      placeholder="e.g. Toyota"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      name="model"
                      defaultValue={editingLocation?.model}
                      placeholder="e.g. Hiace"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select name="vehicle_type" defaultValue={editingLocation?.vehicle_type || 'van'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      name="capacity"
                      type="number"
                      defaultValue={editingLocation?.capacity}
                      placeholder="e.g. 100"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Name *</Label>
                  <Input
                    name="name"
                    defaultValue={editingLocation?.name}
                    placeholder="e.g. Main Warehouse"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input
                    name="code"
                    defaultValue={editingLocation?.code}
                    placeholder="e.g. WH001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    name="address"
                    defaultValue={editingLocation?.address}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      name="city"
                      defaultValue={editingLocation?.city}
                      placeholder="e.g. Freetown"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      defaultValue={editingLocation?.phone}
                      placeholder="Phone number"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    name="capacity"
                    defaultValue={editingLocation?.capacity}
                    placeholder="e.g. 1000 units"
                    className="mt-1"
                  />
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLocationDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                {editingLocation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignStaffDialog} onOpenChange={setShowAssignStaffDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Staff - {selectedLocation?.name || selectedLocation?.registration_number}</DialogTitle>
            <DialogDescription>Assign or remove staff from this location</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Assigned Staff</h4>
              {selectedLocation && getLocationStaff(selectedLocation.id).length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">No staff assigned</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedLocation && getLocationStaff(selectedLocation.id).map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                            {emp.first_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.role?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUnassignStaff(emp.id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Available Staff</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {employees
                  .filter(emp => !emp.assigned_location_id || emp.assigned_location_id !== selectedLocation?.id)
                  .map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                            {emp.first_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {emp.role?.replace(/_/g, ' ')}
                            {emp.assigned_location_name && (
                              <span className="ml-1 text-amber-600">• Currently at {emp.assigned_location_name}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleAssignStaff(emp.id)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{locationToDelete?.name || locationToDelete?.registration_number}"? 
              This will remove all stock records and staff assignments for this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLocation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}