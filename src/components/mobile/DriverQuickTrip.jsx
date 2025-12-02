import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Truck, Users, MapPin, DollarSign, Fuel, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function DriverQuickTrip({ currentEmployee, orgId, vehicles, routes }) {
  const queryClient = useQueryClient();
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [passengers, setPassengers] = useState(0);
  const [fuelCost, setFuelCost] = useState(0);

  const selectedRouteData = routes.find(r => r.id === selectedRoute);
  const ticketPrice = selectedRouteData?.base_ticket_price || 0;
  const totalRevenue = passengers * ticketPrice;
  const netRevenue = totalRevenue - fuelCost;

  const createTripMutation = useMutation({
    mutationFn: async () => {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      return base44.entities.Trip.create({
        organisation_id: orgId,
        vehicle_id: selectedVehicle,
        vehicle_registration: vehicle?.registration_number,
        driver_id: currentEmployee.id,
        driver_name: currentEmployee.full_name,
        route_id: selectedRoute,
        route_name: selectedRouteData?.name,
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: format(new Date(), 'HH:mm'),
        passengers_count: passengers,
        ticket_price: ticketPrice,
        total_revenue: totalRevenue,
        fuel_cost: fuelCost,
        net_revenue: netRevenue,
        status: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success("Trip Recorded!", { description: `Revenue: Le ${totalRevenue.toLocaleString()}` });
      setPassengers(0);
      setFuelCost(0);
    }
  });

  return (
    <Card className="border-t-4 border-t-[#0072C6]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="w-5 h-5 text-[#0072C6]" />
          Quick Trip Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Vehicle</Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.filter(v => v.status === 'active').map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.registration_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {routes.filter(r => r.is_active).map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs flex items-center gap-1">
            <Users className="w-3 h-3" /> Passengers
          </Label>
          <div className="flex items-center gap-3 mt-1">
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12"
              onClick={() => setPassengers(Math.max(0, passengers - 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <Input 
              type="number" 
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value) || 0)}
              className="h-12 text-center text-xl font-bold"
            />
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12"
              onClick={() => setPassengers(passengers + 1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs flex items-center gap-1">
            <Fuel className="w-3 h-3" /> Fuel Cost (Le)
          </Label>
          <Input 
            type="number" 
            value={fuelCost}
            onChange={(e) => setFuelCost(parseFloat(e.target.value) || 0)}
            className="h-12 mt-1"
          />
        </div>

        {selectedRoute && passengers > 0 && (
          <div className="p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Ticket Price:</span>
              <span>Le {ticketPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Revenue:</span>
              <span className="font-semibold text-[#1EB053]">Le {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t mt-2 pt-2">
              <span>Net Revenue:</span>
              <span className="font-bold text-lg text-[#0072C6]">Le {netRevenue.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={() => createTripMutation.mutate()}
          disabled={!selectedVehicle || !selectedRoute || passengers === 0 || createTripMutation.isPending}
          className="w-full h-14 text-lg bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          {createTripMutation.isPending ? "Recording..." : "Record Trip"}
        </Button>
      </CardContent>
    </Card>
  );
}