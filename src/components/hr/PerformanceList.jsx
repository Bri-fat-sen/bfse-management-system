import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Star, Plus, FileText, User } from "lucide-react";
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
import PerformanceReviewDialog from "./PerformanceReviewDialog";
import EmptyState from "@/components/ui/EmptyState";

const RATING_COLORS = {
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-amber-500",
  4: "text-green-500",
  5: "text-emerald-600",
};

export default function PerformanceList({ employees, currentEmployee, orgId, isManager = false }) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [periodFilter, setPeriodFilter] = useState("all");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performanceReviews', orgId, isManager],
    queryFn: () => isManager
      ? base44.entities.PerformanceReview.filter({ organisation_id: orgId }, '-review_date', 100)
      : base44.entities.PerformanceReview.filter({ employee_id: currentEmployee?.id }, '-review_date', 20),
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const filteredReviews = reviews.filter(r =>
    periodFilter === "all" || r.review_period === periodFilter
  );

  const periods = [...new Set(reviews.map(r => r.review_period))];

  const handleNewReview = (employee) => {
    setSelectedEmployee(employee);
    setShowReviewDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>{period}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isManager && (
          <Select onValueChange={(employeeId) => {
            const emp = employees.find(e => e.id === employeeId);
            if (emp) handleNewReview(emp);
          }}>
            <SelectTrigger className="w-48">
              <Plus className="w-4 h-4 mr-2" />
              <SelectValue placeholder="New Review" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Performance Reviews"
          description={isManager ? "No reviews have been submitted yet" : "You don't have any performance reviews yet"}
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#0072C6]" />
                    </div>
                    <div>
                      <p className="font-semibold">{review.employee_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline">{review.review_period}</Badge>
                        <Badge className={
                          review.status === "submitted" ? "bg-green-100 text-green-700" :
                          review.status === "acknowledged" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Reviewed by {review.reviewer_name} on {format(new Date(review.review_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className={`w-5 h-5 fill-current ${RATING_COLORS[Math.round(review.overall_rating)] || "text-gray-400"}`} />
                        <span className={`text-2xl font-bold ${RATING_COLORS[Math.round(review.overall_rating)] || "text-gray-600"}`}>
                          {review.overall_rating?.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Overall</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                
                {/* Rating breakdown */}
                {review.ratings && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.entries(review.ratings).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Star className={`w-3 h-3 fill-current ${RATING_COLORS[value] || "text-gray-300"}`} />
                          <span className="text-sm font-medium">{value || "-"}</span>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedEmployee && (
        <PerformanceReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          employee={selectedEmployee}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />
      )}
    </div>
  );
}