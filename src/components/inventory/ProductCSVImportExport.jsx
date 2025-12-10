import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductCSVImportExport({ 
  open, 
  onOpenChange, 
  products = [],
  orgId 
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleExportCSV = () => {
    const headers = [
      'Name', 'SKU', 'Category', 'Description', 'Unit Price', 'Cost Price', 
      'Wholesale Price', 'Stock Quantity', 'Low Stock Threshold', 'Unit',
      'Brand', 'Model', 'Weight', 'Dimensions', 'Color', 'Material', 
      'Warranty', 'Tags', 'Barcode', 'Is Active'
    ];

    const rows = products.map(p => [
      p.name || '',
      p.sku || '',
      p.category || '',
      p.description || '',
      p.unit_price || 0,
      p.cost_price || 0,
      p.wholesale_price || 0,
      p.stock_quantity || 0,
      p.low_stock_threshold || 10,
      p.unit || 'piece',
      p.specifications?.brand || '',
      p.specifications?.model || '',
      p.specifications?.weight || '',
      p.specifications?.dimensions || '',
      p.specifications?.color || '',
      p.specifications?.material || '',
      p.specifications?.warranty || '',
      (p.tags || []).join(';'),
      p.barcode || '',
      p.is_active ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export successful', `${products.length} products exported`);
  };

  const handleExportTemplate = () => {
    const headers = [
      'Name*', 'SKU', 'Category', 'Description', 'Unit Price*', 'Cost Price', 
      'Wholesale Price', 'Stock Quantity', 'Low Stock Threshold', 'Unit',
      'Brand', 'Model', 'Weight', 'Dimensions', 'Color', 'Material', 
      'Warranty', 'Tags (semicolon separated)', 'Barcode', 'Is Active (Yes/No)'
    ];

    const sampleRow = [
      'Sample Product',
      'SKU-001',
      'Beverages',
      'Sample product description',
      '50000',
      '35000',
      '45000',
      '100',
      '10',
      'piece',
      'Sample Brand',
      'Model X',
      '500g',
      '10x5x3 cm',
      'Blue',
      'Plastic',
      '1 year',
      'new;popular;featured',
      '123456789',
      'Yes'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_import_template.csv';
    link.click();

    toast.success('Template downloaded', 'Fill in the template and import');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Invalid file type', 'Please select a CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/^"|"$/g, '') || '';
      });
      return row;
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('No file selected', 'Please choose a CSV file to import');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSV(text);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const row of rows) {
          try {
            if (!row['Name*'] || !row['Unit Price*']) {
              errors.push(`Row skipped: Missing required fields (Name or Unit Price)`);
              errorCount++;
              continue;
            }

            const tags = row['Tags (semicolon separated)'] 
              ? row['Tags (semicolon separated)'].split(';').map(t => t.trim()).filter(Boolean)
              : [];

            const productData = {
              organisation_id: orgId,
              name: row['Name*'],
              sku: row['SKU'] || `SKU-${Date.now()}-${successCount}`,
              category: row['Category'] || 'Other',
              description: row['Description'] || '',
              unit_price: parseFloat(row['Unit Price*']) || 0,
              cost_price: parseFloat(row['Cost Price']) || 0,
              wholesale_price: parseFloat(row['Wholesale Price']) || 0,
              stock_quantity: parseInt(row['Stock Quantity']) || 0,
              low_stock_threshold: parseInt(row['Low Stock Threshold']) || 10,
              unit: row['Unit'] || 'piece',
              barcode: row['Barcode'] || '',
              is_active: (row['Is Active (Yes/No)'] || 'Yes').toLowerCase() === 'yes',
              tags: tags,
              specifications: {
                brand: row['Brand'] || '',
                model: row['Model'] || '',
                weight: row['Weight'] || '',
                dimensions: row['Dimensions'] || '',
                color: row['Color'] || '',
                material: row['Material'] || '',
                warranty: row['Warranty'] || '',
                custom: []
              }
            };

            await base44.entities.Product.create(productData);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(`${row['Name*'] || 'Unknown'}: ${error.message}`);
          }
        }

        setImportResults({ successCount, errorCount, errors });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        if (successCount > 0) {
          toast.success('Import completed', `${successCount} products imported successfully`);
        }
        if (errorCount > 0) {
          toast.warning('Import had errors', `${errorCount} products failed to import`);
        }
      } catch (error) {
        toast.error('Import failed', error.message);
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#1EB053]" />
            Import/Export Products (CSV)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#0072C6]" />
                Export Products
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Download your current product catalog as a CSV file
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportCSV}
                  className="bg-[#0072C6] hover:bg-[#005a9e]"
                  disabled={products.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Products ({products.length})
                </Button>
                <Button
                  onClick={handleExportTemplate}
                  variant="outline"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1EB053]" />
                Import Products
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file to bulk import products. Download the template to see the required format.
              </p>

              <div className="space-y-4">
                <div>
                  <Label>Select CSV File</Label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1EB053]/10 file:text-[#1EB053] hover:file:bg-[#1EB053]/20"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="bg-[#1EB053] hover:bg-[#178f43]"
                >
                  {importing ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Products
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResults && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Import Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-green-700">
                    ✓ Successfully imported: {importResults.successCount} products
                  </p>
                  {importResults.errorCount > 0 && (
                    <>
                      <p className="text-red-700">
                        ✗ Failed to import: {importResults.errorCount} products
                      </p>
                      {importResults.errors.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                          {importResults.errors.slice(0, 10).map((error, idx) => (
                            <p key={idx} className="text-xs text-red-600">• {error}</p>
                          ))}
                          {importResults.errors.length > 10 && (
                            <p className="text-xs text-gray-500">
                              ...and {importResults.errors.length - 10} more errors
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-sm">Import Instructions</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Download the template to see the required format</li>
                <li>• Required fields: Name*, Unit Price*</li>
                <li>• Use semicolons (;) to separate multiple tags</li>
                <li>• Use "Yes" or "No" for the Is Active column</li>
                <li>• Stock quantities will be set as initial stock</li>
                <li>• Duplicate SKUs will cause import errors</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}