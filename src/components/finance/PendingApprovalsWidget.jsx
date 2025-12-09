import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ChevronRight,
  FileText,
  User
} from "lucide-react";
import { format } from "date-fns";
import QuickExpenseApproval from "./QuickExpenseApproval";

export default function PendingApprovalsWidget({ orgId, currentEmployee }) {
  const [selectedExpense, setSelectedExpense] = React.useState(null);

  const { data: pendingExpenses = [] } = useQuery({
    queryKey: ['pendingExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ 
      organisation_id: orgId, 
      status: 'pending' 
    }, '-created_date', 20),
    enabled: !!orgId,
    refetchInterval: 30000,
  });

  const canApprove = ['super_admin', 'org_admin', 'accountant'].includes(currentEmployee?.role);

  if (!canApprove) return null;

  return (
    <>
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p>Pending Approvals</p>
              <p className="text-xs font-normal text-gray-500">
                {pendingExpenses.length} expense{pendingExpenses.length !== 1 ? 's' : ''} awaiting review
              </p>
            </div>
            {pendingExpenses.length > 0 && (
              <Badge className="bg-amber-500">{pendingExpenses.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No pending approvals</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {pendingExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {expense.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{expense.recorded_by_name || 'Unknown'}</span>
                                <span>•</span>
                                <span>{expense.date ? format(new Date(expense.date), 'MMM d') : '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-amber-600">
                            Le {expense.amount?.toLocaleString() || 0}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {expense.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-3 pt-3 border-t">
                <Link to={createPageUrl('ExpenseManagement')}>
                  <Button variant="outline" className="w-full" size="sm">
                    View All Pending
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <QuickExpenseApproval
        expense={selectedExpense}
        open={!!selectedExpense}
        onOpenChange={(open) => !open && setSelectedExpense(null)}
      />
    </>
  );
}