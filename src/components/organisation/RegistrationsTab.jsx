import React, { useState } from "react";
import { differenceInDays, format } from "date-fns";
import {
  FileText,
  AlertTriangle,
  Calendar,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  Upload,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

// Sierra Leone business registration types
const REGISTRATION_FIELDS = [
  {
    id: 'tin',
    name: 'TIN (Tax Identification Number)',
    authority: 'National Revenue Authority (NRA)',
    numberField: 'tin_number',
    expiryField: 'tin_expiry_date',
    required: true,
    description: 'Required for all businesses operating in Sierra Leone'
  },
  {
    id: 'business_reg',
    name: 'Business Registration',
    authority: 'Office of Administrator & Registrar General (OARG)',
    numberField: 'business_registration_number',
    expiryField: 'business_registration_date',
    required: true,
    issueDateLabel: 'Registration Date',
    description: 'Certificate of Incorporation or Business Name Registration'
  },
  {
    id: 'business_license',
    name: 'Business License',
    authority: 'Local Council',
    numberField: 'business_license_number',
    expiryField: 'business_license_expiry',
    required: true,
    description: 'Annual operating license from local council'
  },
  {
    id: 'nassit',
    name: 'NASSIT Registration',
    authority: 'National Social Security & Insurance Trust',
    numberField: 'nassit_number',
    expiryField: 'nassit_expiry_date',
    required: true,
    description: 'Employer registration for social security contributions'
  },
  {
    id: 'gst',
    name: 'GST Registration',
    authority: 'National Revenue Authority (NRA)',
    numberField: 'gst_number',
    expiryField: 'gst_expiry_date',
    required: false,
    description: 'Goods and Services Tax registration (if turnover > threshold)'
  },
  {
    id: 'import_export',
    name: 'Import/Export License',
    authority: 'Ministry of Trade & Industry',
    numberField: 'import_export_license',
    expiryField: 'import_export_expiry',
    required: false,
    description: 'Required for import/export businesses'
  },
  {
    id: 'fire',
    name: 'Fire Safety Certificate',
    authority: 'Sierra Leone Fire Force',
    numberField: 'fire_certificate_number',
    expiryField: 'fire_certificate_expiry',
    required: true,
    description: 'Annual fire safety inspection certificate'
  },
  {
    id: 'health',
    name: 'Health & Sanitation Certificate',
    authority: 'Environmental Health Department',
    numberField: 'health_certificate_number',
    expiryField: 'health_certificate_expiry',
    required: false,
    description: 'Required for food handling and certain businesses'
  },
  {
    id: 'slra',
    name: 'SLRA Transport License',
    authority: 'Sierra Leone Road Transport Authority',
    numberField: 'slra_license_number',
    expiryField: 'slra_license_expiry',
    required: false,
    description: 'Required for transport/haulage businesses'
  },
  {
    id: 'environmental',
    name: 'Environmental Permit',
    authority: 'Environment Protection Agency (EPA)',
    numberField: 'environmental_permit_number',
    expiryField: 'environmental_permit_expiry',
    required: false,
    description: 'Required for businesses with environmental impact'
  },
  {
    id: 'slsb',
    name: 'SLSB Registration',
    authority: 'Sierra Leone Standards Bureau',
    numberField: 'slsb_registration',
    expiryField: 'slsb_expiry_date',
    required: false,
    description: 'Product quality standards certification'
  },
  {
    id: 'trade',
    name: 'Trade License',
    authority: 'Ministry of Trade & Industry',
    numberField: 'trade_license_number',
    expiryField: 'trade_license_expiry',
    required: false,
    description: 'Specific trade or sector license'
  }
];

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0) return { status: 'expired', label: 'Expired', color: 'bg-red-500 text-white', days: Math.abs(days) };
  if (days <= 30) return { status: 'critical', label: `${days}d left`, color: 'bg-red-100 text-red-700 border-red-200', days };
  if (days <= 60) return { status: 'warning', label: `${days}d left`, color: 'bg-orange-100 text-orange-700 border-orange-200', days };
  if (days <= 90) return { status: 'attention', label: `${days}d left`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', days };
  return { status: 'valid', label: 'Valid', color: 'bg-green-100 text-green-700 border-green-200', days };
};

