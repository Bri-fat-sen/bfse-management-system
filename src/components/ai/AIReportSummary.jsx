import { } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIReportSummary({ 
  reportData, 
  reportType = "financial", // financial, performance, inventory
  title = "AI Summary"
}) {
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['aiReportSummary', reportType, reportData?.period],
    queryFn: async () => {
      let prompt = "";
      let schema = {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                finding: { type: "string" },
                impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                metric: { type: "string" }
              }
            }
          },
          concerns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                action: { type: "string" }
              }
            }
          },
          opportunities: {
            type: "array",
            items: { type: "string" }
          }
        }
      };

      switch(reportType) {
        case "financial":
          prompt = `You are a financial analyst. Analyze this P&L report and provide a comprehensive summary:

${JSON.stringify(reportData, null, 2)}

Provide:
1. Executive summary (2-3 sentences)
2. Key findings with impact assessment
3. Financial concerns that need attention
4. Growth opportunities`;
          break;

        case "performance":
          prompt = `You are an HR analyst. Analyze this employee performance data and provide insights:

${JSON.stringify(reportData, null, 2)}

Provide:
1. Overall performance summary
2. Key findings about employee performance
3. Areas of concern (underperformance, skills gaps)
4. Opportunities for improvement and development`;
          break;

        case "inventory":
          prompt = `You are an inventory management expert. Analyze this stock data:

${JSON.stringify(reportData, null, 2)}

Provide:
1. Inventory health summary
2. Key findings about stock levels and turnover
3. Critical issues (stockouts, overstocking, slow movers)
4. Optimization opportunities`;
          break;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      return result;
    },
    enabled: !!reportData,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!reportData) return null;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-purple-600" />
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
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI generating summary...</span>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Executive Summary */}
            {summary.executive_summary && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm leading-relaxed text-gray-700">{summary.executive_summary}</p>
              </div>
            )}

            {/* Key Findings */}
            {summary.key_findings?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Key Findings
                </h4>
                {summary.key_findings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {finding.impact === "positive" && <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />}
                    {finding.impact === "negative" && <TrendingDown className="w-4 h-4 text-red-600 mt-0.5" />}
                    {finding.impact === "neutral" && <div className="w-4 h-4 rounded-full bg-gray-400 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{finding.finding}</p>
                      {finding.metric && (
                        <p className="text-xs text-gray-500 mt-1">{finding.metric}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Concerns */}
            {summary.concerns?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Areas of Concern
                </h4>
                {summary.concerns.map((concern, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${
                    concern.severity === "high" ? "bg-red-50 border-red-300" :
                    concern.severity === "medium" ? "bg-orange-50 border-orange-300" :
                    "bg-yellow-50 border-yellow-300"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{concern.issue}</p>
                        <p className="text-xs mt-1 italic">💡 {concern.action}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {concern.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opportunities */}
            {summary.opportunities?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
                  <Lightbulb className="w-4 h-4" />
                  Opportunities
                </h4>
                <div className="space-y-1">
                  {summary.opportunities.map((opp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No summary available</p>
        )}
      </CardContent>
    </Card>
  );
}