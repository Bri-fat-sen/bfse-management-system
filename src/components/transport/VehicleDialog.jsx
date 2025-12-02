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
import { Loader2, Truck } from "lucide-react";

const vehicleTypes = [
  { value: "bus", label: "Bus" },
  { value: "minibus", label: "Minibus" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
];

const fuelTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
];

export default function VehicleDialog({ open, onOpenChange, orgId, drivers = [], editingVehicle = null }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    registration_number: editingVehicle?.registration_number || '',
    vehicle_type: editingVehicle?.vehicle_type || 'bus',
    brand: editingVehicle?.brand || '',
    model: editingVehicle?.model || '',
    year: editingVehicle?.year || new Date().getFullYear(),
    capacity: editingVehicle?.capacity || '',
    fuel_type: editingVehicle?.fuel_type || 'diesel',
    current_mileage: editingVehicle?.current_mileage || 0,
    assigned_driver_id: editingVehicle?.assigned_driver_id || '',
    insurance_expiry: editingVehicle?.insurance_expiry || '',
    last_service_date: editingVehicle?.last_service_date || '',
    notes: editingVehicle?.notes || '',
  });

  React.useEffect(() => {
    if (editingVehicle) {
      setFormData({
        registration_number: editingVehicle.registration_number || '',
        vehicle_type: editingVehicle.vehicle_type || 'bus',
        brand: editingVehicle.brand || '',
        model: editingVehicle.model || '',
        year: editingVehicle.year || new Date().getFullYear(),
        capacity: editingVehicle.capacity || '',
        fuel_type: editingVehicle.fuel_type || 'diesel',
        current_mileage: editingVehicle.current_mileage || 0,
        assigned_driver_id: editingVehicle.assigned_driver_id || '',
        insurance_expiry: editingVehicle.insurance_expiry || '',
        last_service_date: editingVehicle.last_service_date || '',
        notes: editingVehicle.notes || '',
      });
    } else {
      resetForm();
    }
  }, [editingVehicle]);

  const createVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create({
      ...data,
      organisation_id: orgId,
      status: 'active',
      year: parseInt(data.year),
      capacity: parseInt(data.capacity) || 0,
      current_mileage: parseInt(data.current_mileage) || 0,
      assigned_driver_name: drivers.find(d => d.id === data.assigned_driver_id)?.full_name || '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success("Vehicle added successfully");
      onOpenChange(false);
      resetForm();
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.update(editingVehicle.id, {
      ...data,
      year: parseInt(data.year),
      capacity: parseInt(data.capacity) || 0,
      current_mileage: parseInt(data.current_mileage) || 0,
      assigned_driver_name: drivers.find(d => d.id === data.assigned_driver_id)?.full_name || '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success("Vehicle updated successfully");
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setFormData({
      registration_number: '',
      vehicle_type: 'bus',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: '',
      fuel_type: 'diesel',
      current_mileage: 0,
      assigned_driver_id: '',
      insurance_expiry: '',
      last_service_date: '',
      notes: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.registration_number) {
      toast.error("Registration number is required");
      return;
    }
    if (editingVehicle) {
      updateVehicleMutation.mutate(formData);
    } else {
      createVehicleMutation.mutate(formData);
    }
  };

  const isPending = createVehicleMutation.isPending || updateVehicleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#1EB053]" />
            {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Registration Number *</Label>
              <Input
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                placeholder="ABC 123"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Vehicle Type</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, vehicle_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Brand</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Toyota"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Model</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Coaster"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Year</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Capacity (seats)</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Fuel Type</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, fuel_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map(fuel => (
                    <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Current Mileage</Label>
              <Input
                type="number"
                value={formData.current_mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, current_mileage: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Assigned Driver</Label>
            <Select
              value={formData.assigned_driver_id}
              onValueChange={(v) => setFormData(prev => ({ ...prev, assigned_driver_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No driver assigned</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>{driver.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Insurance Expiry</Label>
              <Input
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance_expiry: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Service Date</Label>
              <Input
                type="date"
                value={formData.last_service_date}
                onChange={(e) => setFormData(prev => ({ ...prev, last_service_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this vehicle..."
              rows={2}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}