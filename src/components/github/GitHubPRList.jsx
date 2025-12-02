import React from "react";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest, GitMerge, XCircle, ExternalLink, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function GitHubPRList({ pullRequests = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!pullRequests || pullRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <GitPullRequest className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No pull requests found</p>
      </div>
    );
  }

  const openPRs = pullRequests.filter(pr => pr.state === 'open');
  const mergedPRs = pullRequests.filter(pr => pr.merged_at);
  const closedPRs = pullRequests.filter(pr => pr.state === 'closed' && !pr.merged_at);

  const getIcon = (pr) => {
    if (pr.merged_at) return <GitMerge className="w-5 h-5 text-purple-500" />;
    if (pr.state === 'closed') return <XCircle className="w-5 h-5 text-red-500" />;
    return <GitPullRequest className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (pr) => {
    if (pr.merged_at) return <Badge className="bg-purple-100 text-purple-700 text-[10px]">Merged</Badge>;
    if (pr.state === 'closed') return <Badge variant="destructive" className="text-[10px]">Closed</Badge>;
    return <Badge className="bg-green-100 text-green-700 text-[10px]">Open</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-green-600">
          <GitPullRequest className="w-4 h-4" /> {openPRs.length} Open
        </span>
        <span className="flex items-center gap-1.5 text-purple-600">
          <GitMerge className="w-4 h-4" /> {mergedPRs.length} Merged
        </span>
        <span className="flex items-center gap-1.5 text-red-600">
          <XCircle className="w-4 h-4" /> {closedPRs.length} Closed
        </span>
      </div>

      <div className="space-y-2">
        {pullRequests.map((pr) => (
          <div 
            key={pr.id} 
            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">{getIcon(pr)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <a 
                    href={pr.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-[#1EB053] line-clamp-1"
                  >
                    {pr.title}
                  </a>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(pr)}
                    <a 
                      href={pr.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                  <span>#{pr.number}</span>
                  <span>•</span>
                  <span>by {pr.user?.login}</span>
                  <span>•</span>
                  <span>
                    {pr.merged_at 
                      ? `Merged ${format(new Date(pr.merged_at), 'MMM d')}` 
                      : format(new Date(pr.created_at), 'MMM d, yyyy')
                    }
                  </span>
                  {pr.comments > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {pr.comments}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-green-600">+{pr.additions || 0}</span>
                  <span className="text-red-600">-{pr.deletions || 0}</span>
                  <span className="text-gray-400">{pr.changed_files || 0} files</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}