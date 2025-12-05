import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Loader2,
  FileUp,
  CheckCircle,
  Hammer
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const DEFAULT_EXPENSE_CATEGORIES = [
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "utilities", label: "Utilities" },
  { value: "supplies", label: "Supplies" },
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "marketing", label: "Marketing" },
  { value: "insurance", label: "Insurance" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "other", label: "Other" }
];

const DEFAULT_REVENUE_SOURCES = [
  { value: "retail_sales", label: "Retail Sales" },
  { value: "wholesale_sales", label: "Wholesale Sales" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "transport_revenue", label: "Transport Revenue" },
  { value: "contract_revenue", label: "Contract Revenue" },
  { value: "service_income", label: "Service Income" },
  { value: "owner_contribution", label: "Owner Contribution" },
  { value: "ceo_contribution", label: "CEO Contribution" },
  { value: "investor_funding", label: "Investor Funding" },
  { value: "loan", label: "Loan" },
  { value: "grant", label: "Grant" },
  { value: "dividend", label: "Dividend Return" },
  { value: "other", label: "Other" }
];

const RECORD_TYPES = [
  { value: "expense", label: "Expenses", icon: "💰", description: "Operating costs, purchases, bills" },
  { value: "revenue", label: "Revenue/Income", icon: "📈", description: "Sales, contributions, funding" },
  { value: "production", label: "Production Batches", icon: "🏭", description: "Manufacturing, production runs" },
  { value: "inventory", label: "Stock/Inventory", icon: "📦", description: "Stock receipts, inventory adjustments" },
  { value: "payroll", label: "Payroll Items", icon: "👥", description: "Salaries, bonuses, deductions" },
];

