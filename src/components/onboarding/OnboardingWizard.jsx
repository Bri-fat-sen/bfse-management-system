import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Building2, Users, Package, Truck, CheckCircle2,
  ArrowRight, ArrowLeft, Sparkles
} from "lucide-react";

const steps = [
  {
    id: "welcome",
    title: "Welcome to BFSE Management",
    description: "Let's get your business set up in just a few minutes",
    icon: Sparkles
  },
  {
    id: "organisation",
    title: "Organisation Details",
    description: "Tell us about your business",
    icon: Building2
  },
  {
    id: "departments",
    title: "Set Up Departments",
    description: "Select the departments in your organisation",
    icon: Users
  },
  {
    id: "modules",
    title: "Choose Your Modules",
    description: "Select which features you'll use",
    icon: Package
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your workspace is ready to use",
    icon: CheckCircle2
  }
];

const defaultDepartments = [
  "Administration",
  "Sales",
  "Operations",
  "Finance",
  "Human Resources",
  "Logistics",
  "Warehouse",
  "Transport"
];

const availableModules = [
  { id: "sales", name: "Sales & POS", description: "Process sales and manage customers", icon: "💰" },
  { id: "inventory", name: "Inventory", description: "Track products and stock levels", icon: "📦" },
  { id: "hr", name: "HR & Payroll", description: "Manage employees and salaries", icon: "👥" },
  { id: "transport", name: "Transport", description: "Track vehicles and trips", icon: "🚛" },
  { id: "finance", name: "Finance", description: "Monitor expenses and revenue", icon: "💳" },
];

export default function OnboardingWizard({ isOpen, onClose, user, orgId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [orgData, setOrgData] = useState({
    name: "",
    address: "",
    city: "Freetown",
    phone: "",
  });
  const [selectedDepts, setSelectedDepts] = useState(["Administration", "Sales", "Finance"]);
  const [selectedModules, setSelectedModules] = useState(["sales", "inventory", "hr"]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const createOrgMutation = useMutation({
    mutationFn: async () => {
      const org = await base44.entities.Organisation.create({
        ...orgData,
        code: orgData.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20),
        country: "Sierra Leone",
        owner_name: user?.full_name,
        email: user?.email,
        status: "active",
        subscription_type: "free"
      });
      
      // Create employee record for the owner
      await base44.entities.Employee.create({
        organisation_id: org.id,
        employee_code: "EMP001",
        user_email: user?.email,
        first_name: user?.full_name?.split(' ')[0] || 'Admin',
        last_name: user?.full_name?.split(' ').slice(1).join(' ') || 'User',
        full_name: user?.full_name,
        role: "org_admin",
        department: "Administration",
        position: "Organisation Admin",
        status: "active",
        email: user?.email
      });

      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Organisation Created!",
        description: "Your workspace is ready to use",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleNext = async () => {
    if (currentStep === steps.length - 2) {
      // Create organisation
      await createOrgMutation.mutateAsync();
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    onClose();
    window.location.reload();
  };

  const toggleDepartment = (dept) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full sl-gradient flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BFSE Management</h2>
            <p className="text-gray-500 mb-6">
              The complete business management solution for Sierra Leone enterprises
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-8 h-1 bg-[#1EB053] rounded-full" />
              <div className="w-8 h-1 bg-white border rounded-full" />
              <div className="w-8 h-1 bg-[#0072C6] rounded-full" />
            </div>
            <p className="text-sm text-gray-400 mt-4">🇸🇱 Proudly built for Sierra Leone</p>
          </div>
        );

      case "organisation":
        return (
          <div className="space-y-4">
            <div>
              <Label>Organisation Name *</Label>
              <Input
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="e.g., BRI-FAT-SEN Enterprise"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={orgData.address}
                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={orgData.city}
                  onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={orgData.phone}
                  onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                  placeholder="+232 XX XXX XXXX"
                />
              </div>
            </div>
          </div>
        );

      case "departments":
        return (
          <div className="grid grid-cols-2 gap-3">
            {defaultDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => toggleDepartment(dept)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedDepts.includes(dept)
                    ? 'border-[#1EB053] bg-green-50 text-[#1EB053]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedDepts.includes(dept) ? 'border-[#1EB053] bg-[#1EB053]' : 'border-gray-300'
                  }`}>
                    {selectedDepts.includes(dept) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{dept}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case "modules":
        return (
          <div className="space-y-3">
            {availableModules.map((module) => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedModules.includes(module.id)
                    ? 'border-[#1EB053] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{module.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedModules.includes(module.id) ? 'border-[#1EB053] bg-[#1EB053]' : 'border-gray-300'
                  }`}>
                    {selectedModules.includes(module.id) && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "complete":
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#1EB053]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
            <p className="text-gray-500 mb-6">
              Your organisation has been created successfully. Start managing your business now!
            </p>
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-4">
              <p className="font-medium mb-2">What's next?</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Add your employees to the system</li>
                <li>✓ Set up your products and inventory</li>
                <li>✓ Start processing sales</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="sl-gradient p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">{steps[currentStep].title}</h3>
              <p className="text-sm text-white/80">{steps[currentStep].description}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-xs text-white/60 mt-2">Step {currentStep + 1} of {steps.length}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} className="sl-gradient">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="sl-gradient"
              disabled={currentStep === 1 && !orgData.name}
            >
              {currentStep === steps.length - 2 ? 'Create Organisation' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}