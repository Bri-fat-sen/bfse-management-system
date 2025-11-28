import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, FileText, Calendar, Star, GraduationCap, 
  Clock, Settings
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";

import SelfServiceProfile from "@/components/self-service/SelfServiceProfile";
import SelfServicePayslips from "@/components/self-service/SelfServicePayslips";
import SelfServiceLeave from "@/components/self-service/SelfServiceLeave";
import SelfServicePerformance from "@/components/self-service/SelfServicePerformance";
import SelfServiceTraining from "@/components/self-service/SelfServiceTraining";
import SelfServiceAttendance from "@/components/self-service/SelfServiceAttendance";

export default function EmployeeSelfService() {
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['myEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const employee = employeeData?.[0];

  const { data: organisation } = useQuery({
    queryKey: ['myOrganisation', employee?.organisation_id],
    queryFn: () => base44.entities.Organisation.filter({ id: employee?.organisation_id }),
    enabled: !!employee?.organisation_id,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading || !user) {
    return <LoadingSpinner message="Loading your portal..." subtitle="Please wait" />;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Profile Not Found</h2>
        <p className="text-gray-500 max-w-md">
          Your user account is not linked to an employee profile. Please contact your HR administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Portal"
        subtitle={`Welcome back, ${employee.first_name}`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <User className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="payslips" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Payslips</span>
          </TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Leave</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <Star className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Training</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <SelfServiceProfile employee={employee} organisation={organisation?.[0]} />
        </TabsContent>

        <TabsContent value="payslips" className="mt-6">
          <SelfServicePayslips employee={employee} organisation={organisation?.[0]} />
        </TabsContent>

        <TabsContent value="leave" className="mt-6">
          <SelfServiceLeave employee={employee} />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <SelfServiceAttendance employee={employee} />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <SelfServicePerformance employee={employee} />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <SelfServiceTraining employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}