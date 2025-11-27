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
  // EXPENSE FORMS - Based on Expense entity categories
  {
    id: 'expense_fuel',
    name: 'Fuel Expense Form',
    description: 'Track vehicle fuel purchases',
    icon: Fuel,
    color: 'bg-orange-100 text-orange-600',
    category: 'expense'
  },
  {
    id: 'expense_maintenance',
    name: 'Maintenance Expense Form',
    description: 'Vehicle or equipment repairs',
    icon: Wrench,
    color: 'bg-yellow-100 text-yellow-600',
    category: 'expense'
  },
  {
    id: 'expense_utilities',
    name: 'Utilities Expense Form',
    description: 'Electricity, water, internet bills',
    icon: Zap,
    color: 'bg-sky-100 text-sky-600',
    category: 'expense'
  },
  {
    id: 'expense_supplies',
    name: 'Supplies Expense Form',
    description: 'Office and operational supplies',
    icon: Package,
    color: 'bg-blue-100 text-blue-600',
    category: 'expense'
  },
  {
    id: 'expense_rent',
    name: 'Rent Expense Form',
    description: 'Office, warehouse, parking rent',
    icon: Home,
    color: 'bg-purple-100 text-purple-600',
    category: 'expense'
  },
  {
    id: 'expense_salaries',
    name: 'Salary/Wages Form',
    description: 'Employee payment records',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
    category: 'expense'
  },
  {
    id: 'expense_transport',
    name: 'Transport Expense Form',
    description: 'Travel and transport costs',
    icon: Bus,
    color: 'bg-teal-100 text-teal-600',
    category: 'expense'
  },
  {
    id: 'expense_marketing',
    name: 'Marketing Expense Form',
    description: 'Advertising and promotions',
    icon: Megaphone,
    color: 'bg-pink-100 text-pink-600',
    category: 'expense'
  },
  {
    id: 'expense_insurance',
    name: 'Insurance Expense Form',
    description: 'Vehicle and business insurance',
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-600',
    category: 'expense'
  },
  {
    id: 'expense_petty_cash',
    name: 'Petty Cash Form',
    description: 'Small daily expenses',
    icon: Coins,
    color: 'bg-amber-100 text-amber-600',
    category: 'expense'
  },
  {
    id: 'expense_truck_contract',
    name: 'Truck Contract Expense Form',
    description: 'Fuel, tolls, loading, accommodation',
    icon: Truck,
    color: 'bg-slate-100 text-slate-600',
    category: 'expense'
  },
  {
    id: 'expense_general',
    name: 'General Expense Form',
    description: 'Other miscellaneous expenses',
    icon: Receipt,
    color: 'bg-gray-100 text-gray-600',
    category: 'expense'
  },
  
  // REVENUE FORMS
  {
    id: 'revenue_retail_sales',
    name: 'Retail Sales Form',
    description: 'Direct customer sales',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
    category: 'revenue'
  },
  {
    id: 'revenue_warehouse_sales',
    name: 'Warehouse/Wholesale Sales Form',
    description: 'Bulk and wholesale sales',
    icon: Package,
    color: 'bg-lime-100 text-lime-600',
    category: 'revenue'
  },
  {
    id: 'revenue_vehicle_sales',
    name: 'Vehicle Sales Form',
    description: 'Mobile vehicle sales',
    icon: Truck,
    color: 'bg-cyan-100 text-cyan-600',
    category: 'revenue'
  },
  {
    id: 'revenue_trip',
    name: 'Trip Revenue Form',
    description: 'Passenger trips and ticket sales',
    icon: MapPin,
    color: 'bg-violet-100 text-violet-600',
    category: 'revenue'
  },
  {
    id: 'revenue_truck_contract',
    name: 'Truck Contract Revenue Form',
    description: 'Cargo hauling contracts',
    icon: FileCheck,
    color: 'bg-teal-100 text-teal-600',
    category: 'revenue'
  },
  {
    id: 'revenue_other',
    name: 'Other Income Form',
    description: 'Miscellaneous revenue sources',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    category: 'revenue'
  }
];

