import { } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Users, Truck, Package, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TopPerformers({ sales = [], employees = [], trips = [], products = [] }) {
  // Top selling employees
  const employeeSales = employees.map(emp => {
    const empSales = sales.filter(s => s.employee_id === emp.id);
    const revenue = empSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    return {
      ...emp,
      salesCount: empSales.length,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top drivers by trips
  const driverPerformance = employees
    .filter(e => e.role === 'driver')
    .map(driver => {
      const driverTrips = trips.filter(t => t.driver_id === driver.id);
      const revenue = driverTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
      return {
        ...driver,
        tripCount: driverTrips.length,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

  // Top selling products
  const productSales = products.map(product => {
    const sold = sales.reduce((sum, sale) => {
      const item = sale.items?.find(i => i.product_id === product.id);
      return sum + (item?.quantity || 0);
    }, 0);
    const revenue = sales.reduce((sum, sale) => {
      const item = sale.items?.find(i => i.product_id === product.id);
      return sum + ((item?.quantity || 0) * (item?.unit_price || 0));
    }, 0);
    return {
      ...product,
      sold,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Top Sellers */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1EB053] to-[#0ea844]" />
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-white">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-[#1EB053]" />
            Top Sales Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeSales.length > 0 ? (
            <div className="space-y-3">
              {employeeSales.map((emp, idx) => (
                <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {idx === 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{emp.full_name}</p>
                    <p className="text-xs text-gray-500">{emp.salesCount} sales</p>
                  </div>
                  <p className="font-bold text-sm text-[#1EB053]">Le {emp.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No sales data</p>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]" />
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-white">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-[#8b5cf6]" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productSales.length > 0 ? (
            <div className="space-y-2.5">
              {productSales.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#8b5cf6]">Le {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No product data</p>
          )}
        </CardContent>
      </Card>

      {/* Top Drivers */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706]" />
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-white">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#f59e0b]" />
            Top Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverPerformance.length > 0 ? (
            <div className="space-y-3">
              {driverPerformance.map((driver, idx) => (
                <div key={driver.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                    <AvatarImage src={driver.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white text-sm">
                      {driver.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{driver.full_name}</p>
                    <p className="text-xs text-gray-500">{driver.tripCount} trips</p>
                  </div>
                  <p className="font-bold text-sm text-[#f59e0b]">Le {driver.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No driver data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}