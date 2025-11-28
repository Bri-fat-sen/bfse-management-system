// Sierra Leone Payroll Calculator
// All amounts in SLE (Sierra Leonean Leone)

// ============================================
// STATUTORY RATES (2024)
// ============================================

// NASSIT (National Social Security and Insurance Trust)
export const NASSIT_EMPLOYEE_RATE = 0.05;  // 5% employee contribution
export const NASSIT_EMPLOYER_RATE = 0.10;  // 10% employer contribution

// PAYE Tax Brackets (Annual Income)
export const SL_TAX_BRACKETS = [
  { min: 0, max: 500000, rate: 0, label: "0%" },
  { min: 500001, max: 1000000, rate: 0.15, label: "15%" },
  { min: 1000001, max: 1500000, rate: 0.20, label: "20%" },
  { min: 1500001, max: 2000000, rate: 0.25, label: "25%" },
  { min: 2000001, max: Infinity, rate: 0.30, label: "30%" }
];

// Overtime Multipliers
export const OVERTIME_MULTIPLIERS = {
  regular: 1.5,      // Regular overtime (time-and-a-half)
  weekend: 2.0,      // Weekend work (double time)
  holiday: 2.5,      // Public holiday work
  night: 1.25        // Night shift differential
};

// Role-based bonus configurations
export const ROLE_BONUS_CONFIG = {
  driver: {
    allowances: [
      { name: "Fuel Allowance", percentage: 0.05 },
      { name: "Risk Allowance", percentage: 0.03 }
    ],
    bonusEligible: ["performance", "attendance", "sales_commission"]
  },
  vehicle_sales: {
    allowances: [
      { name: "Communication Allowance", percentage: 0.02 }
    ],
    bonusEligible: ["performance", "sales_commission"]
  },
  retail_cashier: {
    allowances: [
      { name: "Meal Allowance", fixed: 50000 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  warehouse_manager: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", percentage: 0.05 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  hr_admin: {
    allowances: [
      { name: "Administrative Allowance", percentage: 0.05 }
    ],
    bonusEligible: ["performance"]
  },
  accountant: {
    allowances: [
      { name: "Professional Allowance", percentage: 0.08 }
    ],
    bonusEligible: ["performance"]
  },
  support_staff: {
    allowances: [
      { name: "Meal Allowance", fixed: 30000 }
    ],
    bonusEligible: ["attendance"]
  },
  org_admin: {
    allowances: [
      { name: "Executive Allowance", percentage: 0.15 },
      { name: "Transport Allowance", percentage: 0.10 }
    ],
    bonusEligible: ["performance"]
  },
  super_admin: {
    allowances: [],
    bonusEligible: []
  }
};

// Common allowances
export const COMMON_ALLOWANCES = [
  { name: "Transport Allowance", description: "Monthly transport to work" },
  { name: "Housing Allowance", description: "Accommodation support" },
  { name: "Medical Allowance", description: "Health care support" },
  { name: "Risk Allowance", description: "For hazardous work conditions" },
  { name: "Meal Allowance", description: "Daily meal subsidy" },
  { name: "Communication Allowance", description: "Phone/internet allowance" },
  { name: "Leave Allowance", description: "Annual leave bonus" },
  { name: "Fuel Allowance", description: "Vehicle fuel support" },
  { name: "Responsibility Allowance", description: "Management responsibility" },
  { name: "Professional Allowance", description: "Professional certification" },
  { name: "Hardship Allowance", description: "Remote/difficult location" }
];

// Common deduction types
export const COMMON_DEDUCTIONS = [
  { name: "Loan Repayment", type: "loan" },
  { name: "Salary Advance", type: "advance" },
  { name: "Equipment Damage", type: "other" },
  { name: "Unauthorized Absence", type: "other" },
  { name: "Union Dues", type: "voluntary" },
  { name: "Cooperative Contribution", type: "voluntary" }
];

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate PAYE Tax based on annual income
 * Uses progressive tax brackets
 */
export function calculatePAYE(annualIncome) {
  let tax = 0;
  let remainingIncome = annualIncome;
  let currentBracket = "0%";
  
  for (const bracket of SL_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    if (annualIncome > bracket.min) {
      const bracketRange = bracket.max === Infinity ? remainingIncome : (bracket.max - bracket.min);
      const taxableInBracket = Math.min(bracketRange, remainingIncome);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
      currentBracket = bracket.label;
    }
  }
  
  const monthlyTax = tax / 12;
  const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;
  
  return {
    annualTax: tax,
    monthlyTax,
    effectiveRate: effectiveRate.toFixed(2),
    taxBracket: currentBracket
  };
}

/**
 * Calculate NASSIT contributions
 */
export function calculateNASSIT(grossPay) {
  return {
    employee: grossPay * NASSIT_EMPLOYEE_RATE,
    employer: grossPay * NASSIT_EMPLOYER_RATE,
    total: grossPay * (NASSIT_EMPLOYEE_RATE + NASSIT_EMPLOYER_RATE)
  };
}

/**
 * Calculate hourly/daily rates from base salary
 */
export function calculateRates(baseSalary, salaryType = "monthly") {
  const WORKING_DAYS_PER_MONTH = 22;
  const WORKING_HOURS_PER_DAY = 8;
  const WORKING_HOURS_PER_MONTH = WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY;
  
  let monthlyRate, dailyRate, hourlyRate;
  
  switch (salaryType) {
    case "hourly":
      hourlyRate = baseSalary;
      dailyRate = hourlyRate * WORKING_HOURS_PER_DAY;
      monthlyRate = hourlyRate * WORKING_HOURS_PER_MONTH;
      break;
    case "daily":
      dailyRate = baseSalary;
      hourlyRate = dailyRate / WORKING_HOURS_PER_DAY;
      monthlyRate = dailyRate * WORKING_DAYS_PER_MONTH;
      break;
    case "monthly":
    default:
      monthlyRate = baseSalary;
      dailyRate = monthlyRate / WORKING_DAYS_PER_MONTH;
      hourlyRate = monthlyRate / WORKING_HOURS_PER_MONTH;
      break;
  }
  
  return { monthlyRate, dailyRate, hourlyRate };
}

/**
 * Calculate overtime pay
 */
export function calculateOvertimePay(hourlyRate, overtimeHours, multiplier = 1.5) {
  return hourlyRate * overtimeHours * multiplier;
}

/**
 * Calculate attendance-based pay adjustment
 */
export function calculateAttendanceAdjustment(baseSalary, daysWorked, expectedDays = 22) {
  if (daysWorked >= expectedDays) {
    return { adjustment: 0, bonus: 0 };
  }
  
  const dailyRate = baseSalary / expectedDays;
  const missedDays = expectedDays - daysWorked;
  const deduction = dailyRate * missedDays;
  
  return {
    adjustment: -deduction,
    missedDays,
    dailyRate
  };
}

/**
 * Calculate attendance bonus
 */
export function calculateAttendanceBonus(baseSalary, daysWorked, expectedDays = 22) {
  // Perfect attendance bonus (5% of base salary)
  if (daysWorked >= expectedDays) {
    return baseSalary * 0.05;
  }
  return 0;
}

/**
 * Calculate sales commission
 */
export function calculateSalesCommission(totalSales, commissionRate = 0.02) {
  return totalSales * commissionRate;
}

/**
 * Get role-based allowances
 */
export function getRoleBasedAllowances(role, baseSalary) {
  const config = ROLE_BONUS_CONFIG[role] || { allowances: [] };
  
  return config.allowances.map(allowance => ({
    name: allowance.name,
    amount: allowance.percentage 
      ? Math.round(baseSalary * allowance.percentage) 
      : (allowance.fixed || 0),
    type: "role_based"
  }));
}

/**
 * Calculate complete payroll for an employee
 */
export function calculateFullPayroll({
  employee,
  periodStart,
  periodEnd,
  attendanceData = {},
  salesData = {},
  customAllowances = [],
  customDeductions = [],
  customBonuses = [],
  applyNASSIT = true,
  applyPAYE = true
}) {
  const baseSalary = employee.base_salary || 0;
  const salaryType = employee.salary_type || "monthly";
  const role = employee.role || "support_staff";
  
  // Calculate rates
  const rates = calculateRates(baseSalary, salaryType);
  
  // Get attendance data
  const daysWorked = attendanceData.daysWorked || 22;
  const expectedDays = attendanceData.expectedDays || 22;
  const regularHours = attendanceData.regularHours || (daysWorked * 8);
  const overtimeHours = attendanceData.overtimeHours || 0;
  const weekendHours = attendanceData.weekendHours || 0;
  const holidayHours = attendanceData.holidayHours || 0;
  
  // Calculate base earnings
  let baseEarnings = rates.monthlyRate;
  
  // Adjust for attendance if not full month
  const attendanceAdjustment = calculateAttendanceAdjustment(rates.monthlyRate, daysWorked, expectedDays);
  baseEarnings += attendanceAdjustment.adjustment;
  
  // Calculate overtime pay
  const overtimePay = calculateOvertimePay(rates.hourlyRate, overtimeHours, OVERTIME_MULTIPLIERS.regular);
  const weekendPay = calculateOvertimePay(rates.hourlyRate, weekendHours, OVERTIME_MULTIPLIERS.weekend);
  const holidayPay = calculateOvertimePay(rates.hourlyRate, holidayHours, OVERTIME_MULTIPLIERS.holiday);
  
  // Get role-based allowances
  const roleAllowances = getRoleBasedAllowances(role, baseSalary);
  const allAllowances = [...roleAllowances, ...customAllowances];
  const totalAllowances = allAllowances.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  // Calculate bonuses
  const bonuses = [...customBonuses];
  
  // Attendance bonus
  const attendanceBonus = calculateAttendanceBonus(baseSalary, daysWorked, expectedDays);
  if (attendanceBonus > 0) {
    bonuses.push({ name: "Perfect Attendance Bonus", amount: attendanceBonus, type: "attendance" });
  }
  
  // Sales commission (for applicable roles)
  if (salesData.totalSales && ROLE_BONUS_CONFIG[role]?.bonusEligible?.includes("sales_commission")) {
    const commission = calculateSalesCommission(salesData.totalSales, salesData.commissionRate || 0.02);
    if (commission > 0) {
      bonuses.push({ name: "Sales Commission", amount: commission, type: "sales_commission" });
    }
  }
  
  const totalBonuses = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
  
  // Calculate gross pay
  const grossPay = baseEarnings + overtimePay + weekendPay + holidayPay + totalAllowances + totalBonuses;
  
  // Calculate statutory deductions
  const nassit = applyNASSIT ? calculateNASSIT(grossPay) : { employee: 0, employer: 0 };
  const paye = applyPAYE ? calculatePAYE(grossPay * 12) : { monthlyTax: 0, taxBracket: "N/A", effectiveRate: 0 };
  
  // Build deductions array
  const deductions = [...customDeductions];
  if (applyNASSIT && nassit.employee > 0) {
    deductions.push({ name: "NASSIT (5%)", amount: nassit.employee, type: "statutory" });
  }
  if (applyPAYE && paye.monthlyTax > 0) {
    deductions.push({ name: "PAYE Tax", amount: paye.monthlyTax, type: "statutory" });
  }
  
  const totalStatutoryDeductions = (applyNASSIT ? nassit.employee : 0) + (applyPAYE ? paye.monthlyTax : 0);
  const customDeductionsTotal = customDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDeductions = totalStatutoryDeductions + customDeductionsTotal;
  
  // Calculate net pay
  const netPay = grossPay - totalDeductions;
  
  // Calculate employer cost
  const employerCost = grossPay + nassit.employer;
  
  return {
    employee_id: employee.id,
    employee_name: employee.full_name,
    employee_role: role,
    employee_location: employee.assigned_location_name || "",
    period_start: periodStart,
    period_end: periodEnd,
    
    base_salary: baseSalary,
    salary_type: salaryType,
    hours_worked: regularHours,
    days_worked: daysWorked,
    
    overtime_hours: overtimeHours,
    overtime_rate_multiplier: OVERTIME_MULTIPLIERS.regular,
    overtime_pay: overtimePay,
    weekend_hours: weekendHours,
    weekend_pay: weekendPay,
    holiday_hours: holidayHours,
    holiday_pay: holidayPay,
    
    bonuses,
    total_bonuses: totalBonuses,
    
    allowances: allAllowances,
    total_allowances: totalAllowances,
    
    gross_pay: Math.round(grossPay),
    
    deductions,
    nassit_employee: Math.round(nassit.employee),
    nassit_employer: Math.round(nassit.employer),
    paye_tax: Math.round(paye.monthlyTax),
    total_statutory_deductions: Math.round(totalStatutoryDeductions),
    total_deductions: Math.round(totalDeductions),
    
    net_pay: Math.round(netPay),
    employer_cost: Math.round(employerCost),
    
    calculation_details: {
      hourly_rate: Math.round(rates.hourlyRate),
      daily_rate: Math.round(rates.dailyRate),
      tax_bracket: paye.taxBracket,
      effective_tax_rate: parseFloat(paye.effectiveRate)
    }
  };
}

/**
 * Format currency for display
 */
export function formatSLE(amount) {
  return `SLE ${Math.round(amount || 0).toLocaleString()}`;
}