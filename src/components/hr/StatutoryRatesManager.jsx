import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Shield, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { formatSLE, SL_TAX_BRACKETS, NASSIT_EMPLOYEE_RATE, NASSIT_EMPLOYER_RATE } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

const DEFAULT_STATUTORY_RATES = [
  {
    name: 'NASSIT Employee Contribution',
    code: 'NASSIT_EMP',
    type: 'social_security',
    calculation_method: 'percentage',
    rate: 5,
    employer_rate: 0,
    applies_to_base: 'gross_pay',
    is_mandatory: true,
    legal_reference: 'NASSIT Act',
    notes: 'Employee contribution to National Social Security'
  },
  {
    name: 'NASSIT Employer Contribution',
    code: 'NASSIT_EMP_ER',
    type: 'social_security',
    calculation_method: 'percentage',
    rate: 0,
    employer_rate: 10,
    applies_to_base: 'gross_pay',
    is_mandatory: true,
    legal_reference: 'NASSIT Act',
    notes: 'Employer contribution to National Social Security'
  },
  {
    name: 'PAYE Income Tax',
    code: 'PAYE',
    type: 'income_tax',
    calculation_method: 'progressive',
    rate: 0,
    tiers: SL_TAX_BRACKETS.map(b => ({
      min: b.min,
      max: b.max === Infinity ? 999999999 : b.max,
      rate: b.rate * 100,
      label: b.label
    })),
    exemption_threshold: 6000,
    applies_to_base: 'taxable_income',
    is_mandatory: true,
    legal_reference: 'Finance Act 2024',
    notes: 'Pay As You Earn progressive income tax'
  }
];

