import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  User, 
  Truck, 
  ShoppingCart, 
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuickClockIn from "@/components/mobile/QuickClockIn";
import DriverQuickTrip from "@/components/mobile/DriverQuickTrip";
import QuickSale from "@/components/mobile/QuickSale";
import { OfflineStatus } from "@/components/offline/OfflineManager";

export default function MobileHub() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const role = currentEmployee?.role;

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ 
        employee_id: currentEmployee?.id,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      return records[0];
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const { data: todayTrips = [] } = useQuery({
    queryKey: ['todayTrips', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      organisation_id: orgId,
      driver_id: currentEmployee?.id,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const { data: todaySales = [] } = useQuery({
    queryKey: ['todaySales', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.Sale.filter({ 
      organisation_id: orgId,
      employee_id: currentEmployee?.id
    }, '-created_date', 20),
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const isDriver = role === 'driver';
  const isSales = ['retail_cashier', 'vehicle_sales', 'warehouse_manager'].includes(role);

  const todayTripRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todaySalesTotal = todaySales
    .filter(s => s.created_date?.startsWith(format(new Date(), 'yyyy-MM-dd')))
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">{user?.full_name || 'User'}</p>
              <Badge className="bg-white/20 text-white text-xs">
                {role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>
          <OfflineStatus />
        </div>
        
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Calendar className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-4">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {isDriver && (
                <>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Truck className="w-6 h-6 mx-auto mb-1 text-[#1EB053]" />
                    <p className="text-2xl font-bold text-[#1EB053]">{todayTrips.length}</p>
                    <p className="text-xs text-gray-500">Trips Today</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-[#0072C6]" />
                    <p className="text-2xl font-bold text-[#0072C6]">Le {todayTripRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </>
              )}
              {isSales && (
                <>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-[#1EB053]" />
                    <p className="text-2xl font-bold text-[#1EB053]">
                      {todaySales.filter(s => s.created_date?.startsWith(format(new Date(), 'yyyy-MM-dd'))).length}
                    </p>
                    <p className="text-xs text-gray-500">Sales Today</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-[#0072C6]" />
                    <p className="text-2xl font-bold text-[#0072C6]">Le {todaySalesTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </>
              )}
              {!isDriver && !isSales && (
                <>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-[#1EB053]" />
                    <p className="text-lg font-bold text-[#1EB053]">
                      {todayAttendance?.clock_in_time || '--:--'}
                    </p>
                    <p className="text-xs text-gray-500">Clock In</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-[#0072C6]" />
                    <p className="text-lg font-bold text-[#0072C6]">
                      {todayAttendance?.clock_out_time || '--:--'}
                    </p>
                    <p className="text-xs text-gray-500">Clock Out</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Clock In/Out - Show for everyone */}
        <QuickClockIn 
          currentEmployee={currentEmployee}
          orgId={orgId}
          todayAttendance={todayAttendance}
        />

        {/* Driver Quick Trip */}
        {isDriver && (
          <DriverQuickTrip
            currentEmployee={currentEmployee}
            orgId={orgId}
            vehicles={vehicles}
            routes={routes}
          />
        )}

        {/* Sales Quick Sale */}
        {isSales && (
          <QuickSale
            products={products}
            currentEmployee={currentEmployee}
            orgId={orgId}
          />
        )}
      </div>
    </div>
  );
}