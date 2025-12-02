import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  Package,
  Users,
  Truck,
  Bell,
  Mail,
  Github,
  Calendar,
  ArrowRight,
  Trash2,
  Edit,
  PlayCircle,
  PauseCircle,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function AutomationRules() {
  const [showNewRule, setShowNewRule] = useState(false);

  const automationRules = [
    {
      id: 1,
      name: "Low Stock GitHub Issue",
      trigger: "Stock falls below reorder point",
      action: "Create GitHub issue",
      category: "inventory",
      enabled: true,
      runs: 23,
      lastRun: "2 hours ago"
    },
    {
      id: 2,
      name: "Daily Sales Report Email",
      trigger: "Daily at 6:00 PM",
      action: "Send email report",
      category: "sales",
      enabled: true,
      runs: 30,
      lastRun: "18 hours ago"
    },
    {
      id: 3,
      name: "Task Due Calendar Sync",
      trigger: "Task due date set",
      action: "Create calendar event",
      category: "tasks",
      enabled: true,
      runs: 156,
      lastRun: "30 min ago"
    },
    {
      id: 4,
      name: "Expiry Alert Notification",
      trigger: "Product expires in 30 days",
      action: "Send notification + email",
      category: "inventory",
      enabled: true,
      runs: 12,
      lastRun: "1 day ago"
    },
    {
      id: 5,
      name: "New Employee Welcome",
      trigger: "Employee record created",
      action: "Send welcome email",
      category: "hr",
      enabled: false,
      runs: 5,
      lastRun: "2 weeks ago"
    },
    {
      id: 6,
      name: "Trip Completion Report",
      trigger: "Trip marked as completed",
      action: "Generate and email report",
      category: "transport",
      enabled: true,
      runs: 45,
      lastRun: "4 hours ago"
    },
    {
      id: 7,
      name: "Payroll Approval Payslip",
      trigger: "Payroll approved",
      action: "Send payslip email",
      category: "hr",
      enabled: true,
      runs: 89,
      lastRun: "3 days ago"
    },
    {
      id: 8,
      name: "Critical Stock GitHub + Slack",
      trigger: "Stock hits zero",
      action: "Create issue + notify",
      category: "inventory",
      enabled: true,
      runs: 3,
      lastRun: "1 week ago"
    },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inventory': return <Package className="w-4 h-4 text-blue-500" />;
      case 'hr': return <Users className="w-4 h-4 text-purple-500" />;
      case 'transport': return <Truck className="w-4 h-4 text-orange-500" />;
      case 'sales': return <Bell className="w-4 h-4 text-green-500" />;
      case 'tasks': return <Calendar className="w-4 h-4 text-cyan-500" />;
      default: return <Zap className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('email')) return <Mail className="w-4 h-4" />;
    if (action.includes('GitHub') || action.includes('issue')) return <Github className="w-4 h-4" />;
    if (action.includes('calendar')) return <Calendar className="w-4 h-4" />;
    if (action.includes('notification')) return <Bell className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const stats = {
    total: automationRules.length,
    active: automationRules.filter(r => r.enabled).length,
    totalRuns: automationRules.reduce((s, r) => s + r.runs, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Rules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlayCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-gray-500">Active Rules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
              <p className="text-xs text-gray-500">Total Executions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Automation Rules
            </span>
            <Button size="sm" onClick={() => setShowNewRule(true)} className="bg-[#1EB053]">
              <Plus className="w-4 h-4 mr-1" /> New Rule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automationRules.map((rule) => (
              <div 
                key={rule.id} 
                className={`p-4 border rounded-lg ${rule.enabled ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                      {getCategoryIcon(rule.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">{rule.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {rule.trigger}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="flex items-center gap-1">
                          {getActionIcon(rule.action)} {rule.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{rule.runs} runs</span>
                        <span>Last: {rule.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Switch checked={rule.enabled} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Rule Dialog */}
      <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input placeholder="e.g., Low Stock Alert" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR & Payroll</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trigger</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="When this happens..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low_stock">Stock falls below reorder point</SelectItem>
                  <SelectItem value="out_of_stock">Product goes out of stock</SelectItem>
                  <SelectItem value="expiring">Product expiring soon</SelectItem>
                  <SelectItem value="sale_completed">Sale completed</SelectItem>
                  <SelectItem value="task_due">Task due date</SelectItem>
                  <SelectItem value="employee_created">Employee created</SelectItem>
                  <SelectItem value="payroll_approved">Payroll approved</SelectItem>
                  <SelectItem value="trip_completed">Trip completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Do this..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github_issue">Create GitHub issue</SelectItem>
                  <SelectItem value="send_email">Send email</SelectItem>
                  <SelectItem value="calendar_event">Create calendar event</SelectItem>
                  <SelectItem value="notification">Send notification</SelectItem>
                  <SelectItem value="generate_report">Generate report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRule(false)}>Cancel</Button>
            <Button className="bg-[#1EB053]">Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}