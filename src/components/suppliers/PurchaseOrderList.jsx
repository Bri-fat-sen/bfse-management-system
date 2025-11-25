import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import {
  Search,
  FileText,
  MoreVertical,
  CheckCircle,
  XCircle,
  Truck,
  Send,
  Eye
} from "lucide-react";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  ordered: "bg-purple-100 text-purple-800",
  partial: "bg-orange-100 text-orange-800",
  received: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const paymentColors = {
  unpaid: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800"
};

export default function PurchaseOrderList({
  purchaseOrders = [],
  suppliers = [],
  onReceive,
  orgId,
  currentEmployee
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const updatePOMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast({ title: "Purchase order updated" });
    },
  });

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (po, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'approved') {
      updates.approved_by = currentEmployee?.full_name;
    }
    updatePOMutation.mutate({ id: po.id, data: updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Purchase Orders"
            description="Create a purchase order to get started"
          />
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((po) => {
              const supplier = suppliers.find(s => s.id === po.supplier_id);
              const itemsCount = po.items?.length || 0;
              const totalReceived = po.items?.reduce((sum, item) => sum + (item.quantity_received || 0), 0) || 0;
              const totalOrdered = po.items?.reduce((sum, item) => sum + (item.quantity_ordered || 0), 0) || 0;

              return (
                <div key={po.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#1EB053] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{po.po_number}</span>
                        <Badge className={statusColors[po.status]}>{po.status}</Badge>
                        <Badge className={paymentColors[po.payment_status]}>{po.payment_status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {po.supplier_name} • {itemsCount} items
                        {po.status !== 'draft' && po.status !== 'cancelled' && (
                          <span> • {totalReceived}/{totalOrdered} received</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {po.order_date ? `Ordered: ${format(new Date(po.order_date), 'dd MMM yyyy')}` : 'No order date'}
                        {po.expected_date && ` • Expected: ${format(new Date(po.expected_date), 'dd MMM yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {(po.total_amount || 0).toLocaleString()}</p>
                      {po.warehouse_name && (
                        <p className="text-xs text-gray-500">{po.warehouse_name}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {po.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(po, 'pending')}>
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Approval
                          </DropdownMenuItem>
                        )}
                        {po.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(po, 'approved')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleStatusChange(po, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {po.status === 'approved' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(po, 'ordered')}>
                            <Truck className="w-4 h-4 mr-2" />
                            Mark as Ordered
                          </DropdownMenuItem>
                        )}
                        {['ordered', 'partial'].includes(po.status) && (
                          <DropdownMenuItem onClick={() => onReceive(po)}>
                            <Truck className="w-4 h-4 mr-2" />
                            Receive Items
                          </DropdownMenuItem>
                        )}
                        {!['received', 'cancelled'].includes(po.status) && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleStatusChange(po, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}