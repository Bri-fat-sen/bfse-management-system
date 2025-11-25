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
  Play,
  CheckCircle,
  Calendar,
  TrendingUp,
  Fuel,
  Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/ui/StatCard";

export default function DriverDashboard({ currentEmployee, orgId }) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAttendance } = useQuery({
    queryKey: ['driverAttendance', currentEmployee?.id, today],
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
    queryKey: ['driverTodayTrips', currentEmployee?.id, today],
    queryFn: () => base44.entities.Trip.filter({
      driver_id: currentEmployee?.id,
      date: today
    }, '-start_time'),
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

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  const weekRevenue = weekTrips.filter(t => {
    const tripDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tripDate >= weekAgo;
  }).reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  const scheduledTrips = todayTrips.filter(t => t.status === 'scheduled');
  const completedTrips = todayTrips.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Clock Status Banner */}
      <Card className={`border-l-4 ${isClockedIn ? 'border-l-green-500 bg-green-50' : 'border-l-amber-500 bg-amber-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isClockedIn ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Clock className={`w-6 h-6 ${isClockedIn ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className={`font-semibold ${isClockedIn ? 'text-green-700' : 'text-amber-700'}`}>
                  {isClockedIn ? 'Currently On Duty' : todayAttendance?.clock_out_time ? 'Shift Complete' : 'Not Clocked In'}
                </p>
                <p className="text-sm text-gray-500">
                  {todayAttendance?.clock_in_time 
                    ? `Clocked in at ${todayAttendance.clock_in_time}${todayAttendance.clock_out_time ? ` - Out at ${todayAttendance.clock_out_time}` : ''}`
                    : 'Clock in to start your shift'
                  }
                </p>
              </div>
            </div>
            <Link to={createPageUrl("Attendance")}>
              <Button className={isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1EB053] hover:bg-green-600'}>
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Trips Today"
          value={completedTrips.length}
          icon={Truck}
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
          title="Week Revenue"
          value={`Le ${weekRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Vehicle */}
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5 text-[#0072C6]" />
              My Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedVehicle ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{assignedVehicle.registration_number}</span>
                  <Badge className={assignedVehicle.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}>
                    {assignedVehicle.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>{assignedVehicle.brand} {assignedVehicle.model}</p>
                  <p className="flex items-center gap-1">
                    <Fuel className="w-4 h-4" /> {assignedVehicle.fuel_type}
                  </p>
                  <p className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Capacity: {assignedVehicle.capacity} seats
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No vehicle assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Trips */}
        <Card className="lg:col-span-2 border-t-4 border-t-[#1EB053]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="w-5 h-5 text-[#1EB053]" />
              Today's Trips
            </CardTitle>
            <Link to={createPageUrl("Transport")}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No trips scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trip.status === 'completed' ? 'bg-green-100' : 
                        trip.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {trip.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : trip.status === 'in_progress' ? (
                          <Play className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trip.route_name}</p>
                        <p className="text-sm text-gray-500">
                          {trip.start_time} • {trip.passengers_count} passengers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {trip.total_revenue?.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">{trip.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}