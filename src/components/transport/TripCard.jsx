import React from "react";
import { format } from "date-fns";
import { Truck, MapPin, Clock, Users, DollarSign, Fuel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Scheduled' },
  in_progress: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled' },
};

export default function TripCard({ trip, onEdit, onUpdateStatus, compact = false }) {
  const status = statusConfig[trip.status] || statusConfig.scheduled;
  const netRevenue = (trip.total_revenue || 0) - (trip.fuel_cost || 0) - (trip.other_expenses || 0);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{trip.route_name || 'Unknown Route'}</p>
            <p className="text-xs text-gray-500">{trip.driver_name} • {trip.start_time}</p>
          </div>
        </div>
        <Badge variant="outline" className={status.color}>{status.label}</Badge>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{trip.route_name || 'Unknown Route'}</h3>
              <p className="text-sm text-gray-500">{trip.vehicle_registration}</p>
            </div>
          </div>
          <Badge variant="outline" className={status.color}>{status.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{trip.driver_name || 'No driver'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{trip.start_time} - {trip.end_time || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{format(new Date(trip.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{trip.passengers_count || 0} passengers</span>
          </div>
        </div>

        {trip.status === 'completed' && (
          <div className="p-3 bg-gray-50 rounded-lg mb-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="font-semibold text-green-600">Le {(trip.total_revenue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expenses</p>
                <p className="font-semibold text-red-600">Le {((trip.fuel_cost || 0) + (trip.other_expenses || 0)).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net</p>
                <p className={`font-semibold ${netRevenue >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                  Le {netRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {(onEdit || onUpdateStatus) && (
          <div className="flex gap-2">
            {onUpdateStatus && trip.status === 'scheduled' && (
              <Button 
                size="sm" 
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                onClick={() => onUpdateStatus(trip, 'in_progress')}
              >
                Start Trip
              </Button>
            )}
            {onUpdateStatus && trip.status === 'in_progress' && (
              <Button 
                size="sm" 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => onUpdateStatus(trip, 'completed')}
              >
                Complete Trip
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(trip)}>
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}