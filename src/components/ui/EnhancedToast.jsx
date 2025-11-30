import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, Sparkles, Loader2 } from "lucide-react";

// Enhanced toast notifications with better visuals and animations
export const showSuccessToast = (message, options = {}) => {
  const { description, action, duration = 4000 } = options;
  
  toast.custom((t) => (
    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-l-[#1EB053] p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#047857] flex items-center justify-center flex-shrink-0 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium text-[#1EB053] hover:text-[#047857] mt-2 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#1EB053] to-[#047857]"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration });
};

export const showErrorToast = (message, options = {}) => {
  const { description, action, duration = 5000 } = options;
  
  toast.custom((t) => (
    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-l-red-500 p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <XCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium text-red-500 hover:text-red-600 mt-2 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-600"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration });
};

export const showWarningToast = (message, options = {}) => {
  const { description, action, duration = 4500 } = options;
  
  toast.custom((t) => (
    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-l-amber-500 p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-2 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration });
};

export const showInfoToast = (message, options = {}) => {
  const { description, action, duration = 4000 } = options;
  
  toast.custom((t) => (
    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-l-[#0072C6] p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] flex items-center justify-center flex-shrink-0 shadow-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium text-[#0072C6] hover:text-[#0F1F3C] mt-2 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#0072C6] to-[#0F1F3C]"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration });
};

export const showLoadingToast = (message, options = {}) => {
  const { description } = options;
  
  return toast.custom((t) => (
    <div className="bg-white rounded-xl shadow-2xl border-l-4 border-l-[#0072C6] p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] flex items-center justify-center flex-shrink-0">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-[#0072C6] to-[#1EB053] animate-pulse" />
      </div>
    </div>
  ), { duration: Infinity });
};

export const showAIToast = (message, options = {}) => {
  const { description, action, duration = 5000 } = options;
  
  toast.custom((t) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-2xl border-l-4 border-l-amber-500 p-4 max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0F1F3C] text-sm flex items-center gap-2">
            <span>AI Assistant</span>
          </p>
          <p className="text-sm text-gray-700 mt-1">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-2 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 h-1 bg-amber-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration });
};

// Confetti celebration toast for major achievements
export const showCelebrationToast = (message, options = {}) => {
  const { description, duration = 6000 } = options;
  
  toast.custom((t) => (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-xl shadow-2xl border-2 border-[#1EB053] p-4 max-w-md animate-in slide-in-from-right relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231EB053' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0 shadow-lg animate-bounce">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#0F1F3C] text-base">{message}</p>
            {description && (
              <p className="text-sm text-gray-700 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#1EB053] via-amber-400 to-[#0072C6]"
            style={{
              animation: `shrink ${duration}ms linear forwards, pulse 2s ease-in-out infinite`
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  ), { duration });
};

// Promise-based toast for async operations
export const showPromiseToast = async (promise, messages) => {
  const { loading, success, error } = messages;
  
  const loadingId = showLoadingToast(loading);
  
  try {
    const result = await promise;
    toast.dismiss(loadingId);
    showSuccessToast(success, {
      description: result?.message || result?.description
    });
    return result;
  } catch (err) {
    toast.dismiss(loadingId);
    showErrorToast(error, {
      description: err?.message || "An unexpected error occurred"
    });
    throw err;
  }
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  ai: showAIToast,
  celebration: showCelebrationToast,
  promise: showPromiseToast
};