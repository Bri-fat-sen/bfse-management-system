import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIInventoryRecommendations({ products, sales, orgId }) {
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['aiInventoryRecommendations', orgId],
    queryFn: async () => {
      // Prepare inventory data with sales trends
      const inventoryData = products.map(p => {
        const productSales = sales.filter(s => 
          s.items?.some(item => item.product_id === p.id)
        );
        const totalSold = productSales.reduce((sum, s) => {
          const item = s.items.find(i => i.product_id === p.id);
          return sum + (item?.quantity || 0);
        }, 0);

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          current_stock: p.stock_quantity,
          low_stock_threshold: p.low_stock_threshold || 10,
          unit_price: p.unit_price,
          cost_price: p.cost_price,
          category: p.category,
          total_sold_last_30_days: totalSold,
          sales_count: productSales.length
        };
      });

      const prompt = `You are an inventory management AI. Analyze this inventory and sales data to provide intelligent reorder recommendations:

Products & Sales Data:
${JSON.stringify(inventoryData.slice(0, 50), null, 2)}

Provide:
1. Products that need immediate reordering (critical stock levels)
2. Products with high demand that should be restocked soon
3. Overstocked items with low sales velocity
4. Optimal reorder quantities based on sales trends
5. Products to discontinue or reduce due to poor performance`;

      const schema = {
        type: "object",
        properties: {
          critical_reorders: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                current_stock: { type: "number" },
                recommended_order_qty: { type: "number" },
                reason: { type: "string" },
                urgency: { type: "string", enum: ["immediate", "this_week", "this_month"] }
              }
            }
          },
          high_demand_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                sales_trend: { type: "string" },
                suggested_action: { type: "string" }
              }
            }
          },
          slow_movers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_name: { type: "string" },
                stock_level: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          },
          estimated_savings: { type: "string" }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      return result;
    },
    enabled: !!products?.length && !!sales?.length && !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!products?.length) return null;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Zap className="w-4 h-4 text-white" />
            </div>
            AI Reorder Recommendations
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
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI analyzing inventory trends...</span>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {/* Critical Reorders */}
            {recommendations.critical_reorders?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Reorders ({recommendations.critical_reorders.length})
                </h4>
                {recommendations.critical_reorders.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-red-900">{item.product_name}</p>
                        <p className="text-xs text-red-700 mt-1">{item.reason}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-gray-600">Current: {item.current_stock}</span>
                          <span className="text-green-600 font-medium">Order: {item.recommended_order_qty}</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {item.urgency}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* High Demand Items */}
            {recommendations.high_demand_items?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  High Demand Items
                </h4>
                {recommendations.high_demand_items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-sm text-green-900">{item.product_name}</p>
                    <p className="text-xs text-green-700 mt-1">{item.sales_trend}</p>
                    <p className="text-xs text-gray-600 mt-1 italic">💡 {item.suggested_action}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Slow Movers */}
            {recommendations.slow_movers?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-orange-700">
                  <Package className="w-4 h-4" />
                  Slow Moving Items
                </h4>
                {recommendations.slow_movers.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-xs">
                    <p className="font-medium text-orange-900">{item.product_name}</p>
                    <p className="text-orange-700 mt-1">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Estimated Savings */}
            {recommendations.estimated_savings && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-900">
                  💰 {recommendations.estimated_savings}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recommendations available</p>
        )}
      </CardContent>
    </Card>
  );
}