import { } from "react";
import { format } from "date-fns";
import { Truck, Route, Users, Fuel, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TransportSummary({ trips = [], vehicles = [], routes = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTrips = trips.filter(t => t.date === today);
  
  const completedTrips = todayTrips.filter(t => t.status === 'completed').length;
  const inProgressTrips = todayTrips.filter(t => t.status === 'in_progress').length;
  const scheduledTrips = todayTrips.filter(t => t.status === 'scheduled').length;
  
  const todayRevenue = todayTrips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  
  const todayPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

  return (
    <Card className="border-t-4 border-t-purple-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-500" />
          Transport Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Route className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 uppercase">Trips Today</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{todayTrips.length}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">
                {completedTrips} done
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                {inProgressTrips} active
              </Badge>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 uppercase">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-700">Le {todayRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{todayPassengers} passengers</p>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Fleet Status</span>
            <span className="font-medium">{activeVehicles}/{vehicles.length} active</span>
          </div>
          <Progress 
            value={vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0} 
            className="h-2 [&>div]:bg-purple-500" 
          />
        </div>

        {/* Vehicle Status Breakdown */}
        <div className="flex gap-2">
          <Badge variant="outline" className="flex-1 justify-center py-1.5 bg-green-50 text-green-700 border-green-200">
            <Truck className="w-3 h-3 mr-1" />
            {activeVehicles} Active
          </Badge>
          <Badge variant="outline" className="flex-1 justify-center py-1.5 bg-amber-50 text-amber-700 border-amber-200">
            <Fuel className="w-3 h-3 mr-1" />
            {maintenanceVehicles} Service
          </Badge>
        </div>

        {/* Active Routes */}
        {routes.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500 uppercase mb-2">{routes.length} Active Routes</p>
            <div className="flex flex-wrap gap-1">
              {routes.slice(0, 4).map(route => (
                <Badge key={route.id} variant="secondary" className="text-xs">
                  {route.name}
                </Badge>
              ))}
              {routes.length > 4 && (
                <Badge variant="outline" className="text-xs">+{routes.length - 4} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}