import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Zap, X, Check, MapPin, Award, Shield } from "lucide-react";
import { toast } from "sonner";

const BULK_ACTIONS = [
  { value: "update_department", label: "Update Department", icon: Shield },
  { value: "update_role", label: "Update Role", icon: Shield },
  { value: "update_status", label: "Update Status", icon: Zap },
  { value: "assign_locations", label: "Assign Locations", icon: MapPin },
  { value: "assign_package", label: "Assign Package", icon: Award },
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support", "HR", "IT"];
const statuses = ["active", "inactive", "suspended"];

export default function BulkEmployeeActionsDialog({ 
  open, 
  onOpenChange, 
  selectedEmployeeIds = [], 
  employees = [],
  orgId 
}) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState("");
  const [value, setValue] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);

  const { data: packages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && action === 'assign_package',
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && action === 'assign_locations',
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId && action === 'assign_locations',
  });

  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, value, locations }) => {
      const results = await Promise.allSettled(
        selectedEmployeeIds.map(async (id) => {
          const employee = employees.find(e => e.id === id);
          if (!employee) return;

          let updateData = {};

          switch (action) {
            case 'update_department':
              updateData = { department: value };
              break;
            case 'update_role':
              updateData = { role: value };
              break;
            case 'update_status':
              updateData = { status: value };
              break;
            case 'assign_locations':
              updateData = { 
                assigned_location_ids: locations,
                assigned_location_names: locations.map(id => 
                  allLocations.find(loc => loc.id === id)?.name
                ).filter(Boolean)
              };
              break;
            case 'assign_package':
              const pkg = packages.find(p => p.id === value);
              updateData = {
                remuneration_package_id: value,
                remuneration_package_name: pkg?.name || null,
                base_salary: pkg?.base_salary || employee.base_salary,
                hourly_rate: pkg?.hourly_rate || employee.hourly_rate,
                salary_type: pkg?.salary_type || employee.salary_type,
              };
              break;
          }

          await base44.entities.Employee.update(id, updateData);
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      return { successCount, failCount };
    },
    onSuccess: ({ successCount, failCount }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (failCount > 0) {
        toast.error(`Bulk update completed with errors`, `${successCount} succeeded, ${failCount} failed`);
      } else {
        toast.success("Bulk update successful", `${successCount} employee(s) updated`);
      }
      
      onOpenChange(false);
      setAction("");
      setValue("");
      setSelectedLocations([]);
    },
    onError: (error) => {
      toast.error("Bulk update failed", error.message);
    }
  });

  const handleSubmit = () => {
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    if (action === 'assign_locations') {
      if (selectedLocations.length === 0) {
        toast.error("Please select at least one location");
        return;
      }
      bulkUpdateMutation.mutate({ action, locations: selectedLocations });
    } else {
      if (!value) {
        toast.error("Please select a value");
        return;
      }
      bulkUpdateMutation.mutate({ action, value });
    }
  };

  const selectedEmployees = employees.filter(e => selectedEmployeeIds.includes(e.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <div className="h-1.5 flex rounded-full overflow-hidden mb-4">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white border-y border-gray-200" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1EB053]" />
            Bulk Employee Actions
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {selectedEmployeeIds.length} employee(s) selected
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-1">
            {selectedEmployees.map(emp => (
              <div key={emp.id} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">{emp.employee_code}</Badge>
                <span className="truncate">{emp.full_name}</span>
              </div>
            ))}
          </div>

          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {BULK_ACTIONS.map(act => (
                  <SelectItem key={act.value} value={act.value}>
                    <div className="flex items-center gap-2">
                      <act.icon className="w-4 h-4" />
                      {act.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === 'update_department' && (
            <div>
              <Label>Department</Label>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'update_status' && (
            <div>
              <Label>Status</Label>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'assign_package' && (
            <div>
              <Label>Remuneration Package</Label>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} (Le {pkg.base_salary?.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'assign_locations' && (
            <div>
              <Label>Locations</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {allLocations.map(location => (
                  <div key={location.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`bulk-loc-${location.id}`}
                      checked={selectedLocations.includes(location.id)}
                      onCheckedChange={(checked) => {
                        setSelectedLocations(prev =>
                          checked
                            ? [...prev, location.id]
                            : prev.filter(id => id !== location.id)
                        );
                      }}
                    />
                    <label htmlFor={`bulk-loc-${location.id}`} className="text-sm cursor-pointer flex-1">
                      {location.name}
                      <Badge variant="outline" className="ml-2 text-xs">{location.type}</Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={bulkUpdateMutation.isPending}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
          >
            {bulkUpdateMutation.isPending ? 'Updating...' : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply to {selectedEmployeeIds.length}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}