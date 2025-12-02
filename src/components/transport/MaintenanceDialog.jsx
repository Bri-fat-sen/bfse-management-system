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
import { Loader2, Wrench, X, Check, Car, Calendar, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const maintenanceTypes = [
  { value: "oil_change", label: "Oil Change" },
  { value: "tire_rotation", label: "Tire Rotation" },
  { value: "tire_replacement", label: "Tire Replacement" },
  { value: "brake_service", label: "Brake Service" },
  { value: "engine_repair", label: "Engine Repair" },
  { value: "transmission", label: "Transmission" },
  { value: "battery", label: "Battery" },
  { value: "air_filter", label: "Air Filter" },
  { value: "fuel_filter", label: "Fuel Filter" },
  { value: "coolant_flush", label: "Coolant Flush" },
  { value: "inspection", label: "Inspection" },
  { value: "body_repair", label: "Body Repair" },
  { value: "electrical", label: "Electrical" },
  { value: "scheduled_service", label: "Scheduled Service" },
  { value: "other", label: "Other" },
];

export default function MaintenanceDialog({ 
  open, 
  onOpenChange, 
  maintenance, 
  vehicles = [], 
  currentEmployee,
  orgId,
  preselectedVehicleId,
  organisation
}) {
  const queryClient = useQueryClient();
  const isEditing = !!maintenance;
  const [activeSection, setActiveSection] = useState('vehicle');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_type: 'scheduled_service',
    category: 'scheduled',
    description: '',
    date_performed: format(new Date(), 'yyyy-MM-dd'),
    mileage_at_service: '',
    cost: '',
    vendor: '',
    vendor_contact: '',
    next_due_date: '',
    next_due_mileage: '',
    status: 'completed',
    notes: '',
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle_id: maintenance.vehicle_id || '',
        maintenance_type: maintenance.maintenance_type || 'scheduled_service',
        category: maintenance.category || 'scheduled',
        description: maintenance.description || '',
        date_performed: maintenance.date_performed || format(new Date(), 'yyyy-MM-dd'),
        mileage_at_service: maintenance.mileage_at_service || '',
        cost: maintenance.cost || '',
        vendor: maintenance.vendor || '',
        vendor_contact: maintenance.vendor_contact || '',
        next_due_date: maintenance.next_due_date || '',
        next_due_mileage: maintenance.next_due_mileage || '',
        status: maintenance.status || 'completed',
        notes: maintenance.notes || '',
      });
    } else {
      setFormData({
        vehicle_id: preselectedVehicleId || '',
        maintenance_type: 'scheduled_service',
        category: 'scheduled',
        description: '',
        date_performed: format(new Date(), 'yyyy-MM-dd'),
        mileage_at_service: '',
        cost: '',
        vendor: '',
        vendor_contact: '',
        next_due_date: '',
        next_due_mileage: '',
        status: 'completed',
        notes: '',
      });
    }
    if (open) {
      setActiveSection('vehicle');
    }
  }, [maintenance, open, preselectedVehicleId]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.VehicleMaintenance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onOpenChange(false);
      toast.success("Maintenance record created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.VehicleMaintenance.update(maintenance.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleMaintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onOpenChange(false);
      toast.success("Maintenance record updated");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

    const data = {
      organisation_id: orgId,
      vehicle_id: formData.vehicle_id,
      vehicle_registration: selectedVehicle?.registration_number || '',
      maintenance_type: formData.maintenance_type,
      category: formData.category,
      description: formData.description,
      date_performed: formData.date_performed,
      mileage_at_service: parseFloat(formData.mileage_at_service) || 0,
      cost: parseFloat(formData.cost) || 0,
      vendor: formData.vendor,
      vendor_contact: formData.vendor_contact,
      next_due_date: formData.next_due_date || null,
      next_due_mileage: parseFloat(formData.next_due_mileage) || null,
      status: formData.status,
      performed_by: currentEmployee?.id,
      performed_by_name: currentEmployee?.full_name,
      notes: formData.notes,
    };

    if (formData.mileage_at_service && selectedVehicle) {
      await base44.entities.Vehicle.update(selectedVehicle.id, {
        current_mileage: parseFloat(formData.mileage_at_service),
        last_service_date: formData.date_performed
      });
    }

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const sections = [
    { id: 'vehicle', label: 'Vehicle', icon: Car },
    { id: 'service', label: 'Service', icon: Wrench },
    { id: 'cost', label: 'Cost', icon: DollarSign },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
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
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Maintenance' : 'Log Maintenance'}
                </h2>
                <p className="text-white/80 text-sm">Record vehicle service details</p>
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
            
            {/* Vehicle Section */}
            {activeSection === 'vehicle' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Car className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Vehicle & Type</h3>
                </div>

                <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                  <Label className="text-[#1EB053] font-medium">Vehicle *</Label>
                  <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                    <SelectTrigger className="mt-2 border-[#1EB053]/30 bg-white">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.registration_number} - {v.brand} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Maintenance Type *</Label>
                    <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({...formData, maintenance_type: v})}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="unscheduled">Unscheduled</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date Performed *
                    </Label>
                    <Input 
                      type="date"
                      value={formData.date_performed}
                      onChange={(e) => setFormData({...formData, date_performed: e.target.value})}
                      required
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Service Section */}
            {activeSection === 'service' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <Wrench className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Service Details</h3>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1.5 border-gray-200"
                    placeholder="Details about the maintenance work..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Vendor</Label>
                    <Input 
                      value={formData.vendor}
                      onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                      className="mt-1.5 border-gray-200"
                      placeholder="Garage or mechanic"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Vendor Contact</Label>
                    <Input 
                      value={formData.vendor_contact}
                      onChange={(e) => setFormData({...formData, vendor_contact: e.target.value})}
                      className="mt-1.5 border-gray-200"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Next Service Reminder (Optional)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600 text-sm">Next Due Date</Label>
                      <Input 
                        type="date"
                        value={formData.next_due_date}
                        onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                        className="mt-1 border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-600 text-sm">Next Due Mileage</Label>
                      <Input 
                        type="number"
                        value={formData.next_due_mileage}
                        onChange={(e) => setFormData({...formData, next_due_mileage: e.target.value})}
                        className="mt-1 border-gray-200 bg-white"
                        placeholder="e.g., 50000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Section */}
            {activeSection === 'cost' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Cost & Mileage</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                    <Label className="text-red-700 font-medium">Cost (Le)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">Le</span>
                      <Input 
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        className="pl-10 border-red-200 bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium">Mileage at Service</Label>
                    <div className="relative mt-2">
                      <Input 
                        type="number"
                        value={formData.mileage_at_service}
                        onChange={(e) => setFormData({...formData, mileage_at_service: e.target.value})}
                        className="pr-12 border-gray-200 bg-white"
                        placeholder="Current odometer"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1.5 border-gray-200"
                    placeholder="Additional notes..."
                    rows={3}
                  />
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
              disabled={isPending || !formData.vehicle_id}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{isEditing ? 'Update' : 'Save Maintenance'}</>
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