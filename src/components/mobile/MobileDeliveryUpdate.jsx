import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  Package,
  Phone,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useOffline } from "@/components/offline/OfflineManager";

export default function MobileDeliveryUpdate({ 
  open, 
  onOpenChange, 
  orgId, 
  currentEmployee 
}) {
  const queryClient = useQueryClient();
  const offlineContext = useOffline();
  const isOnline = offlineContext?.isOnline ?? true;
  const queueAction = offlineContext?.queueAction ?? null;
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [updateNote, setUpdateNote] = useState("");

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['activeTrips', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      organisation_id: orgId,
      driver_id: currentEmployee?.id,
      status: 'in_progress'
    }),
    enabled: !!orgId && !!currentEmployee?.id && open && isOnline,
    staleTime: 2 * 60 * 1000,
  });

  const { data: pendingTrips = [] } = useQuery({
    queryKey: ['pendingTrips', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      organisation_id: orgId,
      driver_id: currentEmployee?.id,
      status: 'scheduled'
    }),
    enabled: !!orgId && !!currentEmployee?.id && open && isOnline,
    staleTime: 2 * 60 * 1000,
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ tripId, data }) => base44.entities.Trip.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTrips'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTrips'] });
      toast.success("Trip updated");
      setSelectedTrip(null);
      setUpdateNote("");
    },
  });

  const startTrip = async (trip) => {
    const updateData = {
      status: 'in_progress',
      actual_departure: new Date().toISOString(),
      notes: `Started at ${format(new Date(), 'HH:mm')}`
    };

    if (isOnline) {
      updateTripMutation.mutate({ tripId: trip.id, data: updateData });
    } else if (queueAction) {
      queueAction({ 
        type: 'update_trip', 
        tripId: trip.id, 
        data: updateData 
      });
      toast.success("Trip start saved offline");
    }
  };

  const completeTrip = async (trip) => {
    const updateData = {
      status: 'completed',
      actual_arrival: new Date().toISOString(),
      notes: (trip.notes || '') + `\nCompleted at ${format(new Date(), 'HH:mm')}. ${updateNote}`
    };

    if (isOnline) {
      updateTripMutation.mutate({ tripId: trip.id, data: updateData });
    } else if (queueAction) {
      queueAction({ 
        type: 'update_trip', 
        tripId: trip.id, 
        data: updateData 
      });
      toast.success("Trip completion saved offline");
    }
  };

  const allTrips = [...trips, ...pendingTrips];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-500" />
            Delivery Updates
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pb-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-700">{pendingTrips.length}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Scheduled</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-green-700">{trips.length}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">In Progress</p>
            </div>
          </div>

          {/* Trip List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : allTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Truck className="w-10 h-10 mb-2" />
                <p className="text-sm">No active deliveries</p>
              </div>
            ) : (
              allTrips.map(trip => (
                <div key={trip.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{trip.route_name || 'Delivery'}</p>
                      <p className="text-xs text-gray-500">{trip.vehicle_registration}</p>
                    </div>
                    <Badge className={
                      trip.status === 'in_progress' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {trip.status === 'in_progress' ? 'Active' : 'Scheduled'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="truncate">{trip.origin || 'Start location'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="truncate">{trip.destination || 'End location'}</span>
                    </div>
                    {trip.scheduled_departure && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{format(new Date(trip.scheduled_departure), 'HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {trip.status === 'scheduled' ? (
                      <Button
                        onClick={() => startTrip(trip)}
                        className="flex-1 bg-[#1EB053] hover:bg-[#178f43]"
                        disabled={updateTripMutation.isPending}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Trip
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          Add Note
                        </Button>
                        <Button
                          onClick={() => completeTrip(trip)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={updateTripMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Update Note Modal */}
          {selectedTrip && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
              <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
                <h3 className="font-semibold">Add Delivery Note</h3>
                <Textarea
                  placeholder="Enter update or issue..."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setSelectedTrip(null); setUpdateNote(""); }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-[#1EB053]"
                    onClick={() => {
                      updateTripMutation.mutate({
                        tripId: selectedTrip.id,
                        data: { notes: (selectedTrip.notes || '') + `\n${format(new Date(), 'HH:mm')}: ${updateNote}` }
                      });
                    }}
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}