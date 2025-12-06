import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import {
  Clock,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Building2,
  Filter,
  Download,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import QuickClockIn from "@/components/mobile/QuickClockIn";
import AttendanceReportExport from "@/components/attendance/AttendanceReportExport";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";


const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#EF4444', '#9333EA', '#F59E0B'];

export default function Attendance() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
  const userRole = currentEmployee?.role || (user?.role === 'admin' ? 'super_admin' : 'read_only');
  const canApproveOvertime = ['super_admin', 'org_admin'].includes(userRole);

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: allAttendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['allAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId }, '-date', 1000),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
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

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Get unique departments and locations
  const departments = useMemo(() => {
    const deps = [...new Set(employees.map(e => e.department).filter(Boolean))];
    return deps;
  }, [employees]);

  const locations = useMemo(() => {
    const locs = [...new Set(allAttendance.map(a => a.clock_in_location).filter(Boolean))];
    return locs.slice(0, 20); // Limit to 20 unique locations
  }, [allAttendance]);

  const approveOvertimeMutation = useMutation({
    mutationFn: ({ recordId }) => base44.entities.Attendance.update(recordId, {
      overtime_approved: true,
      overtime_approved_by: currentEmployee?.id,
      overtime_approved_by_name: currentEmployee?.full_name,
      overtime_approval_date: format(new Date(), 'yyyy-MM-dd')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAttendance', orgId] });
      toast.success("Overtime approved", "Overtime hours have been approved for payroll");
    },
    onError: (error) => {
      console.error('Approve overtime error:', error);
      toast.error("Failed to approve overtime", error.message);
    }
  });

  // Handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    switch (range) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'week':
        setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'custom':
        break;
    }
  };

  // Filter attendance by date range, department, and location
  const filteredAttendance = useMemo(() => {
    return allAttendance.filter(a => {
      if (a.date < startDate || a.date > endDate) return false;
      
      if (selectedDepartment !== 'all') {
        const emp = employees.find(e => e.id === a.employee_id);
        if (emp?.department !== selectedDepartment) return false;
      }
      
      if (selectedLocation !== 'all') {
        if (a.clock_in_location !== selectedLocation) return false;
      }
      
      if (searchTerm) {
        const emp = employees.find(e => e.id === a.employee_id);
        if (!emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }
      
      return true;
    });
  }, [allAttendance, startDate, endDate, selectedDepartment, selectedLocation, searchTerm, employees]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = allAttendance.filter(a => a.date === today);
    const presentToday = todayRecords.filter(a => a.status === 'present' || a.clock_in_time);
    const lateToday = todayRecords.filter(a => a.status === 'late');
    const absentToday = employees.filter(e => 
      e.status === 'active' && !todayRecords.some(a => a.employee_id === e.id)
    );

    // Average hours
    const totalHours = filteredAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
    const avgHours = filteredAttendance.length > 0 ? totalHours / filteredAttendance.length : 0;

    // By status
    const byStatus = {
      present: filteredAttendance.filter(a => a.status === 'present').length,
      late: filteredAttendance.filter(a => a.status === 'late').length,
      absent: filteredAttendance.filter(a => a.status === 'absent').length,
      leave: filteredAttendance.filter(a => a.status === 'leave').length,
    };

    // By department
    const byDepartment = {};
    filteredAttendance.forEach(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      const dept = emp?.department || 'Unknown';
      if (!byDepartment[dept]) byDepartment[dept] = { present: 0, late: 0, absent: 0, hours: 0 };
      if (a.status === 'present') byDepartment[dept].present++;
      if (a.status === 'late') byDepartment[dept].late++;
      if (a.status === 'absent') byDepartment[dept].absent++;
      byDepartment[dept].hours += a.total_hours || 0;
    });

    // By location
    const byLocation = {};
    filteredAttendance.forEach(a => {
      const loc = a.clock_in_location || 'Unknown';
      byLocation[loc] = (byLocation[loc] || 0) + 1;
    });

    // Daily trend
    const dailyTrend = {};
    filteredAttendance.forEach(a => {
      if (!dailyTrend[a.date]) dailyTrend[a.date] = { date: a.date, present: 0, late: 0, absent: 0 };
      if (a.status === 'present') dailyTrend[a.date].present++;
      else if (a.status === 'late') dailyTrend[a.date].late++;
      else dailyTrend[a.date].absent++;
    });

    return {
      presentToday: presentToday.length,
      lateToday: lateToday.length,
      absentToday: absentToday.length,
      totalEmployees: employees.filter(e => e.status === 'active').length,
      avgHours: avgHours.toFixed(1),
      totalHours: totalHours.toFixed(1),
      byStatus,
      byDepartment: Object.entries(byDepartment).map(([name, data]) => ({ name, ...data })),
      byLocation: Object.entries(byLocation).map(([name, value]) => ({ name: name.substring(0, 20), value })).slice(0, 10),
      dailyTrend: Object.values(dailyTrend).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [allAttendance, filteredAttendance, employees]);

  const statusPieData = [
    { name: 'Present', value: analytics.byStatus.present, color: '#1EB053' },
    { name: 'Late', value: analytics.byStatus.late, color: '#F59E0B' },
    { name: 'Absent', value: analytics.byStatus.absent, color: '#EF4444' },
    { name: 'On Leave', value: analytics.byStatus.leave, color: '#0072C6' },
  ].filter(d => d.value > 0);

  if (!user) {
    return <LoadingSpinner message="Loading Attendance..." subtitle="Fetching attendance records" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Clock className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingAttendance) {
    return <LoadingSpinner message="Loading Attendance..." subtitle="Fetching attendance records" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="attendance">
      <div className="space-y-6">
        <PageHeader
          title="Attendance Analytics"
          subtitle="Monitor staff attendance across all locations"
        />

        {/* My Clock In/Out Section */}
        {currentEmployee && orgId && (
          <QuickClockIn 
            currentEmployee={currentEmployee}
            orgId={orgId}
            todayAttendance={todayAttendanceData}
          />
        )}

        {/* Today's Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Present Today</p>
                  <p className="text-2xl font-bold text-[#1EB053]">{analytics.presentToday}</p>
                  <p className="text-xs text-gray-500 mt-1">of {analytics.totalEmployees} employees</p>
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
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Late Today</p>
                  <p className="text-2xl font-bold text-[#f59e0b]">{analytics.lateToday}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#f59e0b]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Absent Today</p>
                  <p className="text-2xl font-bold text-red-500">{analytics.absentToday}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#0072C6]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Hours/Day</p>
                  <p className="text-2xl font-bold text-[#0072C6]">{analytics.avgHours} hrs</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#0072C6]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">Period:</span>
              </div>
              <div className="flex gap-2">
                {['today', 'week', 'month', 'custom'].map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange(range)}
                    className={dateRange === range ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
              </div>
              
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-36"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-36"
                  />
                </div>
              )}

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc.substring(0, 30)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 ml-auto"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="by-department" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-1" />
              By Department
            </TabsTrigger>
            <TabsTrigger value="by-location" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-1" />
              By Location
            </TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-1" />
              Records
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* AI Insights */}
            <AIInsightsPanel 
              data={{
                attendance_records: filteredAttendance.slice(0, 100),
                analytics: analytics,
                employees: employees.filter(e => e.status === 'active').slice(0, 20)
              }}
              type="attendance"
              title="AI Attendance Insights"
              orgId={orgId}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyTrend.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'MMM d')} />
                      <YAxis />
                      <Tooltip labelFormatter={(d) => format(parseISO(d), 'MMM d, yyyy')} />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#1EB053" strokeWidth={2} name="Present" />
                      <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} name="Late" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Period Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#1EB053]">{analytics.byStatus.present}</p>
                    <p className="text-sm text-gray-600">Present Days</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-3xl font-bold text-amber-600">{analytics.byStatus.late}</p>
                    <p className="text-sm text-gray-600">Late Arrivals</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{analytics.byStatus.absent}</p>
                    <p className="text-sm text-gray-600">Absent Days</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#0072C6]">{analytics.totalHours}</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Department Tab */}
          <TabsContent value="by-department" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.byDepartment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#1EB053" name="Present" />
                    <Bar dataKey="late" fill="#F59E0B" name="Late" />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.byDepartment.map((dept) => (
                <Card key={dept.name} className="border-t-4 border-t-[#1EB053]">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3">{dept.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Present</span>
                        <Badge className="bg-green-100 text-green-800">{dept.present}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late</span>
                        <Badge className="bg-amber-100 text-amber-800">{dept.late}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Hours</span>
                        <span className="font-semibold">{dept.hours.toFixed(1)} hrs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Location Tab */}
          <TabsContent value="by-location" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clock-ins by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.byLocation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1EB053" />
                        <stop offset="100%" stopColor="#0072C6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.byLocation.slice(0, 8).map((loc, idx) => (
                <Card key={loc.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: `${COLORS[idx % COLORS.length]}20` }}>
                        <MapPin className="w-5 h-5" style={{ color: COLORS[idx % COLORS.length] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{loc.name}</p>
                        <p className="text-sm text-gray-500">{loc.value} clock-ins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attendance Records</CardTitle>
                <AttendanceReportExport 
                  attendance={filteredAttendance}
                  employees={employees}
                  organisation={organisation?.[0]}
                />
              </CardHeader>
              <CardContent>
                {filteredAttendance.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No attendance records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Overtime</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {filteredAttendance.slice(0, 50).map((record) => {
                          const emp = employees.find(e => e.id === record.employee_id);
                          const hasOvertime = (record.overtime_hours || 0) > 0;
                          return (
                           <TableRow key={record.id}>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <Avatar className="w-8 h-8">
                                   <AvatarImage src={emp?.profile_photo} />
                                   <AvatarFallback className="text-xs bg-gray-200">
                                     {record.employee_name?.charAt(0) || 'E'}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div>
                                   <p className="font-medium text-sm">{record.employee_name}</p>
                                   <p className="text-xs text-gray-500">{emp?.department}</p>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell>{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                             <TableCell>{record.clock_in_time || '-'}</TableCell>
                             <TableCell>{record.clock_out_time || '-'}</TableCell>
                             <TableCell>{record.total_hours?.toFixed(1) || '-'}</TableCell>
                             <TableCell>
                               {hasOvertime ? (
                                 <div className="flex items-center gap-2">
                                   <div className="flex flex-col">
                                     <span className="text-sm font-medium">{record.overtime_hours.toFixed(1)} hrs</span>
                                     {record.overtime_approved ? (
                                       <Badge className="bg-green-100 text-green-700 text-xs">Approved</Badge>
                                     ) : (
                                       <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
                                     )}
                                   </div>
                                   {!record.overtime_approved && canApproveOvertime && (
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2"
                                       onClick={() => approveOvertimeMutation.mutate({ recordId: record.id })}
                                       disabled={approveOvertimeMutation.isPending}
                                     >
                                       Approve
                                     </Button>
                                   )}
                                 </div>
                               ) : (
                                 <span className="text-gray-400">-</span>
                               )}
                             </TableCell>
                             <TableCell className="max-w-32 truncate">{record.clock_in_location || '-'}</TableCell>
                             <TableCell>
                               <Badge variant={
                                 record.status === 'present' ? 'secondary' :
                                 record.status === 'late' ? 'outline' : 'destructive'
                               }>
                                 {record.status}
                               </Badge>
                             </TableCell>
                           </TableRow>
                          );
                          })}
                      </TableBody>
                    </Table>
                    {filteredAttendance.length > 50 && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Showing 50 of {filteredAttendance.length} records
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}