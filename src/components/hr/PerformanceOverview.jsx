import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Star,
  TrendingUp,
  User,
  FileText,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import EmptyState from "@/components/ui/EmptyState";

const RATING_LABELS = {
  5: { text: "Outstanding", color: "text-green-600 bg-green-100" },
  4: { text: "Exceeds", color: "text-blue-600 bg-blue-100" },
  3: { text: "Meets", color: "text-gray-600 bg-gray-100" },
  2: { text: "Needs Work", color: "text-amber-600 bg-amber-100" },
  1: { text: "Poor", color: "text-red-600 bg-red-100" }
};

export default function PerformanceOverview({ orgId, onViewReview, onCreateReview }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performanceReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  // Calculate stats
  const submittedReviews = reviews.filter(r => r.status === 'submitted');
  const avgRating = submittedReviews.length > 0 
    ? (submittedReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / submittedReviews.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.overall_rating >= 4.5).length,
    4: reviews.filter(r => r.overall_rating >= 3.5 && r.overall_rating < 4.5).length,
    3: reviews.filter(r => r.overall_rating >= 2.5 && r.overall_rating < 3.5).length,
    2: reviews.filter(r => r.overall_rating >= 1.5 && r.overall_rating < 2.5).length,
    1: reviews.filter(r => r.overall_rating < 1.5).length,
  };

  const topPerformers = [...reviews]
    .filter(r => r.status === 'submitted')
    .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{avgRating}</p>
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-[#1EB053]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-3xl font-bold">{reviews.length}</p>
              </div>
              <FileText className="w-8 h-8 text-[#0072C6]" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {reviews.filter(r => r.status === 'draft').length} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Reviews</p>
                <p className="text-3xl font-bold">
                  {employees.length - new Set(reviews.map(r => r.employee_id)).size}
                </p>
              </div>
              <User className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <p className="text-xs text-gray-400 mt-1">employees without reviews</p>
          </CardContent>
        </Card>
      </div>

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
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((review, idx) => (
                  <div key={review.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 1 ? 'bg-gray-200 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.employee_name}</p>
                        <p className="text-xs text-gray-500">{review.review_period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{review.overall_rating?.toFixed(1)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewReview && onViewReview(review)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Performance Reviews"
              description="Create your first performance review to track employee progress"
            />
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 10).map((review) => {
                const ratingLevel = Math.round(review.overall_rating || 3);
                const label = RATING_LABELS[ratingLevel] || RATING_LABELS[3];
                return (
                  <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.employee_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {review.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {review.review_period} • By {review.reviewer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={label.color}>
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {review.overall_rating?.toFixed(1)} - {label.text}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewReview && onViewReview(review)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}