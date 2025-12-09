import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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

export default function AddEmployeeDialog({ open, onOpenChange, editingEmployee, orgId, organisation, onSuccess }) {
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
    hourly_rate: '',
    hire_date: new Date().toISOString().split('T')[0],
    remuneration_package_id: '',
    status: 'active',
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        first_name: editingEmployee.first_name || '',
        last_name: editingEmployee.last_name || '',
        email: editingEmployee.email || '',
        phone: editingEmployee.phone || '',
        department: editingEmployee.department || '',
        position: editingEmployee.position || '',
        role: editingEmployee.role || 'support_staff',
        salary_type: editingEmployee.salary_type || 'monthly',
        base_salary: editingEmployee.base_salary || '',
        hourly_rate: editingEmployee.hourly_rate || '',
        hire_date: editingEmployee.hire_date || new Date().toISOString().split('T')[0],
        remuneration_package_id: editingEmployee.remuneration_package_id || '',
        status: editingEmployee.status || 'active',
      });
      setShowAdvanced(true);
    } else {
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
        hourly_rate: '',
        hire_date: new Date().toISOString().split('T')[0],
        remuneration_package_id: '',
        status: 'active',
      });
    }
  }, [editingEmployee, open]);
  
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
          hourly_rate: pkg.hourly_rate || prev.hourly_rate,
          salary_type: pkg.salary_type || prev.salary_type,
        }));
      }
    }
  }, [formData.remuneration_package_id, packages]);

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId && !editingEmployee,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data) => {
      if (editingEmployee) {
        // Update existing employee
        const selectedPackage = packages.find(p => p.id === data.remuneration_package_id);
        await base44.entities.Employee.update(editingEmployee.id, {
          ...data,
          full_name: `${data.first_name} ${data.last_name}`,
          base_salary: parseFloat(data.base_salary) || 0,
          hourly_rate: parseFloat(data.hourly_rate) || 0,
          remuneration_package_id: data.remuneration_package_id || null,
          remuneration_package_name: selectedPackage?.name || null,
          email: data.email || null,
        });
        return { employee: editingEmployee, isUpdate: true };
      } else {
        // Create new employee
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
        
        const employeeCode = `EMP${String(allEmployees.length + 1).padStart(4, '0')}`;
        const selectedPackage = packages.find(p => p.id === data.remuneration_package_id);
        const employee = await base44.entities.Employee.create({
          ...data,
          organisation_id: orgId,
          employee_code: employeeCode,
          full_name: `${data.first_name} ${data.last_name}`,
          status: data.status || 'active',
          base_salary: parseFloat(data.base_salary) || 0,
          hourly_rate: parseFloat(data.hourly_rate) || 0,
          remuneration_package_id: data.remuneration_package_id || null,
          remuneration_package_name: selectedPackage?.name || null,
          email: data.email || null,
        });
        return { employee, email: data.email, firstName: data.first_name, role: data.role, position: data.position };
      }
    },
    onSuccess: async (result) => {
      if (onSuccess) onSuccess();
      
      if (result.isUpdate) {
        toast.success("Employee updated successfully");
        onOpenChange(false);
        return;
      }
      
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
          
          try {
            await base44.functions.invoke('sendEmailMailersend', {
              to: result.email,
              toName: result.firstName,
              subject: `Welcome to ${organisation.name}! 🇸🇱`,
              htmlContent: htmlContent,
              fromName: organisation.name,
            });
            toast.success("Employee added & welcome email sent!");
          } catch (err) {
            toast.success("Employee added (email queued)");
          }
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{editingEmployee ? 'Edit' : 'Add'} Employee</h2>
                <p className="text-white/80 text-xs">{editingEmployee ? 'Update employee details' : 'Press Ctrl+Enter to save'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">First Name *</Label>
                <Input value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} placeholder="John" required autoFocus className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Last Name *</Label>
                <Input value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} placeholder="Doe" required className="mt-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger className="mt-1.5">
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
                <Label className="text-sm">Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Email (optional)</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" className="mt-1.5" />
              {formData.email && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <Checkbox id="sendWelcomeEmail" checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} className="mt-0.5" />
                  <label htmlFor="sendWelcomeEmail" className="text-xs text-blue-700 cursor-pointer">Send welcome email</label>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+232 76 123456" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Position</Label>
                    <Input value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} placeholder="Job title" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Hire Date</Label>
                    <Input type="date" value={formData.hire_date} onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Base Salary</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Le</span>
                      <Input type="number" value={formData.base_salary} onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))} placeholder="0" className="pl-7" />
                    </div>
                  </div>
                </div>

                {applicablePackages.length > 0 && (
                  <div>
                    <Label className="text-sm">Remuneration Package</Label>
                    <Select value={formData.remuneration_package_id} onValueChange={(v) => setFormData(prev => ({ ...prev, remuneration_package_id: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        {applicablePackages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} (Le {pkg.base_salary?.toLocaleString()})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!editingEmployee && (
                  <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800">
                      To enable login, invite via Base44 dashboard using same email
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={createEmployeeMutation.isPending || isSendingEmail} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {(createEmployeeMutation.isPending || isSendingEmail) ? (isSendingEmail ? 'Sending...' : 'Saving...') : <><Check className="w-4 h-4 mr-2" />{editingEmployee ? 'Update' : 'Add'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}