import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, DollarSign, Percent, Clock, TrendingUp, Gift, Minus, Copy, Search, Calculator } from "lucide-react";
import { formatSLE } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = {
  earning: [
    { value: 'basic', label: 'Basic Salary' },
    { value: 'allowance', label: 'Allowance' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'commission', label: 'Commission' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'other', label: 'Other Earning' }
  ],
  deduction: [
    { value: 'statutory', label: 'Statutory' },
    { value: 'voluntary', label: 'Voluntary' },
    { value: 'loan', label: 'Loan Repayment' },
    { value: 'advance', label: 'Salary Advance' },
    { value: 'other', label: 'Other Deduction' }
  ]
};

const CALCULATION_TYPES = [
  { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
  { value: 'percentage', label: 'Percentage', icon: Percent },
  { value: 'hours_based', label: 'Hours Based', icon: Clock },
  { value: 'formula', label: 'Custom Formula', icon: Calculator }
];

const FREQUENCIES = [
  { value: 'every_payroll', label: 'Every Payroll' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one_time', label: 'One-Time' }
];

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'org_admin', label: 'Organisation Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'retail_cashier', label: 'Retail Cashier' },
  { value: 'vehicle_sales', label: 'Vehicle Sales' },
  { value: 'driver', label: 'Driver' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'support_staff', label: 'Support Staff' }
];

export default function PayComponentManager({ orgId, employees = [] }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [activeTab, setActiveTab] = useState("earning");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'earning',
    category: 'allowance',
    calculation_type: 'fixed',
    amount: 0,
    percentage_of: 'base_salary',
    formula: '',
    min_amount: null,
    max_amount: null,
    is_taxable: true,
    affects_nassit: true,
    is_recurring: true,
    frequency: 'every_payroll',
    applies_to_roles: [],
    applies_to_employees: [],
    applies_to_departments: [],
    is_active: true,
    display_order: 0,
    description: ''
  });

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['payComponents', orgId],
    queryFn: () => base44.entities.PayComponent.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PayComponent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payComponents'] });
      toast.success('Pay component created');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PayComponent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payComponents'] });
      toast.success('Pay component updated');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PayComponent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payComponents'] });
      toast.success('Pay component deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: activeTab,
      category: activeTab === 'earning' ? 'allowance' : 'voluntary',
      calculation_type: 'fixed',
      amount: 0,
      percentage_of: 'base_salary',
      formula: '',
      min_amount: null,
      max_amount: null,
      is_taxable: true,
      affects_nassit: true,
      is_recurring: true,
      frequency: 'every_payroll',
      applies_to_roles: [],
      applies_to_employees: [],
      applies_to_departments: [],
      is_active: true,
      display_order: 0,
      description: ''
    });
    setEditingComponent(null);
    setShowDialog(false);
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name || '',
      code: component.code || '',
      type: component.type || 'earning',
      category: component.category || 'allowance',
      calculation_type: component.calculation_type || 'fixed',
      amount: component.amount || 0,
      percentage_of: component.percentage_of || 'base_salary',
      formula: component.formula || '',
      min_amount: component.min_amount,
      max_amount: component.max_amount,
      is_taxable: component.is_taxable ?? true,
      affects_nassit: component.affects_nassit ?? true,
      is_recurring: component.is_recurring ?? true,
      frequency: component.frequency || 'every_payroll',
      applies_to_roles: component.applies_to_roles || [],
      applies_to_employees: component.applies_to_employees || [],
      applies_to_departments: component.applies_to_departments || [],
      is_active: component.is_active ?? true,
      display_order: component.display_order || 0,
      description: component.description || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      organisation_id: orgId,
      code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '_')
    };

    if (editingComponent) {
      updateMutation.mutate({ id: editingComponent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      applies_to_roles: prev.applies_to_roles.includes(role)
        ? prev.applies_to_roles.filter(r => r !== role)
        : [...prev.applies_to_roles, role]
    }));
  };

  const duplicateComponent = (component) => {
    setFormData({
      ...component,
      name: `${component.name} (Copy)`,
      code: '',
      applies_to_employees: [],
      is_active: true
    });
    setEditingComponent(null);
    setShowDialog(true);
  };

  const earnings = components.filter(c => c.type === 'earning');
  const deductions = components.filter(c => c.type === 'deduction');

  const filteredComponents = (activeTab === 'earning' ? earnings : deductions)
    .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getAppliesTo = (component) => {
    if (component.applies_to_employees?.length > 0) {
      return `${component.applies_to_employees.length} employee(s)`;
    }
    if (component.applies_to_roles?.length > 0) {
      return component.applies_to_roles.slice(0, 2).map(r => r.replace(/_/g, ' ')).join(', ') + 
        (component.applies_to_roles.length > 2 ? ` +${component.applies_to_roles.length - 2}` : '');
    }
    return 'All employees';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pay Components</h3>
          <p className="text-sm text-gray-500">Configure earnings, allowances, bonuses, commissions, and deductions</p>
        </div>
        <Button onClick={() => { setFormData(prev => ({ ...prev, type: activeTab })); setShowDialog(true); }} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="earning" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Earnings ({earnings.length})
            </TabsTrigger>
            <TabsTrigger value="deduction" className="gap-2">
              <Minus className="w-4 h-4" />
              Deductions ({deductions.length})
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        <TabsContent value="earning" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10">
                    <TableHead>Component</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Tax/NASSIT</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComponents.map(component => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{component.name}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{component.category}</Badge>
                            {component.code && <Badge variant="secondary" className="text-xs">{component.code}</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.calculation_type === 'percentage' ? (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Percent className="w-3 h-3" />
                            {component.amount}% of {component.percentage_of?.replace('_', ' ')}
                          </span>
                        ) : component.calculation_type === 'hours_based' ? (
                          <span className="flex items-center gap-1 text-purple-600 font-medium">
                            <Clock className="w-3 h-3" />
                            {formatSLE(component.amount)}/hr
                          </span>
                        ) : (
                          <span className="font-medium text-green-600">{formatSLE(component.amount)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{getAppliesTo(component)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {component.is_taxable && <Badge variant="outline" className="text-xs bg-amber-50">Taxable</Badge>}
                          {component.affects_nassit && <Badge variant="outline" className="text-xs bg-blue-50">NASSIT</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.is_active ? 'default' : 'secondary'} className={component.is_active ? 'bg-green-500' : ''}>
                          {component.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(component)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => duplicateComponent(component)}><Copy className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(component.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredComponents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No {activeTab === 'earning' ? 'earning' : 'deduction'} components configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deduction" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-red-50 to-orange-50">
                    <TableHead>Component</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComponents.map(component => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{component.name}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{component.category}</Badge>
                            {component.code && <Badge variant="secondary" className="text-xs">{component.code}</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.calculation_type === 'percentage' ? (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Percent className="w-3 h-3" />
                            {component.amount}%
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">{formatSLE(component.amount)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{getAppliesTo(component)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{component.frequency?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.is_active ? 'default' : 'secondary'} className={component.is_active ? 'bg-red-500' : ''}>
                          {component.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(component)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => duplicateComponent(component)}><Copy className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(component.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredComponents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No deduction components configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          {/* Sierra Leone Flag Header */}
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          {/* Header with gradient */}
          <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                {formData.type === 'earning' ? <TrendingUp className="w-6 h-6 text-white" /> : <Minus className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{editingComponent ? 'Edit' : 'Add'} {formData.type === 'earning' ? 'Earning' : 'Deduction'} Component</h2>
                <p className="text-white/80 text-sm">Configure pay component details</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">

          <form id="pay-component-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Component Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Transport Allowance"
                  required
                />
              </div>
              <div>
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v, category: v === 'earning' ? 'allowance' : 'voluntary' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earning">Earning (Adds to Pay)</SelectItem>
                    <SelectItem value="deduction">Deduction (Subtracts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES[formData.type]?.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Calculation Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {CALCULATION_TYPES.map(calc => (
                  <button
                    key={calc.value}
                    type="button"
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.calculation_type === calc.value 
                        ? 'border-[#1EB053] bg-[#1EB053]/10 text-[#1EB053]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, calculation_type: calc.value })}
                  >
                    <calc.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{calc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{formData.calculation_type === 'percentage' ? 'Percentage (%)' : formData.calculation_type === 'hours_based' ? 'Rate per Hour (Le)' : 'Amount (Le)'}</Label>
                <Input
                  type="number"
                  step={formData.calculation_type === 'percentage' ? '0.1' : '1'}
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: safeNumber(e.target.value) })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0"
                />
              </div>
              {formData.calculation_type === 'percentage' && (
                <div>
                  <Label>Percentage Of</Label>
                  <Select value={formData.percentage_of} onValueChange={(v) => setFormData({ ...formData, percentage_of: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base_salary">Base Salary</SelectItem>
                      <SelectItem value="gross_pay">Gross Pay</SelectItem>
                      <SelectItem value="net_pay">Net Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.calculation_type === 'formula' && (
              <div>
                <Label>Formula</Label>
                <Textarea
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  placeholder="e.g., sales * 0.02 (use: sales, hours, base_salary, gross_pay)"
                  className="font-mono text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Cap (optional)</Label>
                <Input
                  type="number"
                  value={formData.min_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value ? safeNumber(e.target.value) : null })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="No minimum"
                />
              </div>
              <div>
                <Label>Maximum Cap (optional)</Label>
                <Input
                  type="number"
                  value={formData.max_amount || ""}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value ? safeNumber(e.target.value) : null })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="No maximum"
                />
              </div>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Applies to Roles (leave empty for all)</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <Badge
                    key={role.value}
                    variant={formData.applies_to_roles.includes(role.value) ? 'default' : 'outline'}
                    className={`cursor-pointer ${formData.applies_to_roles.includes(role.value) ? 'bg-[#1EB053]' : ''}`}
                    onClick={() => toggleRole(role.value)}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Taxable</Label>
                <Switch checked={formData.is_taxable} onCheckedChange={(v) => setFormData({ ...formData, is_taxable: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Affects NASSIT</Label>
                <Switch checked={formData.affects_nassit} onCheckedChange={(v) => setFormData({ ...formData, affects_nassit: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Active</Label>
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
              </div>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this component..."
                rows={2}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
            <Button 
              type="submit" 
              form="pay-component-form"
              className="flex-1 text-white"
              style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}
            >
              {editingComponent ? 'Update' : 'Create'} Component
            </Button>
          </div>

          {/* Bottom flag stripe */}
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}