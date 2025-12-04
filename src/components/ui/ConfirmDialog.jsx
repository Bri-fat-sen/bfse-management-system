import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, CheckCircle, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sierra Leone themed Confirmation Dialog
 * 
 * Usage:
 * <ConfirmDialog
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   variant="danger" // danger, warning, info, success
 *   onConfirm={() => handleDelete()}
 * />
 */

const variants = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBg: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBg: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-[#0072C6]",
    confirmBg: "bg-[#0072C6] hover:bg-[#005a9e]",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-[#1EB053]",
    confirmBg: "bg-[#1EB053] hover:bg-[#178f43]",
  },
  question: {
    icon: HelpCircle,
    iconBg: "bg-[#0F1F3C]/10",
    iconColor: "text-[#0F1F3C]",
    confirmBg: "bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e]",
  },
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  isLoading = false,
  children,
}) {
  const config = variants[variant] || variants.danger;
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => !isLoading && onOpenChange(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Sierra Leone Flag Stripe - Top */}
              <div className="h-2 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border-b border-gray-100" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={() => !isLoading && onOpenChange(false)}
                  disabled={isLoading}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                    className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                  </motion.div>
                </div>

                {/* Title & Description */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[#0F1F3C] mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>

                {/* Custom content */}
                {children && <div className="mb-6">{children}</div>}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="flex-1 h-11 font-medium border-gray-200 hover:bg-gray-50"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`flex-1 h-11 font-medium text-white ${config.confirmBg}`}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      confirmLabel
                    )}
                  </Button>
                </div>
              </div>

              {/* Sierra Leone Flag Stripe - Bottom */}
              <div className="h-2 flex">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border-t border-gray-100" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [state, setState] = React.useState({
    open: false,
    title: "",
    description: "",
    variant: "danger",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    onConfirm: null,
  });

  const confirm = React.useCallback(({
    title,
    description,
    variant = "danger",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  }) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        description,
        variant,
        confirmLabel,
        cancelLabel,
        onConfirm: () => resolve(true),
      });
    });
  }, []);

  const Dialog = React.useCallback(() => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState(s => ({ ...s, open }))}
      title={state.title}
      description={state.description}
      variant={state.variant}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      onConfirm={state.onConfirm}
    />
  ), [state]);

  return { confirm, Dialog };
}