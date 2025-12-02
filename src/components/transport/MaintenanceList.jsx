import React from "react";
import { format, differenceInDays, isPast, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Gauge
} from "lucide-react";

const maintenanceTypeLabels = {
  oil_change: "Oil Change",
  tire_rotation: "Tire Rotation",
  tire_replacement: "Tire Replacement",
  brake_service: "Brake Service",
  engine_repair: "Engine Repair",
  transmission: "Transmission",
  battery: "Battery",
  air_filter: "Air Filter",
  fuel_filter: "Fuel Filter",
  coolant_flush: "Coolant Flush",
  inspection: "Inspection",
  body_repair: "Body Repair",
  electrical: "Electrical",
  scheduled_service: "Scheduled Service",
  other: "Other",
};

export function MaintenanceCard({ record, onClick }) {
  const isOverdue = record.next_due_date && isPast(new Date(record.next_due_date));
  const daysUntilDue = record.next_due_date 
    ? differenceInDays(new Date(record.next_due_date), new Date()) 
    : null;

  return (
    <div 
      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            record.status === 'completed' ? 'bg-green-100' :
            record.status === 'in_progress' ? 'bg-blue-100' :
            record.status === 'scheduled' ? 'bg-amber-100' : 'bg-gray-100'
          }`}>
            <Wrench className={`w-5 h-5 ${
              record.status === 'completed' ? 'text-green-600' :
              record.status === 'in_progress' ? 'text-blue-600' :
              record.status === 'scheduled' ? 'text-amber-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">
                {maintenanceTypeLabels[record.maintenance_type] || record.maintenance_type}
              </p>
              <Badge variant="outline" className="text-xs">
                {record.vehicle_registration}
              </Badge>
            </div>
            {record.description && (
              <p className="text-sm text-gray-600 mt-0.5">{record.description}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(record.date_performed), 'MMM d, yyyy')}
              </span>
              {record.mileage_at_service > 0 && (
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  {record.mileage_at_service.toLocaleString()} km
                </span>
              )}
              {record.vendor && (
                <span>{record.vendor}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          {record.cost > 0 && (
            <p className="font-bold text-gray-900">Le {record.cost.toLocaleString()}</p>
          )}
          <Badge variant={
            record.category === 'emergency' ? 'destructive' :
            record.category === 'unscheduled' ? 'default' : 'secondary'
          } className="text-xs">
            {record.category}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function UpcomingMaintenanceCard({ record, vehicle, onClick }) {
  const isOverdue = record.next_due_date && isPast(new Date(record.next_due_date));
  const daysUntilDue = record.next_due_date 
    ? differenceInDays(new Date(record.next_due_date), new Date()) 
    : null;
  const mileageRemaining = record.next_due_mileage && vehicle?.current_mileage
    ? record.next_due_mileage - vehicle.current_mileage
    : null;

  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isOverdue ? 'bg-red-50 border-red-200 hover:bg-red-100' :
        daysUntilDue !== null && daysUntilDue <= 7 ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' :
        'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isOverdue ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            {isOverdue ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {maintenanceTypeLabels[record.maintenance_type] || record.maintenance_type}
            </p>
            <p className="text-xs text-gray-500">{record.vehicle_registration}</p>
          </div>
        </div>
        <div className="text-right">
          {record.next_due_date && (
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
              {isOverdue ? 'Overdue' : `${daysUntilDue} days`}
            </p>
          )}
          {mileageRemaining !== null && mileageRemaining > 0 && (
            <p className="text-xs text-gray-500">{mileageRemaining.toLocaleString()} km left</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MaintenanceStats({ maintenanceRecords, vehicles }) {
  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  
  const recentMaintenance = maintenanceRecords.filter(m => 
    new Date(m.date_performed) >= thirtyDaysAgo
  );
  
  const totalCost30Days = recentMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  
  const upcomingMaintenance = maintenanceRecords.filter(m => 
    m.next_due_date && !isPast(new Date(m.next_due_date)) && 
    differenceInDays(new Date(m.next_due_date), now) <= 30
  );
  
  const overdueMaintenance = maintenanceRecords.filter(m => 
    m.next_due_date && isPast(new Date(m.next_due_date)) && m.status !== 'completed'
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          <span className="text-[10px] sm:text-xs text-green-700">Done (30d)</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-green-800">{recentMaintenance.length}</p>
      </div>
      
      <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          <span className="text-[10px] sm:text-xs text-blue-700">Cost</span>
        </div>
        <p className="text-sm sm:text-2xl font-bold text-blue-800 truncate">Le {totalCost30Days.toLocaleString()}</p>
      </div>
      
      <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
          <span className="text-[10px] sm:text-xs text-amber-700">Upcoming</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-amber-800">{upcomingMaintenance.length}</p>
      </div>
      
      <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
          <span className="text-[10px] sm:text-xs text-red-700">Overdue</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-red-800">{overdueMaintenance.length}</p>
      </div>
    </div>
  );
}