// Sierra Leone Payroll Calculator
// All amounts in SLE (New Sierra Leonean Leone - Redenominated March 2024)
// Reference: Finance Act 2024, Employment Act 2023, NASSIT Act

// ============================================
// STATUTORY RATES (2025)
// Based on Sierra Leone Finance Act 2024 & NRA Guidelines
// ============================================

// NASSIT (National Social Security and Insurance Trust)
// Per NASSIT Act - mandatory for all formal sector employees
export const NASSIT_EMPLOYEE_RATE = 0.05;  // 5% employee contribution
export const NASSIT_EMPLOYER_RATE = 0.10;  // 10% employer contribution

// PAYE Tax Brackets (Annual Income) - 2025
// Based on Finance Act 2024 and sl.icalculator.com/income-tax-rates/2025
// Note: First SLE 6,000,000 annually (SLE 500,000 monthly) is tax-free
export const SL_TAX_BRACKETS = [
  { min: 0, max: 6000000, rate: 0, label: "0% (Tax-Free)" },
  { min: 6000001, max: 12000000, rate: 0.15, label: "15%" },
  { min: 12000001, max: 18000000, rate: 0.20, label: "20%" },
  { min: 18000001, max: 24000000, rate: 0.25, label: "25%" },
  { min: 24000001, max: Infinity, rate: 0.30, label: "30%" }
];

// Monthly equivalents for reference (annual / 12)
export const SL_TAX_BRACKETS_MONTHLY = [
  { min: 0, max: 500000, rate: 0, label: "0% (Tax-Free)" },
  { min: 500001, max: 1000000, rate: 0.15, label: "15%" },
  { min: 1000001, max: 1500000, rate: 0.20, label: "20%" },
  { min: 1500001, max: 2000000, rate: 0.25, label: "25%" },
  { min: 2000001, max: Infinity, rate: 0.30, label: "30%" }
];

// Overtime Multipliers - Per Employment Act 2023 Section 42
export const OVERTIME_MULTIPLIERS = {
  regular: 1.5,      // Regular overtime (time-and-a-half) - Employment Act 2023
  weekend: 2.0,      // Weekend/Rest day work (double time)
  holiday: 2.5,      // Public holiday work
  night: 1.25        // Night shift differential (8pm - 6am per Employment Act 2023)
};

// Sierra Leone Public Holidays (for payroll calculations)
export const SL_PUBLIC_HOLIDAYS_2025 = [
  { date: "2025-01-01", name: "New Year's Day" },
  { date: "2025-03-08", name: "International Women's Day" },
  { date: "2025-03-29", name: "Eid ul-Fitr" }, // Approximate - varies by moon sighting
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-04-21", name: "Easter Monday" },
  { date: "2025-04-27", name: "Independence Day" },
  { date: "2025-06-05", name: "Eid ul-Adha" }, // Approximate - varies by moon sighting
  { date: "2025-08-12", name: "Maulid-un-Nabi" }, // Prophet's Birthday
  { date: "2025-12-25", name: "Christmas Day" },
  { date: "2025-12-26", name: "Boxing Day" }
];

// Sierra Leone Minimum Wage (as of 2024)
// Per Minimum Wage Act and subsequent amendments
export const SL_MINIMUM_WAGE = {
  monthly: 800000,  // SLE 800,000 per month (increased from SLE 600,000)
  daily: 36364,     // Approximately SLE 36,364 per day
  hourly: 4545      // Approximately SLE 4,545 per hour
};

