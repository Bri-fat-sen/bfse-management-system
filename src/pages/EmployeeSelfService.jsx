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
  Calendar
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

export default function EmployeeSelfService() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPersonalInfoEditor, setShowPersonalInfoEditor] = useState(false);

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

  const { data: payrolls = [] } = useQuery({
    queryKey: ['myPayrolls', currentEmployee?.id],
    queryFn: () => base44.entities.Payroll.filter({ employee_id: currentEmployee?.id }, '-period_end', 12),
    enabled: !!currentEmployee?.id,
  });

  const currentOrg = organisation?.[0];

  if (loadingEmployee || !user) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Portal"
        subtitle="Manage your personal information and view your records"
      >
        <Button onClick={() => setShowPersonalInfoEditor(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Edit className="w-4 h-4 mr-2" />
          Update Info
        </Button>
      </PageHeader>

      {/* Profile Summary Card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={currentEmployee?.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-2xl">
                {currentEmployee?.full_name?.charAt(0) || 'E'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold">{currentEmployee?.full_name || user?.full_name}</h2>
              <p className="text-gray-500">{currentEmployee?.position} • {currentEmployee?.department}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                  {currentEmployee?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline">{currentEmployee?.employee_code}</Badge>
              </div>
            </div>
            <div className="hidden md:block text-right pb-2">
              <p className="text-sm text-gray-500">{currentOrg?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Payslips"
          value={payrolls.length}
          subtitle="Available to view"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Leave Requests"
          value={`${pendingLeaves} Pending`}
          subtitle={`${leaveRequests.length} total`}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          title="Performance"
          value={latestReview?.overall_rating ? `${latestReview.overall_rating}/5` : "N/A"}
          subtitle={latestReview?.review_period || "No reviews"}
          icon={Star}
          color="gold"
        />
        <StatCard
          title="Trainings"
          value={trainingCount}
          subtitle="Completed"
          icon={GraduationCap}
          color="purple"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex-wrap h-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <User className="w-4 h-4 mr-1" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="payslips" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-1" />
            Payslips
          </TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <CalendarDays className="w-4 h-4 mr-1" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Star className="w-4 h-4 mr-1" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-1" />
            Training
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1EB053]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{currentEmployee?.email || user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{currentEmployee?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium">{currentEmployee?.address || 'Not set'}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setShowPersonalInfoEditor(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Personal Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0072C6]" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="font-medium">{currentEmployee?.position || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{currentEmployee?.department || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-gray-500">Hire Date</p>
                    <p className="font-medium">
                      {currentEmployee?.hire_date ? format(new Date(currentEmployee.hire_date), 'MMMM d, yyyy') : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium mb-1">Emergency Contact</p>
                  <p className="font-medium text-amber-800">{currentEmployee?.emergency_contact || 'Not set'}</p>
                  <p className="text-sm text-amber-700">{currentEmployee?.emergency_phone || ''}</p>
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
          <LeaveRequestForm 
            employee={currentEmployee}
            orgId={orgId}
          />
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
    </div>
  );
}