import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Star, TrendingUp, Target, Award, Loader2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const RATING_LABELS = {
  1: { label: 'Needs Improvement', color: 'text-red-600' },
  2: { label: 'Below Expectations', color: 'text-orange-600' },
  3: { label: 'Meets Expectations', color: 'text-yellow-600' },
  4: { label: 'Exceeds Expectations', color: 'text-green-600' },
  5: { label: 'Outstanding', color: 'text-[#1EB053]' }
};

const RATING_CATEGORIES = [
  { key: 'productivity', label: 'Productivity' },
  { key: 'quality', label: 'Quality of Work' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'communication', label: 'Communication' },
  { key: 'initiative', label: 'Initiative' }
];

function StarRating({ rating, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function SelfServicePerformance({ employee }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['myPerformanceReviews', employee?.id],
    queryFn: () => base44.entities.PerformanceReview.filter({ 
      employee_id: employee?.id,
      status: 'submitted'
    }, '-review_date', 10),
    enabled: !!employee?.id,
  });

  // Get latest review for display
  const latestReview = reviews[0];

  // Calculate average ratings across all reviews
  const avgRatings = reviews.length > 0 ? RATING_CATEGORIES.reduce((acc, cat) => {
    const total = reviews.reduce((sum, r) => sum + (r.ratings?.[cat.key] || 0), 0);
    acc[cat.key] = total / reviews.length;
    return acc;
  }, {}) : {};

  const overallAvg = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      {latestReview && (
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Latest Performance Review</h3>
                <p className="text-sm text-gray-500">{latestReview.review_period}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#1EB053]">{latestReview.overall_rating?.toFixed(1)}</div>
                  <StarRating rating={latestReview.overall_rating} />
                </div>
                <Badge className={`${RATING_LABELS[Math.round(latestReview.overall_rating)]?.color} bg-opacity-10`}>
                  {RATING_LABELS[Math.round(latestReview.overall_rating)]?.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ratings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1EB053]" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!latestReview ? (
              <EmptyState
                icon={Star}
                title="No Reviews Yet"
                description="Your performance reviews will appear here"
              />
            ) : (
              <div className="space-y-4">
                {RATING_CATEGORIES.map(cat => {
                  const rating = latestReview.ratings?.[cat.key] || 0;
                  const percentage = (rating / 5) * 100;
                  
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rating} size="sm" />
                          <span className="text-sm text-gray-500">{rating}/5</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback & Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0072C6]" />
              Feedback & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!latestReview ? (
              <div className="text-center text-gray-500 py-8">
                No feedback available
              </div>
            ) : (
              <div className="space-y-4">
                {latestReview.strengths && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Strengths
                    </h4>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      {latestReview.strengths}
                    </p>
                  </div>
                )}
                {latestReview.areas_for_improvement && (
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 mb-1">Areas for Improvement</h4>
                    <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                      {latestReview.areas_for_improvement}
                    </p>
                  </div>
                )}
                {latestReview.goals && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-700 mb-1 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Goals for Next Period
                    </h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {latestReview.goals}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#1EB053]" />
            Review History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No Review History"
              description="Your past performance reviews will be listed here"
            />
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{review.review_period}</p>
                      <p className="text-sm text-gray-500">
                        Reviewed on {format(new Date(review.review_date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-gray-400">by {review.reviewer_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#1EB053]">{review.overall_rating?.toFixed(1)}</span>
                        <StarRating rating={review.overall_rating} size="sm" />
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {RATING_LABELS[Math.round(review.overall_rating)]?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}