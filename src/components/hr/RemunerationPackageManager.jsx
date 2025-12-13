import React, { useState, useMemo } from "react";
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
  Briefcase, Calendar, Clock, Loader2, Gift, X, Copy, Check
} from "lucide-react";
import { safeNumber, formatNumber } from "@/components/utils/calculations";
import { COMMON_ALLOWANCES, SL_MINIMUM_WAGE } from "./PayrollCalculator";

// Pre-defined Sierra Leone Remuneration Packages (2025)
// All amounts in NLE (New Leone) - Redenominated April 2024
// Based on Sierra Leone Employment Act 2023 & market rates
export const SL_PACKAGE_TEMPLATES = [
  {
    name: "Executive Director Package",
    description: "Senior executive leadership package with comprehensive benefits per Employment Act 2023",
    applicable_roles: ["super_admin", "org_admin"],
    base_salary: 15000,
    salary_type: "monthly",
    allowances: [
      { name: "Housing Allowance", amount: 3000, type: "fixed" },
      { name: "Transport Allowance", amount: 1500, type: "fixed" },
      { name: "Medical Allowance", amount: 800, type: "fixed" },
      { name: "Communication Allowance", amount: 500, type: "fixed" },
      { name: "Entertainment Allowance", amount: 500, type: "fixed" },
      { name: "Executive Allowance", amount: 20, type: "percentage" }
    ],
    bonuses: [
      { name: "Performance Bonus", amount: 2000, frequency: "quarterly" },
      { name: "13th Month Bonus", amount: 15000, frequency: "annual" }
    ],
    leave_entitlement: { annual_days: 30, sick_days: 15, maternity_days: 90, paternity_days: 10 },
    overtime_rate_multiplier: 2.0,
    probation_period_months: 3
  },
  {
    name: "Senior Manager Package",
    description: "Management level package with standard executive benefits",
    applicable_roles: ["org_admin", "warehouse_manager"],
    base_salary: 8000,
    salary_type: "monthly",
    allowances: [
      { name: "Housing Allowance", amount: 1500, type: "fixed" },
      { name: "Transport Allowance", amount: 800, type: "fixed" },
      { name: "Medical Allowance", amount: 500, type: "fixed" },
      { name: "Communication Allowance", amount: 300, type: "fixed" },
      { name: "Responsibility Allowance", amount: 15, type: "percentage" }
    ],
    bonuses: [
      { name: "Performance Bonus", amount: 1000, frequency: "quarterly" },
      { name: "13th Month Bonus", amount: 8000, frequency: "annual" }
    ],
    leave_entitlement: { annual_days: 25, sick_days: 12, maternity_days: 90, paternity_days: 7 },
    overtime_rate_multiplier: 1.75,
    probation_period_months: 3
  },
  {
    name: "Department Head Package",
    description: "Mid-level management package for department heads and supervisors",
    applicable_roles: ["hr_admin", "payroll_admin", "warehouse_manager", "accountant"],
    base_salary: 5000,
    salary_type: "monthly",
    allowances: [
      { name: "Housing Allowance", amount: 1000, type: "fixed" },
      { name: "Transport Allowance", amount: 500, type: "fixed" },
      { name: "Medical Allowance", amount: 400, type: "fixed" },
      { name: "Communication Allowance", amount: 200, type: "fixed" },
      { name: "Responsibility Allowance", amount: 10, type: "percentage" }
    ],
    bonuses: [
      { name: "Performance Bonus", amount: 500, frequency: "quarterly" },
      { name: "13th Month Bonus", amount: 5000, frequency: "annual" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3
  },
  {
    name: "Professional Staff Package",
    description: "Skilled professional workers - accountants, administrators, technicians",
    applicable_roles: ["accountant", "hr_admin", "payroll_admin"],
    base_salary: 3500,
    salary_type: "monthly",
    allowances: [
      { name: "Housing Allowance", amount: 700, type: "fixed" },
      { name: "Transport Allowance", amount: 400, type: "fixed" },
      { name: "Medical Allowance", amount: 300, type: "fixed" },
      { name: "Communication Allowance", amount: 150, type: "fixed" },
      { name: "Professional Allowance", amount: 8, type: "percentage" }
    ],
    bonuses: [
      { name: "13th Month Bonus", amount: 3500, frequency: "annual" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3
  },
  {
    name: "Sales Representative Package",
    description: "Field sales staff with commission structure per Employment Act 2023",
    applicable_roles: ["vehicle_sales", "retail_cashier"],
    base_salary: 2000,
    salary_type: "monthly",
    allowances: [
      { name: "Transport Allowance", amount: 350, type: "fixed" },
      { name: "Communication Allowance", amount: 150, type: "fixed" },
      { name: "Medical Allowance", amount: 250, type: "fixed" },
      { name: "Meal Allowance", amount: 200, type: "fixed" },
      { name: "Sales Allowance", amount: 5, type: "percentage" }
    ],
    bonuses: [
      { name: "Sales Commission", amount: 2, type: "percentage", frequency: "monthly" },
      { name: "Target Achievement Bonus", amount: 300, frequency: "monthly" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3
  },
  {
    name: "Driver Package",
    description: "Commercial driver package with risk and fuel allowances per Employment Act 2023",
    applicable_roles: ["driver"],
    base_salary: 1800,
    salary_type: "monthly",
    allowances: [
      { name: "Risk Allowance", amount: 15, type: "percentage" },
      { name: "Fuel Allowance", amount: 300, type: "fixed" },
      { name: "Meal Allowance", amount: 250, type: "fixed" },
      { name: "Medical Allowance", amount: 250, type: "fixed" },
      { name: "Uniform Allowance", amount: 100, type: "fixed" },
      { name: "Night Shift Allowance", amount: 150, type: "fixed" }
    ],
    bonuses: [
      { name: "Trip Bonus", amount: 50, frequency: "per_trip" },
      { name: "Safety Bonus", amount: 200, frequency: "monthly" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3
  },
  {
    name: "Retail Cashier Package",
    description: "Point of sale and customer service staff package",
    applicable_roles: ["retail_cashier"],
    base_salary: 1500,
    salary_type: "monthly",
    allowances: [
      { name: "Transport Allowance", amount: 250, type: "fixed" },
      { name: "Meal Allowance", amount: 200, type: "fixed" },
      { name: "Medical Allowance", amount: 200, type: "fixed" },
      { name: "Uniform Allowance", amount: 100, type: "fixed" }
    ],
    bonuses: [
      { name: "Attendance Bonus", amount: 100, frequency: "monthly" },
      { name: "13th Month Bonus", amount: 1500, frequency: "annual" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 3
  },
  {
    name: "Support Staff Package",
    description: "General support and administrative staff - cleaners, security, messengers",
    applicable_roles: ["support_staff", "read_only"],
    base_salary: 1200,
    salary_type: "monthly",
    allowances: [
      { name: "Transport Allowance", amount: 200, type: "fixed" },
      { name: "Meal Allowance", amount: 150, type: "fixed" },
      { name: "Medical Allowance", amount: 150, type: "fixed" },
      { name: "Uniform Allowance", amount: 75, type: "fixed" }
    ],
    bonuses: [
      { name: "Attendance Bonus", amount: 75, frequency: "monthly" }
    ],
    leave_entitlement: { annual_days: 21, sick_days: 5, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 6
  },
  {
    name: "Entry Level Package",
    description: "New employees and trainees - minimum wage compliant per Sierra Leone law",
    applicable_roles: ["read_only", "support_staff"],
    base_salary: SL_MINIMUM_WAGE.monthly,
    salary_type: "monthly",
    allowances: [
      { name: "Transport Allowance", amount: 150, type: "fixed" },
      { name: "Meal Allowance", amount: 100, type: "fixed" },
      { name: "Medical Allowance", amount: 100, type: "fixed" }
    ],
    bonuses: [],
    leave_entitlement: { annual_days: 21, sick_days: 5, maternity_days: 90, paternity_days: 5 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 6
  },
  {
    name: "Daily Worker Package",
    description: "Casual/daily wage workers per Employment Act 2023 Section 5",
    applicable_roles: ["support_staff"],
    base_salary: SL_MINIMUM_WAGE.daily,
    salary_type: "daily",
    allowances: [
      { name: "Transport Allowance", amount: 10, type: "fixed" },
      { name: "Meal Allowance", amount: 8, type: "fixed" }
    ],
    bonuses: [],
    leave_entitlement: { annual_days: 0, sick_days: 0, maternity_days: 0, paternity_days: 0 },
    overtime_rate_multiplier: 1.5,
    probation_period_months: 0
  }
];

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
    hourly_rate: 0,
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
      hourly_rate: 0,
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
      hourly_rate: pkg.hourly_rate || 0,
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

  const formatSLE = (amount) => `Le ${formatNumber(safeNumber(amount))}`;
  
  // Calculate bonus monthly equivalent based on frequency
  const getBonusMonthlyValue = (bonus) => {
    const amount = safeNumber(bonus.amount);
    switch (bonus.frequency) {
      case 'annual': return amount / 12;
      case 'quarterly': return amount / 3;
      case 'per_trip': return 0; // Variable, don't include in estimate
      default: return amount; // monthly
    }
  };

  // Calculate total package value (monthly estimate)
  const calculatePackageTotal = (pkg) => {
    const base = safeNumber(pkg.base_salary);
    const allowancesTotal = (pkg.allowances || []).reduce((sum, a) => {
      if (a.type === 'percentage') {
        return sum + (base * safeNumber(a.amount) / 100);
      }
      return sum + safeNumber(a.amount);
    }, 0);
    const bonusesTotal = (pkg.bonuses || []).reduce((sum, b) => sum + getBonusMonthlyValue(b), 0);
    return base + allowancesTotal + bonusesTotal;
  };
  
  // Calculate form total (monthly estimate)
  const formTotal = useMemo(() => {
    const base = safeNumber(formData.base_salary);
    const allowancesTotal = formData.allowances.reduce((sum, a) => {
      if (a.type === 'percentage') {
        return sum + (base * safeNumber(a.amount) / 100);
      }
      return sum + safeNumber(a.amount);
    }, 0);
    const bonusesTotal = formData.bonuses.reduce((sum, b) => sum + getBonusMonthlyValue(b), 0);
    return base + allowancesTotal + bonusesTotal;
  }, [formData.base_salary, formData.allowances, formData.bonuses]);
  
  // Duplicate package
  const duplicatePackage = (pkg) => {
    setFormData({
      name: `${pkg.name} (Copy)`,
      description: pkg.description || "",
      applicable_roles: pkg.applicable_roles || [],
      base_salary: pkg.base_salary || 0,
      hourly_rate: pkg.hourly_rate || 0,
      salary_type: pkg.salary_type || "monthly",
      allowances: pkg.allowances || [],
      benefits: pkg.benefits || [],
      bonuses: pkg.bonuses || [],
      leave_entitlement: pkg.leave_entitlement || {
        annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5
      },
      overtime_rate_multiplier: pkg.overtime_rate_multiplier || 1.5,
      probation_period_months: pkg.probation_period_months || 3,
      is_active: true
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1EB053]" />
            Remuneration Packages
          </h3>
          <p className="text-sm text-gray-500">Define salary packages for different roles</p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(name) => {
            const template = SL_PACKAGE_TEMPLATES.find(t => t.name === name);
            if (template) {
              setFormData({
                name: template.name,
                description: template.description,
                applicable_roles: template.applicable_roles || [],
                base_salary: template.base_salary,
                salary_type: template.salary_type || "monthly",
                allowances: template.allowances || [],
                benefits: [],
                bonuses: template.bonuses || [],
                leave_entitlement: template.leave_entitlement || {
                  annual_days: 21, sick_days: 10, maternity_days: 90, paternity_days: 5
                },
                overtime_rate_multiplier: template.overtime_rate_multiplier || 1.5,
                probation_period_months: template.probation_period_months || 3,
                is_active: true
              });
              setShowDialog(true);
            }
          }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Use SL Template..." />
            </SelectTrigger>
            <SelectContent>
              {SL_PACKAGE_TEMPLATES.map(t => (
                <SelectItem key={t.name} value={t.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-gray-500">{formatSLE(t.base_salary)}/month</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
            <Plus className="w-4 h-4 mr-2" />
            Custom Package
          </Button>
        </div>
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

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Allowances</p>
                    <p className="font-medium">{pkg.allowances?.length || 0} items</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Bonuses</p>
                    <p className="font-medium">{pkg.bonuses?.length || 0} items</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Leave</p>
                    <p className="font-medium">{pkg.leave_entitlement?.annual_days || 21} days</p>
                  </div>
                </div>
                
                <div className="p-2 bg-blue-50 rounded text-xs">
                  <p className="text-blue-600">Est. Monthly Total</p>
                  <p className="font-bold text-blue-700">{formatSLE(calculatePackageTotal(pkg))}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(pkg)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => duplicatePackage(pkg)}
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
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
                  <Label>Amount (Le)</Label>
                  <Input
                    type="number"
                    value={formData.base_salary || ""}
                    onChange={(e) => setFormData({ ...formData, base_salary: safeNumber(e.target.value) })}
                    onWheel={(e) => e.target.blur()}
                    placeholder="0"
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
                {formData.salary_type === 'hourly' && (
                  <div className="col-span-2">
                    <Label>Hourly Rate (Le)</Label>
                    <Input
                      type="number"
                      value={formData.hourly_rate || ""}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: safeNumber(e.target.value) })}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="mt-1"
                    />
                    <p className="text-xs text-green-600 mt-1">Rate per hour for payroll calculation</p>
                  </div>
                )}
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-green-800 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Allowances ({formData.allowances.length})
                </h4>
                <div className="flex gap-2">
                  <Select onValueChange={(v) => {
                    const preset = COMMON_ALLOWANCES.find(a => a.name === v);
                    if (preset) {
                      setFormData(prev => ({
                        ...prev,
                        allowances: [...prev.allowances, { name: preset.name, amount: 0, type: "fixed" }]
                      }));
                    }
                  }}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue placeholder="Quick add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ALLOWANCES.map(a => (
                        <SelectItem key={a.name} value={a.name} className="text-xs">{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" variant="outline" onClick={addAllowance}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {formData.allowances.length === 0 ? (
                <p className="text-sm text-green-600/70 text-center py-2">No allowances added</p>
              ) : (
                formData.allowances.map((allowance, i) => (
                  <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                    <Input
                      placeholder="Allowance name"
                      value={allowance.name}
                      onChange={(e) => updateItem('allowances', i, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Select 
                      value={allowance.type || "fixed"} 
                      onValueChange={(v) => updateItem('allowances', i, 'type', v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">% of Base</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        {allowance.type === 'percentage' ? '%' : 'Le'}
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={allowance.amount || ""}
                        onChange={(e) => updateItem('allowances', i, 'amount', safeNumber(e.target.value))}
                        onWheel={(e) => e.target.blur()}
                        className="w-28 pl-10"
                      />
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeItem('allowances', i)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
              {formData.allowances.length > 0 && (
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-green-200">
                  <span>Total Allowances</span>
                  <span className="text-green-700">{formatSLE(formData.allowances.reduce((s, a) => {
                    if (a.type === 'percentage') {
                      return s + (safeNumber(formData.base_salary) * safeNumber(a.amount) / 100);
                    }
                    return s + safeNumber(a.amount);
                  }, 0))}</span>
                </div>
              )}
            </div>
            
            {/* Bonuses */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Bonuses ({formData.bonuses.length})
                </h4>
                <Button type="button" size="sm" variant="outline" onClick={addBonus}>
                  <Plus className="w-3 h-3 mr-1" /> Add Bonus
                </Button>
              </div>
              {formData.bonuses.length === 0 ? (
                <p className="text-sm text-purple-600/70 text-center py-2">No bonuses added</p>
              ) : (
                formData.bonuses.map((bonus, i) => (
                  <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                    <Input
                      placeholder="Bonus name"
                      value={bonus.name}
                      onChange={(e) => updateItem('bonuses', i, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Select 
                      value={bonus.frequency || "monthly"} 
                      onValueChange={(v) => updateItem('bonuses', i, 'frequency', v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Le</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={bonus.amount || ""}
                        onChange={(e) => updateItem('bonuses', i, 'amount', safeNumber(e.target.value))}
                        onWheel={(e) => e.target.blur()}
                        className="w-28 pl-10"
                      />
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeItem('bonuses', i)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
              {formData.bonuses.length > 0 && (
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-purple-200">
                  <span>Total Bonuses (monthly equivalent)</span>
                  <span className="text-purple-700">{formatSLE(formData.bonuses.reduce((s, b) => s + getBonusMonthlyValue(b), 0))}</span>
                </div>
              )}
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
            
            {/* Package Summary */}
            <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg border border-[#1EB053]/20">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1EB053]" />
                Package Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary</span>
                  <span>{formatSLE(formData.base_salary)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Allowances</span>
                  <span>{formatSLE(formData.allowances.reduce((s, a) => {
                    if (a.type === 'percentage') return s + (safeNumber(formData.base_salary) * safeNumber(a.amount) / 100);
                    return s + safeNumber(a.amount);
                  }, 0))}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span>+ Bonuses (monthly equiv.)</span>
                  <span>{formatSLE(formData.bonuses.reduce((s, b) => s + getBonusMonthlyValue(b), 0))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Est. Monthly Total</span>
                  <span className="text-[#1EB053]">{formatSLE(formTotal)}</span>
                </div>
              </div>
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