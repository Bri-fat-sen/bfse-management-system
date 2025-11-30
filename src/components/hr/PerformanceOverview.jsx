import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { 
  Star,
  TrendingUp,
  TrendingDown,
  User,
  FileText,
  Eye,
  Filter,
  Download,
  ChevronRight,
  BarChart3,
  Target,
  Award,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/ui/EmptyState";

const RATING_LABELS = {
  5: { text: "Outstanding", color: "text-green-600 bg-green-100", icon: "🌟" },
  4: { text: "Exceeds Expectations", color: "text-blue-600 bg-blue-100", icon: "⭐" },
  3: { text: "Meets Expectations", color: "text-gray-600 bg-gray-100", icon: "✓" },
  2: { text: "Needs Improvement", color: "text-amber-600 bg-amber-100", icon: "⚠️" },
  1: { text: "Below Expectations", color: "text-red-600 bg-red-100", icon: "❌" }
};

const RATING_CATEGORIES = [
  { key: "productivity", label: "Productivity", icon: Target },
  { key: "quality", label: "Quality of Work", icon: Award },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "teamwork", label: "Teamwork", icon: User },
  { key: "communication", label: "Communication", icon: FileText },
  { key: "initiative", label: "Initiative", icon: TrendingUp },
];

export default function PerformanceOverview({ orgId, onViewReview, onCreateReview }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performanceReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  // Get unique periods for filter
  const uniquePeriods = useMemo(() => {
    return [...new Set(reviews.map(r => r.review_period))].filter(Boolean).sort().reverse();
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = !searchTerm || 
        review.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      const matchesPeriod = periodFilter === "all" || review.review_period === periodFilter;
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [reviews, searchTerm, statusFilter, periodFilter]);

  // Calculate stats
  const submittedReviews = reviews.filter(r => r.status === 'submitted' || r.status === 'acknowledged');
  const avgRating = submittedReviews.length > 0 
    ? (submittedReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / submittedReviews.length).toFixed(1)
    : 0;

  // Calculate category averages
  const categoryAverages = useMemo(() => {
    if (submittedReviews.length === 0) return {};
    const totals = {};
    const counts = {};
    
    submittedReviews.forEach(review => {
      if (review.ratings) {
        Object.entries(review.ratings).forEach(([key, value]) => {
          if (value) {
            totals[key] = (totals[key] || 0) + value;
            counts[key] = (counts[key] || 0) + 1;
          }
        });
      }
    });

    const averages = {};
    Object.keys(totals).forEach(key => {
      averages[key] = totals[key] / counts[key];
    });
    return averages;
  }, [submittedReviews]);

  const ratingDistribution = {
    5: reviews.filter(r => r.overall_rating >= 4.5).length,
    4: reviews.filter(r => r.overall_rating >= 3.5 && r.overall_rating < 4.5).length,
    3: reviews.filter(r => r.overall_rating >= 2.5 && r.overall_rating < 3.5).length,
    2: reviews.filter(r => r.overall_rating >= 1.5 && r.overall_rating < 2.5).length,
    1: reviews.filter(r => r.overall_rating < 1.5 && r.overall_rating > 0).length,
  };

  const topPerformers = [...reviews]
    .filter(r => r.status === 'submitted' || r.status === 'acknowledged')
    .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
    .slice(0, 5);

  const needsImprovement = [...reviews]
    .filter(r => (r.status === 'submitted' || r.status === 'acknowledged') && r.overall_rating && r.overall_rating < 3)
    .sort((a, b) => (a.overall_rating || 0) - (b.overall_rating || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-gray-400">
                  {reviews.filter(r => r.status === 'draft').length} drafts
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold">
                  {employees.length - new Set(reviews.map(r => r.employee_id)).size}
                </p>
                <p className="text-xs text-gray-400">employees</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <User className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Acknowledged</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.status === 'acknowledged').length}
                </p>
                <p className="text-xs text-gray-400">by employees</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-1" />
            All Reviews
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  const label = RATING_LABELS[rating];
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-28">
                        <span className="mr-1">{label.icon}</span>
                        <span className="text-xs text-gray-600">{label.text}</span>
                      </div>
                      <Progress value={percentage} className="flex-1 h-3" />
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🏆</span>
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topPerformers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet</p>
                ) : (
                  <div className="space-y-2">
                    {topPerformers.map((review, idx) => (
                      <div 
                        key={review.id} 
                        className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border"
                        onClick={() => onViewReview && onViewReview(review)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-200 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.employee_name}</p>
                            <p className="text-xs text-gray-500">{review.review_period}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-700">{review.overall_rating?.toFixed(1)}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Needs Improvement */}
            {needsImprovement.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                    <span>⚠️</span>
                    Needs Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {needsImprovement.map((review) => (
                      <div 
                        key={review.id} 
                        className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors border border-amber-200"
                        onClick={() => onViewReview && onViewReview(review)}
                      >
                        <div>
                          <p className="font-medium text-sm">{review.employee_name}</p>
                          <p className="text-xs text-gray-500">{review.review_period}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-700">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {review.overall_rating?.toFixed(1)}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet</p>
                ) : (
                  <div className="space-y-2">
                    {reviews.slice(0, 5).map((review) => {
                      const ratingLevel = Math.round(review.overall_rating || 3);
                      const label = RATING_LABELS[ratingLevel] || RATING_LABELS[3];
                      return (
                        <div 
                          key={review.id} 
                          className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border"
                          onClick={() => onViewReview && onViewReview(review)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{review.employee_name}</p>
                              <Badge variant={review.status === 'acknowledged' ? 'default' : 'outline'} className="text-xs">
                                {review.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {review.review_period} • By {review.reviewer_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {review.overall_rating && (
                              <Badge className={label.color + " text-xs"}>
                                {label.icon} {review.overall_rating?.toFixed(1)}
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {uniquePeriods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All Reviews List */}
          <Card>
            <CardContent className="p-0">
              {filteredReviews.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Reviews Found"
                  description="No performance reviews match your filters"
                />
              ) : (
                <div className="divide-y">
                  {filteredReviews.map((review) => {
                    const ratingLevel = Math.round(review.overall_rating || 3);
                    const label = RATING_LABELS[ratingLevel] || RATING_LABELS[3];
                    return (
                      <div 
                        key={review.id} 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onViewReview && onViewReview(review)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{review.employee_name}</p>
                            <Badge variant={
                              review.status === 'acknowledged' ? 'default' : 
                              review.status === 'submitted' ? 'secondary' : 'outline'
                            } className="text-xs capitalize">
                              {review.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {review.review_period} • Reviewed by {review.reviewer_name}
                          </p>
                          {review.review_date && (
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(review.review_date), 'PPP')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {review.overall_rating ? (
                            <div className="text-center">
                              <Badge className={label.color + " px-3 py-1"}>
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {review.overall_rating?.toFixed(1)}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{label.text}</p>
                            </div>
                          ) : (
                            <Badge variant="outline">No Rating</Badge>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {RATING_CATEGORIES.map(category => {
                  const avg = categoryAverages[category.key] || 0;
                  const percentage = (avg / 5) * 100;
                  return (
                    <div key={category.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <span className="text-sm font-bold">{avg ? avg.toFixed(1) : '-'}/5</span>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-3" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Review Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">
                        {employees.length > 0 
                          ? Math.round((new Set(reviews.map(r => r.employee_id)).size / employees.length) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500">Reviewed</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{new Set(reviews.map(r => r.employee_id)).size}</p>
                    <p className="text-xs text-green-700">Employees Reviewed</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xl font-bold text-amber-600">
                      {employees.length - new Set(reviews.map(r => r.employee_id)).size}
                    </p>
                    <p className="text-xs text-amber-700">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Review Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-gray-600">
                      {reviews.filter(r => r.status === 'draft').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Draft</p>
                    <p className="text-xs text-gray-400">In progress</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {reviews.filter(r => r.status === 'submitted').length}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">Submitted</p>
                    <p className="text-xs text-blue-500">Awaiting acknowledgment</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {reviews.filter(r => r.status === 'acknowledged').length}
                    </p>
                    <p className="text-sm text-green-700 mt-1">Acknowledged</p>
                    <p className="text-xs text-green-500">Completed</p>
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