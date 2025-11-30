import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, startOfMonth, eachDayOfInterval, parseISO, getDay } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WorkScheduleManager from "@/components/hr/WorkScheduleManager";


export default function WorkSchedules() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['workSchedules', orgId],
    queryFn: () => base44.entities.WorkSchedule.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['monthAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId }, '-date', 500),
    enabled: !!orgId,
  });

  const isLoading = !orgId || loadingEmployees;

  if (isLoading) {
    return <LoadingSpinner message="Loading Work Schedules..." subtitle="Fetching employee schedules" fullScreen={true} />;
  }

  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))];
  }, [employees]);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const activeSchedules = schedules.filter(s => s.is_active);

  // Calculate compliance metrics
  const complianceMetrics = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const monthStart = startOfMonth(today);

    let totalExpectedHours = 0;
    let totalActualHours = 0;
    let onTrackCount = 0;
    let behindCount = 0;
    let noScheduleCount = 0;
    let lateCount = 0;

    activeEmployees.forEach(emp => {
      if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return;

      const schedule = activeSchedules.find(s => s.employee_id === emp.id);
      if (!schedule) {
        noScheduleCount++;
        return;
      }

      const empAttendance = attendance.filter(a => 
        a.employee_id === emp.id && 
        parseISO(a.date) >= weekStart && 
        parseISO(a.date) <= weekEnd
      );

      const weekDays = eachDayOfInterval({ start: weekStart, end: today > weekEnd ? weekEnd : today });
      const expectedDays = weekDays.filter(d => schedule.work_days?.includes(getDay(d))).length;
      const expectedHours = expectedDays * (schedule.expected_hours_per_day || 8);
      const actualHours = empAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);

      totalExpectedHours += expectedHours;
      totalActualHours += actualHours;

      if (actualHours >= expectedHours * 0.9) {
        onTrackCount++;
      } else {
        behindCount++;
      }

      // Count late arrivals
      empAttendance.forEach(a => {
        if (a.clock_in_time && schedule.start_time && a.clock_in_time > schedule.start_time) {
          lateCount++;
        }
      });
    });

    const overallCompliance = totalExpectedHours > 0 
      ? Math.round((totalActualHours / totalExpectedHours) * 100)
      : 0;

    return {
      totalExpectedHours,
      totalActualHours,
      overallCompliance,
      onTrackCount,
      behindCount,
      noScheduleCount,
      lateCount,
      scheduledCount: activeSchedules.length
    };
  }, [activeEmployees, activeSchedules, attendance, selectedDepartment]);

  // Get employee compliance list
  const employeeCompliance = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

    return activeEmployees
      .filter(emp => selectedDepartment === 'all' || emp.department === selectedDepartment)
      .map(emp => {
        const schedule = activeSchedules.find(s => s.employee_id === emp.id);
        const empAttendance = attendance.filter(a => 
          a.employee_id === emp.id && 
          parseISO(a.date) >= weekStart && 
          parseISO(a.date) <= weekEnd
        );

        if (!schedule) {
          return { ...emp, schedule: null, compliance: null };
        }

        const weekDays = eachDayOfInterval({ start: weekStart, end: today > weekEnd ? weekEnd : today });
        const expectedDays = weekDays.filter(d => schedule.work_days?.includes(getDay(d))).length;
        const expectedHours = expectedDays * (schedule.expected_hours_per_day || 8);
        const actualHours = empAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
        const compliance = expectedHours > 0 ? Math.round((actualHours / expectedHours) * 100) : 0;

        return {
          ...emp,
          schedule,
          expectedHours,
          actualHours,
          compliance,
          attendance: empAttendance
        };
      })
      .sort((a, b) => (a.compliance ?? -1) - (b.compliance ?? -1));
  }, [activeEmployees, activeSchedules, attendance, selectedDepartment]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Schedules"
        subtitle="Manage employee schedules and track work hours compliance"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${complianceMetrics.overallCompliance >= 90 ? 'border-l-[#1EB053]' : complianceMetrics.overallCompliance >= 70 ? 'border-l-[#f59e0b]' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Schedule Compliance</p>
                <p className={`text-2xl font-bold ${complianceMetrics.overallCompliance >= 90 ? 'text-[#1EB053]' : complianceMetrics.overallCompliance >= 70 ? 'text-[#f59e0b]' : 'text-red-500'}`}>{complianceMetrics.overallCompliance}%</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${complianceMetrics.overallCompliance >= 90 ? 'bg-green-100' : complianceMetrics.overallCompliance >= 70 ? 'bg-orange-100' : 'bg-red-100'}`}>
                <TrendingUp className={`w-6 h-6 ${complianceMetrics.overallCompliance >= 90 ? 'text-[#1EB053]' : complianceMetrics.overallCompliance >= 70 ? 'text-[#f59e0b]' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">On Track</p>
                <p className="text-2xl font-bold text-[#1EB053]">{complianceMetrics.onTrackCount}</p>
                <p className="text-xs text-gray-500 mt-1">of {activeEmployees.length} employees</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#f59e0b]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Behind Schedule</p>
                <p className="text-2xl font-bold text-[#f59e0b]">{complianceMetrics.behindCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0F1F3C]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">No Schedule</p>
                <p className="text-2xl font-bold text-[#0F1F3C]">{complianceMetrics.noScheduleCount}</p>
                <p className="text-xs text-gray-500 mt-1">Need assignment</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#0F1F3C]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-1" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="schedules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-1" />
            Manage Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeCompliance.map(emp => (
              <Card key={emp.id} className={emp.schedule ? '' : 'border-dashed border-2 border-amber-300'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="bg-gray-200 text-sm">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{emp.full_name}</p>
                      <p className="text-xs text-gray-500">{emp.department}</p>
                    </div>
                    {emp.compliance !== null ? (
                      <Badge className={
                        emp.compliance >= 90 ? 'bg-green-100 text-green-700' :
                        emp.compliance >= 70 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {emp.compliance}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600">No Schedule</Badge>
                    )}
                  </div>

                  {emp.schedule ? (
                    <>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Hours this week</span>
                          <span>{emp.actualHours?.toFixed(1)}h / {emp.expectedHours}h</span>
                        </div>
                        <Progress value={emp.compliance} className="h-1.5" />
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[0, 1, 2, 3, 4, 5, 6].map(day => (
                          <span
                            key={day}
                            className={`flex-1 h-1.5 rounded ${
                              emp.schedule.work_days?.includes(day)
                                ? 'bg-[#1EB053]'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {emp.schedule.start_time} - {emp.schedule.end_time}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-amber-600 mt-2">
                      Assign a schedule to track hours
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <WorkScheduleManager orgId={orgId} employees={activeEmployees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}