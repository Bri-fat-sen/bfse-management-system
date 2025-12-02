import React from "react";
import { GitCommit, ExternalLink, Loader2, User } from "lucide-react";
import { format } from "date-fns";

export default function GitHubCommitsList({ commits = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!commits || commits.length === 0) {
    return (
      <div className="text-center py-12">
        <GitCommit className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No commits found</p>
      </div>
    );
  }

  // Group commits by date
  const groupedCommits = commits.reduce((groups, commit) => {
    const date = format(new Date(commit.commit?.author?.date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(commit);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedCommits).map(([date, dateCommits]) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-gray-500 mb-2 sticky top-0 bg-white py-1">
            {format(new Date(date), 'MMMM d, yyyy')}
          </h4>
          <div className="space-y-2 border-l-2 border-gray-200 ml-2 pl-4">
            {dateCommits.map((commit) => (
              <div key={commit.sha} className="relative">
                <div className="absolute -left-[22px] top-2 w-3 h-3 bg-gray-300 rounded-full border-2 border-white" />
                <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {commit.author?.avatar_url ? (
                      <img 
                        src={commit.author.avatar_url} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <a 
                        href={commit.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:text-[#1EB053] line-clamp-2 text-sm"
                      >
                        {commit.commit?.message?.split('\n')[0]}
                      </a>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">
                          {commit.sha?.substring(0, 7)}
                        </code>
                        <span>{commit.commit?.author?.name}</span>
                        <span className="ml-auto">
                          {format(new Date(commit.commit?.author?.date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <a 
                      href={commit.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}