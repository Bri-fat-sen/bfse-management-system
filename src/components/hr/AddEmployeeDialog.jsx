import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Save, User, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";

export default function AddEmployeeDialog({ open, onOpenChange, employee, orgId }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_code: "",
    department: "",
    position: "",
    base_salary: 0,
    salary_type: "monthly",
    status: "active",
    hire_date: new Date().toISOString().split('T')[0],
  });

  // Initialize form data when employee or dialog opens
  useEffect(() => {
    if (open) {
      if (employee) {
        // Editing existing employee - preserve all data including employee_code
        setFormData({ ...employee });
      } else {
        // Adding new employee - generate new code
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          employee_code: `EMP${Date.now().toString().slice(-6)}`,
          department: "",
          position: "",
          base_salary: 0,
          salary_type: "monthly",
          status: "active",
          hire_date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [employee, open]);

  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: remunerationPackages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        organisation_id: orgId,
        full_name: `${data.first_name} ${data.last_name}`,
        leave_balances: {
          annual_days: 21,
          sick_days: 10,
          maternity_days: 90,
          paternity_days: 5,
        },
      };

      if (employee?.id) {
        return base44.entities.Employee.update(employee.id, payload);
      }
      return base44.entities.Employee.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success(employee ? "Employee Updated" : "Employee Added");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to save", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.employee_code) {
      toast.error("Missing Fields", "Please fill all required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  const roleOptions = [
    { value: "read_only", label: "Read Only" },
    { value: "support_staff", label: "Support Staff" },
    { value: "retail_cashier", label: "Retail Cashier" },
    { value: "vehicle_sales", label: "Vehicle Sales" },
    { value: "driver", label: "Driver" },
    { value: "warehouse_manager", label: "Warehouse Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "hr_admin", label: "HR Admin" },
    { value: "payroll_admin", label: "Payroll Admin" },
    { value: "org_admin", label: "Org Admin" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="h-1 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#1EB053]" />
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Employment Details
            </h3>
            <div className="col-span-2">
              <Label>Employment Type *</Label>
              <Select
                value={formData.employment_type || 'salary'}
                onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary (Fixed monthly pay)</SelectItem>
                  <SelectItem value="wage">Wage (Hourly/daily based on hours worked)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.employment_type === 'wage' 
                  ? 'Wage employees clock in/out and are paid based on approved hours worked'
                  : 'Salary employees receive fixed monthly pay regardless of hours worked'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Code *</Label>
                <Input
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Hire Date</Label>
                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Human Resources, Sales"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Manager, Clerk"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {employee && (
                <div>
                  <Label>Role (View Only)</Label>
                  <Input
                    value={employee.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Role can only be changed in User Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Compensation (Sierra Leone Leones)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary Type</Label>
                <Select
                  value={formData.salary_type}
                  onValueChange={(value) => setFormData({ ...formData, salary_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.employment_type === 'salary' || !formData.employment_type ? (
                <div>
                  <Label>Base Salary (Le)</Label>
                  <Input
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <>
                  {formData.salary_type === 'hourly' && (
                    <div>
                      <Label>Hourly Rate (Le)</Label>
                      <Input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  {formData.salary_type === 'daily' && (
                    <div>
                      <Label>Daily Rate (Le)</Label>
                      <Input
                        type="number"
                        value={formData.daily_rate}
                        onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </>
              )}
              {remunerationPackages.length > 0 && (
                <div className="col-span-2">
                  <Label>Remuneration Package (Optional)</Label>
                  <Select
                    value={formData.remuneration_package_id}
                    onValueChange={(value) => {
                      const pkg = remunerationPackages.find(p => p.id === value);
                      setFormData({
                        ...formData,
                        remuneration_package_id: value,
                        remuneration_package_name: pkg?.name,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package..." />
                    </SelectTrigger>
                    <SelectContent>
                      {remunerationPackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Location Assignment - View Only */}
          {employee && employee.assigned_location_name && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Assignment
              </h3>
              <div>
                <Label>Assigned Location (View Only)</Label>
                <Input
                  value={employee.assigned_location_name || 'Not assigned'}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Location can only be changed in User Management</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : (employee ? "Update" : "Add")} Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}