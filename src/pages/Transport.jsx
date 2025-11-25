import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  Truck,
  Users,
  Route,
  DollarSign,
  MapPin,
  Plus,
  Play,
  CheckCircle,
  Fuel,
  Calendar,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function Transport() {
  const [activeTab, setActiveTab] = useState("trips");
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const queryClient = useQueryClient();

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

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-date', 50),
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
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowVehicleDialog(false);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: (data) => base44.entities.Route.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setShowRouteDialog(false);
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trip.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  // Stats
  const todayTrips = trips.filter(t => t.date === format(new Date(), 'yyyy-MM-dd'));
  const totalRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transport & Drivers" 
        subtitle="Manage vehicles, routes, and track driver revenue"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Trips"
          value={todayTrips.length}
          icon={Route}
          color="blue"
        />
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={Truck}
          color="navy"
        />
        <StatCard
          title="Total Revenue"
          value={`Le ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="gold"
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
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowTripDialog(true)} className="sl-gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Trip Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{trip.date && format(new Date(trip.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{trip.driver_name}</TableCell>
                      <TableCell>{trip.vehicle_registration}</TableCell>
                      <TableCell>{trip.route_name}</TableCell>
                      <TableCell>{trip.passengers_count}</TableCell>
                      <TableCell className="font-medium">Le {trip.total_revenue?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          trip.status === 'completed' ? "bg-green-100 text-green-800" :
                          trip.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                          trip.status === 'cancelled' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trip.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTripMutation.mutate({ 
                              id: trip.id, 
                              data: { status: 'in_progress', start_time: format(new Date(), 'HH:mm') }
                            })}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {trip.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateTripMutation.mutate({ 
                              id: trip.id, 
                              data: { status: 'completed', end_time: format(new Date(), 'HH:mm') }
                            })}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowVehicleDialog(true)} className="sl-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{vehicle.registration_number}</h3>
                        <p className="text-sm text-gray-500 capitalize">{vehicle.vehicle_type}</p>
                      </div>
                    </div>
                    <Badge className={
                      vehicle.status === 'active' ? "bg-green-100 text-green-800" :
                      vehicle.status === 'maintenance' ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {vehicle.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Brand/Model</span>
                      <span>{vehicle.brand} {vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity</span>
                      <span>{vehicle.capacity} passengers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Driver</span>
                      <span>{vehicle.assigned_driver_name || "Not assigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fuel Type</span>
                      <span className="capitalize">{vehicle.fuel_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowRouteDialog(true)} className="sl-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Ticket Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-600" />
                          {route.start_location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-600" />
                          {route.end_location}
                        </div>
                      </TableCell>
                      <TableCell>{route.distance_km} km</TableCell>
                      <TableCell>{route.estimated_duration_mins} mins</TableCell>
                      <TableCell className="font-medium">Le {route.base_ticket_price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={route.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {route.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const driverTrips = trips.filter(t => t.driver_id === driver.id);
              const driverRevenue = driverTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
              const vehicle = vehicles.find(v => v.assigned_driver_id === driver.id);
              
              return (
                <Card key={driver.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center text-white text-xl font-bold">
                        {driver.first_name?.[0]}{driver.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-bold">{driver.full_name}</h3>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Assigned Vehicle</span>
                        <span className="font-medium">{vehicle?.registration_number || "None"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Trips</span>
                        <span className="font-medium">{driverTrips.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Revenue</span>
                        <span className="font-medium text-[#1EB053]">Le {driverRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Trip Dialog */}
      <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Trip</DialogTitle>
          </DialogHeader>
          <TripForm 
            drivers={drivers}
            vehicles={vehicles}
            routes={routes}
            orgId={orgId}
            onSave={(data) => createTripMutation.mutateAsync(data)}
            onCancel={() => setShowTripDialog(false)}
            isLoading={createTripMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            drivers={drivers}
            orgId={orgId}
            onSave={(data) => createVehicleMutation.mutateAsync(data)}
            onCancel={() => setShowVehicleDialog(false)}
            isLoading={createVehicleMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Route Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Route</DialogTitle>
          </DialogHeader>
          <RouteForm 
            orgId={orgId}
            onSave={(data) => createRouteMutation.mutateAsync(data)}
            onCancel={() => setShowRouteDialog(false)}
            isLoading={createRouteMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TripForm({ drivers, vehicles, routes, orgId, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    driver_id: "",
    driver_name: "",
    vehicle_id: "",
    vehicle_registration: "",
    route_id: "",
    route_name: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    passengers_count: 0,
    ticket_price: 0,
    total_revenue: 0,
    fuel_cost: 0,
    status: "scheduled"
  });

  const handleDriverChange = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    const vehicle = vehicles.find(v => v.assigned_driver_id === driverId);
    setFormData({ 
      ...formData, 
      driver_id: driverId,
      driver_name: driver?.full_name || "",
      vehicle_id: vehicle?.id || "",
      vehicle_registration: vehicle?.registration_number || ""
    });
  };

  const handleRouteChange = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    setFormData({ 
      ...formData, 
      route_id: routeId,
      route_name: route?.name || "",
      ticket_price: route?.base_ticket_price || 0
    });
  };

  const handlePassengersChange = (count) => {
    const revenue = count * formData.ticket_price;
    setFormData({ ...formData, passengers_count: count, total_revenue: revenue });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Driver</Label>
        <Select value={formData.driver_id} onValueChange={handleDriverChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select driver" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Vehicle</Label>
        <Input value={formData.vehicle_registration || "Auto-assigned"} disabled />
      </div>
      <div>
        <Label>Route</Label>
        <Select value={formData.route_id} onValueChange={handleRouteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select route" />
          </SelectTrigger>
          <SelectContent>
            {routes.filter(r => r.is_active).map(r => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <Label>Passengers</Label>
          <Input 
            type="number" 
            value={formData.passengers_count}
            onChange={(e) => handlePassengersChange(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ticket Price (Le)</Label>
          <Input type="number" value={formData.ticket_price} disabled />
        </div>
        <div>
          <Label>Fuel Cost (Le)</Label>
          <Input 
            type="number" 
            value={formData.fuel_cost}
            onChange={(e) => setFormData({ ...formData, fuel_cost: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <p className="text-2xl font-bold text-[#1EB053]">Le {formData.total_revenue.toLocaleString()}</p>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({ ...formData, organisation_id: orgId })} 
          disabled={isLoading || !formData.driver_id || !formData.route_id}
          className="sl-gradient"
        >
          {isLoading ? "Creating..." : "Create Trip"}
        </Button>
      </div>
    </div>
  );
}

function VehicleForm({ drivers, orgId, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    registration_number: "",
    vehicle_type: "bus",
    brand: "",
    model: "",
    capacity: 0,
    fuel_type: "diesel",
    assigned_driver_id: "",
    assigned_driver_name: "",
    status: "active"
  });

  const handleDriverChange = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setFormData({ 
      ...formData, 
      assigned_driver_id: driverId,
      assigned_driver_name: driver?.full_name || ""
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Registration Number</Label>
        <Input 
          value={formData.registration_number}
          onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
          placeholder="e.g., ABC-1234"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Vehicle Type</Label>
          <Select value={formData.vehicle_type} onValueChange={(v) => setFormData({ ...formData, vehicle_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="minibus">Minibus</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fuel Type</Label>
          <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="petrol">Petrol</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Brand</Label>
          <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Passenger Capacity</Label>
        <Input 
          type="number" 
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label>Assigned Driver</Label>
        <Select value={formData.assigned_driver_id} onValueChange={handleDriverChange}>
          <SelectTrigger><SelectValue placeholder="Select driver (optional)" /></SelectTrigger>
          <SelectContent>
            {drivers.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({ ...formData, organisation_id: orgId })} 
          disabled={isLoading || !formData.registration_number}
          className="sl-gradient"
        >
          {isLoading ? "Adding..." : "Add Vehicle"}
        </Button>
      </div>
    </div>
  );
}

function RouteForm({ orgId, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    start_location: "",
    end_location: "",
    distance_km: 0,
    estimated_duration_mins: 0,
    base_ticket_price: 0,
    is_active: true
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Route Name</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Freetown - Bo"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Location</Label>
          <Input 
            value={formData.start_location}
            onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
          />
        </div>
        <div>
          <Label>End Location</Label>
          <Input 
            value={formData.end_location}
            onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Distance (km)</Label>
          <Input 
            type="number" 
            value={formData.distance_km}
            onChange={(e) => setFormData({ ...formData, distance_km: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Duration (mins)</Label>
          <Input 
            type="number" 
            value={formData.estimated_duration_mins}
            onChange={(e) => setFormData({ ...formData, estimated_duration_mins: Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label>Ticket Price (Le)</Label>
        <Input 
          type="number" 
          value={formData.base_ticket_price}
          onChange={(e) => setFormData({ ...formData, base_ticket_price: Number(e.target.value) })}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({ ...formData, organisation_id: orgId })} 
          disabled={isLoading || !formData.name || !formData.start_location || !formData.end_location}
          className="sl-gradient"
        >
          {isLoading ? "Adding..." : "Add Route"}
        </Button>
      </div>
    </div>
  );
}