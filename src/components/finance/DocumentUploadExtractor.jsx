
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
  Hammer,
  MapPin,
  Cloud,
  FileText
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
  { value: "production_wastage", label: "Production Wastage" },
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
  const [uploadLocation, setUploadLocation] = useState(selectedLocation || '');
  const [uploadSaleType, setUploadSaleType] = useState(selectedSaleType || 'retail');
  const [productionLocation, setProductionLocation] = useState('');
  const [currencyMode, setCurrencyMode] = useState(null); // null = not set, 'sle', 'sll'
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveFolders, setDriveFolders] = useState([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'My Drive' }]);
  const [appFolderId, setAppFolderId] = useState(null);
  const [appFolderLink, setAppFolderLink] = useState(null);

  const baseCategories = type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_REVENUE_SOURCES;
  const categories = useMemo(() => {
    return [...(customCategories || baseCategories), ...dynamicCategories];
  }, [customCategories, baseCategories, dynamicCategories]);

  const setupAppFolder = async () => {
    try {
      const { data } = await base44.functions.invoke('googleDriveManager', {
        action: 'getRootFolder'
      });
      
      if (data?.success && data.folder) {
        setAppFolderId(data.folder.id);
        return data.folder.id;
      }
    } catch (error) {
      console.error("Failed to setup app folder:", error);
      return null;
    }
  };

  const loadDriveFiles = async (folderId = null) => {
    setDriveLoading(true);
    try {
      // Don't force app folder - let user browse their entire Drive
      const { data } = await base44.functions.invoke('googleDriveManager', {
        action: 'listFiles',
        folderId: folderId || null
      });
      
      if (data.error) {
        toast.error("Drive Error", data.error);
        return;
      }
      
      const files = data.files || [];
      const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      const documents = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
      
      setDriveFolders(folders);
      setDriveFiles(documents);
      setCurrentFolderId(folderId);
      setShowDrivePicker(true);
    } catch (error) {
      toast.error("Failed to load Drive files", error.message);
    } finally {
      setDriveLoading(false);
    }
  };

  const navigateToFolder = (folder) => {
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    loadDriveFiles(folder.id);
  };

  const navigateBack = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    loadDriveFiles(newPath[newPath.length - 1].id);
  };

  const handleDriveFileSelect = async (driveFile) => {
    setShowDrivePicker(false);
    
    if (currencyMode === null) {
      setPendingFile({ isDriveFile: true, driveFile });
      setShowCurrencyDialog(true);
      return;
    }
    
    await processDriveFile(driveFile);
  };

  const processDriveFile = async (driveFile) => {
    setUploadLoading(true);
    setExtractedData([]);
    setExtractedColumns([]);
    setDocumentSummary(null);
    setDetectedType(type === "auto" ? null : type);

    try {
      toast.info("Downloading from Drive...", driveFile.name);
      
      const { data } = await base44.functions.invoke('googleDriveManager', {
        action: 'downloadFile',
        fileId: driveFile.id // Changed folderId to fileId as it's a file download
      });
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Upload the downloaded content to our server
      const binaryData = atob(data.content);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType });
      const file = new File([blob], driveFile.name, { type: data.mimeType });
      
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const file_url = uploadResult.file_url;

      // Continue with normal document processing flow...
      await base44.entities.UploadedDocument.create({
        organisation_id: orgId,
        file_name: driveFile.name,
        file_url: file_url,
        file_type: driveFile.mimeType || driveFile.name.split('.').pop(),
        file_size: driveFile.size || 0,
        category: type === "auto" ? "other" : type === "revenue" ? "revenue" : "expense",
        uploaded_by_id: currentEmployee?.id,
        uploaded_by_name: currentEmployee?.full_name,
        description: `Imported from Google Drive`
      });

      // Rest of the processing is the same as local file upload
      // (copying the analysis and extraction logic from processFile)
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and determine what type of business records should be created from it.

Available record types:
1. EXPENSE - Operating costs, purchases, bills, invoices for things bought, petty cash, maintenance costs
   → Look for: "EXPENSE ENTRY FORM" in header/title
2. REVENUE - Sales receipts, income records, contributions, funding received, customer payments
   → Look for: "REVENUE ENTRY FORM" in header/title
3. PRODUCTION - Manufacturing records, production batches, batch numbers, product runs with quantities
   → Look for: "BATCH ENTRY FORM" or "PRODUCTION BATCH ENTRY FORM" in header/title
   → Fields: Batch Number, Manufacturing Date, Expiry Date, Quantity Produced, Rolls, Weight (kg)