export default function StatutoryRatesManager({ orgId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'other',
    calculation_method: 'percentage',
    rate: 0,
    employer_rate: 0,
    tiers: [],
    exemption_threshold: 0,
    max_contribution: null,
    applies_to_base: 'gross_pay',
    is_mandatory: true,
    effective_from: '',
    effective_to: '',
    is_active: true,
    legal_reference: '',
    notes: ''
  });
  const [newTier, setNewTier] = useState({ min: 0, max: 0, rate: 0, label: '' });

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['statutoryRates', orgId],
    queryFn: () => base44.entities.StatutoryRate.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StatutoryRate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutoryRates'] });
      toast.success('Statutory rate created');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StatutoryRate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutoryRates'] });
      toast.success('Statutory rate updated');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StatutoryRate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutoryRates'] });
      toast.success('Statutory rate deleted');
    }
  });

  // Initialize default rates if none exist
  const initializeDefaultsMutation = useMutation({
    mutationFn: async () => {
      const existingCodes = rates.map(r => r.code);
      const toCreate = DEFAULT_STATUTORY_RATES.filter(r => !existingCodes.includes(r.code));
      
      for (const rate of toCreate) {
        await base44.entities.StatutoryRate.create({
          ...rate,
          organisation_id: orgId,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutoryRates'] });
      toast.success('Default statutory rates initialized');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'other',
      calculation_method: 'percentage',
      rate: 0,
      employer_rate: 0,
      tiers: [],
      exemption_threshold: 0,
      max_contribution: null,
      applies_to_base: 'gross_pay',
      is_mandatory: true,
      effective_from: '',
      effective_to: '',
      is_active: true,
      legal_reference: '',
      notes: ''
    });
    setEditingRate(null);
    setShowDialog(false);
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      ...rate,
      tiers: rate.tiers || [],
      max_contribution: rate.max_contribution || null
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      organisation_id: orgId,
      code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '_').slice(0, 15)
    };

    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTier = () => {
    if (newTier.min >= 0 && newTier.rate >= 0) {
      setFormData(prev => ({
        ...prev,
        tiers: [...prev.tiers, { ...newTier }].sort((a, b) => a.min - b.min)
      }));
      setNewTier({ min: 0, max: 0, rate: 0, label: '' });
    }
  };

  const removeTier = (idx) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0072C6]" />
            Statutory Deductions
          </h3>
          <p className="text-sm text-gray-500">
            Manage NASSIT, PAYE Tax, and other mandatory deductions
          </p>
        </div>
        <div className="flex gap-2">
          {rates.length === 0 && (
            <Button variant="outline" onClick={() => initializeDefaultsMutation.mutate()}
              disabled={initializeDefaultsMutation.isPending}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Defaults
            </Button>
          )}
          <Button onClick={() => setShowDialog(true)} className="bg-[#0072C6] hover:bg-[#005a9e]">
            <Plus className="w-4 h-4 mr-2" />
            Add Rate
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Sierra Leone Statutory Rates (2025)</p>
              <p className="mt-1">
                <strong>NASSIT:</strong> Employee 5%, Employer 10% (per NASSIT Act)
              </p>
              <p>
                <strong>PAYE Tax:</strong> Progressive rates from 0% to 30% (per Finance Act 2024)
              </p>
              <p className="mt-1 text-xs text-blue-600">
                First Le 6,000 annually (Le 500 monthly) is tax-free
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Statutory Rates</CardTitle>
          <CardDescription>
            These rates are automatically applied during payroll processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No statutory rates configured. Click "Load Defaults" to add Sierra Leone standard rates.
                  </TableCell>
                </TableRow>
              ) : (
                rates.map(rate => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rate.name}</p>
                        <p className="text-xs text-gray-500">{rate.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {rate.type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rate.calculation_method === 'progressive' ? (
                        <span className="text-xs">Progressive (see tiers)</span>
                      ) : (
                        <div>
                          {rate.rate > 0 && <p className="font-medium">{rate.rate}% (Employee)</p>}
                          {rate.employer_rate > 0 && <p className="text-xs text-gray-500">{rate.employer_rate}% (Employer)</p>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {rate.applies_to_base?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={rate.is_active ? 'bg-green-500' : 'bg-gray-400'}>
                          {rate.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {rate.is_mandatory && (
                          <Badge variant="outline" className="text-xs">Mandatory</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(rate)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!rate.is_mandatory && (
                          <Button size="icon" variant="ghost" onClick={() => {
                            if (window.confirm(`Delete "${rate.name}"?`)) {
                              deleteMutation.mutate(rate.id);
                            }
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? 'Edit Statutory Rate' : 'Add Statutory Rate'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., NASSIT Employee"
                  required
                />
              </div>
              <div>
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Auto-generated"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_security">Social Security</SelectItem>
                    <SelectItem value="income_tax">Income Tax</SelectItem>
                    <SelectItem value="health_insurance">Health Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Calculation Method</Label>
                <Select value={formData.calculation_method} onValueChange={(v) => setFormData({ ...formData, calculation_method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat_rate">Flat Rate</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="tiered">Tiered</SelectItem>
                    <SelectItem value="progressive">Progressive (Tax Brackets)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.calculation_method === 'percentage' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.rate || ''}
                    onChange={(e) => setFormData({ ...formData, rate: safeNumber(e.target.value) })}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
                <div>
                  <Label>Employer Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.employer_rate || ''}
                    onChange={(e) => setFormData({ ...formData, employer_rate: safeNumber(e.target.value) })}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>
            )}

            {(formData.calculation_method === 'progressive' || formData.calculation_method === 'tiered') && (
              <div className="space-y-3">
                <Label>Tax Brackets / Tiers</Label>
                <div className="border rounded-lg p-3 space-y-2">
                  {formData.tiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                      <span>{formatSLE(tier.min)} - {tier.max >= 999999999 ? '∞' : formatSLE(tier.max)}</span>
                      <span className="font-medium">{tier.rate}%</span>
                      {tier.label && <Badge variant="outline">{tier.label}</Badge>}
                      <Button type="button" size="icon" variant="ghost" className="ml-auto h-6 w-6"
                        onClick={() => removeTier(idx)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-5 gap-2 pt-2 border-t">
                    <Input type="number" placeholder="Min" value={newTier.min || ''}
                      onChange={(e) => setNewTier({ ...newTier, min: safeNumber(e.target.value) })}
                      onWheel={(e) => e.target.blur()} />
                    <Input type="number" placeholder="Max" value={newTier.max || ''}
                      onChange={(e) => setNewTier({ ...newTier, max: safeNumber(e.target.value) })}
                      onWheel={(e) => e.target.blur()} />
                    <Input type="number" placeholder="Rate %" value={newTier.rate || ''}
                      onChange={(e) => setNewTier({ ...newTier, rate: safeNumber(e.target.value) })}
                      onWheel={(e) => e.target.blur()} />
                    <Input placeholder="Label" value={newTier.label}
                      onChange={(e) => setNewTier({ ...newTier, label: e.target.value })} />
                    <Button type="button" size="sm" onClick={addTier}>Add</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exemption Threshold (Le)</Label>
                <Input
                  type="number"
                  value={formData.exemption_threshold || ''}
                  onChange={(e) => setFormData({ ...formData, exemption_threshold: safeNumber(e.target.value) })}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Applies To</Label>
                <Select value={formData.applies_to_base} onValueChange={(v) => setFormData({ ...formData, applies_to_base: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross_pay">Gross Pay</SelectItem>
                    <SelectItem value="basic_salary">Basic Salary</SelectItem>
                    <SelectItem value="taxable_income">Taxable Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Mandatory</p>
                  <p className="text-xs text-gray-500">Required by law</p>
                </div>
                <Switch
                  checked={formData.is_mandatory}
                  onCheckedChange={(v) => setFormData({ ...formData, is_mandatory: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>

            <div>
              <Label>Legal Reference</Label>
              <Input
                value={formData.legal_reference}
                onChange={(e) => setFormData({ ...formData, legal_reference: e.target.value })}
                placeholder="e.g., NASSIT Act, Finance Act 2024"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" className="bg-[#0072C6] hover:bg-[#005a9e]">
                {editingRate ? 'Update' : 'Create'} Rate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}