// Role-based allowances configuration
// Per Employment Act 2023 Section 5 - casual/temporary workers entitled to:
// rent, transport, medical, relocation, risk allowances
export const ROLE_BONUS_CONFIG = {
  super_admin: {
    allowances: [
      { name: "Executive Allowance", percentage: 0.20 },
      { name: "Transport Allowance", fixed: 500000 },
      { name: "Housing Allowance", percentage: 0.20 },
      { name: "Communication Allowance", fixed: 200000 },
      { name: "Medical Allowance", fixed: 300000 }
    ],
    bonusEligible: ["performance"]
  },
  org_admin: {
    allowances: [
      { name: "Executive Allowance", percentage: 0.15 },
      { name: "Transport Allowance", fixed: 500000 },
      { name: "Housing Allowance", percentage: 0.20 },
      { name: "Communication Allowance", fixed: 200000 },
      { name: "Medical Allowance", fixed: 300000 }
    ],
    bonusEligible: ["performance"]
  },
  hr_admin: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250000 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: ["performance"]
  },
  payroll_admin: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250000 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: ["performance"]
  },
  warehouse_manager: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250000 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  accountant: {
    allowances: [
      { name: "Professional Allowance", percentage: 0.08 },
      { name: "Transport Allowance", fixed: 250000 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: ["performance"]
  },
  driver: {
    allowances: [
      { name: "Risk Allowance", percentage: 0.15 },
      { name: "Transport Allowance", fixed: 150000 },
      { name: "Fuel Allowance", fixed: 100000 },
      { name: "Meal Allowance", fixed: 100000 },
      { name: "Medical Allowance", fixed: 150000 },
      { name: "Uniform Allowance", fixed: 50000 }
    ],
    bonusEligible: ["performance", "attendance", "sales_commission"]
  },
  vehicle_sales: {
    allowances: [
      { name: "Sales Allowance", percentage: 0.02 },
      { name: "Transport Allowance", fixed: 150000 },
      { name: "Communication Allowance", fixed: 75000 },
      { name: "Meal Allowance", fixed: 100000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: ["performance", "sales_commission"]
  },
  retail_cashier: {
    allowances: [
      { name: "Transport Allowance", fixed: 150000 },
      { name: "Meal Allowance", fixed: 100000 },
      { name: "Medical Allowance", fixed: 150000 },
      { name: "Uniform Allowance", fixed: 50000 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  support_staff: {
    allowances: [
      { name: "Transport Allowance", fixed: 150000 },
      { name: "Meal Allowance", fixed: 100000 },
      { name: "Medical Allowance", fixed: 150000 },
      { name: "Uniform Allowance", fixed: 50000 }
    ],
    bonusEligible: ["attendance"]
  },
  read_only: {
    allowances: [
      { name: "Transport Allowance", fixed: 150000 },
      { name: "Meal Allowance", fixed: 100000 },
      { name: "Medical Allowance", fixed: 150000 }
    ],
    bonusEligible: []
  }
};

// Common allowances - Per Employment Act 2023 Section 5
// Workers entitled to: rent, transport, medical, relocation, risk allowances
export const COMMON_ALLOWANCES = [
  { name: "Transport Allowance", description: "Monthly transport to work (per Employment Act 2023)" },
  { name: "Housing/Rent Allowance", description: "Accommodation support (per Employment Act 2023)" },
  { name: "Medical Allowance", description: "Health care support (per Employment Act 2023)" },
  { name: "Risk Allowance", description: "For hazardous work conditions (per Employment Act 2023)" },
  { name: "Relocation Allowance", description: "For transferred employees (per Employment Act 2023)" },
  { name: "Meal Allowance", description: "Daily meal/subsistence subsidy" },
  { name: "Communication Allowance", description: "Phone/internet allowance" },
  { name: "Leave Allowance", description: "Annual leave bonus" },
  { name: "Fuel Allowance", description: "Vehicle fuel support" },
  { name: "Responsibility Allowance", description: "Management/supervisory responsibility" },
  { name: "Professional Allowance", description: "Professional certification/qualification" },
  { name: "Hardship Allowance", description: "Remote/difficult location posting" },
  { name: "Acting Allowance", description: "Temporarily performing higher duties (per Employment Act 2023)" },
  { name: "Uniform Allowance", description: "Work uniform maintenance" },
  { name: "Entertainment Allowance", description: "Client entertainment (management)" },
  { name: "Night Shift Allowance", description: "Night work differential (8pm-6am per Employment Act 2023)" }
];

// Common deduction types
export const COMMON_DEDUCTIONS = [
  { name: "NASSIT Employee (5%)", type: "statutory", description: "National Social Security contribution" },
  { name: "PAYE Tax", type: "statutory", description: "Pay As You Earn income tax" },
  { name: "Loan Repayment", type: "loan", description: "Staff loan repayment" },
  { name: "Salary Advance", type: "advance", description: "Advance salary deduction" },
  { name: "Equipment Damage", type: "other", description: "Damage to company property" },
  { name: "Unauthorized Absence", type: "other", description: "Unpaid leave deduction" },
  { name: "Union Dues", type: "voluntary", description: "Trade union membership" },
  { name: "Cooperative Savings", type: "voluntary", description: "Staff cooperative contribution" },
  { name: "Health Insurance", type: "voluntary", description: "Optional health coverage" },
  { name: "Pension Top-up", type: "voluntary", description: "Additional pension contribution" }
];

// Sierra Leone Leave Entitlements - Per Employment Act 2023
export const SL_LEAVE_ENTITLEMENTS = {
  annual: {
    days: 21, // Minimum 21 working days per year after 1 year service
    description: "Annual leave (after 1 year continuous service)"
  },
  sick: {
    days: 5, // Minimum 5 days paid sick leave
    description: "Paid sick leave per year"
  },
  maternity: {
    days: 90, // 14 weeks (approx 90 days)
    description: "Maternity leave (14 weeks per Employment Act 2023)"
  },
  paternity: {
    days: 5,
    description: "Paternity leave"
  },
  compassionate: {
    days: 5,
    description: "Bereavement/compassionate leave"
  }
};

// Probation period - Per Employment Act 2023
export const SL_PROBATION_PERIOD = {
  maxMonths: 6,
  description: "Maximum probationary period per Employment Act 2023"
};

// Notice periods - Per Employment Act 2023
export const SL_NOTICE_PERIODS = {
  probation: { days: 7, description: "During probation" },
  lessThan3Years: { days: 30, description: "Less than 3 years service" },
  moreThan3Years: { days: 60, description: "3+ years service" },
  moreThan5Years: { days: 90, description: "5+ years service" }
};

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
 * Apply benefit/deduction templates to an employee
 */
export function applyTemplates(templates, employee, baseSalary, grossPay = null) {
  const allowances = [];
  const deductions = [];

  templates.forEach(template => {
    if (!template.is_active) return;

    // Check if template applies to this employee
    const appliesToEmployee = 
      (template.applies_to_employees?.length > 0 && template.applies_to_employees.includes(employee.id)) ||
      (template.applies_to_roles?.length > 0 && template.applies_to_roles.includes(employee.role)) ||
      (!template.applies_to_employees?.length && !template.applies_to_roles?.length);

    if (!appliesToEmployee) return;

    // Calculate amount
    let amount = template.amount || 0;
    if (template.calculation_type === 'percentage') {
      const base = template.percentage_of === 'gross_pay' && grossPay ? grossPay : baseSalary;
      amount = Math.round(base * (template.amount / 100));
    }

    const item = {
      name: template.name,
      amount,
      type: template.category,
      template_id: template.id,
      is_taxable: template.is_taxable
    };

    if (template.type === 'benefit') {
      allowances.push(item);
    } else {
      deductions.push(item);
    }
  });

  return { allowances, deductions };
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
  templates = [],
  applyNASSIT = true,
  applyPAYE = true,
  payrollFrequency = "monthly"
}) {
  const baseSalary = employee.base_salary || 0;
  const salaryType = employee.salary_type || "monthly";
  const role = employee.role || "support_staff";
  const frequencyConfig = PAYROLL_FREQUENCIES[payrollFrequency] || PAYROLL_FREQUENCIES.monthly;
  
  // Calculate prorated salary based on frequency
  const proratedSalary = calculateProratedSalary(baseSalary, payrollFrequency);
  
  // Calculate rates based on prorated salary
  const rates = calculateRates(proratedSalary, salaryType);
  
  // Get attendance data - adjust for frequency
  const expectedDays = attendanceData.expectedDays || frequencyConfig.workingDays;
  const daysWorked = attendanceData.daysWorked || expectedDays;
  const regularHours = attendanceData.regularHours || (daysWorked * 8);
  const overtimeHours = attendanceData.overtimeHours || 0;
  const weekendHours = attendanceData.weekendHours || 0;
  const holidayHours = attendanceData.holidayHours || 0;
  
  // Calculate base earnings (using prorated salary)
  let baseEarnings = proratedSalary;
  
  // Adjust for attendance if not full period
  const attendanceAdjustment = calculateAttendanceAdjustment(proratedSalary, daysWorked, expectedDays);
  baseEarnings += attendanceAdjustment.adjustment;
  
  // Calculate overtime pay
  const overtimePay = calculateOvertimePay(rates.hourlyRate, overtimeHours, OVERTIME_MULTIPLIERS.regular);
  const weekendPay = calculateOvertimePay(rates.hourlyRate, weekendHours, OVERTIME_MULTIPLIERS.weekend);
  const holidayPay = calculateOvertimePay(rates.hourlyRate, holidayHours, OVERTIME_MULTIPLIERS.holiday);
  
  // Get role-based allowances (prorated for frequency)
  const roleAllowances = getRoleBasedAllowances(role, proratedSalary);
  
  // Apply templates if provided (prorated for frequency)
  const templateItems = templates.length > 0 ? applyTemplates(templates, employee, proratedSalary) : { allowances: [], deductions: [] };
  
  const allAllowances = [...roleAllowances, ...templateItems.allowances, ...customAllowances];
  const totalAllowances = allAllowances.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  // Calculate bonuses
  const bonuses = [...customBonuses];
  
  // Attendance bonus (prorated)
  const attendanceBonus = calculateAttendanceBonus(proratedSalary, daysWorked, expectedDays);
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
  // NASSIT is calculated on gross pay for the period
  const nassit = applyNASSIT ? calculateNASSIT(grossPay) : { employee: 0, employer: 0 };
  
  // PAYE is calculated on annual equivalent, then divided by periods per year
  const annualGrossEquivalent = grossPay * frequencyConfig.periodsPerYear;
  const payeAnnual = applyPAYE ? calculatePAYE(annualGrossEquivalent) : { annualTax: 0, monthlyTax: 0, taxBracket: "N/A", effectiveRate: 0 };
  const payePeriodic = applyPAYE ? Math.round(payeAnnual.annualTax / frequencyConfig.periodsPerYear) : 0;
  
  // Build deductions array - include template deductions
  const deductions = [...templateItems.deductions, ...customDeductions];
  if (applyNASSIT && nassit.employee > 0) {
    deductions.push({ name: "NASSIT (5%)", amount: nassit.employee, type: "statutory" });
  }
  if (applyPAYE && payePeriodic > 0) {
    deductions.push({ name: "PAYE Tax", amount: payePeriodic, type: "statutory" });
  }
  
  const totalStatutoryDeductions = (applyNASSIT ? nassit.employee : 0) + (applyPAYE ? payePeriodic : 0);
  const templateDeductionsTotal = templateItems.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const customDeductionsTotal = customDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDeductions = totalStatutoryDeductions + templateDeductionsTotal + customDeductionsTotal;
  
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
    payroll_frequency: payrollFrequency,
    
    base_salary: baseSalary,
    prorated_salary: proratedSalary,
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
    paye_tax: Math.round(payePeriodic),
    total_statutory_deductions: Math.round(totalStatutoryDeductions),
    total_deductions: Math.round(totalDeductions),
    
    net_pay: Math.round(netPay),
    employer_cost: Math.round(employerCost),
    
    calculation_details: {
      hourly_rate: Math.round(rates.hourlyRate),
      daily_rate: Math.round(rates.dailyRate),
      tax_bracket: payeAnnual.taxBracket,
      effective_tax_rate: parseFloat(payeAnnual.effectiveRate),
      annual_gross_equivalent: Math.round(annualGrossEquivalent),
      frequency_multiplier: frequencyConfig.multiplier
    }
  };
}

/**
 * Format currency for display
 */
export function formatSLE(amount) {
  return `SLE ${Math.round(amount || 0).toLocaleString()}`;
}