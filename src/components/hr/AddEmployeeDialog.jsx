import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, User, Mail, Phone, Building2, Briefcase, Send, AlertCircle, 
  Package, X, Check, DollarSign, Calendar, Shield
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { generateInviteEmailHTML } from "@/components/email/InviteEmailTemplate";

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Organisation Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "retail_cashier", label: "Retail Cashier" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "driver", label: "Driver" },
  { value: "accountant", label: "Accountant" },
  { value: "support_staff", label: "Support Staff" },
  { value: "read_only", label: "Read Only" },
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support", "HR", "IT"];

export default function AddEmployeeDialog({ open, onOpenChange, orgId, employeeCount, organisation, inviterName }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'support_staff',
    salary_type: 'monthly',
    base_salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    remuneration_package_id: '',
  });
  
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const { data: packages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const applicablePackages = packages.filter(pkg => 
    !pkg.applicable_roles?.length || pkg.applicable_roles.includes(formData.role)
  );

  useEffect(() => {
    if (formData.remuneration_package_id) {
      const pkg = packages.find(p => p.id === formData.remuneration_package_id);
      if (pkg) {
        setFormData(prev => ({
          ...prev,
          base_salary: pkg.base_salary || prev.base_salary,
          salary_type: pkg.salary_type || prev.salary_type,
        }));
      }
    }
  }, [formData.remuneration_package_id, packages]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data) => {
      if (data.email) {
        const existingByEmail = await base44.entities.Employee.filter({ 
          organisation_id: orgId, 
          email: data.email 
        });
        if (existingByEmail.length > 0) {
          throw new Error('An employee with this email already exists');
        }
        
        const existingByUserEmail = await base44.entities.Employee.filter({ 
          organisation_id: orgId, 
          user_email: data.email 
        });
        if (existingByUserEmail.length > 0) {
          throw new Error('An employee with this email already exists');
        }
      }
      
      const employeeCode = `EMP${String(employeeCount + 1).padStart(4, '0')}`;
      const selectedPackage = packages.find(p => p.id === data.remuneration_package_id);
      const employee = await base44.entities.Employee.create({
        ...data,
        organisation_id: orgId,
        employee_code: employeeCode,
        full_name: `${data.first_name} ${data.last_name}`,
        status: 'active',
        base_salary: parseFloat(data.base_salary) || 0,
        remuneration_package_id: data.remuneration_package_id || null,
        remuneration_package_name: selectedPackage?.name || null,
        email: data.email || null,
      });
      return { employee, email: data.email, firstName: data.first_name, role: data.role, position: data.position };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (sendWelcomeEmail && result.email && organisation) {
        setIsSendingEmail(true);
        try {
          const roleLabel = roles.find(r => r.value === result.role)?.label || result.role;
          const appDomain = "https://www.brifatsensystems.com";
          const htmlContent = generateInviteEmailHTML({
            recipientName: result.firstName,
            organisationName: organisation.name,
            organisationLogo: organisation.logo_url,
            role: roleLabel,
            position: result.position,
            inviterName: inviterName,
            loginUrl: appDomain,
          });
          
          await base44.functions.invoke('sendEmailMailersend', {
            to: result.email,
            toName: result.firstName,
            subject: `Welcome to ${organisation.name}! 🇸🇱`,
            htmlContent: htmlContent,
            fromName: organisation.name,
          });
          
          toast.success("Employee added & welcome email sent!");
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          toast.error("Employee added (email failed to send)");
        } finally {
          setIsSendingEmail(false);
        }
      } else {
        toast.success("Employee added successfully");
      }
      
      onOpenChange(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        role: 'support_staff',
        salary_type: 'monthly',
        base_salary: '',
        hire_date: new Date().toISOString().split('T')[0],
        remuneration_package_id: '',
      });
      setSendWelcomeEmail(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add employee");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast.error("Please fill in required fields");
      return;
    }
    createEmployeeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: primaryColor }} />
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            
            {/* Personal Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <User className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="John"
                      required
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Doe"
                      required
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+232 76 123456"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                </div>

                {/* Welcome Email Option */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0072C6]/10 to-[#1EB053]/10 border border-[#0072C6]/20">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="sendWelcomeEmail"
                      checked={sendWelcomeEmail}
                      onCheckedChange={setSendWelcomeEmail}
                      disabled={!formData.email}
                      className="mt-0.5 data-[state=checked]:bg-[#0072C6] data-[state=checked]:border-[#0072C6]"
                    />
                    <div className="flex-1">
                      <label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                        <Send className="w-4 h-4 text-[#0072C6]" />
                        Send branded welcome email
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.email 
                          ? "A Sierra Leone themed welcome email will be sent with login instructions"
                          : "Enter an email address to enable this option"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                  <Briefcase className="w-4 h-4" style={{ color: secondaryColor }} />
                </div>
                <h3 className="font-semibold text-gray-900">Work Information</h3>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Department
                    </Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Position</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g. Senior Accountant"
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Shield className="w-3 h-3" /> System Role *
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Hire Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                      className="mt-1.5 border-gray-200"
                    />
                  </div>
                </div>

                {/* Dashboard Invite Reminder */}
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-800">
                    <strong>Important:</strong> To allow this employee to log in, you must also invite them via the Base44 dashboard using the same email address.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Salary Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Salary & Compensation</h3>
              </div>

                {/* Remuneration Package */}
                {applicablePackages.length > 0 && (
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" /> Remuneration Package
                    </Label>
                    <Select 
                      value={formData.remuneration_package_id} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, remuneration_package_id: v }))}
                    >
                      <SelectTrigger className="border-[#1EB053]/30">
                        <SelectValue placeholder="Select a package (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>No package - Manual entry</SelectItem>
                        {applicablePackages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            <div className="flex items-center gap-2">
                              <span>{pkg.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                SLE {pkg.base_salary?.toLocaleString()}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.remuneration_package_id && (
                      <p className="text-xs text-[#1EB053] mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Package will auto-fill salary and benefits
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium">Salary Type</Label>
                    <Select 
                      value={formData.salary_type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, salary_type: v }))}
                    >
                      <SelectTrigger className="mt-2 border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                    <Label className="text-[#0072C6] font-medium">Base Salary (SLE)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0072C6] font-bold">Le</span>
                      <Input
                        type="number"
                        value={formData.base_salary}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
                        placeholder="0"
                        className="pl-10 border-[#0072C6]/30 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployeeMutation.isPending || isSendingEmail}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {(createEmployeeMutation.isPending || isSendingEmail) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSendingEmail ? 'Sending Email...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Add Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}