import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const RATING_CATEGORIES = [
  { key: "productivity", label: "Productivity" },
  { key: "quality", label: "Quality of Work" },
  { key: "attendance", label: "Attendance & Punctuality" },
  { key: "teamwork", label: "Teamwork" },
  { key: "communication", label: "Communication" },
  { key: "initiative", label: "Initiative" },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star 
            className={`w-5 h-5 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        </button>
      ))}
    </div>
  );
}

export default function PerformanceReviewDialog({ 
  open, 
  onOpenChange, 
  employee,
  currentEmployee,
  orgId,
  editingReview = null 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reviewPeriod, setReviewPeriod] = useState(editingReview?.review_period || "");
  const [ratings, setRatings] = useState(editingReview?.ratings || {
    productivity: 3,
    quality: 3,
    attendance: 3,
    teamwork: 3,
    communication: 3,
    initiative: 3
  });
  const [strengths, setStrengths] = useState(editingReview?.strengths || "");
  const [improvements, setImprovements] = useState(editingReview?.areas_for_improvement || "");
  const [goals, setGoals] = useState(editingReview?.goals || "");

  const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast({ title: "Performance review saved successfully" });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast({ title: "Performance review updated successfully" });
      onOpenChange(false);
    },
  });

  const handleRatingChange = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e, status = "draft") => {
    e.preventDefault();
    
    if (!reviewPeriod) {
      toast({ title: "Please select a review period", variant: "destructive" });
      return;
    }

    const data = {
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
      reviewer_id: currentEmployee.id,
      reviewer_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      review_period: reviewPeriod,
      review_date: format(new Date(), 'yyyy-MM-dd'),
      overall_rating: Math.round(overallRating * 10) / 10,
      ratings,
      strengths,
      areas_for_improvement: improvements,
      goals,
      status
    };

    if (editingReview) {
      updateMutation.mutate({ id: editingReview.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return { text: "Outstanding", color: "text-green-600" };
    if (rating >= 3.5) return { text: "Exceeds Expectations", color: "text-blue-600" };
    if (rating >= 2.5) return { text: "Meets Expectations", color: "text-gray-600" };
    if (rating >= 1.5) return { text: "Needs Improvement", color: "text-amber-600" };
    return { text: "Unsatisfactory", color: "text-red-600" };
  };

  const ratingLabel = getRatingLabel(overallRating);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Performance Review - {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e, "submitted")} className="space-y-6">
          <div>
            <Label>Review Period</Label>
            <Select value={reviewPeriod} onValueChange={setReviewPeriod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                <SelectItem value="Annual 2024">Annual 2024</SelectItem>
                <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                <SelectItem value="Q4 2025">Q4 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overall Rating Display */}
          <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-1">Overall Rating</p>
            <p className="text-4xl font-bold text-[#0072C6]">{overallRating.toFixed(1)}</p>
            <p className={`text-sm font-medium ${ratingLabel.color}`}>{ratingLabel.text}</p>
          </div>

          {/* Rating Categories */}
          <div className="space-y-4">
            <Label>Performance Ratings</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RATING_CATEGORIES.map(category => (
                <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{category.label}</span>
                  <StarRating 
                    value={ratings[category.key]} 
                    onChange={(val) => handleRatingChange(category.key, val)} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Strengths</Label>
            <Textarea 
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="What does this employee do well?"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Areas for Improvement</Label>
            <Textarea 
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="What areas need development?"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Goals for Next Period</Label>
            <Textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What should this employee focus on?"
              className="mt-1"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-green-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}