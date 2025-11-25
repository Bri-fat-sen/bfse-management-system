import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Phone, Shield, Camera, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper, FormWrapperContent } from "./FormWrapper";
import { FormInput, FormTextarea, FormSelect, FormSection } from "./FormField";
import { FormStepper, FormStepperNavigation } from "./FormStepper";

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

  return (
    <div className="max-w-3xl mx-auto">
      <FormStepper steps={STEPS} currentStep={step} />
      
      <FormWrapper maxWidth="3xl">
        <FormWrapperContent className="p-8">
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
                <FormSection title="Personal Information" description="Let's start with the basics">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-4 ring-gray-50">
                        <AvatarImage src={photoPreview || formData.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-2xl">
                          {formData.first_name?.[0]}{formData.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-lg">
                        <Camera className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormInput
                      label="First Name"
                      icon={User}
                      required
                      value={formData.first_name}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      placeholder="Enter first name"
                      error={errors.first_name}
                    />
                    <FormInput
                      label="Last Name"
                      icon={User}
                      required
                      value={formData.last_name}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      placeholder="Enter last name"
                      error={errors.last_name}
                    />
                  </div>
                </FormSection>
              )}

              {/* Step 2: Employment */}
              {step === 2 && (
                <FormSection title="Employment Details" description="Job role and compensation">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormSelect
                      label="Department"
                      icon={Briefcase}
                      required
                      value={formData.department}
                      onValueChange={(v) => updateField('department', v)}
                      placeholder="Select department"
                      error={errors.department}
                      options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
                    />
                    <FormInput
                      label="Position"
                      icon={Briefcase}
                      required
                      value={formData.position}
                      onChange={(e) => updateField('position', e.target.value)}
                      placeholder="e.g. Sales Manager"
                      error={errors.position}
                    />
                    <FormSelect
                      label="System Role"
                      required
                      value={formData.role}
                      onValueChange={(v) => updateField('role', v)}
                      options={ROLES}
                    />
                    <FormInput
                      label="Hire Date"
                      required
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => updateField('hire_date', e.target.value)}
                      error={errors.hire_date}
                    />
                    <FormSelect
                      label="Salary Type"
                      value={formData.salary_type}
                      onValueChange={(v) => updateField('salary_type', v)}
                      options={[
                        { value: "monthly", label: "Monthly" },
                        { value: "hourly", label: "Hourly" },
                        { value: "daily", label: "Daily" }
                      ]}
                    />
                    <FormInput
                      label="Base Salary (Le)"
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => updateField('base_salary', e.target.value)}
                      placeholder="Enter salary amount"
                    />
                  </div>
                </FormSection>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <FormSection title="Contact Information" description="How to reach this employee">
                  <div className="space-y-5">
                    <FormInput
                      label="Phone Number"
                      icon={Phone}
                      required
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+232 XX XXX XXXX"
                      error={errors.phone}
                    />
                    <FormInput
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="employee@example.com"
                      error={errors.email}
                    />
                    <FormTextarea
                      label="Address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Street, City, Sierra Leone"
                    />
                  </div>
                </FormSection>
              )}

              {/* Step 4: Emergency */}
              {step === 4 && (
                <FormSection title="Emergency Contact" description="Who to contact in case of emergency">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-amber-800 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      This information will be kept confidential and only used in emergencies
                    </p>
                  </div>

                  <div className="space-y-5">
                    <FormInput
                      label="Emergency Contact Name"
                      icon={User}
                      value={formData.emergency_contact}
                      onChange={(e) => updateField('emergency_contact', e.target.value)}
                      placeholder="Full name of contact person"
                    />
                    <FormInput
                      label="Emergency Contact Phone"
                      icon={Phone}
                      value={formData.emergency_phone}
                      onChange={(e) => updateField('emergency_phone', e.target.value)}
                      placeholder="+232 XX XXX XXXX"
                    />
                  </div>
                </FormSection>
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

          <FormStepperNavigation
            currentStep={step}
            totalSteps={5}
            onPrevious={prevStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={createMutation.isPending}
            submitLabel="Add Employee"
          />
        </FormWrapperContent>
      </FormWrapper>
    </div>
  );
}