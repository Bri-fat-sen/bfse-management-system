import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeNumber } from "@/components/utils/calculations";

export function FormField({ 
  label, 
  icon: Icon, 
  error, 
  required, 
  children, 
  className,
  hint 
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className="text-gray-700 font-medium flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export function FormInput({ 
  label, 
  icon: Icon, 
  error, 
  required,
  hint,
  className,
  inputClassName,
  type,
  min,
  max,
  step,
  ...props 
}) {
  // For number inputs, add better defaults
  const numberProps = type === 'number' ? {
    min: min !== undefined ? min : 0,
    step: step || (type === 'number' ? 'any' : undefined),
    onWheel: (e) => e.target.blur(), // Prevent scroll changing value
  } : {};

  return (
    <FormField label={label} icon={Icon} error={error} required={required} hint={hint} className={className}>
      <Input 
        type={type}
        className={cn(
          "h-11 transition-all focus:ring-2 focus:ring-[#1EB053]/20",
          error && "border-red-500 focus:ring-red-500/20",
          inputClassName
        )} 
        {...numberProps}
        {...props} 
      />
    </FormField>
  );
}

export function FormNumberInput({ 
  label, 
  icon: Icon, 
  error, 
  required,
  hint,
  className,
  inputClassName,
  value,
  onChange,
  min = 0,
  max,
  step = 'any',
  prefix,
  suffix,
  ...props 
}) {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    // Allow empty string for better UX
    if (rawValue === '' || rawValue === '-') {
      onChange?.(e);
      return;
    }
    
    const numValue = safeNumber(rawValue);
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    
    onChange?.(e);
  };

  return (
    <FormField label={label} icon={Icon} error={error} required={required} hint={hint} className={className}>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <Input 
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          onWheel={(e) => e.target.blur()}
          className={cn(
            "h-11 transition-all focus:ring-2 focus:ring-[#1EB053]/20",
            error && "border-red-500 focus:ring-red-500/20",
            prefix && "pl-10",
            suffix && "pr-12",
            inputClassName
          )} 
          {...props} 
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </FormField>
  );
}

export function FormTextarea({ 
  label, 
  icon: Icon, 
  error, 
  required,
  hint,
  className,
  textareaClassName,
  ...props 
}) {
  return (
    <FormField label={label} icon={Icon} error={error} required={required} hint={hint} className={className}>
      <Textarea 
        className={cn(
          "min-h-[100px] transition-all focus:ring-2 focus:ring-[#1EB053]/20",
          error && "border-red-500 focus:ring-red-500/20",
          textareaClassName
        )} 
        {...props} 
      />
    </FormField>
  );
}

export function FormSelect({ 
  label, 
  icon: Icon, 
  error, 
  required,
  hint,
  options = [],
  placeholder,
  className,
  value,
  onValueChange,
  ...props 
}) {
  return (
    <FormField label={label} icon={Icon} error={error} required={required} hint={hint} className={className}>
      <Select value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger className={cn(
          "h-11 transition-all focus:ring-2 focus:ring-[#1EB053]/20",
          error && "border-red-500"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.icon && <span className="mr-2">{opt.icon}</span>}
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export function FormSection({ title, description, children, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function FormCard({ children, className }) {
  return (
    <div className={cn(
      "p-4 bg-gray-50/80 rounded-xl border border-gray-100",
      className
    )}>
      {children}
    </div>
  );
}

export function FormHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="text-center mb-8">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#1EB053]" />
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  cancelLabel = "Cancel", 
  submitLabel = "Submit",
  isLoading = false,
  disabled = false,
  showCancel = true,
  variant = "default" // default, compact, sticky
}) {
  const baseClasses = "flex gap-3";
  const variantClasses = {
    default: "pt-6 border-t mt-6",
    compact: "pt-4",
    sticky: "pt-4 sticky bottom-0 bg-white pb-4 -mx-6 px-6 border-t shadow-lg"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant])}>
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 h-11 px-4 rounded-lg border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || disabled}
        className={cn(
          "flex-1 h-11 px-4 rounded-lg font-medium text-white transition-all",
          "bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : submitLabel}
      </button>
    </div>
  );
}

export function FormRow({ children, cols = 2, className }) {
  return (
    <div className={cn(
      "grid gap-4",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-1 sm:grid-cols-2",
      cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      cols === 4 && "grid-cols-2 sm:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

export function FormDivider({ label }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">{label}</span>
        </div>
      )}
    </div>
  );
}