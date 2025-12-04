import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Bell, Loader2, ExternalLink } from "lucide-react";
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
    const { duration = 4000, action, actionLabel, link, linkLabel, icon, persistent = false } = options;
    const id = Date.now() + Math.random();
    
    setToasts(prev => {
      const newToasts = [...prev, { 
        id, type, title, description, action, actionLabel, 
        link, linkLabel, icon, persistent,
        duration: persistent ? 0 : duration,
        createdAt: Date.now() 
      }];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
    
    if (duration > 0 && !persistent) {
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

  const update = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toast = {
    success: (title, description, options) => addToast("success", title, description, options),
    error: (title, description, options) => addToast("error", title, description, { duration: 6000, ...options }),
    warning: (title, description, options) => addToast("warning", title, description, { duration: 5000, ...options }),
    info: (title, description, options) => addToast("info", title, description, options),
    notify: (title, description, options) => addToast("notify", title, description, options),
    loading: (title, description) => addToast("loading", title, description, { persistent: true }),
    promise: async (promise, { loading, success, error }) => {
      const id = addToast("loading", loading.title, loading.description, { persistent: true });
      try {
        const result = await promise;
        update(id, { type: "success", title: success.title, description: success.description, persistent: false, duration: 4000 });
        setTimeout(() => removeToast(id), 4000);
        return result;
      } catch (e) {
        update(id, { type: "error", title: error.title, description: error.description || e.message, persistent: false, duration: 6000 });
        setTimeout(() => removeToast(id), 6000);
        throw e;
      }
    },
    update,
    dismiss: removeToast,
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
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.length > 2 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClearAll}
            className="pointer-events-auto self-end text-xs text-white bg-[#0F1F3C] hover:bg-[#1a2d52] px-3 py-1.5 rounded-full shadow-lg transition-colors"
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
  const progressRef = useRef(100);
  const duration = toast.duration || (toast.type === "error" ? 6000 : toast.type === "warning" ? 5000 : 4000);

  useEffect(() => {
    if (isPaused || toast.persistent || toast.type === "loading") return;
    
    const startTime = Date.now();
    const initialProgress = progressRef.current;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = initialProgress - (elapsed / duration) * 100;
      const newProgress = Math.max(0, remaining);
      progressRef.current = newProgress;
      setProgress(newProgress);
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused, duration, toast.persistent, toast.type]);

  const config = {
    success: {
      icon: CheckCircle2,
      borderColor: "border-l-[#1EB053]",
      iconColor: "text-[#1EB053]",
      iconBg: "bg-[#1EB053]/10",
      progressColor: "bg-gradient-to-r from-[#1EB053] to-[#16803d]",
      gradient: "from-[#1EB053]/8 via-[#1EB053]/3 to-transparent",
      ring: "ring-[#1EB053]/20",
    },
    error: {
      icon: AlertCircle,
      borderColor: "border-l-red-500",
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      progressColor: "bg-gradient-to-r from-red-500 to-red-600",
      gradient: "from-red-500/8 via-red-500/3 to-transparent",
      ring: "ring-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      borderColor: "border-l-amber-500",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      progressColor: "bg-gradient-to-r from-amber-500 to-amber-600",
      gradient: "from-amber-500/8 via-amber-500/3 to-transparent",
      ring: "ring-amber-500/20",
    },
    info: {
      icon: Info,
      borderColor: "border-l-[#0072C6]",
      iconColor: "text-[#0072C6]",
      iconBg: "bg-[#0072C6]/10",
      progressColor: "bg-gradient-to-r from-[#0072C6] to-[#005a9e]",
      gradient: "from-[#0072C6]/8 via-[#0072C6]/3 to-transparent",
      ring: "ring-[#0072C6]/20",
    },
    notify: {
      icon: Bell,
      borderColor: "border-l-[#0F1F3C]",
      iconColor: "text-[#0F1F3C]",
      iconBg: "bg-[#0F1F3C]/10",
      progressColor: "bg-gradient-to-r from-[#0F1F3C] to-[#1a2d52]",
      gradient: "from-[#0F1F3C]/8 via-[#0F1F3C]/3 to-transparent",
      ring: "ring-[#0F1F3C]/20",
    },
    loading: {
      icon: Loader2,
      borderColor: "border-l-[#0072C6]",
      iconColor: "text-[#0072C6]",
      iconBg: "bg-[#0072C6]/10",
      progressColor: "bg-gradient-to-r from-[#0072C6] to-[#1EB053]",
      gradient: "from-[#0072C6]/8 via-[#1EB053]/3 to-transparent",
      ring: "ring-[#0072C6]/20",
      spin: true,
    },
  };

  const toastConfig = config[toast.type] || config.info;
  const Icon = toast.icon || toastConfig.icon;
  const { borderColor, iconColor, iconBg, progressColor, gradient, ring, spin } = toastConfig;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, y: -10, filter: "blur(8px)" }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        filter: "blur(0px)",
        scale: 1 - (total - 1 - index) * 0.015,
      }}
      exit={{ opacity: 0, x: 80, scale: 0.9, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl 
        shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50
        border-l-4 ${borderColor} overflow-hidden
        hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300
        ring-1 ${ring}
      `}
    >
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-start gap-3">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
            className={`flex-shrink-0 p-2.5 rounded-xl ${iconBg} shadow-sm`}
          >
            <Icon className={`w-4 h-4 ${iconColor} ${spin ? 'animate-spin' : ''}`} />
          </motion.div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
            {toast.description && (
              <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{toast.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 empty:mt-0">
              {toast.action && toast.actionLabel && (
                <button
                  onClick={() => {
                    toast.action();
                    onRemove(toast.id);
                  }}
                  className={`text-sm font-semibold ${iconColor} hover:underline underline-offset-2`}
                >
                  {toast.actionLabel}
                </button>
              )}
              {toast.link && (
                <a
                  href={toast.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium ${iconColor} hover:underline underline-offset-2 flex items-center gap-1`}
                >
                  {toast.linkLabel || "View"} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(toast.id);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-2 rounded-lg cursor-pointer z-10 relative"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {!toast.persistent && toast.type !== "loading" && (
        <div className="h-1 bg-gray-100/50">
          <motion.div
            className={`h-full ${progressColor} origin-left`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Loading indicator */}
      {toast.type === "loading" && (
        <div className="h-1 bg-gray-100/50 overflow-hidden">
          <motion.div
            className={`h-full w-1/3 ${progressColor}`}
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default ToastProvider;