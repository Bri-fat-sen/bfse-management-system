import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InventoryAIRecommendations({ products = [], sales = [], stockLevels = [] }) {
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['aiInventoryRecommendations', products.length, sales.length],
    queryFn: async () => {
      // Get last 30 days of sales
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSales = sales.filter(s => new Date(s.created_date) >= thirtyDaysAgo);

      // Calculate sales velocity per product
      const productSalesMap = {};
      recentSales.forEach(sale => {
        sale.items?.forEach(item => {
          if (!productSalesMap[item.product_id]) {
            productSalesMap[item.product_id] = { 
              product_name: item.product_name, 
              quantity_sold: 0,
              revenue: 0,
              sales_count: 0
            };
          }
          productSalesMap[item.product_id].quantity_sold += item.quantity;
          productSalesMap[item.product_id].revenue += item.total;
          productSalesMap[item.product_id].sales_count++;
        });
      });

      // Prepare data for AI
      const inventoryData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        current_stock: p.stock_quantity,
        low_threshold: p.low_stock_threshold || 10,
        unit_price: p.unit_price,
        cost_price: p.cost_price,
        sales_last_30d: productSalesMap[p.id]?.quantity_sold || 0,
        revenue_last_30d: productSalesMap[p.id]?.revenue || 0,
        sales_velocity: (productSalesMap[p.id]?.quantity_sold || 0) / 30, // per day
      }));

      const prompt = `You are an inventory optimization AI. Analyze this inventory data and sales trends to provide reordering recommendations.

Products & Sales Data:
${JSON.stringify(inventoryData.slice(0, 50), null, 2)}

Total products analyzed: ${inventoryData.length}
Analysis period: Last 30 days

Provide specific recommendations for:
1. URGENT REORDER: Products that will stock out soon (consider current stock and sales velocity)
2. RECOMMENDED REORDER: Products approaching low stock
3. OVERSTOCK ALERTS: Products with low sales velocity and high stock
4. FAST MOVERS: High-velocity products that need monitoring
5. OPTIMIZATION: General inventory health recommendations

For each product recommendation, calculate:
- Days until stockout (current stock / daily sales velocity)
- Recommended order quantity (to cover 30 days at current velocity)
- Priority level (urgent/high/medium/low)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            urgent_reorder: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  current_stock: { type: "number" },
                  days_until_stockout: { type: "number" },
                  recommended_quantity: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            recommended_reorder: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  current_stock: { type: "number" },
                  recommended_quantity: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            overstock_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  current_stock: { type: "number" },
                  sales_last_30d: { type: "number" },
                  suggestion: { type: "string" }
                }
              }
            },
            fast_movers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  sales_velocity: { type: "string" },
                  revenue_contribution: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      return response;
    },
    enabled: products.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Inventory Recommendations
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
          <div className="flex items-center gap-2 text-gray-500 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing inventory patterns...</span>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {recommendations.summary && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                {recommendations.summary}
              </div>
            )}

            {/* Urgent Reorder */}
            {recommendations.urgent_reorder?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-red-600 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Urgent Reorder ({recommendations.urgent_reorder.length})
                </h4>
                <div className="space-y-2">
                  {recommendations.urgent_reorder.map((item, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {item.days_until_stockout} days
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Current: {item.current_stock}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-green-600">Order: {item.recommended_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Reorder */}
            {recommendations.recommended_reorder?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-amber-600 flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4" />
                  Recommended Reorder ({recommendations.recommended_reorder.length})
                </h4>
                <div className="space-y-2">
                  {recommendations.recommended_reorder.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs text-gray-500">Stock: {item.current_stock}</p>
                          <p className="text-xs font-medium text-green-600">Order: {item.recommended_quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast Movers */}
            {recommendations.fast_movers?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-green-600 flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Fast Moving Products ({recommendations.fast_movers.length})
                </h4>
                <div className="space-y-2">
                  {recommendations.fast_movers.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span>{item.sales_velocity}</span>
                        <span>•</span>
                        <span>{item.revenue_contribution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overstock Alerts */}
            {recommendations.overstock_alerts?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4" />
                  Overstock Items ({recommendations.overstock_alerts.length})
                </h4>
                <div className="space-y-2">
                  {recommendations.overstock_alerts.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.suggestion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {item.current_stock} • Sold: {item.sales_last_30d} (last 30d)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">No recommendations available</p>
        )}
      </CardContent>
    </Card>
  );
}