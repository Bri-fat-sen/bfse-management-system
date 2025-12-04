import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { 
  Plus, Pencil, Trash2, DollarSign, Percent, Calculator, 
  TrendingUp, TrendingDown, Copy, Search, Settings, Clock, Users
} from "lucide-react";
import { formatSLE } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

const CATEGORIES = {
  earning: [
    { value: 'basic', label: 'Basic Pay' },
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

const PRESET_COMPONENTS = {
  earnings: [
    { name: 'Transport Allowance', category: 'allowance', calculation_type: 'fixed', amount: 150, is_taxable: true },
    { name: 'Housing Allowance', category: 'allowance', calculation_type: 'percentage', amount: 20, percentage_of: 'base_salary', is_taxable: true },
    { name: 'Meal Allowance', category: 'allowance', calculation_type: 'fixed', amount: 100, is_taxable: true },
    { name: 'Medical Allowance', category: 'allowance', calculation_type: 'fixed', amount: 150, is_taxable: false },
    { name: 'Communication Allowance', category: 'allowance', calculation_type: 'fixed', amount: 75, is_taxable: true },
    { name: 'Risk Allowance', category: 'allowance', calculation_type: 'percentage', amount: 15, percentage_of: 'base_salary', is_taxable: true },
    { name: 'Performance Bonus', category: 'bonus', calculation_type: 'percentage', amount: 10, percentage_of: 'base_salary', is_taxable: true },
    { name: 'Sales Commission', category: 'commission', calculation_type: 'percentage', amount: 2, percentage_of: 'custom', is_taxable: true },
    { name: 'Attendance Bonus', category: 'bonus', calculation_type: 'percentage', amount: 5, percentage_of: 'base_salary', is_taxable: true },
    { name: 'Overtime Premium', category: 'overtime', calculation_type: 'hours_based', amount: 1.5, is_taxable: true }
  ],
  deductions: [
    { name: 'Loan Repayment', category: 'loan', calculation_type: 'fixed', amount: 0, is_taxable: false },
    { name: 'Salary Advance', category: 'advance', calculation_type: 'fixed', amount: 0, is_taxable: false },
    { name: 'Union Dues', category: 'voluntary', calculation_type: 'fixed', amount: 50, is_taxable: false },
    { name: 'Cooperative Savings', category: 'voluntary', calculation_type: 'percentage', amount: 5, percentage_of: 'base_salary', is_taxable: false },
    { name: 'Health Insurance', category: 'voluntary', calculation_type: 'fixed', amount: 100, is_taxable: false }
  ]
};

export default function PayComponentsManager({ orgId, employees = [] }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('earnings');
  const [searchTerm, setSearchTerm] = useState('');
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
    effective_from: '',
    effective_to: '',
    is_active: true,
    display_order: 0,
    description: ''
  });
  const [assignmentMode, setAssignmentMode] = useState('all');

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
      effective_from: '',
      effective_to: '',
      is_active: true,
      display_order: 0,
      description: ''
    });
    setAssignmentMode('all');
    setEditingComponent(null);
    setShowDialog(false);
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setFormData({
      ...component,
      min_amount: component.min_amount || null,
      max_amount: component.max_amount || null,
      applies_to_roles: component.applies_to_roles || [],
      applies_to_employees: component.applies_to_employees || [],
      applies_to_departments: component.applies_to_departments || [],
    });
    if (component.applies_to_employees?.length > 0) {
      setAssignmentMode('employees');
    } else if (component.applies_to_roles?.length > 0) {
      setAssignmentMode('roles');
    } else {
      setAssignmentMode('all');
    }
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = formData.code || formData.name.toUpperCase().replace(/\s+/g, '_').slice(0, 10);
    const data = {
      ...formData,
      code,
      organisation_id: orgId,
      applies_to_roles: assignmentMode === 'roles' ? formData.applies_to_roles : [],
      applies_to_employees: assignmentMode === 'employees' ? formData.applies_to_employees : [],
    };

    if (editingComponent) {
      updateMutation.mutate({ id: editingComponent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addFromPreset = (preset, type) => {
    setFormData({
      ...formData,
      ...preset,
      type,
      code: preset.name.toUpperCase().replace(/\s+/g, '_').slice(0, 10),
    });
    setShowDialog(true);
  };

  const duplicateComponent = (component) => {
    setFormData({
      ...component,
      name: `${component.name} (Copy)`,
      code: '',
      id: undefined,
    });
    setAssignmentMode('all');
    setShowDialog(true);
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      applies_to_roles: prev.applies_to_roles.includes(role)
        ? prev.applies_to_roles.filter(r => r !== role)
        : [...prev.applies_to_roles, role]
    }));
  };

  const toggleEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      applies_to_employees: prev.applies_to_employees.includes(empId)
        ? prev.applies_to_employees.filter(id => id !== empId)
        : [...prev.applies_to_employees, empId]
    }));
  };

  const earnings = components.filter(c => c.type === 'earning');
  const deductions = components.filter(c => c.type === 'deduction');

  const filteredEmployees = employees.filter(e =>
    e.status === 'active' &&
    (e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     e.role?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAppliesTo = (component) => {
    if (component.applies_to_employees?.length > 0) {
      const empNames = component.applies_to_employees
        .map(id => employees.find(e => e.id === id)?.full_name)
        .filter(Boolean);
      return empNames.length > 2
        ? `${empNames.slice(0, 2).join(', ')} +${empNames.length - 2}`
        : empNames.join(', ') || 'Selected employees';
    }
    if (component.applies_to_roles?.length > 0) {
      return component.applies_to_roles.map(r => r.replace(/_/g, ' ')).join(', ');
    }
    return 'All employees';
  };

  const renderComponentRow = (component) => (
    <TableRow key={component.id}>
      <TableCell>
        <div>
          <p className="font-medium">{component.name}</p>
          <p className="text-xs text-gray-500">{component.code}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {component.category}
        </Badge>
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
            {component.amount}x hourly rate
          </span>
        ) : (
          <span className="font-medium">{formatSLE(component.amount)}</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={component.is_active ? 'default' : 'secondary'}
            className={component.is_active ? (component.type === 'earning' ? 'bg-green-500' : 'bg-red-500') : ''}>
            {component.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <span className="text-xs text-gray-500">{getAppliesTo(component)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => handleEdit(component)} title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => duplicateComponent(component)} title="Duplicate">
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => {
            if (window.confirm(`Delete "${component.name}"?`)) {
              deleteMutation.mutate(component.id);
            }
          }} title="Delete">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Pay Components</h3>
          <p className="text-sm text-gray-500">Configure custom earnings, bonuses, commissions, and deductions</p>
        </div>
        <Button onClick={() => {
          setFormData({ ...formData, type: activeTab === 'earnings' ? 'earning' : 'deduction' });
          setShowDialog(true);
        }} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="earnings" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Earnings ({earnings.length})
          </TabsTrigger>
          <TabsTrigger value="deductions" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <TrendingDown className="w-4 h-4 mr-2" />
            Deductions ({deductions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Earnings & Allowances
                </CardTitle>
                <Select onValueChange={(v) => addFromPreset(PRESET_COMPONENTS.earnings.find(p => p.name === v), 'earning')}>
                  <SelectTrigger className="w-44 h-8 text-xs">
                    <SelectValue placeholder="Quick add preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_COMPONENTS.earnings.map(p => (
                      <SelectItem key={p.name} value={p.name} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No earning components configured. Add one using presets above or create custom.
                      </TableCell>
                    </TableRow>
                  ) : (
                    earnings.map(renderComponentRow)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Deductions
                </CardTitle>
                <Select onValueChange={(v) => addFromPreset(PRESET_COMPONENTS.deductions.find(p => p.name === v), 'deduction')}>
                  <SelectTrigger className="w-44 h-8 text-xs">
                    <SelectValue placeholder="Quick add preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_COMPONENTS.deductions.map(p => (
                      <SelectItem key={p.name} value={p.name} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No deduction components configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    deductions.map(renderComponentRow)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {editingComponent ? 'Edit Pay Component' : 'Add Pay Component'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Transport Allowance"
                  required
                />
              </div>
              <div>
                <Label>Code (auto-generated if empty)</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., TRANS_ALW"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v, category: v === 'earning' ? 'allowance' : 'other' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earning">Earning (adds to pay)</SelectItem>
                    <SelectItem value="deduction">Deduction (subtracts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES[formData.type]?.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calculation Type *</Label>
                <Select value={formData.calculation_type} onValueChange={(v) => setFormData({ ...formData, calculation_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="hours_based">Hours-Based (for overtime)</SelectItem>
                    <SelectItem value="formula">Custom Formula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {formData.calculation_type === 'percentage' ? 'Percentage (%)' :
                   formData.calculation_type === 'hours_based' ? 'Multiplier (e.g., 1.5x)' :
                   'Amount (Le)'}
                </Label>
                <Input
                  type="number"
                  step={formData.calculation_type === 'percentage' || formData.calculation_type === 'hours_based' ? '0.1' : '1'}
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: safeNumber(e.target.value) })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0"
                />
              </div>
            </div>

            {formData.calculation_type === 'percentage' && (
              <div>
                <Label>Percentage Of</Label>
                <Select value={formData.percentage_of} onValueChange={(v) => setFormData({ ...formData, percentage_of: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base_salary">Base Salary</SelectItem>
                    <SelectItem value="gross_pay">Gross Pay</SelectItem>
                    <SelectItem value="net_pay">Net Pay</SelectItem>
                    <SelectItem value="custom">Custom (e.g., sales amount)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.calculation_type === 'formula' && (
              <div>
                <Label>Formula</Label>
                <Input
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  placeholder="e.g., sales * 0.02"
                />
                <p className="text-xs text-gray-500 mt-1">Variables: base_salary, gross_pay, hours, sales</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Amount Cap (optional)</Label>
                <Input
                  type="number"
                  value={formData.min_amount || ''}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value ? safeNumber(e.target.value) : null })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="No minimum"
                />
              </div>
              <div>
                <Label>Max Amount Cap (optional)</Label>
                <Input
                  type="number"
                  value={formData.max_amount || ''}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value ? safeNumber(e.target.value) : null })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="No maximum"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Taxable</p>
                  <p className="text-xs text-gray-500">Subject to PAYE tax</p>
                </div>
                <Switch
                  checked={formData.is_taxable}
                  onCheckedChange={(v) => setFormData({ ...formData, is_taxable: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Affects NASSIT</p>
                  <p className="text-xs text-gray-500">Include in NASSIT calculation</p>
                </div>
                <Switch
                  checked={formData.affects_nassit}
                  onCheckedChange={(v) => setFormData({ ...formData, affects_nassit: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Recurring</p>
                  <p className="text-xs text-gray-500">Auto-apply each period</p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(v) => setFormData({ ...formData, is_recurring: v })}
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="every_payroll">Every Payroll</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-3">
              <Label>Applies To</Label>
              <div className="flex gap-2">
                <Button type="button" variant={assignmentMode === 'all' ? 'default' : 'outline'} size="sm"
                  onClick={() => setAssignmentMode('all')}
                  className={assignmentMode === 'all' ? 'bg-[#1EB053]' : ''}>
                  All Employees
                </Button>
                <Button type="button" variant={assignmentMode === 'roles' ? 'default' : 'outline'} size="sm"
                  onClick={() => setAssignmentMode('roles')}
                  className={assignmentMode === 'roles' ? 'bg-[#1EB053]' : ''}>
                  By Role
                </Button>
                <Button type="button" variant={assignmentMode === 'employees' ? 'default' : 'outline'} size="sm"
                  onClick={() => setAssignmentMode('employees')}
                  className={assignmentMode === 'employees' ? 'bg-[#1EB053]' : ''}>
                  Specific Employees
                </Button>
              </div>
            </div>

            {assignmentMode === 'roles' && (
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <Badge key={role.value} variant={formData.applies_to_roles.includes(role.value) ? 'default' : 'outline'}
                    className={`cursor-pointer ${formData.applies_to_roles.includes(role.value) ? 'bg-[#1EB053]' : ''}`}
                    onClick={() => toggleRole(role.value)}>
                    {role.label}
                  </Badge>
                ))}
              </div>
            )}

            {assignmentMode === 'employees' && (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search employees..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                    <div key={emp.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                        formData.applies_to_employees.includes(emp.id) ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEmployee(emp.id)}>
                      <Checkbox checked={formData.applies_to_employees.includes(emp.id)} />
                      <span className="text-sm flex-1">{emp.full_name}</span>
                      <Badge variant="outline" className="text-xs">{emp.role?.replace(/_/g, ' ')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" className="bg-[#1EB053] hover:bg-[#178f43]">
                {editingComponent ? 'Update' : 'Create'} Component
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}