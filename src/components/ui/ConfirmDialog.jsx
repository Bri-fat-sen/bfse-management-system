import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Info, CheckCircle, Loader2 } from "lucide-react";

/**
 * Sierra Leone themed Confirm Dialog
 * Provides a professional, branded confirmation experience
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // danger, warning, info, success
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const variants = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonClass: "bg-[#0072C6] hover:bg-[#005a9e] text-white",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonClass: "bg-[#1EB053] hover:bg-[#178f43] text-white",
    },
  };

  const config = variants[variant] || variants.danger;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0 overflow-hidden border-0 max-w-md shadow-2xl">
        {/* Sierra Leone Flag Stripe - Top */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="p-6">
          <AlertDialogHeader className="flex-row items-start gap-4 space-y-0">
            {/* Icon */}
            <div className={`flex-shrink-0 p-3 rounded-full ${config.iconBg}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>

            <div className="flex-1 text-left">
              <AlertDialogTitle className="text-lg font-bold text-[#0F1F3C]">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-gray-600">
                {description}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex-row gap-3 sm:justify-end">
            <AlertDialogCancel
              onClick={handleCancel}
              className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none ${config.buttonClass}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>

        {/* Sierra Leone Flag Stripe - Bottom */}
        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white border-y border-gray-100" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}