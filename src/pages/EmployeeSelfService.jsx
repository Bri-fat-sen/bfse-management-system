import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User,
  DollarSign,
  CalendarDays,
  Star,
  GraduationCap,
  Clock,
  Edit,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PersonalInfoEditor from "@/components/employee/PersonalInfoEditor";
import MyPayslips from "@/components/employee/MyPayslips";
import TrainingHistory from "@/components/employee/TrainingHistory";
import LeaveRequestForm from "@/components/employee/LeaveRequestForm";
import PerformanceReviews from "@/components/employee/PerformanceReviews";
import WageClockInOut from "@/components/hr/WageClockInOut";

export default function EmployeeSelfService() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPersonalInfoEditor, setShowPersonalInfoEditor] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const { data: user, isLoading: loadingUser } = useQuery({
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

  const { data: payrolls = [] } = useQuery({
    queryKey: ['myPayrolls', currentEmployee?.id],
    queryFn: () => base44.entities.Payroll.filter({ employee_id: currentEmployee?.id }, '-period_end', 12),
    enabled: !!currentEmployee?.id,
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['myTasks', currentEmployee?.id],
    queryFn: () => base44.entities.Task.filter({ assigned_to: currentEmployee?.id, status: { $ne: 'completed' } }, '-due_date'),
    enabled: !!currentEmployee?.id,
  });

  const { data: upcomingLeave = [] } = useQuery({
    queryKey: ['upcomingLeave', currentEmployee?.id],
    queryFn: async () => {
      const all = await base44.entities.LeaveRequest.filter({ 
        employee_id: currentEmployee?.id, 
        status: 'approved'
      }, '-start_date');
      const today = new Date();
      return all.filter(l => new Date(l.start_date) >= today);
    },
    enabled: !!currentEmployee?.id,
  });

  const currentOrg = organisation?.[0];

  if (loadingUser || (user && loadingEmployee)) {
    return <LoadingSpinner message="Loading My Portal..." subtitle="Fetching your information" />;
  }

  if (!user) {
    return <LoadingSpinner message="Loading My Portal..." subtitle="Fetching your information" />;
  }

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Employee Profile Not Found</h2>
        <p className="text-gray-500">Please contact HR to set up your employee profile.</p>
      </div>
    );
  }

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
  const latestReview = performanceReviews[0];
  const trainingCount = currentEmployee?.training_history?.length || 0;
  const recentPayslips = payrolls.slice(0, 3);
  const pendingTasks = myTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1EB053] via-[#0e7f3d] to-[#0072C6] opacity-95">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Sierra Leone Flag Mini Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-white opacity-40" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-white opacity-40" />
        </div>

        {/* Content */}
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 bg-white rounded-full blur-sm opacity-30" />
              <Avatar className="relative w-28 h-28 border-4 border-white shadow-2xl ring-4 ring-white/20">
                <AvatarImage src={currentEmployee?.profile_photo} />
                <AvatarFallback className="bg-white text-[#1EB053] text-3xl font-bold">
                  {currentEmployee?.full_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{currentEmployee?.full_name || user?.full_name}</h1>
                  <p className="text-white/90 text-lg">{currentEmployee?.position}</p>
                </div>
                <Button 
                  onClick={() => setShowPersonalInfoEditor(true)} 
                  className="bg-white text-[#1EB053] hover:bg-gray-100 shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact Info
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  {currentEmployee?.department || 'N/A'}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                  <User className="w-3 h-3 mr-1" />
                  {currentEmployee?.employee_code}
                </Badge>
                <Badge className="bg-white text-[#0072C6] px-3 py-1 font-semibold">
                  {currentEmployee?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>

            {/* Organization Badge */}
            {currentOrg && (
              <div className="hidden lg:block bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-12 rounded-full bg-gradient-to-b from-[#1EB053] via-white to-[#0072C6]" />
                  <div className="text-white">
                    <p className="text-xs opacity-75">Organization</p>
                    <p className="font-semibold">{currentOrg.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-white opacity-40" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-white opacity-40" />
        </div>
      </div>

      {/* Wage Employee Clock In/Out */}
      {currentEmployee?.employment_type === 'wage' && (
        <WageClockInOut employee={currentEmployee} orgId={orgId} />
      )}

      {/* Modern Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1EB053] to-[#16803d]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{payrolls.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Payslips</p>
            <p className="text-xs text-gray-500 mt-1">Available to view</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0072C6] to-[#005a9e]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6 text-[#0072C6]" />
              </div>
              {pendingLeaves > 0 && (
                <Badge className="bg-amber-100 text-amber-700 animate-pulse">{pendingLeaves}</Badge>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{leaveRequests.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Leave Requests</p>
            <p className="text-xs text-gray-500 mt-1">{pendingLeaves} pending approval</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941e]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {latestReview?.overall_rating ? `${latestReview.overall_rating}/5` : "N/A"}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Performance</p>
            <p className="text-xs text-gray-500 mt-1">{latestReview?.review_period || "No reviews yet"}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{trainingCount}</h3>
            <p className="text-sm text-gray-600 font-medium">Training</p>
            <p className="text-xs text-gray-500 mt-1">Courses completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Tabs with Sierra Leone Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          {/* Top Stripe */}
          <div className="absolute top-0 left-0 right-0 h-0.5 flex">
            <div className="flex-1 bg-[#1EB053]/30" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]/30" />
          </div>

          <TabsList className="bg-white border shadow-sm p-1.5 flex-wrap h-auto gap-1 rounded-xl mt-2">
            <TabsTrigger 
              value="overview" 
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="payslips"
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <DollarSign className="w-4 h-4 mr-2" />
              Payslips
            </TabsTrigger>
            <TabsTrigger 
              value="leave"
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <CalendarDays className="w-4 h-4 mr-2" />
              Leave
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <Star className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="training"
              className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 flex opacity-0 data-[state=active]:opacity-100 transition-opacity rounded-t-lg overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <GraduationCap className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Welcome Message */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {currentEmployee?.first_name || currentEmployee?.full_name?.split(' ')[0]}! 👋
                </h2>
                <p className="text-gray-600">Here's what's happening with your account today.</p>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Leave Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-1 flex">
                  <div className="flex-1 bg-[#1EB053]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#0072C6]" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1EB053]" />
                      </div>
                      <span>Upcoming Leave</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{upcomingLeave.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingLeave.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming leave scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingLeave.slice(0, 3).map((leave) => (
                        <div key={leave.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-gray-900">{leave.leave_type.replace('_', ' ').toUpperCase()}</p>
                            <Badge variant="outline" className="text-xs">{leave.days_requested} days</Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ))}
                      {upcomingLeave.length > 3 && (
                        <Button variant="link" className="w-full text-[#1EB053] p-0" onClick={() => setActiveTab('leave')}>
                          View all {upcomingLeave.length} upcoming leaves →
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Tasks Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-1 flex">
                  <div className="flex-1 bg-[#0072C6]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#1EB053]" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#0072C6]" />
                      </div>
                      <span>My Tasks</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">{pendingTasks}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myTasks.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {myTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{task.title}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Due: {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No deadline'}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {task.priority || 'normal'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {myTasks.length > 3 && (
                        <Link to={createPageUrl('Calendar')} className="block">
                          <Button variant="link" className="w-full text-[#0072C6] p-0">
                            View all {myTasks.length} tasks →
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Payslips Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-1 flex">
                  <div className="flex-1 bg-[#D4AF37]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#1EB053]" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <span>Recent Payslips</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentPayslips.length === 0 ? (
                    <p className="text-sm text-gray-500">No payslips available</p>
                  ) : (
                    <div className="space-y-3">
                      {recentPayslips.map((payroll) => (
                        <div key={payroll.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {format(new Date(payroll.period_end), 'MMMM yyyy')}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Paid: {format(new Date(payroll.payment_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#1EB053]">Le {(payroll.net_pay || 0).toLocaleString()}</p>
                              <Badge className="mt-1 text-xs bg-green-100 text-green-700">
                                {payroll.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="link" className="w-full text-[#D4AF37] p-0" onClick={() => setActiveTab('payslips')}>
                        View all payslips →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Review Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-1 flex">
                  <div className="flex-1 bg-purple-500" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#0072C6]" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <span>Performance</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!latestReview ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No performance reviews yet</p>
                      <p className="text-xs text-gray-400">Your reviews will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-sm text-gray-900">Latest Review</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{latestReview.overall_rating || 'N/A'}</span>
                            <span className="text-xs text-gray-500">/5</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          Period: {latestReview.review_period || 'N/A'}
                        </p>
                        {latestReview.review_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed: {format(new Date(latestReview.review_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <Button variant="link" className="w-full text-purple-600 p-0" onClick={() => setActiveTab('performance')}>
                        View all reviews →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leave Balances Summary */}
            <Card className="border-0 shadow-lg">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1EB053]" />
                  Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Annual Leave</p>
                    <p className="text-2xl font-bold text-[#1EB053]">
                      {currentEmployee?.leave_balances?.annual_days ?? 21}
                    </p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Sick Leave</p>
                    <p className="text-2xl font-bold text-[#0072C6]">
                      {currentEmployee?.leave_balances?.sick_days ?? 10}
                    </p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <p className="text-xs text-gray-600 mb-1">Maternity Leave</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {currentEmployee?.leave_balances?.maternity_days ?? 90}
                    </p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">Paternity Leave</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentEmployee?.leave_balances?.paternity_days ?? 5}
                    </p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1EB053]" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="group p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-0.5">Email Address</p>
                      <p className="font-semibold text-gray-900">{currentEmployee?.email || user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="group p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium mb-0.5">Phone Number</p>
                      <p className="font-semibold text-gray-900">{currentEmployee?.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="group p-4 bg-gradient-to-r from-red-50 to-transparent rounded-xl border border-red-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-red-600 font-medium mb-0.5">Address</p>
                      <p className="font-semibold text-gray-900">{currentEmployee?.address || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-2 hover:bg-gradient-to-r hover:from-[#1EB053] hover:to-[#0072C6] hover:text-white hover:border-transparent transition-all" 
                  onClick={() => setShowPersonalInfoEditor(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact Info
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#0072C6]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#1EB053]" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#0072C6]" />
                  </div>
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="group p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-purple-600 font-medium mb-0.5">Position</p>
                      <p className="font-semibold text-gray-900">{currentEmployee?.position || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="group p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-xl border border-amber-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-amber-600 font-medium mb-0.5">Department</p>
                      <p className="font-semibold text-gray-900">{currentEmployee?.department || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="group p-4 bg-gradient-to-r from-teal-50 to-transparent rounded-xl border border-teal-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-teal-600 font-medium mb-0.5">Hire Date</p>
                      <p className="font-semibold text-gray-900">
                        {currentEmployee?.hire_date ? format(new Date(currentEmployee.hire_date), 'MMMM d, yyyy') : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full -mr-10 -mt-10 opacity-20" />
                  <p className="text-xs text-amber-700 font-bold mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Emergency Contact
                  </p>
                  <p className="font-semibold text-gray-900">{currentEmployee?.emergency_contact || 'Not set'}</p>
                  <p className="text-sm text-gray-700 mt-1">{currentEmployee?.emergency_phone || ''}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="mt-6">
          <MyPayslips 
            employeeId={currentEmployee?.id}
            employee={currentEmployee}
            organisation={currentOrg}
          />
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="mt-6">
          <div className="space-y-6">
            {/* Leave Balances Card */}
            <Card className="border-0 shadow-lg">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1EB053]" />
                  My Leave Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                    <Calendar className="w-6 h-6 text-[#1EB053] mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Annual Leave</p>
                    <p className="text-3xl font-bold text-[#1EB053]">
                      {currentEmployee?.leave_balances?.annual_days ?? 21}
                    </p>
                    <p className="text-xs text-gray-500">days remaining</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <FileText className="w-6 h-6 text-[#0072C6] mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Sick Leave</p>
                    <p className="text-3xl font-bold text-[#0072C6]">
                      {currentEmployee?.leave_balances?.sick_days ?? 10}
                    </p>
                    <p className="text-xs text-gray-500">days remaining</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-100 text-center">
                    <User className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Maternity</p>
                    <p className="text-3xl font-bold text-pink-600">
                      {currentEmployee?.leave_balances?.maternity_days ?? 90}
                    </p>
                    <p className="text-xs text-gray-500">days remaining</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                    <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Paternity</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {currentEmployee?.leave_balances?.paternity_days ?? 5}
                    </p>
                    <p className="text-xs text-gray-500">days remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests Card */}
            <Card className="border-0 shadow-lg">
              <div className="h-1 flex">
                <div className="flex-1 bg-[#0072C6]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#1EB053]" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#0072C6]" />
                  My Leave Requests
                  {pendingLeaves > 0 && (
                    <Badge className="bg-amber-500">{pendingLeaves} pending</Badge>
                  )}
                </CardTitle>
                <Button 
                  size="sm" 
                  className="bg-[#1EB053]"
                  onClick={() => setShowLeaveForm(true)}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Request Leave
                </Button>
              </CardHeader>
              <CardContent>
                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No leave requests yet</p>
                    <Button 
                      size="sm"
                      onClick={() => setShowLeaveForm(true)}
                      className="bg-[#1EB053]"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Request Your First Leave
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.map((leave) => (
                      <div 
                        key={leave.id} 
                        className={`p-4 rounded-lg border-l-4 ${
                          leave.status === 'pending' ? 'bg-amber-50 border-amber-500' :
                          leave.status === 'approved' ? 'bg-green-50 border-green-500' :
                          leave.status === 'rejected' ? 'bg-red-50 border-red-500' :
                          'bg-gray-50 border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900 capitalize">
                                {leave.leave_type.replace('_', ' ')}
                              </p>
                              <Badge className={
                                leave.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {leave.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(leave.start_date), 'MMM d, yyyy')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {leave.days_requested} day{leave.days_requested !== 1 ? 's' : ''}
                              </p>
                              {leave.reason && (
                                <p className="text-sm text-gray-500 mt-2 italic">"{leave.reason}"</p>
                              )}
                              {leave.rejection_reason && (
                                <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                                  <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                                  <p className="text-xs text-red-600 mt-1">{leave.rejection_reason}</p>
                                </div>
                              )}
                              {leave.approved_by_name && leave.status === 'approved' && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Approved by {leave.approved_by_name} on {format(new Date(leave.approval_date), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                          {leave.attachment_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(leave.attachment_url, '_blank')}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Attachment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <PerformanceReviews employeeId={currentEmployee?.id} />
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-6">
          <TrainingHistory employee={currentEmployee} />
        </TabsContent>
      </Tabs>

      {/* Personal Info Editor Dialog */}
      <PersonalInfoEditor
        employee={currentEmployee}
        open={showPersonalInfoEditor}
        onOpenChange={setShowPersonalInfoEditor}
      />

      {/* Leave Request Form Dialog */}
      <LeaveRequestForm
        open={showLeaveForm}
        onOpenChange={setShowLeaveForm}
        employee={currentEmployee}
        orgId={orgId}
      />
    </div>
  );
}