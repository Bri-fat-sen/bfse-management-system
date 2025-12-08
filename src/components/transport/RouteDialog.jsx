import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { 
  MapPin, Plus, Minus, Route, X, Check, Loader2, 
  Navigation, Clock, DollarSign
} from "lucide-react";

export default function RouteDialog({ 
  open, 
  onOpenChange, 
  orgId,
  editingRoute = null,
  organisation
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState(editingRoute?.stops || []);
  const [showStops, setShowStops] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (open) {
      setStops(editingRoute?.stops || []);
      setShowStops((editingRoute?.stops?.length || 0) > 0);
    }
  }, [open, editingRoute]);

  const createRouteMutation = useMutation({
    mutationFn: (data) => editingRoute 
      ? base44.entities.Route.update(editingRoute.id, data)
      : base44.entities.Route.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onOpenChange(false);
      setStops([]);
      toast.success(editingRoute ? "Route updated" : "Route created", editingRoute ? "Route has been updated successfully" : "Route has been created successfully");
    },
    onError: (error) => {
      console.error('Route mutation error:', error);
      toast.error(editingRoute ? "Failed to update route" : "Failed to create route", error.message);
    }
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{editingRoute ? 'Edit Route' : 'Add Route'}</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to save</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="font-medium">Route Name *</Label>
              <Input name="name" required autoFocus className="mt-1.5" placeholder="Freetown - Bo" defaultValue={editingRoute?.name} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                <Label className="text-[#1EB053] font-medium text-xs">From *</Label>
                <Input name="start_location" required className="mt-1.5 border-[#1EB053]/30 bg-white" placeholder="Freetown" defaultValue={editingRoute?.start_location} />
              </div>
              <div className="p-3 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                <Label className="text-[#0072C6] font-medium text-xs">To *</Label>
                <Input name="end_location" required className="mt-1.5 border-[#0072C6]/30 bg-white" placeholder="Bo" defaultValue={editingRoute?.end_location} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50">
                <Label className="text-amber-700 font-medium text-xs">Ticket *</Label>
                <Input name="base_ticket_price" type="number" step="100" required className="mt-1.5 border-amber-200 bg-white" defaultValue={editingRoute?.base_ticket_price} placeholder="Le" />
              </div>
              <div>
                <Label className="text-sm">Distance</Label>
                <Input name="distance_km" type="number" step="0.1" className="mt-1.5" defaultValue={editingRoute?.distance_km} placeholder="km" />
              </div>
              <div>
                <Label className="text-sm">Duration</Label>
                <Input name="estimated_duration_mins" type="number" className="mt-1.5" defaultValue={editingRoute?.estimated_duration_mins} placeholder="mins" />
              </div>
            </div>

            <button type="button" onClick={() => setShowStops(!showStops)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showStops ? '− Hide' : '+ Add'} Stops ({stops.length})
            </button>

            {showStops && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Intermediate Stops</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStop}>
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
                {stops.map((stop, idx) => (
                  <div key={idx} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#0072C6]/10 flex items-center justify-center text-[#0072C6] text-xs font-bold">{idx + 1}</div>
                    <Input placeholder="Stop" value={stop.name} onChange={(e) => updateStop(idx, 'name', e.target.value)} className="flex-1 text-sm" />
                    <Input type="number" placeholder="Price" value={stop.price} onChange={(e) => updateStop(idx, 'price', e.target.value)} className="w-20 text-sm" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(idx)} className="text-red-500 h-8 w-8">
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={createRouteMutation.isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {createRouteMutation.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{editingRoute ? 'Update' : 'Add'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}