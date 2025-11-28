import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  CalendarDays, Plus, Clock, CheckCircle2, XCircle, 
  AlertCircle, Calendar as CalendarIcon, FileUp, Loader2
} from "lucide-react";

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave', color: 'bg-blue-100 text-blue-700' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-700' },
  { value: 'maternity', label: 'Maternity Leave', color: 'bg-pink-100 text-pink-700' },
  { value: 'paternity', label: 'Paternity Leave', color: 'bg-purple-100 text-purple-700' },
  { value: 'unpaid', label: 'Unpaid Leave', color: 'bg-gray-100 text-gray-700' },
  { value: 'compassionate', label: 'Compassionate Leave', color: 'bg-amber-100 text-amber-700' },
  { value: 'study', label: 'Study Leave', color: 'bg-green-100 text-green-700' }
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' },
  cancelled: { icon: AlertCircle, color: 'bg-gray-100 text-gray-700', label: 'Cancelled' }
};

export default function LeaveRequestForm({ employee, orgId }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: null,
    end_date: null,
    reason: ''
  });
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['myLeaveRequests', employee?.id],
    queryFn: () => base44.entities.LeaveRequest.filter({ employee_id: employee?.id }, '-created_date', 20),
    enabled: !!employee?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      toast.success("Leave request submitted successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to submit leave request", { description: error.message });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.LeaveRequest.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      toast.success("Leave request cancelled");
    }
  });

  const resetForm = () => {
    setFormData({
      leave_type: 'annual',
      start_date: null,
      end_date: null,
      reason: ''
    });
    setAttachmentUrl('');
    setShowDialog(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentUrl(file_url);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select start and end dates");
      return;
    }

    const daysRequested = differenceInDays(formData.end_date, formData.start_date) + 1;

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      leave_type: formData.leave_type,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
      days_requested: daysRequested,
      reason: formData.reason,
      status: 'pending',
      attachment_url: attachmentUrl
    });
  };

  const pendingRequests = leaveRequests.filter(l => l.status === 'pending');
  const approvedRequests = leaveRequests.filter(l => l.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Pending</p>
              <p className="text-2xl font-bold text-amber-800">{pendingRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-800">{approvedRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-800">{leaveRequests.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0072C6]" />
            My Leave Requests
          </CardTitle>
          <Button onClick={() => setShowDialog(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No leave requests</p>
              <p className="text-sm">Submit your first leave request above</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {leaveRequests.map((leave) => {
                  const statusConfig = STATUS_CONFIG[leave.status];
                  const StatusIcon = statusConfig.icon;
                  const leaveType = LEAVE_TYPES.find(t => t.value === leave.leave_type);

                  return (
                    <div key={leave.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.color}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{leaveType?.label || leave.leave_type}</p>
                              <Badge className={leaveType?.color}>{leave.days_requested} day(s)</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          {leave.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => cancelMutation.mutate(leave.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                      {leave.reason && (
                        <p className="text-sm text-gray-600 mt-2 pl-13">Reason: {leave.reason}</p>
                      )}
                      {leave.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2 pl-13 bg-red-50 p-2 rounded">
                          Rejection reason: {leave.rejection_reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* New Leave Request Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#1EB053]" />
              Submit Leave Request
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Leave Type</Label>
              <Select value={formData.leave_type} onValueChange={(v) => setFormData({ ...formData, leave_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${type.color.split(' ')[0]}`} />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.start_date ? format(formData.start_date, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.end_date ? format(formData.end_date, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      disabled={(date) => date < (formData.start_date || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {formData.start_date && formData.end_date && (
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <span className="text-blue-700 font-medium">
                  {differenceInDays(formData.end_date, formData.start_date) + 1} day(s) requested
                </span>
              </div>
            )}

            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly explain your leave request..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Supporting Document (optional)</Label>
              <div className="mt-1">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                {attachmentUrl && <p className="text-sm text-green-600 mt-1">File uploaded successfully</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-[#1EB053] hover:bg-[#178f43]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}