import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Palette,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
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
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Contact', icon: Phone },
  { id: 4, title: 'Branding', icon: Palette },
];

const SUBSCRIPTION_TYPES = [
  { value: 'free', label: 'Free', description: 'Basic features for small teams' },
  { value: 'basic', label: 'Basic', description: 'Essential features for growing businesses' },
  { value: 'professional', label: 'Professional', description: 'Advanced features for professionals' },
  { value: 'enterprise', label: 'Enterprise', description: 'Full features for large organizations' },
];

export default function OrganisationSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    country: 'Sierra Leone',
    phone: '',
    email: '',
    owner_name: '',
    subscription_type: 'free',
    primary_color: '#1EB053',
    secondary_color: '#0072C6',
    logo_url: '',
    timezone: 'Africa/Freetown',
    currency: 'SLE',
    status: 'active'
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createOrgMutation = useMutation({
    mutationFn: async (data) => {
      // Create organisation
      const org = await base44.entities.Organisation.create(data);
      
      // Create employee record for the creator as org_admin
      await base44.entities.Employee.create({
        organisation_id: org.id,
        employee_code: 'EMP001',
        user_email: user?.email,
        first_name: user?.full_name?.split(' ')[0] || 'Admin',
        last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: user?.full_name || 'Organisation Admin',
        role: 'org_admin',
        email: user?.email,
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0]
      });

      return org;
    },
    onSuccess: () => {
      toast({ 
        title: "Organisation Created!", 
        description: "Your organisation has been set up successfully." 
      });
      navigate(createPageUrl('Dashboard'));
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create organisation",
        variant: "destructive"
      });
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate code from name
    if (field === 'name' && !formData.code) {
      const code = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, code }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast({ 
        title: "Missing Information", 
        description: "Please provide organisation name and code",
        variant: "destructive"
      });
      return;
    }
    createOrgMutation.mutate(formData);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('logo_url', file_url);
      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
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
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  currentStep === step.id 
                    ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' 
                    : currentStep > step.id 
                      ? 'bg-[#1EB053]/20 text-[#1EB053]' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-1 ${
                  currentStep > step.id ? 'bg-[#1EB053]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5 text-[#1EB053]" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your organisation's basic information"}
              {currentStep === 2 && "Where is your organisation located?"}
              {currentStep === 3 && "How can people reach your organisation?"}
              {currentStep === 4 && "Customize your organisation's appearance"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Organisation Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., BFSE Water Company"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Organisation Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., BFSE"
                    maxLength={10}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for your organisation</p>
                </div>
                <div>
                  <Label>Owner/Manager Name</Label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    placeholder="Full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subscription Plan</Label>
                  <Select 
                    value={formData.subscription_type} 
                    onValueChange={(v) => handleChange('subscription_type', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <span className="font-medium">{type.label}</span>
                            <span className="text-gray-500 text-xs ml-2">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Street Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter street address"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="e.g., Freetown"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Sierra Leone"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(v) => handleChange('timezone', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Freetown">Africa/Freetown (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                      <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+232 XX XXX XXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@company.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(v) => handleChange('currency', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SLE">SLE - Sierra Leonean Leone</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Branding */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Organisation Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.logo_url ? (
                      <img 
                        src={formData.logo_url} 
                        alt="Logo" 
                        className="w-20 h-20 rounded-xl object-cover border"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center border-2 border-dashed">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label>Preview</Label>
                  <div 
                    className="mt-2 p-4 rounded-xl flex items-center gap-3"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.primary_color}20 0%, ${formData.secondary_color}20 100%)`,
                      borderLeft: `4px solid ${formData.primary_color}`
                    }}
                  >
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` }}
                      >
                        {formData.name?.charAt(0) || 'O'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{formData.name || 'Organisation Name'}</p>
                      <p className="text-sm text-gray-500">{formData.city || 'City'}, {formData.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} className="sl-gradient">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  className="sl-gradient"
                  disabled={createOrgMutation.isPending}
                >
                  {createOrgMutation.isPending ? (
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