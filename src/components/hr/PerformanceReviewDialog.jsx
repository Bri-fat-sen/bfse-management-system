import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
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
  editingReview = null,
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    review_period: editingReview?.review_period || "",
    ratings: editingReview?.ratings || {
      productivity: 0,
      quality: 0,
      attendance: 0,
      teamwork: 0,
      communication: 0,
      initiative: 0,
    },
    strengths: editingReview?.strengths || "",
    areas_for_improvement: editingReview?.areas_for_improvement || "",
    goals: editingReview?.goals || "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceReviews"] });
      toast({ title: "Performance review saved" });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceReviews"] });
      toast({ title: "Performance review updated" });
      onOpenChange(false);
    },
  });

  const updateRating = (key, value) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, [key]: value },
    });
  };

  const calculateOverall = () => {
    const values = Object.values(formData.ratings).filter((v) => v > 0);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const handleSubmit = (e, status = "draft") => {
    e.preventDefault();

    const data = {
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
      reviewer_id: currentEmployee.id,
      reviewer_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      review_period: formData.review_period,
      review_date: format(new Date(), "yyyy-MM-dd"),
      ratings: formData.ratings,
      overall_rating: parseFloat(calculateOverall()),
      strengths: formData.strengths,
      areas_for_improvement: formData.areas_for_improvement,
      goals: formData.goals,
      status,
    };

    if (editingReview) {
      updateMutation.mutate({ id: editingReview.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Performance Review - {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-6">
          <div>
            <Label>Review Period</Label>
            <Select
              value={formData.review_period}
              onValueChange={(v) => setFormData({ ...formData, review_period: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                <SelectItem value="Annual 2024">Annual 2024</SelectItem>
                <SelectItem value="Annual 2025">Annual 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Performance Ratings</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RATING_CATEGORIES.map((category) => (
                <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{category.label}</span>
                  <StarRating
                    value={formData.ratings[category.key]}
                    onChange={(v) => updateRating(category.key, v)}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
              <span className="font-semibold">Overall Rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{calculateOverall()}</span>
                <span className="text-gray-500">/ 5</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Strengths</Label>
            <Textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="What does this employee do well?"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Areas for Improvement</Label>
            <Textarea
              value={formData.areas_for_improvement}
              onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
              placeholder="What could this employee improve on?"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Goals for Next Period</Label>
            <Textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="What goals should this employee work towards?"
              className="mt-1"
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
              disabled={!formData.review_period || createMutation.isPending || updateMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              className="bg-[#1EB053] hover:bg-green-600"
              onClick={(e) => handleSubmit(e, "submitted")}
              disabled={!formData.review_period || createMutation.isPending || updateMutation.isPending}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}