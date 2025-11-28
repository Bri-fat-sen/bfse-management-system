import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Star,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Award,
  Folder
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import QuickClockIn from "@/components/mobile/QuickClockIn";

export default function EmployeeDashboard() {
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
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['myLeaveRequests', currentEmployee?.id],
    queryFn: () => base44.entities.LeaveRequest.filter({ employee_id: currentEmployee?.id }, '-created_date', 10),
    enabled: !!currentEmployee?.id,
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ['myPerformanceReviews', currentEmployee?.id],
    queryFn: () => base44.entities.PerformanceReview.filter({ employee_id: currentEmployee?.id }, '-review_date', 5),
    enabled: !!currentEmployee?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['myDocuments', currentEmployee?.id],
    queryFn: () => base44.entities.EmployeeDocument.filter({ employee_id: currentEmployee?.id }, '-created_date', 10),
    enabled: !!currentEmployee?.id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['myAttendance', currentEmployee?.id],
    queryFn: () => base44.entities.Attendance.filter({ employee_id: currentEmployee?.id }, '-date', 30),
    enabled: !!currentEmployee?.id,
  });

  const { data: todayAttendanceData } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ 
        employee_id: currentEmployee?.id,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      return records[0];
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['myPayrolls', currentEmployee?.id],
    queryFn: () => base44.entities.Payroll.filter({ employee_id: currentEmployee?.id }, '-period_end', 3),
    enabled: !!currentEmployee?.id,
  });

  const currentOrg = organisation?.[0];

  if (!user || !currentEmployee) {
    return <LoadingSpinner message="Loading Employee Portal..." subtitle="Fetching your information" />;
  }
  
  const today = new Date();

  // Calculate stats
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved' && isAfter(new Date(l.end_date), today));
  const latestReview = performanceReviews[0];
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const expiringDocs = documents.filter(d => d.expiry_date && isBefore(new Date(d.expiry_date), addDays(today, 30)));
  const latestPayroll = payrolls[0];

  const leaveStatusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800"
  };

  const leaveTypeLabels = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    unpaid: "Unpaid Leave",
    compassionate: "Compassionate Leave",
    study: "Study Leave"
  };

  const documentTypeIcons = {
    contract: "📄",
    id_card: "🪪",
    passport: "🛂",
    certificate: "📜",
    resume: "📋",
    medical: "🏥",
    other: "📁"
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${currentEmployee?.first_name || user?.full_name?.split(' ')[0] || 'Employee'}!`}
        subtitle={format(today, "EEEE, MMMM d, yyyy")}
      >
        <Link to={createPageUrl("Profile")}>
          <Button variant="outline">
            <User className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </Link>
      </PageHeader>

      {/* Profile Summary Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={currentEmployee?.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-3xl">
                {currentEmployee?.full_name?.charAt(0) || 'E'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold">{currentEmployee?.full_name || user?.full_name}</h2>
              <p className="text-gray-500">{currentEmployee?.position || 'Employee'} • {currentEmployee?.department}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                  {currentEmployee?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline">{currentEmployee?.employee_code}</Badge>
                <Badge variant={currentEmployee?.status === 'active' ? 'secondary' : 'outline'}>
                  {currentEmployee?.status}
                </Badge>
              </div>
            </div>
            <div className="hidden md:block text-right pb-2">
              <p className="text-sm text-gray-500">Organisation</p>
              <p className="font-semibold">{currentOrg?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clock In/Out */}
      {currentEmployee && orgId && (
        <QuickClockIn 
          currentEmployee={currentEmployee}
          orgId={orgId}
          todayAttendance={todayAttendanceData}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Leave Balance"
          value={`${pendingLeaves.length} Pending`}
          subtitle={`${approvedLeaves.length} upcoming approved`}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          title="This Month"
          value={`${presentDays} Days`}
          subtitle={`${totalHours.toFixed(1)} hours worked`}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Performance"
          value={latestReview?.overall_rating ? `${latestReview.overall_rating}/5` : "No Review"}
          subtitle={latestReview?.review_period || "Pending review"}
          icon={Star}
          color="gold"
        />
        <StatCard
          title="Documents"
          value={`${documents.length} Files`}
          subtitle={expiringDocs.length > 0 ? `${expiringDocs.length} expiring soon` : "All up to date"}
          icon={FileText}
          color={expiringDocs.length > 0 ? "red" : "navy"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#0072C6]" />
                My Leave Requests
              </CardTitle>
              <Link to={createPageUrl("HR")}>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No leave requests yet</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {leaveRequests.slice(0, 5).map((leave) => (
                      <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2 sm:gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            leave.status === 'pending' ? 'bg-amber-100' : 
                            leave.status === 'approved' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {leave.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-amber-600" />
                            ) : leave.status === 'approved' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{leaveTypeLabels[leave.leave_type] || leave.leave_type}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={leaveStatusColors[leave.status]}>
                            {leave.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{leave.days_requested} day(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Performance Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1EB053]" />
                Performance Reviews
              </CardTitle>
              <Link to={createPageUrl("HR")}>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {performanceReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No performance reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {performanceReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{review.review_period}</p>
                          <p className="text-sm text-gray-500">
                            Reviewed by {review.reviewer_name} • {review.review_date ? format(new Date(review.review_date), 'MMM d, yyyy') : 'Pending'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= (review.overall_rating || 0) 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.ratings && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                          {Object.entries(review.ratings).slice(0, 6).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-gray-600 capitalize">{key}</span>
                              <span className="font-medium">{value}/5</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {review.strengths && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">Strengths</p>
                          <p className="text-sm text-green-800">{review.strengths}</p>
                        </div>
                      )}
                      <Badge variant="outline" className="mt-3">
                        {review.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium truncate">{currentEmployee?.email || user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{currentEmployee?.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium">{currentEmployee?.department || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Hire Date</p>
                  <p className="text-sm font-medium">
                    {currentEmployee?.hire_date ? format(new Date(currentEmployee.hire_date), 'MMM d, yyyy') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#0072C6]" />
                My Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No documents uploaded</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {documents.slice(0, 6).map((doc) => {
                      const isExpiring = doc.expiry_date && isBefore(new Date(doc.expiry_date), addDays(today, 30));
                      return (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            isExpiring ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-xl">{documentTypeIcons[doc.document_type] || '📁'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.document_type.replace(/_/g, ' ')}</p>
                          </div>
                          {isExpiring && (
                            <Badge variant="destructive" className="text-xs">Expiring</Badge>
                          )}
                          {doc.is_verified && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Latest Payslip */}
          {latestPayroll && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1EB053]" />
                  Latest Payslip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Period</span>
                    <span className="font-medium">
                      {format(new Date(latestPayroll.period_start), 'MMM d')} - {format(new Date(latestPayroll.period_end), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Gross Pay</span>
                    <span className="font-medium">SLE {latestPayroll.gross_pay?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Deductions</span>
                    <span className="font-medium text-red-500">-SLE {latestPayroll.total_deductions?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Net Pay</span>
                    <span className="font-bold text-[#1EB053]">SLE {latestPayroll.net_pay?.toLocaleString()}</span>
                  </div>
                  <Badge variant={latestPayroll.status === 'paid' ? 'secondary' : 'outline'} className="w-full justify-center">
                    {latestPayroll.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}