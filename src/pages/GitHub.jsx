import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, GitCommit, GitPullRequest, GitBranch, ExternalLink } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import GitHubStats from "@/components/github/GitHubStats";
import GitHubRepoList from "@/components/github/GitHubRepoList";
import GitHubIssuesList from "@/components/github/GitHubIssuesList";
import GitHubCommitsList from "@/components/github/GitHubCommitsList";
import GitHubPRList from "@/components/github/GitHubPRList";
import GitHubQuickActions from "@/components/github/GitHubQuickActions";
import CreateIssueDialog from "@/components/github/CreateIssueDialog";

export default function GitHub() {
  const queryClient = useQueryClient();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("issues");

  // Fetch dashboard data (user + repos in one call)
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['githubDashboard'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getDashboard' });
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const githubUser = dashboardData?.user;
  const repos = dashboardData?.repos || [];

  // Fetch issues - only when tab is active
  const { data: issues = [], isLoading: issuesLoading, refetch: refetchIssues } = useQuery({
    queryKey: ['githubIssues', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getIssues', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && activeTab === 'issues',
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch commits - only when tab is active
  const { data: commits = [], isLoading: commitsLoading, refetch: refetchCommits } = useQuery({
    queryKey: ['githubCommits', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getCommits', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && activeTab === 'commits',
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch pull requests - only when tab is active
  const { data: pullRequests = [], isLoading: prsLoading, refetch: refetchPRs } = useQuery({
    queryKey: ['githubPRs', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getPullRequests', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && activeTab === 'prs',
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    if (activeTab === 'issues') refetchIssues();
    else if (activeTab === 'commits') refetchCommits();
    else if (activeTab === 'prs') refetchPRs();
  };

  if (dashboardLoading) {
    return <LoadingSpinner message="Connecting to GitHub..." />;
  }

  if (githubUser?.message || githubUser?.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">GitHub Connection Error</h2>
        <p className="text-gray-500 mt-2 max-w-md">{githubUser.message || githubUser.error}</p>
        <p className="text-sm text-gray-400 mt-4">Please check your GitHub token in settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GitHub"
        subtitle="Manage repositories, issues, and pull requests"
      />

      {/* User Header */}
      {githubUser && (
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={githubUser.avatar_url} 
                alt={githubUser.login}
                className="w-14 h-14 rounded-full border-2 border-white/20"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{githubUser.name || githubUser.login}</h3>
                <p className="text-gray-300 text-sm">@{githubUser.login}</p>
              </div>
              <a 
                href={githubUser.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <GitHubStats user={githubUser} repos={repos} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories */}
        <div className="lg:col-span-1">
          <GitHubRepoList 
            repos={repos} 
            selectedRepo={selectedRepo} 
            onSelectRepo={setSelectedRepo} 
          />
        </div>

        {/* Repo Details */}
        <Card className="lg:col-span-2">
          {selectedRepo ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-gray-400" />
                      {selectedRepo.name}
                      <a 
                        href={selectedRepo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#1EB053]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </CardTitle>
                    {selectedRepo.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {selectedRepo.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <GitHubQuickActions
                    selectedRepo={selectedRepo}
                    onNewIssue={() => setShowIssueDialog(true)}
                    onRefresh={handleRefresh}
                    isRefreshing={issuesLoading || commitsLoading || prsLoading}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-12">
                    <TabsTrigger 
                      value="issues" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] data-[state=active]:text-[#1EB053] h-12"
                    >
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      Issues
                      {issues.length > 0 && (
                        <span className="ml-1.5 text-xs bg-gray-100 px-1.5 rounded">
                          {issues.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commits" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] data-[state=active]:text-[#1EB053] h-12"
                    >
                      <GitCommit className="w-4 h-4 mr-1.5" />
                      Commits
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prs" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] data-[state=active]:text-[#1EB053] h-12"
                    >
                      <GitPullRequest className="w-4 h-4 mr-1.5" />
                      Pull Requests
                      {pullRequests.length > 0 && (
                        <span className="ml-1.5 text-xs bg-gray-100 px-1.5 rounded">
                          {pullRequests.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    <TabsContent value="issues" className="m-0">
                      <GitHubIssuesList issues={issues} isLoading={issuesLoading} />
                    </TabsContent>

                    <TabsContent value="commits" className="m-0">
                      <GitHubCommitsList commits={commits} isLoading={commitsLoading} />
                    </TabsContent>

                    <TabsContent value="prs" className="m-0">
                      <GitHubPRList pullRequests={pullRequests} isLoading={prsLoading} />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <GitBranch className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Select a Repository</h3>
              <p className="text-gray-500 text-sm mt-1">
                Choose a repository from the list to view details
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        open={showIssueDialog}
        onOpenChange={setShowIssueDialog}
        selectedRepo={selectedRepo}
      />
    </div>
  );
}