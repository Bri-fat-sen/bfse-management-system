import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Star, GitFork, Eye, AlertCircle, GitPullRequest } from "lucide-react";

export default function GitHubStats({ user, repos = [] }) {
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalWatchers = repos.reduce((sum, r) => sum + (r.watchers_count || 0), 0);

  const stats = [
    { label: "Repositories", value: user?.public_repos || repos.length, icon: GitBranch, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Stars", value: totalStars, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Total Forks", value: totalForks, icon: GitFork, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Followers", value: user?.followers || 0, icon: Eye, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}