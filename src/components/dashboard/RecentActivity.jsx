import React from "react";
import { format } from "date-fns";
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  LogIn
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const getActivityIcon = (type) => {
  switch (type) {
    case 'sale': return { icon: ShoppingCart, color: 'bg-green-100 text-green-600' };
    case 'inventory': return { icon: Package, color: 'bg-blue-100 text-blue-600' };
    case 'trip': return { icon: Truck, color: 'bg-purple-100 text-purple-600' };
    case 'hr_action': return { icon: Users, color: 'bg-indigo-100 text-indigo-600' };
    case 'expense': return { icon: DollarSign, color: 'bg-red-100 text-red-600' };
    case 'clock_in':
    case 'clock_out': return { icon: Clock, color: 'bg-cyan-100 text-cyan-600' };
    case 'login': return { icon: LogIn, color: 'bg-gray-100 text-gray-600' };
    case 'error': return { icon: AlertTriangle, color: 'bg-red-100 text-red-600' };
    default: return { icon: Clock, color: 'bg-gray-100 text-gray-600' };
  }
};

export default function RecentActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="px-6 divide-y">
            {activities.slice(0, 15).map((activity, idx) => {
              const { icon: Icon, color } = getActivityIcon(activity.action_type);
              return (
                <div key={activity.id || idx} className="flex items-start gap-3 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.employee_name}</span>
                      {activity.module && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activity.module}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(activity.created_date), 'HH:mm')}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}