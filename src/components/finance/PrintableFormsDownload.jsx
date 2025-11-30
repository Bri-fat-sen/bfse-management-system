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
  Briefcase
} from "lucide-react";

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
  const orgInitials = orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const orgAddress = org?.address || '';
  const orgCity = org?.city || '';
  const orgPhone = org?.phone || '';
  const orgEmail = org?.email || '';
  
  const commonStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      
      :root {
        --primary: #0f172a;
        --primary-light: #1e293b;
        --accent: #3b82f6;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --gray-50: #f8fafc;
        --gray-100: #f1f5f9;
        --gray-200: #e2e8f0;
        --gray-300: #cbd5e1;
        --gray-400: #94a3b8;
        --gray-500: #64748b;
        --gray-600: #475569;
        --gray-700: #334155;
        --gray-800: #1e293b;
        --gray-900: #0f172a;
      }
      
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body { 
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 12px; 
        line-height: 1.6; 
        color: var(--gray-800);
        background: white;
        -webkit-font-smoothing: antialiased;
      }
      
      .document {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
      }
      
      /* Header */
      .header-accent {
        height: 4px;
        background: linear-gradient(90deg, var(--success), var(--accent));
      }
      
      .header {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
        color: white;
        padding: 24px 32px;
        position: relative;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .org-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .org-logo {
        width: 48px;
        height: 48px;
        background: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      .org-logo span {
        background: linear-gradient(135deg, var(--success), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .org-info h1 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 2px;
      }
      
      .org-info .location {
        font-size: 11px;
        opacity: 0.8;
      }
      
      .header-meta {
        text-align: right;
        font-size: 11px;
        opacity: 0.7;
      }
      
      /* Form Title */
      .form-title {
        background: var(--gray-50);
        padding: 20px 32px;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .form-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--success), var(--accent));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      .form-title h2 {
        font-size: 18px;
        font-weight: 700;
        color: var(--gray-900);
      }
      
      /* Content */
      .content {
        padding: 24px 32px;
      }
      
      /* Field Styles */
      .field-row { display: flex; margin-bottom: 16px; gap: 16px; }
      .field { flex: 1; }
      .field label { 
        display: block; 
        font-weight: 600; 
        font-size: 10px; 
        color: var(--gray-500); 
        margin-bottom: 6px; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .field-input { 
        border: 1px solid var(--gray-200); 
        border-radius: 8px; 
        padding: 12px 14px; 
        min-height: 24px; 
        background: white;
      }
      .field-input.large { min-height: 80px; }
      
      /* Section Title */
      .section-title { 
        font-weight: 700; 
        color: var(--gray-800);
        padding: 12px 16px;
        margin: 24px 0 16px; 
        font-size: 12px;
        background: var(--gray-50);
        border-radius: 8px;
        border-left: 4px solid var(--accent);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      /* Table Styles */
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 16px 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--gray-200);
      }
      th { 
        background: var(--gray-50);
        color: var(--gray-600);
        padding: 12px 14px; 
        text-align: left; 
        font-size: 10px; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
        border-bottom: 1px solid var(--gray-200);
      }
      td { 
        padding: 14px; 
        border-bottom: 1px solid var(--gray-100); 
        min-height: 32px;
        background: white;
      }
      tr:last-child td { border-bottom: none; }
      .total-row { background: var(--gray-900) !important; }
      .total-row td { 
        color: white;
        font-weight: 700;
        font-size: 13px;
        background: transparent !important;
      }
      
      /* Checkbox Styles */
      .checkbox-group { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 12px;
        padding: 12px;
        background: var(--gray-50);
        border-radius: 8px;
      }
      .checkbox-item { 
        display: flex; 
        align-items: center; 
        gap: 8px;
        font-size: 11px;
        color: var(--gray-700);
      }
      .checkbox { 
        width: 18px; 
        height: 18px; 
        border: 2px solid var(--gray-300); 
        border-radius: 4px;
        display: inline-block;
        background: white;
      }
      
      /* Signature Section */
      .signature-section { 
        margin-top: 48px; 
        display: flex; 
        justify-content: space-between;
        gap: 40px;
      }
      .signature-box { flex: 1; text-align: center; }
      .signature-line { 
        border-top: 2px solid var(--gray-300); 
        margin-top: 60px; 
        padding-top: 10px; 
        font-size: 11px;
        color: var(--gray-500);
        font-weight: 500;
      }
      
      /* Footer */
      .footer-accent {
        height: 4px;
        background: linear-gradient(90deg, var(--success), var(--accent));
        margin-top: 32px;
      }
      
      .footer {
        background: var(--gray-900);
        color: white;
        padding: 20px 32px;
        text-align: center;
      }
      
      .footer p {
        font-size: 11px;
        opacity: 0.7;
        margin-bottom: 4px;
      }
      
      .footer .form-id {
        font-family: 'SF Mono', 'Monaco', monospace;
        font-size: 10px;
        opacity: 0.5;
      }
      
      @media print { 
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { padding: 0; }
        .header { -webkit-print-color-adjust: exact; }
        .total-row { -webkit-print-color-adjust: exact; }
        .footer { -webkit-print-color-adjust: exact; }
      }
    </style>
  `;

  const header = `
    <div class="header-accent"></div>
    <div class="header">
      <div class="header-content">
        <div class="org-brand">
          <div class="org-logo"><span>${orgInitials}</span></div>
          <div class="org-info">
            <h1>${orgName}</h1>
            <div class="location">${orgAddress ? orgAddress + (orgCity ? ', ' + orgCity : '') : 'Sierra Leone'}</div>
          </div>
        </div>
        <div class="header-meta">
          <div>Date: ${today}</div>
          ${orgPhone ? `<div>${orgPhone}</div>` : ''}
          ${orgEmail ? `<div>${orgEmail}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  const footer = `
    <div class="footer-accent"></div>
    <div class="footer">
      <p>This form is for manual record keeping. Please enter data into the system when ready.</p>
      <div class="form-id">Form ID: ${formType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}</div>
    </div>
  `;

  const signatureSection = `
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">Prepared By (Name & Signature)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Approved By (Name & Signature)</div>
      </div>
    </div>
  `;

  const forms = {
    expense_fuel: `
      <div class="form-title"><div class="form-icon">⛽</div><h2>Fuel Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
          <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Fuel Station</label><div class="field-input"></div></div>
          <div class="field"><label>Current Mileage (km)</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">⛽ Fuel Details</div>
        <table>
          <tr><th>Fuel Type</th><th>Litres</th><th>Price per Litre (Le)</th><th>Total (Le)</th></tr>
          <tr>
            <td>
              <div class="checkbox-group">
                <div class="checkbox-item"><span class="checkbox"></span> Petrol</div>
                <div class="checkbox-item"><span class="checkbox"></span> Diesel</div>
              </div>
            </td>
            <td></td><td></td><td></td>
          </tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
          <div class="field"><label>Notes</label><div class="field-input"></div></div>
        </div>
        ${signatureSection}
      </div>
    `,
    expense_maintenance: `
      <div class="form-title"><div class="form-icon">🔧</div><h2>Maintenance Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
          <div class="field"><label>Current Mileage</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🔧 Maintenance Type</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Oil Change</div>
          <div class="checkbox-item"><span class="checkbox"></span> Tire Rotation</div>
          <div class="checkbox-item"><span class="checkbox"></span> Tire Replacement</div>
          <div class="checkbox-item"><span class="checkbox"></span> Brake Service</div>
          <div class="checkbox-item"><span class="checkbox"></span> Engine Repair</div>
          <div class="checkbox-item"><span class="checkbox"></span> Battery</div>
          <div class="checkbox-item"><span class="checkbox"></span> Electrical</div>
          <div class="checkbox-item"><span class="checkbox"></span> Other</div>
        </div>
        <div class="section-title">📦 Parts Replaced</div>
        <table>
          <tr><th>Part Name</th><th>Qty</th><th>Unit Cost (Le)</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>Labour Cost</td><td>-</td><td>-</td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Vendor/Mechanic</label><div class="field-input"></div></div>
          <div class="field"><label>Next Service Date</label><div class="field-input"></div></div>
        </div>
        ${signatureSection}
      </div>
    `,
    expense_utilities: `
      <div class="form-title"><div class="form-icon">⚡</div><h2>Utilities Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Bill Period</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">⚡ Utility Type</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Electricity</div>
          <div class="checkbox-item"><span class="checkbox"></span> Water</div>
          <div class="checkbox-item"><span class="checkbox"></span> Internet</div>
          <div class="checkbox-item"><span class="checkbox"></span> Phone</div>
          <div class="checkbox-item"><span class="checkbox"></span> Generator Fuel</div>
        </div>
        <table>
          <tr><th>Description</th><th>Meter Reading</th><th>Units</th><th>Amount (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Account Number</label><div class="field-input"></div></div>
          <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
        </div>
        ${signatureSection}
      </div>
    `,
    expense_supplies: `
      <div class="form-title"><div class="form-icon">📦</div><h2>Supplies Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Supplier</label><div class="field-input"></div></div>
          <div class="field"><label>Invoice No.</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">📦 Items Purchased</div>
        <table>
          <tr><th>Item Description</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_rent: `
      <div class="form-title"><div class="form-icon">🏢</div><h2>Rent Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date Paid</label><div class="field-input"></div></div>
          <div class="field"><label>Rent Period</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🏢 Property Type</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Office</div>
          <div class="checkbox-item"><span class="checkbox"></span> Warehouse</div>
          <div class="checkbox-item"><span class="checkbox"></span> Shop</div>
          <div class="checkbox-item"><span class="checkbox"></span> Parking</div>
        </div>
        <table>
          <tr><th>Property/Location</th><th>Address</th><th>Monthly Rent (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL RENT</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Landlord Name</label><div class="field-input"></div></div>
          <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
        </div>
        ${signatureSection}
      </div>
    `,
    expense_salaries: `
      <div class="form-title"><div class="form-icon">👥</div><h2>Salary / Wages Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Pay Period</label><div class="field-input"></div></div>
          <div class="field"><label>Payment Date</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">👥 Employee Payments</div>
        <table>
          <tr><th>Employee</th><th>Position</th><th>Days</th><th>Basic (Le)</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="6">TOTAL PAYROLL</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_transport: `
      <div class="form-title"><div class="form-icon">🚌</div><h2>Transport Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Employee Name</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🚌 Trip Details</div>
        <table>
          <tr><th>From</th><th>To</th><th>Purpose</th><th>Amount (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_marketing: `
      <div class="form-title"><div class="form-icon">📢</div><h2>Marketing Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Campaign Name</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">📢 Marketing Type</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Radio/TV</div>
          <div class="checkbox-item"><span class="checkbox"></span> Print</div>
          <div class="checkbox-item"><span class="checkbox"></span> Social Media</div>
          <div class="checkbox-item"><span class="checkbox"></span> Event</div>
          <div class="checkbox-item"><span class="checkbox"></span> Billboard</div>
        </div>
        <table>
          <tr><th>Description</th><th>Vendor</th><th>Amount (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL AMOUNT</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_insurance: `
      <div class="form-title"><div class="form-icon">🛡️</div><h2>Insurance Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date Paid</label><div class="field-input"></div></div>
          <div class="field"><label>Policy Number</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🛡️ Insurance Type</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Vehicle</div>
          <div class="checkbox-item"><span class="checkbox"></span> Property</div>
          <div class="checkbox-item"><span class="checkbox"></span> Business</div>
          <div class="checkbox-item"><span class="checkbox"></span> Cargo</div>
        </div>
        <table>
          <tr><th>Item Insured</th><th>Coverage Period</th><th>Premium (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL PREMIUM</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Insurance Company</label><div class="field-input"></div></div>
          <div class="field"><label>Expiry Date</label><div class="field-input"></div></div>
        </div>
        ${signatureSection}
      </div>
    `,
    expense_petty_cash: `
      <div class="form-title"><div class="form-icon">💰</div><h2>Petty Cash Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Requested By</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Opening Balance (Le)</label><div class="field-input"></div></div>
          <div class="field"><label>Closing Balance (Le)</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">💰 Expense Items</div>
        <table>
          <tr><th>Date</th><th>Description</th><th>Amount (Le)</th><th>Receipt #</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL SPENT</td><td></td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_truck_contract: `
      <div class="form-title"><div class="form-icon">🚛</div><h2>Truck Contract Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Contract Number</label><div class="field-input"></div></div>
          <div class="field"><label>Date</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Vehicle</label><div class="field-input"></div></div>
          <div class="field"><label>Driver</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🚛 Contract Expenses</div>
        <table>
          <tr><th>Category</th><th>Description</th><th>Amount (Le)</th></tr>
          <tr><td>Fuel</td><td></td><td></td></tr>
          <tr><td>Tolls</td><td></td><td></td></tr>
          <tr><td>Loading</td><td></td><td></td></tr>
          <tr><td>Unloading</td><td></td><td></td></tr>
          <tr><td>Food/Accommodation</td><td></td><td></td></tr>
          <tr><td>Other</td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL EXPENSES</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    expense_general: `
      <div class="form-title"><div class="form-icon">📋</div><h2>General Expense Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Invoice No.</label><div class="field-input"></div></div>
          <div class="field"><label>Vendor</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">📋 Expense Details</div>
        <table>
          <tr><th>Description</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="section-title">💳 Payment Method</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
          <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
          <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        </div>
        ${signatureSection}
      </div>
    `,
    revenue_retail_sales: `
      <div class="form-title"><div class="form-icon">🛒</div><h2>Retail Sales Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Receipt No.</label><div class="field-input"></div></div>
          <div class="field"><label>Sales Person</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Customer Name</label><div class="field-input"></div></div>
          <div class="field"><label>Customer Phone</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🛒 Items Sold</div>
        <table>
          <tr><th>Product</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td colspan="3">Discount</td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="section-title">💳 Payment Method</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
          <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
          <div class="checkbox-item"><span class="checkbox"></span> Card</div>
          <div class="checkbox-item"><span class="checkbox"></span> Credit</div>
        </div>
        ${signatureSection}
      </div>
    `,
    revenue_warehouse_sales: `
      <div class="form-title"><div class="form-icon">📦</div><h2>Warehouse/Wholesale Sales Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Invoice No.</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Customer/Business</label><div class="field-input"></div></div>
          <div class="field"><label>Delivery Address</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">📦 Items Sold</div>
        <table>
          <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Wholesale Price</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          <tr><td colspan="4">Bulk Discount</td><td></td></tr>
          <tr class="total-row"><td colspan="4">TOTAL AMOUNT</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    revenue_vehicle_sales: `
      <div class="form-title"><div class="form-icon">🚐</div><h2>Vehicle Sales Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Vehicle</label><div class="field-input"></div></div>
          <div class="field"><label>Driver</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Route/Location</label><div class="field-input"></div></div>
          <div class="field"><label>Customer</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🚐 Items Sold</div>
        <table>
          <tr><th>Product</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
          <tr class="total-row"><td colspan="3">TOTAL SALES</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    revenue_trip: `
      <div class="form-title"><div class="form-icon">🗺️</div><h2>Trip Revenue Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Trip No.</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Vehicle</label><div class="field-input"></div></div>
          <div class="field"><label>Driver</label><div class="field-input"></div></div>
          <div class="field"><label>Route</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🗺️ Trip Revenue</div>
        <table>
          <tr><th>Description</th><th>Amount (Le)</th></tr>
          <tr><td>Number of Passengers</td><td></td></tr>
          <tr><td>Ticket Price per Passenger</td><td></td></tr>
          <tr><td><strong>Total Ticket Revenue</strong></td><td></td></tr>
        </table>
        <div class="section-title">💸 Trip Expenses</div>
        <table>
          <tr><th>Expense Type</th><th>Amount (Le)</th></tr>
          <tr><td>Fuel Cost</td><td></td></tr>
          <tr><td>Other Expenses</td><td></td></tr>
          <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    revenue_truck_contract: `
      <div class="form-title"><div class="form-icon">🚛</div><h2>Truck Contract Revenue Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Contract No.</label><div class="field-input"></div></div>
          <div class="field"><label>Date</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Client</label><div class="field-input"></div></div>
          <div class="field"><label>Vehicle</label><div class="field-input"></div></div>
          <div class="field"><label>Driver</label><div class="field-input"></div></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Pickup Location</label><div class="field-input"></div></div>
          <div class="field"><label>Delivery Location</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">🚛 Contract Summary</div>
        <table>
          <tr><th>Description</th><th>Amount (Le)</th></tr>
          <tr><td><strong>Contract Amount</strong></td><td></td></tr>
          <tr><td>Less: Fuel</td><td></td></tr>
          <tr><td>Less: Tolls</td><td></td></tr>
          <tr><td>Less: Other Expenses</td><td></td></tr>
          <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
        </table>
        ${signatureSection}
      </div>
    `,
    revenue_other: `
      <div class="form-title"><div class="form-icon">💵</div><h2>Other Income Form</h2></div>
      <div class="content">
        <div class="field-row">
          <div class="field"><label>Date</label><div class="field-input"></div></div>
          <div class="field"><label>Reference No.</label><div class="field-input"></div></div>
        </div>
        <div class="section-title">💵 Income Source</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="checkbox"></span> Service Fee</div>
          <div class="checkbox-item"><span class="checkbox"></span> Rental Income</div>
          <div class="checkbox-item"><span class="checkbox"></span> Commission</div>
          <div class="checkbox-item"><span class="checkbox"></span> Refund</div>
          <div class="checkbox-item"><span class="checkbox"></span> Other</div>
        </div>
        <table>
          <tr><th>Description</th><th>Amount (Le)</th></tr>
          <tr><td>&nbsp;</td><td></td></tr>
          <tr class="total-row"><td>TOTAL AMOUNT</td><td></td></tr>
        </table>
        <div class="field-row">
          <div class="field"><label>Received From</label><div class="field-input"></div></div>
          <div class="field"><label>Notes</label><div class="field-input"></div></div>
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
        ${header}
        ${forms[formType] || ''}
        ${footer}
      </div>
    </body>
    </html>
  `;
};

export default function PrintableFormsDownload({ open, onOpenChange, organisation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleDownload = (formId) => {
    const html = generateFormHTML(formId, organisation);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadAll = (category) => {
    const forms = FORM_TEMPLATES.filter(f => category === 'all' || f.category === category);
    forms.forEach((form, index) => {
      setTimeout(() => handleDownload(form.id), index * 500);
    });
  };

  const expenseForms = FORM_TEMPLATES.filter(f => f.category === 'expense');
  const revenueForms = FORM_TEMPLATES.filter(f => f.category === 'revenue');

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

        <div className="space-y-6 mt-4">
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
                      <Download className="w-4 h-4 text-gray-400" />
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
                      <Download className="w-4 h-4 text-gray-400" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}