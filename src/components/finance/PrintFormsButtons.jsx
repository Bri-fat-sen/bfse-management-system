import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Receipt, DollarSign, Fuel, Wrench, Building2, ShoppingCart, Users, Truck, Megaphone, FileText, Wallet, X, Package, Droplets, Bus, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ModernExportDialog from "@/components/exports/ModernExportDialog";

export default function PrintFormsButtons({ organisation }) {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [currentExportData, setCurrentExportData] = useState({ data: [], title: "" });

  const expenseFormTypes = [
    { id: 'general', name: 'General Expense Form', icon: Receipt, color: 'red', description: 'Multi-item expense form' },
    { id: 'fuel', name: 'Fuel Purchase Form', icon: Fuel, color: 'orange', description: 'Vehicle fuel expenses' },
    { id: 'maintenance', name: 'Maintenance Form', icon: Wrench, color: 'blue', description: 'Repair & maintenance costs' },
    { id: 'utilities', name: 'Utilities Form', icon: Building2, color: 'cyan', description: 'Electricity, water, internet' },
    { id: 'supplies', name: 'Office Supplies', icon: ShoppingCart, color: 'purple', description: 'Office & operational supplies' },
    { id: 'salaries', name: 'Salary Advance', icon: Users, color: 'green', description: 'Employee salary advances' },
    { id: 'transport', name: 'Transport Expenses', icon: Truck, color: 'teal', description: 'Transport & logistics costs' },
    { id: 'marketing', name: 'Marketing Expenses', icon: Megaphone, color: 'pink', description: 'Advertising & promotions' },
    { id: 'petty_cash', name: 'Petty Cash Form', icon: Wallet, color: 'amber', description: 'Small daily expenses' },
  ];

  const revenueFormTypes = [
    { id: 'general', name: 'General Revenue Form', icon: DollarSign, color: 'green', description: 'Multi-item revenue form' },
    { id: 'retail_sales', name: 'Retail Store Sales', icon: ShoppingCart, color: 'blue', description: 'Retail store product sales' },
    { id: 'warehouse_sales', name: 'Warehouse Sales', icon: Package, color: 'indigo', description: 'Bulk warehouse sales' },
    { id: 'vehicle_sales', name: 'Vehicle/Mobile Sales', icon: Truck, color: 'purple', description: 'Vehicle-based sales' },
    { id: 'water_sales', name: 'Water Product Sales', icon: Droplets, color: 'cyan', description: 'Bottled water revenue' },
    { id: 'trip_revenue', name: 'Transport Trip Revenue', icon: Bus, color: 'violet', description: 'Bus/transport fare revenue' },
    { id: 'truck_contract', name: 'Truck Contract Revenue', icon: Truck, color: 'orange', description: 'Truck rental contracts' },
    { id: 'service', name: 'Service Revenue', icon: Wrench, color: 'teal', description: 'Service fees & contracts' },
    { id: 'rental', name: 'Rental Income', icon: Building2, color: 'amber', description: 'Property/equipment rental' },
    { id: 'owner', name: 'Owner Contribution', icon: Users, color: 'emerald', description: 'Owner capital injection' },
    { id: 'ceo', name: 'CEO Contribution', icon: Users, color: 'rose', description: 'CEO funding' },
    { id: 'investor', name: 'Investor Funding', icon: Building2, color: 'pink', description: 'Investment received' },
    { id: 'loan', name: 'Loan Receipt', icon: FileText, color: 'yellow', description: 'Bank or private loans' },
    { id: 'grant', name: 'Grant Receipt', icon: DollarSign, color: 'lime', description: 'Government or NGO grants' },
    { id: 'interest', name: 'Interest Income', icon: TrendingUp, color: 'sky', description: 'Bank interest & investments' },
    { id: 'refund', name: 'Refund Receipt', icon: Receipt, color: 'red', description: 'Refunds & reimbursements' },
    { id: 'commission', name: 'Commission Revenue', icon: DollarSign, color: 'fuchsia', description: 'Sales commissions' },
    { id: 'dividend', name: 'Dividend Income', icon: TrendingUp, color: 'green', description: 'Investment dividends' },
    { id: 'other', name: 'Other Income', icon: FileText, color: 'slate', description: 'Miscellaneous revenue' },
  ];

  const generateFormData = (formType, category) => {
    const isExpense = category === 'expense';
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
      transition: border-color 0.2s;
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
</head>
<body>
  <div class="document">
    ${header}
    
    <div class="content">
      <div class="instructions">
        <h3>📋 Instructions - ${formType.name.toUpperCase()}</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: ${formType.name.toUpperCase()}</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>${formType.description}</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in Expense Management or Finance section</li>
          <li>The system will automatically extract and create expense records</li>
        </ol>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">💰</div>
          ${formType.name} - Basic Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="input-box"></div>
          </div>
        </div>
      </div>

      ${formType.id === 'fuel' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">⛽</div>Vehicle & Fuel Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Vehicle Registration <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Driver Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Previous Odometer Reading</label><div class="input-box"></div></div>
          <div class="form-field"><label>Current Odometer Reading</label><div class="input-box"></div></div>
          <div class="form-field"><label>Fuel Station/Vendor <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Fuel Type (Petrol/Diesel)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Litres <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Price per Litre (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Total Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Number</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Purpose of Trip</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'maintenance' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🔧</div>Maintenance Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Vehicle/Equipment <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Registration/ID Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Maintenance Type <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Service Provider/Mechanic</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Work Description <span class="required">*</span></label><div class="input-box large"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">💰</div>Parts & Labor</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>PART/SERVICE</th><th style="width: 80px;">QTY</th><th style="width: 120px;">UNIT PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th></tr></thead>
          <tbody>${Array.from({ length: 10 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr></tfoot>
        </table>
      </div>` : formType.id === 'utilities' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">💡</div>Utility Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Utility Type <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Account Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Service Provider</label><div class="input-box"></div></div>
          <div class="form-field"><label>Billing Period</label><div class="input-box"></div></div>
          <div class="form-field"><label>Previous Reading</label><div class="input-box"></div></div>
          <div class="form-field"><label>Current Reading</label><div class="input-box"></div></div>
          <div class="form-field"><label>Units Consumed</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'supplies' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">📦</div>Office Supplies</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>ITEM DESCRIPTION <span class="required">*</span></th><th style="width: 80px;">QTY</th><th style="width: 120px;">UNIT PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th><th style="width: 120px;">SUPPLIER</th></tr></thead>
          <tbody>${Array.from({ length: 12 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td><td></td></tr></tfoot>
        </table>
      </div>` : formType.id === 'salaries' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">👤</div>Salary Advance Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Employee Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Employee ID/Code</label><div class="input-box"></div></div>
          <div class="form-field"><label>Department/Position</label><div class="input-box"></div></div>
          <div class="form-field"><label>Monthly Salary (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Advance Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Repayment Method</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Reason for Advance <span class="required">*</span></label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'transport' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🚚</div>Transport Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Transport Type <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Vehicle/Route</label><div class="input-box"></div></div>
          <div class="form-field"><label>Origin</label><div class="input-box"></div></div>
          <div class="form-field"><label>Destination</label><div class="input-box"></div></div>
          <div class="form-field"><label>Distance (km)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Driver Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Toll Fees (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Parking Fees (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Other Costs (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Total Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'marketing' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">📣</div>Marketing Campaign Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Campaign Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Campaign Type</label><div class="input-box"></div></div>
          <div class="form-field"><label>Start Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>End Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Media/Channel</label><div class="input-box"></div></div>
          <div class="form-field"><label>Vendor/Agency</label><div class="input-box"></div></div>
          <div class="form-field"><label>Target Audience</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Campaign Objectives</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'petty_cash' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">💵</div>Petty Cash Expenses</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>DATE</th><th>DESCRIPTION <span class="required">*</span></th><th style="width: 120px;">AMOUNT (Le) <span class="required">*</span></th><th style="width: 120px;">PAID TO</th></tr></thead>
          <tbody>${Array.from({ length: 20 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="3" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td><td></td></tr></tfoot>
        </table>
      </div>` : `
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Expense Items</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>DETAILS / DESCRIPTION <span class="required">*</span></th><th style="width: 80px;">UNIT</th><th style="width: 80px;">QTY</th><th style="width: 100px;">UNIT COST (Le)</th><th style="width: 120px;">TOTAL (Le) <span class="required">*</span></th><th style="width: 120px;">VENDOR</th><th style="width: 100px;">CATEGORY</th></tr></thead>
          <tbody>${Array.from({ length: 15 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="5" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td><td colspan="2"></td></tr></tfoot>
        </table>
      </div>`}

      <div class="form-section">
        <div class="form-field full-width">
          <label>Notes / Comments</label>
          <div class="input-box large"></div>
        </div>
      </div>

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
    </div>
    
    ${footer}
  </div>
</body>
</html>
    `;
  };

  const generateRevenueFormHTML = (formType) => {
    const styles = getUnifiedPDFStyles(organisation, 'report');
    const header = getUnifiedHeader(organisation, formType.name, 'REVENUE-FORM', new Date().toLocaleDateString(), 'report');
    const footer = getUnifiedFooter(organisation);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revenue Entry Form - ${organisation?.name || 'Organisation'}</title>
  <style>${styles}
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
      transition: border-color 0.2s;
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
</head>
<body>
  <div class="document">
    ${header}
    
    <div class="content">
      <div class="instructions">
        <h3>📋 Instructions - ${formType.name.toUpperCase()}</h3>
        <ol>
          <li><strong>DOCUMENT TYPE: ${formType.name.toUpperCase()}</strong></li>
          <li>Fill in all required fields (*) with clear, legible handwriting</li>
          <li>Use black or blue ink only</li>
          <li>${formType.description}</li>
          <li>After completing, scan or photograph this form</li>
          <li>Upload using "Upload Document" in Finance section</li>
          <li>The system will automatically extract and create revenue records</li>
        </ol>
      </div>

      <div class="form-section">
        <div class="section-title">
          <div class="icon">📈</div>
          ${formType.name} - Information
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Date <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          <div class="form-field">
            <label>Reference Number</label>
            <div class="input-box"></div>
          </div>
          ${formType.id !== 'general' ? `
          <div class="form-field full-width">
            <label>Contributor / Source Name <span class="required">*</span></label>
            <div class="input-box"></div>
          </div>
          ` : ''}
        </div>
      </div>

      ${formType.id === 'retail_sales' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🛒</div>Retail Store Sales</div>
        <div class="form-grid">
          <div class="form-field"><label>Store/Location <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Cashier Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer Phone</label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Number <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Sale Date & Time</label><div class="input-box"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Items Sold</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>PRODUCT <span class="required">*</span></th><th style="width: 100px;">SKU/BARCODE</th><th style="width: 80px;">QTY</th><th style="width: 120px;">UNIT PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th></tr></thead>
          <tbody>${Array.from({ length: 15 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="5" style="text-align: right; font-weight: bold;">SUBTOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr><tr class="total-row"><td colspan="5" style="text-align: right;">Tax:</td><td>Le ______________</td></tr><tr class="total-row"><td colspan="5" style="text-align: right;">Discount:</td><td>Le ______________</td></tr><tr class="total-row" style="font-size: 1.1em;"><td colspan="5" style="text-align: right; font-weight: bold;">GRAND TOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr></tfoot>
        </table>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">💳</div>Payment Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Payment Method <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Paid (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Change Given (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Status</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'warehouse_sales' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">📦</div>Warehouse Bulk Sales</div>
        <div class="form-grid">
          <div class="form-field"><label>Warehouse Location <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Sales Representative</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer/Business Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contact Person</label><div class="input-box"></div></div>
          <div class="form-field"><label>Phone Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Invoice Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Delivery Address</label><div class="input-box"></div></div>
          <div class="form-field"><label>Delivery Date</label><div class="input-box"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Bulk Items</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>PRODUCT <span class="required">*</span></th><th style="width: 100px;">UNIT</th><th style="width: 80px;">QTY</th><th style="width: 120px;">WHOLESALE PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th></tr></thead>
          <tbody>${Array.from({ length: 12 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="5" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr></tfoot>
        </table>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">💳</div>Payment & Terms</div>
        <div class="form-grid">
          <div class="form-field"><label>Payment Terms</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Paid (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Balance Due (Le)</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'vehicle_sales' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🚐</div>Vehicle/Mobile Sales</div>
        <div class="form-grid">
          <div class="form-field"><label>Vehicle Registration <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Driver Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Route/Location</label><div class="input-box"></div></div>
          <div class="form-field"><label>Sale Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer Phone</label><div class="input-box"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Items Sold from Vehicle</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>PRODUCT <span class="required">*</span></th><th style="width: 80px;">QTY</th><th style="width: 120px;">UNIT PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th></tr></thead>
          <tbody>${Array.from({ length: 15 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr></tfoot>
        </table>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">💳</div>Payment</div>
        <div class="form-grid">
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Received (Le)</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'water_sales' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">💧</div>Water Product Sales</div>
        <div class="form-grid">
          <div class="form-field"><label>Location/Store <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Employee Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Customer Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Delivery Address</label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Sale Date</label><div class="input-box"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Water Products</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>PRODUCT TYPE <span class="required">*</span></th><th style="width: 120px;">SIZE/VOLUME</th><th style="width: 80px;">QTY</th><th style="width: 120px;">UNIT PRICE (Le)</th><th style="width: 120px;">TOTAL (Le)</th></tr></thead>
          <tbody>${Array.from({ length: 10 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="5" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td></tr></tfoot>
        </table>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">💳</div>Payment Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Paid (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Deposit Returned (Le)</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'trip_revenue' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🚌</div>Transport Trip Revenue</div>
        <div class="form-grid">
          <div class="form-field"><label>Vehicle Registration <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Driver Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Route <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Trip Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Start Time</label><div class="input-box"></div></div>
          <div class="form-field"><label>End Time</label><div class="input-box"></div></div>
          <div class="form-field"><label>Start Location</label><div class="input-box"></div></div>
          <div class="form-field"><label>End Location</label><div class="input-box"></div></div>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title"><div class="icon">👥</div>Passenger & Fare Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Total Passengers <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Ticket Price (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Total Fare Revenue (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Extra Baggage (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Charter/Special (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Total Revenue (Le)</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Notes</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'truck_contract' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🚛</div>Truck Contract Revenue</div>
        <div class="form-grid">
          <div class="form-field"><label>Contract Number <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Client Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contact Person</label><div class="input-box"></div></div>
          <div class="form-field"><label>Phone Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Vehicle Registration</label><div class="input-box"></div></div>
          <div class="form-field"><label>Driver Assigned</label><div class="input-box"></div></div>
          <div class="form-field"><label>Contract Start Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Contract End Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Service Type</label><div class="input-box"></div></div>
          <div class="form-field"><label>Route/Destination</label><div class="input-box"></div></div>
          <div class="form-field"><label>Contract Value (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Schedule</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Received (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Contract Terms</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'service' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🔧</div>Service Revenue Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Client Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contact Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Service Type <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Service Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Contract Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Terms</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Service Description</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'rental' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🏢</div>Rental Income Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Tenant/Renter Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contact Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Property/Asset <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Location</label><div class="input-box"></div></div>
          <div class="form-field"><label>Rental Period (From)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Rental Period (To)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Monthly Rent (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount Received (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Number</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Additional Notes</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'owner' || formType.id === 'ceo' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">👤</div>${formType.name} Details</div>
        <div class="form-grid">
          <div class="form-field"><label>${formType.id === 'owner' ? 'Owner' : 'CEO'} Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contribution Date <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Reference/Transaction Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Bank Name (if transfer)</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Purpose/Notes <span class="required">*</span></label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'investor' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🏢</div>Investor Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Investor Name/Company <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Contact Person</label><div class="input-box"></div></div>
          <div class="form-field"><label>Investment Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Investment Date <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Equity %</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Reference Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Agreement Date</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Investment Terms/Purpose</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'loan' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🏦</div>Loan Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Lender Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Loan Type</label><div class="input-box"></div></div>
          <div class="form-field"><label>Loan Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Disbursement Date <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Interest Rate (%)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Loan Term (months)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Monthly Repayment (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Reference Number</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Purpose of Loan</label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'grant' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">🎁</div>Grant Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Grant Provider <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Grant Program Name</label><div class="input-box"></div></div>
          <div class="form-field"><label>Grant Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Date <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Grant Reference Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Grant Period</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Grant Purpose/Project</label><div class="input-box large"></div></div>
          <div class="form-field full-width"><label>Reporting Requirements</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'interest' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">💰</div>Interest Income Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Bank/Institution Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Account Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Account Type</label><div class="input-box"></div></div>
          <div class="form-field"><label>Interest Period (From)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Interest Period (To)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Interest Rate (%)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Principal Amount (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Interest Earned (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Tax Withheld (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Net Amount (Le)</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'refund' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">↩️</div>Refund Receipt Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Refund Source <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Original Transaction Ref</label><div class="input-box"></div></div>
          <div class="form-field"><label>Original Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Refund Date <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Refund Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Refund Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Receipt Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Approved By</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Reason for Refund <span class="required">*</span></label><div class="input-box large"></div></div>
        </div>
      </div>` : formType.id === 'commission' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">💵</div>Commission Revenue Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Sales Person/Agent <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Transaction/Sale Reference</label><div class="input-box"></div></div>
          <div class="form-field"><label>Commission Period From</label><div class="input-box"></div></div>
          <div class="form-field"><label>Commission Period To</label><div class="input-box"></div></div>
          <div class="form-field"><label>Total Sales Value (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Commission Rate (%)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Commission Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Date</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Notes</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'dividend' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">📊</div>Dividend Income Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Company/Investment Name <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Number of Shares</label><div class="input-box"></div></div>
          <div class="form-field"><label>Dividend Per Share (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Date</label><div class="input-box"></div></div>
          <div class="form-field"><label>Gross Dividend (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Tax Withheld (Le)</label><div class="input-box"></div></div>
          <div class="form-field"><label>Net Dividend (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Additional Notes</label><div class="input-box"></div></div>
        </div>
      </div>` : formType.id === 'other' ? `
      <div class="form-section">
        <div class="section-title"><div class="icon">📝</div>Other Income Details</div>
        <div class="form-grid">
          <div class="form-field"><label>Income Source <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Source Category</label><div class="input-box"></div></div>
          <div class="form-field"><label>Amount (Le) <span class="required">*</span></label><div class="input-box"></div></div>
          <div class="form-field"><label>Payment Method</label><div class="input-box"></div></div>
          <div class="form-field"><label>Reference Number</label><div class="input-box"></div></div>
          <div class="form-field"><label>Received From</label><div class="input-box"></div></div>
          <div class="form-field full-width"><label>Description <span class="required">*</span></label><div class="input-box large"></div></div>
        </div>
      </div>` : `
      <div class="form-section">
        <div class="section-title"><div class="icon">📋</div>Revenue Items</div>
        <table class="data-table">
          <thead><tr><th style="width: 40px;">NO</th><th>DESCRIPTION / PURPOSE <span class="required">*</span></th><th style="width: 150px;">CONTRIBUTOR / CUSTOMER</th><th style="width: 120px;">AMOUNT (Le) <span class="required">*</span></th><th style="width: 120px;">SOURCE / CATEGORY</th></tr></thead>
          <tbody>${Array.from({ length: 15 }, (_, i) => `<tr><td>${i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</tbody>
          <tfoot><tr class="total-row"><td colspan="3" style="text-align: right; font-weight: bold;">TOTAL:</td><td style="font-weight: bold;">Le ______________</td><td></td></tr></tfoot>
        </table>
      </div>`}

      <div class="form-section">
        <div class="form-field full-width">
          <label>Notes / Comments</label>
          <div class="input-box large"></div>
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Recorded By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
        <div class="signature-box">
          <p><strong>Verified By:</strong></p>
          <p style="margin-top: 50px;">Name: _______________________________</p>
          <p>Date: _______________________________</p>
        </div>
      </div>
    </div>
    
    ${footer}
  </div>
</body>
</html>
    `;
  };

  const handlePrintForm = (formType, category) => {
    const isExpense = category === 'expense';
    if (isExpense) {
      setPrintingExpense(true);
      setShowExpenseDialog(false);
    } else {
      setPrintingRevenue(true);
      setShowRevenueDialog(false);
    }

    const html = isExpense ? generateExpenseFormHTML(formType) : generateRevenueFormHTML(formType);
    
    printUnifiedPDF(html, `${formType.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setPrintingExpense(false);
    setPrintingRevenue(false);
    toast.success("PDF Generated", `${formType.name} downloaded successfully`);
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setShowExpenseDialog(true)}
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          <Receipt className="w-4 h-4 mr-2" />
          Print Expense Form
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowRevenueDialog(true)}
          className="border-[#1EB053] text-[#1EB053] hover:bg-[#1EB053]/10"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Print Revenue Form
        </Button>
      </div>

      {/* Modern Export Dialog */}
      <ModernExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={currentExportData.data}
        reportTitle={currentExportData.title}
        orgData={organisation}
      />

      {/* Expense Forms Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-500" />
                Select Expense Form Type
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExpenseDialog(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {expenseFormTypes.map((form) => (
              <button
                key={form.id}
                onClick={() => handlePrintForm(form, 'expense')}
                className={`p-4 border-2 rounded-lg hover:shadow-md transition-all text-left border-${form.color}-200 hover:border-${form.color}-400 hover:bg-${form.color}-50/50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${form.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <form.icon className={`w-5 h-5 text-${form.color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{form.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{form.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revenue Forms Dialog */}
      <Dialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1EB053]" />
                Select Revenue Form Type
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRevenueDialog(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {revenueFormTypes.map((form) => (
              <button
                key={form.id}
                onClick={() => handlePrintForm(form, 'revenue')}
                className={`p-4 border-2 rounded-lg hover:shadow-md transition-all text-left border-${form.color}-200 hover:border-${form.color}-400 hover:bg-${form.color}-50/50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${form.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <form.icon className={`w-5 h-5 text-${form.color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{form.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{form.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}