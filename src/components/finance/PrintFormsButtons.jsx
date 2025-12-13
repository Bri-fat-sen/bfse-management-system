import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Receipt, DollarSign, Loader2, Fuel, Wrench, Building2, ShoppingCart, Users, Truck, Megaphone, FileText, Wallet, X, Package, Droplets, Bus, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ModernExportDialog from "@/components/exports/ModernExportDialog";

export default function PrintFormsButtons({ organisation }) {
  const toast = useToast();
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

  const prepareExpenseFormData = (formType) => {
    
    // Basic form data
    data.push(
      { Field: 'Form Type', Value: formType.name },
      { Field: 'Date', Value: new Date().toLocaleDateString('en-GB') },
      { Field: 'Reference Number', Value: '___________________' },
      { Field: '', Value: '' }
    );

    // Add form-specific fields
    if (formType.id === 'fuel') {
      data.push(
        { Field: 'Vehicle Registration *', Value: '___________________' },
        { Field: 'Driver Name *', Value: '___________________' },
        { Field: 'Fuel Station/Vendor *', Value: '___________________' },
        { Field: 'Litres *', Value: '___________________' },
        { Field: 'Total Amount (Le) *', Value: '___________________' }
      );
    } else if (formType.id === 'petty_cash') {
      for (let i = 1; i <= 10; i++) {
        data.push({ Field: `Item ${i} - Description`, Value: '___________________' });
        data.push({ Field: `Item ${i} - Amount (Le)`, Value: '___________________' });
      }
    } else {
      for (let i = 1; i <= 8; i++) {
        data.push({ Field: `Item ${i} - Description`, Value: '___________________' });
        data.push({ Field: `Item ${i} - Amount (Le)`, Value: '___________________' });
      }
    }
    
    data.push(
      { Field: '', Value: '' },
      { Field: 'TOTAL AMOUNT (Le)', Value: '___________________' },
      { Field: 'Notes/Comments', Value: '___________________' },
      { Field: 'Prepared By', Value: '___________________' },
      { Field: 'Approved By', Value: '___________________' }
    );
    
    return data;
  };

  const prepareRevenueFormData = (formType) => {
    const data = [];
    
    // Basic form data
    data.push(
      { Field: 'Form Type', Value: formType.name },
      { Field: 'Date', Value: new Date().toLocaleDateString('en-GB') },
      { Field: 'Reference Number', Value: '___________________' },
      { Field: '', Value: '' }
    );

    // Add form-specific fields
    if (formType.id === 'retail_sales') {
      for (let i = 1; i <= 10; i++) {
        data.push({ Field: `Product ${i}`, Value: '___________________' });
        data.push({ Field: `Qty ${i}`, Value: '___________________' });
        data.push({ Field: `Unit Price (Le) ${i}`, Value: '___________________' });
      }
    } else if (formType.id === 'trip_revenue') {
      data.push(
        { Field: 'Vehicle Registration *', Value: '___________________' },
        { Field: 'Driver Name *', Value: '___________________' },
        { Field: 'Route *', Value: '___________________' },
        { Field: 'Total Passengers *', Value: '___________________' },
        { Field: 'Ticket Price (Le)', Value: '___________________' },
        { Field: 'Total Revenue (Le) *', Value: '___________________' }
      );
    } else if (formType.id === 'owner' || formType.id === 'ceo') {
      data.push(
        { Field: `${formType.id === 'owner' ? 'Owner' : 'CEO'} Name *`, Value: '___________________' },
        { Field: 'Amount (Le) *', Value: '___________________' },
        { Field: 'Payment Method', Value: '___________________' },
        { Field: 'Purpose/Notes *', Value: '___________________' }
      );
    } else {
      for (let i = 1; i <= 8; i++) {
        data.push({ Field: `Item ${i} - Description`, Value: '___________________' });
        data.push({ Field: `Item ${i} - Amount (Le)`, Value: '___________________' });
      }
    }
    
    data.push(
      { Field: '', Value: '' },
      { Field: 'TOTAL AMOUNT (Le)', Value: '___________________' },
      { Field: 'Notes/Comments', Value: '___________________' },
      { Field: 'Recorded By', Value: '___________________' },
      { Field: 'Verified By', Value: '___________________' }
    );
    
    return data;
  };

  const handlePrintForm = (formType, category) => {
    const isExpense = category === 'expense';
    setShowExpenseDialog(false);
    setShowRevenueDialog(false);

    const data = isExpense ? prepareExpenseFormData(formType) : prepareRevenueFormData(formType);
    
    setCurrentExportData({
      data,
      title: formType.name
    });
    setExportDialogOpen(true);
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