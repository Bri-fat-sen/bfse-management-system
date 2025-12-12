import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIInsightsPanel({ 
  data, 
  type = "sales", // sales, expenses, attendance, inventory, transport
  title = "AI Insights",
  orgId
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['aiInsights', type, orgId],
    queryFn: async () => {
      let prompt = "";
      let schema = {
        type: "object",
        properties: {
          summary: { type: "string" },
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                recommendation: { type: "string" }
              }
            }
          },
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["positive", "negative", "neutral"] }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] }
              }
            }
          }
        }
      };

      switch(type) {
        case "sales":
          prompt = `Analyze this sales data and provide intelligent insights:
${JSON.stringify(data, null, 2)}

Look for:
1. Unusual sales patterns or anomalies (sudden spikes/drops)
2. Peak sales times or trends
3. Payment method preferences
4. Product performance patterns
5. Revenue optimization opportunities`;
          break;

        case "expenses":
          prompt = `Analyze this expense data and provide intelligent insights:
${JSON.stringify(data, null, 2)}

Look for:
1. Unusual expense patterns or anomalies
2. Category spending trends
3. Cost-saving opportunities
4. Budget compliance issues
5. Expense optimization recommendations`;
          break;

        case "attendance":
          prompt = `Analyze this attendance data and provide intelligent insights:
${JSON.stringify(data, null, 2)}

Look for:
1. Unusual attendance patterns or anomalies
2. Chronic lateness or absenteeism
3. Department-specific issues
4. Scheduling conflicts
5. Productivity improvement suggestions`;
          break;

        case "inventory":
          prompt = `Analyze this inventory data and provide intelligent insights:
${JSON.stringify(data, null, 2)}

Look for:
1. Stock level anomalies
2. Fast-moving vs slow-moving products
3. Optimal reorder points and quantities
4. Inventory turnover issues
5. Stock optimization recommendations`;
          break;

        case "transport":
          prompt = `Analyze this transport data and provide intelligent insights:
${JSON.stringify(data, null, 2)}

Look for:
1. Route efficiency anomalies
2. Fuel cost optimization opportunities
3. Vehicle utilization patterns
4. Profitable vs unprofitable routes
5. Route optimization recommendations`;
          break;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      return result;
    },
    enabled: !!data && !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getImpactIcon = (impact) => {
    switch(impact) {
      case "positive": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500 overflow-hidden">
      <div className="h-1 flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI analyzing your data...</span>
          </div>
        ) : insights ? (
          <div className="space-y-4">
            {/* Summary */}
            {insights.summary && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700">{insights.summary}</p>
              </div>
            )}

            {/* Anomalies */}
            {insights.anomalies?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Anomalies Detected
                </h4>
                {insights.anomalies.slice(0, expanded ? undefined : 2).map((anomaly, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{anomaly.title}</p>
                        <p className="text-xs mt-1">{anomaly.description}</p>
                        {expanded && anomaly.recommendation && (
                          <p className="text-xs mt-2 italic">💡 {anomaly.recommendation}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {anomaly.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Insights */}
            {insights.insights?.length > 0 && expanded && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Key Insights
                </h4>
                {insights.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-start gap-3">
                    {getImpactIcon(insight.impact)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && expanded && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Recommendations
                </h4>
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-blue-900">{rec.action}</p>
                        <p className="text-xs text-blue-700 mt-1">{rec.reason}</p>
                      </div>
                      <Badge variant="outline" className={
                        rec.priority === "high" ? "border-orange-400 text-orange-700" :
                        rec.priority === "medium" ? "border-blue-400 text-blue-700" :
                        "border-gray-400 text-gray-700"
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!expanded && (insights.insights?.length > 0 || insights.recommendations?.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="w-full text-purple-600"
              >
                Show {(insights.insights?.length || 0) + (insights.recommendations?.length || 0)} more insights
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