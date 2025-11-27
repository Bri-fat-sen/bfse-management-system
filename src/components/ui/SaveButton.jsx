import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function SaveButton({ 
  isLoading = false, 
  isSaved = false,
  children = "Save",
  loadingText = "Saving...",
  savedText = "Saved!",
  className = "",
  ...props 
}) {
  return (
    <Button 
      disabled={isLoading} 
      className={`relative min-w-[120px] transition-all ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
            <div 
              className="absolute inset-[3px] rounded-full border-2 border-transparent border-t-white/70 animate-spin" 
              style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
            ></div>
          </div>
          <span>{loadingText}</span>
        </div>
      ) : isSaved ? (
        <div className="flex items-center gap-2 text-white">
          <Check className="w-4 h-4" />
          <span>{savedText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

// Hook for managing save state
export function useSaveState(duration = 1500) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const startSaving = () => {
    setIsLoading(true);
    setIsSaved(false);
  };

  const finishSaving = () => {
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), duration);
  };

  const resetState = () => {
    setIsLoading(false);
    setIsSaved(false);
  };

  return { isLoading, isSaved, startSaving, finishSaving, resetState };
}

// Inline mini spinner for smaller contexts
export function MiniSpinner({ className = "" }) {
  return (
    <div className={`relative w-4 h-4 ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#1EB053] animate-spin"></div>
    </div>
  );
}

// Loading overlay for dialogs/forms
export function FormLoadingOverlay({ isVisible, message = "Saving..." }) {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1EB053] animate-spin"></div>
        <div 
          className="absolute inset-1 rounded-full border-4 border-transparent border-t-white animate-spin" 
          style={{ animationDuration: '1s', animationDirection: 'reverse' }}
        ></div>
        <div 
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#0072C6] animate-spin" 
          style={{ animationDuration: '1.5s' }}
        ></div>
      </div>
      <p className="text-gray-700 font-medium">{message}</p>
      <div className="flex h-1 w-16 rounded-full overflow-hidden mt-2">
        <div className="flex-1 bg-[#1EB053]"></div>
        <div className="flex-1 bg-white border-y border-gray-200"></div>
        <div className="flex-1 bg-[#0072C6]"></div>
      </div>
    </div>
  );
}