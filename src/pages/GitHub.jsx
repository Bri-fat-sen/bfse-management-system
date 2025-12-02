import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  GitFork,
  Eye,
  Plus,
  ExternalLink,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GitHub() {
  const queryClient = useQueryClient();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("issues");

  // Fetch GitHub user
  const { data: githubUser, isLoading: userLoading } = useQuery({
    queryKey: ['githubUser'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getUser' });
      return res.data;
    },
  });

  // Fetch repositories
  const { data: repos = [], isLoading: reposLoading } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getRepos' });
      return res.data;
    },
  });

  // Fetch issues for selected repo
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['githubIssues', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getIssues', owner, repo });
      return res.data;
    },
    enabled: !!selectedRepo,
  });

  // Fetch commits for selected repo
  const { data: commits = [], isLoading: commitsLoading } = useQuery({
    queryKey: ['githubCommits', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getCommits', owner, repo });
      return res.data;
    },
    enabled: !!selectedRepo,
  });

  // Fetch pull requests for selected repo
  const { data: pullRequests = [], isLoading: prsLoading } = useQuery({
    queryKey: ['githubPRs', selectedRepo?.full_name],
    queryFn: async () => {
      if (!selectedRepo) return [];
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getPullRequests', owner, repo });
      return res.data;
    },
    enabled: !!selectedRepo,
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async (issueData) => {
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { 
        action: 'createIssue', 
        owner, 
        repo, 
        issueData 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['githubIssues'] });
      setShowIssueDialog(false);
    },
  });

  const handleCreateIssue = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createIssueMutation.mutate({
      title: formData.get('title'),
      body: formData.get('body'),
      labels: formData.get('labels')?.split(',').map(l => l.trim()).filter(Boolean) || []
    });
  };

  if (userLoading || reposLoading) {
    return <LoadingSpinner message="Connecting to GitHub..." />;
  }

  if (githubUser?.message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">GitHub Connection Error</h2>
        <p className="text-gray-500 mt-2 max-w-md">{githubUser.message}</p>
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

      {/* User Info */}
      {githubUser && (
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={githubUser.avatar_url} 
                alt={githubUser.login}
                className="w-14 h-14 rounded-full border-2 border-white/20"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{githubUser.name || githubUser.login}</h3>
                <p className="text-gray-300 text-sm">@{githubUser.login}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold">{githubUser.public_repos}</p>
                  <p className="text-gray-400">Repos</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{githubUser.followers}</p>
                  <p className="text-gray-400">Followers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedRepo?.id === repo.id ? 'bg-[#1EB053]/10 border-l-4 border-l-[#1EB053]' : ''
                  }`}
                >
                  <p className="font-medium truncate">{repo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{repo.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks_count}
                    </span>
                    {repo.language && (
                      <Badge variant="outline" className="text-[10px]">{repo.language}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Repo Details */}
        <Card className="lg:col-span-2">
          {selectedRepo ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedRepo.name}
                      <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#1EB053]" />
                      </a>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedRepo.description}</p>
                  </div>
                  <Button 
                    onClick={() => setShowIssueDialog(true)}
                    className="bg-[#1EB053]"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" /> New Issue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger value="issues" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053]">
                      <AlertCircle className="w-4 h-4 mr-1" /> Issues ({issues.length})
                    </TabsTrigger>
                    <TabsTrigger value="commits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053]">
                      <GitCommit className="w-4 h-4 mr-1" /> Commits
                    </TabsTrigger>
                    <TabsTrigger value="prs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053]">
                      <GitPullRequest className="w-4 h-4 mr-1" /> PRs ({pullRequests.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="issues" className="p-4 max-h-[500px] overflow-y-auto">
                    {issuesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : issues.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No issues found</p>
                    ) : (
                      <div className="space-y-3">
                        {issues.map((issue) => (
                          <div key={issue.id} className="p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              {issue.state === 'open' ? (
                                <AlertCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <a 
                                  href={issue.html_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-medium hover:text-[#1EB053]"
                                >
                                  {issue.title}
                                </a>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>#{issue.number}</span>
                                  <span>by {issue.user?.login}</span>
                                  <span>{format(new Date(issue.created_at), 'MMM d, yyyy')}</span>
                                </div>
                                {issue.labels?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {issue.labels.map((label) => (
                                      <Badge 
                                        key={label.id} 
                                        style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
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
                    )}
                  </TabsContent>

                  <TabsContent value="commits" className="p-4 max-h-[500px] overflow-y-auto">
                    {commitsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {commits.map((commit) => (
                          <div key={commit.sha} className="p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <GitCommit className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <a 
                                  href={commit.html_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-medium hover:text-[#1EB053] line-clamp-1"
                                >
                                  {commit.commit?.message?.split('\n')[0]}
                                </a>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span className="font-mono">{commit.sha?.substring(0, 7)}</span>
                                  <span>by {commit.commit?.author?.name}</span>
                                  <span>{format(new Date(commit.commit?.author?.date), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="prs" className="p-4 max-h-[500px] overflow-y-auto">
                    {prsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : pullRequests.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No pull requests found</p>
                    ) : (
                      <div className="space-y-3">
                        {pullRequests.map((pr) => (
                          <div key={pr.id} className="p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <GitPullRequest className={`w-5 h-5 mt-0.5 ${
                                pr.state === 'open' ? 'text-green-500' : 
                                pr.merged_at ? 'text-purple-500' : 'text-red-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <a 
                                  href={pr.html_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-medium hover:text-[#1EB053]"
                                >
                                  {pr.title}
                                </a>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>#{pr.number}</span>
                                  <span>by {pr.user?.login}</span>
                                  <Badge variant={pr.state === 'open' ? 'default' : 'secondary'} className="text-[10px]">
                                    {pr.merged_at ? 'merged' : pr.state}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <GitBranch className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Select a Repository</h3>
              <p className="text-gray-500 text-sm mt-1">Choose a repository from the list to view details</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Create Issue Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Issue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input name="title" required className="mt-1" placeholder="Issue title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="body" className="mt-1" rows={4} placeholder="Describe the issue..." />
            </div>
            <div>
              <Label>Labels (comma separated)</Label>
              <Input name="labels" className="mt-1" placeholder="bug, enhancement, help wanted" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowIssueDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1EB053]" disabled={createIssueMutation.isPending}>
                {createIssueMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Issue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}