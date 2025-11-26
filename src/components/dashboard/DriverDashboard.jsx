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
  Navigation,
  FileText,
  Receipt,
  Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/ui/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";

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

  // My truck contracts
  const { data: myContracts = [] } = useQuery({
    queryKey: ['driverContracts', currentEmployee?.id],
    queryFn: () => base44.entities.TruckContract.filter({
      driver_id: currentEmployee?.id
    }, '-contract_date', 50),
    enabled: !!currentEmployee?.id,
  });

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  
  // Today's trip revenue & expenses
  const todayTripRevenue = (todayTrips || []).reduce((sum, t) => sum + (t?.total_revenue || 0), 0);
  const todayTripExpenses = (todayTrips || []).reduce((sum, t) => sum + (t?.fuel_cost || 0) + (t?.other_expenses || 0), 0);
  const todayPassengers = (todayTrips || []).reduce((sum, t) => sum + (t?.passengers_count || 0), 0);
  
  // Today's contract revenue
  const todayContracts = (myContracts || []).filter(c => c?.contract_date === today);
  const todayContractRevenue = todayContracts.filter(c => c?.status === 'completed').reduce((sum, c) => sum + (c?.contract_amount || 0), 0);
  const todayContractExpenses = todayContracts.reduce((sum, c) => sum + (c?.total_expenses || 0), 0);
  
  // Total today
  const todayTotalRevenue = todayTripRevenue + todayContractRevenue;
  const todayTotalExpenses = todayTripExpenses + todayContractExpenses;
  const todayNetEarnings = todayTotalRevenue - todayTotalExpenses;
  
  // Week calculations
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekTripRevenue = weekTrips.filter(t => new Date(t.date) >= weekAgo).reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const weekTripExpenses = weekTrips.filter(t => new Date(t.date) >= weekAgo).reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
  
  const weekContractRevenue = myContracts.filter(c => new Date(c.contract_date) >= weekAgo && c.status === 'completed').reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  const weekContractExpenses = myContracts.filter(c => new Date(c.contract_date) >= weekAgo).reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  
  const weekTotalRevenue = weekTripRevenue + weekContractRevenue;
  const weekTotalExpenses = weekTripExpenses + weekContractExpenses;
  const weekNetEarnings = weekTotalRevenue - weekTotalExpenses;

  const scheduledTrips = todayTrips.filter(t => t.status === 'scheduled');
  const completedTrips = todayTrips.filter(t => t.status === 'completed');
  const activeContracts = myContracts.filter(c => c.status === 'in_progress' || c.status === 'pending');

  return (
    <div className="space-y-6">
      <QuickActions />
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayTotalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle="Trips + Contracts"
        />
        <StatCard
          title="Today's Expenses"
          value={`Le ${todayTotalExpenses.toLocaleString()}`}
          icon={Receipt}
          color="red"
          subtitle="Fuel & other costs"
        />
        <StatCard
          title="Today's Net"
          value={`Le ${todayNetEarnings.toLocaleString()}`}
          icon={TrendingUp}
          color={todayNetEarnings >= 0 ? "green" : "red"}
        />
        <StatCard
          title="Week Net"
          value={`Le ${weekNetEarnings.toLocaleString()}`}
          icon={TrendingUp}
          color={weekNetEarnings >= 0 ? "navy" : "red"}
        />
      </div>

      {/* Revenue & Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Trip Revenue</span>
              </div>
              <p className="text-lg font-bold text-green-700">Le {todayTripRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">{completedTrips.length} trips</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Contract Revenue</span>
              </div>
              <p className="text-lg font-bold text-teal-700">Le {todayContractRevenue.toLocaleString()}</p>
              <p className="text-xs text-teal-600">{todayContracts.filter(c => c.status === 'completed').length} completed</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Trip Expenses</span>
              </div>
              <p className="text-lg font-bold text-orange-700">Le {todayTripExpenses.toLocaleString()}</p>
              <p className="text-xs text-orange-600">Fuel & other</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-800">Contract Expenses</span>
              </div>
              <p className="text-lg font-bold text-violet-700">Le {todayContractExpenses.toLocaleString()}</p>
              <p className="text-xs text-violet-600">Loading, tolls, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Active Contracts"
          value={activeContracts.length}
          icon={FileText}
          color="navy"
          subtitle="In progress"
        />
        <StatCard
          title="Week Revenue"
          value={`Le ${weekTotalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
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