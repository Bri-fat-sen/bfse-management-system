import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lightbulb,
  History,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// AI Form Assistant for expense and revenue forms
export default function AIFormAssistant({
  formType = "expense", // 'expense' or 'revenue'
  formData,
  onSuggestion,
  pastEntries = [],
  vendors = [],
  categories = [],
  className
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [autoFillSuggestions, setAutoFillSuggestions] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastAnalyzedDescription, setLastAnalyzedDescription] = useState("");

  // Analyze description for auto-categorization
  const analyzeDescription = async (description) => {
    if (!description || description.length < 3 || description === lastAnalyzedDescription) return;
    
    setLastAnalyzedDescription(description);
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${formType} description and suggest the best category and other details.

Description: "${description}"

Available categories: ${categories.map(c => c.value || c).join(', ')}

Based on the description, provide:
1. The most appropriate category from the list
2. A suggested vendor name if it can be inferred
3. Any validation warnings (e.g., unusually high amounts, missing details)
4. A better/cleaner description if the current one is unclear

Respond in JSON format.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_category: { type: "string" },
            suggested_vendor: { type: "string" },
            improved_description: { type: "string" },
            confidence: { type: "number" },
            warnings: { 
              type: "array", 
              items: { type: "string" } 
            },
            reasoning: { type: "string" }
          }
        }
      });

      if (result) {
        const newSuggestions = [];
        
        if (result.suggested_category && result.suggested_category !== formData.category) {
          newSuggestions.push({
            type: "category",
            field: "category",
            value: result.suggested_category,
            label: `Category: ${result.suggested_category.replace(/_/g, ' ')}`,
            confidence: result.confidence || 0.8,
            reasoning: result.reasoning
          });
        }

        if (result.suggested_vendor && !formData.vendor) {
          newSuggestions.push({
            type: "vendor",
            field: "vendor",
            value: result.suggested_vendor,
            label: `Vendor: ${result.suggested_vendor}`,
            confidence: 0.7
          });
        }

        if (result.improved_description && result.improved_description !== description) {
          newSuggestions.push({
            type: "description",
            field: "description",
            value: result.improved_description,
            label: `Better description: ${result.improved_description}`,
            confidence: 0.6
          });
        }

        setSuggestions(newSuggestions);
        setValidationErrors(result.warnings || []);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
    }

    setIsAnalyzing(false);
  };

  // Find similar past entries for auto-fill
  const similarEntries = useMemo(() => {
    if (!formData.description || formData.description.length < 3) return [];
    
    const descLower = formData.description.toLowerCase();
    const words = descLower.split(/\s+/).filter(w => w.length > 2);
    
    return pastEntries
      .filter(entry => {
        const entryDesc = (entry.description || "").toLowerCase();
        const entryVendor = (entry.vendor || "").toLowerCase();
        return words.some(word => entryDesc.includes(word) || entryVendor.includes(word));
      })
      .slice(0, 3)
      .map(entry => ({
        ...entry,
        matchScore: words.filter(w => 
          (entry.description || "").toLowerCase().includes(w)
        ).length / words.length
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [formData.description, pastEntries]);

  // Validate form data in real-time
  const realTimeValidation = useMemo(() => {
    const errors = [];
    
    // Amount validation
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      if (amount < 0) {
        errors.push({ field: "amount", message: "Amount cannot be negative" });
      }
      if (amount > 100000000) {
        errors.push({ field: "amount", message: "Amount seems unusually high. Please verify." });
      }
      if (formType === "expense" && amount > 10000000) {
        errors.push({ field: "amount", message: "Large expense - consider getting approval", severity: "warning" });
      }
    }

    // Date validation
    if (formData.date) {
      const entryDate = new Date(formData.date);
      const today = new Date();
      const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 90) {
        errors.push({ field: "date", message: "Date is more than 90 days ago", severity: "warning" });
      }
      if (entryDate > today) {
        errors.push({ field: "date", message: "Future dates are not allowed" });
      }
    }

    // Description validation
    if (formData.description && formData.description.length < 5) {
      errors.push({ field: "description", message: "Description is too short", severity: "warning" });
    }

    return errors;
  }, [formData, formType]);

  // Trigger AI analysis when description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description && formData.description.length >= 5) {
        analyzeDescription(formData.description);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.description]);

  const applySuggestion = (suggestion) => {
    onSuggestion(suggestion.field, suggestion.value);
    setSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
  };

  const applyPastEntry = (entry) => {
    onSuggestion("category", entry.category);
    if (entry.vendor) onSuggestion("vendor", entry.vendor);
    if (entry.payment_method) onSuggestion("payment_method", entry.payment_method);
  };

  const allErrors = [...realTimeValidation, ...validationErrors.map(w => ({ message: w, severity: "warning" }))];
  const hasContent = suggestions.length > 0 || similarEntries.length > 0 || allErrors.length > 0 || isAnalyzing;

  if (!hasContent && !formData.description) return null;

  return (
    <div className={cn("rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 overflow-hidden", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">AI Assistant</p>
            <p className="text-xs text-gray-500">
              {isAnalyzing ? "Analyzing..." : 
               suggestions.length > 0 ? `${suggestions.length} suggestions` :
               similarEntries.length > 0 ? "Past entries found" : "Ready to help"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
          {allErrors.length > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {allErrors.length} {allErrors.length === 1 ? 'issue' : 'issues'}
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-purple-700">
                <Wand2 className="w-3 h-3" />
                AI Suggestions
              </div>
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Lightbulb className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{suggestion.label}</span>
                    {suggestion.confidence >= 0.8 && (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">High confidence</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => applySuggestion(suggestion)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Similar Past Entries */}
          {similarEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                <History className="w-3 h-3" />
                Similar Past Entries
              </div>
              {similarEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{entry.description || entry.vendor}</p>
                    <p className="text-xs text-gray-500">
                      {entry.category?.replace(/_/g, ' ')} • Le {entry.amount?.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => applyPastEntry(entry)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Validation Errors/Warnings */}
          {allErrors.length > 0 && (
            <div className="space-y-2">
              {allErrors.map((error, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-sm",
                    error.severity === "warning" 
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  )}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* All Good State */}
          {!isAnalyzing && suggestions.length === 0 && allErrors.length === 0 && formData.description && formData.description.length >= 5 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700 text-sm border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span>Looking good! No issues detected.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Quick suggestion chips for common entries
export function QuickSuggestionChips({ 
  type = "expense",
  onSelect,
  recentCategories = [],
  recentVendors = [] 
}) {
  const expenseQuickFills = [
    { label: "🛢️ Fuel", category: "fuel", description: "Fuel purchase" },
    { label: "🔧 Repairs", category: "maintenance", description: "Vehicle/equipment repair" },
    { label: "💡 Electricity", category: "utilities", description: "Electricity bill" },
    { label: "📦 Supplies", category: "supplies", description: "Office supplies" },
    { label: "🚗 Transport", category: "transport", description: "Transport fare" },
  ];

  const revenueQuickFills = [
    { label: "👤 Owner", source: "owner_contribution" },
    { label: "👔 CEO", source: "ceo_contribution" },
    { label: "💰 Investor", source: "investor_funding" },
    { label: "🏦 Loan", source: "loan" },
  ];

  const quickFills = type === "expense" ? expenseQuickFills : revenueQuickFills;

  return (
    <div className="flex flex-wrap gap-2">
      {quickFills.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(item)}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}