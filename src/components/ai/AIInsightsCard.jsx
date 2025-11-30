import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const InsightBadge = ({ type }) => {
  const config = {
    anomaly: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    opportunity: { color: 'bg-green-100 text-green-700', icon: TrendingUp },
    warning: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    optimization: { color: 'bg-blue-100 text-blue-700', icon: Sparkles },
    positive: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  };
  const { color, icon: Icon } = config[type] || config.optimization;
  return (
    <Badge className={cn("text-xs", color)}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

export default function AIInsightsCard({ 
  title = "AI Insights",
  analysisType,
  data,
  context = {},
  icon: Icon = Sparkles,
  compact = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['aiInsights', analysisType, JSON.stringify(data)],
    queryFn: async () => {
      const prompt = generatePrompt(analysisType, data, context);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["anomaly", "opportunity", "warning", "optimization", "positive"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  metric: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });
      return response;
    },
    enabled: !!data && !!analysisType,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (!data || !analysisType) return null;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Icon className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing data...</span>
          </div>
        ) : insights?.insights?.length > 0 ? (
          <div className="space-y-3">
            {insights.summary && (
              <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                {insights.summary}
              </p>
            )}
            <div className="space-y-2">
              {(compact ? insights.insights.slice(0, 3) : insights.insights).map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-start gap-2">
                    <InsightBadge type={insight.type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{insight.title}</p>
                      {(isExpanded || !compact) && (
                        <>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                          {insight.metric && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Metric:</span> {insight.metric}
                            </p>
                          )}
                          {insight.action && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 flex items-center gap-1">
                              <ChevronRight className="w-3 h-3" />
                              <span className="font-medium">Recommended:</span> {insight.action}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {compact && insights.insights.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-purple-600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : `View ${insights.insights.length - 3} More Insights`}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No insights available</p>
        )}
      </CardContent>
    </Card>
  );
}

function generatePrompt(type, data, context) {
  switch (type) {
    case 'sales_anomaly':
      return `Analyze this sales data for anomalies and unusual patterns:
Sales data: ${JSON.stringify(data)}
Context: ${JSON.stringify(context)}

Identify:
1. Unusual spikes or drops in sales
2. Payment method anomalies
3. Revenue patterns that deviate from normal
4. Potential fraud or data entry errors
5. Opportunities for improvement

Provide 3-5 key insights with actionable recommendations.`;

    case 'expense_anomaly':
      return `Analyze this expense data for anomalies and cost optimization:
Expense data: ${JSON.stringify(data)}
Context: ${JSON.stringify(context)}

Identify:
1. Unusual expense patterns or spikes
2. Categories with abnormal spending
3. Vendor-related anomalies
4. Cost-saving opportunities
5. Budget compliance issues

Provide 3-5 key insights with actionable recommendations.`;

    case 'attendance_anomaly':
      return `Analyze this attendance data for unusual patterns:
Attendance data: ${JSON.stringify(data)}
Context: ${JSON.stringify(context)}

Identify:
1. Abnormal absence patterns
2. Department-specific issues
3. Late arrival trends
4. Productivity concerns
5. Scheduling optimization opportunities

Provide 3-5 key insights with actionable recommendations.`;

    case 'inventory_reorder':
      return `Analyze inventory and sales trends to recommend reordering:
Products: ${JSON.stringify(data.products)}
Sales trends: ${JSON.stringify(data.salesTrends)}
Stock levels: ${JSON.stringify(data.stockLevels)}

Provide:
1. Products that need immediate reordering
2. Optimal reorder quantities based on sales velocity
3. Products at risk of stockout
4. Overstocked items
5. Seasonal considerations

Provide 3-5 key insights with specific product recommendations.`;

    case 'transport_optimization':
      return `Analyze transport data to optimize routes and reduce costs:
Trips: ${JSON.stringify(data.trips)}
Routes: ${JSON.stringify(data.routes)}
Vehicles: ${JSON.stringify(data.vehicles)}
Fuel costs: ${JSON.stringify(data.fuelCosts)}

Identify:
1. Most profitable routes
2. Fuel efficiency issues
3. Route optimization opportunities
4. Vehicle utilization patterns
5. Cost reduction strategies

Provide 3-5 key insights with actionable recommendations.`;

    case 'financial_summary':
      return `Generate an executive summary of this financial performance:
Sales: ${JSON.stringify(data.sales)}
Expenses: ${JSON.stringify(data.expenses)}
Profit/Loss: ${JSON.stringify(data.profitLoss)}
Period: ${context.period || 'Current period'}

Provide:
1. Overall financial health assessment
2. Key trends and patterns
3. Areas of concern
4. Growth opportunities
5. Strategic recommendations

Provide a concise summary and 3-5 strategic insights.`;

    case 'performance_summary':
      return `Summarize employee performance data:
Reviews: ${JSON.stringify(data.reviews)}
Employees: ${JSON.stringify(data.employees)}
Period: ${context.period || 'Current period'}

Provide:
1. Overall performance trends
2. Top performers
3. Improvement areas
4. Training needs
5. Recognition recommendations

Provide a summary and 3-5 key insights.`;

    default:
      return `Analyze this business data and provide insights: ${JSON.stringify(data)}`;
  }
}