export default function RegistrationsTab({ formData, setFormData, isAdmin, handleSave, updateOrgMutation }) {
  const [showOtherPermitDialog, setShowOtherPermitDialog] = useState(false);
  const [editingPermitIndex, setEditingPermitIndex] = useState(null);
  const [permitForm, setPermitForm] = useState({
    name: '',
    number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    document_url: '',
    notes: ''
  });

  // Calculate stats
  const registrationStats = REGISTRATION_FIELDS.reduce((acc, field) => {
    const hasNumber = formData?.[field.numberField];
    const expiryDate = formData?.[field.expiryField];
    if (hasNumber) {
      acc.registered++;
      const status = getExpiryStatus(expiryDate);
      if (status?.status === 'expired') acc.expired++;
      else if (status?.status === 'critical' || status?.status === 'warning') acc.expiringSoon++;
    }
    return acc;
  }, { registered: 0, expired: 0, expiringSoon: 0, total: REGISTRATION_FIELDS.length });

  // Add other permits to stats
  const otherPermits = formData?.other_permits || [];
  otherPermits.forEach(permit => {
    if (permit.number) {
      registrationStats.registered++;
      registrationStats.total++;
      const status = getExpiryStatus(permit.expiry_date);
      if (status?.status === 'expired') registrationStats.expired++;
      else if (status?.status === 'critical' || status?.status === 'warning') registrationStats.expiringSoon++;
    }
  });

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOtherPermit = () => {
    if (!permitForm.name || !permitForm.number) {
      toast.error("Please enter permit name and number");
      return;
    }
    
    const newPermits = [...(formData.other_permits || [])];
    if (editingPermitIndex !== null) {
      newPermits[editingPermitIndex] = permitForm;
    } else {
      newPermits.push(permitForm);
    }
    
    setFormData(prev => ({ ...prev, other_permits: newPermits }));
    setShowOtherPermitDialog(false);
    setPermitForm({ name: '', number: '', issuing_authority: '', issue_date: '', expiry_date: '', document_url: '', notes: '' });
    setEditingPermitIndex(null);
    toast.success(editingPermitIndex !== null ? "Permit updated" : "Permit added");
  };

  const handleEditPermit = (index) => {
    setPermitForm(formData.other_permits[index]);
    setEditingPermitIndex(index);
    setShowOtherPermitDialog(true);
  };

  const handleDeletePermit = (index) => {
    const newPermits = formData.other_permits.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, other_permits: newPermits }));
    toast.success("Permit removed");
  };

  const handleDocumentUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (field === 'permit_document') {
        setPermitForm(prev => ({ ...prev, document_url: file_url }));
      }
      toast.success("Document uploaded");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1EB053]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1EB053]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrationStats.registered}</p>
                <p className="text-xs text-gray-500">Registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0072C6]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrationStats.registered - registrationStats.expired}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrationStats.expiringSoon}</p>
                <p className="text-xs text-gray-500">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registrationStats.expired}</p>
                <p className="text-xs text-gray-500">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Registrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <CardTitle>Business Registrations & Permits</CardTitle>
                <CardDescription>Sierra Leone regulatory compliance documents</CardDescription>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={handleSave} disabled={updateOrgMutation?.isPending} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                {updateOrgMutation?.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REGISTRATION_FIELDS.map((field) => {
              const hasValue = formData?.[field.numberField];
              const expiryStatus = getExpiryStatus(formData?.[field.expiryField]);
              
              return (
                <div 
                  key={field.id} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    hasValue 
                      ? expiryStatus?.status === 'expired'
                        ? 'border-red-200 bg-red-50/50'
                        : expiryStatus?.status === 'critical' || expiryStatus?.status === 'warning'
                          ? 'border-orange-200 bg-orange-50/50'
                          : 'border-green-200 bg-green-50/50'
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{field.name}</h4>
                        {field.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Required</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">{field.authority}</p>
                    </div>
                    {hasValue && expiryStatus && (
                      <Badge className={expiryStatus.color}>
                        {expiryStatus.label}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Registration/License Number</Label>
                      <Input
                        value={formData?.[field.numberField] || ''}
                        onChange={(e) => handleFieldChange(field.numberField, e.target.value)}
                        disabled={!isAdmin}
                        placeholder={`Enter ${field.name}`}
                        className="h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">
                        {field.issueDateLabel || 'Expiry/Renewal Date'}
                      </Label>
                      <Input
                        type="date"
                        value={formData?.[field.expiryField] || ''}
                        onChange={(e) => handleFieldChange(field.expiryField, e.target.value)}
                        disabled={!isAdmin}
                        className="h-9 mt-1"
                      />
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 mt-3">{field.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Other Permits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Other Permits & Certificates</CardTitle>
                <CardDescription>Additional licenses and certifications</CardDescription>
              </div>
            </div>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setPermitForm({ name: '', number: '', issuing_authority: '', issue_date: '', expiry_date: '', document_url: '', notes: '' });
                  setEditingPermitIndex(null);
                  setShowOtherPermitDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Permit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {otherPermits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No additional permits added yet</p>
              {isAdmin && (
                <Button 
                  variant="link" 
                  onClick={() => setShowOtherPermitDialog(true)}
                  className="mt-2"
                >
                  Add your first permit
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {otherPermits.map((permit, index) => {
                const expiryStatus = getExpiryStatus(permit.expiry_date);
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      expiryStatus?.status === 'expired'
                        ? 'border-red-200 bg-red-50/50'
                        : expiryStatus?.status === 'critical' || expiryStatus?.status === 'warning'
                          ? 'border-orange-200 bg-orange-50/50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{permit.name}</h4>
                        {expiryStatus && (
                          <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">#{permit.number}</p>
                      {permit.issuing_authority && (
                        <p className="text-xs text-gray-400">{permit.issuing_authority}</p>
                      )}
                      {permit.expiry_date && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {format(new Date(permit.expiry_date), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {permit.document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={permit.document_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEditPermit(index)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeletePermit(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Permit Dialog */}
      <Dialog open={showOtherPermitDialog} onOpenChange={setShowOtherPermitDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPermitIndex !== null ? 'Edit Permit' : 'Add New Permit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Permit/Certificate Name *</Label>
              <Input
                value={permitForm.name}
                onChange={(e) => setPermitForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Food Handler Certificate"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Registration/License Number *</Label>
              <Input
                value={permitForm.number}
                onChange={(e) => setPermitForm(prev => ({ ...prev, number: e.target.value }))}
                placeholder="Enter license number"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Issuing Authority</Label>
              <Input
                value={permitForm.issuing_authority}
                onChange={(e) => setPermitForm(prev => ({ ...prev, issuing_authority: e.target.value }))}
                placeholder="e.g. Ministry of Health"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={permitForm.issue_date}
                  onChange={(e) => setPermitForm(prev => ({ ...prev, issue_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={permitForm.expiry_date}
                  onChange={(e) => setPermitForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Document (Optional)</Label>
              <div className="mt-1">
                {permitForm.document_url ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Document uploaded
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setPermitForm(prev => ({ ...prev, document_url: '' }))}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Document</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload(e, 'permit_document')} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={permitForm.notes}
                onChange={(e) => setPermitForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOtherPermitDialog(false)}>Cancel</Button>
            <Button onClick={handleAddOtherPermit} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              {editingPermitIndex !== null ? 'Update' : 'Add'} Permit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}