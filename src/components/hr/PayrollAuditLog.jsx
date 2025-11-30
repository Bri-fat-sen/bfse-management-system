import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, Plus, Pencil, CheckCircle, XCircle, 
  DollarSign, RefreshCw, User, Search, Filter, Download
} from "lucide-react";
import { formatSLE } from "./PayrollCalculator";

const ACTION_CONFIG = {
  created: { icon: Plus, color: 'bg-blue-100 text-blue-600', label: 'Created' },
  updated: { icon: Pencil, color: 'bg-yellow-100 text-yellow-600', label: 'Updated' },
  approved: { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Rejected' },
  paid: { icon: DollarSign, color: 'bg-[#1EB053]/10 text-[#1EB053]', label: 'Paid' },
  cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-600', label: 'Cancelled' },
  recalculated: { icon: RefreshCw, color: 'bg-purple-100 text-purple-600', label: 'Recalculated' }
};

export default function PayrollAuditLog({ orgId, payrollId = null, limit = 100 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['payrollAudit', orgId, payrollId],
    queryFn: async () => {
      const filter = { organisation_id: orgId };
      if (payrollId) filter.payroll_id = payrollId;
      return base44.entities.PayrollAudit.filter(filter, '-created_date', limit);
    },
    enabled: !!orgId,
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.changed_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportAuditLog = () => {
    const csv = [
      ['Date', 'Employee', 'Action', 'Changed By', 'Details', 'Reason'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_date), 'yyyy-MM-dd HH:mm'),
        log.employee_name,
        log.action,
        log.changed_by_name,
        log.new_values?.net_pay ? `Net Pay: ${log.new_values.net_pay}` : '',
        log.reason || ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Loading audit log...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0072C6]" />
            Payroll Audit Trail
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportAuditLog}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by employee or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="recalculated">Recalculated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No audit records found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
                const Icon = config.icon;
                
                return (
                  <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">
                          {log.employee_name}
                          <Badge variant="outline" className="ml-2">{config.label}</Badge>
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {format(new Date(log.created_date), 'dd MMM yyyy HH:mm')}
                        </span>
                      </div>
                      
                      {log.new_values && (
                        <div className="mt-1 text-sm text-gray-600">
                          {log.new_values.net_pay && (
                            <span className="text-[#1EB053] font-medium">
                              Net Pay: {formatSLE(log.new_values.net_pay)}
                            </span>
                          )}
                          {log.new_values.period && (
                            <span className="ml-2 text-gray-500">• {log.new_values.period}</span>
                          )}
                        </div>
                      )}
                      
                      {log.changes && log.changes.field && (
                        <div className="mt-1 text-xs bg-yellow-50 p-2 rounded">
                          <span className="font-medium">{log.changes.field}:</span>
                          <span className="text-red-500 line-through ml-2">{log.changes.old_value}</span>
                          <span className="text-green-600 ml-2">→ {log.changes.new_value}</span>
                        </div>
                      )}
                      
                      {log.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{log.reason}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>by {log.changed_by_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}