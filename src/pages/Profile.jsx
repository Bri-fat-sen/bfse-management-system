import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  Clock,
  Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import EmployeeSkillsSection from "@/components/hr/EmployeeSkillsSection";
import EmployeePerformanceSection from "@/components/hr/EmployeePerformanceSection";

export default function Profile() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['myAttendance', currentEmployee?.id],
    queryFn: () => base44.entities.Attendance.filter({ employee_id: currentEmployee?.id }, '-date', 30),
    enabled: !!currentEmployee?.id,
  });

  const currentOrg = organisation?.[0];
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const presentDays = attendance.filter(a => a.status === 'present').length;

  const isLoading = loadingUser || (!!user?.email && loadingEmployee);

  if (isLoading) {
    return <LoadingSpinner message="Loading Profile..." subtitle="Fetching your information" fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="View and manage your profile information"
      >
        <Link to={createPageUrl("Settings")}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </PageHeader>

      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 sl-gradient" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col items-center md:items-start md:flex-row md:items-end gap-4 md:gap-6 -mt-16">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
              <AvatarImage src={currentEmployee?.profile_photo} />
              <AvatarFallback className="sl-gradient text-white text-4xl">
                {user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-4 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold">{currentEmployee?.full_name || user?.full_name}</h1>
              <p className="text-gray-500">{currentEmployee?.position || 'Employee'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="sl-gradient">
                  {currentEmployee?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant={currentEmployee?.status === 'active' ? 'secondary' : 'outline'}>
                  {currentEmployee?.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentEmployee?.email || user?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{currentEmployee?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee Code</p>
                    <p className="font-medium">{currentEmployee?.employee_code || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{currentEmployee?.address || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{currentEmployee?.department || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{currentEmployee?.position || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hire Date</p>
                    <p className="font-medium">
                      {currentEmployee?.hire_date 
                        ? format(new Date(currentEmployee.hire_date), 'MMMM d, yyyy')
                        : '-'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salary Type</p>
                    <p className="font-medium capitalize">{currentEmployee?.salary_type || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {currentOrg?.logo_url ? (
                  <img src={currentOrg.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl sl-gradient flex items-center justify-center text-white font-bold text-xl">
                    {currentOrg?.name?.charAt(0) || 'O'}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{currentOrg?.name || 'Organisation'}</p>
                  <p className="text-sm text-gray-500">{currentOrg?.city}, {currentOrg?.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Days Present</span>
                  <span className="font-bold text-[#1EB053]">{presentDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Hours</span>
                  <span className="font-bold text-[#1D5FC3]">{totalHours.toFixed(1)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Avg Hours/Day</span>
                  <span className="font-bold">
                    {presentDays > 0 ? (totalHours / presentDays).toFixed(1) : 0} hrs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {currentEmployee?.emergency_contact ? (
                <div className="space-y-2">
                  <p className="font-medium">{currentEmployee.emergency_contact}</p>
                  <p className="text-sm text-gray-500">{currentEmployee.emergency_phone || 'No phone'}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No emergency contact set</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Skills & Development Section */}
      {currentEmployee && (
        <EmployeeSkillsSection employee={currentEmployee} canEdit={true} />
      )}

      {/* Performance Reviews Section */}
      {currentEmployee && (
        <EmployeePerformanceSection 
          employee={currentEmployee} 
          currentEmployee={currentEmployee}
          orgId={orgId}
          canEdit={['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role)}
        />
      )}
    </div>
  );
}