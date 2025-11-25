import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus, Minus, Route } from "lucide-react";

export default function RouteDialog({ 
  open, 
  onOpenChange, 
  orgId,
  editingRoute = null
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState(editingRoute?.stops || []);

  const createRouteMutation = useMutation({
    mutationFn: (data) => editingRoute 
      ? base44.entities.Route.update(editingRoute.id, data)
      : base44.entities.Route.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onOpenChange(false);
      setStops([]);
      toast({ title: editingRoute ? "Route updated" : "Route created successfully" });
    },
  });

  const addStop = () => {
    setStops([...stops, { name: "", price: 0 }]);
  };

  const updateStop = (index, field, value) => {
    const updated = [...stops];
    updated[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setStops(updated);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      organisation_id: orgId,
      name: formData.get('name'),
      start_location: formData.get('start_location'),
      end_location: formData.get('end_location'),
      distance_km: parseFloat(formData.get('distance_km')) || 0,
      estimated_duration_mins: parseInt(formData.get('estimated_duration_mins')) || 0,
      base_ticket_price: parseFloat(formData.get('base_ticket_price')) || 0,
      stops: stops.filter(s => s.name),
      is_active: true,
    };

    createRouteMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-[#0072C6]" />
            {editingRoute ? 'Edit Route' : 'Add New Route'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Route Name</Label>
            <Input 
              name="name" 
              required 
              className="mt-1" 
              placeholder="e.g., Freetown - Bo Express"
              defaultValue={editingRoute?.name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Location</Label>
              <Input 
                name="start_location" 
                required 
                className="mt-1" 
                placeholder="e.g., Freetown"
                defaultValue={editingRoute?.start_location}
              />
            </div>
            <div>
              <Label>End Location</Label>
              <Input 
                name="end_location" 
                required 
                className="mt-1" 
                placeholder="e.g., Bo"
                defaultValue={editingRoute?.end_location}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Distance (km)</Label>
              <Input 
                name="distance_km" 
                type="number" 
                step="0.1"
                className="mt-1" 
                defaultValue={editingRoute?.distance_km}
              />
            </div>
            <div>
              <Label>Duration (mins)</Label>
              <Input 
                name="estimated_duration_mins" 
                type="number"
                className="mt-1" 
                defaultValue={editingRoute?.estimated_duration_mins}
              />
            </div>
            <div>
              <Label>Ticket Price (SLE)</Label>
              <Input 
                name="base_ticket_price" 
                type="number" 
                step="100"
                required
                className="mt-1" 
                defaultValue={editingRoute?.base_ticket_price}
              />
            </div>
          </div>

          {/* Intermediate Stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Intermediate Stops (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStop}>
                <Plus className="w-4 h-4 mr-1" /> Add Stop
              </Button>
            </div>
            <div className="space-y-2">
              {stops.map((stop, index) => (
                <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Stop name" 
                    value={stop.name}
                    onChange={(e) => updateStop(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    placeholder="Price to here"
                    value={stop.price}
                    onChange={(e) => updateStop(index, 'price', e.target.value)}
                    className="w-28"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(index)}>
                    <Minus className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {stops.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">
                  No intermediate stops - direct route
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto"
              disabled={createRouteMutation.isPending}
            >
              {createRouteMutation.isPending ? "Saving..." : (editingRoute ? "Update Route" : "Create Route")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}