4. INVENTORY - Stock receipts, goods received notes, inventory counts, stock adjustments
   → Look for: "STOCK ADJUSTMENT FORM" or "INVENTORY" in header/title
   → Fields: Stock In, Stock Out, Warehouse/Location
5. PAYROLL - Salary sheets, payroll records, employee payments, bonus lists, deduction schedules
   → Look for: "EMPLOYEE ENTRY FORM" or "EMPLOYEE ONBOARDING FORM" in header/title
   → Fields: Employee Code, Position, Salary, Hire Date

Analyze the document content, headers, columns, and data to determine the record type.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            detected_type: { 
              type: "string", 
              enum: ["expense", "revenue", "production", "inventory", "payroll"]
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            summary: { type: "string" },
            reasoning: { type: "string" },
            key_columns: { type: "array", items: { type: "string" } },
            document_date: { type: "string" },
            total_rows_estimate: { type: "number" }
          }
        }
      });

      setDocumentSummary(analysisResult);
      const docType = type === "auto" ? analysisResult.detected_type : type;
      setDetectedType(docType);
      
      toast.info(
        `${RECORD_TYPES.find(r => r.value === docType)?.icon || '📄'} ${RECORD_TYPES.find(r => r.value === docType)?.label || docType} detected`,
        "From Google Drive"
      );

      // Continue with extraction...
      const extractionSchema = {
        type: "object",
        properties: {
          document_info: {
            type: "object",
            properties: {
              date: { type: "string" },
              title: { type: "string" },
              type: { type: "string" },
              reference: { type: "string" }
            }
          },
          table_columns: { type: "array", items: { type: "string" } },
          rows: { type: "array", items: { type: "object" } }
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
        }
      } catch {
        // Fallback to LLM extraction if needed
        result = { rows: [], document_info: {} };
      }

      setExtractedColumns(columnHeaders);

      if (items.length > 0) {
        const conversionFactor = currencyMode === 'sll' ? 1000 : 1;
        
        const mappedData = items.map((item, idx) => ({
          id: `temp-${idx}`,
          selected: true,
          description: item.details || item.description || '',
          amount: (parseFloat(item.amount) || 0) / conversionFactor,
          date: extractedDocDate,
          category: 'other',
          vendor: item.vendor || ''
        }));

        setExtractedData(mappedData);
        toast.success("Data extracted", `Found ${mappedData.length} items from Drive`);
      } else {
        toast.warning("No data found", "Could not find table data in the document");
      }
    } catch (error) {
      console.error("Drive upload error:", error);
      toast.error("Upload failed", error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ask user about currency before processing
    if (currencyMode === null) {
      setPendingFile(file);
      setShowCurrencyDialog(true);
      return;
    }

    processFile(file);
  };

  const processFile = async (file) => {
    setUploadLoading(true);
    setShowCurrencyDialog(false);
    setExtractedData([]);
    setExtractedColumns([]);
    setDocumentSummary(null);
    setDetectedType(type === "auto" ? null : type);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Save uploaded document for record keeping
      await base44.entities.UploadedDocument.create({
        organisation_id: orgId,
        file_name: file.name,
        file_url: file_url,
        file_type: file.type || file.name.split('.').pop(),
        file_size: file.size,
        category: type === "auto" ? "other" : type === "revenue" ? "revenue" : "expense",
        uploaded_by_id: currentEmployee?.id,
        uploaded_by_name: currentEmployee?.full_name,
        description: `Uploaded for data extraction`
      });

      // First, analyze document to detect what type of records to create
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and determine what type of business records should be created from it.

Available record types:
1. EXPENSE - Operating costs, purchases, bills, invoices for things bought, petty cash, maintenance costs
   → Look for: "EXPENSE ENTRY FORM" in header/title
2. REVENUE - Sales receipts, income records, contributions, funding received, customer payments
   → Look for: "REVENUE ENTRY FORM" in header/title
3. PRODUCTION - Manufacturing records, production batches, batch numbers, product runs with quantities
   → Look for: "BATCH ENTRY FORM" or "PRODUCTION BATCH ENTRY FORM" in header/title
   → Fields: Batch Number, Manufacturing Date, Expiry Date, Quantity Produced, Rolls, Weight (kg)
4. INVENTORY - Stock receipts, goods received notes, inventory counts, stock adjustments
   → Look for: "STOCK ADJUSTMENT FORM" or "INVENTORY" in header/title
   → Fields: Stock In, Stock Out, Warehouse/Location
5. PAYROLL - Salary sheets, payroll records, employee payments, bonus lists, deduction schedules
   → Look for: "EMPLOYEE ENTRY FORM" or "EMPLOYEE ONBOARDING FORM" in header/title
   → Fields: Employee Code, Position, Salary, Hire Date

RECOGNITION RULES:
- Check the document header/title FIRST for form type keywords
- Forms have signature sections at the bottom
- Templates have "TEMPLATE" as document number
- All our standard forms have "Instructions" section at top with "DOCUMENT TYPE:" label

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
            description: "Extract every single row from the table - do not skip any. IMPORTANT: Each row has its own date values, extract them individually for each row.",
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
                product_name: { type: "string", description: "Product name if this is production data, or from 'Product Name' field" },
                batch_number: { type: "string", description: "Batch number from 'Batch Number' field or lot number if shown" },
                manufacturing_date: { type: "string", description: "CRITICAL: Manufacturing/Production Date in YYYY-MM-DD format - extract THIS ROW's specific date, NOT the document date" },
                start_time: { type: "string", description: "Production start time in HH:MM format from THIS ROW's 'Start Time' field" },
                end_time: { type: "string", description: "Production end time in HH:MM format from THIS ROW's 'End Time' or 'Completion Time' field" },
                expiry_date: { type: "string", description: "CRITICAL: Expiry date in YYYY-MM-DD format - extract THIS ROW's specific expiry date, NOT the document date" },
                warehouse: { type: "string", description: "Warehouse name from 'Warehouse' field" },
                quality_status: { type: "string", description: "Quality status from 'Quality Status' field (pending/passed/failed)" },
                notes: { type: "string", description: "Any notes or remarks from 'Notes/Comments' field" },
                wastage_quantity: { type: "number", description: "Wastage/damaged quantity from 'Wastage' field" },
                wastage_cost: { type: "number", description: "Cost of wastage from 'Wastage Cost' field" },
                // Payroll / Employee specific
                employee_name: { type: "string", description: "Employee name or full name from form" },
                employee_code: { type: "string", description: "Employee ID/code from form" },
                first_name: { type: "string", description: "First name from employee form" },
                last_name: { type: "string", description: "Last name from employee form" },
                position: { type: "string", description: "Job position/role from form" },
                department: { type: "string", description: "Department from form" },
                hire_date: { type: "string", description: "Hire date in YYYY-MM-DD format" },
                phone: { type: "string", description: "Phone number from form" },
                email: { type: "string", description: "Email address from form" },
                address: { type: "string", description: "Address from form" },
                salary_type: { type: "string", description: "Salary type: monthly, hourly, or daily" },
                emergency_contact: { type: "string", description: "Emergency contact name" },
                emergency_phone: { type: "string", description: "Emergency contact phone" },
                base_salary: { type: "number", description: "Base salary amount" },
                bonus: { type: "number", description: "Bonus amount" },
                deduction: { type: "number", description: "Deduction amount" },
                net_pay: { type: "number", description: "Net pay amount" },
                // Inventory specific
                warehouse: { type: "string", description: "Warehouse or location name from form" },
                stock_in: { type: "number", description: "Quantity received/added from 'Stock IN' column" },
                stock_out: { type: "number", description: "Quantity issued/removed from 'Stock OUT' column" },
                movement_reason: { type: "string", description: "Reason for stock movement from Notes/Reason column" },
                // Production batch specific
                rolls: { type: "number", description: "Number of rolls from 'Rolls' field" },
                weight_kg: { type: "number", description: "Weight in kilograms (kg) from 'Weight' field" },
                supervisor_name: { type: "string", description: "Name of person who produced/supervised the batch from 'Supervisor' or 'Produced By' field" },
                produced_by: { type: "string", description: "Alternative producer name field" }
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
          expense: "Extract expense/purchase items with amounts, vendors, categories from EXPENSE ENTRY FORM",
          revenue: "Extract revenue/income items with amounts, customers, sources from REVENUE ENTRY FORM",
          production: "Extract production batch data with SKUs, quantities, batch numbers from BATCH ENTRY FORM",
          inventory: "Extract inventory/stock movements with products, stock in/out quantities from STOCK ADJUSTMENT FORM",
          payroll: "Extract employee data with names, codes, positions, salaries from EMPLOYEE ENTRY FORM"
        }[docType] || "Extract all tabular data";

        const fallbackResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Read this document and extract data.

Document type detected: ${docType}
Focus: ${typeSpecificPrompt}

IMPORTANT FOR BATCH ENTRY FORMS:
- Look for individual form fields like "Batch Number:", "Product Name:", "Quantity Produced:", etc.
- Extract the handwritten or typed values next to each field label
- Look for "Supervisor:" or "Produced By:" field and extract the name
- For Stock Allocation table, extract all rows with Location Name, Quantity, Notes
- Manufacturing Date and Expiry Date should be in YYYY-MM-DD format
- Start Time and End Time should be in HH:MM format

IMPORTANT: This is a FORM, not a table. Extract the form fields:
- Product Name, SKU, Batch Number
- Manufacturing Date, Start Time, End Time, Expiry Date
- Quantity Produced, Rolls, Weight (kg)
- Wastage Quantity, Wastage Cost
- Warehouse/Location, Quality Status (Pending/Passed/Failed)
- Supervisor/Produced By name
- Any notes or comments
- Then extract Stock Allocation table rows if present

1. Find the document date (format as YYYY-MM-DD)
2. For forms: extract field values. For tables: list ALL column headers
3. Extract all relevant data based on the document type
4. Return all data - do not skip anything.`,
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
        
        // Use row-specific date if available, otherwise fall back to document date
        const itemDate = item.manufacturing_date || item.date || extractedDocDate;

        // Currency conversion logic
        const rawEstAmount = parseFloat(item.est_total) || parseFloat(item.estimated_amount) || 0;
        const rawActAmount = parseFloat(item.actual_total) || parseFloat(item.actual_amount) || 0;
        const rawSingleAmount = parseFloat(item.amount) || 0;
        const rawEstUnitCost = parseFloat(item.est_unit_cost) || 0;
        const rawActUnitCost = parseFloat(item.actual_unit_cost) || parseFloat(item.price) || 0;

        // Convert from old SLL to new SLE if needed (1000 old = 1 new)
        const conversionFactor = currencyMode === 'sll' ? 1000 : 1;

        const estAmount = rawEstAmount / conversionFactor;
        const actAmount = rawActAmount / conversionFactor;
        const singleAmount = rawSingleAmount / conversionFactor;
        const finalAmount = actAmount || singleAmount || estAmount || 0;

        const estQty = parseFloat(item.est_qty) || 0;
        const actQty = parseFloat(item.actual_qty) || parseFloat(item.qty) || 0;
        const estUnitCost = rawEstUnitCost / conversionFactor;
        const actUnitCost = rawActUnitCost / conversionFactor;

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
          date: itemDate,
          status: 'pending',
          sku: item.sku || matchedProduct?.sku || '',
          product_id: matchedProduct?.id || '',
          product_name: item.product_name || matchedProduct?.name || '',
          needs_product_selection: !matchedProduct && (item.product_name || item.details),
            batch_number: item.batch_number || '',
            manufacturing_date: item.manufacturing_date || itemDate,
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
            weight_kg: parseFloat(item.weight_kg) || 0,
            wastage_quantity: parseFloat(item.wastage_quantity) || 0,
            wastage_cost: (parseFloat(item.wastage_cost) || 0) / conversionFactor,
            manufacturing_date: item.manufacturing_date || '',
            start_time: item.start_time || '',
            end_time: item.end_time || ''
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

      if (!uploadLocation) {
        toast.error("Missing Location", "Please select a location for all sales items");
        return;
      }
    }

    // Validate production-specific data
    if (detectedType === 'production') {
      if (!productionLocation) {
        toast.error("Missing Location", "Please select a production location");
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
      const isEmployeeForm = isPayroll && selectedItems.some(i => i.first_name || i.employee_code);
      let inventoryCount = 0;
      let payrollCount = 0;
      let employeeCount = 0;

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

      // Fetch stock levels for the upload location
      const stockLevels = uploadLocation ? await base44.entities.StockLevel.filter({
        organisation_id: orgId,
        warehouse_id: uploadLocation
      }) : [];

      const locationStockMap = {};
      stockLevels.forEach(sl => {
        locationStockMap[sl.product_id] = {
          id: sl.id,
          quantity: sl.quantity || 0,
          available_quantity: sl.available_quantity || sl.quantity || 0
        };
      });

      // Update the uploaded document with extracted data and category
      const uploadedDocs = await base44.entities.UploadedDocument.filter({
        organisation_id: orgId
      }, '-created_date', 1);
      
      if (uploadedDocs.length > 0) {
        const lastDoc = uploadedDocs[0];
        await base44.entities.UploadedDocument.update(lastDoc.id, {
          category: detectedType,
          extracted_data: {
            total_items: selectedItems.length,
            total_amount: selectedItems.reduce((sum, i) => sum + (i.amount || 0), 0),
            record_type: detectedType
          },
          tags: [detectedType, format(new Date(), 'MMM yyyy')]
        });
      }

      for (const item of selectedItems) {
        if ((isRevenue || detectedType === 'auto') && item.product_id && uploadLocation) {
          // Create sales record from revenue document
          const saleNumber = `SL-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

          const locationInfo = [...warehouses, ...vehicles].find(l => l.id === uploadLocation);

          await base44.entities.Sale.create({
            organisation_id: orgId,
            sale_number: saleNumber,
            sale_type: uploadSaleType,
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
            location: locationInfo?.name || locationInfo?.registration_number || '',
            vehicle_id: uploadSaleType === 'vehicle' ? uploadLocation : null
          });

          // Update allocated stock at the location
          const product = products.find(p => p.id === item.product_id);
          const stockLevel = locationStockMap[item.product_id];

          if (stockLevel) {
            // Update the stock level at this location
            const newLocationStock = Math.max(0, stockLevel.available_quantity - (item.quantity || 1));
            await base44.entities.StockLevel.update(stockLevel.id, {
              quantity: newLocationStock,
              available_quantity: newLocationStock
            });

            // Create stock movement
            await base44.entities.StockMovement.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: uploadLocation,
              warehouse_name: locationInfo?.name || locationInfo?.registration_number || '',
              movement_type: 'out',
              quantity: item.quantity || 1,
              previous_stock: stockLevel.available_quantity,
              new_stock: newLocationStock,
              reference_type: 'sale',
              reference_id: saleNumber,
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name,
              notes: `Uploaded ${uploadSaleType} sale from document`
            });
          }

          // Update product total stock
          if (product) {
            await base44.entities.Product.update(item.product_id, {
              stock_quantity: (product.stock_quantity || 0) - (item.quantity || 1)
            });
          }

          salesCount++;
        } else if (isEmployeeForm && (item.first_name || item.employee_code)) {
          // Create employee record from form
          const fullName = item.first_name && item.last_name ? 
            `${item.first_name} ${item.last_name}` : 
            item.employee_name || item.first_name || '';
          
          await base44.entities.Employee.create({
            organisation_id: orgId,
            employee_code: item.employee_code || `EMP-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`,
            first_name: item.first_name || item.employee_name?.split(' ')[0] || '',
            last_name: item.last_name || item.employee_name?.split(' ').slice(1).join(' ') || '',
            full_name: fullName,
            position: item.position || item.description || '',
            department: item.department || '',
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
            hire_date: item.hire_date || item.date || format(new Date(), 'yyyy-MM-dd'),
            salary_type: item.salary_type?.toLowerCase() || 'monthly',
            base_salary: item.base_salary || item.amount || 0,
            status: 'active',
            emergency_contact: item.emergency_contact || '',
            emergency_phone: item.emergency_phone || ''
          });
          employeeCount++;
        } else if (isPayroll && item.employee_id) {
          // Create payroll-related expense record
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
          const movementQty = item.stock_in || item.stock_out || item.quantity || 0;
          const movementType = item.stock_in > 0 ? 'in' : 'out';
          
          await base44.entities.StockMovement.create({
            organisation_id: orgId,
            product_id: item.product_id,
            product_name: item.product_name || item.description,
            warehouse_id: item.warehouse_id || '',
            warehouse_name: item.warehouse_name || item.warehouse || '',
            movement_type: movementType,
            quantity: movementQty,
            reference_type: 'manual',
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name,
            notes: item.movement_reason || item.notes || `Imported from STOCK ADJUSTMENT FORM. ${item.description || ''}`
          });
          inventoryCount++;
        } else if (isProduction) {
          const batchNum = item.batch_number || `BATCH-${format(new Date(), 'yyyyMMdd')}-${String(batchCount + 1).padStart(3, '0')}`;

          // Use selected production location or find warehouse by name
          let warehouseId = productionLocation || item.warehouse_id;
          let warehouseName = '';

          if (warehouseId) {
            const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
            warehouseName = selectedWarehouse?.name || '';
          } else if (item.warehouse_name || item.warehouse) {
            const warehouseNameFromDoc = item.warehouse_name || item.warehouse;
            const matchedWarehouse = warehouses.find(w => 
              w.name?.toLowerCase().includes(warehouseNameFromDoc.toLowerCase()) ||
              warehouseNameFromDoc.toLowerCase().includes(w.name?.toLowerCase())
            );
            if (matchedWarehouse) {
              warehouseId = matchedWarehouse.id;
              warehouseName = matchedWarehouse.name;
            }
          }
          
          const totalProduced = item.quantity || item.actual_qty || 0;
          const wastageQty = item.wastage_quantity || 0;
          const wastageCost = item.wastage_cost || 0;
          const finalQty = totalProduced - wastageQty;
          
          // Calculate duration hours if start and end times provided
          let durationHours = 0;
          if (item.start_time && item.end_time) {
            const [startHour, startMin] = item.start_time.split(':').map(Number);
            const [endHour, endMin] = item.end_time.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            durationHours = (endMinutes - startMinutes) / 60;
            if (durationHours < 0) durationHours += 24; // Handle overnight production
          }
          
          // Create InventoryBatch (used by BatchManagement)
          await base44.entities.InventoryBatch.create({
            organisation_id: orgId,
            batch_number: batchNum,
            product_id: item.product_id || '',
            product_name: item.product_name || item.description || 'Unknown Product',
            warehouse_id: warehouseId || '',
            warehouse_name: warehouseName || '',
            quantity: finalQty,
            rolls: item.rolls || 0,
            weight_kg: item.weight_kg || 0,
            manufacturing_date: item.manufacturing_date || item.date || format(new Date(), 'yyyy-MM-dd'),
            start_time: item.start_time || '',
            end_time: item.end_time || '',
            duration_hours: durationHours,
            expiry_date: item.expiry_date || '',
            cost_price: item.unit_price || item.actual_unit_cost || 0,
            status: item.quality_status || 'active',
            notes: item.notes || `Imported from document. ${item.description || ''}${wastageQty > 0 ? ` | Wastage: ${wastageQty}` : ''}${durationHours > 0 ? ` | Duration: ${durationHours.toFixed(1)}h` : ''}`
          });
          batchCount++;

          // Create expense record for wastage if wastage exists
          if (wastageQty > 0 || wastageCost > 0) {
            await base44.entities.Expense.create({
              organisation_id: orgId,
              category: 'production_wastage',
              description: `Production Wastage - Batch ${batchNum} - ${item.product_name || item.description || 'Unknown Product'}`,
              amount: wastageCost || 0,
              date: item.manufacturing_date || item.date || format(new Date(), 'yyyy-MM-dd'),
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name,
              status: 'approved',
              notes: `Wastage Qty: ${wastageQty} | Total Produced: ${totalProduced} | Final Qty: ${finalQty}`
            });
            expenseCount++;
          }
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
      if (employeeCount > 0) messages.push(`${employeeCount} employee(s)`);
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 w-[95vw] sm:w-[98vw] [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold truncate">Import {isProduction ? 'Production Batches' : isRevenue ? 'Revenue/Sales' : 'Expenses'} from Document</h2>
              <p className="text-white/80 text-xs sm:text-sm truncate">Upload PDF, CSV, or images to extract {isProduction ? 'production batch' : isRevenue ? 'revenue' : 'expense'} data</p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Production Location Selection */}
          {(detectedType === 'production' || isProduction) && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Production Location
              </h3>
              <div>
                <label className="text-xs font-medium text-green-800 uppercase mb-1 block">
                  Select Warehouse/Location
                </label>
                <Select value={productionLocation} onValueChange={setProductionLocation}>
                  <SelectTrigger className={!productionLocation ? "border-amber-400 bg-amber-50" : "bg-white"}>
                    <SelectValue placeholder="Select production location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.length > 0 ? (
                      warehouses.filter(w => w.is_active !== false).map(w => (
                        <SelectItem key={w.id} value={w.id}>
                          🏭 {w.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-warehouses" disabled>No warehouses available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!productionLocation && (
                  <p className="text-xs text-amber-700 mt-1">⚠️ Location required for production batch</p>
                )}
              </div>
            </div>
          )}

          {/* Location & Sale Type Selection for Revenue/Sales */}
          {(detectedType === 'revenue' || isRevenue) && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Sales Location & Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-blue-800 uppercase mb-1 block">Sale Type</label>
                  <Select value={uploadSaleType} onValueChange={setUploadSaleType}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">🏪 Retail (Store)</SelectItem>
                      <SelectItem value="warehouse">📦 Warehouse Sales</SelectItem>
                      <SelectItem value="vehicle">🚚 Vehicle Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-800 uppercase mb-1 block">
                    {uploadSaleType === 'vehicle' ? 'Select Vehicle' : 'Select Warehouse/Store'}
                  </label>
                  <Select value={uploadLocation} onValueChange={setUploadLocation}>
                    <SelectTrigger className={!uploadLocation ? "border-amber-400 bg-amber-50" : "bg-white"}>
                      <SelectValue placeholder="Select location..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadSaleType === 'vehicle' ? (
                        vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            🚚 {v.registration_number} - {v.brand} {v.model}
                          </SelectItem>
                        ))
                      ) : (
                        warehouses.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            📦 {w.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!uploadLocation && (
                    <p className="text-xs text-amber-700 mt-1">⚠️ Location required for sales import</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {extractedData.length === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0072C6] transition-colors">
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
                        <p className="text-gray-600 text-sm">Processing...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#0072C6]/10 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-[#0072C6]" />
                        </div>
                        <p className="text-gray-700 font-medium">Upload from Computer</p>
                        <p className="text-xs text-gray-500">PDF, CSV, or images</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  onClick={() => loadDriveFiles()}
                  disabled={uploadLoading || driveLoading}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0072C6] transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      {driveLoading ? (
                        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      ) : (
                        <Cloud className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">Import from Drive</p>
                    <p className="text-xs text-gray-500">Select from Google Drive</p>
                  </div>
                </button>
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

              <div className="h-[calc(95vh-380px)] min-h-[300px] border rounded-lg overflow-x-auto overflow-y-auto -mx-3 sm:mx-0">
                <Table className={isProduction ? "min-w-[800px] sm:min-w-[1200px]" : isRevenue ? "min-w-[600px] sm:min-w-[900px]" : "min-w-[1000px] sm:min-w-[1600px]"}>
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
                        {isProduction && <TableHead className="text-xs bg-amber-50">Wastage Qty</TableHead>}
                        {isProduction && <TableHead className="text-xs bg-amber-50">Wastage Cost</TableHead>}
                        {isRevenue && (
                          <>
                            <TableHead className="text-xs">CUSTOMER</TableHead>
                            <TableHead className="text-xs">PRODUCT</TableHead>
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
                            <TableHead className="text-xs text-center bg-green-50">Actual Total</TableHead>
                            </>
                            )}
                            <TableHead className="text-xs text-center bg-green-50 font-bold">Final Amount</TableHead>
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
                          {isProduction && (
                            <>
                              <TableCell className="bg-amber-50/50">
                                <Input
                                  type="number"
                                  value={item.wastage_quantity || ''}
                                  onChange={(e) => updateItem(item.id, 'wastage_quantity', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-20 text-center"
                                  placeholder="0"
                                />
                              </TableCell>
                              <TableCell className="bg-amber-50/50">
                                <Input
                                  type="number"
                                  value={item.wastage_cost || ''}
                                  onChange={(e) => updateItem(item.id, 'wastage_cost', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                  placeholder="0"
                                />
                              </TableCell>
                            </>
                          )}
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
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => {
                                    const newQty = parseFloat(e.target.value) || 0;
                                    const newAmount = newQty * (item.unit_price || 0);
                                    updateItem(item.id, 'quantity', newQty);
                                    updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.unit_price || ''}
                                  onChange={(e) => {
                                    const newPrice = parseFloat(e.target.value) || 0;
                                    const newAmount = (item.quantity || 0) * newPrice;
                                    updateItem(item.id, 'unit_price', newPrice);
                                    updateItem(item.id, 'amount', newAmount);
                                  }}
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
                                  onChange={(e) => {
                                    const newQty = parseFloat(e.target.value) || 0;
                                    const newEstAmount = newQty * (item.estimated_unit_cost || 0);
                                    updateItem(item.id, 'estimated_qty', newQty);
                                    updateItem(item.id, 'estimated_amount', newEstAmount);
                                  }}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_unit_cost || ''}
                                  onChange={(e) => {
                                    const newCost = parseFloat(e.target.value) || 0;
                                    const newEstAmount = (item.estimated_qty || 0) * newCost;
                                    updateItem(item.id, 'estimated_unit_cost', newCost);
                                    updateItem(item.id, 'estimated_amount', newEstAmount);
                                  }}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="bg-blue-50/50">
                                <Input
                                  type="number"
                                  value={item.estimated_amount || ''}
                                  onChange={(e) => updateItem(item.id, 'estimated_amount', parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 text-right"
                                  disabled
                                  title="Calculated: Qty × Unit Cost"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  value={item.actual_qty || ''}
                                  onChange={(e) => {
                                    const newQty = parseFloat(e.target.value) || 0;
                                    const newAmount = newQty * (item.actual_unit_cost || 0);
                                    updateItem(item.id, 'actual_qty', newQty);
                                    updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-16 text-center"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.actual_unit_cost || ''}
                                  onChange={(e) => {
                                    const newCost = parseFloat(e.target.value) || 0;
                                    const newAmount = (item.actual_qty || 0) * newCost;
                                    updateItem(item.id, 'actual_unit_cost', newCost);
                                    updateItem(item.id, 'amount', newAmount);
                                  }}
                                  className="h-7 text-xs w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="bg-green-50/50 text-xs text-right font-medium text-green-700">
                                Le {((item.actual_qty || 0) * (item.actual_unit_cost || 0)).toLocaleString()}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="bg-green-50/50">
                            <div className="text-xs text-right font-bold text-green-700 px-2">
                              Le {(item.amount || 0).toLocaleString()}
                            </div>
                              </TableCell>
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {extractedData.filter(e => e.selected).length} item(s) selected
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total: Le {extractedData.filter(e => e.selected).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleCreateRecords}
                  disabled={uploadLoading || extractedData.filter(e => e.selected).length === 0}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto"
                >
                  {uploadLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm">Create {extractedData.filter(e => e.selected).length} {RECORD_TYPES.find(r => r.value === detectedType)?.label || 'Record'}(s)</span>
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

      {/* Currency Selection Dialog */}
      <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">What Currency is in the Document?</h3>
              <p className="text-sm text-gray-600">
                Sierra Leone redenominated in July 2022: 1,000 old Leones (SLL) = 1 new Leone (SLE)
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-auto py-4 px-6 text-left hover:border-green-500 hover:bg-green-50"
                onClick={() => {
                  setCurrencyMode('sle');
                  if (pendingFile?.isDriveFile) {
                    processDriveFile(pendingFile.driveFile);
                  } else if (pendingFile) {
                    processFile(pendingFile);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">New Leone (SLE)</div>
                    <div className="text-sm text-gray-600">
                      Document shows amounts like: <strong>75</strong>, <strong>1,500</strong>, <strong>25,000</strong>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">No conversion needed</div>
                  </div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-auto py-4 px-6 text-left hover:border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  setCurrencyMode('sll');
                  if (pendingFile?.isDriveFile) {
                    processDriveFile(pendingFile.driveFile);
                  } else if (pendingFile) {
                    processFile(pendingFile);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">Old Leone (SLL)</div>
                    <div className="text-sm text-gray-600">
                      Document shows amounts like: <strong>75,000</strong>, <strong>1,500,000</strong>, <strong>25,000,000</strong>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Will divide by 1,000 to convert</div>
                  </div>
                </div>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowCurrencyDialog(false);
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Drive File Picker */}
      <Dialog open={showDrivePicker} onOpenChange={setShowDrivePicker}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <Cloud className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <h3 className="text-lg font-bold">Select from Google Drive</h3>
                {appFolderLink && (
                  <a
                    href={appFolderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    📁 Open "Business Management Uploads" folder
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Transfer your files to "Business Management Uploads" folder to access them here
                </p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] space-y-2">
              {driveLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <>
                  {driveFolders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="w-full p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 text-yellow-500 flex-shrink-0">📁</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{folder.name}</p>
                          <p className="text-xs text-gray-500">Folder</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {driveFiles.length === 0 && driveFolders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No files or folders found</p>
                    </div>
                  ) : (
                    driveFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleDriveFileSelect(file)}
                        className="w-full p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.modifiedTime).toLocaleDateString()} • {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDrivePicker(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
