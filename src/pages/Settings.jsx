import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Upload
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organisation");
  const queryClient = useQueryClient();

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

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const currentOrg = organisation?.[0];

  const [orgSettings, setOrgSettings] = useState({
    name: currentOrg?.name || "",
    currency: currentOrg?.currency || "SLE",
    timezone: currentOrg?.timezone || "Africa/Freetown",
    phone: currentOrg?.phone || "",
    email: currentOrg?.email || "",
    address: currentOrg?.address || ""
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    low_stock_alerts: true,
    payroll_reminders: true,
    meeting_reminders: true,
    chat_notifications: true
  });

  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organisation.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation'] });
    },
  });

  React.useEffect(() => {
    if (currentOrg) {
      setOrgSettings({
        name: currentOrg.name || "",
        currency: currentOrg.currency || "SLE",
        timezone: currentOrg.timezone || "Africa/Freetown",
        phone: currentOrg.phone || "",
        email: currentOrg.email || "",
        address: currentOrg.address || ""
      });
    }
  }, [currentOrg]);

  const canEdit = currentEmployee?.role === 'super_admin' || currentEmployee?.role === 'org_admin';

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your organisation and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="organisation" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organisation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Organisation Details</CardTitle>
                <CardDescription>Update your organisation information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organisation Name</Label>
                  <Input 
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={orgSettings.currency} 
                      onValueChange={(v) => setOrgSettings({ ...orgSettings, currency: v })}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SLE">Sierra Leonean Leone (SLE)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select 
                      value={orgSettings.timezone}
                      onValueChange={(v) => setOrgSettings({ ...orgSettings, timezone: v })}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Freetown">Africa/Freetown (GMT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={orgSettings.phone}
                    onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={orgSettings.email}
                    onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input 
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
                {canEdit && (
                  <Button 
                    onClick={() => updateOrgMutation.mutate(orgSettings)}
                    disabled={updateOrgMutation.isPending}
                    className="sl-gradient"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateOrgMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Organisation Logo</CardTitle>
                <CardDescription>Upload your company logo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl">
                  {currentOrg?.logo_url ? (
                    <img 
                      src={currentOrg.logo_url} 
                      alt="Organisation Logo" 
                      className="w-32 h-32 object-contain mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center mb-4">
                      <span className="text-4xl font-bold text-white">
                        {currentOrg?.name?.charAt(0) || 'B'}
                      </span>
                    </div>
                  )}
                  <Button variant="outline" disabled={!canEdit}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={notifications.email_notifications}
                  onCheckedChange={(v) => setNotifications({ ...notifications, email_notifications: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-gray-500">Get notified when products are running low</p>
                </div>
                <Switch 
                  checked={notifications.low_stock_alerts}
                  onCheckedChange={(v) => setNotifications({ ...notifications, low_stock_alerts: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payroll Reminders</p>
                  <p className="text-sm text-gray-500">Reminders for payroll processing</p>
                </div>
                <Switch 
                  checked={notifications.payroll_reminders}
                  onCheckedChange={(v) => setNotifications({ ...notifications, payroll_reminders: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meeting Reminders</p>
                  <p className="text-sm text-gray-500">Get reminded before scheduled meetings</p>
                </div>
                <Switch 
                  checked={notifications.meeting_reminders}
                  onCheckedChange={(v) => setNotifications({ ...notifications, meeting_reminders: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Notifications</p>
                  <p className="text-sm text-gray-500">Notifications for new messages</p>
                </div>
                <Switch 
                  checked={notifications.chat_notifications}
                  onCheckedChange={(v) => setNotifications({ ...notifications, chat_notifications: v })}
                />
              </div>
              <Button className="sl-gradient">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="p-4 border-2 border-[#1EB053] rounded-xl cursor-pointer bg-white">
                    <div className="w-full h-20 bg-white border rounded mb-2" />
                    <p className="text-center text-sm font-medium">Light</p>
                  </div>
                  <div className="p-4 border-2 rounded-xl cursor-pointer hover:border-gray-400">
                    <div className="w-full h-20 bg-[#0F1F3C] rounded mb-2" />
                    <p className="text-center text-sm font-medium">Dark</p>
                  </div>
                  <div className="p-4 border-2 rounded-xl cursor-pointer hover:border-gray-400">
                    <div className="w-full h-20 bg-gradient-to-b from-white to-[#0F1F3C] rounded mb-2" />
                    <p className="text-center text-sm font-medium">System</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Accent Color</Label>
                <div className="flex gap-3 mt-2">
                  {['#1EB053', '#1D5FC3', '#D4AF37', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 ${color === '#1EB053' ? 'border-gray-900' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-gray-500">Manage your logged in devices</p>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}