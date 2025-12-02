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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Cloud,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function WebhooksManager() {
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [showSecret, setShowSecret] = useState({});

  const webhooks = [
    {
      id: 1,
      name: "Sales Notifications",
      url: "https://api.example.com/webhooks/sales",
      events: ["sale.created", "sale.updated"],
      secret: "whsec_abc123xyz...",
      enabled: true,
      lastDelivery: "2 min ago",
      status: "success",
      deliveries: 156
    },
    {
      id: 2,
      name: "Inventory Updates",
      url: "https://hooks.zapier.com/hooks/catch/123456/abcdef",
      events: ["stock.low", "stock.out", "product.created"],
      secret: "whsec_def456uvw...",
      enabled: true,
      lastDelivery: "15 min ago",
      status: "success",
      deliveries: 89
    },
    {
      id: 3,
      name: "HR System Sync",
      url: "https://hr-system.company.com/api/webhooks",
      events: ["employee.created", "payroll.approved"],
      secret: "whsec_ghi789rst...",
      enabled: false,
      lastDelivery: "3 days ago",
      status: "failed",
      deliveries: 23
    },
  ];

  const eventTypes = [
    { category: "Sales", events: ["sale.created", "sale.updated", "sale.deleted", "invoice.created"] },
    { category: "Inventory", events: ["stock.low", "stock.out", "product.created", "product.updated", "batch.expiring"] },
    { category: "HR", events: ["employee.created", "employee.updated", "payroll.created", "payroll.approved", "leave.requested"] },
    { category: "Transport", events: ["trip.created", "trip.completed", "maintenance.due", "route.updated"] },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Webhooks</h2>
                <p className="text-gray-300">Send real-time data to external systems</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setShowNewWebhook(true)}>
              <Plus className="w-4 h-4 mr-1" /> New Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.length}</p>
              <p className="text-xs text-gray-500">Endpoints</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.filter(w => w.enabled).length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.reduce((s, w) => s + w.deliveries, 0)}</p>
              <p className="text-xs text-gray-500">Deliveries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.filter(w => w.status === 'failed').length}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className={`p-4 border rounded-lg ${webhook.enabled ? '' : 'bg-gray-50 opacity-75'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{webhook.name}</h4>
                      {webhook.status === 'success' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" /> Healthy
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" /> Failed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <code className="px-2 py-0.5 bg-gray-100 rounded text-xs truncate max-w-md">
                        {webhook.url}
                      </code>
                      <button onClick={() => copyToClipboard(webhook.url)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <code className="text-xs text-gray-500">
                        {showSecret[webhook.id] ? webhook.secret : '••••••••••••••••'}
                      </code>
                      <button 
                        onClick={() => setShowSecret({ ...showSecret, [webhook.id]: !showSecret[webhook.id] })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showSecret[webhook.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{webhook.deliveries} deliveries</span>
                      <span>Last: {webhook.lastDelivery}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Switch checked={webhook.enabled} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Webhook Dialog */}
      <Dialog open={showNewWebhook} onOpenChange={setShowNewWebhook}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Webhook Name</Label>
              <Input placeholder="e.g., Sales Notifications" />
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input placeholder="https://your-server.com/webhook" />
            </div>
            <div>
              <Label>Events to Subscribe</Label>
              <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
                {eventTypes.map((category) => (
                  <div key={category.category}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{category.category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {category.events.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Checkbox id={event} />
                          <label htmlFor={event} className="text-sm text-gray-600">{event}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWebhook(false)}>Cancel</Button>
            <Button className="bg-[#1EB053]">Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}