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
  const [activeSection, setActiveSection] = useState('basic');

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
    } else {
      resetForm();
    }
    if (open) {
      setActiveSection('basic');
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

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Car },
    { id: 'specs', label: 'Specs', icon: Settings },
    { id: 'service', label: 'Service', icon: Shield },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <p className="text-white/80 text-sm">
                  {editingVehicle ? `Updating: ${editingVehicle.registration_number}` : 'Register a new fleet vehicle'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Car className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Vehicle Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium">Registration Number *</Label>
                    <Input
                      value={formData.registration_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                      placeholder="ABC 123"
                      required
                      className="mt-2 text-lg font-semibold border-[#1EB053]/30"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Vehicle Type</Label>
                    <Select
                      value={formData.vehicle_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, vehicle_type: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Toyota"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Coaster"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Year
                    </Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-3 h-3" /> Assigned Driver
                    </Label>
                    <Select
                      value={formData.assigned_driver_id}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, assigned_driver_id: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
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
                </div>
              </div>
            )}

            {/* Specs Section */}
            {activeSection === 'specs' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <Settings className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Specifications</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" /> Capacity (seats)
                    </Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="30"
                      className="mt-2 border-gray-200 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Fuel className="w-4 h-4" /> Fuel Type
                    </Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, fuel_type: v }))}
                    >
                      <SelectTrigger className="mt-2 border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map(fuel => (
                          <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                    <Label className="text-[#0072C6] font-medium flex items-center gap-2">
                      <Gauge className="w-4 h-4" /> Current Mileage
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        type="number"
                        value={formData.current_mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_mileage: e.target.value }))}
                        placeholder="0"
                        className="pr-12 border-[#0072C6]/30 bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0072C6] text-sm font-medium">km</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Section */}
            {activeSection === 'service' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Service & Compliance</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <Label className="text-amber-700 font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Insurance Expiry
                    </Label>
                    <Input
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, insurance_expiry: e.target.value }))}
                      className="mt-2 border-amber-200 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Last Service Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.last_service_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_service_date: e.target.value }))}
                      className="mt-2 border-gray-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 font-medium">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this vehicle..."
                      rows={3}
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{editingVehicle ? 'Update' : 'Add'} Vehicle</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}