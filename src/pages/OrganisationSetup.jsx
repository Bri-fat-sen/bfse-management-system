import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Palette,
  Users,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useToast } from "@/components/ui/use-toast";

const STEPS = [
  { id: 'basics', title: 'Basic Info', icon: Building2, description: 'Organisation name and identity' },
  { id: 'location', title: 'Location', icon: MapPin, description: 'Address and contact details' },
  { id: 'branding', title: 'Branding', icon: Palette, description: 'Colors and appearance' },
  { id: 'admin', title: 'Admin Setup', icon: Users, description: 'Your admin account' },
];

const SUBSCRIPTION_TYPES = [
  { value: 'free', label: 'Free', description: 'Basic features for small teams' },
  { value: 'basic', label: 'Basic', description: 'Essential features for growing businesses' },
  { value: 'professional', label: 'Professional', description: 'Advanced features and analytics' },
  { value: 'enterprise', label: 'Enterprise', description: 'Custom solutions for large organizations' },
];

const COLOR_PRESETS = [
  { primary: '#1EB053', secondary: '#0072C6', name: 'Sierra Leone' },
  { primary: '#2563EB', secondary: '#7C3AED', name: 'Ocean' },
  { primary: '#059669', secondary: '#0891B2', name: 'Forest' },
  { primary: '#DC2626', secondary: '#EA580C', name: 'Sunset' },
  { primary: '#7C3AED', secondary: '#DB2777', name: 'Royal' },
];

export default function OrganisationSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    // Basics
    name: '',
    code: '',
    subscription_type: 'free',
    // Location
    address: '',
    city: '',
    country: 'Sierra Leone',
    phone: '',
    email: '',
    // Branding
    primary_color: '#1EB053',
    secondary_color: '#0072C6',
    logo_url: '',
    // Admin
    owner_name: '',
    timezone: 'Africa/Freetown',
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCode = (name) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase();
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let logoUrl = formData.logo_url;
      
      // Upload logo if selected
      if (logoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: logoFile });
        logoUrl = file_url;
      }

      // Create organisation
      const orgData = {
        ...formData,
        logo_url: logoUrl,
        code: formData.code || generateCode(formData.name),
        status: 'active',
      };

      const newOrg = await base44.entities.Organisation.create(orgData);

      // Create employee record for current user as admin
      await base44.entities.Employee.create({
        organisation_id: newOrg.id,
        employee_code: 'ADMIN001',
        user_email: user?.email,
        first_name: user?.full_name?.split(' ')[0] || 'Admin',
        last_name: user?.full_name?.split(' ').slice(1).join(' ') || 'User',
        full_name: user?.full_name || formData.owner_name,
        role: 'org_admin',
        department: 'Management',
        position: 'Administrator',
        email: user?.email,
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
      });

      // Update user's active organisation
      await base44.auth.updateMe({
        active_organisation_id: newOrg.id
      });

      toast({
        title: "Organisation Created!",
        description: `${formData.name} has been set up successfully.`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = createPageUrl("Dashboard");
      }, 1000);

    } catch (error) {
      console.error('Error creating organisation:', error);
      toast({
        title: "Error",
        description: "Failed to create organisation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.length >= 2;
      case 1: return formData.city && formData.country;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label>Organisation Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  updateField('name', e.target.value);
                  if (!formData.code) {
                    updateField('code', generateCode(e.target.value));
                  }
                }}
                placeholder="e.g., BFSE Trading Company"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Organisation Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                placeholder="Auto-generated"
                className="mt-1 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for login</p>
            </div>

            <div>
              <Label>Subscription Plan</Label>
              <Select
                value={formData.subscription_type}
                onValueChange={(v) => updateField('subscription_type', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span className="font-medium">{type.label}</span>
                        <span className="text-gray-500 ml-2 text-sm">- {type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Street Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter street address"
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g., Freetown"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Sierra Leone"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+232 XX XXX XXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="info@company.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => updateField('timezone', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Freetown">Africa/Freetown (GMT)</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Organisation Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG or JPG, max 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      updateField('primary_color', preset.primary);
                      updateField('secondary_color', preset.secondary);
                    }}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      formData.primary_color === preset.primary
                        ? 'border-gray-900 shadow-lg'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <p className="text-xs text-center mt-1">{preset.name}</p>
                    {formData.primary_color === preset.primary && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1EB053] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => updateField('primary_color', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => updateField('primary_color', e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => updateField('secondary_color', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => updateField('secondary_color', e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label>Preview</Label>
              <div 
                className="mt-2 p-4 rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)` }}
              >
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{formData.name || 'Your Organisation'}</h3>
                    <p className="text-sm opacity-80">{formData.city || 'City'}, {formData.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Almost Done!
              </h3>
              <p className="text-green-700 text-sm mt-1">
                You'll be set up as the administrator for this organisation.
              </p>
            </div>

            <div>
              <Label>Owner / Admin Name</Label>
              <Input
                value={formData.owner_name || user?.full_name || ''}
                onChange={(e) => updateField('owner_name', e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700">Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Organisation:</span>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Code:</span>
                  <p className="font-medium font-mono">{formData.code}</p>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-medium">{formData.city}, {formData.country}</p>
                </div>
                <div>
                  <span className="text-gray-500">Plan:</span>
                  <p className="font-medium capitalize">{formData.subscription_type}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex flex-col shadow-lg">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Organisation</h1>
          <p className="text-gray-500 mt-2">Set up your business on BFSE Management System</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${index < STEPS.length - 1 ? 'relative' : ''}`}
            >
              <div className="flex flex-col items-center min-w-[60px]">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    index < currentStep
                      ? 'bg-[#1EB053] text-white'
                      : index === currentStep
                      ? 'bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    index < currentStep ? 'bg-[#1EB053]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep].icon, { className: "w-5 h-5 text-[#1EB053]" })}
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Organisation
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}