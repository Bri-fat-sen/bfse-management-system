import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Shield, DollarSign, Package, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ApprovalWorkflowManager({ open, onOpenChange, orgId }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingRule, setEditingRule] = useState(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);

  const { data: rules = [] } = useQuery({
    queryKey: ['approvalRules', orgId],
    queryFn: () => base44.entities.ApprovalWorkflowRule.filter({ organisation_id: orgId }, '-priority'),
    enabled: !!orgId && open,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', orgId],
    queryFn: () => base44.entities.Supplier.filter({ organisation_id: orgId }),
    enabled: !!orgId && open,
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.ApprovalWorkflowRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRules'] });
      toast.success("Rule deleted");
    },
  });

  const ROLES = [
    { value: 'warehouse_manager', label: 'Warehouse Manager' },
    { value: 'org_admin', label: 'Organization Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'accountant', label: 'Accountant' },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0072C6]" />
              Approval Workflow Rules
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={() => { setEditingRule(null); setShowRuleDialog(true); }} className="w-full bg-[#1EB053]">
              <Plus className="w-4 h-4 mr-2" />
              Add Approval Rule
            </Button>

            {rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No approval rules configured</p>
                <p className="text-sm mt-1">All purchase orders will require manual approval</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <Card key={rule.id} className="border-l-4 border-l-[#0072C6]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge variant={rule.is_active ? "default" : "secondary"} className="text-xs">
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              {rule.trigger_type === 'value_based' && <DollarSign className="w-3 h-3 mr-1" />}
                              {rule.trigger_type === 'type_based' && <Package className="w-3 h-3 mr-1" />}
                              {rule.trigger_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {rule.description && <p className="text-sm text-gray-600 mb-2">{rule.description}</p>}
                          
                          <div className="text-sm space-y-1">
                            {rule.trigger_type === 'value_based' && rule.conditions && (
                              <p className="text-gray-600">
                                Amount: Le {(rule.conditions.min_amount || 0).toLocaleString()} - 
                                {rule.conditions.max_amount ? ` Le ${rule.conditions.max_amount.toLocaleString()}` : ' No limit'}
                              </p>
                            )}
                            <div>
                              <span className="text-gray-500">Approval Levels: </span>
                              {rule.approval_levels?.map((level, idx) => (
                                <Badge key={idx} variant="outline" className="ml-1 text-xs">
                                  L{level.level}: {level.required_role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingRule(rule); setShowRuleDialog(true); }}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteRuleMutation.mutate(rule.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RuleEditDialog 
        open={showRuleDialog}
        onOpenChange={setShowRuleDialog}
        rule={editingRule}
        orgId={orgId}
        suppliers={suppliers}
        roles={ROLES}
      />
    </>
  );
}

function RuleEditDialog({ open, onOpenChange, rule, orgId, suppliers, roles }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    is_active: rule?.is_active !== false,
    trigger_type: rule?.trigger_type || 'value_based',
    conditions: rule?.conditions || { min_amount: 0, max_amount: null },
    approval_levels: rule?.approval_levels || [{ level: 1, required_role: 'warehouse_manager', require_all: false }],
    priority: rule?.priority || 0,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => rule 
      ? base44.entities.ApprovalWorkflowRule.update(rule.id, data)
      : base44.entities.ApprovalWorkflowRule.create({ ...data, organisation_id: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRules'] });
      onOpenChange(false);
      toast.success(rule ? "Rule updated" : "Rule created");
    },
  });

  const addLevel = () => {
    setFormData({
      ...formData,
      approval_levels: [...formData.approval_levels, { 
        level: formData.approval_levels.length + 1, 
        required_role: 'org_admin', 
        require_all: false 
      }]
    });
  };

  const removeLevel = (index) => {
    setFormData({
      ...formData,
      approval_levels: formData.approval_levels.filter((_, i) => i !== index)
    });
  };

  const updateLevel = (index, field, value) => {
    const newLevels = [...formData.approval_levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setFormData({ ...formData, approval_levels: newLevels });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit' : 'Create'} Approval Rule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Rule Name *</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., High Value Orders" className="mt-1" />
          </div>

          <div>
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Trigger Type *</Label>
              <Select value={formData.trigger_type} onValueChange={(val) => setFormData({ ...formData, trigger_type: val })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value_based">Value Based</SelectItem>
                  <SelectItem value="type_based">Type Based</SelectItem>
                  <SelectItem value="supplier_based">Supplier Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} placeholder="0" className="mt-1" />
            </div>
          </div>

          {formData.trigger_type === 'value_based' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg">
              <div>
                <Label className="text-sm">Minimum Amount (Le)</Label>
                <Input type="number" value={formData.conditions.min_amount} onChange={(e) => setFormData({ ...formData, conditions: { ...formData.conditions, min_amount: parseFloat(e.target.value) || 0 } })} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Maximum Amount (Le)</Label>
                <Input type="number" value={formData.conditions.max_amount || ''} onChange={(e) => setFormData({ ...formData, conditions: { ...formData.conditions, max_amount: e.target.value ? parseFloat(e.target.value) : null } })} placeholder="No limit" className="mt-1" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Approval Levels *</Label>
              <Button type="button" onClick={addLevel} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />Add Level
              </Button>
            </div>
            <div className="space-y-2">
              {formData.approval_levels.map((level, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2">
                      <Label className="text-xs">Level</Label>
                      <Input type="number" value={level.level} onChange={(e) => updateLevel(index, 'level', parseInt(e.target.value) || 1)} className="mt-1 text-xs h-8" />
                    </div>
                    <div className="col-span-5">
                      <Label className="text-xs">Required Role</Label>
                      <Select value={level.required_role} onValueChange={(val) => updateLevel(index, 'required_role', val)}>
                        <SelectTrigger className="mt-1 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value} className="text-xs">{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4 flex items-center gap-2 mt-5">
                      <Checkbox checked={level.require_all} onCheckedChange={(val) => updateLevel(index, 'require_all', val)} />
                      <Label className="text-xs">Require all</Label>
                    </div>
                    <div className="col-span-1 flex items-end pb-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLevel(index)} className="h-8 w-8 text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
          <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.name || formData.approval_levels.length === 0} className="flex-1 bg-[#1EB053]">
            {saveMutation.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{rule ? 'Update' : 'Create'}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}