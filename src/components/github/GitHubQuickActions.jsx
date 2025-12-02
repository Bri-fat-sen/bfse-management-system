import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  GitPullRequest, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  LayoutGrid,
  Settings
} from "lucide-react";

export default function GitHubQuickActions({ 
  selectedRepo, 
  onNewIssue, 
  onRefresh, 
  isRefreshing 
}) {
  if (!selectedRepo) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        onClick={onNewIssue}
        size="sm"
        className="bg-[#1EB053] hover:bg-[#178f43]"
      >
        <Plus className="w-4 h-4 mr-1" /> New Issue
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a 
            href={`${selectedRepo.html_url}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Issues
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a 
            href={`${selectedRepo.html_url}/pulls`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitPullRequest className="w-4 h-4 mr-1" />
            PRs
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <a 
            href={`${selectedRepo.html_url}/settings`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Settings className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}