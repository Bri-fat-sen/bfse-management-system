import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Target, TrendingUp, MessageSquare, Award, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper, FormWrapperHeader, FormWrapperContent } from "./FormWrapper";
import { FormSelect, FormTextarea, FormSection } from "./FormField";
import { FormStepperNavigation } from "./FormStepper";

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
    <FormWrapper maxWidth="3xl">
      <FormWrapperHeader
        icon={Award}
        title="Performance Review"
        subtitle="Evaluate employee performance"
        variant="gold"
        rightContent={
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
        }
      />
      <FormWrapperContent className="p-6">
        {/* Step 1: Select Employee */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FormSection title="Select Employee" description="Choose who you're reviewing">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Employee"
                  icon={User}
                  value={formData.employee_id}
                  onValueChange={(v) => updateField('employee_id', v)}
                  placeholder="Select employee"
                  options={employees.filter(e => e.id !== currentEmployee?.id).map(emp => ({
                    value: emp.id,
                    label: emp.full_name
                  }))}
                />
                <FormSelect
                  label="Review Period"
                  value={formData.review_period}
                  onValueChange={(v) => updateField('review_period', v)}
                  placeholder="Select period"
                  options={REVIEW_PERIODS.map(p => ({ value: p, label: p }))}
                />
              </div>

              {selectedEmployee && (
                <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl flex items-center gap-4 mt-6">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
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
            </FormSection>
          </motion.div>
        )}

        {/* Step 2: Ratings */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FormSection title="Performance Ratings" description="Rate each category from 1-5 stars">
              {/* Overall Score */}
              <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl flex items-center justify-between mb-6">
                <span className="font-medium text-gray-700">Overall Score</span>
                <div className="flex items-center gap-3">
                  <Progress value={parseFloat(overallRating) * 20} className="w-32 h-2" />
                  <span className="text-2xl font-bold text-[#D4AF37]">{overallRating}/5</span>
                </div>
              </div>

              <div className="space-y-4">
                {RATING_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
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
            </FormSection>
          </motion.div>
        )}

        {/* Step 3: Feedback */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FormSection title="Written Feedback" description="Provide detailed comments">
              <div className="space-y-5">
                <FormTextarea
                  label="Strengths"
                  icon={Star}
                  value={formData.strengths}
                  onChange={(e) => updateField('strengths', e.target.value)}
                  placeholder="What does this employee do well? What are their key strengths?"
                />
                <FormTextarea
                  label="Areas for Improvement"
                  icon={TrendingUp}
                  value={formData.areas_for_improvement}
                  onChange={(e) => updateField('areas_for_improvement', e.target.value)}
                  placeholder="What areas need development? How can they improve?"
                />
                <FormTextarea
                  label="Goals for Next Period"
                  icon={Target}
                  value={formData.goals}
                  onChange={(e) => updateField('goals', e.target.value)}
                  placeholder="What should they focus on achieving?"
                />
              </div>
            </FormSection>
          </motion.div>
        )}

        <FormStepperNavigation
          currentStep={step}
          totalSteps={3}
          onPrevious={() => setStep(s => s - 1)}
          onNext={() => setStep(s => s + 1)}
          onSubmit={handleSubmit}
          onCancel={onClose}
          canProceed={step !== 1 || (formData.employee_id && formData.review_period)}
          isLoading={createMutation.isPending}
          submitLabel="Submit Review"
        />
      </FormWrapperContent>
    </FormWrapper>
  );
}