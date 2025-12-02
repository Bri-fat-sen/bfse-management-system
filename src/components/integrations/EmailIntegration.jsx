import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  Send,
  CheckCircle,
  FileText,
  Receipt,
  Bell,
  BarChart,
  Clock,
  Users,
  Zap,
  Settings,
  Eye
} from "lucide-react";

export default function EmailIntegration() {
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const emailStats = [
    { label: "Emails Sent (Month)", value: 1247, icon: Send, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "Invoices", value: 156, icon: FileText, color: "text-green-500", bg: "bg-green-100" },
    { label: "Receipts", value: 892, icon: Receipt, color: "text-purple-500", bg: "bg-purple-100" },
    { label: "Alerts", value: 43, icon: Bell, color: "text-orange-500", bg: "bg-orange-100" },
  ];

  const emailTemplates = [
    { id: 1, name: "Sales Receipt", type: "receipt", sent: 892, lastUsed: "2 hours ago" },
    { id: 2, name: "Invoice", type: "invoice", sent: 156, lastUsed: "5 hours ago" },
    { id: 3, name: "Low Stock Alert", type: "alert", sent: 23, lastUsed: "1 day ago" },
    { id: 4, name: "Payslip", type: "payroll", sent: 45, lastUsed: "3 days ago" },
    { id: 5, name: "Daily Report", type: "report", sent: 30, lastUsed: "12 hours ago" },
    { id: 6, name: "Welcome Email", type: "onboarding", sent: 12, lastUsed: "1 week ago" },
  ];

  const automations = [
    { name: "Send receipt after sale", enabled: true, description: "Auto-send receipt email when sale is completed" },
    { name: "Invoice on order creation", enabled: true, description: "Send invoice when new order is created" },
    { name: "Low stock notifications", enabled: true, description: "Email warehouse manager on low stock" },
    { name: "Daily sales report", enabled: false, description: "Send daily sales summary to admins" },
    { name: "Payslip on payroll approval", enabled: true, description: "Email payslip when payroll is approved" },
    { name: "Expiry alerts", enabled: true, description: "Notify about expiring products/licenses" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Email Integration</h2>
                <p className="text-green-100">Powered by MailerSend</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-white/20 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" /> Connected
              </Badge>
              <Button variant="secondary" size="sm" onClick={() => setShowTestEmail(true)}>
                <Send className="w-4 h-4 mr-1" /> Test Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {emailStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 ${stat.bg} rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Email Templates
              </span>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-1" /> Manage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emailTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {template.type === 'receipt' && <Receipt className="w-4 h-4 text-green-600" />}
                      {template.type === 'invoice' && <FileText className="w-4 h-4 text-blue-600" />}
                      {template.type === 'alert' && <Bell className="w-4 h-4 text-orange-600" />}
                      {template.type === 'payroll' && <Users className="w-4 h-4 text-purple-600" />}
                      {template.type === 'report' && <BarChart className="w-4 h-4 text-cyan-600" />}
                      {template.type === 'onboarding' && <Mail className="w-4 h-4 text-pink-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.sent} sent • {template.lastUsed}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Automations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Email Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automations.map((auto, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{auto.name}</p>
                    <p className="text-xs text-gray-500">{auto.description}</p>
                  </div>
                  <Switch defaultChecked={auto.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" /> Recent Email Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "receipt", to: "customer@example.com", subject: "Your Receipt #1234", time: "2 min ago", status: "delivered" },
              { type: "invoice", to: "business@company.com", subject: "Invoice INV-0056", time: "15 min ago", status: "delivered" },
              { type: "alert", to: "warehouse@company.com", subject: "Low Stock Alert: Water Bottles", time: "1 hour ago", status: "delivered" },
              { type: "report", to: "admin@company.com", subject: "Daily Sales Report", time: "12 hours ago", status: "delivered" },
              { type: "payroll", to: "employee@company.com", subject: "Your Payslip - November 2024", time: "3 days ago", status: "delivered" },
            ].map((email, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    email.type === 'receipt' ? 'bg-green-100' :
                    email.type === 'invoice' ? 'bg-blue-100' :
                    email.type === 'alert' ? 'bg-orange-100' :
                    email.type === 'report' ? 'bg-cyan-100' : 'bg-purple-100'
                  }`}>
                    <Mail className={`w-4 h-4 ${
                      email.type === 'receipt' ? 'text-green-600' :
                      email.type === 'invoice' ? 'text-blue-600' :
                      email.type === 'alert' ? 'text-orange-600' :
                      email.type === 'report' ? 'text-cyan-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-xs text-gray-500">To: {email.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> {email.status}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">{email.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmail} onOpenChange={setShowTestEmail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <p className="text-sm text-gray-500">
              A test email will be sent to verify your email integration is working correctly.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmail(false)}>Cancel</Button>
            <Button className="bg-green-500">
              <Send className="w-4 h-4 mr-2" /> Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}