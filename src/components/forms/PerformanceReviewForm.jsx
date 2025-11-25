import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star, Target, TrendingUp, MessageSquare, Award, ChevronLeft, ChevronRight, Check, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const RATING_CATEGORIES = [
  { key: "productivity", label: "Productivity", description: "Quality and quantity of work output", icon: TrendingUp },
  { key: "quality", label: "Work Quality", description: "Accuracy and attention to detail", icon: Award },
  { key: "attendance", label: "Attendance", description: "Punctuality and reliability", icon: Target },
  { key: "teamwork", label: "Teamwork", description: "Collaboration with colleagues", icon: User },
  { key: "communication", label: "Communication", description: "Clarity and effectiveness", icon: MessageSquare },
  { key: "initiative", label: "Initiative", description: "Proactiveness and problem-solving", icon: Star },
];

const RATING_LABELS = {
  1: { label: "Needs Improvement", color: "bg-red-500" },
  2: { label: "Below Expectations", color: "bg-orange-500" },
  3: { label: "Meets Expectations", color: "bg-yellow-500" },
  4: { label: "Exceeds Expectations", color: "bg-green-500" },
  5: { label: "Outstanding", color: "bg-[#1EB053]" },
};

const REVIEW_PERIODS = [
  "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024",
  "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025",
  "Annual 2024", "Annual 2025"
];

export default function PerformanceReviewForm({ orgId, employees = [], currentEmployee, onSuccess, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    employee_id: "",
    review_period: "",
    ratings: {},
    strengths: "",
    areas_for_improvement: "",
    goals: "",
  });

  const selectedEmployee = employees.find(e => e.id === formData.employee_id);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast({ title: "Review Submitted!", description: "Performance review saved successfully" });
      onSuccess?.();
    },
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRating = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value }
    }));
  };

  const overallRating = Object.values(formData.ratings).length > 0
    ? (Object.values(formData.ratings).reduce((a, b) => a + b, 0) / Object.values(formData.ratings).length).toFixed(1)
    : 0;

  const handleSubmit = () => {
    if (!formData.employee_id || !formData.review_period) {
      toast({ title: "Please select employee and review period", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: formData.employee_id,
      employee_name: selectedEmployee?.full_name,
      reviewer_id: currentEmployee?.id,
      reviewer_name: currentEmployee?.full_name,
      review_period: formData.review_period,
      review_date: new Date().toISOString().split('T')[0],
      overall_rating: parseFloat(overallRating),
      ratings: formData.ratings,
      strengths: formData.strengths,
      areas_for_improvement: formData.areas_for_improvement,
      goals: formData.goals,
      status: "submitted",
    });
  };

  const StarRating = ({ value, onChange, category }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(category, star)}
          className="group p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (value || 0)
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'fill-gray-100 text-gray-300 group-hover:fill-[#D4AF37]/30'
            }`}
          />
        </button>
      ))}
      {value && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium text-white ${RATING_LABELS[value].color}`}>
          {RATING_LABELS[value].label}
        </span>
      )}
    </div>
  );

  return (
    <Card className="max-w-3xl mx-auto border-0 shadow-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#D4AF37] via-white to-[#0072C6]" />
      
      <CardHeader className="bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-xl">Performance Review</CardTitle>
              <p className="text-white/70 text-sm mt-0.5">Evaluate employee performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= s ? 'bg-[#D4AF37]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step 1: Select Employee */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Select Employee</h2>
              <p className="text-gray-500 mt-1">Choose who you're reviewing</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-medium">Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => updateField('employee_id', v)}>
                  <SelectTrigger className="mt-1.5 h-12">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.id !== currentEmployee?.id).map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={emp.profile_photo} />
                            <AvatarFallback className="text-xs bg-[#1EB053] text-white">
                              {emp.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {emp.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Review Period</Label>
                <Select value={formData.review_period} onValueChange={(v) => updateField('review_period', v)}>
                  <SelectTrigger className="mt-1.5 h-12">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_PERIODS.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow">
                  <AvatarImage src={selectedEmployee.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl">
                    {selectedEmployee.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedEmployee.full_name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Ratings */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Performance Ratings</h2>
              <p className="text-gray-500 mt-1">Rate each category from 1-5 stars</p>
            </div>

            {/* Overall Score */}
            <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl flex items-center justify-between mb-6">
              <span className="font-medium text-gray-700">Overall Score</span>
              <div className="flex items-center gap-3">
                <Progress value={parseFloat(overallRating) * 20} className="w-32 h-2" />
                <span className="text-2xl font-bold text-[#D4AF37]">{overallRating}/5</span>
              </div>
            </div>

            <div className="space-y-6">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-[#0072C6]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.label}</p>
                        <p className="text-sm text-gray-500">{cat.description}</p>
                      </div>
                    </div>
                    <StarRating
                      value={formData.ratings[cat.key]}
                      onChange={updateRating}
                      category={cat.key}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Feedback */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Written Feedback</h2>
              <p className="text-gray-500 mt-1">Provide detailed comments</p>
            </div>

            <div>
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37]" /> Strengths
              </Label>
              <Textarea
                value={formData.strengths}
                onChange={(e) => updateField('strengths', e.target.value)}
                placeholder="What does this employee do well? What are their key strengths?"
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0072C6]" /> Areas for Improvement
              </Label>
              <Textarea
                value={formData.areas_for_improvement}
                onChange={(e) => updateField('areas_for_improvement', e.target.value)}
                placeholder="What areas need development? How can they improve?"
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1EB053]" /> Goals for Next Period
              </Label>
              <Textarea
                value={formData.goals}
                onChange={(e) => updateField('goals', e.target.value)}
                placeholder="What should they focus on achieving?"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button 
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!formData.employee_id || !formData.review_period)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#0072C6] hover:opacity-90 gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 gap-2"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Review"}
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}