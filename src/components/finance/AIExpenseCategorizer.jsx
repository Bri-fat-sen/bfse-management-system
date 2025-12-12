import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  TrendingUp,
  Brain
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

export default function AIExpenseCategorizer({ 
  open, 
  onOpenChange, 
  expenses = [], 
  categories = [],
  orgId,
  currentEmployee 
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userCorrections, setUserCorrections] = useState({});
  const [selectedExpenses, setSelectedExpenses] = useState(new Set());
  const [learningData, setLearningData] = useState([]);

  // Filter uncategorized or poorly categorized expenses
  const uncategorizedExpenses = useMemo(() => {
    return expenses.filter(e => 
      !e.category || 
      e.category === 'other' || 
      e.category === 'uncategorized'
    ).slice(0, 100); // Limit for performance
  }, [expenses]);

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses'] });
    },
  });

  const analyzeBulkExpenses = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    
    try {
      // Prepare learning data from correctly categorized expenses
      const categorizedExpenses = expenses
        .filter(e => e.category && e.category !== 'other' && e.category !== 'uncategorized')
        .slice(0, 50);

      // Include user corrections in learning data
      const corrections = Object.values(userCorrections);
      const trainingData = [...categorizedExpenses, ...corrections];

      const expensesToAnalyze = uncategorizedExpenses.slice(0, 50);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI expense categorization expert for a Sierra Leone business.

**Available Categories:**
${categories.map(c => `- ${c.value || c}: ${c.label || c}`).join('\n')}

**Learning from ${trainingData.length} past categorizations:**
${trainingData.slice(0, 30).map(e => 
  `"${e.description}" (Vendor: ${e.vendor || 'N/A'}) → Category: ${e.category} (Amount: Le ${e.amount || 0})`
).join('\n')}

${corrections.length > 0 ? `\n**User Corrections (HIGH PRIORITY - learn from these):**
${corrections.map(c => 
  `"${c.description}" was suggested as "${c.ai_suggestion}" but user corrected to "${c.category}"`
).join('\n')}` : ''}

**Expenses to categorize (${expensesToAnalyze.length}):**
${expensesToAnalyze.map((e, i) => 
  `${i + 1}. ID: ${e.id}, Description: "${e.description || 'N/A'}", Vendor: "${e.vendor || 'N/A'}", Amount: Le ${e.amount || 0}, Date: ${e.date || 'N/A'}`
).join('\n')}

**Instructions:**
For each expense, analyze the description and vendor to suggest the BEST category.
Learn from the patterns in past categorizations and user corrections.
Provide a confidence score (0-100) based on:
- Match strength with past patterns (50 points)
- Description clarity (25 points)
- Vendor information (25 points)

Common Sierra Leone patterns:
- Fuel/Diesel/Petrol → fuel
- Generator/Vehicle repairs → maintenance
- Electricity/Water/Internet → utilities
- Building materials → materials or construction
- Staff wages → salaries
- Transport costs → transport

Return categorization for ALL provided expenses.`,
        response_json_schema: {
          type: "object",
          properties: {
            categorizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  expense_id: { type: "string" },
                  suggested_category: { type: "string" },
                  confidence: { type: "number" },
                  reasoning: { type: "string" },
                  similar_pattern: { type: "string" }
                }
              }
            },
            learning_insights: {
              type: "object",
              properties: {
                patterns_detected: { type: "array", items: { type: "string" } },
                confidence_overall: { type: "number" }
              }
            }
          }
        }
      });

      const categorizations = result.categorizations || [];
      const insights = result.learning_insights || {};

      setSuggestions(categorizations.map(cat => {
        const expense = expensesToAnalyze.find(e => e.id === cat.expense_id);
        return {
          expense,
          suggested_category: cat.suggested_category,
          confidence: cat.confidence,
          reasoning: cat.reasoning,
          similar_pattern: cat.similar_pattern,
          accepted: false,
          rejected: false
        };
      }));

      setLearningData(insights.patterns_detected || []);

      toast.success(
        "Analysis complete", 
        `Categorized ${categorizations.length} expenses with ${insights.confidence_overall || 0}% overall confidence`
      );
    } catch (error) {
      toast.error("Analysis failed", error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptSuggestion = (index, suggestion) => {
    setSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, accepted: true, rejected: false } : s
    ));
    setSelectedExpenses(prev => new Set([...prev, suggestion.expense.id]));
  };

  const handleRejectSuggestion = (index, suggestion) => {
    setSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, accepted: false, rejected: true } : s
    ));
    setSelectedExpenses(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestion.expense.id);
      return newSet;
    });
  };

  const handleManualCorrection = (index, suggestion, newCategory) => {
    // Store correction for learning
    setUserCorrections(prev => ({
      ...prev,
      [suggestion.expense.id]: {
        ...suggestion.expense,
        ai_suggestion: suggestion.suggested_category,
        category: newCategory
      }
    }));

    setSuggestions(prev => prev.map((s, i) => 
      i === index ? { 
        ...s, 
        suggested_category: newCategory,
        confidence: 100,
        reasoning: "User correction - learning from this",
        accepted: true 
      } : s
    ));

    setSelectedExpenses(prev => new Set([...prev, suggestion.expense.id]));
  };

  const applyBulkCategorization = async () => {
    const acceptedSuggestions = suggestions.filter(s => s.accepted);
    
    if (acceptedSuggestions.length === 0) {
      toast.warning("No suggestions accepted");
      return;
    }

    try {
      let successCount = 0;
      for (const suggestion of acceptedSuggestions) {
        await updateExpenseMutation.mutateAsync({
          id: suggestion.expense.id,
          data: {
            category: suggestion.suggested_category
          }
        });
        successCount++;
      }

      toast.success(
        "Categorization complete", 
        `Updated ${successCount} expense(s). AI will learn from these categorizations.`
      );
      
      onOpenChange(false);
      setSuggestions([]);
      setSelectedExpenses(new Set());
    } catch (error) {
      toast.error("Failed to apply categorization", error.message);
    }
  };

  const confidenceColor = (confidence) => {
    if (confidence >= 85) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-blue-600 bg-blue-50";
    if (confidence >= 50) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const acceptedCount = suggestions.filter(s => s.accepted).length;
  const rejectedCount = suggestions.filter(s => s.rejected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 w-[98vw] [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Expense Categorization</h2>
              <p className="text-white/80 text-sm">Automatically categorize expenses with machine learning</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Uncategorized</p>
                    <p className="text-xl font-bold">{uncategorizedExpenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Accepted</p>
                    <p className="text-xl font-bold text-green-600">{acceptedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="text-xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Learning Data</p>
                    <p className="text-xl font-bold text-purple-600">{expenses.filter(e => e.category && e.category !== 'other').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Insights */}
          {learningData.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-2">AI Learning Insights</p>
                    <div className="space-y-1">
                      {learningData.slice(0, 5).map((insight, idx) => (
                        <p key={idx} className="text-sm text-purple-700">• {insight}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={analyzeBulkExpenses}
              disabled={isAnalyzing || uncategorizedExpenses.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing {uncategorizedExpenses.length} expenses...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze & Categorize
                </>
              )}
            </Button>

            {suggestions.length > 0 && acceptedCount > 0 && (
              <Button
                onClick={applyBulkCategorization}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply {acceptedCount} Categories
              </Button>
            )}
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing expenses...</span>
                <span className="font-medium text-purple-600">Please wait</span>
              </div>
              <Progress value={33} className="h-2" />
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Categorization Suggestions ({suggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => {
                      const categoryLabel = categories.find(c => c.value === suggestion.suggested_category)?.label || suggestion.suggested_category;
                      
                      return (
                        <div 
                          key={suggestion.expense.id} 
                          className={`p-4 rounded-lg border-2 transition-all ${
                            suggestion.accepted ? 'bg-green-50 border-green-300' :
                            suggestion.rejected ? 'bg-red-50 border-red-300' :
                            'bg-white border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Expense Info */}
                              <div className="flex items-start gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {suggestion.expense.description || 'No description'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>Le {suggestion.expense.amount?.toLocaleString()}</span>
                                    <span>•</span>
                                    <span>{suggestion.expense.vendor || 'No vendor'}</span>
                                    <span>•</span>
                                    <span>{suggestion.expense.date ? format(new Date(suggestion.expense.date), 'MMM d') : 'No date'}</span>
                                  </div>
                                </div>
                                
                                {/* Confidence Badge */}
                                <Badge className={`${confidenceColor(suggestion.confidence)} font-bold text-xs`}>
                                  {suggestion.confidence}% confident
                                </Badge>
                              </div>

                              {/* AI Suggestion */}
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">
                                  Suggested: <span className="text-purple-700">{categoryLabel}</span>
                                </span>
                              </div>

                              {/* Reasoning */}
                              {suggestion.reasoning && (
                                <p className="text-xs text-gray-600 italic mb-2">
                                  💡 {suggestion.reasoning}
                                </p>
                              )}

                              {/* Similar Pattern */}
                              {suggestion.similar_pattern && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Pattern: {suggestion.similar_pattern}</span>
                                </div>
                              )}

                              {/* Manual Override */}
                              {!suggestion.accepted && !suggestion.rejected && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-xs text-gray-600">Or choose manually:</span>
                                  <Select
                                    value={suggestion.suggested_category}
                                    onValueChange={(value) => handleManualCorrection(index, suggestion, value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                          {cat.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              {!suggestion.accepted && !suggestion.rejected && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptSuggestion(index, suggestion)}
                                    className="bg-green-600 hover:bg-green-700 h-8"
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectSuggestion(index, suggestion)}
                                    className="border-red-300 text-red-600 hover:bg-red-50 h-8"
                                  >
                                    <ThumbsDown className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {suggestion.accepted && (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accepted
                                </Badge>
                              )}
                              {suggestion.rejected && (
                                <Badge className="bg-red-100 text-red-700">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* No uncategorized expenses */}
          {!isAnalyzing && uncategorizedExpenses.length === 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900">All Expenses Categorized!</h3>
                <p className="text-green-700 mt-2">Great work! All expenses have been assigned categories.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {Object.keys(userCorrections).length > 0 && (
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  {Object.keys(userCorrections).length} correction(s) stored for learning
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}