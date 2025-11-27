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
      @page { size: A4; margin: 15mm; }
      body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
      .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 10px; margin-bottom: 20px; }
      .header h1 { margin: 0; color: #0F1F3C; font-size: 20px; }
      .header p { margin: 5px 0 0; color: #666; }
      .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
      .form-title { background: #0F1F3C; color: white; padding: 8px 15px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
      .field-row { display: flex; margin-bottom: 12px; }
      .field { flex: 1; margin-right: 15px; }
      .field:last-child { margin-right: 0; }
      .field label { display: block; font-weight: bold; font-size: 10px; color: #333; margin-bottom: 3px; text-transform: uppercase; }
      .field-input { border: 1px solid #ccc; border-radius: 4px; padding: 8px; min-height: 20px; background: #fafafa; }
      .field-input.large { min-height: 60px; }
      .section-title { font-weight: bold; color: #1EB053; border-bottom: 1px solid #1EB053; padding-bottom: 5px; margin: 20px 0 10px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th { background: #f0f0f0; padding: 8px; text-align: left; font-size: 10px; border: 1px solid #ccc; }
      td { padding: 8px; border: 1px solid #ccc; min-height: 25px; }
      .total-row { background: #e8f5e9; font-weight: bold; }
      .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
      .signature-box { width: 45%; }
      .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 10px; }
      .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
      .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; }
      .checkbox-item { display: flex; align-items: center; gap: 5px; }
      .checkbox { width: 14px; height: 14px; border: 1px solid #333; display: inline-block; }
    </style>
  `;

  const header = `
    <div class="flag-stripe"></div>
    <div class="header">
      <h1>${orgName || 'Organisation Name'}</h1>
      <p>Date Printed: ${today}</p>
    </div>
  `;

  const footer = `
    <div class="footer">
      <p>This form is for manual record keeping. Please enter data into the system when ready.</p>
      <p>Form ID: ${formType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}</p>
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
      <div class="form-title">GENERAL EXPENSE FORM</div>
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
    `,
    expense_fuel: `
      <div class="form-title">FUEL EXPENSE FORM</div>
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
    `,
    expense_maintenance: `
      <div class="form-title">MAINTENANCE EXPENSE FORM</div>
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
    `,
    expense_salary: `
      <div class="form-title">SALARY / WAGES PAYMENT FORM</div>
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
    `,
    expense_inventory: `
      <div class="form-title">INVENTORY PURCHASE FORM</div>
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
    `,
    revenue_sales: `
      <div class="form-title">SALES REVENUE FORM</div>
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
    `,
    revenue_transport: `
      <div class="form-title">TRANSPORT REVENUE FORM</div>
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
    `,
    revenue_other: `
      <div class="form-title">OTHER INCOME FORM</div>
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