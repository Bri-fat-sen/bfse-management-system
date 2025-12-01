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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Gift, Minus, Percent, DollarSign, Copy, Search } from "lucide-react";
import { formatSLE, COMMON_ALLOWANCES, COMMON_DEDUCTIONS } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

const CATEGORIES = [
  { value: 'statutory', label: 'Statutory' },
  { value: 'voluntary', label: 'Voluntary' },
  { value: 'loan', label: 'Loan Repayment' },
  { value: 'advance', label: 'Salary Advance' },
  { value: 'allowance', label: 'Allowance' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'pension', label: 'Pension' },
  { value: 'other', label: 'Other' }
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

// Calculate template amount based on employee salary
export function calculateTemplateAmount(template, baseSalary, grossPay = null) {
  if (template.calculation_type === 'percentage') {
    const base = template.percentage_of === 'gross_pay' && grossPay ? grossPay : baseSalary;
    return Math.round(base * (template.amount / 100));
  }
  return template.amount || 0;
}

// Get applicable templates for an employee
export function getApplicableTemplates(templates, employee) {
  return templates.filter(t => {
    if (!t.is_active) return false;
    
    // Check if applies to specific employees
    if (t.applies_to_employees?.length > 0) {
      return t.applies_to_employees.includes(employee.id);
    }
    
    // Check if applies to specific roles
    if (t.applies_to_roles?.length > 0) {
      return t.applies_to_roles.includes(employee.role);
    }
    
    // If no restrictions, applies to all
    return true;
  });
}

export default function BenefitsDeductionsManager({ orgId, employees = [] }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'benefit',
    category: 'allowance',
    calculation_type: 'fixed',
    amount: 0,
    percentage_of: 'base_salary',
    is_taxable: true,
    applies_to_roles: [],
    applies_to_employees: [],
    description: '',
    is_active: true
  });
  const [assignmentMode, setAssignmentMode] = useState('roles'); // 'roles' or 'employees'
  const [searchTerm, setSearchTerm] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['benefitDeductionTemplates', orgId],
    queryFn: () => base44.entities.BenefitDeductionTemplate.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BenefitDeductionTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitDeductionTemplates'] });
      toast.success('Template created successfully');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BenefitDeductionTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitDeductionTemplates'] });
      toast.success('Template updated successfully');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BenefitDeductionTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitDeductionTemplates'] });
      toast.success('Template deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'benefit',
      category: 'allowance',
      calculation_type: 'fixed',
      amount: 0,
      percentage_of: 'base_salary',
      is_taxable: true,
      applies_to_roles: [],
      applies_to_employees: [],
      description: '',
      is_active: true
    });
    setAssignmentMode('roles');
    setEditingTemplate(null);
    setShowDialog(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      calculation_type: template.calculation_type,
      amount: template.amount,
      percentage_of: template.percentage_of || 'base_salary',
      is_taxable: template.is_taxable ?? true,
      applies_to_roles: template.applies_to_roles || [],
      applies_to_employees: template.applies_to_employees || [],
      description: template.description || '',
      is_active: template.is_active ?? true
    });
    setAssignmentMode(template.applies_to_employees?.length > 0 ? 'employees' : 'roles');
    setShowDialog(true);
  };

  const toggleEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      applies_to_employees: prev.applies_to_employees.includes(empId)
        ? prev.applies_to_employees.filter(id => id !== empId)
        : [...prev.applies_to_employees, empId]
    }));
  };

  const getAppliesTo = (template) => {
    if (template.applies_to_employees?.length > 0) {
      const empNames = template.applies_to_employees
        .map(id => employees.find(e => e.id === id)?.full_name)
        .filter(Boolean);
      return empNames.length > 2 
        ? `${empNames.slice(0, 2).join(', ')} +${empNames.length - 2}`
        : empNames.join(', ');
    }
    if (template.applies_to_roles?.length > 0) {
      return template.applies_to_roles.map(r => r.replace(/_/g, ' ')).join(', ');
    }
    return 'All employees';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      organisation_id: orgId
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
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

  const benefits = templates.filter(t => t.type === 'benefit');
  const deductions = templates.filter(t => t.type === 'deduction');
  
  // Duplicate template
  const duplicateTemplate = (template) => {
    setFormData({
      name: `${template.name} (Copy)`,
      type: template.type,
      category: template.category,
      calculation_type: template.calculation_type,
      amount: template.amount,
      percentage_of: template.percentage_of || 'base_salary',
      is_taxable: template.is_taxable ?? true,
      applies_to_roles: template.applies_to_roles || [],
      applies_to_employees: [],
      description: template.description || '',
      is_active: true
    });
    setAssignmentMode('roles');
    setShowDialog(true);
  };
  
  // Quick add from common templates
  const quickAddTemplate = (preset, type) => {
    setFormData({
      name: preset.name,
      type: type,
      category: type === 'benefit' ? 'allowance' : 'other',
      calculation_type: 'fixed',
      amount: 0,
      percentage_of: 'base_salary',
      is_taxable: true,
      applies_to_roles: [],
      applies_to_employees: [],
      description: preset.description || '',
      is_active: true
    });
    setShowDialog(true);
  };
  
  // Filter employees by search
  const filteredEmployees = employees.filter(e => 
    e.status === 'active' && 
    (e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     e.role?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Benefits & Deductions Templates</h3>
          <p className="text-sm text-gray-500">Configure recurring benefits and deductions for payroll</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Benefits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Gift className="w-5 h-5" />
                Benefits & Allowances ({benefits.length})
              </CardTitle>
              <Select onValueChange={(v) => quickAddTemplate(COMMON_ALLOWANCES.find(a => a.name === v), 'benefit')}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Quick add..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_ALLOWANCES.map(a => (
                    <SelectItem key={a.name} value={a.name} className="text-xs">{a.name}</SelectItem>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map(template => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.calculation_type === 'percentage' ? (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Percent className="w-3 h-3" />
                          {template.amount}%
                        </span>
                      ) : (
                        <span className="font-medium">{formatSLE(template.amount)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={template.is_active ? 'default' : 'secondary'} className={template.is_active ? 'bg-green-500' : ''}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-gray-500">{getAppliesTo(template)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(template)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => duplicateTemplate(template)} title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(template.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {benefits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No benefits configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Minus className="w-5 h-5" />
                Deductions ({deductions.length})
              </CardTitle>
              <Select onValueChange={(v) => quickAddTemplate(COMMON_DEDUCTIONS.find(d => d.name === v), 'deduction')}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Quick add..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_DEDUCTIONS.filter(d => d.type !== 'statutory').map(d => (
                    <SelectItem key={d.name} value={d.name} className="text-xs">{d.name}</SelectItem>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map(template => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.calculation_type === 'percentage' ? (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Percent className="w-3 h-3" />
                          {template.amount}%
                        </span>
                      ) : (
                        <span className="font-medium">{formatSLE(template.amount)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={template.is_active ? 'default' : 'secondary'} className={template.is_active ? 'bg-red-500' : ''}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-gray-500">{getAppliesTo(template)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(template)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => duplicateTemplate(template)} title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(template.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {deductions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No deductions configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Add New Template'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Transport Allowance"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benefit">Benefit (Adds to Pay)</SelectItem>
                    <SelectItem value="deduction">Deduction (Subtracts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calculation Type</Label>
                <Select value={formData.calculation_type} onValueChange={(v) => setFormData({ ...formData, calculation_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{formData.calculation_type === 'percentage' ? 'Percentage (%)' : 'Amount (NLE)'}</Label>
                <Input
                  type="number"
                  step={formData.calculation_type === 'percentage' ? '0.1' : '1'}
                  value={formData.amount || ""}
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
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Assignment Mode Toggle */}
            <div className="space-y-3">
              <Label>Apply To</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={assignmentMode === 'roles' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setAssignmentMode('roles');
                    setFormData(prev => ({ ...prev, applies_to_employees: [] }));
                  }}
                  className={assignmentMode === 'roles' ? 'bg-[#1EB053]' : ''}
                >
                  By Role
                </Button>
                <Button 
                  type="button" 
                  variant={assignmentMode === 'employees' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setAssignmentMode('employees');
                    setFormData(prev => ({ ...prev, applies_to_roles: [] }));
                  }}
                  className={assignmentMode === 'employees' ? 'bg-[#1EB053]' : ''}
                >
                  Specific Employees
                </Button>
              </div>
            </div>

            {assignmentMode === 'roles' ? (
              <div>
                <Label className="mb-2 block">Applies to Roles (leave empty for all)</Label>
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
                {formData.applies_to_roles.length > 0 && (
                  <p className="text-xs text-[#1EB053] mt-2">{formData.applies_to_roles.length} role(s) selected</p>
                )}
              </div>
            ) : (
              <div>
                <Label className="mb-2 block">Select Employees</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                    <div 
                      key={emp.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                        formData.applies_to_employees.includes(emp.id) ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <Checkbox checked={formData.applies_to_employees.includes(emp.id)} />
                      <span className="text-sm flex-1">{emp.full_name}</span>
                      <Badge variant="outline" className="text-xs">{emp.role?.replace(/_/g, ' ')}</Badge>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">No employees found</p>
                  )}
                </div>
                {formData.applies_to_employees.length > 0 && (
                  <p className="text-xs text-[#1EB053] mt-2">
                    {formData.applies_to_employees.length} employee(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Is Taxable</Label>
              <Switch
                checked={formData.is_taxable}
                onCheckedChange={(v) => setFormData({ ...formData, is_taxable: v })}
              />
            </div>

            <div className="flex items-center justify-between">
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
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}