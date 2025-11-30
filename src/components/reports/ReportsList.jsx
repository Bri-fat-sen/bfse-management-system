import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  Copy,
  Star,
  StarOff,
  Clock,
  Share2,
  Calendar,
  Mail
} from "lucide-react";
import { format } from "date-fns";

const REPORT_TYPE_COLORS = {
  sales: "bg-green-100 text-green-800",
  inventory: "bg-blue-100 text-blue-800",
  payroll: "bg-purple-100 text-purple-800",
  transport: "bg-orange-100 text-orange-800",
  custom: "bg-gray-100 text-gray-800"
};

export default function ReportsList({
  reports,
  onRun,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite
}) {
  if (!reports?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No reports created yet</p>
        <p className="text-sm text-gray-400">Create your first custom report to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map(report => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{report.name}</h3>
                  {report.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <Badge className={REPORT_TYPE_COLORS[report.report_type]}>
                  {report.report_type}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRun(report)}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(report)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(report)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleFavorite(report)}>
                    {report.is_favorite ? (
                      <>
                        <StarOff className="w-4 h-4 mr-2" />
                        Remove Favorite
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Add to Favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(report)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {report.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {report.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs gap-1">
                <Calendar className="w-3 h-3" />
                {report.filters?.date_range?.replace(/_/g, " ")}
              </Badge>
              {report.is_shared && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Share2 className="w-3 h-3" />
                  Shared
                </Badge>
              )}
            </div>

            {report.schedule?.enabled && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
                <Clock className="w-3 h-3" />
                <span className="capitalize">{report.schedule.frequency}</span>
                {report.schedule.recipients?.length > 0 && (
                  <>
                    <Mail className="w-3 h-3 ml-2" />
                    <span>{report.schedule.recipients.length} recipients</span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-gray-400">
                {report.created_date && format(new Date(report.created_date), "MMM d, yyyy")}
              </span>
              <Button 
                size="sm" 
                onClick={() => onRun(report)}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}