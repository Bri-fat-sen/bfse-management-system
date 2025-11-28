import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  DollarSign, Plus, Edit, Trash2, Package, Users, 
  Briefcase, Calendar, Clock, Loader2, Gift, X
} from "lucide-react";

const ROLES = [
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

export default function RemunerationPackageManager({ orgId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    applicable_roles: [],
    base_salary: 0,
    salary_type: "monthly",
    allowances: [],
    benefits: [],
    bonuses: [],
    leave_entitlement: {
      annual_days: 21,
      sick_days: 10,
      maternity_days: 90,
      paternity_days: 5
    },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3,
    is_active: true
  });

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RemunerationPackage.create({ ...data, organisation_id: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remunerationPackages'] });
      toast.success("Package created successfully");
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RemunerationPackage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remunerationPackages'] });
      toast.success("Package updated successfully");
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RemunerationPackage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remunerationPackages'] });
      toast.success("Package deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      applicable_roles: [],
      base_salary: 0,
      salary_type: "monthly",
      allowances: [],
      benefits: [],
      bonuses: [],
      leave_entitlement: {
        annual_days: 21,
        sick_days: 10,
        maternity_days: 90,
        paternity_days: 5
      },
      overtime_rate_multiplier: 1.5,
      probation_period_months: 3,
      is_active: true
    });
    setEditingPackage(null);
    setShowDialog(false);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      applicable_roles: pkg.applicable_roles || [],
      base_salary: pkg.base_salary || 0,
      salary_type: pkg.salary_type || "monthly",
      allowances: pkg.allowances || [],
      benefits: pkg.benefits || [],
      bonuses: pkg.bonuses || [],
      leave_entitlement: pkg.leave_entitlement || {
        annual_days: 21,
        sick_days: 10,
        maternity_days: 90,
        paternity_days: 5
      },
      overtime_rate_multiplier: pkg.overtime_rate_multiplier || 1.5,
      probation_period_months: pkg.probation_period_months || 3,
      is_active: pkg.is_active !== false
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Package name is required");
      return;
    }
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { name: "", amount: 0, type: "fixed" }]
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, { name: "", description: "", value: 0 }]
    }));
  };

  const addBonus = () => {
    setFormData(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, { name: "", amount: 0, frequency: "monthly" }]
    }));
  };

  const removeItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      applicable_roles: prev.applicable_roles.includes(role)
        ? prev.applicable_roles.filter(r => r !== role)
        : [...prev.applicable_roles, role]
    }));
  };

  const formatSLE = (amount) => `SLE ${(amount || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1EB053]" />
            Remuneration Packages
          </h3>
          <p className="text-sm text-gray-500">Define salary packages for different roles</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading packages...</div>
      ) : packages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-600">No packages defined</p>
            <p className="text-sm text-gray-500 mb-4">Create remuneration packages to standardize employee compensation</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`relative ${!pkg.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                  </div>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>
                    {pkg.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                  <p className="text-xs text-gray-500">Base Salary ({pkg.salary_type})</p>
                  <p className="text-xl font-bold text-[#1EB053]">{formatSLE(pkg.base_salary)}</p>
                </div>

                {pkg.applicable_roles?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Applicable Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.applicable_roles.slice(0, 3).map(role => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {ROLES.find(r => r.value === role)?.label || role}
                        </Badge>
                      ))}
                      {pkg.applicable_roles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pkg.applicable_roles.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Allowances</p>
                    <p className="font-medium">{pkg.allowances?.length || 0} items</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Annual Leave</p>
                    <p className="font-medium">{pkg.leave_entitlement?.annual_days || 21} days</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(pkg)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteMutation.mutate(pkg.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Package Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1EB053]" />
              {editingPackage ? "Edit Package" : "Create Remuneration Package"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Package Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Senior Manager Package"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this package"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Salary */}
            <div className="p-4 bg-green-50 rounded-lg space-y-4">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Base Salary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (SLE)</Label>
                  <Input
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.salary_type} onValueChange={(v) => setFormData({ ...formData, salary_type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Applicable Roles */}
            <div>
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Applicable Roles
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ROLES.map(role => (
                  <Badge
                    key={role.value}
                    variant={formData.applicable_roles.includes(role.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRole(role.value)}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Allowances */}
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Allowances
                </h4>
                <Button type="button" size="sm" variant="outline" onClick={addAllowance}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              {formData.allowances.map((allowance, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={allowance.name}
                    onChange={(e) => updateItem('allowances', i, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={allowance.amount}
                    onChange={(e) => updateItem('allowances', i, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeItem('allowances', i)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Leave Entitlement */}
            <div className="p-4 bg-purple-50 rounded-lg space-y-3">
              <h4 className="font-medium text-purple-800 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Leave Entitlement (Days)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Annual</Label>
                  <Input
                    type="number"
                    value={formData.leave_entitlement.annual_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      leave_entitlement: { ...formData.leave_entitlement, annual_days: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sick</Label>
                  <Input
                    type="number"
                    value={formData.leave_entitlement.sick_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      leave_entitlement: { ...formData.leave_entitlement, sick_days: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Maternity</Label>
                  <Input
                    type="number"
                    value={formData.leave_entitlement.maternity_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      leave_entitlement: { ...formData.leave_entitlement, maternity_days: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Paternity</Label>
                  <Input
                    type="number"
                    value={formData.leave_entitlement.paternity_days}
                    onChange={(e) => setFormData({
                      ...formData,
                      leave_entitlement: { ...formData.leave_entitlement, paternity_days: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Other Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Overtime Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.overtime_rate_multiplier}
                  onChange={(e) => setFormData({ ...formData, overtime_rate_multiplier: parseFloat(e.target.value) || 1.5 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Probation (Months)</Label>
                <Input
                  type="number"
                  value={formData.probation_period_months}
                  onChange={(e) => setFormData({ ...formData, probation_period_months: parseInt(e.target.value) || 3 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Package Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-[#1EB053] hover:bg-[#178f43]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingPackage ? "Update Package" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}