export default function DocumentUploadExtractor({ 
  open, 
  onOpenChange, 
  type = "auto", // "auto" will detect, or force a specific type
  orgId,
  currentEmployee,
  onSuccess,
  categories: customCategories,
  products = [],
  employees = [],
  warehouses = [],
  customers = [],
  vehicles = [],
  saleTypes = [],
  selectedLocation = null,
  selectedSaleType = null
}) {
  const toast = useToast();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [detectedType, setDetectedType] = useState(type === "auto" ? null : type);
  const [documentSummary, setDocumentSummary] = useState(null);

  const baseCategories = type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_REVENUE_SOURCES;
  const categories = useMemo(() => {
    return [...(customCategories || baseCategories), ...dynamicCategories];
  }, [customCategories, baseCategories, dynamicCategories]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setExtractedData([]);
    setExtractedColumns([]);
    setDocumentSummary(null);
    setDetectedType(type === "auto" ? null : type);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // First, analyze document to detect what type of records to create
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and determine what type of business records should be created from it.

Available record types:
1. EXPENSE - Operating costs, purchases, bills, invoices for things bought, petty cash, maintenance costs
2. REVENUE - Sales receipts, income records, contributions, funding received, customer payments
3. PRODUCTION - Manufacturing records, production batches, batch numbers, product runs with quantities
4. INVENTORY - Stock receipts, goods received notes, inventory counts, stock adjustments
5. PAYROLL - Salary sheets, payroll records, employee payments, bonus lists, deduction schedules

Analyze the document content, headers, columns, and data to determine:
- What type of record this document represents
- A brief summary of what the document contains
- Key fields/columns detected
- Confidence level (high/medium/low)

Be specific about WHY you chose that record type.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            detected_type: { 
              type: "string", 
              enum: ["expense", "revenue", "production", "inventory", "payroll"],
              description: "The most appropriate record type for this document"
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            summary: { type: "string", description: "Brief summary of document content" },
            reasoning: { type: "string", description: "Why this record type was chosen" },
            key_columns: { type: "array", items: { type: "string" }, description: "Important columns/fields detected" },
            document_date: { type: "string", description: "Document date in YYYY-MM-DD format if found" },
            total_rows_estimate: { type: "number", description: "Estimated number of data rows" }
          }
        }
      });

      setDocumentSummary(analysisResult);
      const docType = type === "auto" ? analysisResult.detected_type : type;
      setDetectedType(docType);
      
      toast.info(
        `${RECORD_TYPES.find(r => r.value === docType)?.icon || '📄'} ${RECORD_TYPES.find(r => r.value === docType)?.label || docType} detected`,
        analysisResult.summary
      );

      // Now extract the actual data based on detected type
      const extractionSchema = {
        type: "object",
        properties: {
          document_info: {
            type: "object",
            properties: {
              date: { type: "string", description: "Document date in YYYY-MM-DD format" },
              title: { type: "string", description: "Document title or header" },
              type: { type: "string", description: "invoice, receipt, budget, expense_report, sales_report" },
              reference: { type: "string", description: "Document number or reference" }
            }
          },
          table_columns: {
            type: "array",
            items: { type: "string" },
            description: "List all column headers exactly as they appear in the table"
          },
          rows: {
            type: "array",
            description: "Extract every single row from the table - do not skip any",
            items: {
              type: "object",
              properties: {
                no: { type: "string", description: "Row number from NO or # column" },
                details: { type: "string", description: "Text from DETAILS, Description, or Item column - copy exactly" },
                unit: { type: "string", description: "Unit of measure (bags, pcs, kg, etc)" },
                est_qty: { type: "number", description: "Estimated quantity number" },
                est_unit_cost: { type: "number", description: "Estimated unit cost number" },
                est_total: { type: "number", description: "Estimated total/amount" },
                actual_qty: { type: "number", description: "Actual quantity number" },
                actual_unit_cost: { type: "number", description: "Actual unit cost number" },
                actual_total: { type: "number", description: "Actual total/amount - main value" },
                qty: { type: "number", description: "Quantity if only one qty column" },
                price: { type: "number", description: "Unit price if only one price column" },
                amount: { type: "number", description: "Amount/Total if only one amount column" },
                vendor: { type: "string", description: "Supplier or vendor name if shown" },
                customer: { type: "string", description: "Customer name if shown" },
                sku: { type: "string", description: "Product SKU or product code if shown" },
                product_name: { type: "string", description: "Product name if this is production data" },
                batch_number: { type: "string", description: "Batch number or lot number if shown" },
                expiry_date: { type: "string", description: "Expiry date in YYYY-MM-DD format if shown" },
                notes: { type: "string", description: "Any notes or remarks" },
                // Payroll specific
                employee_name: { type: "string", description: "Employee name" },
                employee_code: { type: "string", description: "Employee ID/code" },
                base_salary: { type: "number", description: "Base salary amount" },
                bonus: { type: "number", description: "Bonus amount" },
                deduction: { type: "number", description: "Deduction amount" },
                net_pay: { type: "number", description: "Net pay amount" },
                // Inventory specific
                warehouse: { type: "string", description: "Warehouse or location name" },
                stock_in: { type: "number", description: "Quantity received/added" },
                stock_out: { type: "number", description: "Quantity issued/removed" },
                // Production batch specific
                rolls: { type: "number", description: "Number of rolls" },
                weight_kg: { type: "number", description: "Weight in kilograms (kg)" }
              }
            }
          }
        }
      };

      let result;
      let items = [];
      let extractedDocDate = analysisResult.document_date || format(new Date(), 'yyyy-MM-dd');
      let columnHeaders = analysisResult.key_columns || [];

      try {
        const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: file_url,
          json_schema: extractionSchema
        });

        if (extractResult.status === 'success' && extractResult.output) {
          result = extractResult.output;
          items = result.rows || [];
          extractedDocDate = result.document_info?.date || extractedDocDate;
          columnHeaders = result.table_columns || columnHeaders;
        } else {
          throw new Error('Primary extraction failed');
        }
      } catch (primaryError) {
        console.log("ExtractDataFromUploadedFile failed, trying InvokeLLM:", primaryError);

        const typeSpecificPrompt = {
          expense: "Extract expense/purchase items with amounts, vendors, categories",
          revenue: "Extract revenue/income items with amounts, customers, sources",
          production: "Extract production batch data with SKUs, quantities, batch numbers",
          inventory: "Extract inventory/stock data with product names, quantities, warehouses",
          payroll: "Extract payroll data with employee names, salaries, bonuses, deductions"
        }[docType] || "Extract all tabular data";

        const fallbackResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Read this document and extract tabular data.

Document type detected: ${docType}
Focus: ${typeSpecificPrompt}

1. Find the document date (format as YYYY-MM-DD)
2. List ALL column headers from the table
3. For EACH row, extract all relevant fields based on the document type
4. Return every row - do not summarize or skip any data.`,
          file_urls: [file_url],
          response_json_schema: extractionSchema
        });

        result = fallbackResult;
        items = result.rows || [];
        extractedDocDate = result.document_info?.date || extractedDocDate;
        columnHeaders = result.table_columns || columnHeaders;
      }

      setExtractedColumns(columnHeaders);

      if (items.length > 0) {
        const categorizeItem = (description) => {
          const desc = (description || '').toLowerCase();
          if (desc.includes('fuel') || desc.includes('diesel') || desc.includes('petrol')) return 'fuel';
          if (desc.includes('cement') || desc.includes('sand') || desc.includes('gravel') || desc.includes('block')) return 'materials';
          if (desc.includes('labor') || desc.includes('labour') || desc.includes('worker') || desc.includes('mason')) return 'labor';
          if (desc.includes('transport') || desc.includes('delivery') || desc.includes('hauling')) return 'transport';
          if (desc.includes('food') || desc.includes('meal') || desc.includes('lunch')) return 'supplies';
          if (desc.includes('rent')) return 'rent';
          if (desc.includes('water') || desc.includes('electric') || desc.includes('power')) return 'utilities';
          if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('fix')) return 'maintenance';
          if (desc.includes('equipment') || desc.includes('tool') || desc.includes('machine')) return 'equipment';
          if (desc.includes('iron') || desc.includes('steel') || desc.includes('rod') || desc.includes('nail')) return 'materials';
          if (desc.includes('paint') || desc.includes('finish')) return 'materials';
          return 'other';
        };

        const existingCategoryValues = categories.map(c => c.value);
        const newCategories = [];

        const matchProductBySku = (sku, description) => {
          if (!sku && !description) return null;
          const searchText = (sku || description || '').toLowerCase();
          return products.find(p => 
            (p.sku && searchText.includes(p.sku.toLowerCase())) ||
            (p.name && searchText.includes(p.name.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase() === searchText)
          );
        };

        const matchCustomer = (customerName) => {
          if (!customerName) return null;
          const searchText = customerName.toLowerCase();
          return customers.find(c => 
            c.name?.toLowerCase().includes(searchText) ||
            searchText.includes(c.name?.toLowerCase())
          );
        };

        const matchLocation = (locationName) => {
          if (!locationName) return null;
          const searchText = locationName.toLowerCase();
          return [...warehouses, ...vehicles].find(loc => 
            loc.name?.toLowerCase().includes(searchText) ||
            loc.registration_number?.toLowerCase().includes(searchText) ||
            searchText.includes(loc.name?.toLowerCase())
          );
        };

        const mappedData = items.map((item, idx) => {
          const matchedProduct = matchProductBySku(item.sku, item.product_name || item.details);
          const matchedCustomer = matchCustomer(item.customer);
          const matchedLocation = matchLocation(item.warehouse || item.location);

          const estAmount = parseFloat(item.est_total) || parseFloat(item.estimated_amount) || 0;
          const actAmount = parseFloat(item.actual_total) || parseFloat(item.actual_amount) || 0;
          const singleAmount = parseFloat(item.amount) || 0;
          const finalAmount = actAmount || singleAmount || estAmount || 0;

          const estQty = parseFloat(item.est_qty) || 0;
          const actQty = parseFloat(item.actual_qty) || parseFloat(item.qty) || 0;
          const estUnitCost = parseFloat(item.est_unit_cost) || 0;
          const actUnitCost = parseFloat(item.actual_unit_cost) || parseFloat(item.price) || 0;

          const description = item.details || item.description || '';
          const category = categorizeItem(description);

          if (!existingCategoryValues.includes(category) && !newCategories.find(c => c.value === category)) {
            const label = category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newCategories.push({ value: category, label, icon: Hammer });
          }

          return {
            id: `temp-${idx}`,
            selected: true,
            item_no: item.no || String(idx + 1),
            description: description,
            estimated_qty: estQty,
            estimated_unit_cost: estUnitCost,
            estimated_amount: estAmount,
            actual_qty: actQty,
            actual_unit_cost: actUnitCost,
            quantity: actQty || estQty,
            unit_price: actUnitCost || estUnitCost,
            amount: finalAmount,
            unit: item.unit || '',
            vendor: item.vendor || '',
            contributor_name: item.customer || '',
            customer_name: item.customer || '',
            customer_id: matchedCustomer?.id || '',
            customer_phone: matchedCustomer?.phone || '',
            needs_customer_creation: !matchedCustomer && item.customer,
            reference_number: result.document_info?.reference || '',
            extra_columns: {},
            category: category,
            document_type: docType,
            date: extractedDocDate,
            status: 'pending',
            sku: item.sku || matchedProduct?.sku || '',
            product_id: matchedProduct?.id || '',
            product_name: item.product_name || matchedProduct?.name || '',
            needs_product_selection: !matchedProduct && (item.product_name || item.details),
            location_id: matchedLocation?.id || selectedLocation || '',
            location_name: matchedLocation?.name || matchedLocation?.registration_number || '',
            sale_type: selectedSaleType || (matchedLocation?.registration_number ? 'vehicle' : 'retail'),
            batch_number: item.batch_number || '',
            expiry_date: item.expiry_date || '',
            is_production: !!(item.sku || item.batch_number || matchedProduct),
            // Payroll fields
            employee_name: item.employee_name || '',
            employee_code: item.employee_code || '',
            employee_id: employees.find(emp => 
              emp.employee_code === item.employee_code || 
              emp.full_name?.toLowerCase() === item.employee_name?.toLowerCase()
            )?.id || '',
            base_salary: parseFloat(item.base_salary) || 0,
            bonus: parseFloat(item.bonus) || 0,
            deduction: parseFloat(item.deduction) || 0,
            net_pay: parseFloat(item.net_pay) || finalAmount,
            // Inventory fields
            warehouse_name: item.warehouse || '',
            warehouse_id: warehouses.find(w => 
              w.name?.toLowerCase().includes((item.warehouse || '').toLowerCase())
            )?.id || '',
            stock_in: parseFloat(item.stock_in) || actQty,
            stock_out: parseFloat(item.stock_out) || 0,
            // Production batch specific
            rolls: parseFloat(item.rolls) || 0,
            weight_kg: parseFloat(item.weight_kg) || 0
            };
        });

        const validData = mappedData.filter(item => 
          item.description.trim() !== '' || item.amount > 0
        );

        if (newCategories.length > 0) {
          setDynamicCategories(prev => [...prev, ...newCategories]);
          toast.info("New categories detected", `${newCategories.map(c => c.label).join(', ')}`);
        }

        setExtractedData(validData);
        const colInfo = columnHeaders.length > 0 ? ` (${columnHeaders.length} columns)` : '';
        toast.success("Data extracted", `Found ${validData.length} items${colInfo}`);
      } else {
        toast.warning("No data found", "Could not find table data in the document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateRecords = async () => {
    const selectedItems = extractedData.filter(e => e.selected);
    if (selectedItems.length === 0) {
      toast.warning("No items selected");
      return;
    }

    // Validate sales-specific data
    if (detectedType === 'revenue' || detectedType === 'auto') {
      const hasUnselectedProducts = selectedItems.some(i => i.needs_product_selection && !i.product_id);
      if (hasUnselectedProducts) {
        toast.error("Missing Products", "Please select products for all items or deselect them");
        return;
      }
      
      const hasNoLocation = selectedItems.some(i => !i.location_id);
      if (hasNoLocation && !selectedLocation) {
        toast.error("Missing Location", "Please select a location for all sales items");
        return;
      }
    }

    setUploadLoading(true);
    try {
      const isRevenue = detectedType === "revenue";
      const isProduction = detectedType === "production";
      
      let batchCount = 0;
      let expenseCount = 0;
      let revenueCount = 0;
      let salesCount = 0;

      const isInventory = detectedType === "inventory";
      const isPayroll = detectedType === "payroll";
      let inventoryCount = 0;
      let payrollCount = 0;

      // Create missing customers first
      const customerCache = {};
      for (const item of selectedItems) {
        if (item.needs_customer_creation && item.customer_name && !customerCache[item.customer_name]) {
          const newCustomer = await base44.entities.Customer.create({
            organisation_id: orgId,
            name: item.customer_name,
            phone: item.customer_phone || '',
            status: 'active',
            segment: 'regular',
            source: 'sales_upload'
          });
          customerCache[item.customer_name] = newCustomer.id;
          item.customer_id = newCustomer.id;
          toast.success("Customer Created", `Added ${item.customer_name}`);
        }
      }

      for (const item of selectedItems) {
        if ((isRevenue || detectedType === 'auto') && item.product_id && item.location_id) {
          // Create sales record from revenue document
          const saleNumber = `SL-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
          await base44.entities.Sale.create({
            organisation_id: orgId,
            sale_number: saleNumber,
            sale_type: item.sale_type || 'retail',
            employee_id: currentEmployee?.id,
            employee_name: currentEmployee?.full_name,
            customer_name: item.customer_name || 'Walk-in Customer',
            customer_id: item.customer_id || null,
            customer_phone: item.customer_phone || null,
            items: [{
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity || 1,
              unit_price: item.unit_price || item.amount,
              total: item.amount
            }],
            subtotal: item.amount,
            total_amount: item.amount,
            payment_method: 'cash',
            payment_status: 'paid',
            location: item.location_name,
            vehicle_id: item.sale_type === 'vehicle' ? item.location_id : null
          });

          // Update stock - allow negative stock
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            await base44.entities.Product.update(item.product_id, {
              stock_quantity: (product.stock_quantity || 0) - (item.quantity || 1)
            });
          }

          salesCount++;
        } else if (isPayroll && item.employee_id) {
          // Create payroll-related record or just log for now
          // This would typically feed into the payroll processing system
          await base44.entities.Expense.create({
            organisation_id: orgId,
            category: 'salaries',
            description: `Payroll: ${item.employee_name} - ${item.description || 'Salary payment'}`,
            amount: item.net_pay || item.amount || 0,
            date: item.date,
            payment_method: 'bank_transfer',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: `Base: Le${(item.base_salary || 0).toLocaleString()}, Bonus: Le${(item.bonus || 0).toLocaleString()}, Deductions: Le${(item.deduction || 0).toLocaleString()}`
          });
          payrollCount++;
        } else if (isInventory && item.product_id) {
          // Create stock movement record
          await base44.entities.StockMovement.create({
            organisation_id: orgId,
            product_id: item.product_id,
            product_name: item.product_name || item.description,
            warehouse_id: item.warehouse_id || '',
            warehouse_name: item.warehouse_name || '',
            movement_type: item.stock_in > 0 ? 'in' : 'out',
            quantity: item.stock_in || item.stock_out || item.quantity || 0,
            reference_type: 'manual',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            notes: `Imported from document. ${item.description || ''}`
          });
          inventoryCount++;
        } else if (isProduction) {
          const batchNum = item.batch_number || `BATCH-${format(new Date(), 'yyyyMMdd')}-${String(batchCount + 1).padStart(3, '0')}`;
          
          // Find warehouse by name if not already matched
          let warehouseId = item.warehouse_id;
          let warehouseName = item.warehouse_name;
          if (!warehouseId && warehouseName) {
            const matchedWarehouse = warehouses.find(w => 
              w.name?.toLowerCase().includes(warehouseName.toLowerCase()) ||
              warehouseName.toLowerCase().includes(w.name?.toLowerCase())
            );
            if (matchedWarehouse) {
              warehouseId = matchedWarehouse.id;
              warehouseName = matchedWarehouse.name;
            }
          }
          // Use first warehouse as default if none matched
          if (!warehouseId && warehouses.length > 0) {
            warehouseId = warehouses[0].id;
            warehouseName = warehouses[0].name;
          }
          
          // Create InventoryBatch (used by BatchManagement)
          await base44.entities.InventoryBatch.create({
            organisation_id: orgId,
            batch_number: batchNum,
            product_id: item.product_id || '',
            product_name: item.product_name || item.description || 'Unknown Product',
            warehouse_id: warehouseId || '',
            warehouse_name: warehouseName || '',
            quantity: item.quantity || item.actual_qty || 0,
            rolls: item.rolls || 0,
            weight_kg: item.weight_kg || 0,
            manufacturing_date: item.date || format(new Date(), 'yyyy-MM-dd'),
            expiry_date: item.expiry_date || '',
            cost_price: item.unit_price || item.actual_unit_cost || 0,
            status: 'active',
            notes: `Imported from document. ${item.description || ''}`
          });
          batchCount++;
        } else if (isRevenue) {
          await base44.entities.Revenue.create({
            organisation_id: orgId,
            source: item.category,
            contributor_name: item.contributor_name || item.description,
            amount: item.amount || 0,
            date: item.date,
            reference_number: item.reference_number || '',
            purpose: item.description,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: `Imported from document`
          });
          revenueCount++;
        } else {
          await base44.entities.Expense.create({
            organisation_id: orgId,
            category: item.category,
            description: item.description,
            amount: item.amount || 0,
            date: item.date,
            vendor: item.vendor || '',
            payment_method: 'cash',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            status: 'pending',
            notes: item.estimated_amount > 0 
              ? `Est: ${item.estimated_qty} x Le${item.estimated_unit_cost.toLocaleString()} = Le${item.estimated_amount.toLocaleString()}`
              : 'Imported from document'
          });
          expenseCount++;
        }
      }

      onOpenChange(false);
      setExtractedData([]);
      setExtractedColumns([]);
      setDetectedType(type);
      
      const messages = [];
      if (salesCount > 0) messages.push(`${salesCount} sale(s)`);
      if (batchCount > 0) messages.push(`${batchCount} production batch(es)`);
      if (expenseCount > 0) messages.push(`${expenseCount} expense(s)`);
      if (revenueCount > 0) messages.push(`${revenueCount} revenue(s)`);
      if (inventoryCount > 0) messages.push(`${inventoryCount} stock movement(s)`);
      if (payrollCount > 0) messages.push(`${payrollCount} payroll item(s)`);

      toast.success("Records created", messages.join(', ') + ' added');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to create records", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setExtractedData(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const updateItem = (id, field, value) => {
    setExtractedData(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const isRevenue = detectedType === "revenue";
  const isProduction = detectedType === "production";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 w-[98vw] [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import {isProduction ? 'Production Batches' : isRevenue ? 'Revenue' : 'Expenses'} from Document</h2>
              <p className="text-white/80 text-sm">Upload PDF, CSV, or images to extract {isProduction ? 'production batch' : isRevenue ? 'revenue' : 'expense'} data</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-140px)]">
          {extractedData.length === 0 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0072C6] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.csv,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="doc-upload-finance"
                  disabled={uploadLoading}
                />
                <label htmlFor="doc-upload-finance" className="cursor-pointer">
                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-[#0072C6] animate-spin" />
                      <p className="text-gray-600">Analyzing document & extracting data...</p>
                      <p className="text-sm text-gray-400">AI is detecting the record type automatically</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#0072C6]/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[#0072C6]" />
                      </div>
                      <p className="text-gray-600 font-medium">Click to upload document</p>
                      <p className="text-sm text-gray-400">AI will automatically detect what records to create</p>
                      <p className="text-xs text-gray-400 mt-1">Supports PDF, CSV, and images (PNG, JPG)</p>
                    </div>
                  )}
                </label>
              </div>
              
              {/* Record type hints */}
              {!uploadLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {RECORD_TYPES.map(rt => (
                    <div key={rt.value} className="p-2 bg-gray-50 rounded-lg text-center">
                      <span className="text-xl">{rt.icon}</span>
                      <p className="text-xs font-medium text-gray-700">{rt.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {extractedData.length > 0 && (
            <div className="space-y-4">
              {/* Document Analysis Summary */}
              {documentSummary && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{RECORD_TYPES.find(r => r.value === detectedType)?.icon || '📄'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {RECORD_TYPES.find(r => r.value === detectedType)?.label || detectedType}
                        </h4>
                        <Badge className={documentSummary.confidence === 'high' ? 'bg-green-100 text-green-700' : documentSummary.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                          {documentSummary.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{documentSummary.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">Reason: {documentSummary.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-700">Extracted Data ({extractedData.length})</h3>
                </div>
                <div className="flex gap-2">
                  <Select value={detectedType} onValueChange={setDetectedType}>
                    <SelectTrigger className="w-[200px] h-8 text-xs">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map(rt => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.icon} {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setExtractedData([]); setExtractedColumns([]); }}
                >
                  Clear & Upload New
                </Button>
              </div>

              {extractedColumns.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Columns detected from document:</p>
                  <div className="flex flex-wrap gap-1">
                    {extractedColumns.map((col, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-white">{col}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[calc(95vh-380px)] min-h-[300px] border rounded-lg overflow-auto">
                <div className={isProduction ? "min-w-[1200px]" : isRevenue ? "min-w-[900px]" : "min-w-[1400px]"}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            checked={extractedData.every(e => e.selected)}
                            onChange={(e) => setExtractedData(prev => prev.map(exp => ({ ...exp, selected: e.target.checked })))}
                            className="w-4 h-4"
                          />
                        </TableHead>
                        <TableHead className="text-xs">NO</TableHead>
                        {isProduction && <TableHead className="text-xs">SKU</TableHead>}
                        {isProduction && <TableHead className="text-xs">PRODUCT</TableHead>}
                        {isProduction && <TableHead className="text-xs">BATCH #</TableHead>}
                        <TableHead className="text-xs">{isProduction ? 'DESCRIPTION' : isRevenue ? 'DESCRIPTION' : 'DETAILS'}</TableHead>
                        {isRevenue && (
                          <>
                            <TableHead className="text-xs text-center bg-blue-50">Qty</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Unit Price</TableHead>
                          </>
                        )}
                        {!isRevenue && (
                          <>
                            <TableHead className="text-xs">Unit</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Qty</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Unit Cost</TableHead>
                            <TableHead className="text-xs text-center bg-blue-50">Est Amount</TableHead>
                            <TableHead className="text-xs text-center bg-green-50">Actual Qty</TableHead>
                            <TableHead className="text-xs text-center bg-green-50">Actual Unit Cost</TableHead>
                          </>
                        )}
                        <TableHead className="text-xs text-center bg-green-50">Amount</TableHead>
                        {isRevenue && <TableHead className="text-xs">CUSTOMER</TableHead>}
                        {isRevenue && <TableHead className="text-xs">PRODUCT</TableHead>}
                        {isRevenue && <TableHead className="text-xs">LOCATION</TableHead>}
                        {!isRevenue && !isProduction && <TableHead className="text-xs">Vendor</TableHead>}
                        {!isProduction && <TableHead className="text-xs">{isRevenue ? 'Revenue Type' : 'Category'}</TableHead>}
                        <TableHead className="text-xs">{isProduction ? 'Production Date' : 'Date'}</TableHead>
                        {isProduction && <TableHead className="text-xs">Expiry Date</TableHead>}
                        {extractedData.length > 0 && extractedData[0].extra_columns && Object.keys(extractedData[0].extra_columns).length > 0 && (
                          Object.keys(extractedData[0].extra_columns).map(key => (
                            <TableHead key={key} className="text-xs bg-purple-50">{key}</TableHead>
                          ))
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedData.map((item) => (
                        <TableRow key={item.id} className={!item.selected ? 'opacity-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelection(item.id)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="text-xs font-medium">{item.item_no || '-'}</TableCell>
                          {isProduction && (
                            <TableCell>
                              <Input
                                value={item.sku || ''}
                                onChange={(e) => {
                                  const sku = e.target.value;
                                  const matchedProduct = products.find(p => p.sku?.toLowerCase() === sku.toLowerCase());
                                  updateItem(item.id, 'sku', sku);
                                  if (matchedProduct) {
                                    updateItem(item.id, 'product_id', matchedProduct.id);
                                    updateItem(item.id, 'product_name', matchedProduct.name);
                                  }
                                }}
                                className="h-7 text-xs w-24"
                                placeholder="SKU"
                              />
                            </TableCell>
                          )}
                          {isProduction && (
                            <TableCell>
                              <Select
                                value={item.product_id || ''}
                                onValueChange={(v) => {
                                  const prod = products.find(p => p.id === v);
                                  updateItem(item.id, 'product_id', v);
                                  updateItem(item.id, 'product_name', prod?.name || '');
                                  updateItem(item.id, 'sku', prod?.sku || '');
                                  updateItem(item.id, 'needs_product_selection', false);
                                }}
                              >
                                <SelectTrigger className={`h-7 text-xs w-36 ${item.needs_product_selection ? 'border-amber-400 bg-amber-50' : ''}`}>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.sku ? `${p.sku} - ` : ''}{p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                          {isProduction && (
                            <TableCell>
                              <Input
                                value={item.batch_number || ''}
                                onChange={(e) => updateItem(item.id, 'batch_number', e.target.value)}
                                className="h-7 text-xs w-28"
                                placeholder="Batch #"
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              value={item.description || ''}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="h-7 text-xs min-w-[150px]"
                            />
                          </TableCell>
                          {isRevenue && (
                            <>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.unit_price || ''}
                                  onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                            </>
                          )}
                          {!isRevenue && (
                            <>
                              <TableCell>
                                <Input
                                  value={item.unit || ''}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                  className="h-7 text-xs w-16"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_qty || ''}
                                  onChange={(e) => updateItem(item.id, 'estimated_qty', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_unit_cost || ''}
                                  onChange={(e) => updateItem(item.id, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50 text-xs text-right font-medium text-blue-700">
                                Le {(item.estimated_amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_qty || ''}
                                  onChange={(e) => {
                                    const newQty = parseFloat(e.target.value) || 0;
                                    const newAmount = newQty * (item.actual_unit_cost || 0);
                                    updateItem(item.id, 'actual_qty', newQty);
                                    if (item.actual_unit_cost > 0) updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_unit_cost || ''}
                                  onChange={(e) => {
                                    const newCost = parseFloat(e.target.value) || 0;
                                    const newAmount = (item.actual_qty || 0) * newCost;
                                    updateItem(item.id, 'actual_unit_cost', newCost);
                                    if (item.actual_qty > 0) updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                            </>
                          )}
                          <TableCell className="bg-green-50/50">
                            <Input
                              type="number"
                              value={item.amount || ''}
                              onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="h-7 text-xs w-24 text-right font-medium"
                            />
                          </TableCell>
                          {isRevenue && (
                            <>
                              <TableCell>
                                <Select
                                  value={item.customer_id || ''}
                                  onValueChange={(v) => {
                                    const cust = customers.find(c => c.id === v);
                                    updateItem(item.id, 'customer_id', v);
                                    updateItem(item.id, 'customer_name', cust?.name || '');
                                    updateItem(item.id, 'needs_customer_creation', false);
                                  }}
                                >
                                  <SelectTrigger className={`h-7 text-xs w-32 ${item.needs_customer_creation ? 'border-amber-400 bg-amber-50' : ''}`}>
                                    <SelectValue placeholder={item.customer_name || "Select customer"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {customers.map(c => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.product_id || ''}
                                  onValueChange={(v) => {
                                    const prod = products.find(p => p.id === v);
                                    updateItem(item.id, 'product_id', v);
                                    updateItem(item.id, 'product_name', prod?.name || '');
                                    updateItem(item.id, 'needs_product_selection', false);
                                  }}
                                >
                                  <SelectTrigger className={`h-7 text-xs w-32 ${item.needs_product_selection ? 'border-amber-400 bg-amber-50' : ''}`}>
                                    <SelectValue placeholder={item.product_name || "Product"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map(p => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.location_id || ''}
                                  onValueChange={(v) => {
                                    const loc = [...warehouses, ...vehicles].find(l => l.id === v);
                                    updateItem(item.id, 'location_id', v);
                                    updateItem(item.id, 'location_name', loc?.name || loc?.registration_number || '');
                                  }}
                                >
                                  <SelectTrigger className={`h-7 text-xs w-32 ${!item.location_id ? 'border-amber-400 bg-amber-50' : ''}`}>
                                    <SelectValue placeholder={item.location_name || "Location"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {warehouses.map(w => (
                                      <SelectItem key={w.id} value={w.id}>
                                        📦 {w.name}
                                      </SelectItem>
                                    ))}
                                    {vehicles.map(v => (
                                      <SelectItem key={v.id} value={v.id}>
                                        🚚 {v.registration_number}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </>
                          )}
                          {!isRevenue && !isProduction && (
                            <TableCell>
                              <Input
                                value={item.vendor || ''}
                                onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                                className="h-7 text-xs w-24"
                              />
                            </TableCell>
                          )}
                          {!isProduction && (
                            <TableCell>
                              <Select
                                value={item.category}
                                onValueChange={(v) => updateItem(item.id, 'category', v)}
                              >
                                <SelectTrigger className="h-7 text-xs w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              type="date"
                              value={item.date || ''}
                              onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                              className="h-7 text-xs w-32"
                            />
                          </TableCell>
                          {isProduction && (
                            <TableCell>
                              <Input
                                type="date"
                                value={item.expiry_date || ''}
                                onChange={(e) => updateItem(item.id, 'expiry_date', e.target.value)}
                                className="h-7 text-xs w-32"
                              />
                            </TableCell>
                          )}
                          {item.extra_columns && Object.keys(item.extra_columns).length > 0 && (
                            Object.entries(item.extra_columns).map(([key, value]) => (
                              <TableCell key={key} className="bg-purple-50/50 text-xs">
                                {value?.toString() || '-'}
                              </TableCell>
                            ))
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {extractedData.filter(e => e.selected).length} item(s) selected
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: Le {extractedData.filter(e => e.selected).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleCreateRecords}
                  disabled={uploadLoading || extractedData.filter(e => e.selected).length === 0}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {uploadLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Create {extractedData.filter(e => e.selected).length} {RECORD_TYPES.find(r => r.value === detectedType)?.label || 'Record'}(s)
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}