const generateFormHTML = (formType, org) => {
  const today = new Date().toLocaleDateString('en-GB');
  const orgName = org?.name || 'Organisation Name';
  const orgAddress = org?.address || '';
  const orgCity = org?.city || '';
  const orgPhone = org?.phone || '';
  const orgEmail = org?.email || '';
  const orgOwner = org?.owner_name || '';
  
  const commonStyles = `
    <style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        font-size: 11px; 
        line-height: 1.4; 
        color: #1a1a1a;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      
      /* Sierra Leone Flag Header */
      .sl-header-container {
        background: linear-gradient(135deg, #0F1F3C 0%, #1a2d52 100%);
        padding: 20px;
        margin-bottom: 0;
        position: relative;
        overflow: hidden;
      }
      .sl-header-container::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 150px;
        height: 100%;
        background: linear-gradient(135deg, transparent 0%, rgba(30, 176, 83, 0.15) 50%, rgba(0, 114, 198, 0.15) 100%);
      }
      .sl-header-inner {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .sl-flag-icon {
        width: 50px;
        height: 35px;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        flex-shrink: 0;
      }
      .sl-flag-icon .green { background: #1EB053; height: 33.33%; }
      .sl-flag-icon .white { background: #FFFFFF; height: 33.34%; }
      .sl-flag-icon .blue { background: #0072C6; height: 33.33%; }
      .sl-header-text h1 { 
        margin: 0; 
        color: #FFFFFF; 
        font-size: 22px; 
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .sl-header-text p { 
        margin: 4px 0 0; 
        color: rgba(255,255,255,0.7); 
        font-size: 11px;
      }
      
      /* Flag Stripe Divider */
      .sl-flag-stripe {
        height: 8px;
        background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      /* Form Title Banner */
      .form-title-banner {
        background: linear-gradient(90deg, #1EB053 0%, #0072C6 100%);
        color: white;
        padding: 12px 20px;
        font-size: 16px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .form-title-banner::before {
        content: '📋';
        font-size: 18px;
      }
      
      /* Form Content */
      .form-content {
        padding: 20px;
      }
      
      /* Field Styles */
      .field-row { display: flex; margin-bottom: 15px; gap: 15px; }
      .field { flex: 1; }
      .field label { 
        display: block; 
        font-weight: 600; 
        font-size: 9px; 
        color: #0F1F3C; 
        margin-bottom: 4px; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .field-input { 
        border: 2px solid #e0e0e0; 
        border-radius: 6px; 
        padding: 10px 12px; 
        min-height: 22px; 
        background: linear-gradient(to bottom, #fafafa, #fff);
        transition: border-color 0.2s;
      }
      .field-input:hover { border-color: #1EB053; }
      .field-input.large { min-height: 70px; }
      
      /* Section Title */
      .section-title { 
        font-weight: 700; 
        color: #0F1F3C;
        background: linear-gradient(90deg, rgba(30, 176, 83, 0.1) 0%, transparent 100%);
        border-left: 4px solid #1EB053;
        padding: 8px 12px; 
        margin: 25px 0 15px; 
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      /* Table Styles */
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 15px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }
      th { 
        background: linear-gradient(to bottom, #0F1F3C, #1a2d52);
        color: white;
        padding: 10px 8px; 
        text-align: left; 
        font-size: 9px; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
      }
      td { 
        padding: 12px 8px; 
        border: 1px solid #e0e0e0; 
        min-height: 30px;
        background: #fff;
      }
      tr:nth-child(even) td { background: #f9f9f9; }
      .total-row { 
        background: linear-gradient(90deg, #e8f5e9, #e3f2fd) !important; 
        font-weight: 700;
      }
      .total-row td { 
        border-top: 2px solid #1EB053;
        font-size: 12px;
      }
      
      /* Checkbox Styles */
      .checkbox-group { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 12px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 8px;
      }
      .checkbox-item { 
        display: flex; 
        align-items: center; 
        gap: 6px;
        font-size: 10px;
      }
      .checkbox { 
        width: 16px; 
        height: 16px; 
        border: 2px solid #1EB053; 
        border-radius: 3px;
        display: inline-block;
        background: #fff;
      }
      
      /* Signature Section */
      .signature-section { 
        margin-top: 40px; 
        display: flex; 
        justify-content: space-between;
        gap: 30px;
      }
      .signature-box { 
        flex: 1;
        text-align: center;
      }
      .signature-line { 
        border-top: 2px solid #0F1F3C; 
        margin-top: 50px; 
        padding-top: 8px; 
        font-size: 10px;
        color: #666;
        font-weight: 600;
      }
      
      /* Footer */
      .sl-footer {
        margin-top: 30px;
        padding: 15px;
        background: linear-gradient(to right, #f8f9fa, #fff);
        border-top: 1px solid #e0e0e0;
        text-align: center;
      }
      .sl-footer-flag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 15px;
        background: #0F1F3C;
        border-radius: 20px;
        color: white;
        font-size: 10px;
        margin-bottom: 8px;
      }
      .sl-footer-flag .mini-stripe {
        width: 30px;
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        display: flex;
      }
      .sl-footer-flag .mini-stripe span { flex: 1; }
      .sl-footer-flag .mini-stripe .g { background: #1EB053; }
      .sl-footer-flag .mini-stripe .w { background: #fff; }
      .sl-footer-flag .mini-stripe .b { background: #0072C6; }
      .sl-footer p {
        margin: 5px 0 0;
        font-size: 9px;
        color: #999;
      }
      .sl-footer .form-id {
        font-family: monospace;
        background: #f0f0f0;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 8px;
      }
      
      /* Business Details Bar */
      .business-details-bar {
        background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
        border-bottom: 1px solid #e0e0e0;
        padding: 10px 20px;
      }
      .business-details-inner {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 10px;
        color: #555;
      }
      .business-details-inner span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      /* About Us & Terms Section */
      .about-terms-section {
        margin-top: 30px;
        page-break-inside: avoid;
      }
      .about-us-box, .terms-box {
        background: linear-gradient(to bottom, #f8f9fa, #fff);
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      }
      .about-us-box {
        border-left: 4px solid #1EB053;
      }
      .terms-box {
        border-left: 4px solid #0072C6;
      }
      .about-us-box h3, .terms-box h3 {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #0F1F3C;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .about-us-box h3::before { content: '🏢'; }
      .terms-box h3::before { content: '📜'; }
      .about-us-box p, .terms-box p {
        margin: 0;
        font-size: 10px;
        color: #555;
        line-height: 1.5;
      }
      .terms-box ol {
        margin: 0;
        padding-left: 20px;
        font-size: 9px;
        color: #555;
        line-height: 1.6;
      }
      .terms-box li {
        margin-bottom: 3px;
      }
      
      @media print { 
        body { padding: 0; }
        .sl-header-container { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sl-flag-stripe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .form-title-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sl-footer-flag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .about-us-box, .terms-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;

  const header = `
    <div class="sl-header-container">
      <div class="sl-header-inner">
        <div class="sl-flag-icon">
          <div class="green"></div>
          <div class="white"></div>
          <div class="blue"></div>
        </div>
        <div class="sl-header-text">
          <h1>${orgName || 'Organisation Name'}</h1>
          <p>Sierra Leone • Date Printed: ${today}</p>
        </div>
      </div>
    </div>
    <div class="sl-flag-stripe"></div>
    <div class="business-details-bar">
      <div class="business-details-inner">
        ${org?.address ? `<span>📍 ${org.address}${org?.city ? `, ${org.city}` : ''}</span>` : ''}
        ${org?.phone ? `<span>📞 ${org.phone}</span>` : ''}
        ${org?.email ? `<span>✉️ ${org.email}</span>` : ''}
        ${org?.owner_name ? `<span>👤 ${org.owner_name}</span>` : ''}
      </div>
    </div>
  `;

  const footer = `
    <div class="sl-footer">
      <div class="sl-footer-flag">
        <div class="mini-stripe">
          <span class="g"></span>
          <span class="w"></span>
          <span class="b"></span>
        </div>
        <span>Sierra Leone</span>
      </div>
      <p>This form is for manual record keeping. Please enter data into the system when ready.</p>
      <p class="form-id">Form ID: ${formType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}</p>
    </div>
    
    <div class="about-terms-section">
      <div class="about-us-box">
        <h3>About Us</h3>
        <p><strong>${orgName || 'Organisation Name'}</strong> is committed to providing excellent services and maintaining the highest standards of business operations in Sierra Leone. We value transparency, integrity, and accountability in all our financial transactions and record-keeping practices.</p>
      </div>
      <div class="terms-box">
        <h3>Terms & Conditions</h3>
        <ol>
          <li>All information provided on this form must be accurate and complete.</li>
          <li>This form serves as an official record and should be retained for audit purposes.</li>
          <li>Falsification of records is a serious offense and may result in disciplinary action.</li>
          <li>All financial transactions must comply with company policies and Sierra Leone regulations.</li>
          <li>Original receipts and supporting documents must be attached where applicable.</li>
          <li>Approval signatures are required before processing any financial transaction.</li>
          <li>The organisation reserves the right to verify all information provided.</li>
        </ol>
      </div>
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
    // EXPENSE FORMS
    expense_fuel: `
      <div class="form-title-banner">Fuel Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Fuel Station</label><div class="field-input"></div></div>
        <div class="field"><label>Current Mileage (km)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Fuel Details</div>
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
        <div class="field"><label>Trip/Route (if applicable)</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Notes</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
    expense_maintenance: `
      <div class="form-title-banner">Maintenance Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Current Mileage</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Maintenance Type (Check All That Apply)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Oil Change</div>
        <div class="checkbox-item"><span class="checkbox"></span> Tire Rotation</div>
        <div class="checkbox-item"><span class="checkbox"></span> Tire Replacement</div>
        <div class="checkbox-item"><span class="checkbox"></span> Brake Service</div>
        <div class="checkbox-item"><span class="checkbox"></span> Engine Repair</div>
        <div class="checkbox-item"><span class="checkbox"></span> Transmission</div>
        <div class="checkbox-item"><span class="checkbox"></span> Battery</div>
        <div class="checkbox-item"><span class="checkbox"></span> Air Filter</div>
        <div class="checkbox-item"><span class="checkbox"></span> Fuel Filter</div>
        <div class="checkbox-item"><span class="checkbox"></span> Coolant Flush</div>
        <div class="checkbox-item"><span class="checkbox"></span> Inspection</div>
        <div class="checkbox-item"><span class="checkbox"></span> Body Repair</div>
        <div class="checkbox-item"><span class="checkbox"></span> Electrical</div>
        <div class="checkbox-item"><span class="checkbox"></span> Scheduled Service</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Service Category</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Scheduled</div>
        <div class="checkbox-item"><span class="checkbox"></span> Unscheduled</div>
        <div class="checkbox-item"><span class="checkbox"></span> Emergency</div>
      </div>
      <div class="section-title">Parts Replaced</div>
      <table>
        <tr><th>Part Name</th><th>Qty</th><th>Unit Cost (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>Labour Cost</td><td>-</td><td>-</td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Vendor/Mechanic</label><div class="field-input"></div></div>
        <div class="field"><label>Vendor Contact</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Next Due Date</label><div class="field-input"></div></div>
        <div class="field"><label>Next Due Mileage</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Performed By</label><div class="field-input"></div></div>
        <div class="field"><label>Notes</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_utilities: `
      <div class="form-title-banner">Utilities Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Bill Period (From - To)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Utility Type (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Electricity (EDSA)</div>
        <div class="checkbox-item"><span class="checkbox"></span> Water (Guma Valley)</div>
        <div class="checkbox-item"><span class="checkbox"></span> Internet/WiFi</div>
        <div class="checkbox-item"><span class="checkbox"></span> Phone/Airtime</div>
        <div class="checkbox-item"><span class="checkbox"></span> Generator Fuel</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Bill Details</div>
      <table>
        <tr><th>Description</th><th>Meter Reading</th><th>Units Used</th><th>Amount (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Account/Meter Number</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Location/Premises</label><div class="field-input"></div></div>
        <div class="field"><label>Payment Method</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_supplies: `
      <div class="form-title-banner">Supplies Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Supplier Name</label><div class="field-input"></div></div>
        <div class="field"><label>Invoice/Receipt No.</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Supply Category (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Office Supplies</div>
        <div class="checkbox-item"><span class="checkbox"></span> Cleaning Supplies</div>
        <div class="checkbox-item"><span class="checkbox"></span> Stationery</div>
        <div class="checkbox-item"><span class="checkbox"></span> Equipment</div>
        <div class="checkbox-item"><span class="checkbox"></span> Safety/PPE</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Items Purchased</div>
      <table>
        <tr><th>Item Description</th><th>Qty</th><th>Unit</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="4">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit</div>
      </div>
      </div>
    `,
    expense_rent: `
      <div class="form-title-banner">Rent Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date Paid</label><div class="field-input"></div></div>
        <div class="field"><label>Rent Period (Month/Year)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Property Type (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Office Space</div>
        <div class="checkbox-item"><span class="checkbox"></span> Warehouse</div>
        <div class="checkbox-item"><span class="checkbox"></span> Shop/Retail Space</div>
        <div class="checkbox-item"><span class="checkbox"></span> Parking Space</div>
        <div class="checkbox-item"><span class="checkbox"></span> Staff Quarters</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Rent Details</div>
      <table>
        <tr><th>Property/Location</th><th>Address</th><th>Monthly Rent (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="2">TOTAL RENT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Landlord Name</label><div class="field-input"></div></div>
        <div class="field"><label>Landlord Contact</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
        <div class="field"><label>Payment Method</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_salaries: `
      <div class="form-title-banner">Salary / Wages Payment Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Pay Period</label><div class="field-input"></div></div>
        <div class="field"><label>Payment Date</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Employee Payment Details</div>
      <table>
        <tr><th>Employee Name</th><th>Position</th><th>Days Worked</th><th>Basic Pay (Le)</th><th>Allowances (Le)</th><th>Deductions (Le)</th><th>Net Pay (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="6">TOTAL PAYROLL</td><td></td></tr>
      </table>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Notes</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
    expense_transport: `
      <div class="form-title-banner">Transport Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Employee Name</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Transport Type (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Staff Transport</div>
        <div class="checkbox-item"><span class="checkbox"></span> Business Trip</div>
        <div class="checkbox-item"><span class="checkbox"></span> Delivery</div>
        <div class="checkbox-item"><span class="checkbox"></span> Taxi/Okada</div>
        <div class="checkbox-item"><span class="checkbox"></span> Poda-Poda</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Trip Details</div>
      <table>
        <tr><th>From</th><th>To</th><th>Purpose</th><th>Amount (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Receipt Number (if any)</label><div class="field-input"></div></div>
        <div class="field"><label>Approved By</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_marketing: `
      <div class="form-title-banner">Marketing Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Campaign/Event Name</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Marketing Type (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Radio/TV Advertisement</div>
        <div class="checkbox-item"><span class="checkbox"></span> Print (Flyers/Posters)</div>
        <div class="checkbox-item"><span class="checkbox"></span> Social Media</div>
        <div class="checkbox-item"><span class="checkbox"></span> Event/Sponsorship</div>
        <div class="checkbox-item"><span class="checkbox"></span> Promotional Items</div>
        <div class="checkbox-item"><span class="checkbox"></span> Billboard/Signage</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Expense Details</div>
      <table>
        <tr><th>Description</th><th>Vendor</th><th>Qty</th><th>Amount (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Expected Reach/Outcome</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
    expense_insurance: `
      <div class="form-title-banner">Insurance Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date Paid</label><div class="field-input"></div></div>
        <div class="field"><label>Policy Number</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Insurance Type (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Vehicle Insurance</div>
        <div class="checkbox-item"><span class="checkbox"></span> Property Insurance</div>
        <div class="checkbox-item"><span class="checkbox"></span> Business Insurance</div>
        <div class="checkbox-item"><span class="checkbox"></span> Employee Insurance</div>
        <div class="checkbox-item"><span class="checkbox"></span> Cargo Insurance</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Policy Details</div>
      <table>
        <tr><th>Item/Vehicle Insured</th><th>Coverage Period</th><th>Premium (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="2">TOTAL PREMIUM</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Insurance Company</label><div class="field-input"></div></div>
        <div class="field"><label>Agent/Broker</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Expiry Date</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_petty_cash: `
      <div class="form-title-banner">Petty Cash Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Requested By</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Opening Balance (Le)</label><div class="field-input"></div></div>
        <div class="field"><label>Closing Balance (Le)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Expense Items</div>
      <table>
        <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount (Le)</th><th>Receipt #</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL SPENT</td><td></td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Replenishment Needed (Le)</label><div class="field-input"></div></div>
        <div class="field"><label>Approved By</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_truck_contract: `
      <div class="form-title-banner">Truck Contract Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Contract Number</label><div class="field-input"></div></div>
        <div class="field"><label>Contract Date</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Date</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Pickup Location</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Location</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Contract Expenses</div>
      <table>
        <tr><th>Expense Category</th><th>Description</th><th>Amount (Le)</th></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Fuel</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Tolls</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Loading</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Unloading</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Repairs</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Food</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Accommodation</div></div></td><td></td><td></td></tr>
        <tr><td><div class="checkbox-group"><div class="checkbox-item"><span class="checkbox"></span> Other</div></div></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="2">TOTAL EXPENSES</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Contract Amount (Le)</label><div class="field-input"></div></div>
        <div class="field"><label>Net Revenue (Le)</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_general: `
      <div class="form-title-banner">General Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt/Invoice No.</label><div class="field-input"></div></div>
        <div class="field"><label>Vendor/Supplier</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Expense Category</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Office Supplies</div>
        <div class="checkbox-item"><span class="checkbox"></span> Communication</div>
        <div class="checkbox-item"><span class="checkbox"></span> Food/Refreshments</div>
        <div class="checkbox-item"><span class="checkbox"></span> Repairs</div>
        <div class="checkbox-item"><span class="checkbox"></span> Subscriptions</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Expense Details</div>
      <table>
        <tr><th>Description</th><th>Quantity</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Card</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Notes/Remarks</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
    
    // REVENUE FORMS
    revenue_retail_sales: `
      <div class="form-title-banner">Retail Sales Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
        <div class="field"><label>Sales Person</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Customer Name</label><div class="field-input"></div></div>
        <div class="field"><label>Customer Phone</label><div class="field-input"></div></div>
        <div class="field"><label>Location</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Items Sold</div>
      <table>
        <tr><th>Product Name</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td colspan="3">Subtotal</td><td></td></tr>
        <tr><td colspan="3">Discount</td><td></td></tr>
        <tr><td colspan="3">Tax</td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Card</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit</div>
      </div>
      </div>
    `,
    revenue_warehouse_sales: `
      <div class="form-title-banner">Warehouse/Wholesale Sales Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Invoice Number</label><div class="field-input"></div></div>
        <div class="field"><label>Sales Person</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Customer/Business Name</label><div class="field-input"></div></div>
        <div class="field"><label>Customer Phone</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Warehouse Location</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Address</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Items Sold (Wholesale)</div>
      <table>
        <tr><th>Product Name</th><th>SKU</th><th>Qty</th><th>Wholesale Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
        <tr><td colspan="4">Subtotal</td><td></td></tr>
        <tr><td colspan="4">Bulk Discount</td><td></td></tr>
        <tr class="total-row"><td colspan="4">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="section-title">Payment Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Paid in Full</div>
        <div class="checkbox-item"><span class="checkbox"></span> Partial: ____________</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit (Due: ____________)</div>
      </div>
      </div>
    `,
    revenue_vehicle_sales: `
      <div class="form-title-banner">Vehicle Sales Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Driver/Salesperson</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Sale Location/Route</label><div class="field-input"></div></div>
        <div class="field"><label>Customer Name</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Items Sold from Vehicle</div>
      <table>
        <tr><th>Product Name</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL SALES</td><td></td></tr>
      </table>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit</div>
      </div>
      </div>
    `,
    revenue_trip: `
      <div class="form-title-banner">Trip Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Trip Number</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Route Name</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Start Time</label><div class="field-input"></div></div>
        <div class="field"><label>End Time</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Trip Revenue</div>
      <table>
        <tr><th>Description</th><th>Amount (Le)</th></tr>
        <tr><td>Number of Passengers</td><td></td></tr>
        <tr><td>Ticket Price per Passenger</td><td></td></tr>
        <tr><td><strong>Total Ticket Revenue</strong></td><td></td></tr>
      </table>
      <div class="section-title">Trip Expenses</div>
      <table>
        <tr><th>Expense Type</th><th>Amount (Le)</th></tr>
        <tr><td>Fuel Cost</td><td></td></tr>
        <tr><td>Other Expenses</td><td></td></tr>
        <tr><td><strong>Total Expenses</strong></td><td></td></tr>
        <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
      </table>
      <div class="section-title">Trip Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Scheduled</div>
        <div class="checkbox-item"><span class="checkbox"></span> In Progress</div>
        <div class="checkbox-item"><span class="checkbox"></span> Completed</div>
        <div class="checkbox-item"><span class="checkbox"></span> Cancelled</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Notes</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
    revenue_truck_contract: `
      <div class="form-title-banner">Truck Contract Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Contract Number</label><div class="field-input"></div></div>
        <div class="field"><label>Contract Date</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Date</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
        <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Client Name</label><div class="field-input"></div></div>
        <div class="field"><label>Client Phone</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Pickup Location</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Location</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Cargo Description</label><div class="field-input"></div></div>
        <div class="field"><label>Cargo Weight (kg)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Contract Financial Summary</div>
      <table>
        <tr><th>Description</th><th>Amount (Le)</th></tr>
        <tr><td><strong>Contract Amount</strong></td><td></td></tr>
        <tr><td>Less: Fuel</td><td></td></tr>
        <tr><td>Less: Tolls</td><td></td></tr>
        <tr><td>Less: Loading</td><td></td></tr>
        <tr><td>Less: Unloading</td><td></td></tr>
        <tr><td>Less: Repairs</td><td></td></tr>
        <tr><td>Less: Food</td><td></td></tr>
        <tr><td>Less: Accommodation</td><td></td></tr>
        <tr><td>Less: Other</td><td></td></tr>
        <tr><td><strong>Total Expenses</strong></td><td></td></tr>
        <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
      </table>
      <div class="section-title">Contract Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Pending</div>
        <div class="checkbox-item"><span class="checkbox"></span> In Progress</div>
        <div class="checkbox-item"><span class="checkbox"></span> Completed</div>
        <div class="checkbox-item"><span class="checkbox"></span> Cancelled</div>
      </div>
      <div class="section-title">Payment Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Unpaid</div>
        <div class="checkbox-item"><span class="checkbox"></span> Partial: ____________</div>
        <div class="checkbox-item"><span class="checkbox"></span> Paid in Full</div>
      </div>
      </div>
    `,
    revenue_other: `
      <div class="form-title-banner">Other Income Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Reference Number</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Income Source (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Service Fee</div>
        <div class="checkbox-item"><span class="checkbox"></span> Rental Income</div>
        <div class="checkbox-item"><span class="checkbox"></span> Commission</div>
        <div class="checkbox-item"><span class="checkbox"></span> Interest</div>
        <div class="checkbox-item"><span class="checkbox"></span> Refund</div>
        <div class="checkbox-item"><span class="checkbox"></span> Insurance Claim</div>
        <div class="checkbox-item"><span class="checkbox"></span> Asset Sale</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Income Details</div>
      <table>
        <tr><th>Description</th><th>Amount (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td></tr>
        <tr><td>&nbsp;</td><td></td></tr>
        <tr><td>&nbsp;</td><td></td></tr>
        <tr class="total-row"><td>TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Received From (Name/Company)</label><div class="field-input"></div></div>
        <div class="field"><label>Contact</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Payment Method</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Cheque</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Notes/Remarks</label><div class="field-input large"></div></div>
      </div>
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
      ${header}
      ${forms[formType] || ''}
      ${signatureSection}
      ${footer}
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
      setTimeout(() => {
        handleDownload(form.id);
      }, index * 500);
    });
  };

  const filteredForms = FORM_TEMPLATES.filter(f => 
    selectedCategory === 'all' || f.category === selectedCategory
  );

  const expenseForms = filteredForms.filter(f => f.category === 'expense');
  const revenueForms = filteredForms.filter(f => f.category === 'revenue');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Printable Data Entry Forms
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Download and print forms for manual data collection. Enter data into the system when ready.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Actions */}
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

          {/* Expense Forms */}
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

          {/* Revenue Forms */}
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