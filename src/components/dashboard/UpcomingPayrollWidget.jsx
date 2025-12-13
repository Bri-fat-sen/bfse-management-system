import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, ArrowRight } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpcomingPayrollWidget({ payCycles, payrolls }) {
  const now = new Date();
  
  // Find the next upcoming pay cycle
  const upcomingCycle = payCycles
    .filter(cycle => {
      if (!cycle.next_pay_date) return false;
      const nextPayDate = new Date(cycle.next_pay_date);
      return nextPayDate >= now;
    })
    .sort((a, b) => new Date(a.next_pay_date) - new Date(b.next_pay_date))[0];

  // Get recent payrolls in draft/pending status
  const pendingPayrolls = payrolls
    .filter(p => p.status === 'draft' || p.status === 'pending_approval')
    .slice(0, 3);

  const daysUntilPayroll = upcomingCycle ? 
    differenceInDays(new Date(upcomingCycle.next_pay_date), now) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Upcoming Payroll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingCycle ? (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Next Pay Date</p>
                  <p className="text-xl font-bold text-purple-900">
                    {format(new Date(upcomingCycle.next_pay_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <Badge className="bg-purple-600 text-white">
                  {daysUntilPayroll === 0 ? 'Today' : daysUntilPayroll === 1 ? 'Tomorrow' : `${daysUntilPayroll} days`}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-gray-600">Frequency</p>
                  <p className="font-semibold text-gray-900">{upcomingCycle.frequency}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-gray-600">Cycle Name</p>
                  <p className="font-semibold text-gray-900">{upcomingCycle.name}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No upcoming payroll scheduled</p>
            </div>
          )}

          {pendingPayrolls.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pending Processing</p>
              <div className="space-y-2">
                {pendingPayrolls.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {p.employee_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{p.employee_name}</p>
                        <p className="text-xs text-gray-600">{p.pay_period}</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to={createPageUrl("HRManagement")}>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg transition-all">
              Manage Payroll <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}