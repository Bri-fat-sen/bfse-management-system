import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Bell,
  Palette,
  Moon,
  Sun,
  Save,
  Camera,
  Layout,
  Sliders,
  Type,
  Image as ImageIcon,
  Sparkles,
  RefreshCw
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
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Settings() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];

  const { data: preferences, isLoading: loadingPrefs } = useQuery({
    queryKey: ['preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const [localPrefs, setLocalPrefs] = useState({
    theme_mode: 'light',
    primary_color: '#1EB053',
    secondary_color: '#0072C6',
    accent_color: '#D4AF37',
    sidebar_color: '#0F1F3C',
    background_style: 'solid',
    background_color: '#F9FAFB',
    background_gradient_start: '#F9FAFB',
    background_gradient_end: '#E5E7EB',
    card_style: 'default',
    compact_mode: false,
    font_size: 'medium',
    notifications: {
      chat: true,
      meetings: true,
      sales: true,
      inventory: true,
      payroll: true,
      system: true
    }
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(prev => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  const updateEmployeeMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(currentEmployee?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      toast.success("Profile updated successfully");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return await base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        return await base44.entities.UserPreferences.create({ ...data, user_email: user?.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success("Preferences updated", "Your customization has been saved");
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

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(localPrefs);
    // Trigger a refetch to apply changes immediately
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      window.location.reload(); // Reload to apply all changes
    }, 500);
  };

  const handleResetToDefault = () => {
    const defaults = {
      theme_mode: 'light',
      primary_color: '#1EB053',
      secondary_color: '#0072C6',
      accent_color: '#D4AF37',
      sidebar_color: '#0F1F3C',
      background_style: 'solid',
      background_color: '#F9FAFB',
      card_style: 'default',
      compact_mode: false,
      font_size: 'medium',
    };
    setLocalPrefs(prev => ({ ...prev, ...defaults }));
  };

  const isLoading = !user || (!!user?.email && (loadingEmployee || loadingPrefs));

  if (isLoading) {
    return <LoadingSpinner message="Loading Settings..." subtitle="Fetching your preferences" fullScreen={true} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
        </div>
      </div>

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
          <TabsTrigger value="customization" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Customization
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
                    <Switch 
                      checked={localPrefs.notifications?.[item.id]}
                      onCheckedChange={(checked) => setLocalPrefs({...localPrefs, notifications: {...localPrefs.notifications, [item.id]: checked}})}
                      className="shrink-0" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Mode</CardTitle>
                <CardDescription>Choose your preferred theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { value: 'light', icon: Sun, label: 'Light', desc: 'Default theme', bg: 'bg-white', text: 'text-gray-900' },
                    { value: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on eyes', bg: 'bg-[#0F1F3C]', text: 'text-white' },
                    { value: 'auto', icon: Sliders, label: 'Auto', desc: 'System default', bg: 'bg-gradient-to-br from-white to-[#0F1F3C]', text: 'text-gray-900' }
                  ].map(theme => (
                    <div 
                      key={theme.value}
                      onClick={() => setLocalPrefs({...localPrefs, theme_mode: theme.value})}
                      className={`p-4 border-2 rounded-xl cursor-pointer ${theme.bg} ${theme.text} ${localPrefs.theme_mode === theme.value ? 'border-[#1EB053] ring-2 ring-[#1EB053]/20' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <theme.icon className="w-5 h-5" />
                        <div className={`w-4 h-4 rounded-full ${localPrefs.theme_mode === theme.value ? 'bg-[#1EB053]' : 'border-2'}`} />
                      </div>
                      <p className="font-medium">{theme.label}</p>
                      <p className="text-sm opacity-70">{theme.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout & Display</CardTitle>
                <CardDescription>Adjust layout preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                  </div>
                  <Switch checked={localPrefs.compact_mode} onCheckedChange={(v) => setLocalPrefs({...localPrefs, compact_mode: v})} />
                </div>
                <div>
                  <Label>Font Size</Label>
                  <Select value={localPrefs.font_size} onValueChange={(v) => setLocalPrefs({...localPrefs, font_size: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Card Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {['default', 'bordered', 'elevated', 'flat'].map(style => (
                      <div
                        key={style}
                        onClick={() => setLocalPrefs({...localPrefs, card_style: style})}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center capitalize ${localPrefs.card_style === style ? 'border-[#1EB053] bg-green-50' : 'border-gray-200'}`}
                      >
                        {style}
                      </div>
                    ))}
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
                    <Select value={localPrefs.language} onValueChange={(v) => setLocalPrefs({...localPrefs, language: v})}>
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
                    <Select value={localPrefs.timezone} onValueChange={(v) => setLocalPrefs({...localPrefs, timezone: v})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Freetown">Africa/Freetown (GMT+0)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleResetToDefault}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customization">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Customization
                </CardTitle>
                <CardDescription>Personalize your color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'primary_color', label: 'Primary Color', desc: 'Main brand color' },
                    { key: 'secondary_color', label: 'Secondary Color', desc: 'Accent color' },
                    { key: 'accent_color', label: 'Accent Color', desc: 'Highlight color' },
                    { key: 'sidebar_color', label: 'Sidebar Color', desc: 'Navigation background' }
                  ].map(color => (
                    <div key={color.key} className="space-y-2">
                      <Label>{color.label}</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="color"
                          value={localPrefs[color.key]}
                          onChange={(e) => setLocalPrefs({...localPrefs, [color.key]: e.target.value})}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <div className="flex-1">
                          <Input
                            value={localPrefs[color.key]}
                            onChange={(e) => setLocalPrefs({...localPrefs, [color.key]: e.target.value})}
                            className="font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-1">{color.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Background Customization
                </CardTitle>
                <CardDescription>Customize your app background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Background Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {[
                      { value: 'solid', label: 'Solid', icon: '🎨' },
                      { value: 'gradient', label: 'Gradient', icon: '🌈' },
                      { value: 'pattern', label: 'Pattern', icon: '🔷' },
                      { value: 'image', label: 'Image', icon: '🖼️' }
                    ].map(style => (
                      <div
                        key={style.value}
                        onClick={() => setLocalPrefs({...localPrefs, background_style: style.value})}
                        className={`p-3 border-2 rounded-xl cursor-pointer text-center ${localPrefs.background_style === style.value ? 'border-[#1EB053] bg-green-50' : 'border-gray-200'}`}
                      >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <p className="text-sm font-medium">{style.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {localPrefs.background_style === 'solid' && (
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-3 items-center mt-2">
                      <Input
                        type="color"
                        value={localPrefs.background_color}
                        onChange={(e) => setLocalPrefs({...localPrefs, background_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={localPrefs.background_color}
                        onChange={(e) => setLocalPrefs({...localPrefs, background_color: e.target.value})}
                        className="font-mono flex-1"
                      />
                    </div>
                  </div>
                )}

                {localPrefs.background_style === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gradient Start</Label>
                      <div className="flex gap-2 items-center mt-2">
                        <Input
                          type="color"
                          value={localPrefs.background_gradient_start}
                          onChange={(e) => setLocalPrefs({...localPrefs, background_gradient_start: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={localPrefs.background_gradient_start}
                          onChange={(e) => setLocalPrefs({...localPrefs, background_gradient_start: e.target.value})}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Gradient End</Label>
                      <div className="flex gap-2 items-center mt-2">
                        <Input
                          type="color"
                          value={localPrefs.background_gradient_end}
                          onChange={(e) => setLocalPrefs({...localPrefs, background_gradient_end: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={localPrefs.background_gradient_end}
                          onChange={(e) => setLocalPrefs({...localPrefs, background_gradient_end: e.target.value})}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {localPrefs.background_style === 'image' && (
                  <div>
                    <Label>Background Image URL</Label>
                    <Input
                      value={localPrefs.background_image_url || ''}
                      onChange={(e) => setLocalPrefs({...localPrefs, background_image_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2"
                    />
                  </div>
                )}

                <div 
                  className="h-32 rounded-xl border-2 border-dashed border-gray-300"
                  style={{
                    background: localPrefs.background_style === 'solid' ? localPrefs.background_color :
                                localPrefs.background_style === 'gradient' ? `linear-gradient(135deg, ${localPrefs.background_gradient_start}, ${localPrefs.background_gradient_end})` :
                                localPrefs.background_style === 'image' && localPrefs.background_image_url ? `url(${localPrefs.background_image_url}) center/cover` :
                                '#F9FAFB'
                  }}
                >
                  <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium">
                    Preview
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleResetToDefault}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                <Save className="w-4 h-4 mr-2" />
                Save Customization
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}