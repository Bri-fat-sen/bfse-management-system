import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Briefcase, Phone, MapPin, Shield, Camera, Check, ChevronRight, ChevronLeft, Upload, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic details" },
  { id: 2, title: "Employment", icon: Briefcase, description: "Job information" },
  { id: 3, title: "Contact", icon: Phone, description: "Contact details" },
  { id: 4, title: "Emergency", icon: Shield, description: "Emergency contact" },
  { id: 5, title: "Review", icon: Check, description: "Confirm details" },
];

const DEPARTMENTS = ["Administration", "Sales", "Operations", "Finance", "HR", "IT", "Logistics", "Warehouse"];
const ROLES = [
  { value: "support_staff", label: "Support Staff" },
  { value: "retail_cashier", label: "Retail Cashier" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "driver", label: "Driver" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "org_admin", label: "Organisation Admin" },
];

export default function EmployeeOnboardingForm({ orgId, onSuccess, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_photo: "",
    department: "",
    position: "",
    role: "support_staff",
    hire_date: new Date().toISOString().split('T')[0],
    salary_type: "monthly",
    base_salary: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Employee Added Successfully!", description: "Welcome to the team! 🇸🇱" });
      onSuccess?.();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    
    if (stepNum === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
      if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    }
    if (stepNum === 2) {
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.position.trim()) newErrors.position = "Position is required";
      if (!formData.hire_date) newErrors.hire_date = "Hire date is required";
    }
    if (stepNum === 3) {
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoPreview(URL.createObjectURL(file));
      updateField('profile_photo', file_url);
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = () => {
    const employeeCode = `EMP-${Date.now().toString(36).toUpperCase()}`;
    createMutation.mutate({
      ...formData,
      organisation_id: orgId,
      employee_code: employeeCode,
      full_name: `${formData.first_name} ${formData.last_name}`,
      status: "active",
      base_salary: parseFloat(formData.base_salary) || 0,
    });
  };

  const FieldError = ({ error }) => error ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {error}
    </p>
  ) : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${step >= s.id 
                    ? 'bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'}
                `}>
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 font-medium hidden sm:block ${step >= s.id ? 'text-[#1EB053]' : 'text-gray-400'}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > s.id ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-500 mt-1">Let's start with the basics</p>
                  </div>

                  {/* Photo Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                        <AvatarImage src={photoPreview || formData.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-2xl">
                          {formData.first_name?.[0]}{formData.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 w-9 h-9 bg-[#0072C6] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#005a9e] transition-colors shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-medium">First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        placeholder="Enter first name"
                        className={`mt-1.5 h-12 ${errors.first_name ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.first_name} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        placeholder="Enter last name"
                        className={`mt-1.5 h-12 ${errors.last_name ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.last_name} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Employment */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Employment Details</h2>
                    <p className="text-gray-500 mt-1">Job role and compensation</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-medium">Department *</Label>
                      <Select value={formData.department} onValueChange={(v) => updateField('department', v)}>
                        <SelectTrigger className={`mt-1.5 h-12 ${errors.department ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FieldError error={errors.department} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Position *</Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => updateField('position', e.target.value)}
                        placeholder="e.g. Sales Manager"
                        className={`mt-1.5 h-12 ${errors.position ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.position} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Role *</Label>
                      <Select value={formData.role} onValueChange={(v) => updateField('role', v)}>
                        <SelectTrigger className="mt-1.5 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Hire Date *</Label>
                      <Input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => updateField('hire_date', e.target.value)}
                        className={`mt-1.5 h-12 ${errors.hire_date ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.hire_date} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Salary Type</Label>
                      <Select value={formData.salary_type} onValueChange={(v) => updateField('salary_type', v)}>
                        <SelectTrigger className="mt-1.5 h-12">
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
                      <Label className="text-gray-700 font-medium">Base Salary (Le)</Label>
                      <Input
                        type="number"
                        value={formData.base_salary}
                        onChange={(e) => updateField('base_salary', e.target.value)}
                        placeholder="Enter salary amount"
                        className="mt-1.5 h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                    <p className="text-gray-500 mt-1">How to reach this employee</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-700 font-medium">Phone Number *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+232 XX XXX XXXX"
                        className={`mt-1.5 h-12 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.phone} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="employee@example.com"
                        className={`mt-1.5 h-12 ${errors.email ? 'border-red-500' : ''}`}
                      />
                      <FieldError error={errors.email} />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Address</Label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Street, City, Sierra Leone"
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Emergency */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
                    <p className="text-gray-500 mt-1">Who to contact in case of emergency</p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-amber-800 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      This information will be kept confidential and only used in emergencies
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-700 font-medium">Emergency Contact Name</Label>
                      <Input
                        value={formData.emergency_contact}
                        onChange={(e) => updateField('emergency_contact', e.target.value)}
                        placeholder="Full name of contact person"
                        className="mt-1.5 h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Emergency Contact Phone</Label>
                      <Input
                        value={formData.emergency_phone}
                        onChange={(e) => updateField('emergency_phone', e.target.value)}
                        placeholder="+232 XX XXX XXXX"
                        className="mt-1.5 h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
                    <p className="text-gray-500 mt-1">Please verify all information is correct</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl mb-6">
                    <Avatar className="w-16 h-16 border-2 border-white shadow">
                      <AvatarImage src={photoPreview || formData.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                        {formData.first_name?.[0]}{formData.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{formData.first_name} {formData.last_name}</h3>
                      <p className="text-gray-600">{formData.position} • {formData.department}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Role", value: ROLES.find(r => r.value === formData.role)?.label },
                      { label: "Hire Date", value: formData.hire_date },
                      { label: "Salary", value: formData.base_salary ? `Le ${parseInt(formData.base_salary).toLocaleString()} (${formData.salary_type})` : 'Not set' },
                      { label: "Phone", value: formData.phone },
                      { label: "Email", value: formData.email || 'Not provided' },
                      { label: "Emergency", value: formData.emergency_contact || 'Not provided' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                        <p className="font-medium text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : prevStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 5 ? (
              <Button onClick={nextStep} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 gap-2 min-w-[140px]"
              >
                {createMutation.isPending ? "Saving..." : "Add Employee"}
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}