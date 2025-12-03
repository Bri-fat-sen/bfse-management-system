// Sierra Leone Payroll Calculator
// All amounts in NLE (New Leone - Redenominated April 2024)
// 1 NLE = 1000 old SLE (Leones)
// Reference: Finance Act 2024, Employment Act 2023, NASSIT Act

// Safe number helper to prevent NaN/undefined errors
const safeNum = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
};

// ============================================
// STATUTORY RATES (2025)
// Based on Sierra Leone Finance Act 2024 & NRA Guidelines
// ============================================

// NASSIT (National Social Security and Insurance Trust)
// Per NASSIT Act - mandatory for all formal sector employees
export const NASSIT_EMPLOYEE_RATE = 0.05;  // 5% employee contribution
export const NASSIT_EMPLOYER_RATE = 0.10;  // 10% employer contribution

// PAYE Tax Brackets (Annual Income) - 2025
// Based on Finance Act 2024 - amounts in NLE (New Leone)
// Note: First NLE 6,000 annually (NLE 500 monthly) is tax-free
export const SL_TAX_BRACKETS = [
  { min: 0, max: 6000, rate: 0, label: "0% (Tax-Free)" },
  { min: 6001, max: 12000, rate: 0.15, label: "15%" },
  { min: 12001, max: 18000, rate: 0.20, label: "20%" },
  { min: 18001, max: 24000, rate: 0.25, label: "25%" },
  { min: 24001, max: Infinity, rate: 0.30, label: "30%" }
];

