import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck,
  DollarSign,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  PlayCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  Fuel
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/StatCard";
import QuickClockIn from "@/components/mobile/QuickClockIn";

export default function DriverDashboard({ user, currentEmployee, orgId }) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ 
        employee_id: currentEmployee?.id,
        date: today
      });
      return records[0];
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: todayTrips = [] } = useQuery({
    queryKey: ['driverTodayTrips', currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: currentEmployee?.id,
      date: today
    }),
    enabled: !!currentEmployee?.id,
  });

  const { data: weekTrips = [] } = useQuery({
    queryKey: ['driverWeekTrips', currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: currentEmployee?.id
    }, '-date', 50),
    enabled: !!currentEmployee?.id,
  });

  const { data: assignedVehicle } = useQuery({
    queryKey: ['assignedVehicle', currentEmployee?.id],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ 
        assigned_driver_id: currentEmployee?.id
      });
      return vehicles[0];
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Calculate stats
  const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  const todayFuelCost = todayTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const completedTrips = todayTrips.filter(t => t.status === 'completed').length;
  const scheduledTrips = todayTrips.filter(t => t.status === 'scheduled');

  // Week stats
  const weekRevenue = weekTrips
    .filter(t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="sl-hero-pattern rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">🇸🇱 Driver Dashboard</p>
            <h1 className="text-2xl font-bold">Hello, {currentEmployee?.first_name || 'Driver'}!</h1>
            <p className="text-white/80 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isClockedIn ? 'bg-green-500' : 'bg-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">{isClockedIn ? 'On Duty' : 'Off Duty'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Clock In */}
      <QuickClockIn 
        currentEmployee={currentEmployee}
        orgId={orgId}
        todayAttendance={todayAttendance}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Trips Completed"
          value={completedTrips}
          icon={CheckCircle}
          color="blue"
          subtitle={`${scheduledTrips.length} scheduled`}
        />
        <StatCard
          title="Passengers"
          value={todayPassengers}
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Fuel Cost"
          value={`Le ${todayFuelCost.toLocaleString()}`}
          icon={Fuel}
          color="navy"
        />
      </div>

      {/* Assigned Vehicle & Week Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Vehicle */}
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              My Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0072C6]/10 to-[#1EB053]/10 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold">{assignedVehicle.registration_number}</p>
                    <p className="text-sm text-gray-500">{assignedVehicle.brand} {assignedVehicle.model}</p>
                  </div>
                  <Badge className={assignedVehicle.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}>
                    {assignedVehicle.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium">{assignedVehicle.vehicle_type}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium">{assignedVehicle.capacity} seats</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No vehicle assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Week Performance */}
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg mb-4">
              <p className="text-3xl font-bold text-[#1EB053]">Le {weekRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Revenue (7 days)</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded text-center">
                <p className="text-xl font-bold">{weekTrips.filter(t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                <p className="text-gray-500">Trips</p>
              </div>
              <div className="p-3 bg-gray-50 rounded text-center">
                <p className="text-xl font-bold">
                  {weekTrips.filter(t => new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).reduce((sum, t) => sum + (t.passengers_count || 0), 0)}
                </p>
                <p className="text-gray-500">Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Trips
          </CardTitle>
          <Link to={createPageUrl("Transport")}>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No trips recorded today</p>
              <Link to={createPageUrl("Transport")}>
                <Button className="mt-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                  Record Trip
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      trip.status === 'completed' ? 'bg-green-100' : 
                      trip.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {trip.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : trip.status === 'in_progress' ? (
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{trip.route_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {trip.start_time} • {trip.passengers_count} passengers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1EB053]">Le {trip.total_revenue?.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-xs">{trip.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}