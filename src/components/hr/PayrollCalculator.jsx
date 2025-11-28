// Sierra Leone Payroll Calculator
// Updated for 2024 tax rates and statutory requirements

// PAYE Tax Brackets (Annual Income in SLE)
export const SL_TAX_BRACKETS = [
  { min: 0, max: 500000, rate: 0 },           // First SLE 500,000 - 0%
  { min: 500001, max: 1000000, rate: 0.15 },  // Next SLE 500,000 - 15%
  { min: 1000001, max: 1500000, rate: 0.20 }, // Next SLE 500,000 - 20%
  { min: 1500001, max: 2000000, rate: 0.25 }, // Next SLE 500,000 - 25%
  { min: 2000001, max: Infinity, rate: 0.30 } // Above SLE 2,000,000 - 30%
];

// NASSIT Rates
export const NASSIT_EMPLOYEE_RATE = 0.05;  // 5% employee contribution
export const NASSIT_EMPLOYER_RATE = 0.10;  // 10% employer contribution

// Role-based default allowances and bonuses
export const ROLE_ALLOWANCES = {
  super_admin: [
    { name: "Executive Allowance", amount: 500000, type: "role" },
    { name: "Communication Allowance", amount: 100000, type: "communication" },
  ],
  org_admin: [
    { name: "Management Allowance", amount: 300000, type: "role" },
    { name: "Communication Allowance", amount: 80000, type: "communication" },
  ],
  hr_admin: [
    { name: "HR Allowance", amount: 150000, type: "role" },
  ],
  payroll_admin: [
    { name: "Finance Allowance", amount: 150000, type: "role" },
  ],
  warehouse_manager: [
    { name: "Warehouse Supervision", amount: 200000, type: "role" },
    { name: "Risk Allowance", amount: 50000, type: "risk" },
  ],
  retail_cashier: [
    { name: "Cash Handling Allowance", amount: 50000, type: "role" },
  ],
  vehicle_sales: [
    { name: "Sales Allowance", amount: 100000, type: "role" },
    { name: "Transport Allowance", amount: 80000, type: "transport" },
  ],
  driver: [
    { name: "Driver Allowance", amount: 150000, type: "role" },
    { name: "Risk Allowance", amount: 100000, type: "risk" },
    { name: "Meal Allowance", amount: 50000, type: "meal" },
  ],
  accountant: [
    { name: "Professional Allowance", amount: 200000, type: "role" },
  ],
  support_staff: [
    { name: "Meal Allowance", amount: 30000, type: "meal" },
  ],
  read_only: [],
};

// Location-based allowances (hardship/remote locations)
export const LOCATION_ALLOWANCES = {
  // Add specific locations with their allowances
  remote: { name: "Remote Location Allowance", percentage: 0.15 }, // 15% of base
  urban: { name: "Urban Allowance", percentage: 0.05 }, // 5% of base
  hazardous: { name: "Hazardous Location Allowance", percentage: 0.20 }, // 20% of base
};

// Overtime multipliers
export const OVERTIME_RATES = {
  regular: 1.5,      // Normal overtime (1.5x hourly rate)
  weekend: 2.0,      // Weekend work (2x)
  holiday: 2.5,      // Public holiday work (2.5x)
  night: 1.25,       // Night shift differential
};

