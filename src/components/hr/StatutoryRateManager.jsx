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
import { Plus, Pencil, Trash2, Shield, AlertTriangle, Info, RefreshCw, Scale } from "lucide-react";
import { formatSLE, SL_TAX_BRACKETS, NASSIT_EMPLOYEE_RATE, NASSIT_EMPLOYER_RATE } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_STATUTORY_RATES = [
  {
    name: "NASSIT Employee Contribution",
    code: "NASSIT_EMP",
    type: "social_security",
    calculation_method: "percentage",
    rate: 5,
    employer_rate: null,
    applies_to_base: "gross_pay",
    is_mandatory: true,
    legal_reference: "NASSIT Act - National Social Security and Insurance Trust",
    notes: "Employee contribution to social security"
  },
  {
    name: "NASSIT Employer Contribution",
    code: "NASSIT_EMP_ER",
    type: "social_security",
    calculation_method: "percentage",
    rate: 10,
    employer_rate: null,
    applies_to_base: "gross_pay",
    is_mandatory: true,
    legal_reference: "NASSIT Act - National Social Security and Insurance Trust",
    notes: "Employer contribution to social security (not deducted from employee)"
  },
  {
    name: "PAYE Income Tax",
    code: "PAYE",
    type: "income_tax",
    calculation_method: "progressive",
    rate: null,
    tiers: SL_TAX_BRACKETS.map(b => ({
      min: b.min,
      max: b.max === Infinity ? 999999999 : b.max,
      rate: b.rate * 100,
      label: b.label
    })),
    exemption_threshold: 6000,
    applies_to_base: "taxable_income",
    is_mandatory: true,
    legal_reference: "Finance Act 2024 - Sierra Leone Income Tax",
    notes: "Progressive income tax. First Le 6,000 annually is tax-free."
  }
];

