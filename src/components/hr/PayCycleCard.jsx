import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Play, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function PayCycleCard({ cycle, employees, onEdit, onDelete, onProcess }) {
  const cycleEmployees = employees.filter(e => cycle.employee_ids?.includes(e.id));
  const daysUntilNext = cycle.next_run_date 
    ? Math.ceil((new Date(cycle.next_run_date) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const isUpcoming = daysUntilNext <= 3 && daysUntilNext > 0;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${!cycle.is_active ? 'opacity-60' : ''} ${isUpcoming ? 'border-amber-400 shadow-amber-100' : 'border-gray-200'}`}>
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">{cycle.name}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                {cycle.frequency.replace('_', ' ')}
              </Badge>
              <Badge variant={cycle.is_active ? "default" : "secondary"} className={`text-xs font-medium ${cycle.is_active ? 'bg-green-100 text-green-700 border-green-200' : ''}`}>
                {cycle.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Employees</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{cycle.employee_count || 0}</p>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Pay Day</span>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {cycle.frequency === 'monthly' ? `${cycle.pay_day}th` : 
                cycle.pay_day === 0 ? 'Sun' : cycle.pay_day === 1 ? 'Mon' : 
                cycle.pay_day === 2 ? 'Tue' : cycle.pay_day === 3 ? 'Wed' : 
                cycle.pay_day === 4 ? 'Thu' : cycle.pay_day === 5 ? 'Fri' : 'Sat'}
            </p>
          </div>
        </div>

        {/* Next Run */}
        {cycle.next_run_date && (
          <div className={`p-4 rounded-lg border-2 ${isUpcoming ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
            <p className="text-xs font-medium text-gray-600 mb-1">Next Scheduled Run</p>
            <p className="text-base font-bold text-gray-900">{format(new Date(cycle.next_run_date), 'MMMM d, yyyy')}</p>
            {daysUntilNext > 0 && (
              <p className={`text-sm font-medium mt-1 ${isUpcoming ? 'text-amber-700' : 'text-gray-600'}`}>
                {isUpcoming && '⚠️ '} in {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Last Run */}
        {cycle.last_run_date && (
          <div className="text-xs text-gray-500 px-1">
            Last processed: {format(new Date(cycle.last_run_date), 'MMM d, yyyy')}
          </div>
        )}

        {/* Settings Tags */}
        <div className="flex flex-wrap gap-2">
          {cycle.auto_process && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Auto Process
            </Badge>
          )}
          {cycle.auto_approve && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Auto Approve
            </Badge>
          )}
          {cycle.use_package_settings && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              Package Settings
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#16803d] hover:from-[#16803d] hover:to-[#1EB053]"
            onClick={onProcess}
            disabled={!cycle.employee_ids?.length}
          >
            <Play className="w-3 h-3 mr-1" />
            Run Now
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="border-gray-300 hover:bg-gray-50">
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:border-red-300"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}