import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Bell } from "lucide-react";
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
  const maxToasts = 5;

  const addToast = useCallback((type, title, description, options = {}) => {
    const { duration = 4000, action, actionLabel } = options;
    const id = Date.now() + Math.random();
    
    setToasts(prev => {
      const newToasts = [...prev, { id, type, title, description, action, actionLabel, createdAt: Date.now() }];
      // Keep only the latest maxToasts
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
    
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

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = {
    success: (title, description, options) => addToast("success", title, description, options),
    error: (title, description, options) => addToast("error", title, description, { duration: 6000, ...options }),
    warning: (title, description, options) => addToast("warning", title, description, options),
    info: (title, description, options) => addToast("info", title, description, options),
    notify: (title, description, options) => addToast("notify", title, description, options),
    clearAll,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} onClearAll={clearAll} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove, onClearAll }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.length > 2 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClearAll}
            className="pointer-events-auto self-end text-xs text-gray-500 hover:text-gray-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200 transition-colors"
          >
            Clear all ({toasts.length})
          </motion.button>
        )}
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={onRemove} 
            index={index}
            total={toasts.length}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove, index, total }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.type === "error" ? 6000 : 4000;

  useEffect(() => {
    if (isPaused) return;
    
    const startTime = Date.now();
    const initialProgress = progress;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = initialProgress - (elapsed / duration) * 100;
      setProgress(Math.max(0, remaining));
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, duration]);

  const config = {
    success: {
      icon: CheckCircle2,
      borderColor: "border-l-[#1EB053]",
      iconColor: "text-[#1EB053]",
      iconBg: "bg-[#1EB053]/10",
      progressColor: "bg-[#1EB053]",
      gradient: "from-[#1EB053]/5 via-transparent to-transparent",
    },
    error: {
      icon: AlertCircle,
      borderColor: "border-l-red-500",
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      progressColor: "bg-red-500",
      gradient: "from-red-500/5 via-transparent to-transparent",
    },
    warning: {
      icon: AlertTriangle,
      borderColor: "border-l-amber-500",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      progressColor: "bg-amber-500",
      gradient: "from-amber-500/5 via-transparent to-transparent",
    },
    info: {
      icon: Info,
      borderColor: "border-l-[#0072C6]",
      iconColor: "text-[#0072C6]",
      iconBg: "bg-[#0072C6]/10",
      progressColor: "bg-[#0072C6]",
      gradient: "from-[#0072C6]/5 via-transparent to-transparent",
    },
    notify: {
      icon: Bell,
      borderColor: "border-l-[#0F1F3C]",
      iconColor: "text-[#0F1F3C]",
      iconBg: "bg-[#0F1F3C]/10",
      progressColor: "bg-[#0F1F3C]",
      gradient: "from-[#0F1F3C]/5 via-transparent to-transparent",
    },
  };

  const { icon: Icon, borderColor, iconColor, iconBg, progressColor, gradient } = config[toast.type] || config.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1 - (total - 1 - index) * 0.02,
      }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-100/80
        border-l-4 ${borderColor} overflow-hidden backdrop-blur-sm
        hover:shadow-2xl transition-shadow duration-200
      `}
    >
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-start gap-3">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
            className={`flex-shrink-0 p-2 rounded-lg ${iconBg}`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </motion.div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-gray-500 mt-1 leading-snug">{toast.description}</p>
            )}
            {toast.action && toast.actionLabel && (
              <button
                onClick={() => {
                  toast.action();
                  onRemove(toast.id);
                }}
                className={`mt-2 text-sm font-medium ${iconColor} hover:underline`}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1.5 -m-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <motion.div
          className={`h-full ${progressColor} origin-left`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
}

export default ToastProvider;