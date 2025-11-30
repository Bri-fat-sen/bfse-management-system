import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Fuel,
  Route as RouteIcon,
  DollarSign,
  Loader2,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransportOptimizationAI({ trips = [], routes = [], vehicles = [] }) {
  const { data: optimization, isLoading, refetch } = useQuery({
    queryKey: ['aiTransportOptimization', trips.length],
    queryFn: async () => {
      // Get last 60 days of trips
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const recentTrips = trips.filter(t => new Date(t.date || t.created_date) >= sixtyDaysAgo);

      // Calculate route performance
      const routePerformance = {};
      recentTrips.forEach(trip => {
        const routeId = trip.route_id || trip.route_name;
        if (!routePerformance[routeId]) {
          routePerformance[routeId] = {
            name: trip.route_name,
            trips: 0,
            total_revenue: 0,
            total_fuel_cost: 0,
            total_passengers: 0,
            avg_occupancy: 0
          };
        }
        routePerformance[routeId].trips++;
        routePerformance[routeId].total_revenue += trip.total_revenue || 0;
        routePerformance[routeId].total_fuel_cost += trip.fuel_cost || 0;
        routePerformance[routeId].total_passengers += trip.passengers_count || 0;
      });

      // Vehicle efficiency
      const vehiclePerformance = {};
      recentTrips.forEach(trip => {
        const vId = trip.vehicle_id;
        if (!vehiclePerformance[vId]) {
          vehiclePerformance[vId] = {
            registration: trip.vehicle_registration,
            trips: 0,
            fuel_cost: 0,
            revenue: 0
          };
        }
        vehiclePerformance[vId].trips++;
        vehiclePerformance[vId].fuel_cost += trip.fuel_cost || 0;
        vehiclePerformance[vId].revenue += trip.total_revenue || 0;
      });

      const prompt = `You are a transport operations optimizer. Analyze this data and provide actionable recommendations.

Route Performance (Last 60 days):
${JSON.stringify(Object.values(routePerformance), null, 2)}

Vehicle Efficiency:
${JSON.stringify(Object.values(vehiclePerformance), null, 2)}

Routes Configuration:
${JSON.stringify(routes.map(r => ({ 
  name: r.name, 
  distance: r.distance_km, 
  base_price: r.base_ticket_price,
  start: r.start_location,
  end: r.end_location
})), null, 2)}

Provide specific recommendations for:
1. Most profitable routes to prioritize
2. Routes with poor performance to review or discontinue
3. Fuel efficiency improvements
4. Vehicle assignment optimization
5. Pricing adjustments based on demand
6. Cost reduction strategies`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  route: { type: "string" },
                  performance_score: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            underperforming_routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  route: { type: "string" },
                  issue: { type: "string" },
                  suggested_action: { type: "string" }
                }
              }
            },
            fuel_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicle: { type: "string" },
                  efficiency_issue: { type: "string" },
                  recommendation: { type: "string" },
                  potential_savings: { type: "string" }
                }
              }
            },
            strategic_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  insight: { type: "string" },
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
    enabled: trips.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Route Optimization
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
            <span>Optimizing routes...</span>
          </div>
        ) : optimization ? (
          <div className="space-y-4">
            {optimization.summary && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                {optimization.summary}
              </div>
            )}

            {/* Top Routes */}
            {optimization.top_routes?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-green-600 flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Performing Routes
                </h4>
                <div className="space-y-2">
                  {optimization.top_routes.map((item, idx) => (
                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            <RouteIcon className="w-4 h-4" />
                            {item.route}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{item.recommendation}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">{item.performance_score}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Underperforming Routes */}
            {optimization.underperforming_routes?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-amber-600 flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  Routes Needing Attention
                </h4>
                <div className="space-y-2">
                  {optimization.underperforming_routes.map((item, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="font-medium text-sm">{item.route}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Issue:</span> {item.issue}
                      </p>
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <span className="font-medium">Action:</span> {item.suggested_action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fuel Optimization */}
            {optimization.fuel_optimization?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-orange-600 flex items-center gap-2 mb-2">
                  <Fuel className="w-4 h-4" />
                  Fuel Efficiency Opportunities
                </h4>
                <div className="space-y-2">
                  {optimization.fuel_optimization.map((item, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.vehicle}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.efficiency_issue}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Fix:</span> {item.recommendation}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 ml-2">
                          {item.potential_savings}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Insights */}
            {optimization.strategic_insights?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-blue-600 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Strategic Recommendations
                </h4>
                <div className="space-y-2">
                  {optimization.strategic_insights.map((item, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-sm text-blue-900">{item.category}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.insight}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        <span className="font-medium">Action:</span> {item.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">No optimization data available</p>
        )}
      </CardContent>
    </Card>
  );
}