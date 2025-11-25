import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Truck,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Play,
  CheckCircle,
  Plus,
  LogIn,
  LogOut,
  Fuel,
  Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import MobileQuickActions from "@/components/mobile/MobileQuickActions";

export default function DriverDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: () => base44.entities.Attendance.filter({ 
      employee_id: currentEmployee?.id,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!currentEmployee?.id,
  });

  const { data: todayTrips = [] } = useQuery({
    queryKey: ['driverTrips', currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: currentEmployee?.id,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!currentEmployee?.id,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const todayRecord = todayAttendance?.[0];
  const isClockedIn = todayRecord?.clock_in_time && !todayRecord?.clock_out_time;
  const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);

  const clockInMutation = useMutation({
    mutationFn: () => base44.entities.Attendance.create({
      organisation_id: orgId,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      date: format(new Date(), 'yyyy-MM-dd'),
      clock_in_time: format(new Date(), 'HH:mm:ss'),
      status: 'present',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      toast({ title: "Clocked In!", description: `Welcome, ${currentEmployee?.first_name}!` });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => {
      const clockInTime = new Date(`${todayRecord.date}T${todayRecord.clock_in_time}`);
      const hoursWorked = (new Date() - clockInTime) / (1000 * 60 * 60);
      
      return base44.entities.Attendance.update(todayRecord.id, {
        clock_out_time: format(new Date(), 'HH:mm:ss'),
        total_hours: parseFloat(hoursWorked.toFixed(2)),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      toast({ title: "Clocked Out!", description: "See you tomorrow!" });
    },
  });

  const createTripMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverTrips'] });
      setShowTripDialog(false);
      toast({ title: "Trip Recorded!" });
    },
  });

  const handleTripSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedRoute = routes.find(r => r.id === formData.get('route_id'));
    const selectedVehicle = vehicles.find(v => v.id === formData.get('vehicle_id'));
    
    const passengers = parseInt(formData.get('passengers_count')) || 0;
    const ticketPrice = parseFloat(formData.get('ticket_price')) || selectedRoute?.base_ticket_price || 0;
    const fuelCost = parseFloat(formData.get('fuel_cost')) || 0;

    createTripMutation.mutate({
      organisation_id: orgId,
      vehicle_id: formData.get('vehicle_id'),
      vehicle_registration: selectedVehicle?.registration_number,
      driver_id: currentEmployee?.id,
      driver_name: currentEmployee?.full_name,
      route_id: formData.get('route_id'),
      route_name: selectedRoute?.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: format(new Date(), 'HH:mm'),
      passengers_count: passengers,
      ticket_price: ticketPrice,
      total_revenue: passengers * ticketPrice,
      fuel_cost: fuelCost,
      net_revenue: (passengers * ticketPrice) - fuelCost,
      status: 'completed',
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Card - Mobile Optimized */}
      <Card className="bg-gradient-to-br from-[#0F1F3C] to-[#1D5FC3] text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">🇸🇱 Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}</p>
              <h1 className="text-xl font-bold">{currentEmployee?.first_name || 'Driver'}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{format(currentTime, 'HH:mm')}</p>
              <p className="text-xs text-white/70">{format(currentTime, 'MMM d, yyyy')}</p>
            </div>
          </div>

          {/* Clock In/Out Button */}
          <Button
            size="lg"
            onClick={() => isClockedIn ? clockOutMutation.mutate() : !todayRecord && clockInMutation.mutate()}
            disabled={todayRecord?.clock_out_time || clockInMutation.isPending || clockOutMutation.isPending}
            className={`w-full h-16 text-lg font-bold ${
              isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1EB053] hover:bg-green-600'
            } ${todayRecord?.clock_out_time ? 'opacity-50' : ''}`}
          >
            {isClockedIn ? (
              <><LogOut className="w-6 h-6 mr-2" /> Clock Out</>
            ) : todayRecord?.clock_out_time ? (
              <><CheckCircle className="w-6 h-6 mr-2" /> Done for Today</>
            ) : (
              <><LogIn className="w-6 h-6 mr-2" /> Clock In</>
            )}
          </Button>

          {isClockedIn && (
            <p className="text-center text-white/70 text-sm mt-2">
              Clocked in at {todayRecord?.clock_in_time}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats - Mobile Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-[#1EB053] mb-1" />
            <p className="text-2xl font-bold">Le {todayRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Today's Revenue</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4 text-center">
            <Truck className="w-8 h-8 mx-auto text-[#0072C6] mb-1" />
            <p className="text-2xl font-bold">{todayTrips.length}</p>
            <p className="text-xs text-gray-500">Trips Today</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-[#D4AF37] mb-1" />
            <p className="text-2xl font-bold">{todayPassengers}</p>
            <p className="text-xs text-gray-500">Passengers</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0F1F3C]">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-[#0F1F3C] mb-1" />
            <p className="text-2xl font-bold">{todayRecord?.total_hours?.toFixed(1) || '-'}</p>
            <p className="text-xs text-gray-500">Hours Worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Record Trip Button */}
      <Button
        onClick={() => setShowTripDialog(true)}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        disabled={!isClockedIn}
      >
        <Plus className="w-6 h-6 mr-2" />
        Record New Trip
      </Button>

      {/* Today's Trips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Today's Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayTrips.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No trips recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trip.route_name}</p>
                      <p className="text-xs text-gray-500">{trip.start_time} • {trip.passengers_count} passengers</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#1EB053]">Le {trip.total_revenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Trip Dialog */}
      <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Record Trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTripSubmit} className="space-y-4">
            <div>
              <Label>Vehicle</Label>
              <Select name="vehicle_id" required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.registration_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Route</Label>
              <Select name="route_id" required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Passengers</Label>
                <Input name="passengers_count" type="number" min="0" required className="mt-1" />
              </div>
              <div>
                <Label>Ticket Price</Label>
                <Input name="ticket_price" type="number" step="100" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Fuel Cost (Le)</Label>
              <Input name="fuel_cost" type="number" step="100" defaultValue="0" className="mt-1" />
            </div>
            <DialogFooter className="flex-col gap-2">
              <Button type="submit" className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                Save Trip
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setShowTripDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}