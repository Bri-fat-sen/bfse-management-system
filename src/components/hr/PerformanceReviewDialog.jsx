import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, X, Check } from "lucide-react";
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
import { useToast } from "@/components/ui/Toast";

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
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [reviewPeriod, setReviewPeriod] = useState("");
  const [ratings, setRatings] = useState({
    productivity: 3,
    quality: 3,
    attendance: 3,
    teamwork: 3,
    communication: 3,
    initiative: 3
  });
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (open) {
      if (editingReview) {
        setReviewPeriod(editingReview.review_period || "");
        setRatings(editingReview.ratings || {
          productivity: 3,
          quality: 3,
          attendance: 3,
          teamwork: 3,
          communication: 3,
          initiative: 3
        });
        setStrengths(editingReview.strengths || "");
        setImprovements(editingReview.areas_for_improvement || "");
        setGoals(editingReview.goals || "");
      } else {
        setReviewPeriod("");
        setRatings({
          productivity: 3,
          quality: 3,
          attendance: 3,
          teamwork: 3,
          communication: 3,
          initiative: 3
        });
        setStrengths("");
        setImprovements("");
        setGoals("");
      }
    }
  }, [open, editingReview]);

  const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast.success("Review saved", "Performance review has been saved successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Create review error:', error);
      toast.error("Failed to save review", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast.success("Review updated", "Performance review has been updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update review error:', error);
      toast.error("Failed to update review", error.message);
    }
  });

  const handleRatingChange = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e, status = "draft") => {
    e.preventDefault();
    
    if (!reviewPeriod) {
      toast.error("Please select a review period");
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

  const primaryColor = '#1EB053';
  const secondaryColor = '#0072C6';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Performance Review</h2>
                <p className="text-white/80 text-xs">{employee?.full_name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <form onSubmit={(e) => handleSubmit(e, "submitted")} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="text-sm">Review Period *</Label>
              <Select value={reviewPeriod} onValueChange={setReviewPeriod}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                  <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                  <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                  <SelectItem value="Annual 2025">Annual 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl text-center">
              <p className="text-xs text-gray-500">Overall Rating</p>
              <p className="text-3xl font-bold text-[#0072C6]">{overallRating.toFixed(1)}</p>
              <p className={`text-xs font-medium ${ratingLabel.color}`}>{ratingLabel.text}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Quick Ratings</Label>
              {RATING_CATEGORIES.map(category => (
                <div key={category.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium">{category.label}</span>
                  <StarRating value={ratings[category.key]} onChange={(val) => handleRatingChange(category.key, val)} />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-sm">Strengths</Label>
              <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Key strengths..." className="mt-1.5" rows={2} />
            </div>

            <div>
              <Label className="text-sm">Areas for Improvement</Label>
              <Textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="Development areas..." className="mt-1.5" rows={2} />
            </div>

            <div>
              <Label className="text-sm">Goals</Label>
              <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Next period goals..." className="mt-1.5" rows={2} />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, "draft")} disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 sm:flex-none sm:w-24 border-[#0072C6] text-[#0072C6]">
              Draft
            </Button>
            <Button type="submit" className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />Submit</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}