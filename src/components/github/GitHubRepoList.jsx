import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Star, GitFork, Search, ExternalLink, Lock, Globe } from "lucide-react";
import { format } from "date-fns";

export default function GitHubRepoList({ repos = [], selectedRepo, onSelectRepo }) {
  const [search, setSearch] = useState("");

  const filteredRepos = repos.filter(r => 
    r?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r?.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="w-5 h-5" />
          Repositories
          <Badge variant="secondary" className="ml-auto">{repos.length}</Badge>
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search repos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          {filteredRepos.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No repositories found</p>
          ) : (
            filteredRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => onSelectRepo(repo)}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                  selectedRepo?.id === repo.id ? 'bg-[#1EB053]/5 border-l-4 border-l-[#1EB053]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {repo.private ? (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span className="font-medium truncate">{repo.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-[#1EB053]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> {repo.forks_count}
                  </span>
                  {repo.language && (
                    <Badge variant="outline" className="text-[10px] h-5">{repo.language}</Badge>
                  )}
                  <span className="ml-auto">
                    {repo.updated_at && format(new Date(repo.updated_at), 'MMM d')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}