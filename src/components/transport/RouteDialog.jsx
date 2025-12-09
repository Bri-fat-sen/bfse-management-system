import { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState('route');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (open) {
      setStops(editingRoute?.stops || []);
      setActiveSection('route');
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

  const sections = [
    { id: 'route', label: 'Route Info', icon: Route },
    { id: 'stops', label: 'Stops', icon: MapPin },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
                </h2>
                <p className="text-white/80 text-sm">Configure transport route</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
                {section.id === 'stops' && stops.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs">
                    {stops.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Route Info Section */}
            {activeSection === 'route' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Route className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Route Details</h3>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Route Name *</Label>
                  <Input 
                    name="name" 
                    required 
                    className="mt-1.5 border-gray-200" 
                    placeholder="e.g., Freetown - Bo Express"
                    defaultValue={editingRoute?.name}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium flex items-center gap-2">
                      <Navigation className="w-4 h-4" /> Start Location *
                    </Label>
                    <Input 
                      name="start_location" 
                      required 
                      className="mt-2 border-[#1EB053]/30 bg-white" 
                      placeholder="e.g., Freetown"
                      defaultValue={editingRoute?.start_location}
                    />
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                    <Label className="text-[#0072C6] font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> End Location *
                    </Label>
                    <Input 
                      name="end_location" 
                      required 
                      className="mt-2 border-[#0072C6]/30 bg-white" 
                      placeholder="e.g., Bo"
                      defaultValue={editingRoute?.end_location}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Distance (km)</Label>
                    <Input 
                      name="distance_km" 
                      type="number" 
                      step="0.1"
                      className="mt-1.5 border-gray-200" 
                      defaultValue={editingRoute?.distance_km}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Duration (mins)
                    </Label>
                    <Input 
                      name="estimated_duration_mins" 
                      type="number"
                      className="mt-1.5 border-gray-200" 
                      defaultValue={editingRoute?.estimated_duration_mins}
                    />
                  </div>
                  <div className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50">
                    <Label className="text-amber-700 font-medium flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Ticket (SLE) *
                    </Label>
                    <Input 
                      name="base_ticket_price" 
                      type="number" 
                      step="100"
                      required
                      className="mt-1 border-amber-200 bg-white" 
                      defaultValue={editingRoute?.base_ticket_price}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stops Section */}
            {activeSection === 'stops' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                      <MapPin className="w-4 h-4" style={{ color: secondaryColor }} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Intermediate Stops</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addStop} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Stop
                  </Button>
                </div>

                <div className="space-y-3">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#0072C6]/10 flex items-center justify-center text-[#0072C6] font-bold text-sm">
                        {index + 1}
                      </div>
                      <Input 
                        placeholder="Stop name" 
                        value={stop.name}
                        onChange={(e) => updateStop(index, 'name', e.target.value)}
                        className="flex-1 border-gray-200"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Le</span>
                        <Input 
                          type="number" 
                          placeholder="Price"
                          value={stop.price}
                          onChange={(e) => updateStop(index, 'price', e.target.value)}
                          className="pl-8 border-gray-200"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeStop(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {stops.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-gray-50">
                      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No intermediate stops</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Add Stop" to add pickup/dropoff points</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRouteMutation.isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {createRouteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{editingRoute ? 'Update Route' : 'Create Route'}</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}