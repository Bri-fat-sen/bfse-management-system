import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Download,
  Receipt,
  Truck,
  ShoppingCart,
  Fuel,
  Wrench,
  DollarSign,
  Printer
} from "lucide-react";

const FORM_TYPES = [
  { id: 'expense', label: 'Expense Entry Form', icon: Receipt, color: 'red' },
  { id: 'retail_sale', label: 'Retail Sale Form', icon: ShoppingCart, color: 'green' },
  { id: 'warehouse_sale', label: 'Warehouse Sale Form', icon: DollarSign, color: 'amber' },
  { id: 'vehicle_sale', label: 'Vehicle Sale Form', icon: Truck, color: 'purple' },
  { id: 'trip_revenue', label: 'Trip Revenue Form', icon: Truck, color: 'blue' },
  { id: 'truck_contract', label: 'Truck Contract Form', icon: FileText, color: 'teal' },
  { id: 'maintenance', label: 'Maintenance Record Form', icon: Wrench, color: 'cyan' },
  { id: 'fuel', label: 'Fuel Purchase Form', icon: Fuel, color: 'orange' },
];

const generateExpenseFormHTML = (orgName) => `
<!DOCTYPE html>
<html>
<head>
  <title>Expense Entry Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .header p { color: #666; margin-top: 5px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #1EB053; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; color: #374151; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .form-field .input-box { border: 1px solid #000; min-height: 60px; padding: 5px; }
    .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; }
    .checkbox-item { display: flex; align-items: center; gap: 5px; }
    .checkbox-item input { width: 14px; height: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>EXPENSE ENTRY FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Basic Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Date of Expense:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Receipt/Reference No:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Category:</label>
        <div class="checkbox-group">
          <div class="checkbox-item"><input type="checkbox"> Fuel</div>
          <div class="checkbox-item"><input type="checkbox"> Maintenance</div>
          <div class="checkbox-item"><input type="checkbox"> Utilities</div>
          <div class="checkbox-item"><input type="checkbox"> Supplies</div>
          <div class="checkbox-item"><input type="checkbox"> Rent</div>
          <div class="checkbox-item"><input type="checkbox"> Salaries</div>
          <div class="checkbox-item"><input type="checkbox"> Transport</div>
          <div class="checkbox-item"><input type="checkbox"> Marketing</div>
          <div class="checkbox-item"><input type="checkbox"> Insurance</div>
          <div class="checkbox-item"><input type="checkbox"> Petty Cash</div>
          <div class="checkbox-item"><input type="checkbox"> Other</div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Expense Details</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Description:</label>
        <div class="input-box"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Amount (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Vendor/Supplier:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Payment Method:</label>
        <div class="checkbox-group">
          <div class="checkbox-item"><input type="checkbox"> Cash</div>
          <div class="checkbox-item"><input type="checkbox"> Card</div>
          <div class="checkbox-item"><input type="checkbox"> Bank Transfer</div>
          <div class="checkbox-item"><input type="checkbox"> Mobile Money</div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Additional Notes</h3>
    <div class="form-field">
      <div class="input-box" style="min-height: 80px;"></div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Recorded By (Name & Signature)</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Approved By (Name & Signature)</p>
    </div>
  </div>

  <div class="footer">
    <p>This form is for manual data collection. Please enter data into the system when ready.</p>
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;

const generateSaleFormHTML = (orgName, saleType) => {
  const typeLabels = {
    retail_sale: 'RETAIL SALE',
    warehouse_sale: 'WAREHOUSE SALE', 
    vehicle_sale: 'VEHICLE SALE'
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${typeLabels[saleType]} Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .header p { color: #666; margin-top: 5px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #1EB053; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; color: #374151; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; }
    .checkbox-item { display: flex; align-items: center; gap: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    .totals-box { background: #f9fafb; padding: 15px; margin-top: 15px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>${typeLabels[saleType]} ENTRY FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Sale Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Date of Sale:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Sale/Receipt No:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Customer Name:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Customer Phone:</label>
        <div class="input-line"></div>
      </div>
    </div>
    ${saleType === 'vehicle_sale' ? `
    <div class="form-row">
      <div class="form-field">
        <label>Vehicle Registration:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Location:</label>
        <div class="input-line"></div>
      </div>
    </div>
    ` : ''}
  </div>

  <div class="form-section">
    <h3>Items Sold</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 40%;">Product Name</th>
          <th style="width: 15%;">Quantity</th>
          <th style="width: 20%;">Unit Price (Le)</th>
          <th style="width: 20%;">Total (Le)</th>
        </tr>
      </thead>
      <tbody>
        ${Array(8).fill().map((_, i) => `
        <tr>
          <td>${i + 1}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals-box">
      <div class="form-row">
        <div class="form-field">
          <label>Subtotal (Le):</label>
          <div class="input-line"></div>
        </div>
        <div class="form-field">
          <label>Discount (Le):</label>
          <div class="input-line"></div>
        </div>
        <div class="form-field">
          <label>Tax (Le):</label>
          <div class="input-line"></div>
        </div>
        <div class="form-field">
          <label><strong>TOTAL (Le):</strong></label>
          <div class="input-line" style="border-bottom: 2px solid #000;"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Payment</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Payment Method:</label>
        <div class="checkbox-group">
          <div class="checkbox-item"><input type="checkbox"> Cash</div>
          <div class="checkbox-item"><input type="checkbox"> Card</div>
          <div class="checkbox-item"><input type="checkbox"> Mobile Money</div>
          <div class="checkbox-item"><input type="checkbox"> Credit</div>
        </div>
      </div>
      <div class="form-field">
        <label>Payment Status:</label>
        <div class="checkbox-group">
          <div class="checkbox-item"><input type="checkbox"> Paid</div>
          <div class="checkbox-item"><input type="checkbox"> Pending</div>
          <div class="checkbox-item"><input type="checkbox"> Partial</div>
        </div>
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Sales Person (Name & Signature)</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Customer Signature</p>
    </div>
  </div>

  <div class="footer">
    <p>This form is for manual data collection. Please enter data into the system when ready.</p>
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;
};

