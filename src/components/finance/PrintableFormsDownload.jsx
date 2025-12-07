import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  DollarSign,
  Receipt,
  Truck,
  ShoppingCart,
  Fuel,
  Wrench,
  Users,
  Package,
  Printer,
  Zap,
  Home,
  Megaphone,
  Shield,
  Coins,
  MapPin,
  Bus,
  FileCheck,
  Briefcase,
  Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

const FORM_TEMPLATES = [
  // EXPENSE FORMS
  { id: 'expense_fuel', name: 'Fuel Expense Form', description: 'Track vehicle fuel purchases', icon: Fuel, color: 'bg-orange-100 text-orange-600', category: 'expense' },
  { id: 'expense_maintenance', name: 'Maintenance Expense Form', description: 'Vehicle or equipment repairs', icon: Wrench, color: 'bg-yellow-100 text-yellow-600', category: 'expense' },
  { id: 'expense_utilities', name: 'Utilities Expense Form', description: 'Electricity, water, internet bills', icon: Zap, color: 'bg-sky-100 text-sky-600', category: 'expense' },
  { id: 'expense_supplies', name: 'Supplies Expense Form', description: 'Office and operational supplies', icon: Package, color: 'bg-blue-100 text-blue-600', category: 'expense' },
  { id: 'expense_rent', name: 'Rent Expense Form', description: 'Office, warehouse, parking rent', icon: Home, color: 'bg-purple-100 text-purple-600', category: 'expense' },
  { id: 'expense_salaries', name: 'Salary/Wages Form', description: 'Employee payment records', icon: Users, color: 'bg-indigo-100 text-indigo-600', category: 'expense' },
  { id: 'expense_transport', name: 'Transport Expense Form', description: 'Travel and transport costs', icon: Bus, color: 'bg-teal-100 text-teal-600', category: 'expense' },
  { id: 'expense_marketing', name: 'Marketing Expense Form', description: 'Advertising and promotions', icon: Megaphone, color: 'bg-pink-100 text-pink-600', category: 'expense' },
  { id: 'expense_insurance', name: 'Insurance Expense Form', description: 'Vehicle and business insurance', icon: Shield, color: 'bg-emerald-100 text-emerald-600', category: 'expense' },
  { id: 'expense_petty_cash', name: 'Petty Cash Form', description: 'Small daily expenses', icon: Coins, color: 'bg-amber-100 text-amber-600', category: 'expense' },
  { id: 'expense_truck_contract', name: 'Truck Contract Expense Form', description: 'Fuel, tolls, loading, accommodation', icon: Truck, color: 'bg-slate-100 text-slate-600', category: 'expense' },
  { id: 'expense_general', name: 'General Expense Form', description: 'Other miscellaneous expenses', icon: Receipt, color: 'bg-gray-100 text-gray-600', category: 'expense' },
  // REVENUE FORMS
  { id: 'revenue_retail_sales', name: 'Retail Sales Form', description: 'Direct customer sales', icon: ShoppingCart, color: 'bg-green-100 text-green-600', category: 'revenue' },
  { id: 'revenue_warehouse_sales', name: 'Warehouse/Wholesale Sales Form', description: 'Bulk and wholesale sales', icon: Package, color: 'bg-lime-100 text-lime-600', category: 'revenue' },
  { id: 'revenue_vehicle_sales', name: 'Vehicle Sales Form', description: 'Mobile vehicle sales', icon: Truck, color: 'bg-cyan-100 text-cyan-600', category: 'revenue' },
  { id: 'revenue_trip', name: 'Trip Revenue Form', description: 'Passenger trips and ticket sales', icon: MapPin, color: 'bg-violet-100 text-violet-600', category: 'revenue' },
  { id: 'revenue_truck_contract', name: 'Truck Contract Revenue Form', description: 'Cargo hauling contracts', icon: FileCheck, color: 'bg-teal-100 text-teal-600', category: 'revenue' },
  { id: 'revenue_other', name: 'Other Income Form', description: 'Miscellaneous revenue sources', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', category: 'revenue' }
];

const generateFormHTML = (formType, org) => {
  const today = new Date().toLocaleDateString('en-GB');
  const orgName = org?.name || 'Organisation Name';
  const orgPhone = org?.phone || '';
  const orgEmail = org?.email || '';
  
  // Use the unified PDF styles
  const unifiedStyles = getUnifiedPDFStyles(org, 'report');
  
  const commonStyles = `
    <style>
      ${unifiedStyles}
      
      .instructions {
        background: var(--gray-50);
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 24px;
        border-left: 4px solid var(--primary);
      }
      
      .instructions h3 {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 10px;
        color: var(--gray-800);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .instructions ol {
        margin-left: 20px;
        font-size: 12px;
        color: var(--gray-600);
        line-height: 1.8;
      }
      
      .instructions li {
        margin-bottom: 6px;
      }
      
      .form-section {
        margin-bottom: 28px;
        page-break-inside: avoid;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
      }
      
      .form-field.full-width {
        grid-column: 1 / -1;
      }
      
      .form-field label {
        font-size: 11px;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 6px;
      }
      
      .form-field label .required {
        color: var(--danger);
        font-weight: 700;
      }
      
      .form-field .input-box {
        border: 2px solid var(--gray-200);
        border-radius: 6px;
        padding: 10px 12px;
        min-height: 40px;
        background: white;
      }
      
      .form-field .input-box.large {
        min-height: 80px;
      }
      
      .signature-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 30px;
        page-break-inside: avoid;
      }
      
      .signature-box {
        border-top: 2px solid var(--gray-800);
        padding-top: 10px;
      }
      
      .signature-box p {
        font-size: 11px;
        color: var(--gray-600);
        margin-top: 4px;
      }
      
      .signature-box strong {
        color: var(--gray-800);
        font-size: 12px;
      }
    </style>
  `;

  const footer = getUnifiedFooter(org);

  const signatureSection = `
    <div class="signature-section">
      <div class="signature-box">
        <p><strong>Prepared By:</strong></p>
        <p style="margin-top: 50px;">Name: _______________________________</p>
        <p>Date: _______________________________</p>
      </div>
      <div class="signature-box">
        <p><strong>Approved By:</strong></p>
        <p style="margin-top: 50px;">Name: _______________________________</p>
        <p>Date: _______________________________</p>
      </div>
    </div>
  `;
  
  const getInstructions = (formName, formType) => `
    <div class="instructions">
      <h3>📋 Instructions - ${formName.toUpperCase()}</h3>
      <ol>
        <li><strong>DOCUMENT TYPE: ${formName.toUpperCase()}</strong></li>
        <li>Fill in all required fields with clear, legible handwriting</li>
        <li>Use black or blue ink only</li>
        <li>Write all amounts and details clearly</li>
        <li>After completing, scan or photograph this form</li>
        <li>Upload using "Upload Document" in ${formType === 'expense' ? 'Expense Management' : 'Finance'} section</li>
        <li>The system will automatically extract and create ${formType} records</li>
      </ol>
    </div>
  `;

  const getHeader = (formName) => getUnifiedHeader(org, formName, `${formType.toUpperCase().slice(0,3)}-FORM`, today, 'report');
  
  const forms = {
    expense_fuel: `
      ${getHeader('Fuel Expense Form')}
      <div class="content">
        ${getInstructions('Fuel Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">⛽</div>
            Fuel Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vehicle Registration <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Driver Name</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Fuel Station</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Current Mileage (km)</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">⛽</div>
            Fuel Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Fuel Type</th><th>Litres <span class="required">*</span></th><th>Price/Litre (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              <tr><td>☐ Petrol  ☐ Diesel</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Receipt Number</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field full-width">
              <label>Notes</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_maintenance: `
      ${getHeader('Maintenance Expense Form')}
      <div class="content">
        ${getInstructions('Maintenance Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🔧</div>
            Vehicle Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vehicle Registration <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Current Mileage</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Maintenance Type <span class="required">*</span></label>
            <div class="input-box">☐ Oil Change  ☐ Tire Rotation  ☐ Tire Replacement  ☐ Brake Service  ☐ Engine Repair  ☐ Battery  ☐ Electrical  ☐ Other</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Parts & Labor
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Part Name</th><th>Qty</th><th>Unit Cost (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 5 }, (_, i) => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr><td>Labour Cost</td><td>-</td><td>-</td><td></td></tr>
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Vendor/Mechanic</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Next Service Date</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_utilities: `
      ${getHeader('Utilities Expense Form')}
      <div class="content">
        ${getInstructions('Utilities Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">⚡</div>
            Utility Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Bill Period</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Utility Type <span class="required">*</span></label>
            <div class="input-box">☐ Electricity  ☐ Water  ☐ Internet  ☐ Phone  ☐ Generator Fuel</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Utility Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description <span class="required">*</span></th><th>Meter Reading</th><th>Units</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 3 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Account Number</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Receipt Number</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_supplies: `
      ${getHeader('Supplies Expense Form')}
      <div class="content">
        ${getInstructions('Supplies Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">📦</div>
            Purchase Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Supplier</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Invoice No.</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Items Purchased
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Item Description <span class="required">*</span></th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_rent: `
      ${getHeader('Rent Expense Form')}
      <div class="content">
        ${getInstructions('Rent Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🏢</div>
            Rent Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date Paid <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Rent Period</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Property Type <span class="required">*</span></label>
            <div class="input-box">☐ Office  ☐ Warehouse  ☐ Shop  ☐ Parking</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Rent Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Property/Location <span class="required">*</span></th><th>Address</th><th>Monthly Rent (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 3 }, () => `<tr><td>&nbsp;</td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="2">TOTAL RENT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Landlord Name</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Receipt Number</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_salaries: `
      ${getHeader('Salary / Wages Form')}
      <div class="content">
        ${getInstructions('Salary / Wages Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">👥</div>
            Payroll Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Pay Period <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Payment Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Employee Payments
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Employee <span class="required">*</span></th><th>Position</th><th>Days</th><th>Basic (Le)</th><th>Allowances</th><th>Deductions</th><th>Net Pay <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 8 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="6">TOTAL PAYROLL</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_transport: `
      ${getHeader('Transport Expense Form')}
      <div class="content">
        ${getInstructions('Transport Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🚌</div>
            Transport Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Employee Name</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Trip Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>From <span class="required">*</span></th><th>To <span class="required">*</span></th><th>Purpose</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 8 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_marketing: `
      ${getHeader('Marketing Expense Form')}
      <div class="content">
        ${getInstructions('Marketing Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">📢</div>
            Campaign Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Campaign Name</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Marketing Type <span class="required">*</span></label>
            <div class="input-box">☐ Radio/TV  ☐ Print  ☐ Social Media  ☐ Event  ☐ Billboard</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Marketing Expenses
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description <span class="required">*</span></th><th>Vendor</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 6 }, () => `<tr><td>&nbsp;</td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="2">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_insurance: `
      ${getHeader('Insurance Expense Form')}
      <div class="content">
        ${getInstructions('Insurance Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🛡️</div>
            Insurance Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date Paid <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Policy Number</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Insurance Type <span class="required">*</span></label>
            <div class="input-box">☐ Vehicle  ☐ Property  ☐ Business  ☐ Cargo</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Insurance Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Item Insured <span class="required">*</span></th><th>Coverage Period</th><th>Premium (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 4 }, () => `<tr><td>&nbsp;</td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="2">TOTAL PREMIUM</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Insurance Company</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Expiry Date</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_petty_cash: `
      ${getHeader('Petty Cash Form')}
      <div class="content">
        ${getInstructions('Petty Cash Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">💰</div>
            Petty Cash Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Requested By</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Opening Balance (Le)</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Closing Balance (Le)</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Expense Items
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Date</th><th>Description <span class="required">*</span></th><th>Amount (Le) <span class="required">*</span></th><th>Receipt #</th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="2">TOTAL SPENT</td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_truck_contract: `
      ${getHeader('Truck Contract Expense Form')}
      <div class="content">
        ${getInstructions('Truck Contract Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🚛</div>
            Contract Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Contract Number</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vehicle</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Driver</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Contract Expenses
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Category <span class="required">*</span></th><th>Description</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              <tr><td>Fuel</td><td></td><td></td></tr>
              <tr><td>Tolls</td><td></td><td></td></tr>
              <tr><td>Loading</td><td></td><td></td></tr>
              <tr><td>Unloading</td><td></td><td></td></tr>
              <tr><td>Food/Accommodation</td><td></td><td></td></tr>
              <tr><td>Other</td><td></td><td></td></tr>
              <tr class="total-row"><td colspan="2">TOTAL EXPENSES</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    expense_general: `
      ${getHeader('General Expense Form')}
      <div class="content">
        ${getInstructions('General Expense Form', 'expense')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Expense Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Invoice No.</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vendor</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">💰</div>
            Expense Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description <span class="required">*</span></th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-field full-width">
            <label>Payment Method <span class="required">*</span></label>
            <div class="input-box">☐ Cash  ☐ Bank Transfer  ☐ Mobile Money</div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_retail_sales: `
      ${getHeader('Retail Sales Form')}
      <div class="content">
        ${getInstructions('Retail Sales Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🛒</div>
            Sales Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Receipt No.</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Sales Person</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Customer Name</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Customer Phone</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Items Sold
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Product <span class="required">*</span></th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr><td colspan="3">Discount</td><td></td></tr>
              <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-field full-width">
            <label>Payment Method <span class="required">*</span></label>
            <div class="input-box">☐ Cash  ☐ Mobile Money  ☐ Card  ☐ Credit</div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_warehouse_sales: `
      ${getHeader('Warehouse/Wholesale Sales Form')}
      <div class="content">
        ${getInstructions('Warehouse/Wholesale Sales Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">📦</div>
            Sales Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Invoice No.</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Customer/Business <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Delivery Address</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Items Sold
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Product <span class="required">*</span></th><th>SKU</th><th>Qty</th><th>Wholesale Price (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`).join('')}
              <tr><td colspan="4">Bulk Discount</td><td></td></tr>
              <tr class="total-row"><td colspan="4">TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_vehicle_sales: `
      ${getHeader('Vehicle Sales Form')}
      <div class="content">
        ${getInstructions('Vehicle Sales Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🚐</div>
            Sales Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vehicle</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Driver</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Route/Location</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Customer</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Items Sold
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Product <span class="required">*</span></th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, () => `<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">TOTAL SALES</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_trip: `
      ${getHeader('Trip Revenue Form')}
      <div class="content">
        ${getInstructions('Trip Revenue Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🗺️</div>
            Trip Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Trip No.</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Vehicle</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Driver</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Route <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📈</div>
            Trip Revenue
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              <tr><td>Number of Passengers</td><td></td></tr>
              <tr><td>Ticket Price per Passenger</td><td></td></tr>
              <tr><td><strong>Total Ticket Revenue</strong></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">💸</div>
            Trip Expenses
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Expense Type</th><th>Amount (Le)</th></tr>
            </thead>
            <tbody>
              <tr><td>Fuel Cost</td><td></td></tr>
              <tr><td>Other Expenses</td><td></td></tr>
              <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_truck_contract: `
      ${getHeader('Truck Contract Revenue Form')}
      <div class="content">
        ${getInstructions('Truck Contract Revenue Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">🚛</div>
            Contract Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Contract No.</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Client <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Vehicle</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Driver</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Pickup Location</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Delivery Location</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Contract Summary
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description</th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Contract Amount</strong></td><td></td></tr>
              <tr><td>Less: Fuel</td><td></td></tr>
              <tr><td>Less: Tolls</td><td></td></tr>
              <tr><td>Less: Other Expenses</td><td></td></tr>
              <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
            </tbody>
          </table>
        </div>

        ${signatureSection}
      </div>
    `,
    revenue_other: `
      ${getHeader('Other Income Form')}
      <div class="content">
        ${getInstructions('Other Income Form', 'revenue')}
        <div class="form-section">
          <div class="section-title">
            <div class="icon">💵</div>
            Income Information
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Date <span class="required">*</span></label>
              <div class="input-box"></div>
            </div>
            <div class="form-field">
              <label>Reference No.</label>
              <div class="input-box"></div>
            </div>
          </div>
          <div class="form-field full-width">
            <label>Income Source <span class="required">*</span></label>
            <div class="input-box">☐ Service Fee  ☐ Rental Income  ☐ Commission  ☐ Refund  ☐ Other</div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <div class="icon">📋</div>
            Income Details
          </div>
          <table class="data-table">
            <thead>
              <tr><th>Description <span class="required">*</span></th><th>Amount (Le) <span class="required">*</span></th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 5 }, () => `<tr><td>&nbsp;</td><td></td></tr>`).join('')}
              <tr class="total-row"><td>TOTAL AMOUNT</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="form-section">
          <div class="form-grid">
            <div class="form-field">
              <label>Received From</label>
              <div class="input-box"></div>
            </div>
            <div class="form-field full-width">
              <label>Notes</label>
              <div class="input-box"></div>
            </div>
          </div>
        </div>

        ${signatureSection}
      </div>
    `
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${FORM_TEMPLATES.find(f => f.id === formType)?.name || 'Form'}</title>
      ${commonStyles}
    </head>
    <body>
      <div class="document">
        ${forms[formType] || ''}
      </div>
    </body>
    </html>
  `;
};

export default function PrintableFormsDownload({ open, onOpenChange, organisation, filterForms = null }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(null);
  
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const filteredTemplates = filterForms 
    ? FORM_TEMPLATES.filter(f => filterForms.includes(f.id))
    : FORM_TEMPLATES;

  const handleDownload = async (formId) => {
    setLoading(formId);
    try {
      const html = generateFormHTML(formId, organisation);
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      };
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadAll = (category) => {
    const forms = filteredTemplates.filter(f => category === 'all' || f.category === category);
    forms.forEach((form, index) => {
      setTimeout(() => handleDownload(form.id), index * 1500);
    });
  };

  const expenseForms = filteredTemplates.filter(f => f.category === 'expense');
  const revenueForms = filteredTemplates.filter(f => f.category === 'revenue');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#10b981]" />
            Printable Data Entry Forms
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Download and print forms for manual data collection.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-160px)] p-6">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadAll('expense')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All Expense Forms
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadAll('revenue')}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All Revenue Forms
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Expense Forms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenseForms.map((form) => {
                const Icon = form.icon;
                return (
                  <Card 
                    key={form.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleDownload(form.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${form.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{form.name}</p>
                        <p className="text-xs text-gray-500">{form.description}</p>
                      </div>
                      {loading === form.id ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Printer className="w-4 h-4 text-gray-400" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue Forms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {revenueForms.map((form) => {
                const Icon = form.icon;
                return (
                  <Card 
                    key={form.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleDownload(form.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${form.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{form.name}</p>
                        <p className="text-xs text-gray-500">{form.description}</p>
                      </div>
                      {loading === form.id ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Printer className="w-4 h-4 text-gray-400" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        </div>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}