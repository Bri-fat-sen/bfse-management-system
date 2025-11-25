import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plus,
  Car,
  Fuel,
  Calendar,
  Route as RouteIcon,
  Play,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import RouteDialog from "@/components/transport/RouteDialog";

export default function Transport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("trips");
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);

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

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, role: 'driver' }),
    enabled: !!orgId,
  });

  const createTripMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowTripDialog(false);
      toast({ title: "Trip recorded successfully" });
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowVehicleDialog(false);
      toast({ title: "Vehicle added successfully" });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trip.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: "Trip updated successfully" });
    },
  });

  const todayTrips = trips.filter(t => t.date === format(new Date(), 'yyyy-MM-dd'));
  const totalRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalPassengers = todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  const activeVehicles = vehicles.filter(v => v.status === 'active');

  const handleTripSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedRoute = routes.find(r => r.id === formData.get('route_id'));
    const selectedVehicle = vehicles.find(v => v.id === formData.get('vehicle_id'));
    
    const passengers = parseInt(formData.get('passengers_count')) || 0;
    const ticketPrice = parseFloat(formData.get('ticket_price')) || selectedRoute?.base_ticket_price || 0;
    const fuelCost = parseFloat(formData.get('fuel_cost')) || 0;
    const otherExpenses = parseFloat(formData.get('other_expenses')) || 0;
    const totalRevenue = passengers * ticketPrice;
    const netRevenue = totalRevenue - fuelCost - otherExpenses;

    const data = {
      organisation_id: orgId,
      vehicle_id: formData.get('vehicle_id'),
      vehicle_registration: selectedVehicle?.registration_number,
      driver_id: currentEmployee?.id,
      driver_name: currentEmployee?.full_name,
      route_id: formData.get('route_id'),
      route_name: selectedRoute?.name,
      date: formData.get('date'),
      start_time: formData.get('start_time'),
      passengers_count: passengers,
      ticket_price: ticketPrice,
      total_revenue: totalRevenue,
      fuel_cost: fuelCost,
      other_expenses: otherExpenses,
      net_revenue: netRevenue,
      status: 'completed',
      notes: formData.get('notes'),
    };

    createTripMutation.mutate(data);
  };

  const handleVehicleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      registration_number: formData.get('registration_number'),
      vehicle_type: formData.get('vehicle_type'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      capacity: parseInt(formData.get('capacity')) || 0,
      fuel_type: formData.get('fuel_type'),
      status: 'active',
    };

    createVehicleMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport & Drivers"
        subtitle="Manage vehicles, routes, and driver trips"
        action={() => setShowTripDialog(true)}
        actionLabel="Record Trip"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Today's Trips"
          value={todayTrips.length}
          icon={RouteIcon}
          color="blue"
        />
        <StatCard
          title="Total Passengers"
          value={totalPassengers}
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles.length}
          icon={Truck}
          color="navy"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trip Records</CardTitle>
              <Button onClick={() => setShowTripDialog(true)} className="sl-gradient">
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTrips ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <EmptyState
                  icon={RouteIcon}
                  title="No Trips Recorded"
                  description="Start recording trips to track driver revenue"
                  action={() => setShowTripDialog(true)}
                  actionLabel="Record First Trip"
                />
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          trip.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {trip.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Play className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{trip.route_name || 'Unknown Route'}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {trip.vehicle_registration || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {trip.passengers_count} passengers
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {trip.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1EB053]">Le {trip.total_revenue?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Net: Le {trip.net_revenue?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicles</CardTitle>
              <Button onClick={() => setShowVehicleDialog(true)} className="sl-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="No Vehicles"
                  description="Add vehicles to assign to drivers"
                  action={() => setShowVehicleDialog(true)}
                  actionLabel="Add Vehicle"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            vehicle.status === 'active' ? 'bg-gradient-to-br from-[#1EB053] to-[#1D5FC3]' : 'bg-gray-200'
                          }`}>
                            <Truck className={`w-7 h-7 ${vehicle.status === 'active' ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{vehicle.registration_number}</h3>
                            <p className="text-gray-500">{vehicle.brand} {vehicle.model}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={vehicle.status === 'active' ? 'secondary' : 'outline'}>
                                {vehicle.status}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {vehicle.capacity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {vehicle.assigned_driver_name && (
                          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                            Driver: {vehicle.assigned_driver_name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Routes</CardTitle>
              <Button onClick={() => setShowRouteDialog(true)} className="bg-[#0072C6] hover:bg-[#005a9e]">
                <Plus className="w-4 h-4 mr-2" />
                Add Route
              </Button>
            </CardHeader>
            <CardContent>
              {routes.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No Routes"
                  description="Routes need to be configured by admin"
                />
              ) : (
                <div className="space-y-3">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1D5FC3]/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#1D5FC3]" />
                        </div>
                        <div>
                          <p className="font-medium">{route.name}</p>
                          <p className="text-sm text-gray-500">
                            {route.start_location} → {route.end_location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Le {route.base_ticket_price?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{route.distance_km} km</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Drivers"
                  description="Employees with driver role will appear here"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => (
                    <Card key={driver.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center text-white font-bold">
                            {driver.full_name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{driver.full_name}</h3>
                            <p className="text-sm text-gray-500">{driver.employee_code}</p>
                            <Badge variant={driver.status === 'active' ? 'secondary' : 'outline'} className="mt-1">
                              {driver.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trip Dialog */}
      <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record New Trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTripSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle</Label>
                <Select name="vehicle_id" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.status === 'active').map(v => (
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
                    {routes.filter(r => r.is_active).map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="mt-1" />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input name="start_time" type="time" required className="mt-1" />
              </div>
              <div>
                <Label>Passengers</Label>
                <Input name="passengers_count" type="number" min="0" required className="mt-1" />
              </div>
              <div>
                <Label>Ticket Price (Le)</Label>
                <Input name="ticket_price" type="number" step="0.01" className="mt-1" />
              </div>
              <div>
                <Label>Fuel Cost (Le)</Label>
                <Input name="fuel_cost" type="number" step="0.01" defaultValue="0" className="mt-1" />
              </div>
              <div>
                <Label>Other Expenses (Le)</Label>
                <Input name="other_expenses" type="number" step="0.01" defaultValue="0" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input name="notes" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTripDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="sl-gradient">
                Record Trip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Route Dialog */}
      <RouteDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        orgId={orgId}
      />

      {/* Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Registration Number</Label>
                <Input name="registration_number" required className="mt-1" placeholder="e.g., ABC-123" />
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Select name="vehicle_type" defaultValue="bus">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input name="capacity" type="number" min="1" className="mt-1" />
              </div>
              <div>
                <Label>Brand</Label>
                <Input name="brand" className="mt-1" />
              </div>
              <div>
                <Label>Model</Label>
                <Input name="model" className="mt-1" />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select name="fuel_type" defaultValue="diesel">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVehicleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="sl-gradient">
                Add Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}