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
  Package,
  FileText,
  TrendingDown
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

  // Fetch driver's truck contracts
  const { data: myContracts = [] } = useQuery({
    queryKey: ['driverContracts', currentEmployee?.id],
    queryFn: () => base44.entities.TruckContract.filter({
      driver_id: currentEmployee?.id
    }, '-contract_date', 50),
    enabled: !!currentEmployee?.id,
  });

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  
  // Today's trip revenue and expenses
  const todayTripRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayTripExpenses = todayTrips.reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
  const todayPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  
  // Today's contract revenue and expenses
  const todayContracts = myContracts.filter(c => c.contract_date === today);
  const todayContractRevenue = todayContracts.reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  const todayContractExpenses = todayContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  
  // Combined totals
  const todayRevenue = todayTripRevenue + todayContractRevenue;
  const todayExpenses = todayTripExpenses + todayContractExpenses;
  const todayNetRevenue = todayRevenue - todayExpenses;
  
  // Week calculations
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekTripRevenue = weekTrips.filter(t => new Date(t.date) >= weekAgo)
    .reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const weekTripExpenses = weekTrips.filter(t => new Date(t.date) >= weekAgo)
    .reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
  
  const weekContractRevenue = myContracts.filter(c => new Date(c.contract_date) >= weekAgo)
    .reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  const weekContractExpenses = myContracts.filter(c => new Date(c.contract_date) >= weekAgo)
    .reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  
  const weekRevenue = weekTripRevenue + weekContractRevenue;
  const weekExpenses = weekTripExpenses + weekContractExpenses;

  const scheduledTrips = todayTrips.filter(t => t.status === 'scheduled');
  const completedTrips = todayTrips.filter(t => t.status === 'completed');
  const activeContracts = myContracts.filter(c => c.status === 'in_progress' || c.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`Net: Le ${todayNetRevenue.toLocaleString()}`}
        />
        <StatCard
          title="Today's Expenses"
          value={`Le ${todayExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
          subtitle="Fuel & other costs"
        />
        <StatCard
          title="Trips & Contracts"
          value={`${completedTrips.length} / ${activeContracts.length}`}
          icon={Truck}
          color="blue"
          subtitle="Completed / Active"
        />
        <StatCard
          title="Week Net"
          value={`Le ${(weekRevenue - weekExpenses).toLocaleString()}`}
          icon={TrendingUp}
          color="navy"
          subtitle={`Revenue: Le ${weekRevenue.toLocaleString()}`}
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
        <Card className="border-t-4 border-t-[#1EB053]">
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
              <div className="text-center py-6 text-gray-500">
                <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No trips today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTrips.slice(0, 4).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trip.status === 'completed' ? 'bg-green-100' : 
                        trip.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {trip.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : trip.status === 'in_progress' ? (
                          <Play className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{trip.route_name}</p>
                        <p className="text-xs text-gray-500">
                          {trip.passengers_count} passengers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#1EB053]">Le {trip.total_revenue?.toLocaleString()}</p>
                      {(trip.fuel_cost > 0 || trip.other_expenses > 0) && (
                        <p className="text-xs text-red-500">-Le {((trip.fuel_cost || 0) + (trip.other_expenses || 0)).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Contracts */}
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              My Contracts
            </CardTitle>
            <Link to={createPageUrl("Transport")}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myContracts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No contracts assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myContracts.slice(0, 4).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        contract.status === 'completed' ? 'bg-green-100' : 
                        contract.status === 'in_progress' ? 'bg-blue-100' : 'bg-amber-100'
                      }`}>
                        <Package className={`w-4 h-4 ${
                          contract.status === 'completed' ? 'text-green-600' : 
                          contract.status === 'in_progress' ? 'text-blue-600' : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{contract.client_name}</p>
                        <p className="text-xs text-gray-500">
                          {contract.pickup_location} → {contract.delivery_location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#1EB053]">Le {contract.contract_amount?.toLocaleString()}</p>
                      {contract.total_expenses > 0 && (
                        <p className="text-xs text-red-500">-Le {contract.total_expenses?.toLocaleString()}</p>
                      )}
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