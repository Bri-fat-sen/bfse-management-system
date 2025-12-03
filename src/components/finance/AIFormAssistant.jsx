import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wand2,
  History,
  TrendingUp,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// AI Form Assistant for expense/revenue forms
export default function AIFormAssistant({ 
  formType = 'expense', // 'expense' or 'revenue'
  formData,
  setFormData,
  pastEntries = [],
  vendors = [],
  categories = [],
  organisation,
  className
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  // Analyze past entries to find patterns
  const patterns = useMemo(() => {
    if (!pastEntries || pastEntries.length < 3) return null;

    // Find most common vendors per category
    const vendorsByCategory = {};
    const amountsByCategory = {};
    const descriptionsByCategory = {};

    pastEntries.forEach(entry => {
      const cat = entry.category || 'other';
      
      // Track vendors
      if (entry.vendor) {
        if (!vendorsByCategory[cat]) vendorsByCategory[cat] = {};
        vendorsByCategory[cat][entry.vendor] = (vendorsByCategory[cat][entry.vendor] || 0) + 1;
      }

      // Track amounts
      if (entry.amount > 0) {
        if (!amountsByCategory[cat]) amountsByCategory[cat] = [];
        amountsByCategory[cat].push(entry.amount);
      }

      // Track descriptions
      if (entry.description) {
        if (!descriptionsByCategory[cat]) descriptionsByCategory[cat] = [];
        descriptionsByCategory[cat].push(entry.description);
      }
    });

    // Calculate averages and common values
    const result = {};
    Object.keys(amountsByCategory).forEach(cat => {
      const amounts = amountsByCategory[cat];
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const sortedVendors = vendorsByCategory[cat] 
        ? Object.entries(vendorsByCategory[cat]).sort((a, b) => b[1] - a[1]).slice(0, 3)
        : [];

      result[cat] = {
        avgAmount: Math.round(avgAmount),
        topVendors: sortedVendors.map(([v]) => v),
        recentDescriptions: (descriptionsByCategory[cat] || []).slice(-5)
      };
    });

    return result;
  }, [pastEntries]);

  // Generate suggestions based on current form state
  useEffect(() => {
    const newSuggestions = [];
    const category = formData?.category;

    if (patterns && category && patterns[category]) {
      const catData = patterns[category];

      // Suggest vendor if not filled
      if (!formData.vendor && catData.topVendors.length > 0) {
        newSuggestions.push({
          type: 'vendor',
          icon: History,
          label: 'Suggested Vendors',
          values: catData.topVendors,
          description: 'Based on past entries'
        });
      }

      // Suggest typical amount
      if (!formData.amount && catData.avgAmount > 0) {
        newSuggestions.push({
          type: 'amount',
          icon: TrendingUp,
          label: 'Typical Amount',
          value: catData.avgAmount,
          description: `Average for ${category.replace(/_/g, ' ')}`
        });
      }

      // Suggest descriptions
      if (!formData.description && catData.recentDescriptions.length > 0) {
        newSuggestions.push({
          type: 'description',
          icon: Lightbulb,
          label: 'Recent Descriptions',
          values: [...new Set(catData.recentDescriptions)].slice(0, 3),
          description: 'Click to use'
        });
      }
    }

    // Category-specific suggestions
    if (category) {
      const categorySuggestions = getCategorySuggestions(category);
      if (categorySuggestions && !formData.description) {
        newSuggestions.push({
          type: 'description_template',
          icon: Wand2,
          label: 'Description Templates',
          values: categorySuggestions,
          description: 'Common descriptions'
        });
      }
    }

    setSuggestions(newSuggestions);
  }, [formData, patterns]);

  // Validate form in real-time
  useEffect(() => {
    const errors = [];

    // Amount validation
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({ field: 'amount', message: 'Amount must be a positive number' });
      } else if (amount > 100000000) {
        errors.push({ field: 'amount', message: 'Amount seems unusually high. Please verify.' });
      }

      // Check against typical range
      if (patterns && formData.category && patterns[formData.category]) {
        const avg = patterns[formData.category].avgAmount;
        if (avg && amount > avg * 10) {
          errors.push({ 
            field: 'amount', 
            message: `This is ${Math.round(amount / avg)}x higher than your typical ${formData.category.replace(/_/g, ' ')} expense`,
            type: 'warning'
          });
        }
      }
    }

    // Date validation
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (selectedDate > today) {
        errors.push({ field: 'date', message: 'Date cannot be in the future', type: 'warning' });
      }
      if (selectedDate < sixMonthsAgo) {
        errors.push({ field: 'date', message: 'Date is more than 6 months old', type: 'warning' });
      }
    }

    // Description validation
    if (formData.description && formData.description.length < 3) {
      errors.push({ field: 'description', message: 'Description is too short' });
    }

    setValidationErrors(errors);
  }, [formData, patterns]);

  // Generate AI description
  const generateDescription = async () => {
    if (!formData.category) return;
    
    setIsGenerating(true);
    try {
      const context = {
        category: formData.category,
        vendor: formData.vendor,
        amount: formData.amount,
        organisation: organisation?.name,
        pastDescriptions: patterns?.[formData.category]?.recentDescriptions || []
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a brief, professional expense description for a business in Sierra Leone.
        
Category: ${context.category.replace(/_/g, ' ')}
Vendor: ${context.vendor || 'Not specified'}
Amount: Le ${context.amount || 'Not specified'}
Business: ${context.organisation || 'Business'}

Past similar descriptions for reference:
${context.pastDescriptions.slice(0, 3).join('\n')}

Generate ONE short (5-15 words) description that clearly explains what this expense is for. Be specific and professional.`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" }
          }
        }
      });

      if (result?.description) {
        setAiDescription(result.description);
      }
    } catch (error) {
      console.error('AI generation error:', error);
    }
    setIsGenerating(false);
  };

  const applySuggestion = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applyAiDescription = () => {
    if (aiDescription) {
      setFormData(prev => ({ ...prev, description: aiDescription }));
      setAiDescription('');
    }
  };

  const getCategorySuggestions = (category) => {
    const templates = {
      fuel: ['Fuel for delivery vehicle', 'Generator diesel', 'Company vehicle fuel', 'Transport fuel'],
      maintenance: ['Vehicle servicing', 'Equipment repair', 'Office maintenance', 'AC repair'],
      utilities: ['Electricity bill payment', 'Water bill', 'Internet subscription', 'Phone bill'],
      supplies: ['Office supplies purchase', 'Cleaning supplies', 'Stationery items', 'Printer ink'],
      rent: ['Monthly office rent', 'Warehouse rent payment', 'Store rental', 'Parking space rent'],
      transport: ['Staff transport allowance', 'Delivery charges', 'Taxi fare for meeting', 'Courier service'],
      marketing: ['Social media advertising', 'Print materials', 'Radio advertisement', 'Promotional items'],
      insurance: ['Vehicle insurance premium', 'Business insurance', 'Staff insurance', 'Equipment insurance'],
      petty_cash: ['Miscellaneous expenses', 'Small purchases', 'Emergency supplies', 'Staff welfare'],
      salaries: ['Monthly salary payment', 'Overtime payment', 'Bonus payment', 'Allowances'],
      other: ['Business expense', 'Operational cost', 'Miscellaneous payment']
    };
    return templates[category] || templates.other;
  };

  if (suggestions.length === 0 && validationErrors.length === 0 && !aiDescription) {
    return null;
  }

  return (
    <div className={cn("bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">AI Assistant</p>
            <p className="text-[10px] text-gray-500">Smart suggestions & validation</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Validation Errors/Warnings */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              {validationErrors.map((error, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-xs",
                    error.type === 'warning' 
                      ? "bg-amber-50 border border-amber-200" 
                      : "bg-red-50 border border-red-200"
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                    error.type === 'warning' ? "text-amber-500" : "text-red-500"
                  )} />
                  <span className={error.type === 'warning' ? "text-amber-700" : "text-red-700"}>
                    {error.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* AI Generated Description */}
          {aiDescription && (
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Wand2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">AI Suggested Description:</p>
                    <p className="text-sm font-medium text-gray-800">{aiDescription}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAiDescription('')}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={applyAiDescription}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Use This Description
              </Button>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.map((suggestion, idx) => (
            <div key={idx} className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <suggestion.icon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">{suggestion.label}</span>
                <span className="text-[10px] text-gray-400">• {suggestion.description}</span>
              </div>
              
              {suggestion.values ? (
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.values.map((value, vIdx) => (
                    <button
                      key={vIdx}
                      type="button"
                      onClick={() => applySuggestion(suggestion.type === 'description_template' ? 'description' : suggestion.type, value)}
                      className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion.type, suggestion.value)}
                  className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 font-medium transition-colors"
                >
                  Le {suggestion.value?.toLocaleString()}
                </button>
              )}
            </div>
          ))}

          {/* Generate Description Button */}
          {formData.category && !formData.description && !aiDescription && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDescription}
              disabled={isGenerating}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 mr-2" />
                  Generate Description with AI
                </>
              )}
            </Button>
          )}

          {/* Quick tip based on category */}
          {formData.category && (
            <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-emerald-700">
                {getCategoryTip(formData.category)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getCategoryTip(category) {
  const tips = {
    fuel: "Tip: Include vehicle registration or purpose for better tracking.",
    maintenance: "Tip: Note the equipment/vehicle and type of repair for warranty tracking.",
    utilities: "Tip: Include the billing period and account number for reconciliation.",
    supplies: "Tip: List main items purchased for inventory reference.",
    rent: "Tip: Include the rental period and property details.",
    transport: "Tip: Note the trip purpose and destination for travel expense reports.",
    marketing: "Tip: Include campaign name or platform for ROI tracking.",
    insurance: "Tip: Include policy number and coverage period.",
    petty_cash: "Tip: Keep receipts for all petty cash disbursements.",
    salaries: "Tip: Include employee name and pay period.",
    other: "Tip: Be specific about the expense purpose for accurate categorization."
  };
  return tips[category] || tips.other;
}

// Export validation helper for use in forms
export function validateExpenseForm(formData) {
  const errors = [];
  
  if (!formData.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  if (!formData.description || formData.description.trim().length < 3) {
    errors.push({ field: 'description', message: 'Please provide a clear description' });
  }
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    errors.push({ field: 'amount', message: 'Please enter a valid amount' });
  }
  if (!formData.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }
  
  return errors;
}