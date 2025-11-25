import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus, Receipt, Calendar, Award, ShoppingCart, X, Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PageHeader from "@/components/ui/PageHeader";
import EmployeeOnboardingForm from "@/components/forms/EmployeeOnboardingForm";
import ExpenseClaimForm from "@/components/forms/ExpenseClaimForm";
import LeaveApplicationForm from "@/components/forms/LeaveApplicationForm";
import PerformanceReviewForm from "@/components/forms/PerformanceReviewForm";
import CustomerOrderForm from "@/components/forms/CustomerOrderForm";

const FORM_TYPES = [
  {
    id: "employee",
    title: "Employee Onboarding",
    description: "Add new team members with a complete profile",
    icon: UserPlus,
    color: "from-[#1EB053] to-emerald-600",
    bgColor: "bg-[#1EB053]/10",
  },
  {
    id: "expense",
    title: "Expense Claim",
    description: "Submit expenses for reimbursement",
    icon: Receipt,
    color: "from-[#0072C6] to-blue-600",
    bgColor: "bg-[#0072C6]/10",
  },
  {
    id: "leave",
    title: "Leave Application",
    description: "Request time off from work",
    icon: Calendar,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "performance",
    title: "Performance Review",
    description: "Evaluate employee performance",
    icon: Award,
    color: "from-[#D4AF37] to-amber-600",
    bgColor: "bg-[#D4AF37]/10",
  },
  {
    id: "order",
    title: "Customer Order",
    description: "Create a new customer order",
    icon: ShoppingCart,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
  },
];

export default function Forms() {
  const [activeForm, setActiveForm] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const handleFormSuccess = () => {
    setActiveForm(null);
  };

  const renderForm = () => {
    switch (activeForm) {
      case "employee":
        return <EmployeeOnboardingForm orgId={orgId} onSuccess={handleFormSuccess} onClose={() => setActiveForm(null)} />;
      case "expense":
        return <ExpenseClaimForm orgId={orgId} currentEmployee={currentEmployee} onSuccess={handleFormSuccess} onClose={() => setActiveForm(null)} />;
      case "leave":
        return <LeaveApplicationForm orgId={orgId} currentEmployee={currentEmployee} onSuccess={handleFormSuccess} onClose={() => setActiveForm(null)} />;
      case "performance":
        return <PerformanceReviewForm orgId={orgId} employees={employees} currentEmployee={currentEmployee} onSuccess={handleFormSuccess} onClose={() => setActiveForm(null)} />;
      case "order":
        return <CustomerOrderForm orgId={orgId} products={products} currentEmployee={currentEmployee} onSuccess={handleFormSuccess} onClose={() => setActiveForm(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms"
        subtitle="Beautiful forms for your business operations"
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1EB053]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0072C6]/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Premium Form Collection</h2>
            <p className="text-white/70 mt-1">5-star quality forms with multi-step wizards, validation, and beautiful design</p>
          </div>
        </div>

        {/* Flag Stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FORM_TYPES.map((form) => (
          <Card
            key={form.id}
            className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            onClick={() => setActiveForm(form.id)}
          >
            <div className={`h-2 bg-gradient-to-r ${form.color}`} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${form.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <form.icon className={`w-7 h-7 bg-gradient-to-r ${form.color} bg-clip-text`} style={{ color: form.color.includes('1EB053') ? '#1EB053' : form.color.includes('0072C6') ? '#0072C6' : form.color.includes('D4AF37') ? '#D4AF37' : form.color.includes('purple') ? '#8b5cf6' : '#ec4899' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1EB053] transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{form.description}</p>
                </div>
              </div>
              
              <Button 
                className={`w-full mt-6 bg-gradient-to-r ${form.color} hover:opacity-90 text-white`}
              >
                Open Form
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={!!activeForm} onOpenChange={(open) => !open && setActiveForm(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white"
            onClick={() => setActiveForm(null)}
          >
            <X className="w-4 h-4" />
          </Button>
          {renderForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}