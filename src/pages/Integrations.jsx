import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Github,
  Calendar,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Loader2,
  Plug,
  Shield,
  Zap,
  Bell,
  FileText,
  Users,
  Package,
  Truck
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GitHubIntegration from "@/components/integrations/GitHubIntegration";
import GoogleCalendarIntegration from "@/components/integrations/GoogleCalendarIntegration";
import EmailIntegration from "@/components/integrations/EmailIntegration";
import WebhooksManager from "@/components/integrations/WebhooksManager";
import AutomationRules from "@/components/integrations/AutomationRules";

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Check GitHub connection
  const { data: githubStatus, isLoading: githubLoading } = useQuery({
    queryKey: ['githubStatus'],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('github', { action: 'getUser' });
        return { connected: !res.data?.message, user: res.data };
      } catch {
        return { connected: false, user: null };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Check Google Calendar connection
  const { data: calendarStatus, isLoading: calendarLoading } = useQuery({
    queryKey: ['calendarStatus'],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('googleCalendarSync', { action: 'listCalendars' });
        return { connected: !res.data?.error, calendars: res.data?.calendars || [] };
      } catch {
        return { connected: false, calendars: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Manage repos, issues, PRs, and project boards',
      icon: Github,
      color: 'bg-gray-900',
      status: githubStatus?.connected ? 'connected' : 'disconnected',
      loading: githubLoading,
      features: ['Issues', 'Pull Requests', 'Projects', 'Commits'],
      tab: 'github'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync tasks, meetings, and deadlines',
      icon: Calendar,
      color: 'bg-blue-500',
      status: calendarStatus?.connected ? 'connected' : 'disconnected',
      loading: calendarLoading,
      features: ['Events', 'Tasks', 'Reminders', 'Meetings'],
      tab: 'calendar'
    },
    {
      id: 'email',
      name: 'Email (MailerSend)',
      description: 'Send transactional emails and notifications',
      icon: Mail,
      color: 'bg-green-500',
      status: 'connected', // We have the API key
      loading: false,
      features: ['Invoices', 'Receipts', 'Alerts', 'Reports'],
      tab: 'email'
    },
  ];

  const automationCategories = [
    { icon: Package, label: 'Inventory', count: 3, color: 'text-blue-500' },
    { icon: Users, label: 'HR', count: 2, color: 'text-purple-500' },
    { icon: Truck, label: 'Transport', count: 1, color: 'text-orange-500' },
    { icon: Bell, label: 'Notifications', count: 4, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect external services and automate workflows"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="overview" className="gap-2">
            <Plug className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="github" className="gap-2">
            <Github className="w-4 h-4" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="automations" className="gap-2">
            <Zap className="w-4 h-4" /> Automations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Cloud className="w-4 h-4" /> Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${integration.color} text-white`}>
                      <integration.icon className="w-6 h-6" />
                    </div>
                    {integration.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : integration.status === 'connected' ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-gray-500">
                        <XCircle className="w-3 h-3 mr-1" /> Not Connected
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant={integration.status === 'connected' ? 'outline' : 'default'}
                    onClick={() => setActiveTab(integration.tab)}
                  >
                    {integration.status === 'connected' ? 'Manage' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-[#1EB053]">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
                <p className="text-sm text-gray-500">Connected Services</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">10</p>
                <p className="text-sm text-gray-500">Active Automations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">247</p>
                <p className="text-sm text-gray-500">Actions This Month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">3</p>
                <p className="text-sm text-gray-500">Webhook Endpoints</p>
              </CardContent>
            </Card>
          </div>

          {/* Automation Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Automation Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {automationCategories.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab('automations')}>
                    <cat.icon className={`w-8 h-8 ${cat.color}`} />
                    <div>
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-xs text-gray-500">{cat.count} rules active</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GitHub Tab */}
        <TabsContent value="github">
          <GitHubIntegration />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <GoogleCalendarIntegration />
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <EmailIntegration />
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          <AutomationRules />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}