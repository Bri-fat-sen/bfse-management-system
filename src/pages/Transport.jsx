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
  CheckCircle,
  FileText,
  Package,
  Wrench,
  AlertTriangle
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
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import RouteDialog from "@/components/transport/RouteDialog";
import TripReportExport from "@/components/transport/TripReportExport";
import TruckContractDialog from "@/components/transport/TruckContractDialog";
import MaintenanceDialog from "@/components/transport/MaintenanceDialog";
import { MaintenanceCard, UpcomingMaintenanceCard, MaintenanceStats } from "@/components/transport/MaintenanceList";
import { isPast, differenceInDays } from "date-fns";

export default function Transport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("trips");
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, role: 'driver' }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: truckContracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ['truckContracts', orgId],
    queryFn: () => base44.entities.TruckContract.filter({ organisation_id: orgId }, '-contract_date', 100),
    enabled: !!orgId,
  });

  const { data: maintenanceRecords = [], isLoading: loadingMaintenance } = useQuery({
    queryKey: ['vehicleMaintenance', orgId],
    queryFn: () => base44.entities.VehicleMaintenance.filter({ organisation_id: orgId }, '-date_performed', 200),
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
  const activeContracts = truckContracts.filter(c => c.status === 'in_progress' || c.status === 'pending');
  const totalContractRevenue = truckContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.net_revenue || 0), 0);

  // Upcoming and overdue maintenance
  const upcomingMaintenance = maintenanceRecords.filter(m => 
    m.next_due_date && !isPast(new Date(m.next_due_date)) && 
    differenceInDays(new Date(m.next_due_date), new Date()) <= 30
  );
  const overdueMaintenance = maintenanceRecords.filter(m => 
    m.next_due_date && isPast(new Date(m.next_due_date))
  );

  if (!user || !currentEmployee || !orgId || loadingTrips) {
    return <LoadingSpinner message="Loading Transport..." subtitle="Fetching vehicles and trips" fullScreen={true} />;
  }

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
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="trips" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Trips
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Routes
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Drivers
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Contracts
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Maintenance
            {overdueMaintenance.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {overdueMaintenance.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Trip Records</CardTitle>
              <div className="flex gap-2">
                <TripReportExport 
                  trips={trips} 
                  routes={routes} 
                  vehicles={vehicles}
                  organisation={organisation?.[0]} 
                />
                <Button onClick={() => setShowTripDialog(true)} className="sl-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  New Trip
                </Button>
              </div>
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
                    <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Vehicles</CardTitle>
              <Button onClick={() => setShowVehicleDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
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
                  {vehicles.map((vehicle) => {
                    const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicle_id === vehicle.id);
                    const lastMaintenance = vehicleMaintenance[0];
                    const vehicleOverdue = vehicleMaintenance.filter(m => m.next_due_date && isPast(new Date(m.next_due_date)));
                    const hasOverdue = vehicleOverdue.length > 0;

                    return (
                      <Card key={vehicle.id} className={hasOverdue ? 'border-red-300 bg-red-50/30' : ''}>
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
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant={vehicle.status === 'active' ? 'secondary' : 'outline'}>
                                  {vehicle.status}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {vehicle.capacity}
                                </Badge>
                                {hasOverdue && (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Maintenance Due
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t space-y-2">
                            {vehicle.current_mileage > 0 && (
                              <p className="text-sm text-gray-600">
                                Mileage: {vehicle.current_mileage?.toLocaleString()} km
                              </p>
                            )}
                            {vehicle.assigned_driver_name && (
                              <p className="text-sm text-gray-600">
                                Driver: {vehicle.assigned_driver_name}
                              </p>
                            )}
                            {lastMaintenance && (
                              <p className="text-sm text-gray-500">
                                Last service: {format(new Date(lastMaintenance.date_performed), 'MMM d, yyyy')}
                              </p>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => { 
                                setSelectedVehicleForMaintenance(vehicle.id); 
                                setEditingMaintenance(null);
                                setShowMaintenanceDialog(true); 
                              }}
                            >
                              <Wrench className="w-3 h-3 mr-2" />
                              Log Maintenance
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle>Routes</CardTitle>
              <Button onClick={() => setShowRouteDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
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
        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Truck Contracts</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {activeContracts.length} active • Le {totalContractRevenue.toLocaleString()} total revenue
                </p>
              </div>
              <Button onClick={() => { setEditingContract(null); setShowContractDialog(true); }} className="sl-gradient">
                <Plus className="w-4 h-4 mr-2" />
                New Contract
              </Button>
            </CardHeader>
            <CardContent>
              {loadingContracts ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : truckContracts.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Contracts"
                  description="Create truck contracts for cargo transport jobs"
                  action={() => setShowContractDialog(true)}
                  actionLabel="Create Contract"
                />
              ) : (
                <div className="space-y-3">
                  {truckContracts.map((contract) => (
                    <div 
                      key={contract.id} 
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => { setEditingContract(contract); setShowContractDialog(true); }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            contract.status === 'completed' ? 'bg-green-100' :
                            contract.status === 'in_progress' ? 'bg-blue-100' :
                            contract.status === 'cancelled' ? 'bg-red-100' : 'bg-amber-100'
                          }`}>
                            <Package className={`w-6 h-6 ${
                              contract.status === 'completed' ? 'text-green-600' :
                              contract.status === 'in_progress' ? 'text-blue-600' :
                              contract.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{contract.client_name}</p>
                              <Badge variant="outline" className="text-xs">{contract.contract_number}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {contract.pickup_location} → {contract.delivery_location}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                              {contract.vehicle_registration && (
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {contract.vehicle_registration}
                                </span>
                              )}
                              {contract.driver_name && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {contract.driver_name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {contract.contract_date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">Le {contract.contract_amount?.toLocaleString()}</p>
                          <div className="flex items-center gap-2 justify-end">
                            {contract.total_expenses > 0 && (
                              <span className="text-sm text-red-500">-Le {contract.total_expenses?.toLocaleString()}</span>
                            )}
                            <span className={`text-sm font-medium ${contract.net_revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Net: Le {contract.net_revenue?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <Badge variant={
                              contract.status === 'completed' ? 'secondary' :
                              contract.status === 'in_progress' ? 'default' :
                              contract.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {contract.status?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={
                              contract.payment_status === 'paid' ? 'secondary' :
                              contract.payment_status === 'partial' ? 'default' : 'outline'
                            }>
                              {contract.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6 space-y-6">
          {/* Maintenance Stats */}
          <MaintenanceStats maintenanceRecords={maintenanceRecords} vehicles={vehicles} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming/Overdue Maintenance */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Upcoming & Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {[...overdueMaintenance, ...upcomingMaintenance].length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming maintenance</p>
                ) : (
                  <div className="space-y-2">
                    {[...overdueMaintenance, ...upcomingMaintenance].slice(0, 8).map((record) => (
                      <UpcomingMaintenanceCard 
                        key={record.id} 
                        record={record}
                        vehicle={vehicles.find(v => v.id === record.vehicle_id)}
                        onClick={() => { setEditingMaintenance(record); setShowMaintenanceDialog(true); }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Maintenance Records */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle>Maintenance History</CardTitle>
                <Button onClick={() => { setEditingMaintenance(null); setSelectedVehicleForMaintenance(null); setShowMaintenanceDialog(true); }} className="sl-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Maintenance
                </Button>
              </CardHeader>
              <CardContent>
                {loadingMaintenance ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : maintenanceRecords.length === 0 ? (
                  <EmptyState
                    icon={Wrench}
                    title="No Maintenance Records"
                    description="Log maintenance to track vehicle service history"
                    action={() => setShowMaintenanceDialog(true)}
                    actionLabel="Log Maintenance"
                  />
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {maintenanceRecords.map((record) => (
                      <MaintenanceCard 
                        key={record.id} 
                        record={record}
                        onClick={() => { setEditingMaintenance(record); setShowMaintenanceDialog(true); }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Maintenance Dialog */}
      <MaintenanceDialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
        maintenance={editingMaintenance}
        vehicles={vehicles}
        currentEmployee={currentEmployee}
        orgId={orgId}
        preselectedVehicleId={selectedVehicleForMaintenance}
      />

      {/* Truck Contract Dialog */}
      <TruckContractDialog
        open={showContractDialog}
        onOpenChange={setShowContractDialog}
        contract={editingContract}
        vehicles={vehicles}
        employees={employees}
        orgId={orgId}
      />

      {/* Trip Dialog */}
      <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>Record New Trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTripSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTripDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowVehicleDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                Add Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}