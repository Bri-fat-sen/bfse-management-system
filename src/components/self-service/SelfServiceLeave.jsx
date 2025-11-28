import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, differenceInDays } from "date-fns";
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import LeaveRequestDialog from "@/components/hr/LeaveRequestDialog";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";

const LEAVE_BALANCES = {
  annual: { total: 21, label: "Annual Leave" },
  sick: { total: 10, label: "Sick Leave" },
  maternity: { total: 90, label: "Maternity Leave" },
  paternity: { total: 5, label: "Paternity Leave" }
};

export default function SelfServiceLeave({ employee }) {
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['myLeaveRequests', employee?.id],
    queryFn: () => base44.entities.LeaveRequest.filter({ 
      employee_id: employee?.id 
    }, '-created_date', 50),
    enabled: !!employee?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.LeaveRequest.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      toast.success("Leave request cancelled");
    }
  });

  // Calculate used leave by type
  const usedLeave = leaveRequests
    .filter(r => r.status === 'approved' && new Date().getFullYear() === new Date(r.start_date).getFullYear())
    .reduce((acc, r) => {
      acc[r.leave_type] = (acc[r.leave_type] || 0) + (r.days_requested || 0);
      return acc;
    }, {});

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'cancelled': return { color: 'bg-gray-100 text-gray-800', icon: XCircle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(LEAVE_BALANCES).map(([type, config]) => {
          const used = usedLeave[type] || 0;
          const remaining = Math.max(0, config.total - used);
          const percentage = (used / config.total) * 100;
          
          return (
            <Card key={type}>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500 mb-1">{config.label}</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-[#1EB053]">{remaining}</span>
                  <span className="text-sm text-gray-400">/ {config.total} days</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">{used} days used</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            My Leave Requests
          </CardTitle>
          <Button onClick={() => setShowRequestDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : leaveRequests.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Leave Requests"
              description="You haven't submitted any leave requests yet"
              action={() => setShowRequestDialog(true)}
              actionLabel="Request Leave"
            />
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {leaveRequests.map((request) => {
                  const statusConfig = getStatusConfig(request.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div 
                      key={request.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${statusConfig.color} flex items-center justify-center`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{request.leave_type?.replace(/_/g, ' ')} Leave</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(request.start_date), 'dd MMM yyyy')} - {format(new Date(request.end_date), 'dd MMM yyyy')}
                          </p>
                          <p className="text-sm text-gray-400">{request.days_requested} day(s)</p>
                          {request.reason && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{request.reason}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.color}>
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => cancelMutation.mutate(request.id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        currentEmployee={employee}
        orgId={employee?.organisation_id}
      />
    </div>
  );
}