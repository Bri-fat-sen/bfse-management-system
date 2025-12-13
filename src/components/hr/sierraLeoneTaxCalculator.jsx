// Sierra Leone Tax and NASSIT Calculator

// NASSIT Rates (National Social Security and Insurance Trust)
export const NASSIT_RATES = {
  EMPLOYEE_RATE: 0.05,    // 5% employee contribution
  EMPLOYER_RATE: 0.10,    // 10% employer contribution
  MAX_MONTHLY_SALARY: 10000000, // Le 10,000,000 ceiling
};

// Sierra Leone Income Tax Brackets (2024) - Pay As You Earn (PAYE)
export const TAX_BRACKETS = [
  { min: 0, max: 600000, rate: 0 },              // Le 0 - 600,000: Tax Free
  { min: 600000, max: 1200000, rate: 0.15 },    // Le 600,001 - 1,200,000: 15%
  { min: 1200000, max: 2400000, rate: 0.20 },   // Le 1,200,001 - 2,400,000: 20%
  { min: 2400000, max: 4800000, rate: 0.25 },   // Le 2,400,001 - 4,800,000: 25%
  { min: 4800000, max: Infinity, rate: 0.30 },  // Above Le 4,800,000: 30%
];

/**
 * Calculate NASSIT contributions for employee and employer
 */
export function calculateNASSIT(grossSalary) {
  const cappedSalary = Math.min(grossSalary, NASSIT_RATES.MAX_MONTHLY_SALARY);
  
  return {
    employeeContribution: cappedSalary * NASSIT_RATES.EMPLOYEE_RATE,
    employerContribution: cappedSalary * NASSIT_RATES.EMPLOYER_RATE,
    totalContribution: cappedSalary * (NASSIT_RATES.EMPLOYEE_RATE + NASSIT_RATES.EMPLOYER_RATE),
    cappedSalary,
    isCapped: grossSalary > NASSIT_RATES.MAX_MONTHLY_SALARY,
  };
}

/**
 * Calculate PAYE (Pay As You Earn) income tax for Sierra Leone
 */
export function calculatePAYE(monthlyGrossSalary, nassitEmployeeContribution) {
  // Taxable income is gross salary minus employee NASSIT contribution
  const taxableIncome = monthlyGrossSalary - nassitEmployeeContribution;
  
  let tax = 0;
  let previousMax = 0;
  
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
      previousMax = bracket.max;
    } else {
      break;
    }
  }
  
  return {
    taxableIncome,
    tax,
    effectiveRate: taxableIncome > 0 ? (tax / taxableIncome) * 100 : 0,
  };
}

/**
 * Calculate complete salary breakdown for Sierra Leone
 */
export function calculateSalaryBreakdown(basicSalary, allowances = {}, deductions = {}) {
  // Total allowances
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0);
  
  // Gross salary
  const grossSalary = basicSalary + totalAllowances;
  
  // NASSIT calculations
  const nassit = calculateNASSIT(grossSalary);
  
  // PAYE tax calculation
  const paye = calculatePAYE(grossSalary, nassit.employeeContribution);
  
  // Other deductions
  const otherDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  // Total deductions
  const totalDeductions = nassit.employeeContribution + paye.tax + otherDeductions;
  
  // Net salary
  const netSalary = grossSalary - totalDeductions;
  
  return {
    basicSalary,
    allowances,
    totalAllowances,
    grossSalary,
    nassit: {
      employee: nassit.employeeContribution,
      employer: nassit.employerContribution,
      total: nassit.totalContribution,
      isCapped: nassit.isCapped,
    },
    paye: {
      taxableIncome: paye.taxableIncome,
      tax: paye.tax,
      effectiveRate: paye.effectiveRate,
    },
    otherDeductions,
    totalDeductions,
    netSalary,
    employerCost: grossSalary + nassit.employerContribution,
  };
}

/**
 * Format Sierra Leone Leone (Le) currency
 */
export function formatLeone(amount) {
  return `Le ${amount.toLocaleString('en-SL', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Calculate annual tax and NASSIT summary
 */
export function calculateAnnualSummary(monthlySalaryBreakdown) {
  return {
    annualGross: monthlySalaryBreakdown.grossSalary * 12,
    annualNassitEmployee: monthlySalaryBreakdown.nassit.employee * 12,
    annualNassitEmployer: monthlySalaryBreakdown.nassit.employer * 12,
    annualPAYE: monthlySalaryBreakdown.paye.tax * 12,
    annualDeductions: monthlySalaryBreakdown.totalDeductions * 12,
    annualNet: monthlySalaryBreakdown.netSalary * 12,
    annualEmployerCost: monthlySalaryBreakdown.employerCost * 12,
  };
}