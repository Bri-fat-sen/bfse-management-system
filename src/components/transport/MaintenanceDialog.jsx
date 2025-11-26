import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
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
  preselectedVehicleId
}) {
  const queryClient = useQueryClient();
  const isEditing = !!maintenance;
  
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

    // Update vehicle mileage if provided
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle>{isEditing ? 'Edit Maintenance' : 'Log Maintenance'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Vehicle *</Label>
              <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                <SelectTrigger className="mt-1">
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

            <div>
              <Label>Maintenance Type *</Label>
              <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({...formData, maintenance_type: v})}>
                <SelectTrigger className="mt-1">
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
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger className="mt-1">
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
              <Label>Date Performed *</Label>
              <Input 
                type="date"
                value={formData.date_performed}
                onChange={(e) => setFormData({...formData, date_performed: e.target.value})}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger className="mt-1">
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

            <div>
              <Label>Cost (Le)</Label>
              <Input 
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label>Mileage at Service</Label>
              <Input 
                type="number"
                value={formData.mileage_at_service}
                onChange={(e) => setFormData({...formData, mileage_at_service: e.target.value})}
                className="mt-1"
                placeholder="Current odometer"
              />
            </div>

            <div>
              <Label>Vendor</Label>
              <Input 
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                className="mt-1"
                placeholder="Garage or mechanic"
              />
            </div>

            <div>
              <Label>Vendor Contact</Label>
              <Input 
                value={formData.vendor_contact}
                onChange={(e) => setFormData({...formData, vendor_contact: e.target.value})}
                className="mt-1"
                placeholder="Phone number"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1"
                placeholder="Details about the maintenance work..."
                rows={2}
              />
            </div>

            <div className="col-span-2 border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Next Service Reminder (Optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Next Due Date</Label>
                  <Input 
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Next Due Mileage</Label>
                  <Input 
                    type="number"
                    value={formData.next_due_mileage}
                    onChange={(e) => setFormData({...formData, next_due_mileage: e.target.value})}
                    className="mt-1"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1"
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.vehicle_id}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update' : 'Save Maintenance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}