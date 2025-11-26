import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Premium 5-Star Wizard Step Indicator
export function WizardSteps({ steps, currentStep, onStepClick, allowNavigation = false }) {
  return (
    <div className="relative mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md h-24 bg-gradient-to-r from-[#1EB053]/5 via-[#D4AF37]/10 to-[#0072C6]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;
          const stepNumber = index + 1;

          return (
            <React.Fragment key={step.id || index}>
              {/* Step Node */}
              <div className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => allowNavigation && onStepClick?.(stepNumber)}
                  disabled={!allowNavigation}
                  className={cn(
                    "relative group transition-all duration-500",
                    allowNavigation && "cursor-pointer"
                  )}
                >
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 w-16 h-16 -m-2 rounded-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] opacity-20 blur-xl animate-pulse" />
                  )}

                  {/* Star rating decoration */}
                  <div className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 flex gap-0.5 transition-all duration-500",
                    isCompleted ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  )}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-2 h-2 transition-all duration-300",
                          isCompleted ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                        )}
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>

                  {/* Main circle */}
                  <div className={cn(
                    "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform",
                    "shadow-lg",
                    isCompleted && "bg-gradient-to-br from-[#1EB053] to-[#178f43] text-white rotate-0 shadow-[#1EB053]/30",
                    isCurrent && "bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-[#0F1F3C] scale-110 shadow-[#D4AF37]/40",
                    !isCompleted && !isCurrent && "bg-white border-2 border-gray-200 text-gray-400 group-hover:border-gray-300 group-hover:shadow-md"
                  )}>
                    {/* Inner shine effect */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent",
                      !isCompleted && !isCurrent && "from-white/0"
                    )} />

                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative"
                      >
                        {StepIcon ? <StepIcon className="w-6 h-6" /> : (
                          <span className="text-lg font-bold">{stepNumber}</span>
                        )}
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-white animate-pulse" />
                      </motion.div>
                    ) : (
                      StepIcon ? <StepIcon className="w-5 h-5" /> : (
                        <span className="text-sm font-semibold">{stepNumber}</span>
                      )
                    )}
                  </div>

                  {/* Step label */}
                  <div className="mt-3 text-center">
                    <p className={cn(
                      "text-xs font-semibold transition-colors duration-300 hidden sm:block",
                      isCurrent && "text-[#D4AF37]",
                      isCompleted && "text-[#1EB053]",
                      !isCompleted && !isCurrent && "text-gray-400"
                    )}>
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-[10px] text-gray-400 mt-0.5 hidden md:block max-w-[80px] mx-auto">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 sm:mx-4 relative -mt-6">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
                    {/* Animated progress */}
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#1EB053] via-[#D4AF37] to-[#0072C6] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  {/* Shine effect on completion */}
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress text */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100">
          <div className="flex gap-0.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i + 1 <= currentStep ? "bg-[#1EB053]" : "bg-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Wizard Navigation Buttons
export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  canProceed = true,
  isLoading = false,
  previousLabel = "Back",
  nextLabel = "Continue",
  submitLabel = "Complete",
  onCancel
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      <Button
        type="button"
        variant="outline"
        onClick={isFirstStep ? onCancel : onPrevious}
        className="gap-2 h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4" />
        {isFirstStep ? "Cancel" : previousLabel}
      </Button>

      <AnimatePresence mode="wait">
        {isLastStep ? (
          <motion.div
            key="submit"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canProceed || isLoading}
              className={cn(
                "gap-2 h-12 px-8 rounded-xl font-semibold text-white",
                "bg-gradient-to-r from-[#1EB053] via-[#D4AF37] to-[#0072C6]",
                "hover:opacity-90 transition-all duration-300",
                "shadow-lg shadow-[#1EB053]/20",
                "disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {submitLabel}
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="next"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className={cn(
                "gap-2 h-12 px-8 rounded-xl font-semibold text-white",
                "bg-gradient-to-r from-[#1EB053] to-[#0072C6]",
                "hover:opacity-90 transition-all duration-300",
                "shadow-lg shadow-[#1EB053]/20",
                "disabled:opacity-50"
              )}
            >
              {nextLabel}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wizard Content Wrapper with Animation
export function WizardContent({ children, stepKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Complete Wizard Form Container
export function WizardForm({
  steps,
  currentStep,
  setCurrentStep,
  onSubmit,
  onCancel,
  isLoading = false,
  canProceed = true,
  children,
  title,
  subtitle,
  icon: Icon
}) {
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="border-0 shadow-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Premium header with 5-star branding */}
      <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C] text-white p-6 overflow-hidden">
        {/* Decorative stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Star
              key={i}
              className="absolute text-white/5 fill-white/5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 12}px`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>

        {/* Sierra Leone flag accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="relative flex items-center gap-4">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
          </div>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8">
        <WizardSteps
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          allowNavigation={false}
        />

        <WizardContent stepKey={currentStep}>
          {children}
        </WizardContent>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={onSubmit}
          onCancel={onCancel}
          canProceed={canProceed}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

export default WizardForm;