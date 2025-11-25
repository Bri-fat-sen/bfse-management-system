import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Briefcase,
  Phone,
  Shield,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Camera,
  Loader2,
  Sparkles
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic details" },
  { id: 2, title: "Employment", icon: Briefcase, description: "Job information" },
  { id: 3, title: "Contact", icon: Phone, description: "Contact details" },
  { id: 4, title: "Access", icon: Shield, description: "System access" },
];

const ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-purple-500" },
  { value: "org_admin", label: "Organisation Admin", color: "bg-blue-500" },
  { value: "hr_admin", label: "HR Admin", color: "bg-green-500" },
  { value: "payroll_admin", label: "Payroll Admin", color: "bg-yellow-500" },
  { value: "warehouse_manager", label: "Warehouse Manager", color: "bg-orange-500" },
  { value: "retail_cashier", label: "Retail Cashier", color: "bg-pink-500" },
  { value: "vehicle_sales", label: "Vehicle Sales", color: "bg-indigo-500" },
  { value: "driver", label: "Driver", color: "bg-teal-500" },
  { value: "accountant", label: "Accountant", color: "bg-cyan-500" },
  { value: "support_staff", label: "Support Staff", color: "bg-gray-500" },
  { value: "read_only", label: "Read Only", color: "bg-slate-400" },
];

const DEPARTMENTS = [
  "Administration", "Finance", "Human Resources", "Sales", 
  "Warehouse", "Transport", "IT", "Customer Service", "Operations"
];

export default function PremiumEmployeeForm({ open, onOpenChange, orgId, editEmployee = null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(editEmployee?.profile_photo || null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: editEmployee?.first_name || "",
    last_name: editEmployee?.last_name || "",
    email: editEmployee?.email || "",
    phone: editEmployee?.phone || "",
    employee_code: editEmployee?.employee_code || `EMP-${Date.now().toString(36).toUpperCase()}`,
    department: editEmployee?.department || "",
    position: editEmployee?.position || "",
    hire_date: editEmployee?.hire_date || new Date().toISOString().split('T')[0],
    salary_type: editEmployee?.salary_type || "monthly",
    base_salary: editEmployee?.base_salary || "",
    role: editEmployee?.role || "read_only",
    user_email: editEmployee?.user_email || "",
    address: editEmployee?.address || "",
    emergency_contact: editEmployee?.emergency_contact || "",
    emergency_phone: editEmployee?.emergency_phone || "",
    profile_photo: editEmployee?.profile_photo || "",
    status: editEmployee?.status || "active",
  });

  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organisation_id: orgId,
        full_name: `${data.first_name} ${data.last_name}`.trim(),
      };
      return editEmployee 
        ? base44.entities.Employee.update(editEmployee.id, payload)
        : base44.entities.Employee.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ 
        title: editEmployee ? "Employee Updated" : "Employee Created",
        description: `${formData.first_name} ${formData.last_name} has been ${editEmployee ? 'updated' : 'added'} successfully.`
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      first_name: "", last_name: "", email: "", phone: "",
      employee_code: `EMP-${Date.now().toString(36).toUpperCase()}`,
      department: "", position: "", hire_date: new Date().toISOString().split('T')[0],
      salary_type: "monthly", base_salary: "", role: "read_only",
      user_email: "", address: "", emergency_contact: "", emergency_phone: "",
      profile_photo: "", status: "active"
    });
    setPhotoPreview(null);
    setErrors({});
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_photo: file_url });
      setPhotoPreview(file_url);
      toast({ title: "Photo uploaded successfully" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
      if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    }
    
    if (step === 2) {
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.position.trim()) newErrors.position = "Position is required";
      if (!formData.hire_date) newErrors.hire_date = "Hire date is required";
    }
    
    if (step === 3) {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      mutation.mutate(formData);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <DialogHeader className="relative p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              {editEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              Complete all steps to {editEmployee ? 'update' : 'register'} the employee
            </p>
          </DialogHeader>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className={`flex flex-col items-center transition-all ${
                    currentStep >= step.id ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.id 
                      ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg scale-110' 
                      : currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Photo Upload */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl ${
                        photoPreview ? '' : 'bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20'
                      }`}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder="Enter first name"
                        className={`mt-1.5 h-11 ${errors.first_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        placeholder="Enter last name"
                        className={`mt-1.5 h-11 ${errors.last_name ? 'border-red-500' : ''}`}
                      />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Employee Code</Label>
                    <Input
                      value={formData.employee_code}
                      onChange={(e) => updateField('employee_code', e.target.value)}
                      placeholder="EMP-XXXXX"
                      className="mt-1.5 h-11 bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Employment */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Department *</Label>
                      <Select value={formData.department} onValueChange={(v) => updateField('department', v)}>
                        <SelectTrigger className={`mt-1.5 h-11 ${errors.department ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Position *</Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => updateField('position', e.target.value)}
                        placeholder="e.g. Sales Manager"
                        className={`mt-1.5 h-11 ${errors.position ? 'border-red-500' : ''}`}
                      />
                      {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Hire Date *</Label>
                      <Input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => updateField('hire_date', e.target.value)}
                        className={`mt-1.5 h-11 ${errors.hire_date ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Status</Label>
                      <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                        <SelectTrigger className="mt-1.5 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Salary Type</Label>
                      <Select value={formData.salary_type} onValueChange={(v) => updateField('salary_type', v)}>
                        <SelectTrigger className="mt-1.5 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Base Salary (Le)</Label>
                      <Input
                        type="number"
                        value={formData.base_salary}
                        onChange={(e) => updateField('base_salary', e.target.value)}
                        placeholder="0"
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="email@example.com"
                        className={`mt-1.5 h-11 ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+232 XX XXX XXX"
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Enter full address"
                      className="mt-1.5 min-h-[80px]"
                    />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Emergency Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-amber-700">Contact Name</Label>
                        <Input
                          value={formData.emergency_contact}
                          onChange={(e) => updateField('emergency_contact', e.target.value)}
                          placeholder="Emergency contact name"
                          className="mt-1 h-10 bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-amber-700">Contact Phone</Label>
                        <Input
                          value={formData.emergency_phone}
                          onChange={(e) => updateField('emergency_phone', e.target.value)}
                          placeholder="+232 XX XXX XXX"
                          className="mt-1 h-10 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Access */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">System Login Email</Label>
                    <Input
                      type="email"
                      value={formData.user_email}
                      onChange={(e) => updateField('user_email', e.target.value)}
                      placeholder="login@example.com"
                      className="mt-1.5 h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1">This email will be used for system login</p>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">System Role</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateField('role', role.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            formData.role === role.value
                              ? 'border-[#1EB053] bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${role.color}`} />
                            <span className="font-medium text-sm">{role.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl border border-[#1EB053]/20">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Name:</span> {formData.first_name} {formData.last_name}</p>
                      <p><span className="text-gray-500">Code:</span> {formData.employee_code}</p>
                      <p><span className="text-gray-500">Department:</span> {formData.department || '-'}</p>
                      <p><span className="text-gray-500">Position:</span> {formData.position || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === i + 1 ? 'w-6 bg-[#1EB053]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <Button onClick={nextStep} className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {editEmployee ? 'Update' : 'Create'} Employee</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}