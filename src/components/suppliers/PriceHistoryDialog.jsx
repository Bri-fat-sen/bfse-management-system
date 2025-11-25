import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PriceHistoryDialog({ 
  open, 
  onOpenChange, 
  supplier,
  product,
  orgId 
}) {
  const { data: priceHistory = [] } = useQuery({
    queryKey: ['priceHistory', supplier?.id, product?.id],
    queryFn: async () => {
      const filter = { organisation_id: orgId };
      if (supplier?.id) filter.supplier_id = supplier.id;
      if (product?.id) filter.product_id = product.id;
      return base44.entities.SupplierPriceHistory.filter(filter, '-effective_date', 100);
    },
    enabled: open && !!orgId,
  });

  // Group by product for chart
  const chartData = priceHistory.reduce((acc, record) => {
    const existing = acc.find(d => d.date === record.effective_date);
    if (existing) {
      existing[record.product_name] = record.new_price;
    } else {
      acc.push({
        date: record.effective_date,
        [record.product_name]: record.new_price
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  const productNames = [...new Set(priceHistory.map(p => p.product_name))];
  const colors = ['#1EB053', '#0072C6', '#D4AF37', '#9333EA', '#EF4444'];

  const title = supplier 
    ? `Price History - ${supplier.name}`
    : product 
    ? `Price History - ${product.name}`
    : 'Price History';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chart */}
          {chartData.length > 1 && (
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `Le ${val.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(val) => `Le ${val.toLocaleString()}`}
                    labelFormatter={(label) => format(new Date(label), 'PP')}
                  />
                  {productNames.map((name, idx) => (
                    <Line 
                      key={name}
                      type="monotone" 
                      dataKey={name} 
                      stroke={colors[idx % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History List */}
          {priceHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No price history available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {priceHistory.map((record) => {
                const change = record.new_price - (record.old_price || 0);
                const percentChange = record.old_price ? ((change / record.old_price) * 100).toFixed(1) : null;
                
                return (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        change > 0 ? 'bg-red-100' : change < 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {change > 0 ? (
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        ) : change < 0 ? (
                          <TrendingDown className="w-5 h-5 text-green-600" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{record.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {record.supplier_name} • {format(new Date(record.effective_date), 'PP')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {record.old_price && (
                          <span className="text-gray-400 line-through text-sm">
                            Le {record.old_price.toLocaleString()}
                          </span>
                        )}
                        <span className="font-bold text-[#1EB053]">
                          Le {record.new_price.toLocaleString()}
                        </span>
                      </div>
                      {percentChange && (
                        <Badge 
                          variant="secondary"
                          className={change > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                        >
                          {change > 0 ? '+' : ''}{percentChange}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}