const generateTripRevenueFormHTML = (orgName) => `
<!DOCTYPE html>
<html>
<head>
  <title>Trip Revenue Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #0072C6; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .form-field .input-box { border: 1px solid #000; min-height: 60px; padding: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>TRIP REVENUE FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Trip Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Date:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Vehicle Registration:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Driver Name:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Route (From - To):</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Departure Time:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Arrival Time:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Revenue Details</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Number of Passengers:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Ticket Price (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Total Ticket Revenue (Le):</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Cargo Revenue (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Other Revenue (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label><strong>TOTAL REVENUE (Le):</strong></label>
        <div class="input-line" style="border-bottom: 2px solid #000;"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Trip Expenses</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Fuel Cost (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Fuel Quantity (Liters):</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Other Expenses (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Expense Details:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Notes</h3>
    <div class="form-field">
      <div class="input-box"></div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Driver Signature</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Supervisor Signature</p>
    </div>
  </div>

  <div class="footer">
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;

const generateTruckContractFormHTML = (orgName) => `
<!DOCTYPE html>
<html>
<head>
  <title>Truck Contract Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #14b8a6; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .form-field .input-box { border: 1px solid #000; min-height: 60px; padding: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 30%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>TRUCK CONTRACT FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Contract Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Contract Date:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Contract Number:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Expected Delivery Date:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Vehicle Registration:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Driver Name:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Client Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Client Name:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Client Phone:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Cargo Details</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Pickup Location:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Delivery Location:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Cargo Description:</label>
        <div class="input-box"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Cargo Weight (kg):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Contract Amount (Le):</label>
        <div class="input-line" style="border-bottom: 2px solid #000;"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Expenses</h3>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Description</th>
          <th>Amount (Le)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Fuel</td><td></td><td></td></tr>
        <tr><td>Tolls</td><td></td><td></td></tr>
        <tr><td>Loading</td><td></td><td></td></tr>
        <tr><td>Unloading</td><td></td><td></td></tr>
        <tr><td>Food/Accommodation</td><td></td><td></td></tr>
        <tr><td>Other</td><td></td><td></td></tr>
        <tr><th colspan="2">TOTAL EXPENSES</th><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Driver</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Client</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Manager</p>
    </div>
  </div>

  <div class="footer">
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;

