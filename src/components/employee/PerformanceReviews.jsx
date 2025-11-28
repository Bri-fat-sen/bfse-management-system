import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Star, TrendingUp, Award, Target, Calendar, User,
  ChevronRight, Eye, MessageSquare
} from "lucide-react";

const RATING_LABELS = {
  1: { label: 'Needs Improvement', color: 'text-red-500' },
  2: { label: 'Below Expectations', color: 'text-orange-500' },
  3: { label: 'Meets Expectations', color: 'text-blue-500' },
  4: { label: 'Exceeds Expectations', color: 'text-green-500' },
  5: { label: 'Outstanding', color: 'text-[#1EB053]' }
};

const RATING_CATEGORIES = [
  { key: 'productivity', label: 'Productivity', icon: TrendingUp },
  { key: 'quality', label: 'Work Quality', icon: Star },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'teamwork', label: 'Teamwork', icon: User },
  { key: 'communication', label: 'Communication', icon: MessageSquare },
  { key: 'initiative', label: 'Initiative', icon: Target }
];

export default function PerformanceReviews({ employeeId }) {
  const [selectedReview, setSelectedReview] = useState(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['myPerformanceReviews', employeeId],
    queryFn: () => base44.entities.PerformanceReview.filter({ employee_id: employeeId }, '-review_date', 10),
    enabled: !!employeeId,
  });

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const latestReview = reviews[0];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    acknowledged: 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold text-amber-800">{avgRating || '-'}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(avgRating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-amber-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-200 rounded-full flex items-center justify-center">
                <Award className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-blue-800">{reviews.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Latest Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold text-green-800">{latestReview?.overall_rating || '-'}</p>
                  <span className={`text-sm font-medium ${RATING_LABELS[latestReview?.overall_rating]?.color || 'text-gray-500'}`}>
                    {RATING_LABELS[latestReview?.overall_rating]?.label || 'No review'}
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-full flex items-center justify-center">
                <Star className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0072C6]" />
            Performance Review History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No performance reviews yet</p>
              <p className="text-sm">Your performance reviews will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{review.review_period}</p>
                          <Badge className={statusColors[review.status]}>{review.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Reviewed by {review.reviewer_name}
                          {review.review_date && ` • ${format(new Date(review.review_date), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= (review.overall_rating || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <Button size="icon" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {review.ratings && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {Object.entries(review.ratings).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                            <span className="text-gray-600 capitalize">{key}</span>
                            <span className="font-medium">{value}/5</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Performance Review - {selectedReview?.review_period}
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Reviewer</p>
                    <p className="font-medium">{selectedReview.reviewer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Review Date</p>
                    <p className="font-medium">
                      {selectedReview.review_date ? format(new Date(selectedReview.review_date), 'MMMM d, yyyy') : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <p className="text-sm text-amber-600 font-medium mb-2">Overall Rating</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 ${
                        star <= (selectedReview.overall_rating || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-amber-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-lg font-semibold ${RATING_LABELS[selectedReview.overall_rating]?.color || 'text-gray-500'}`}>
                  {RATING_LABELS[selectedReview.overall_rating]?.label || 'Not Rated'}
                </p>
              </div>

              {/* Category Ratings */}
              {selectedReview.ratings && (
                <div>
                  <h4 className="font-semibold mb-3">Performance Categories</h4>
                  <div className="space-y-3">
                    {RATING_CATEGORIES.map((cat) => {
                      const rating = selectedReview.ratings[cat.key] || 0;
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.key} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <CatIcon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{cat.label}</span>
                              <span className="text-sm font-medium">{rating}/5</span>
                            </div>
                            <Progress value={rating * 20} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback Sections */}
              {selectedReview.strengths && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">💪 Strengths</h4>
                  <p className="text-green-700">{selectedReview.strengths}</p>
                </div>
              )}

              {selectedReview.areas_for_improvement && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">📈 Areas for Improvement</h4>
                  <p className="text-amber-700">{selectedReview.areas_for_improvement}</p>
                </div>
              )}

              {selectedReview.goals && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Goals for Next Period</h4>
                  <p className="text-blue-700">{selectedReview.goals}</p>
                </div>
              )}

              {selectedReview.manager_feedback && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">💬 Manager Feedback</h4>
                  <p className="text-purple-700">{selectedReview.manager_feedback}</p>
                </div>
              )}

              {selectedReview.employee_comments && (
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Your Comments</h4>
                  <p className="text-gray-700">{selectedReview.employee_comments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}