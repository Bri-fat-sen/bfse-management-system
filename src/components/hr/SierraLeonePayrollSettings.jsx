import React from "react";
import { Shield, Info, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NASSIT_RATES, TAX_BRACKETS, formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";

export default function SierraLeonePayrollSettings({ orgId, currentEmployee }) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1EB053]" />
            NASSIT Contribution Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1EB053]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Employee Contribution</p>
              <p className="text-2xl font-bold text-[#1EB053]">{(NASSIT_RATES.EMPLOYEE_RATE * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-[#0072C6]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Employer Contribution</p>
              <p className="text-2xl font-bold text-[#0072C6]">{(NASSIT_RATES.EMPLOYER_RATE * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Salary Ceiling</p>
              <p className="text-xl font-bold text-amber-600">{formatLeone(NASSIT_RATES.MAX_MONTHLY_SALARY)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              NASSIT contributions are capped at Le 10,000,000 monthly salary. Any salary above this amount is not subject to additional NASSIT contributions.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#0072C6]" />
            PAYE Tax Brackets (2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TAX_BRACKETS.map((bracket, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatLeone(bracket.min)} - {bracket.max === Infinity ? 'Above' : formatLeone(bracket.max)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bracket.min === 0 ? 'Tax Free Threshold' : `Tax Rate: ${(bracket.rate * 100).toFixed(0)}%`}
                  </p>
                </div>
                <Badge className={
                  bracket.rate === 0 ? "bg-green-100 text-green-800" :
                  bracket.rate <= 0.20 ? "bg-blue-100 text-blue-800" :
                  bracket.rate <= 0.25 ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                }>
                  {(bracket.rate * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mt-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              PAYE is calculated on taxable income (Gross Salary - Employee NASSIT Contribution). Tax is applied progressively across brackets.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Compliance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-[#1EB053]/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🇸🇱 Sierra Leone Labor Laws</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Annual Leave: Minimum 21 days per year</li>
              <li>• Sick Leave: 10 days per year with full pay</li>
              <li>• Maternity Leave: 90 days (12 weeks)</li>
              <li>• Paternity Leave: 5 days</li>
              <li>• Working Hours: Maximum 8 hours per day, 40 hours per week</li>
            </ul>
          </div>
          <div className="p-4 border border-[#0072C6]/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📋 Monthly Compliance Checklist</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Process payroll and calculate NASSIT contributions</li>
              <li>✓ Calculate and withhold PAYE tax</li>
              <li>✓ Submit NASSIT contributions by 15th of following month</li>
              <li>✓ Submit PAYE returns to NRA by 15th of following month</li>
              <li>✓ Maintain payroll records for audit purposes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}