import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  UserMinus,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  GlowLineChart,
  ColorfulBarChart,
  GradientBarChart,
  DonutChart,
  AdvancedRadarChart,
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

export default function HRAnalytics() {
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [dateRange, setDateRange] = useState("12");

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

  const { data: employees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ['allReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Date range calculation
  const dateRangeFilter = useMemo(() => {
    const months = parseInt(dateRange);
    const end = new Date();
    const start = subMonths(end, months);
    return { start, end };
  }, [dateRange]);

  // Get unique departments and roles
  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))];
  }, [employees]);

  const roles = useMemo(() => {
    return [...new Set(employees.map(e => e.role).filter(Boolean))];
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [employees, department, role]);

  // Filter reviews by date range
  const filteredReviews = useMemo(() => {
    return performanceReviews.filter(review => {
      if (!review.review_date) return false;
      const reviewDate = parseISO(review.review_date);
      if (!isWithinInterval(reviewDate, { start: dateRangeFilter.start, end: dateRangeFilter.end })) return false;
      
      const emp = employees.find(e => e.id === review.employee_id);
      if (!emp) return false;
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [performanceReviews, employees, department, role, dateRangeFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
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

  // Performance trend over time
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

  // Skill distribution
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

  // Department performance
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

  // Training completion by department
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

  // Rating distribution
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

  // Skill radar by department
  const skillRadar = useMemo(() => {
    const skillsByDept = {};
    
    filteredEmployees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!skillsByDept[dept]) skillsByDept[dept] = {};
      
      (emp.skills || []).forEach(skill => {
        if (!skillsByDept[dept][skill.name]) {
          skillsByDept[dept][skill.name] = { total: 0, count: 0 };
        }
        skillsByDept[dept][skill.name].total += SKILL_LEVELS[skill.level] || 1;
        skillsByDept[dept][skill.name].count++;
      });
    });

    const allSkills = [...new Set(filteredEmployees.flatMap(e => (e.skills || []).map(s => s.name)))].slice(0, 6);
    
    return allSkills.map(skill => {
      const data = { skill };
      Object.keys(skillsByDept).forEach(dept => {
        const skillData = skillsByDept[dept][skill];
        data[dept] = skillData ? (skillData.total / skillData.count).toFixed(1) : 0;
      });
      return data;
    });
  }, [filteredEmployees]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Analytics"
        subtitle="Employee performance and development insights"
      >
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      {/* Filters */}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Employees"
          value={metrics.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Turnover Rate"
          value={`${metrics.turnoverRate}%`}
          icon={UserMinus}
          color="red"
          trend={parseFloat(metrics.turnoverRate) < 10 ? "down" : "up"}
          trendValue={parseFloat(metrics.turnoverRate) < 10 ? "Good" : "High"}
        />
        <StatCard
          title="Avg Performance"
          value={`${metrics.avgRating}/5`}
          icon={Award}
          color="gold"
        />
        <StatCard
          title="Training Rate"
          value={`${metrics.trainingRate}%`}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Certifications"
          value={metrics.totalCerts}
          icon={Award}
          color="purple"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Performance
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Skills
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trend */}
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

            {/* Rating Distribution */}
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

            {/* Department Performance */}
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
            {/* Top Skills */}
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

            {/* Skill Radar */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-[#9333EA]/5 to-[#EC4899]/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899]">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  Skills by Department
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {skillRadar.length > 0 ? (
                  <AdvancedRadarChart 
                    data={skillRadar}
                    angleKey="skill"
                    height={300}
                    dataKeys={departments.slice(0, 4).map((dept, i) => ({ dataKey: dept, name: dept }))}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No skill data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Level Distribution */}
            <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
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
                      <div key={level} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                        <ProgressRing 
                          value={count} 
                          max={total || 1} 
                          size={80} 
                          strokeWidth={6}
                          color={COLORS[i]}
                          secondaryColor={COLORS[(i + 1) % COLORS.length]}
                        />
                        <div className={`text-2xl font-bold mt-3`} style={{ color: COLORS[i] }}>{count}</div>
                        <div className="text-sm text-gray-600 capitalize mt-1">{level}</div>
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
            {/* Training by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Completion by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trainingByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="trained" fill="#1EB053" name="Trained" stackId="a" />
                    <Bar dataKey="total" fill="#E5E7EB" name="Total" stackId="b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Training Rate Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Training Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Trained', value: filteredEmployees.filter(e => e.training_history?.length > 0).length },
                        { name: 'Not Trained', value: filteredEmployees.filter(e => !e.training_history?.length).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#1EB053" />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Certification Stats */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Certification Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-[#1EB053]">{metrics.totalCerts}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Certifications</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0072C6]/10 to-[#9333EA]/10 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-[#0072C6]">
                      {filteredEmployees.filter(e => e.certifications?.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Certified Employees</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#F59E0B]/10 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-[#D4AF37]">
                      {metrics.total > 0 ? ((filteredEmployees.filter(e => e.certifications?.length > 0).length / metrics.total) * 100).toFixed(0) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Certification Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}