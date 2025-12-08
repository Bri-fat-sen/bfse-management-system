import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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
import { 
  Loader2, Truck, X, Check, Car, Fuel, Calendar, 
  Gauge, User, Shield, Settings
} from "lucide-react";

const vehicleTypes = [
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "minibus", label: "Minibus", icon: "🚐" },
  { value: "truck", label: "Truck", icon: "🚛" },
  { value: "van", label: "Van", icon: "🚙" },
  { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
  { value: "car", label: "Car", icon: "🚗" },
];

const fuelTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
];

export default function VehicleDialog({ open, onOpenChange, orgId, drivers = [], editingVehicle = null, organisation }) {
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const [formData, setFormData] = useState({
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

  useEffect(() => {
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
      setShowAdvanced(true);
    } else {
      resetForm();
      setShowAdvanced(false);
    }
  }, [editingVehicle, open]);

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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to save</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
              <Label className="text-[#1EB053] font-medium">Registration Number *</Label>
              <Input
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                placeholder="ABC 123"
                required
                autoFocus
                className="mt-2 text-lg font-semibold border-[#1EB053]/30 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={formData.vehicle_type} onValueChange={(v) => setFormData(prev => ({ ...prev, vehicle_type: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2"><span>{type.icon}</span>{type.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Driver</Label>
                <Select value={formData.assigned_driver_id} onValueChange={(v) => setFormData(prev => ({ ...prev, assigned_driver_id: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>{driver.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Details
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Brand</Label>
                    <Input value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} placeholder="Toyota" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Model</Label>
                    <Input value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} placeholder="Coaster" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Year</Label>
                    <Input type="number" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))} min="1990" max={new Date().getFullYear() + 1} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Capacity</Label>
                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))} placeholder="30" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Fuel Type</Label>
                    <Select value={formData.fuel_type} onValueChange={(v) => setFormData(prev => ({ ...prev, fuel_type: v }))}>
                      <SelectTrigger className="mt-1.5">
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
                    <Label className="text-sm">Mileage (km)</Label>
                    <Input type="number" value={formData.current_mileage} onChange={(e) => setFormData(prev => ({ ...prev, current_mileage: e.target.value }))} placeholder="0" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Insurance Expiry</Label>
                    <Input type="date" value={formData.insurance_expiry} onChange={(e) => setFormData(prev => ({ ...prev, insurance_expiry: e.target.value }))} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Last Service</Label>
                    <Input type="date" value={formData.last_service_date} onChange={(e) => setFormData(prev => ({ ...prev, last_service_date: e.target.value }))} className="mt-1.5" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Notes..." rows={2} className="mt-1.5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{editingVehicle ? 'Update' : 'Add'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}