import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Save,
  UserPlus,
  MoreVertical,
  UserMinus,
  Globe,
  Palette,
  Shield,
  Camera,
  Clock,
  CheckCircle2,
  Crown,
  Edit3,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OrganisationManage() {
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('read_only');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [invitePosition, setInvitePosition] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isInviting, setIsInviting] = useState(false);

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
  const isAdmin = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  const { data: organisation, isLoading } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organisation.filter({ id: orgId });
      return orgs[0];
    },
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['orgEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (organisation && !formData) {
      setFormData({
        name: organisation.name || '',
        code: organisation.code || '',
        address: organisation.address || '',
        city: organisation.city || '',
        country: organisation.country || 'Sierra Leone',
        phone: organisation.phone || '',
        email: organisation.email || '',
        owner_name: organisation.owner_name || '',
        primary_color: organisation.primary_color || '#1EB053',
        secondary_color: organisation.secondary_color || '#0072C6',
        logo_url: organisation.logo_url || '',
      });
    }
  }, [organisation, formData]);

  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organisation.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation'] });
      toast.success("Organisation updated successfully");
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleSave = () => {
    updateOrgMutation.mutate(formData);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteFirstName) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsInviting(true);
    try {
      // Create employee record for invited user
      const employeeCode = `EMP${String(employees.length + 1).padStart(3, '0')}`;
      const fullName = `${inviteFirstName} ${inviteLastName}`.trim();
      
      await base44.entities.Employee.create({
        organisation_id: orgId,
        employee_code: employeeCode,
        user_email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
        full_name: fullName,
        role: inviteRole,
        email: inviteEmail,
        department: inviteDepartment,
        position: invitePosition,
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
      });

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `You've been invited to ${organisation?.name}`,
        body: `
          <h2>Welcome to ${organisation?.name}!</h2>
          <p>Hi ${inviteFirstName},</p>
          <p>You've been invited to join ${organisation?.name} on BFSE Management System.</p>
          <p><strong>Role:</strong> ${inviteRole.replace(/_/g, ' ')}</p>
          ${inviteDepartment ? `<p><strong>Department:</strong> ${inviteDepartment}</p>` : ''}
          ${invitePosition ? `<p><strong>Position:</strong> ${invitePosition}</p>` : ''}
          <p>Please log in to access the system.</p>
        `
      });

      toast.success("Member added successfully", { description: `Invitation sent to ${inviteEmail}` });
      setShowInviteDialog(false);
      resetInviteForm();
      queryClient.invalidateQueries({ queryKey: ['orgEmployees'] });
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setIsInviting(false);
    }
  };

  const resetInviteForm = () => {
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setInviteRole('read_only');
    setInviteDepartment('');
    setInvitePosition('');
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await base44.entities.Employee.delete(memberToRemove.id);
      toast.success("Member removed", { description: `${memberToRemove.full_name} has been removed from the organisation` });
      queryClient.invalidateQueries({ queryKey: ['orgEmployees'] });
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setMemberToRemove(null);
    }
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const adminCount = employees.filter(e => ['super_admin', 'org_admin'].includes(e.role)).length;

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C] p-6 md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#1EB053] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#0072C6] rounded-full blur-3xl" />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Logo */}
          <div className="relative group">
            {formData.logo_url ? (
              <img 
                src={formData.logo_url} 
                alt={formData.name} 
                className="w-24 h-24 md:w-28 md:h-28 object-contain bg-white rounded-2xl p-2 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-dashed border-white/30">
                <Building2 className="w-12 h-12 text-white/50" />
              </div>
            )}
            {isAdmin && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{formData.name}</h1>
              <Badge className="bg-[#1EB053]/20 text-[#1EB053] border-[#1EB053]/30">
                {organisation?.subscription_type || 'Free'}
              </Badge>
            </div>
            <p className="text-white/70 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" />
              {formData.city ? `${formData.city}, ${formData.country}` : formData.country || 'Sierra Leone'}
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1EB053]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{employees.length}</p>
                  <p className="text-white/50 text-xs">Team Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#0072C6]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{activeCount}</p>
                  <p className="text-white/50 text-xs">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{adminCount}</p>
                  <p className="text-white/50 text-xs">Admins</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Code Badge */}
          <div className="absolute top-4 right-4 md:static">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <p className="text-white/50 text-xs mb-1">Organisation Code</p>
              <p className="text-white font-mono font-bold text-lg">{formData.code}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 bg-gray-100 rounded-xl">
          <TabsTrigger value="general" className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0F1F3C]">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0F1F3C]">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0F1F3C]">
            <Users className="w-4 h-4" />
            Members ({employees.length})
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organisation Details</CardTitle>
              <CardDescription>Basic information about your organisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Organisation Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Organisation Code</Label>
                  <Input
                    value={formData.code}
                    disabled
                    className="mt-1 font-mono bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Owner/Manager</Label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>

              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isAdmin}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
              </div>

              {isAdmin && (
                <Button onClick={handleSave} disabled={updateOrgMutation.isPending} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                  {updateOrgMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your organisation's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-20 h-20 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center border-2 border-dashed">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-[200px]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      disabled={!isAdmin}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      disabled={!isAdmin}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      disabled={!isAdmin}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      disabled={!isAdmin}
                      className="font-mono"
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
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{formData.name}</h3>
                      <p className="text-sm opacity-80">{formData.city}, {formData.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Button onClick={handleSave} disabled={updateOrgMutation.isPending} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                  {updateOrgMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>{employees.length} members in this organisation</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowInviteDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employees.map((emp) => {
                  const isCurrentUser = emp.user_email === user?.email;
                  return (
                    <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                            {emp.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {emp.full_name}
                            {isCurrentUser && <span className="text-xs text-gray-500 ml-2">(You)</span>}
                          </p>
                          <p className="text-sm text-gray-500">{emp.email}</p>
                          {emp.department && <p className="text-xs text-gray-400">{emp.department} • {emp.position}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{emp.role?.replace(/_/g, ' ')}</Badge>
                        <Badge variant={emp.status === 'active' ? 'outline' : 'destructive'}>
                          {emp.status}
                        </Badge>
                        {isAdmin && !isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setMemberToRemove(emp)}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => { setShowInviteDialog(open); if (!open) resetInviteForm(); }}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new member to your organisation. They will receive an email invitation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="John"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="Doe"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Input
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="e.g. Sales"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={invitePosition}
                  onChange={(e) => setInvitePosition(e.target.value)}
                  placeholder="e.g. Manager"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read_only">Read Only</SelectItem>
                  <SelectItem value="support_staff">Support Staff</SelectItem>
                  <SelectItem value="retail_cashier">Retail Cashier</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="vehicle_sales">Vehicle Sales</SelectItem>
                  <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="payroll_admin">Payroll Admin</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                  <SelectItem value="org_admin">Organisation Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button 
              onClick={handleInvite} 
              disabled={isInviting || !inviteEmail || !inviteFirstName}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto"
            >
              {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.full_name}</strong> from the organisation? 
              This action cannot be undone and they will lose access to all organisation data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}