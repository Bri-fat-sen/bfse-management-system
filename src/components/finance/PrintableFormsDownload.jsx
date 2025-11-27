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
  Printer
} from "lucide-react";

const FORM_TEMPLATES = [
  {
    id: 'expense_general',
    name: 'General Expense Form',
    description: 'Record any business expense',
    icon: Receipt,
    color: 'bg-red-100 text-red-600',
    category: 'expense'
  },
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
    id: 'expense_salary',
    name: 'Salary/Wages Form',
    description: 'Employee payment records',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    category: 'expense'
  },
  {
    id: 'expense_inventory',
    name: 'Inventory Purchase Form',
    description: 'Stock and supplies purchases',
    icon: Package,
    color: 'bg-blue-100 text-blue-600',
    category: 'expense'
  },
  {
    id: 'revenue_sales',
    name: 'Sales Revenue Form',
    description: 'Record product sales',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
    category: 'revenue'
  },
  {
    id: 'revenue_transport',
    name: 'Transport Revenue Form',
    description: 'Truck contracts and trips',
    icon: Truck,
    color: 'bg-teal-100 text-teal-600',
    category: 'revenue'
  },
  {
    id: 'revenue_other',
    name: 'Other Income Form',
    description: 'Miscellaneous revenue',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    category: 'revenue'
  }
];

const generateFormHTML = (formType, orgName) => {
  const today = new Date().toLocaleDateString('en-GB');
  
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
    expense_general: `
      <div class="form-title-banner">General Expense Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt/Invoice No.</label><div class="field-input"></div></div>
        <div class="field"><label>Vendor/Supplier</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Expense Category (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Office Supplies</div>
        <div class="checkbox-item"><span class="checkbox"></span> Utilities</div>
        <div class="checkbox-item"><span class="checkbox"></span> Rent</div>
        <div class="checkbox-item"><span class="checkbox"></span> Communication</div>
        <div class="checkbox-item"><span class="checkbox"></span> Travel</div>
        <div class="checkbox-item"><span class="checkbox"></span> Food/Refreshments</div>
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
      <div class="section-title">Payment Method (Check One)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Cash</div>
        <div class="checkbox-item"><span class="checkbox"></span> Bank Transfer</div>
        <div class="checkbox-item"><span class="checkbox"></span> Mobile Money</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Notes/Remarks</label><div class="field-input large"></div></div>
      </div>
      </div>
    `,
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
        <div class="field"><label>Vehicle/Equipment</label><div class="field-input"></div></div>
        <div class="field"><label>Current Mileage</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Maintenance Type (Check All That Apply)</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Oil Change</div>
        <div class="checkbox-item"><span class="checkbox"></span> Tire Service</div>
        <div class="checkbox-item"><span class="checkbox"></span> Brake Service</div>
        <div class="checkbox-item"><span class="checkbox"></span> Engine Repair</div>
        <div class="checkbox-item"><span class="checkbox"></span> Electrical</div>
        <div class="checkbox-item"><span class="checkbox"></span> Body Work</div>
        <div class="checkbox-item"><span class="checkbox"></span> Scheduled Service</div>
        <div class="checkbox-item"><span class="checkbox"></span> Other: ____________</div>
      </div>
      <div class="section-title">Parts & Labour</div>
      <table>
        <tr><th>Description</th><th>Qty</th><th>Unit Price (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
        <tr><td>Labour Cost</td><td>-</td><td>-</td><td></td></tr>
        <tr class="total-row"><td colspan="3">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="field-row">
        <div class="field"><label>Mechanic/Vendor</label><div class="field-input"></div></div>
        <div class="field"><label>Contact</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Next Service Due (Date/Mileage)</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    expense_salary: `
      <div class="form-title-banner">Salary / Wages Payment Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Pay Period</label><div class="field-input"></div></div>
        <div class="field"><label>Payment Date</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Employee Payment Details</div>
      <table>
        <tr><th>Employee Name</th><th>Position</th><th>Days Worked</th><th>Basic Pay (Le)</th><th>Deductions (Le)</th><th>Net Pay (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="5">TOTAL PAYROLL</td><td></td></tr>
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
    expense_inventory: `
      <div class="form-title-banner">Inventory Purchase Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Supplier Name</label><div class="field-input"></div></div>
        <div class="field"><label>Invoice/PO Number</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Supplier Contact</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Date</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Items Purchased</div>
      <table>
        <tr><th>Product Name</th><th>SKU/Code</th><th>Qty</th><th>Unit</th><th>Unit Cost (Le)</th><th>Total (Le)</th></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row"><td colspan="5">TOTAL AMOUNT</td><td></td></tr>
      </table>
      <div class="section-title">Payment Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Paid in Full</div>
        <div class="checkbox-item"><span class="checkbox"></span> Partial Payment: ____________</div>
        <div class="checkbox-item"><span class="checkbox"></span> Credit (Due Date: ____________)</div>
      </div>
      <div class="field-row" style="margin-top: 15px;">
        <div class="field"><label>Received By</label><div class="field-input"></div></div>
        <div class="field"><label>Warehouse/Location</label><div class="field-input"></div></div>
      </div>
      </div>
    `,
    revenue_sales: `
      <div class="form-title-banner">Sales Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Sales Person</label><div class="field-input"></div></div>
        <div class="field"><label>Receipt Number</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Customer Name</label><div class="field-input"></div></div>
        <div class="field"><label>Customer Phone</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Sale Type</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Retail</div>
        <div class="checkbox-item"><span class="checkbox"></span> Wholesale</div>
        <div class="checkbox-item"><span class="checkbox"></span> Vehicle Sales</div>
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
    revenue_transport: `
      <div class="form-title-banner">Transport Revenue Form</div>
      <div class="form-content">
      <div class="field-row">
        <div class="field"><label>Date</label><div class="field-input"></div></div>
        <div class="field"><label>Contract/Trip Number</label><div class="field-input"></div></div>
        <div class="field"><label>Vehicle Registration</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Driver Name</label><div class="field-input"></div></div>
        <div class="field"><label>Client Name</label><div class="field-input"></div></div>
        <div class="field"><label>Client Phone</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Trip Details</div>
      <div class="field-row">
        <div class="field"><label>Pickup Location</label><div class="field-input"></div></div>
        <div class="field"><label>Delivery Location</label><div class="field-input"></div></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Cargo Description</label><div class="field-input"></div></div>
        <div class="field"><label>Weight (kg)</label><div class="field-input"></div></div>
      </div>
      <div class="section-title">Revenue & Expenses</div>
      <table>
        <tr><th>Description</th><th>Amount (Le)</th></tr>
        <tr><td>Contract Amount</td><td></td></tr>
        <tr><td>Fuel Cost</td><td></td></tr>
        <tr><td>Tolls</td><td></td></tr>
        <tr><td>Loading/Unloading</td><td></td></tr>
        <tr><td>Other Expenses: ____________</td><td></td></tr>
        <tr class="total-row"><td>NET REVENUE</td><td></td></tr>
      </table>
      <div class="section-title">Payment Status</div>
      <div class="checkbox-group">
        <div class="checkbox-item"><span class="checkbox"></span> Paid</div>
        <div class="checkbox-item"><span class="checkbox"></span> Partial: ____________</div>
        <div class="checkbox-item"><span class="checkbox"></span> Pending</div>
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
    const html = generateFormHTML(formId, organisation?.name);
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