import React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormStepper({ steps, currentStep, onStepClick, className }) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick}
                className={cn(
                  "flex flex-col items-center group transition-all",
                  onStepClick && "cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  "ring-4 ring-transparent",
                  isCompleted && "bg-[#1EB053] text-white shadow-lg shadow-[#1EB053]/30",
                  isCurrent && "bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white shadow-lg ring-[#1EB053]/20",
                  !isCompleted && !isCurrent && "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium hidden sm:block transition-colors",
                  isCurrent && "text-[#1EB053]",
                  isCompleted && "text-gray-600",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}>
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[10px] text-gray-400 hidden md:block">
                    {step.description}
                  </span>
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-3 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      "bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                    )}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function FormStepperNavigation({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onSubmit,
  canProceed = true,
  isLoading = false,
  previousLabel = "Back",
  nextLabel = "Continue",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t">
      <button
        type="button"
        onClick={isFirstStep ? onCancel : onPrevious}
        className={cn(
          "flex items-center gap-2 h-11 px-5 rounded-lg font-medium transition-all",
          "border border-gray-200 text-gray-700 hover:bg-gray-50"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        {isFirstStep ? cancelLabel : previousLabel}
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isLoading}
          className={cn(
            "flex items-center gap-2 h-11 px-6 rounded-lg font-medium text-white transition-all",
            "bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg shadow-[#1EB053]/20"
          )}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {submitLabel}
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 h-11 px-6 rounded-lg font-medium text-white transition-all",
            "bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}