const generateMaintenanceFormHTML = (orgName) => `
<!DOCTYPE html>
<html>
<head>
  <title>Vehicle Maintenance Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #06b6d4; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .form-field .input-box { border: 1px solid #000; min-height: 60px; padding: 5px; }
    .checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .checkbox-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>VEHICLE MAINTENANCE RECORD FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Vehicle Information</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Vehicle Registration:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Mileage at Service:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Date of Service:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Maintenance Type</h3>
    <div class="checkbox-group">
      <div class="checkbox-item"><input type="checkbox"> Oil Change</div>
      <div class="checkbox-item"><input type="checkbox"> Tire Rotation</div>
      <div class="checkbox-item"><input type="checkbox"> Tire Replacement</div>
      <div class="checkbox-item"><input type="checkbox"> Brake Service</div>
      <div class="checkbox-item"><input type="checkbox"> Engine Repair</div>
      <div class="checkbox-item"><input type="checkbox"> Transmission</div>
      <div class="checkbox-item"><input type="checkbox"> Battery</div>
      <div class="checkbox-item"><input type="checkbox"> Air Filter</div>
      <div class="checkbox-item"><input type="checkbox"> Fuel Filter</div>
      <div class="checkbox-item"><input type="checkbox"> Coolant Flush</div>
      <div class="checkbox-item"><input type="checkbox"> Inspection</div>
      <div class="checkbox-item"><input type="checkbox"> Body Repair</div>
      <div class="checkbox-item"><input type="checkbox"> Electrical</div>
      <div class="checkbox-item"><input type="checkbox"> Scheduled Service</div>
      <div class="checkbox-item"><input type="checkbox"> Other</div>
    </div>
  </div>

  <div class="form-section">
    <h3>Service Details</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Description of Work:</label>
        <div class="input-box" style="min-height: 80px;"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Vendor/Mechanic:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Vendor Contact:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Parts Replaced</h3>
    <table>
      <thead>
        <tr>
          <th>Part Name</th>
          <th>Quantity</th>
          <th>Cost (Le)</th>
        </tr>
      </thead>
      <tbody>
        ${Array(5).fill().map(() => `<tr><td></td><td></td><td></td></tr>`).join('')}
        <tr><th colspan="2">TOTAL COST</th><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="form-section">
    <h3>Next Service</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Next Due Date:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Next Due Mileage:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Performed By</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Approved By</p>
    </div>
  </div>

  <div class="footer">
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;

const generateFuelFormHTML = (orgName) => `
<!DOCTYPE html>
<html>
<head>
  <title>Fuel Purchase Form - ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #1EB053; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #0F1F3C; font-size: 24px; }
    .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 15px; }
    .form-section { margin-bottom: 20px; }
    .form-section h3 { background: #f3f4f6; padding: 8px 12px; margin-bottom: 10px; color: #0F1F3C; border-left: 4px solid #f97316; }
    .form-row { display: flex; margin-bottom: 12px; }
    .form-field { flex: 1; margin-right: 15px; }
    .form-field:last-child { margin-right: 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 4px; }
    .form-field .input-line { border-bottom: 1px solid #000; min-height: 25px; padding: 5px 0; }
    .checkbox-group { display: flex; gap: 15px; }
    .checkbox-item { display: flex; align-items: center; gap: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="flag-stripe"></div>
  <div class="header">
    <h1>${orgName}</h1>
    <p>FUEL PURCHASE FORM</p>
    <p style="font-size: 10px;">Form Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
  </div>

  <div class="form-section">
    <h3>Vehicle & Date</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Date:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Vehicle Registration:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Current Mileage:</label>
        <div class="input-line"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Driver Name:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Fuel Details</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Fuel Type:</label>
        <div class="checkbox-group">
          <div class="checkbox-item"><input type="checkbox"> Petrol</div>
          <div class="checkbox-item"><input type="checkbox"> Diesel</div>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Quantity (Liters):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Price per Liter (Le):</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label><strong>Total Cost (Le):</strong></label>
        <div class="input-line" style="border-bottom: 2px solid #000;"></div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Fuel Station:</label>
        <div class="input-line"></div>
      </div>
      <div class="form-field">
        <label>Receipt Number:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <h3>Purpose</h3>
    <div class="form-row">
      <div class="form-field">
        <label>Trip/Purpose:</label>
        <div class="input-line"></div>
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Driver Signature</p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p>Authorized By</p>
    </div>
  </div>

  <div class="footer">
    <p>🇸🇱 ${orgName} - Sierra Leone</p>
  </div>
</body>
</html>
`;

export default function PrintableForms({ open, onOpenChange, organisation }) {
  const orgName = organisation?.name || 'Organisation';

  const generateAndDownload = (formType) => {
    let html = '';
    
    switch (formType) {
      case 'expense':
        html = generateExpenseFormHTML(orgName);
        break;
      case 'retail_sale':
      case 'warehouse_sale':
      case 'vehicle_sale':
        html = generateSaleFormHTML(orgName, formType);
        break;
      case 'trip_revenue':
        html = generateTripRevenueFormHTML(orgName);
        break;
      case 'truck_contract':
        html = generateTruckContractFormHTML(orgName);
        break;
      case 'maintenance':
        html = generateMaintenanceFormHTML(orgName);
        break;
      case 'fuel':
        html = generateFuelFormHTML(orgName);
        break;
      default:
        return;
    }

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const colorMap = {
    red: 'bg-red-100 text-red-600 hover:bg-red-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    amber: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    teal: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
    cyan: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  };

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
            <Printer className="w-5 h-5" />
            Download Printable Forms
          </DialogTitle>
          <p className="text-sm text-gray-500">Print forms for manual data collection, then enter data into the system later.</p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {FORM_TYPES.map((form) => {
            const Icon = form.icon;
            return (
              <Card 
                key={form.id}
                className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-[#1EB053]/50"
                onClick={() => generateAndDownload(form.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[form.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{form.label}</p>
                    <p className="text-xs text-gray-500">Click to print</p>
                  </div>
                  <Printer className="w-4 h-4 text-gray-400" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p><strong>Tip:</strong> Print multiple copies of each form to keep on hand for field data collection.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}