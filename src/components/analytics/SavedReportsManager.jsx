import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FileText,
  Star,
  StarOff,
  Trash2,
  Download,
  Share2,
  Clock,
  User,
  MoreVertical,
  FolderOpen,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";

const REPORT_TYPE_COLORS = {
  sales: '#1EB053',
  expenses: '#EF4444',
  inventory: '#D4AF37',
  transport: '#9333EA',
  hr: '#0F1F3C',
  custom: '#0072C6'
};

export default function SavedReportsManager({ orgId, onLoadReport }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const { data: savedReports = [], isLoading } = useQuery({
    queryKey: ['savedReports', orgId],
    queryFn: () => base44.entities.SavedReport.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      setShowDeleteConfirm(null);
      toast({ title: "Report deleted successfully" });
    },
  });

  const toggleFavorite = (report) => {
    updateReportMutation.mutate({
      id: report.id,
      data: { is_favorite: !report.is_favorite }
    });
  };

  const filteredReports = savedReports.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteReports = filteredReports.filter(r => r.is_favorite);
  const otherReports = filteredReports.filter(r => !r.is_favorite);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search saved reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No Saved Reports"
          description="Save your custom dashboard configurations to access them quickly"
        />
      ) : (
        <div className="space-y-6">
          {/* Favorites */}
          {favoriteReports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Favorites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteReports.map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onLoad={onLoadReport}
                    onToggleFavorite={toggleFavorite}
                    onDelete={() => setShowDeleteConfirm(report)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Reports */}
          {otherReports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                All Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherReports.map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onLoad={onLoadReport}
                    onToggleFavorite={toggleFavorite}
                    onDelete={() => setShowDeleteConfirm(report)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{showDeleteConfirm?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteReportMutation.mutate(showDeleteConfirm.id)}
              disabled={deleteReportMutation.isPending}
            >
              {deleteReportMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportCard({ report, onLoad, onToggleFavorite, onDelete }) {
  const typeColor = REPORT_TYPE_COLORS[report.report_type] || REPORT_TYPE_COLORS.custom;
  
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" style={{ borderTop: `4px solid ${typeColor}` }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0" onClick={() => onLoad(report)}>
            <h3 className="font-semibold truncate group-hover:text-[#1EB053] transition-colors">
              {report.name}
            </h3>
            {report.description && (
              <p className="text-sm text-gray-500 truncate">{report.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onLoad(report)}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Load Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(report)}>
                {report.is_favorite ? (
                  <>
                    <StarOff className="w-4 h-4 mr-2" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <Badge 
            variant="outline" 
            style={{ borderColor: typeColor, color: typeColor }}
          >
            {report.report_type}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(report.created_date), 'MMM d, yyyy')}
          </span>
        </div>
        
        {report.widgets?.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {report.widgets.length} widgets
          </p>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-[#1EB053] hover:text-[#178f43] hover:bg-green-50"
          onClick={() => onLoad(report)}
        >
          Load Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}