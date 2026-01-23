// ============================================
// VALIDATION UTILITIES
// Comprehensive validation helpers for forms and data
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (Sierra Leone format)
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Sierra Leone: typically 8-9 digits, may start with +232
  return /^(\+?232)?[0-9]{8,9}$/.test(cleaned);
}

/**
 * Validate date is not in the future
 */
export function isNotFutureDate(date) {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate <= today;
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
}

/**
 * Validate date range (start before end)
 */
export function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false;
  return new Date(startDate) <= new Date(endDate);
}

/**
 * Validate required field
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate numeric range
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate string length
 */
export function isValidLength(value, minLength, maxLength) {
  if (!value || typeof value !== 'string') return false;
  const length = value.trim().length;
  if (minLength !== undefined && length < minLength) return false;
  if (maxLength !== undefined && length > maxLength) return false;
  return true;
}

/**
 * Validate amount (positive number)
 */
export function isValidAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value) {
  return isInRange(value, 0, 100);
}

/**
 * Validate Sierra Leone TIN (Tax Identification Number)
 */
export function isValidTIN(tin) {
  if (!tin || typeof tin !== 'string') return false;
  // TIN format varies, basic validation
  const cleaned = tin.replace(/[\s\-]/g, '');
  return cleaned.length >= 8 && /^[0-9]+$/.test(cleaned);
}

/**
 * Validate NASSIT number
 */
export function isValidNASSIT(nassit) {
  if (!nassit || typeof nassit !== 'string') return false;
  const cleaned = nassit.replace(/[\s\-]/g, '');
  return cleaned.length >= 6 && /^[A-Z0-9]+$/i.test(cleaned);
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(file, maxSizeInMB = 10) {
  if (!file) return false;
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file type
 */
export function isValidFileType(file, allowedTypes = []) {
  if (!file || allowedTypes.length === 0) return true;
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type);
    }
    return fileType.includes(type);
  });
}

/**
 * Comprehensive form validation
 */
export function validateForm(data, rules) {
  const errors = {};
  
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    // Required check
    if (rule.required && !isRequired(value)) {
      errors[field] = `${rule.label || field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!isRequired(value) && !rule.required) return;
    
    // Email validation
    if (rule.type === 'email' && !isValidEmail(value)) {
      errors[field] = `${rule.label || field} must be a valid email`;
    }
    
    // Phone validation
    if (rule.type === 'phone' && !isValidPhone(value)) {
      errors[field] = `${rule.label || field} must be a valid phone number`;
    }
    
    // Number validation
    if (rule.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors[field] = `${rule.label || field} must be a number`;
      } else {
        if (rule.min !== undefined && num < rule.min) {
          errors[field] = `${rule.label || field} must be at least ${rule.min}`;
        }
        if (rule.max !== undefined && num > rule.max) {
          errors[field] = `${rule.label || field} must be at most ${rule.max}`;
        }
      }
    }
    
    // Date validation
    if (rule.type === 'date') {
      if (rule.notFuture && !isNotFutureDate(value)) {
        errors[field] = `${rule.label || field} cannot be in the future`;
      }
      if (rule.mustBeFuture && !isFutureDate(value)) {
        errors[field] = `${rule.label || field} must be in the future`;
      }
    }
    
    // Length validation
    if (rule.minLength || rule.maxLength) {
      if (!isValidLength(value, rule.minLength, rule.maxLength)) {
        if (rule.minLength && rule.maxLength) {
          errors[field] = `${rule.label || field} must be between ${rule.minLength} and ${rule.maxLength} characters`;
        } else if (rule.minLength) {
          errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
        } else {
          errors[field] = `${rule.label || field} must be at most ${rule.maxLength} characters`;
        }
      }
    }
    
    // Pattern validation
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
      errors[field] = rule.patternMessage || `${rule.label || field} format is invalid`;
    }
    
    // Custom validation function
    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.message) {
    // Common error messages
    if (error.message.includes('network')) return 'Network error. Please check your connection.';
    if (error.message.includes('timeout')) return 'Request timed out. Please try again.';
    if (error.message.includes('permission')) return 'You don\'t have permission for this action.';
    if (error.message.includes('not found')) return 'Resource not found.';
    if (error.message.includes('duplicate')) return 'This record already exists.';
    
    return error.message;
  }
  
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.statusText) return error.response.statusText;
  
  return 'An error occurred. Please try again.';
}

/**
 * Sanitize user input (prevent XSS)
 */
export function sanitizeInput(value) {
  if (!value || typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate stock quantity for sale
 */
export function canSellQuantity(availableStock, requestedQuantity) {
  const available = Number(availableStock) || 0;
  const requested = Number(requestedQuantity) || 0;
  
  return {
    isValid: requested > 0 && requested <= available,
    available,
    requested,
    message: requested > available 
      ? `Insufficient stock. Available: ${available}, Requested: ${requested}`
      : null
  };
}

/**
 * Validate payroll data
 */
export function validatePayrollData(payroll) {
  const errors = [];
  
  if (!payroll.employee_id) errors.push('Employee is required');
  if (!payroll.period_start) errors.push('Period start is required');
  if (!payroll.period_end) errors.push('Period end is required');
  
  if (payroll.period_start && payroll.period_end) {
    if (new Date(payroll.period_start) > new Date(payroll.period_end)) {
      errors.push('Period start must be before period end');
    }
  }
  
  const grossPay = Number(payroll.gross_pay) || 0;
  const netPay = Number(payroll.net_pay) || 0;
  
  if (netPay > grossPay) {
    errors.push('Net pay cannot exceed gross pay');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate expense approval workflow
 */
export function canApproveExpense(expense, currentEmployee) {
  if (!expense || !currentEmployee) return false;
  
  // Super admins and org admins can approve any expense
  if (['super_admin', 'org_admin'].includes(currentEmployee.role)) return true;
  
  // Accountants can approve expenses
  if (currentEmployee.role === 'accountant') return true;
  
  // Managers can approve expenses from their team
  if (expense.recorded_by && currentEmployee.id === expense.manager_id) return true;
  
  return false;
}

/**
 * Validate batch number format
 */
export function isValidBatchNumber(batchNumber) {
  if (!batchNumber || typeof batchNumber !== 'string') return false;
  // Format: BATCH-YYYYMMDD-XXX or similar
  return batchNumber.length >= 5 && /^[A-Z0-9\-]+$/i.test(batchNumber);
}

/**
 * Validate SKU format
 */
export function isValidSKU(sku) {
  if (!sku || typeof sku !== 'string') return false;
  // SKU should be alphanumeric with optional hyphens
  return sku.length >= 3 && /^[A-Z0-9\-]+$/i.test(sku);
}

export default {
  isValidEmail,
  isValidPhone,
  isNotFutureDate,
  isFutureDate,
  isValidDateRange,
  isRequired,
  isInRange,
  isValidLength,
  isValidAmount,
  isValidPercentage,
  isValidTIN,
  isValidNASSIT,
  isValidFileSize,
  isValidFileType,
  validateForm,
  getErrorMessage,
  sanitizeInput,
  canSellQuantity,
  validatePayrollData,
  canApproveExpense,
  isValidBatchNumber,
  isValidSKU,
};