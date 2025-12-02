import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function GitHubIssuesList({ issues = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No issues found</p>
      </div>
    );
  }

  const openIssues = issues.filter(i => i.state === 'open');
  const closedIssues = issues.filter(i => i.state === 'closed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-green-600">
          <AlertCircle className="w-4 h-4" /> {openIssues.length} Open
        </span>
        <span className="flex items-center gap-1.5 text-purple-600">
          <CheckCircle className="w-4 h-4" /> {closedIssues.length} Closed
        </span>
      </div>

      <div className="space-y-2">
        {issues.map((issue) => (
          <div 
            key={issue.id} 
            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {issue.state === 'open' ? (
                <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <a 
                    href={issue.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-[#1EB053] line-clamp-1"
                  >
                    {issue.title}
                  </a>
                  <a 
                    href={issue.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                  <span>#{issue.number}</span>
                  <span>•</span>
                  <span>by {issue.user?.login}</span>
                  <span>•</span>
                  <span>{format(new Date(issue.created_at), 'MMM d, yyyy')}</span>
                  {issue.comments > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {issue.comments}
                      </span>
                    </>
                  )}
                </div>
                {issue.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {issue.labels.slice(0, 5).map((label) => (
                      <Badge 
                        key={label.id} 
                        style={{ 
                          backgroundColor: `#${label.color}20`, 
                          color: `#${label.color}`,
                          borderColor: `#${label.color}40`
                        }}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}