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
import { Loader2, User, Mail, Phone, Building2, Briefcase, Send, AlertCircle, Package } from "lucide-react";
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

  // Fetch remuneration packages
  const { data: packages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Find packages applicable to selected role
  const applicablePackages = packages.filter(pkg => 
    !pkg.applicable_roles?.length || pkg.applicable_roles.includes(formData.role)
  );

  // Auto-apply package when selected
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
      });
      return { employee, email: data.email, firstName: data.first_name, role: data.role, position: data.position };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Send welcome email if enabled and email is provided
      if (sendWelcomeEmail && result.email && organisation) {
        setIsSendingEmail(true);
        try {
          const roleLabel = roles.find(r => r.value === result.role)?.label || result.role;
          // Use custom domain for login URL
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
    onError: () => {
      toast.error("Failed to add employee");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#1EB053]" />
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">First Name *</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Name *</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+232 76 123456"
              />
            </div>
          </div>

          {/* Work Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Department
              </Label>
              <Select 
                value={formData.department} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}
              >
                <SelectTrigger>
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
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Position
              </Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="e.g. Senior Accountant"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">System Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger>
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
              <Label className="text-xs text-gray-500">Hire Date</Label>
              <Input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Remuneration Package */}
          {applicablePackages.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-xs text-green-700 flex items-center gap-1 mb-2">
                <Package className="w-3 h-3" /> Remuneration Package
              </Label>
              <Select 
                value={formData.remuneration_package_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, remuneration_package_id: v }))}
              >
                <SelectTrigger>
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
                <p className="text-xs text-green-600 mt-2">
                  Package will auto-fill salary and benefits
                </p>
              )}
            </div>
          )}

          {/* Salary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Salary Type</Label>
              <Select 
                value={formData.salary_type} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, salary_type: v }))}
              >
                <SelectTrigger>
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
              <Label className="text-xs text-gray-500">Base Salary (SLE)</Label>
              <Input
                type="number"
                value={formData.base_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Welcome Email Option */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Checkbox
              id="sendWelcomeEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={setSendWelcomeEmail}
              disabled={!formData.email}
              className="mt-0.5"
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

          {/* Dashboard Invite Reminder */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              <strong>Important:</strong> To allow this employee to log in, you must also invite them via the Base44 dashboard using the same email address.
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto"
              disabled={createEmployeeMutation.isPending || isSendingEmail}
            >
              {(createEmployeeMutation.isPending || isSendingEmail) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSendingEmail ? 'Sending Email...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}