export default function StatutoryRateManager({ orgId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'other',
    calculation_method: 'percentage',
    rate: 0,
    employer_rate: null,
    tiers: [],
    exemption_threshold: 0,
    max_contribution: null,
    applies_to_base: 'gross_pay',
    is_mandatory: true,
    is_active: true,
    legal_reference: '',
    notes: ''
  });

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

  const initializeDefaultRates = async () => {
    try {
      for (const rate of DEFAULT_STATUTORY_RATES) {
        const existing = rates.find(r => r.code === rate.code);
        if (!existing) {
          await base44.entities.StatutoryRate.create({
            ...rate,
            organisation_id: orgId,
            country: 'Sierra Leone',
            is_active: true
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['statutoryRates'] });
      toast.success('Default Sierra Leone statutory rates initialized');
    } catch (error) {
      toast.error('Failed to initialize rates');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'other',
      calculation_method: 'percentage',
      rate: 0,
      employer_rate: null,
      tiers: [],
      exemption_threshold: 0,
      max_contribution: null,
      applies_to_base: 'gross_pay',
      is_mandatory: true,
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
      name: rate.name || '',
      code: rate.code || '',
      type: rate.type || 'other',
      calculation_method: rate.calculation_method || 'percentage',
      rate: rate.rate || 0,
      employer_rate: rate.employer_rate,
      tiers: rate.tiers || [],
      exemption_threshold: rate.exemption_threshold || 0,
      max_contribution: rate.max_contribution,
      applies_to_base: rate.applies_to_base || 'gross_pay',
      is_mandatory: rate.is_mandatory ?? true,
      is_active: rate.is_active ?? true,
      legal_reference: rate.legal_reference || '',
      notes: rate.notes || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      organisation_id: orgId,
      country: 'Sierra Leone'
    };

    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { min: 0, max: 0, rate: 0, label: '' }]
    }));
  };

  const updateTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) => i === index ? { ...tier, [field]: value } : tier)
    }));
  };

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">🇸🇱</span>
            Statutory Deductions
          </h3>
          <p className="text-sm text-gray-500">Configure NASSIT, PAYE Tax and other statutory rates</p>
        </div>
        <div className="flex gap-2">
          {rates.length === 0 && (
            <Button variant="outline" onClick={initializeDefaultRates} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Initialize SL Defaults
            </Button>
          )}
          <Button onClick={() => setShowDialog(true)} className="bg-[#0072C6] hover:bg-[#005a9e]">
            <Plus className="w-4 h-4 mr-2" />
            Add Rate
          </Button>
        </div>
      </div>

      {/* Current Rates Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">NASSIT Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1EB053]">
              {rates.find(r => r.code === 'NASSIT_EMP')?.rate || NASSIT_EMPLOYEE_RATE * 100}%
            </p>
            <p className="text-xs text-gray-500">of gross pay</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0072C6]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">NASSIT Employer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0072C6]">
              {rates.find(r => r.code === 'NASSIT_EMP_ER')?.rate || NASSIT_EMPLOYER_RATE * 100}%
            </p>
            <p className="text-xs text-gray-500">employer contribution</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">PAYE Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">0% - 30%</p>
            <p className="text-xs text-gray-500">progressive brackets</p>
          </CardContent>
        </Card>
      </div>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Configured Rates
          </CardTitle>
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
              {rates.map(rate => (
                <TableRow key={rate.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {rate.name}
                        {rate.is_mandatory && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Shield className="w-4 h-4 text-[#0072C6]" />
                              </TooltipTrigger>
                              <TooltipContent>Mandatory deduction</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">{rate.code}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rate.type?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    {rate.calculation_method === 'progressive' ? (
                      <span className="text-sm">Progressive (see tiers)</span>
                    ) : (
                      <span className="font-medium">{rate.rate}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{rate.applies_to_base?.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rate.is_active ? 'default' : 'secondary'} className={rate.is_active ? 'bg-green-500' : ''}>
                      {rate.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(rate)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(rate.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No statutory rates configured</p>
                      <Button variant="link" onClick={initializeDefaultRates} className="text-[#1EB053]">
                        Initialize Sierra Leone defaults
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYE Tax Brackets Info */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Info className="w-5 h-5" />
            PAYE Tax Brackets (Sierra Leone 2025)
          </CardTitle>
          <CardDescription>Based on Finance Act 2024 - Annual Income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SL_TAX_BRACKETS.map((bracket, i) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-gray-500">
                  {formatSLE(bracket.min)} - {bracket.max === Infinity ? '∞' : formatSLE(bracket.max)}
                </p>
                <p className="text-lg font-bold text-amber-700">{bracket.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-3">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            First Le 6,000 annually (Le 500 monthly) is tax-free
          </p>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          {/* Flag Stripe Header */}
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-6 py-4 text-white">
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {editingRate ? 'Edit' : 'Add'} Statutory Rate
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">Configure statutory deduction rates</p>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., NASSIT Employee"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., NASSIT_EMP"
                  required
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_security">Social Security</SelectItem>
                    <SelectItem value="income_tax">Income Tax</SelectItem>
                    <SelectItem value="health_insurance">Health Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calculation Method</Label>
                <Select value={formData.calculation_method} onValueChange={(v) => setFormData({ ...formData, calculation_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Flat Percentage</SelectItem>
                    <SelectItem value="progressive">Progressive (Tiered)</SelectItem>
                    <SelectItem value="flat_rate">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.calculation_method !== 'progressive' && (
                <div>
                  <Label>Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.rate || ""}
                    onChange={(e) => setFormData({ ...formData, rate: safeNumber(e.target.value) })}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              )}
            </div>

            {formData.calculation_method === 'progressive' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tax Tiers</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTier}>
                    <Plus className="w-4 h-4 mr-1" /> Add Tier
                  </Button>
                </div>
                {formData.tiers.map((tier, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={tier.min || ""}
                      onChange={(e) => updateTier(index, 'min', safeNumber(e.target.value))}
                      onWheel={(e) => e.target.blur()}
                      className="w-24"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={tier.max || ""}
                      onChange={(e) => updateTier(index, 'max', safeNumber(e.target.value))}
                      onWheel={(e) => e.target.blur()}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Rate %"
                      value={tier.rate || ""}
                      onChange={(e) => updateTier(index, 'rate', safeNumber(e.target.value))}
                      onWheel={(e) => e.target.blur()}
                      className="w-20"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>Applies To</Label>
              <Select value={formData.applies_to_base} onValueChange={(v) => setFormData({ ...formData, applies_to_base: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross_pay">Gross Pay</SelectItem>
                  <SelectItem value="basic_salary">Basic Salary</SelectItem>
                  <SelectItem value="taxable_income">Taxable Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Legal Reference</Label>
              <Input
                value={formData.legal_reference}
                onChange={(e) => setFormData({ ...formData, legal_reference: e.target.value })}
                placeholder="e.g., NASSIT Act"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mandatory</Label>
              <Switch checked={formData.is_mandatory} onCheckedChange={(v) => setFormData({ ...formData, is_mandatory: v })} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white">
                {editingRate ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
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