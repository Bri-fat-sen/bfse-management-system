import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Calculator, Shield } from "lucide-react";
import { SL_TAX_BRACKETS, NASSIT_EMPLOYEE_RATE, NASSIT_EMPLOYER_RATE, formatSLE } from "./PayrollCalculator";

export default function TaxCalculatorInfo() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white">
          <span className="text-2xl">🇸🇱</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">Sierra Leone Tax Regulations</h2>
          <p className="text-sm text-gray-500">2024 Statutory Deduction Rates</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PAYE Tax Brackets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0072C6]" />
              PAYE Income Tax Brackets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Pay As You Earn (PAYE) is calculated progressively based on annual income.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Annual Income Range</TableHead>
                  <TableHead className="text-right">Tax Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SL_TAX_BRACKETS.map((bracket, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {formatSLE(bracket.min)} - {bracket.max === Infinity ? '∞' : formatSLE(bracket.max)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={bracket.rate === 0 ? 'secondary' : 'default'} className={
                        bracket.rate >= 0.25 ? 'bg-red-500' : 
                        bracket.rate >= 0.15 ? 'bg-orange-500' : ''
                      }>
                        {bracket.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <Info className="w-4 h-4 inline mr-2" />
              Tax is calculated progressively across brackets, not on total income at highest rate.
            </div>
          </CardContent>
        </Card>

        {/* NASSIT */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1EB053]" />
              NASSIT Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              National Social Security and Insurance Trust contributions are mandatory for all employees.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-800">Employee Contribution</p>
                    <p className="text-sm text-green-600">Deducted from gross pay</p>
                  </div>
                  <Badge className="bg-[#1EB053] text-2xl px-4 py-2">
                    {NASSIT_EMPLOYEE_RATE * 100}%
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-800">Employer Contribution</p>
                    <p className="text-sm text-blue-600">Additional cost to employer</p>
                  </div>
                  <Badge className="bg-[#0072C6] text-2xl px-4 py-2">
                    {NASSIT_EMPLOYER_RATE * 100}%
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-purple-800">Total Contribution</p>
                    <p className="text-sm text-purple-600">Combined rate</p>
                  </div>
                  <Badge variant="outline" className="text-2xl px-4 py-2 border-purple-300 text-purple-700">
                    {(NASSIT_EMPLOYEE_RATE + NASSIT_EMPLOYER_RATE) * 100}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
              <Info className="w-4 h-4 inline mr-2" />
              NASSIT provides retirement benefits, disability support, and survivor benefits.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Example Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Annual Income</TableHead>
                  <TableHead>NASSIT (5%)</TableHead>
                  <TableHead>PAYE Tax</TableHead>
                  <TableHead>Total Deductions</TableHead>
                  <TableHead className="text-[#1EB053]">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[500000, 1000000, 2000000, 5000000].map(monthly => {
                  const annual = monthly * 12;
                  const nassit = monthly * 0.05;
                  // Simplified PAYE calculation for display
                  let paye = 0;
                  if (annual > 2000000) paye = ((annual - 2000000) * 0.30 + 500000 * 0.25 + 500000 * 0.20 + 500000 * 0.15) / 12;
                  else if (annual > 1500000) paye = ((annual - 1500000) * 0.25 + 500000 * 0.20 + 500000 * 0.15) / 12;
                  else if (annual > 1000000) paye = ((annual - 1000000) * 0.20 + 500000 * 0.15) / 12;
                  else if (annual > 500000) paye = (annual - 500000) * 0.15 / 12;
                  
                  const totalDeductions = nassit + paye;
                  const netPay = monthly - totalDeductions;
                  
                  return (
                    <TableRow key={monthly}>
                      <TableCell className="font-medium">{formatSLE(monthly)}</TableCell>
                      <TableCell>{formatSLE(annual)}</TableCell>
                      <TableCell className="text-red-600">-{formatSLE(nassit)}</TableCell>
                      <TableCell className="text-red-600">-{formatSLE(Math.round(paye))}</TableCell>
                      <TableCell className="text-red-600 font-medium">-{formatSLE(Math.round(totalDeductions))}</TableCell>
                      <TableCell className="text-[#1EB053] font-bold">{formatSLE(Math.round(netPay))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}