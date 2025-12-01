import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, description, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, description }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, description) => addToast("success", title, description),
    error: (title, description) => addToast("error", title, description),
    warning: (title, description) => addToast("warning", title, description),
    info: (title, description) => addToast("info", title, description),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-white",
      borderColor: "border-l-[#1EB053]",
      iconColor: "text-[#1EB053]",
      gradient: "from-[#1EB053]/5 to-transparent",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-white",
      borderColor: "border-l-red-500",
      iconColor: "text-red-500",
      gradient: "from-red-500/5 to-transparent",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-white",
      borderColor: "border-l-amber-500",
      iconColor: "text-amber-500",
      gradient: "from-amber-500/5 to-transparent",
    },
    info: {
      icon: Info,
      bgColor: "bg-white",
      borderColor: "border-l-[#0072C6]",
      iconColor: "text-[#0072C6]",
      gradient: "from-[#0072C6]/5 to-transparent",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, gradient } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`
        pointer-events-auto ${bgColor} rounded-xl shadow-lg border border-gray-100
        border-l-4 ${borderColor} overflow-hidden
      `}
    >
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-gray-600 mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: "linear" }}
        className={`h-0.5 origin-left ${
          toast.type === "success" ? "bg-[#1EB053]" :
          toast.type === "error" ? "bg-red-500" :
          toast.type === "warning" ? "bg-amber-500" :
          "bg-[#0072C6]"
        }`}
      />
    </motion.div>
  );
}

export default ToastProvider;