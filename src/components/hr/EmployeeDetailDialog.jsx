import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, Mail, Phone, Building2, Briefcase, Calendar, DollarSign, 
  MapPin, Shield, FileText, Award, Clock, X, Save, Edit2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Organisation Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "retail_cashier", label: "Retail Cashier" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "driver", label: "Driver" },
  { value: "accountant", label: "Accountant" },
  { value: "support_staff", label: "Support Staff" },
  { value: "read_only", label: "Read Only" },
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support", "HR", "IT"];

export default function EmployeeDetailDialog({ open, onOpenChange, employee, orgId, organisation, canEdit = true }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: packages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Failed to update employee", error.message);
    }
  });

  React.useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        role: employee.role || 'support_staff',
        base_salary: employee.base_salary || 0,
        hourly_rate: employee.hourly_rate || 0,
        salary_type: employee.salary_type || 'monthly',
        status: employee.status || 'active',
        address: employee.address || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        remuneration_package_id: employee.remuneration_package_id || '',
        assigned_location_ids: employee.assigned_location_ids || [],
      });
    }
  }, [employee]);

  const handleSave = () => {
    const updateData = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`,
      base_salary: parseFloat(formData.base_salary) || 0,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      remuneration_package_name: packages.find(p => p.id === formData.remuneration_package_id)?.name || null,
      assigned_location_names: formData.assigned_location_ids?.map(id => 
        allLocations.find(loc => loc.id === id)?.name
      ).filter(Boolean) || [],
    };
    
    updateMutation.mutate(updateData);
  };

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-white/30">
                <AvatarImage src={employee.profile_photo} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {employee.full_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{employee.full_name}</h2>
                <p className="text-white/80 text-sm">{employee.employee_code}</p>
                <Badge className="mt-1 bg-white/20 text-white border-white/30">
                  {employee.role?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-white hover:bg-white/20"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs defaultValue="personal" className="p-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Emergency Contact</Label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Emergency Phone</Label>
                  <Input
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Department
                  </Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position
                  </Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Hire Date
                  </Label>
                  <Input
                    type="date"
                    value={employee.hire_date || ''}
                    disabled
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="compensation" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Remuneration Package
                </Label>
                <Select 
                  value={formData.remuneration_package_id || ''} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, remuneration_package_id: v }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} (Le {pkg.base_salary?.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Base Salary
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Le</span>
                    <Input
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hourly Rate
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Le</span>
                    <Input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Salary Type</Label>
                <Select 
                  value={formData.salary_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, salary_type: v }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Balances */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-semibold mb-3 block">Leave Balances</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1EB053]">{employee.leave_balances?.annual_days || 21}</p>
                    <p className="text-xs text-gray-500">Annual Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0072C6]">{employee.leave_balances?.sick_days || 10}</p>
                    <p className="text-xs text-gray-500">Sick Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-500">{employee.leave_balances?.maternity_days || 90}</p>
                    <p className="text-xs text-gray-500">Maternity Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">{employee.leave_balances?.paternity_days || 5}</p>
                    <p className="text-xs text-gray-500">Paternity Days</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" />
                  Assigned Locations
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {allLocations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No locations available</p>
                  ) : (
                    allLocations.map(location => (
                      <div key={location.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`loc-${location.id}`}
                          checked={formData.assigned_location_ids?.includes(location.id)}
                          onCheckedChange={(checked) => {
                            if (!isEditing) return;
                            setFormData(prev => ({
                              ...prev,
                              assigned_location_ids: checked
                                ? [...(prev.assigned_location_ids || []), location.id]
                                : (prev.assigned_location_ids || []).filter(id => id !== location.id)
                            }));
                          }}
                          disabled={!isEditing}
                        />
                        <label htmlFor={`loc-${location.id}`} className="text-sm flex-1 cursor-pointer">
                          {location.name}
                          <Badge variant="outline" className="ml-2 text-xs">{location.type}</Badge>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {formData.assigned_location_ids?.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    {formData.assigned_location_ids.length} location(s) assigned
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {isEditing && (
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)} 
              className="flex-1 sm:flex-none sm:w-24"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {updateMutation.isPending ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}