// Calculate PAYE Tax for Sierra Leone (Progressive)
export function calculatePAYE(annualTaxableIncome) {
  let tax = 0;
  let remainingIncome = annualTaxableIncome;
  
  for (const bracket of SL_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const bracketSize = bracket.max - bracket.min + (bracket.min === 0 ? 0 : 1);
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    
    if (annualTaxableIncome > bracket.min) {
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
  }
  
  return Math.round(tax / 12); // Monthly PAYE
}

// Calculate NASSIT contributions
export function calculateNASSIT(grossPay) {
  return {
    employee: Math.round(grossPay * NASSIT_EMPLOYEE_RATE),
    employer: Math.round(grossPay * NASSIT_EMPLOYER_RATE),
  };
}

// Calculate hourly rate from salary
export function calculateHourlyRate(baseSalary, salaryType, hoursPerMonth = 176) {
  switch (salaryType) {
    case 'hourly':
      return baseSalary;
    case 'daily':
      return baseSalary / 8; // 8 hours per day
    case 'monthly':
    default:
      return baseSalary / hoursPerMonth;
  }
}

// Calculate overtime pay
export function calculateOvertimePay(hourlyRate, overtimeHours, overtimeType = 'regular') {
  const multiplier = OVERTIME_RATES[overtimeType] || OVERTIME_RATES.regular;
  return Math.round(hourlyRate * overtimeHours * multiplier);
}

// Get role-based allowances
export function getRoleAllowances(role) {
  return ROLE_ALLOWANCES[role] || [];
}

// Calculate attendance-based bonus
export function calculateAttendanceBonus(baseSalary, attendanceSummary, targetDays = 22) {
  if (!attendanceSummary) return 0;
  
  const { present_days = 0, late_days = 0 } = attendanceSummary;
  const effectiveDays = present_days - (late_days * 0.5); // Late counts as half day
  
  if (effectiveDays >= targetDays) {
    return Math.round(baseSalary * 0.05); // 5% perfect attendance bonus
  } else if (effectiveDays >= targetDays * 0.95) {
    return Math.round(baseSalary * 0.02); // 2% good attendance bonus
  }
  return 0;
}

// Calculate sales commission for sales roles
export function calculateSalesCommission(totalSales, role, commissionRates = {}) {
  const defaultRates = {
    vehicle_sales: 0.02,     // 2% commission
    retail_cashier: 0.005,   // 0.5% commission
    warehouse_manager: 0.01, // 1% commission on warehouse sales
  };
  
  const rate = commissionRates[role] || defaultRates[role] || 0;
  return Math.round(totalSales * rate);
}

// Full payroll calculation
export function calculatePayroll({
  baseSalary,
  salaryType = 'monthly',
  role,
  hoursWorked = 176,
  overtimeHours = 0,
  overtimeType = 'regular',
  customAllowances = [],
  customDeductions = [],
  attendanceSummary = null,
  salesTotal = 0,
  applyNASSIT = true,
  applyPAYE = true,
  includeRoleAllowances = true,
}) {
  // Base calculations
  const hourlyRate = calculateHourlyRate(baseSalary, salaryType);
  const overtimePay = calculateOvertimePay(hourlyRate, overtimeHours, overtimeType);
  
  // Allowances
  const roleAllowances = includeRoleAllowances ? getRoleAllowances(role) : [];
  const allAllowances = [...roleAllowances, ...customAllowances];
  const totalAllowances = allAllowances.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  // Bonuses
  const bonuses = [];
  
  // Attendance bonus
  const attendanceBonus = calculateAttendanceBonus(baseSalary, attendanceSummary);
  if (attendanceBonus > 0) {
    bonuses.push({ name: "Attendance Bonus", amount: attendanceBonus, type: "attendance" });
  }
  
  // Sales commission
  if (salesTotal > 0) {
    const commission = calculateSalesCommission(salesTotal, role);
    if (commission > 0) {
      bonuses.push({ name: "Sales Commission", amount: commission, type: "sales" });
    }
  }
  
  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  
  // Gross pay
  const grossPay = baseSalary + totalAllowances + totalBonuses + overtimePay;
  
  // Statutory deductions
  const nassit = applyNASSIT ? calculateNASSIT(grossPay) : { employee: 0, employer: 0 };
  const annualGross = grossPay * 12;
  const payeTax = applyPAYE ? calculatePAYE(annualGross) : 0;
  
  // All deductions
  const statutoryDeductions = [];
  if (applyNASSIT && nassit.employee > 0) {
    statutoryDeductions.push({ name: "NASSIT (5%)", amount: nassit.employee, type: "statutory", statutory: true });
  }
  if (applyPAYE && payeTax > 0) {
    statutoryDeductions.push({ name: "PAYE Tax", amount: payeTax, type: "statutory", statutory: true });
  }
  
  const allDeductions = [...statutoryDeductions, ...customDeductions];
  const totalDeductions = allDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  // Net pay
  const netPay = grossPay - totalDeductions;
  
  return {
    baseSalary,
    hourlyRate,
    hoursWorked,
    overtimeHours,
    overtimePay,
    allowances: allAllowances,
    totalAllowances,
    bonuses,
    totalBonuses,
    grossPay,
    nassitEmployee: nassit.employee,
    nassitEmployer: nassit.employer,
    payeTax,
    deductions: allDeductions,
    totalDeductions,
    netPay,
  };
}

// Format currency for Sierra Leone
export function formatSLE(amount) {
  return `SLE ${Math.round(amount).toLocaleString()}`;
}

// Get tax bracket info for an amount
export function getTaxBracketInfo(annualIncome) {
  const brackets = [];
  let remainingIncome = annualIncome;
  
  for (const bracket of SL_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const bracketSize = bracket.max - bracket.min + (bracket.min === 0 ? 0 : 1);
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    
    if (annualIncome > bracket.min) {
      brackets.push({
        range: `${formatSLE(bracket.min)} - ${bracket.max === Infinity ? 'Above' : formatSLE(bracket.max)}`,
        rate: `${bracket.rate * 100}%`,
        taxable: taxableInBracket,
        tax: taxableInBracket * bracket.rate,
      });
      remainingIncome -= taxableInBracket;
    }
  }
  
  return brackets;
}