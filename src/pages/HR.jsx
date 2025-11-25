import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  Search,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download
} from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";

export default function HR() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['attendance', orgId, today],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId, date: today }),
    enabled: !!orgId,
  });

  const { data: myAttendance } = useQuery({
    queryKey: ['myAttendance', currentEmployee?.id, today],
    queryFn: () => base44.entities.Attendance.filter({ employee_id: currentEmployee?.id, date: today }),
    enabled: !!currentEmployee?.id,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const myTodayRecord = myAttendance?.[0];

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      return base44.entities.Attendance.create({
        organisation_id: orgId,
        employee_id: currentEmployee.id,
        employee_name: currentEmployee.full_name,
        date: today,
        clock_in_time: format(now, 'HH:mm:ss'),
        status: 'present'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const clockIn = new Date(`${today}T${myTodayRecord.clock_in_time}`);
      const hours = differenceInMinutes(now, clockIn) / 60;
      
      return base44.entities.Attendance.update(myTodayRecord.id, {
        clock_out_time: format(now, 'HH:mm:ss'),
        total_hours: Math.round(hours * 100) / 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
    },
  });

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const presentToday = todayAttendance.filter(a => a.clock_in_time).length;
  const onLeave = todayAttendance.filter(a => a.status === 'leave').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="HR & Payroll" 
        subtitle="Manage employees, attendance, and payroll"
      />

      {/* Clock In/Out Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#0F1F3C] to-[#1D5FC3] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Current Time</p>
                <p className="text-3xl font-bold">{format(new Date(), 'HH:mm:ss')}</p>
                <p className="text-white/70">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {myTodayRecord?.clock_in_time && (
                <div className="text-right mr-6">
                  <p className="text-white/70 text-sm">Clocked In</p>
                  <p className="font-semibold">{myTodayRecord.clock_in_time}</p>
                  {myTodayRecord.clock_out_time && (
                    <>
                      <p className="text-white/70 text-sm mt-1">Clocked Out</p>
                      <p className="font-semibold">{myTodayRecord.clock_out_time}</p>
                    </>
                  )}
                </div>
              )}
              
              {!myTodayRecord?.clock_in_time ? (
                <Button 
                  size="lg"
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending}
                  className="bg-[#1EB053] hover:bg-[#18943f] text-white"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Clock In
                </Button>
              ) : !myTodayRecord?.clock_out_time ? (
                <Button 
                  size="lg"
                  onClick={() => clockOutMutation.mutate()}
                  disabled={clockOutMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Clock Out
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-[#1EB053]" />
                  <span>Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Present Today"
          value={`${presentToday}/${activeEmployees}`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="On Leave"
          value={onLeave}
          icon={Calendar}
          color="gold"
        />
        <StatCard
          title="Active Staff"
          value={activeEmployees}
          icon={Users}
          color="navy"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.filter(e => e.status === 'active').map((emp) => {
                    const record = todayAttendance.find(a => a.employee_id === emp.id);
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={emp.profile_photo} />
                              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white text-xs">
                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{emp.full_name}</p>
                              <p className="text-xs text-gray-500">{emp.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record?.clock_in_time ? (
                            <span className="text-green-600">{record.clock_in_time}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record?.clock_out_time ? (
                            <span className="text-red-600">{record.clock_out_time}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{record?.total_hours?.toFixed(2) || "-"}</TableCell>
                        <TableCell>
                          {record?.clock_in_time ? (
                            record.clock_out_time ? (
                              <Badge className="bg-blue-100 text-blue-800">Complete</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Present</Badge>
                            )
                          ) : record?.status === 'leave' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Absent</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Employees</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search employees..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={emp.profile_photo} />
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white">
                              {emp.first_name?.[0]}{emp.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{emp.full_name}</p>
                            <p className="text-sm text-gray-500">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{emp.employee_code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {emp.role?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{emp.department || "-"}</TableCell>
                      <TableCell className="capitalize">{emp.salary_type}</TableCell>
                      <TableCell>
                        <Badge className={
                          emp.status === 'active' ? "bg-green-100 text-green-800" :
                          emp.status === 'inactive' ? "bg-gray-100 text-gray-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {emp.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowPayrollDialog(true)} className="sl-gradient">
              <DollarSign className="w-4 h-4 mr-2" />
              Generate Payroll
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.employee_name}</TableCell>
                      <TableCell>
                        {payroll.period_start && format(new Date(payroll.period_start), 'MMM d')} - 
                        {payroll.period_end && format(new Date(payroll.period_end), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>Le {payroll.base_salary?.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+Le {payroll.total_allowances?.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-Le {payroll.total_deductions?.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">Le {payroll.net_pay?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          payroll.status === 'paid' ? "bg-green-100 text-green-800" :
                          payroll.status === 'approved' ? "bg-blue-100 text-blue-800" :
                          payroll.status === 'pending_approval' ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {payroll.status?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}