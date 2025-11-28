import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Bell,
  Palette,
  Moon,
  Sun,
  Save,
  Camera
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];

  const updateEmployeeMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(currentEmployee?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      toast.success("Profile updated successfully");
    },
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      phone: formData.get('phone'),
      emergency_contact: formData.get('emergency_contact'),
      emergency_phone: formData.get('emergency_phone'),
      address: formData.get('address'),
    };
    updateEmployeeMutation.mutate(data);
  };

  const isLoading = !user || (!!user?.email && loadingEmployee);

  if (isLoading) {
    return <LoadingSpinner message="Loading Settings..." subtitle="Fetching your preferences" fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1 p-1 bg-gray-100">
          <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                    <AvatarImage src={currentEmployee?.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white text-xl sm:text-2xl">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <Button variant="outline" className="mb-2">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={currentEmployee?.full_name || ''} disabled className="mt-1 bg-gray-50" />
                      <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
                    </div>
                    <div>
                      <Label>Employee Code</Label>
                      <Input value={currentEmployee?.employee_code || ''} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={currentEmployee?.email || user?.email || ''} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input name="phone" defaultValue={currentEmployee?.phone} className="mt-1" />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={currentEmployee?.department || ''} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input value={currentEmployee?.position || ''} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <Input name="address" defaultValue={currentEmployee?.address} className="mt-1" />
                    </div>
                  </div>

                  <div className="border-t my-6" />

                  <h3 className="font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Name</Label>
                      <Input name="emergency_contact" defaultValue={currentEmployee?.emergency_contact} className="mt-1" />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input name="emergency_phone" defaultValue={currentEmployee?.emergency_phone} className="mt-1" />
                    </div>
                  </div>

                  <div className="flex justify-center sm:justify-end pt-4">
                    <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { id: 'chat', label: 'Chat Messages', description: 'Get notified when you receive new messages' },
                  { id: 'meetings', label: 'Meeting Reminders', description: 'Receive reminders before scheduled meetings' },
                  { id: 'sales', label: 'Sales Alerts', description: 'Get notified about sales activities' },
                  { id: 'inventory', label: 'Low Stock Alerts', description: 'Be alerted when products are running low' },
                  { id: 'payroll', label: 'Payroll Updates', description: 'Notifications about payroll processing' },
                  { id: 'system', label: 'System Announcements', description: 'Important system updates and announcements' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">{item.label}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate sm:whitespace-normal">{item.description}</p>
                    </div>
                    <Switch defaultChecked className="shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 border-2 border-[#1EB053] rounded-xl cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#1EB053]" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">Light Mode</p>
                    <p className="text-xs sm:text-sm text-gray-500">Default theme</p>
                  </div>
                  <div className="p-3 sm:p-4 border-2 rounded-xl cursor-pointer bg-[#0F1F3C] text-white">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">Dark Mode</p>
                    <p className="text-xs sm:text-sm text-gray-400">Easy on the eyes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your language and regional preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select defaultValue="africa/freetown">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/freetown">Africa/Freetown (GMT+0)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}