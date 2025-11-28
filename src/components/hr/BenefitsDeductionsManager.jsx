import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Gift, Minus, Percent, DollarSign } from "lucide-react";
import { formatSLE } from "./PayrollCalculator";

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
    description: '',
    is_active: true
  });

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
      description: '',
      is_active: true
    });
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
      description: template.description || '',
      is_active: template.is_active ?? true
    });
    setShowDialog(true);
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
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Gift className="w-5 h-5" />
              Benefits & Allowances ({benefits.length})
            </CardTitle>
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
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {template.amount}%
                        </span>
                      ) : (
                        formatSLE(template.amount)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(template)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(template.id)}>
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
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Minus className="w-5 h-5" />
              Deductions ({deductions.length})
            </CardTitle>
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
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {template.amount}%
                        </span>
                      ) : (
                        formatSLE(template.amount)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(template)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(template.id)}>
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
                <Label>{formData.calculation_type === 'percentage' ? 'Percentage (%)' : 'Amount (SLE)'}</Label>
                <Input
                  type="number"
                  step={formData.calculation_type === 'percentage' ? '0.1' : '1'}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
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

            <div>
              <Label className="mb-2 block">Applies to Roles (leave empty for all)</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <Badge
                    key={role.value}
                    variant={formData.applies_to_roles.includes(role.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRole(role.value)}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>

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