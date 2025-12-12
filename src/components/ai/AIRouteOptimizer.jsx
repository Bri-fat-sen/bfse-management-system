import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  TrendingUp,
  Fuel,
  RefreshCw,
  MapPin,
  DollarSign,
  Route
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIRouteOptimizer({ trips, routes, vehicles, orgId }) {
  const { data: optimization, isLoading, refetch } = useQuery({
    queryKey: ['aiRouteOptimization', orgId],
    queryFn: async () => {
      // Prepare route performance data
      const routePerformance = routes.map(route => {
        const routeTrips = trips.filter(t => t.route_id === route.id);
        const totalRevenue = routeTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
        const totalFuel = routeTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
        const avgPassengers = routeTrips.length > 0 
          ? routeTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0) / routeTrips.length 
          : 0;
        const netRevenue = totalRevenue - totalFuel;

        return {
          route_name: route.name,
          start_location: route.start_location,
          end_location: route.end_location,
          distance_km: route.distance_km,
          base_ticket_price: route.base_ticket_price,
          total_trips: routeTrips.length,
          total_revenue: totalRevenue,
          total_fuel_cost: totalFuel,
          net_revenue: netRevenue,
          avg_passengers: avgPassengers.toFixed(1),
          profitability_ratio: totalFuel > 0 ? (totalRevenue / totalFuel).toFixed(2) : 0
        };
      });

      // Vehicle efficiency data
      const vehiclePerformance = vehicles.map(v => {
        const vehicleTrips = trips.filter(t => t.vehicle_id === v.id);
        const totalFuel = vehicleTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
        const totalDistance = vehicleTrips.reduce((sum, t) => {
          const route = routes.find(r => r.id === t.route_id);
          return sum + (route?.distance_km || 0);
        }, 0);
        const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;

        return {
          registration: v.registration_number,
          vehicle_type: v.vehicle_type,
          capacity: v.capacity,
          total_trips: vehicleTrips.length,
          total_fuel_cost: totalFuel,
          total_distance_km: totalDistance,
          fuel_efficiency_km_per_leone: fuelEfficiency
        };
      });

      const prompt = `You are a transport logistics AI expert. Analyze this route and vehicle data to provide optimization recommendations:

Route Performance:
${JSON.stringify(routePerformance, null, 2)}

Vehicle Performance:
${JSON.stringify(vehiclePerformance, null, 2)}

Provide:
1. Most and least profitable routes with reasons
2. Route optimization suggestions (pricing, frequency, vehicle assignment)
3. Fuel cost reduction strategies
4. Vehicle utilization improvements
5. New route opportunities`;

      const schema = {
        type: "object",
        properties: {
          top_routes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                route_name: { type: "string" },
                performance_summary: { type: "string" },
                net_revenue: { type: "number" }
              }
            }
          },
          underperforming_routes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                route_name: { type: "string" },
                issue: { type: "string" },
                optimization_suggestion: { type: "string" }
              }
            }
          },
          fuel_optimization: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                estimated_savings: { type: "string" }
              }
            }
          },
          vehicle_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                vehicle: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          total_potential_savings: { type: "string" }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      return result;
    },
    enabled: !!trips?.length && !!routes?.length && !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!trips?.length || !routes?.length) return null;

  return (
    <Card className="border-l-4 border-l-cyan-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
              <Route className="w-4 h-4 text-white" />
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
          <div className="flex items-center gap-2 text-gray-500">
            <Truck className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI optimizing routes...</span>
          </div>
        ) : optimization ? (
          <div className="space-y-4">
            {/* Top Performing Routes */}
            {optimization.top_routes?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  Top Performing Routes
                </h4>
                {optimization.top_routes.slice(0, 3).map((route, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-green-900">{route.route_name}</p>
                        <p className="text-xs text-green-700 mt-1">{route.performance_summary}</p>
                      </div>
                      <Badge className="bg-green-600 text-white text-xs">
                        Le {route.net_revenue?.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Underperforming Routes */}
            {optimization.underperforming_routes?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-4 h-4" />
                  Routes Needing Attention
                </h4>
                {optimization.underperforming_routes.map((route, idx) => (
                  <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-sm text-orange-900">{route.route_name}</p>
                    <p className="text-xs text-orange-700 mt-1">Issue: {route.issue}</p>
                    <p className="text-xs text-gray-600 mt-1 italic">💡 {route.optimization_suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Fuel Optimization */}
            {optimization.fuel_optimization?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                  <Fuel className="w-4 h-4" />
                  Fuel Cost Reduction
                </h4>
                {optimization.fuel_optimization.map((opt, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">{opt.suggestion}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      💰 Potential savings: {opt.estimated_savings}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Vehicle Recommendations */}
            {optimization.vehicle_recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-700">
                  <Truck className="w-4 h-4" />
                  Vehicle Optimization
                </h4>
                {optimization.vehicle_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs">
                    <p className="font-medium text-purple-900">{rec.vehicle}</p>
                    <p className="text-purple-700 mt-1">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Total Savings */}
            {optimization.total_potential_savings && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-300">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Potential Savings</p>
                    <p className="text-lg font-bold text-green-700">{optimization.total_potential_savings}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No optimization data available</p>
        )}
      </CardContent>
    </Card>
  );
}