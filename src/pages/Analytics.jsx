import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  UserMinus,
  Filter,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import {
  GlowLineChart,
  ColorfulBarChart,
  GradientBarChart,
  DonutChart,
  ProgressRing,
  SL_COLORS
} from "@/components/charts/AdvancedCharts";

const COLORS = SL_COLORS.chart;

const SKILL_LEVELS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

export default function Analytics() {
  const [hrTab, setHrTab] = useState("performance");
  
  // HR Filters
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [dateRange, setDateRange] = useState("12");

  // Fetch current user and employee
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

  // Fetch organisation
  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  // Fetch all data
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['allSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 1000),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['allExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ['allReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // HR Analytics Calculations
  const hrDateRangeFilter = useMemo(() => {
    const months = parseInt(dateRange);
    const end = new Date();
    const start = subMonths(end, months);
    return { start, end };
  }, [dateRange]);

  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))];
  }, [employees]);

  const roles = useMemo(() => {
    return [...new Set(employees.map(e => e.role).filter(Boolean))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [employees, department, role]);

  const filteredReviews = useMemo(() => {
    return performanceReviews.filter(review => {
      if (!review.review_date) return false;
      const reviewDate = parseISO(review.review_date);
      if (!isWithinInterval(reviewDate, { start: hrDateRangeFilter.start, end: hrDateRangeFilter.end })) return false;
      
      const emp = employees.find(e => e.id === review.employee_id);
      if (!emp) return false;
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [performanceReviews, employees, department, role, hrDateRangeFilter]);

  const hrMetrics = useMemo(() => {
    const total = filteredEmployees.length;
    const terminated = filteredEmployees.filter(e => e.status === 'terminated').length;
    const turnoverRate = total > 0 ? ((terminated / total) * 100).toFixed(1) : 0;

    const reviewsWithRating = filteredReviews.filter(r => r.overall_rating);
    const avgRating = reviewsWithRating.length > 0
      ? (reviewsWithRating.reduce((sum, r) => sum + r.overall_rating, 0) / reviewsWithRating.length).toFixed(2)
      : 0;

    const employeesWithTraining = filteredEmployees.filter(e => e.training_history?.length > 0);
    const trainingRate = total > 0 ? ((employeesWithTraining.length / total) * 100).toFixed(1) : 0;

    const totalCerts = filteredEmployees.reduce((sum, e) => sum + (e.certifications?.length || 0), 0);

    return { total, turnoverRate, avgRating, trainingRate, totalCerts };
  }, [filteredEmployees, filteredReviews]);

  const performanceTrend = useMemo(() => {
    const monthlyData = {};
    
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const key = format(month, 'MMM yyyy');
      monthlyData[key] = { month: key, avgRating: 0, count: 0, total: 0 };
    }

    filteredReviews.forEach(review => {
      if (!review.review_date || !review.overall_rating) return;
      const month = format(parseISO(review.review_date), 'MMM yyyy');
      if (monthlyData[month]) {
        monthlyData[month].total += review.overall_rating;
        monthlyData[month].count++;
      }
    });

    return Object.values(monthlyData).map(m => ({
      ...m,
      avgRating: m.count > 0 ? (m.total / m.count).toFixed(2) : null
    }));
  }, [filteredReviews, dateRange]);

  const skillDistribution = useMemo(() => {
    const skills = {};
    
    filteredEmployees.forEach(emp => {
      (emp.skills || []).forEach(skill => {
        if (!skills[skill.name]) {
          skills[skill.name] = { name: skill.name, count: 0, totalLevel: 0 };
        }
        skills[skill.name].count++;
        skills[skill.name].totalLevel += SKILL_LEVELS[skill.level] || 1;
      });
    });

    return Object.values(skills)
      .map(s => ({ ...s, avgLevel: (s.totalLevel / s.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEmployees]);

  const departmentPerformance = useMemo(() => {
    const deptData = {};
    
    filteredReviews.forEach(review => {
      const emp = employees.find(e => e.id === review.employee_id);
      if (!emp?.department || !review.overall_rating) return;
      
      if (!deptData[emp.department]) {
        deptData[emp.department] = { department: emp.department, total: 0, count: 0 };
      }
      deptData[emp.department].total += review.overall_rating;
      deptData[emp.department].count++;
    });

    return Object.values(deptData).map(d => ({
      ...d,
      avgRating: (d.total / d.count).toFixed(2)
    }));
  }, [filteredReviews, employees]);

  const trainingByDepartment = useMemo(() => {
    const deptData = {};
    
    filteredEmployees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!deptData[dept]) {
        deptData[dept] = { department: dept, trained: 0, total: 0 };
      }
      deptData[dept].total++;
      if (emp.training_history?.length > 0) {
        deptData[dept].trained++;
      }
    });

    return Object.values(deptData).map(d => ({
      ...d,
      rate: ((d.trained / d.total) * 100).toFixed(0)
    }));
  }, [filteredEmployees]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    filteredReviews.forEach(review => {
      if (review.overall_rating) {
        const rounded = Math.round(review.overall_rating);
        distribution[rounded]++;
      }
    });

    return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
      fill: COLORS[parseInt(rating) - 1]
    }));
  }, [filteredReviews]);

  if (!user || !currentEmployee || !orgId || loadingEmployees) {
    return <LoadingSpinner message="Loading Analytics..." subtitle="Analyzing your business data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="dashboard">
    <div className="space-y-6">
      <PageHeader
        title="HR Analytics"
        subtitle="Employee performance, skills, and training insights"
        icon={<Users className="w-6 h-6" />}
      />

      <div className="space-y-6">
          {/* HR Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 Months</SelectItem>
                    <SelectItem value="6">Last 6 Months</SelectItem>
                    <SelectItem value="12">Last 12 Months</SelectItem>
                    <SelectItem value="24">Last 24 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => { setDepartment("all"); setRole("all"); setDateRange("12"); }}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* HR Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Employees" value={hrMetrics.total} icon={Users} color="blue" />
            <StatCard title="Turnover Rate" value={`${hrMetrics.turnoverRate}%`} icon={UserMinus} color="red" trend={parseFloat(hrMetrics.turnoverRate) < 10 ? "down" : "up"} />
            <StatCard title="Avg Performance" value={`${hrMetrics.avgRating}/5`} icon={Award} color="gold" />
            <StatCard title="Training Rate" value={`${hrMetrics.trainingRate}%`} icon={BookOpen} color="green" />
            <StatCard title="Certifications" value={hrMetrics.totalCerts} icon={Award} color="purple" />
          </div>

          {/* HR Sub-tabs */}
          <Tabs value={hrTab} onValueChange={setHrTab} className="space-y-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="performance" className="data-[state=active]:bg-white">Performance</TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-white">Skills</TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-white">Training</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GlowLineChart 
                      data={performanceTrend}
                      xKey="month"
                      height={300}
                      lines={[{ dataKey: "avgRating", name: "Avg Rating", color: "#1EB053" }]}
                      formatter={(v) => `${v}/5`}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Rating Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ColorfulBarChart 
                      data={ratingDistribution}
                      dataKey="count"
                      xKey="rating"
                      height={300}
                      formatter={(v) => `${v} reviews`}
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Performance by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GradientBarChart 
                      data={departmentPerformance}
                      dataKey="avgRating"
                      xKey="department"
                      height={300}
                      horizontal={true}
                      formatter={(v) => `${v}/5 rating`}
                      barSize={24}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#10B981]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#10B981]">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Top Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GradientBarChart 
                      data={skillDistribution}
                      dataKey="count"
                      xKey="name"
                      height={300}
                      horizontal={true}
                      formatter={(v) => `${v} employees`}
                      barSize={20}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Skill Proficiency Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map((level, i) => {
                        const count = filteredEmployees.reduce((sum, emp) => 
                          sum + (emp.skills || []).filter(s => s.level === level).length, 0
                        );
                        const total = filteredEmployees.reduce((sum, emp) => sum + (emp.skills || []).length, 0);
                        return (
                          <div key={level} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm">
                            <ProgressRing 
                              value={count} 
                              max={total || 1} 
                              size={60} 
                              strokeWidth={5}
                              color={COLORS[i]}
                              secondaryColor={COLORS[(i + 1) % COLORS.length]}
                            />
                            <div className="text-xl font-bold mt-2" style={{ color: COLORS[i] }}>{count}</div>
                            <div className="text-xs text-gray-600 capitalize">{level}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#10B981]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#10B981]">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      Training by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ColorfulBarChart 
                      data={trainingByDepartment}
                      dataKey="trained"
                      xKey="department"
                      height={300}
                      formatter={(v) => `${v} trained`}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Overall Training Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <DonutChart 
                      data={[
                        { name: 'Trained', value: filteredEmployees.filter(e => e.training_history?.length > 0).length },
                        { name: 'Not Trained', value: filteredEmployees.filter(e => !e.training_history?.length).length }
                      ]}
                      height={300}
                      innerRadius={70}
                      outerRadius={110}
                      colors={['#1EB053', '#E5E7EB']}
                      centerValue={`${hrMetrics.trainingRate}%`}
                      centerLabel="Trained"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </div>
    </ProtectedPage>
  );
}