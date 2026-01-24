import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { 
  Bell, Mail, DollarSign, FileText, Calendar, Package, 
  AlertTriangle, MessageSquare, Clock, Moon, Save
} from "lucide-react";
import { motion } from "framer-motion";

const notificationTypes = [
  {
    key: 'payroll_updates',
    label: 'Payroll Updates',
    description: 'Get notified when your payroll is processed',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    key: 'leave_requests',
    label: 'Leave Requests',
    description: 'Notifications about leave approvals and updates',
    icon: Calendar,
    color: 'text-blue-600'
  },
  {
    key: 'document_expirations',
    label: 'Document Expirations',
    description: 'Alerts for expiring documents and certificates',
    icon: FileText,
    color: 'text-amber-600'
  },
  {
    key: 'expense_approvals',
    label: 'Expense Approvals',
    description: 'Updates on expense claims and approvals',
    icon: DollarSign,
    color: 'text-indigo-600'
  },
  {
    key: 'stock_alerts',
    label: 'Stock Alerts',
    description: 'Low stock and inventory notifications',
    icon: Package,
    color: 'text-purple-600'
  },
  {
    key: 'meeting_reminders',
    label: 'Meeting Reminders',
    description: 'Reminders for upcoming meetings',
    icon: Calendar,
    color: 'text-teal-600'
  },
  {
    key: 'system_errors',
    label: 'System Errors',
    description: 'Critical system alerts and errors',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    key: 'chat_messages',
    label: 'Chat Messages',
    description: 'New messages and chat notifications',
    icon: MessageSquare,
    color: 'text-cyan-600'
  }
];

export default function NotificationSettings({ currentEmployee, orgId }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notificationPreferences', currentEmployee?.id],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ 
        employee_id: currentEmployee.id 
      });
      return prefs[0] || null;
    },
    enabled: !!currentEmployee?.id,
  });

  const [localPrefs, setLocalPrefs] = useState(null);

  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return base44.entities.NotificationPreference.create({
          organisation_id: orgId,
          employee_id: currentEmployee.id,
          employee_email: currentEmployee.user_email || currentEmployee.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationPreferences']);
      toast.success("Settings saved", "Your notification preferences have been updated");
    },
    onError: (error) => {
      toast.error("Failed to save", error.message);
    }
  });

  const updatePreference = (type, channel, value) => {
    setLocalPrefs(prev => ({
      ...prev,
      [type]: {
        ...(prev?.[type] || {}),
        [channel]: value
      }
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(localPrefs);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading preferences...</div>;
  }

  const currentPrefs = localPrefs || {
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
    email_digest: { enabled: false, frequency: 'daily', time: '09:00' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600 mt-1">Customize how you receive alerts and updates</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map((type, idx) => {
          const Icon = type.icon;
          const typePrefs = currentPrefs[type.key] || { in_app: true, email: true };
          
          return (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 ${type.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{type.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-400" />
                            <Label className="text-sm font-medium">In-App</Label>
                            <Switch
                              checked={typePrefs.in_app}
                              onCheckedChange={(checked) => updatePreference(type.key, 'in_app', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <Label className="text-sm font-medium">Email</Label>
                            <Switch
                              checked={typePrefs.email}
                              onCheckedChange={(checked) => updatePreference(type.key, 'email', checked)}
                            />
                          </div>
                        </div>

                        {/* Special Options */}
                        {type.key === 'document_expirations' && (
                          <div className="mt-3">
                            <Label className="text-xs text-gray-600">Alert me</Label>
                            <Select
                              value={String(typePrefs.days_before || 30)}
                              onValueChange={(val) => updatePreference(type.key, 'days_before', parseInt(val))}
                            >
                              <SelectTrigger className="w-40 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days before</SelectItem>
                                <SelectItem value="14">14 days before</SelectItem>
                                <SelectItem value="30">30 days before</SelectItem>
                                <SelectItem value="60">60 days before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {type.key === 'meeting_reminders' && (
                          <div className="mt-3">
                            <Label className="text-xs text-gray-600">Remind me</Label>
                            <Select
                              value={String(typePrefs.minutes_before || 15)}
                              onValueChange={(val) => updatePreference(type.key, 'minutes_before', parseInt(val))}
                            >
                              <SelectTrigger className="w-40 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes before</SelectItem>
                                <SelectItem value="15">15 minutes before</SelectItem>
                                <SelectItem value="30">30 minutes before</SelectItem>
                                <SelectItem value="60">1 hour before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quiet Hours */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Moon className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Quiet Hours</p>
              <p className="text-sm text-gray-600">Pause email notifications during specific hours</p>
            </div>
            <Switch
              checked={currentPrefs.quiet_hours?.enabled}
              onCheckedChange={(checked) => setLocalPrefs(prev => ({
                ...prev,
                quiet_hours: { ...prev.quiet_hours, enabled: checked }
              }))}
            />
          </div>

          {currentPrefs.quiet_hours?.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={currentPrefs.quiet_hours?.start_time || '22:00'}
                  onChange={(e) => setLocalPrefs(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, start_time: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={currentPrefs.quiet_hours?.end_time || '08:00'}
                  onChange={(e) => setLocalPrefs(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, end_time: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Clock className="w-5 h-5" />
            Email Digest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Daily/Weekly Summary</p>
              <p className="text-sm text-gray-600">Receive consolidated updates instead of individual emails</p>
            </div>
            <Switch
              checked={currentPrefs.email_digest?.enabled}
              onCheckedChange={(checked) => setLocalPrefs(prev => ({
                ...prev,
                email_digest: { ...prev.email_digest, enabled: checked }
              }))}
            />
          </div>

          {currentPrefs.email_digest?.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={currentPrefs.email_digest?.frequency || 'daily'}
                  onValueChange={(val) => setLocalPrefs(prev => ({
                    ...prev,
                    email_digest: { ...prev.email_digest, frequency: val }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={currentPrefs.email_digest?.time || '09:00'}
                  onChange={(e) => setLocalPrefs(prev => ({
                    ...prev,
                    email_digest: { ...prev.email_digest, time: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save All Preferences'}
        </Button>
      </div>
    </div>
  );
}