import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Search,
  Package,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  RefreshCw,
  User,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Warehouse,
  FileText
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const ACTION_CONFIG = {
  batch_created: { label: "Batch Created", icon: Plus, color: "bg-green-100 text-green-700" },
  batch_updated: { label: "Batch Updated", icon: Edit, color: "bg-blue-100 text-blue-700" },
  batch_deleted: { label: "Batch Deleted", icon: Trash2, color: "bg-red-100 text-red-700" },
  stock_allocated: { label: "Stock Allocated", icon: ArrowRight, color: "bg-purple-100 text-purple-700" },
  stock_transferred: { label: "Stock Transferred", icon: RefreshCw, color: "bg-orange-100 text-orange-700" },
  stock_adjusted: { label: "Stock Adjusted", icon: Edit, color: "bg-yellow-100 text-yellow-700" },
  product_created: { label: "Product Created", icon: Plus, color: "bg-green-100 text-green-700" },
  product_updated: { label: "Product Updated", icon: Edit, color: "bg-blue-100 text-blue-700" },
  product_deleted: { label: "Product Deleted", icon: Trash2, color: "bg-red-100 text-red-700" },
  stock_level_created: { label: "Stock Level Created", icon: Plus, color: "bg-green-100 text-green-700" },
  stock_level_updated: { label: "Stock Level Updated", icon: Edit, color: "bg-blue-100 text-blue-700" },
  stock_level_deleted: { label: "Stock Level Deleted", icon: Trash2, color: "bg-red-100 text-red-700" }
};

const ENTITY_ICONS = {
  batch: Package,
  product: Package,
  stock_level: Warehouse,
  stock_movement: ArrowRight
};

export default function InventoryAuditLog({ orgId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const pageSize = 20;

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['inventoryAudits', orgId],
    queryFn: () => base44.entities.InventoryAudit.filter(
      { organisation_id: orgId },
      '-created_date',
      200
    ),
    enabled: !!orgId,
  });

  // Filter audits
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = 
      audit.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.performed_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || audit.action_type === actionFilter;
    const matchesEntity = entityFilter === "all" || audit.entity_type === entityFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const auditDate = new Date(audit.created_date);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = auditDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = auditDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = auditDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const paginatedAudits = filteredAudits.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredAudits.length / pageSize);

  const renderChanges = (audit) => {
    if (!audit.previous_values && !audit.new_values) return null;
    
    const changes = [];
    const allKeys = new Set([
      ...Object.keys(audit.previous_values || {}),
      ...Object.keys(audit.new_values || {})
    ]);

    allKeys.forEach(key => {
      const prev = audit.previous_values?.[key];
      const next = audit.new_values?.[key];
      if (prev !== next) {
        changes.push({ key, prev, next });
      }
    });

    if (changes.length === 0) return null;

    return (
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-gray-500">Changes:</p>
        {changes.map(({ key, prev, next }) => (
          <div key={key} className="text-xs flex items-center gap-2">
            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="text-red-600 line-through">{String(prev ?? 'none')}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-green-600">{String(next ?? 'none')}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by product, user, batch..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="batch">Batches</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="stock_level">Stock Levels</SelectItem>
                <SelectItem value="stock_movement">Movements</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedAudits.length} of {filteredAudits.length} audit entries
        </p>
      </div>

      {/* Audit Log */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAudits.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Audit Entries"
          description="Inventory actions will be logged here automatically"
        />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {paginatedAudits.map((audit) => {
              const config = ACTION_CONFIG[audit.action_type] || { 
                label: audit.action_type, 
                icon: FileText, 
                color: "bg-gray-100 text-gray-700" 
              };
              const ActionIcon = config.icon;
              const EntityIcon = ENTITY_ICONS[audit.entity_type] || Package;

              return (
                <div 
                  key={audit.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedAudit(audit)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={config.color}>{config.label}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <EntityIcon className="w-3 h-3" />
                          {audit.entity_type}
                        </Badge>
                        {audit.quantity_changed && (
                          <Badge variant="secondary">
                            Qty: {audit.quantity_changed > 0 ? '+' : ''}{audit.quantity_changed}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mt-1">
                        {audit.entity_name || audit.batch_number || 'Unknown'}
                      </p>
                      {audit.location_name && (
                        <p className="text-sm text-gray-500">
                          Location: {audit.location_name}
                        </p>
                      )}
                      {audit.notes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{audit.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500 flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <User className="w-3 h-3" />
                        <span>{audit.performed_by_name || 'System'}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(audit.created_date), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(audit.created_date), 'HH:mm')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={ACTION_CONFIG[selectedAudit.action_type]?.color}>
                  {ACTION_CONFIG[selectedAudit.action_type]?.label || selectedAudit.action_type}
                </Badge>
                <Badge variant="outline">{selectedAudit.entity_type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Entity</p>
                  <p className="font-medium">{selectedAudit.entity_name || selectedAudit.batch_number || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Performed By</p>
                  <p className="font-medium">{selectedAudit.performed_by_name || 'System'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(selectedAudit.created_date), 'dd MMM yyyy, HH:mm:ss')}
                  </p>
                </div>
                {selectedAudit.quantity_changed && (
                  <div>
                    <p className="text-gray-500">Quantity Changed</p>
                    <p className="font-medium">{selectedAudit.quantity_changed}</p>
                  </div>
                )}
                {selectedAudit.location_name && (
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{selectedAudit.location_name}</p>
                  </div>
                )}
                {selectedAudit.batch_number && (
                  <div>
                    <p className="text-gray-500">Batch Number</p>
                    <p className="font-medium">{selectedAudit.batch_number}</p>
                  </div>
                )}
              </div>

              {selectedAudit.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedAudit.notes}</p>
                </div>
              )}

              {renderChanges(selectedAudit)}

              {selectedAudit.details && Object.keys(selectedAudit.details).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Additional Details</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedAudit.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}