// Monthly equivalents for reference (annual / 12)
export const SL_TAX_BRACKETS_MONTHLY = [
  { min: 0, max: 500, rate: 0, label: "0% (Tax-Free)" },
  { min: 501, max: 1000, rate: 0.15, label: "15%" },
  { min: 1001, max: 1500, rate: 0.20, label: "20%" },
  { min: 1501, max: 2000, rate: 0.25, label: "25%" },
  { min: 2001, max: Infinity, rate: 0.30, label: "30%" }
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

// Sierra Leone Minimum Wage (as of 2024) - in NLE (New Leone)
// Per Minimum Wage Act and subsequent amendments
// 1 NLE = 1000 old SLE
export const SL_MINIMUM_WAGE = {
  monthly: 800,     // NLE 800 per month
  daily: 36,        // Approximately NLE 36 per day
  hourly: 5         // Approximately NLE 5 per hour
};

// Role-based allowances configuration - amounts in NLE (New Leone)
// Per Employment Act 2023 Section 5 - casual/temporary workers entitled to:
// rent, transport, medical, relocation, risk allowances
export const ROLE_BONUS_CONFIG = {
  super_admin: {
    allowances: [
      { name: "Executive Allowance", percentage: 0.20 },
      { name: "Transport Allowance", fixed: 500 },
      { name: "Housing Allowance", percentage: 0.20 },
      { name: "Communication Allowance", fixed: 200 },
      { name: "Medical Allowance", fixed: 300 }
    ],
    bonusEligible: ["performance"]
  },
  org_admin: {
    allowances: [
      { name: "Executive Allowance", percentage: 0.15 },
      { name: "Transport Allowance", fixed: 500 },
      { name: "Housing Allowance", percentage: 0.20 },
      { name: "Communication Allowance", fixed: 200 },
      { name: "Medical Allowance", fixed: 300 }
    ],
    bonusEligible: ["performance"]
  },
  hr_admin: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75 },
      { name: "Medical Allowance", fixed: 150 }
    ],
    bonusEligible: ["performance"]
  },
  payroll_admin: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75 },
      { name: "Medical Allowance", fixed: 150 }
    ],
    bonusEligible: ["performance"]
  },
  warehouse_manager: {
    allowances: [
      { name: "Responsibility Allowance", percentage: 0.10 },
      { name: "Transport Allowance", fixed: 250 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75 },
      { name: "Medical Allowance", fixed: 150 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  accountant: {
    allowances: [
      { name: "Professional Allowance", percentage: 0.08 },
      { name: "Transport Allowance", fixed: 250 },
      { name: "Housing Allowance", percentage: 0.10 },
      { name: "Communication Allowance", fixed: 75 },
      { name: "Medical Allowance", fixed: 150 }
    ],
    bonusEligible: ["performance"]
  },
  driver: {
    allowances: [
      { name: "Risk Allowance", percentage: 0.15 },
      { name: "Transport Allowance", fixed: 150 },
      { name: "Fuel Allowance", fixed: 100 },
      { name: "Meal Allowance", fixed: 100 },
      { name: "Medical Allowance", fixed: 150 },
      { name: "Uniform Allowance", fixed: 50 }
    ],
    bonusEligible: ["performance", "attendance", "sales_commission"]
  },
  vehicle_sales: {
    allowances: [
      { name: "Sales Allowance", percentage: 0.02 },
      { name: "Transport Allowance", fixed: 150 },
      { name: "Communication Allowance", fixed: 75 },
      { name: "Meal Allowance", fixed: 100 },
      { name: "Medical Allowance", fixed: 150 }
    ],
    bonusEligible: ["performance", "sales_commission"]
  },
  retail_cashier: {
    allowances: [
      { name: "Transport Allowance", fixed: 150 },
      { name: "Meal Allowance", fixed: 100 },
      { name: "Medical Allowance", fixed: 150 },
      { name: "Uniform Allowance", fixed: 50 }
    ],
    bonusEligible: ["performance", "attendance"]
  },
  support_staff: {
    allowances: [
      { name: "Transport Allowance", fixed: 150 },
      { name: "Meal Allowance", fixed: 100 },
      { name: "Medical Allowance", fixed: 150 },
      { name: "Uniform Allowance", fixed: 50 }
    ],
    bonusEligible: ["attendance"]
  },
  read_only: {
    allowances: [
      { name: "Transport Allowance", fixed: 150 },
      { name: "Meal Allowance", fixed: 100 },
      { name: "Medical Allowance", fixed: 150 }
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
// PAYROLL FREQUENCY CONFIGURATION
// ============================================

export const PAYROLL_FREQUENCIES = {
  weekly: {
    label: "Weekly",
    periodsPerYear: 52,
    workingDays: 5,
    multiplier: 12 / 52, // Convert monthly to weekly
    description: "Paid every week (52 times per year)"
  },
  bi_weekly: {
    label: "Bi-Weekly",
    periodsPerYear: 26,
    workingDays: 10,
    multiplier: 12 / 26, // Convert monthly to bi-weekly
    description: "Paid every two weeks (26 times per year)"
  },
  monthly: {
    label: "Monthly",
    periodsPerYear: 12,
    workingDays: 22,
    multiplier: 1,
    description: "Paid once per month (12 times per year)"
  }
};

/**
 * Calculate prorated salary based on payroll frequency
 */
export function calculateProratedSalary(monthlySalary, frequency) {
  const config = PAYROLL_FREQUENCIES[frequency] || PAYROLL_FREQUENCIES.monthly;
  return Math.round(safeNum(monthlySalary) * safeNum(config.multiplier, 1));
}

/**
 * Get annual equivalent from periodic salary
 */
export function getAnnualEquivalent(periodicSalary, frequency) {
  const config = PAYROLL_FREQUENCIES[frequency] || PAYROLL_FREQUENCIES.monthly;
  return Math.round(safeNum(periodicSalary) * safeNum(config.periodsPerYear, 12));
}

/**
 * Get expected working days for a pay period
 */
export function getExpectedWorkingDays(frequency) {
  const config = PAYROLL_FREQUENCIES[frequency] || PAYROLL_FREQUENCIES.monthly;
  return config.workingDays;
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate PAYE Tax based on annual income
 * Uses progressive tax brackets
 * First Le 6,000 annually is tax-free per Sierra Leone Finance Act 2024
 */
export function calculatePAYE(annualIncome) {
  const income = safeNum(annualIncome);
  
  // Tax-free threshold is Le 6,000 annually
  const TAX_FREE_THRESHOLD = 6000;
  
  // If income is at or below tax-free threshold, no tax is due
  if (income <= TAX_FREE_THRESHOLD) {
    return {
      annualTax: 0,
      monthlyTax: 0,
      effectiveRate: "0.00",
      taxBracket: "0% (Tax-Free)"
    };
  }
  
  let tax = 0;
  let currentBracket = "0%";
  
  // Only calculate tax on income ABOVE the tax-free threshold
  // Apply progressive rates to each bracket
  for (const bracket of SL_TAX_BRACKETS) {
    // Skip the tax-free bracket
    if (bracket.rate === 0) continue;
    
    // Check if income reaches this bracket
    if (income > bracket.min) {
      // Calculate the taxable amount in this bracket
      const taxableUpperLimit = bracket.max === Infinity ? income : Math.min(income, bracket.max);
      const taxableInBracket = taxableUpperLimit - bracket.min;
      
      if (taxableInBracket > 0) {
        tax += taxableInBracket * safeNum(bracket.rate);
        currentBracket = bracket.label;
      }
    }
  }
  
  const monthlyTax = tax / 12;
  const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
  
  return {
    annualTax: Math.round(tax),
    monthlyTax: Math.round(monthlyTax),
    effectiveRate: safeNum(effectiveRate).toFixed(2),
    taxBracket: currentBracket
  };
}

/**
 * Calculate NASSIT contributions
 */
export function calculateNASSIT(grossPay) {
  const gross = safeNum(grossPay);
  return {
    employee: Math.round(gross * NASSIT_EMPLOYEE_RATE),
    employer: Math.round(gross * NASSIT_EMPLOYER_RATE),
    total: Math.round(gross * (NASSIT_EMPLOYEE_RATE + NASSIT_EMPLOYER_RATE))
  };
}

/**
 * Calculate hourly/daily rates from base salary
 */
export function calculateRates(baseSalary, salaryType = "monthly") {
  const WORKING_DAYS_PER_MONTH = 22;
  const WORKING_HOURS_PER_DAY = 8;
  const WORKING_HOURS_PER_MONTH = WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY;
  
  const salary = safeNum(baseSalary);
  let monthlyRate, dailyRate, hourlyRate;
  
  switch (salaryType) {
    case "hourly":
      hourlyRate = salary;
      dailyRate = hourlyRate * WORKING_HOURS_PER_DAY;
      monthlyRate = hourlyRate * WORKING_HOURS_PER_MONTH;
      break;
    case "daily":
      dailyRate = salary;
      hourlyRate = dailyRate / WORKING_HOURS_PER_DAY;
      monthlyRate = dailyRate * WORKING_DAYS_PER_MONTH;
      break;
    case "monthly":
    default:
      monthlyRate = salary;
      dailyRate = salary / WORKING_DAYS_PER_MONTH;
      hourlyRate = salary / WORKING_HOURS_PER_MONTH;
      break;
  }
  
  return { 
    monthlyRate: Math.round(monthlyRate), 
    dailyRate: Math.round(dailyRate), 
    hourlyRate: Math.round(hourlyRate) 
  };
}

/**
 * Calculate overtime pay
 */
export function calculateOvertimePay(hourlyRate, overtimeHours, multiplier = 1.5) {
  return Math.round(safeNum(hourlyRate) * safeNum(overtimeHours) * safeNum(multiplier, 1.5));
}

/**
 * Calculate attendance-based pay adjustment
 */
export function calculateAttendanceAdjustment(baseSalary, daysWorked, expectedDays = 22) {
  const salary = safeNum(baseSalary);
  const worked = safeNum(daysWorked);
  const expected = safeNum(expectedDays, 22);
  
  if (worked >= expected) {
    return { adjustment: 0, bonus: 0, missedDays: 0, dailyRate: 0 };
  }
  
  const dailyRate = expected > 0 ? salary / expected : 0;
  const missedDays = expected - worked;
  const deduction = Math.round(dailyRate * missedDays);
  
  return {
    adjustment: -deduction,
    missedDays,
    dailyRate: Math.round(dailyRate)
  };
}

/**
 * Calculate attendance bonus
 */
export function calculateAttendanceBonus(baseSalary, daysWorked, expectedDays = 22) {
  // Perfect attendance bonus (5% of base salary)
  if (safeNum(daysWorked) >= safeNum(expectedDays, 22)) {
    return Math.round(safeNum(baseSalary) * 0.05);
  }
  return 0;
}

/**
 * Calculate sales commission
 */
export function calculateSalesCommission(totalSales, commissionRate = 0.02) {
  return Math.round(safeNum(totalSales) * safeNum(commissionRate, 0.02));
}

/**
 * Get role-based allowances
 */
export function getRoleBasedAllowances(role, baseSalary) {
  const config = ROLE_BONUS_CONFIG[role] || { allowances: [] };
  const salary = safeNum(baseSalary);
  
  return config.allowances.map(allowance => ({
    name: allowance.name,
    amount: allowance.percentage 
      ? Math.round(salary * safeNum(allowance.percentage)) 
      : safeNum(allowance.fixed),
    type: "role_based"
  }));
}

/**
 * Apply benefit/deduction templates to an employee
 */
export function applyTemplates(templates, employee, baseSalary, grossPay = null) {
  const allowances = [];
  const deductions = [];
  const salary = safeNum(baseSalary);
  const gross = safeNum(grossPay);

  templates.forEach(template => {
    if (!template.is_active) return;

    // Check if template applies to this employee
    const appliesToEmployee = 
      (template.applies_to_employees?.length > 0 && template.applies_to_employees.includes(employee.id)) ||
      (template.applies_to_roles?.length > 0 && template.applies_to_roles.includes(employee.role)) ||
      (!template.applies_to_employees?.length && !template.applies_to_roles?.length);

    if (!appliesToEmployee) return;

    // Calculate amount
    let amount = safeNum(template.amount);
    if (template.calculation_type === 'percentage') {
      const base = template.percentage_of === 'gross_pay' && gross > 0 ? gross : salary;
      amount = Math.round(base * (safeNum(template.amount) / 100));
    }

    // Skip if amount is 0 or negative
    if (amount <= 0) return;

    const item = {
      name: template.name,
      amount,
      type: template.category || 'other',
      template_id: template.id,
      is_taxable: template.is_taxable !== false
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
  payrollFrequency = "monthly",
  skipRoleAllowances = false
}) {
  const baseSalary = safeNum(employee.base_salary);
  const salaryType = employee.salary_type || "monthly";
  const role = employee.role || "support_staff";
  
  // Get frequency configuration
  const frequencyConfig = PAYROLL_FREQUENCIES[payrollFrequency] || PAYROLL_FREQUENCIES.monthly;
  
  // Calculate prorated salary for the pay period
  const proratedSalary = calculateProratedSalary(baseSalary, payrollFrequency);
  
  // Calculate rates based on prorated salary
  const rates = calculateRates(proratedSalary, salaryType);
  
  // Get attendance data - adjust expected days based on frequency
  const expectedDays = safeNum(attendanceData.expectedDays, frequencyConfig.workingDays);
  const daysWorked = safeNum(attendanceData.daysWorked, expectedDays);
  const regularHours = safeNum(attendanceData.regularHours, daysWorked * 8);
  const overtimeHours = safeNum(attendanceData.overtimeHours);
  const weekendHours = safeNum(attendanceData.weekendHours);
  const holidayHours = safeNum(attendanceData.holidayHours);
  
  // Calculate base earnings (use prorated salary for non-monthly frequencies)
  let baseEarnings = proratedSalary;
  
  // Adjust for attendance if not full period
  const attendanceAdjustment = calculateAttendanceAdjustment(proratedSalary, daysWorked, expectedDays);
  baseEarnings += safeNum(attendanceAdjustment.adjustment);
  
  // Calculate overtime pay
  const overtimePay = calculateOvertimePay(rates.hourlyRate, overtimeHours, OVERTIME_MULTIPLIERS.regular);
  const weekendPay = calculateOvertimePay(rates.hourlyRate, weekendHours, OVERTIME_MULTIPLIERS.weekend);
  const holidayPay = calculateOvertimePay(rates.hourlyRate, holidayHours, OVERTIME_MULTIPLIERS.holiday);
  
  // Get role-based allowances (prorated for frequency) - only if not skipped
  const roleAllowances = skipRoleAllowances ? [] : getRoleBasedAllowances(role, baseSalary).map(a => ({
    ...a,
    amount: Math.round(safeNum(a.amount) * safeNum(frequencyConfig.multiplier, 1))
  }));
  
  // Apply templates if provided - filter out any statutory deductions from templates
  // (NASSIT and PAYE are handled separately to avoid duplicates)
  const templateItems = templates.length > 0 ? applyTemplates(templates, employee, baseSalary) : { allowances: [], deductions: [] };
  
  // Filter out any NASSIT or PAYE from template deductions to prevent duplicates
  const filteredTemplateDeductions = templateItems.deductions.filter(d => {
    const nameLower = (d.name || '').toLowerCase();
    return !nameLower.includes('nassit') && !nameLower.includes('paye') && !nameLower.includes('tax');
  });
  
  // Combine allowances - use Map to deduplicate by name
  const allowanceMap = new Map();
  [...roleAllowances, ...templateItems.allowances, ...customAllowances].forEach(a => {
    if (a.name && safeNum(a.amount) > 0) {
      // If same allowance name exists, keep the higher amount
      const existing = allowanceMap.get(a.name);
      if (!existing || safeNum(a.amount) > safeNum(existing.amount)) {
        allowanceMap.set(a.name, a);
      }
    }
  });
  const allAllowances = Array.from(allowanceMap.values());
  const totalAllowances = allAllowances.reduce((sum, a) => sum + safeNum(a.amount), 0);
  
  // Calculate bonuses - use Map to deduplicate by name
  const bonusMap = new Map();
  customBonuses.forEach(b => {
    if (b.name && safeNum(b.amount) > 0) {
      bonusMap.set(b.name, b);
    }
  });
  
  // Attendance bonus
  const attendanceBonus = calculateAttendanceBonus(baseSalary, daysWorked, expectedDays);
  if (attendanceBonus > 0) {
    bonusMap.set("Perfect Attendance Bonus", { name: "Perfect Attendance Bonus", amount: attendanceBonus, type: "attendance" });
  }
  
  // Sales commission (for applicable roles)
  const totalSalesAmount = safeNum(salesData.totalSales);
  if (totalSalesAmount > 0 && ROLE_BONUS_CONFIG[role]?.bonusEligible?.includes("sales_commission")) {
    const commission = calculateSalesCommission(totalSalesAmount, safeNum(salesData.commissionRate, 0.02));
    if (commission > 0) {
      bonusMap.set("Sales Commission", { name: "Sales Commission", amount: commission, type: "sales_commission" });
    }
  }
  
  const bonuses = Array.from(bonusMap.values());
  const totalBonuses = bonuses.reduce((sum, b) => sum + safeNum(b.amount), 0);
  
  // Calculate gross pay
  const grossPay = Math.round(baseEarnings + overtimePay + weekendPay + holidayPay + totalAllowances + totalBonuses);
  
  // Calculate statutory deductions
  // NASSIT is calculated on the period's gross pay
  const nassit = applyNASSIT ? calculateNASSIT(grossPay) : { employee: 0, employer: 0 };
  
  // PAYE is calculated based on annual equivalent income
  const annualGrossEquivalent = getAnnualEquivalent(grossPay, payrollFrequency);
  const paye = applyPAYE ? calculatePAYE(annualGrossEquivalent) : { monthlyTax: 0, annualTax: 0, taxBracket: "N/A", effectiveRate: "0" };
  
  // Prorate the PAYE tax for the pay period
  const periodTax = applyPAYE ? Math.round(safeNum(paye.annualTax) / safeNum(frequencyConfig.periodsPerYear, 12)) : 0;
  
  // Build deductions array - combine filtered template + custom (deduplicated)
  const deductionMap = new Map();
  
  // Add filtered template deductions first
  filteredTemplateDeductions.forEach(d => {
    if (d.name && safeNum(d.amount) > 0) {
      deductionMap.set(d.name, d);
    }
  });
  
  // Add custom deductions (excluding any that match statutory names)
  customDeductions.forEach(d => {
    const nameLower = (d.name || '').toLowerCase();
    if (d.name && safeNum(d.amount) > 0 && 
        !nameLower.includes('nassit') && !nameLower.includes('paye') && !nameLower.includes('tax')) {
      deductionMap.set(d.name, d);
    }
  });
  
  // Add statutory deductions last (these are calculated, not from templates)
  if (applyNASSIT && nassit.employee > 0) {
    deductionMap.set("NASSIT (5%)", { name: "NASSIT (5%)", amount: nassit.employee, type: "statutory" });
  }
  if (applyPAYE && periodTax > 0) {
    deductionMap.set("PAYE Tax", { name: "PAYE Tax", amount: periodTax, type: "statutory" });
  }
  
  const deductions = Array.from(deductionMap.values());
  
  // Calculate totals from the final deductions array
  const totalStatutoryDeductions = safeNum(applyNASSIT ? nassit.employee : 0) + safeNum(applyPAYE ? periodTax : 0);
  const otherDeductionsTotal = deductions
    .filter(d => d.type !== 'statutory')
    .reduce((sum, d) => sum + safeNum(d.amount), 0);
  const totalDeductions = Math.round(totalStatutoryDeductions + otherDeductionsTotal);
  
  // Calculate net pay
  const netPay = Math.round(grossPay - totalDeductions);
  
  // Calculate employer cost
  const employerCost = Math.round(grossPay + safeNum(nassit.employer));
  
  return {
    employee_id: employee.id,
    employee_name: employee.full_name,
    employee_role: role,
    employee_location: employee.assigned_location_name || "",
    period_start: periodStart,
    period_end: periodEnd,
    payroll_frequency: payrollFrequency,
    
    base_salary: Math.round(baseSalary),
    prorated_salary: Math.round(proratedSalary),
    salary_type: salaryType,
    hours_worked: Math.round(regularHours),
    days_worked: Math.round(daysWorked),
    
    overtime_hours: overtimeHours,
    overtime_rate_multiplier: OVERTIME_MULTIPLIERS.regular,
    overtime_pay: Math.round(overtimePay),
    weekend_hours: weekendHours,
    weekend_pay: Math.round(weekendPay),
    holiday_hours: holidayHours,
    holiday_pay: Math.round(holidayPay),
    
    bonuses,
    total_bonuses: Math.round(totalBonuses),
    
    allowances: allAllowances,
    total_allowances: Math.round(totalAllowances),
    
    gross_pay: grossPay,
    
    deductions,
    nassit_employee: Math.round(nassit.employee),
    nassit_employer: Math.round(nassit.employer),
    paye_tax: Math.round(periodTax),
    total_statutory_deductions: Math.round(totalStatutoryDeductions),
    total_deductions: totalDeductions,
    
    net_pay: netPay,
    employer_cost: employerCost,
    
    calculation_details: {
      hourly_rate: Math.round(rates.hourlyRate),
      daily_rate: Math.round(rates.dailyRate),
      tax_bracket: paye.taxBracket,
      effective_tax_rate: parseFloat(paye.effectiveRate) || 0,
      annual_gross_equivalent: annualGrossEquivalent,
      frequency_multiplier: frequencyConfig.multiplier
    }
  };
}

/**
 * Format currency for display - Le (New Leone)
 */
export function formatSLE(amount) {
  return `Le ${Math.round(safeNum(amount)).toLocaleString()}`;
}

// Alias for new naming
export const formatNLE = formatSLE;