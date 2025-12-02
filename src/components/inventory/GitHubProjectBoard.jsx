import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Github,
  Loader2,
  ExternalLink,
  LayoutGrid,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Package,
  RefreshCw
} from "lucide-react";

const STATUS_ICONS = {
  'Todo': Circle,
  'In Progress': Clock,
  'Done': CheckCircle,
  'Backlog': AlertCircle,
};

const STATUS_COLORS = {
  'Todo': 'bg-gray-100 text-gray-700 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
  'Done': 'bg-green-100 text-green-700 border-green-300',
  'Backlog': 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export default function GitHubProjectBoard({ className = "" }) {
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['githubProjects'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getProjects' });
      return res.data || [];
    },
  });

  // Fetch project items when a project is selected
  const { data: projectItems = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['githubProjectItems', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const res = await base44.functions.invoke('github', { 
        action: 'getProjectItems',
        projectId: selectedProjectId 
      });
      return res.data || [];
    },
    enabled: !!selectedProjectId,
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Get status field from project
  const statusField = selectedProject?.fields?.nodes?.find(
    f => f.name?.toLowerCase() === 'status' && f.options
  );

  // Group items by status
  const groupedItems = React.useMemo(() => {
    const groups = {};
    
    if (statusField?.options) {
      statusField.options.forEach(opt => {
        groups[opt.name] = [];
      });
    }
    
    projectItems.forEach(item => {
      const statusValue = item.fieldValues?.nodes?.find(
        fv => fv.field?.name?.toLowerCase() === 'status'
      );
      const status = statusValue?.name || 'No Status';
      if (!groups[status]) groups[status] = [];
      groups[status].push(item);
    });
    
    return groups;
  }, [projectItems, statusField]);

  // Filter to show only inventory-related items
  const inventoryItems = projectItems.filter(item => {
    const labels = item.content?.labels?.nodes || [];
    const title = item.content?.title?.toLowerCase() || '';
    return labels.some(l => l.name.toLowerCase().includes('inventory')) ||
           title.includes('inventory') ||
           title.includes('stock') ||
           title.includes('reorder');
  });

  // Calculate progress
  const totalItems = projectItems.length;
  const doneItems = groupedItems['Done']?.length || 0;
  const progressPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  if (projectsLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0 || projects.message) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Github className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No GitHub Projects found</p>
          <p className="text-sm text-gray-400 mt-1">Create a project in GitHub to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutGrid className="w-5 h-5" />
            GitHub Project Board
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              refetchProjects();
              if (selectedProjectId) refetchItems();
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Selector */}
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.filter(p => p && p.id && !p.closed).map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProjectId && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{progressPercent}% complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{doneItems} of {totalItems} tasks done</span>
                {inventoryItems.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {inventoryItems.length} inventory tasks
                  </span>
                )}
              </div>
            </div>

            {/* Status Columns Summary */}
            {itemsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(groupedItems).map(([status, items]) => {
                  const Icon = STATUS_ICONS[status] || Circle;
                  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
                  return (
                    <div 
                      key={status} 
                      className={`p-3 rounded-lg border ${colorClass}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate">{status}</span>
                      </div>
                      <p className="text-lg font-bold">{items.length}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inventory Tasks List */}
            {inventoryItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#1EB053]" />
                  Inventory Tasks
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {inventoryItems.slice(0, 5).map((item) => {
                    const statusValue = item.fieldValues?.nodes?.find(
                      fv => fv.field?.name?.toLowerCase() === 'status'
                    );
                    const status = statusValue?.name || 'No Status';
                    const Icon = STATUS_ICONS[status] || Circle;
                    
                    return (
                      <div 
                        key={item.id}
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          status === 'Done' ? 'text-green-500' :
                          status === 'In Progress' ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.content?.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.content?.number && (
                              <span className="text-xs text-gray-400">
                                #{item.content.number}
                              </span>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] ${STATUS_COLORS[status] || ''}`}
                            >
                              {status}
                            </Badge>
                          </div>
                        </div>
                        {item.content?.url && (
                          <a 
                            href={item.content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
                {inventoryItems.length > 5 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{inventoryItems.length - 5} more tasks
                  </p>
                )}
              </div>
            )}

            {/* View on GitHub */}
            {selectedProject?.url && (
              <a
                href={selectedProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#1EB053] transition-colors"
              >
                View full board on GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}