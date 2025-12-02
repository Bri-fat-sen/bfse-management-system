import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  LayoutGrid,
  Star,
  GitFork,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle,
  Search,
  Plus,
  Settings,
  Bell,
  Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateIssueDialog from "@/components/github/CreateIssueDialog";
import GitHubIssuesList from "@/components/github/GitHubIssuesList";
import GitHubCommitsList from "@/components/github/GitHubCommitsList";
import GitHubPRList from "@/components/github/GitHubPRList";

export default function GitHubIntegration() {
  const queryClient = useQueryClient();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoTab, setRepoTab] = useState("issues");
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch dashboard data
  const { data: dashboard, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['githubDashboard'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getDashboard' });
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const user = dashboard?.user;
  const repos = dashboard?.repos || [];
  const projects = dashboard?.projects || [];

  // Fetch repo details when selected
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['githubIssues', selectedRepo?.full_name],
    queryFn: async () => {
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getIssues', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && repoTab === 'issues',
    staleTime: 60 * 1000,
  });

  const { data: commits = [], isLoading: commitsLoading } = useQuery({
    queryKey: ['githubCommits', selectedRepo?.full_name],
    queryFn: async () => {
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getCommits', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && repoTab === 'commits',
    staleTime: 60 * 1000,
  });

  const { data: pullRequests = [], isLoading: prsLoading } = useQuery({
    queryKey: ['githubPRs', selectedRepo?.full_name],
    queryFn: async () => {
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await base44.functions.invoke('github', { action: 'getPullRequests', owner, repo });
      return res.data || [];
    },
    enabled: !!selectedRepo && repoTab === 'prs',
    staleTime: 60 * 1000,
  });

  const filteredRepos = repos.filter(r => 
    r?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (user?.message || !user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">GitHub Not Connected</h3>
          <p className="text-gray-500 mb-4">Add your GitHub token in Settings to enable this integration.</p>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" /> Go to Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Card */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-white/20" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name || user.login}</h2>
              <p className="text-gray-300">@{user.login}</p>
              {user.bio && <p className="text-sm text-gray-400 mt-1">{user.bio}</p>}
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{user.public_repos}</p>
                <p className="text-xs text-gray-400">Repos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user.followers}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user.following}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitBranch className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{repos.length}</p>
              <p className="text-xs text-gray-500">Repositories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{repos.reduce((s, r) => s + (r.open_issues_count || 0), 0)}</p>
              <p className="text-xs text-gray-500">Open Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{repos.reduce((s, r) => s + (r.stargazers_count || 0), 0)}</p>
              <p className="text-xs text-gray-500">Total Stars</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-gray-500">Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repo List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Repositories
              </span>
              <Badge variant="secondary">{repos.length}</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                    selectedRepo?.id === repo.id ? 'bg-[#1EB053]/5 border-l-4 border-l-[#1EB053]' : ''
                  }`}
                >
                  <p className="font-medium truncate">{repo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{repo.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks_count}</span>
                    {repo.language && <Badge variant="outline" className="text-[10px] h-4">{repo.language}</Badge>}
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
              <CardHeader className="border-b pb-4">
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
                  <Button onClick={() => setShowNewIssue(true)} size="sm" className="bg-[#1EB053]">
                    <Plus className="w-4 h-4 mr-1" /> New Issue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={repoTab} onValueChange={setRepoTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-12">
                    <TabsTrigger value="issues" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] h-12">
                      <AlertCircle className="w-4 h-4 mr-1" /> Issues
                    </TabsTrigger>
                    <TabsTrigger value="commits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] h-12">
                      <GitCommit className="w-4 h-4 mr-1" /> Commits
                    </TabsTrigger>
                    <TabsTrigger value="prs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1EB053] h-12">
                      <GitPullRequest className="w-4 h-4 mr-1" /> PRs
                    </TabsTrigger>
                  </TabsList>
                  <div className="p-4 max-h-[450px] overflow-y-auto">
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
            <CardContent className="flex flex-col items-center justify-center py-16">
              <GitBranch className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Select a Repository</h3>
              <p className="text-gray-500 text-sm">Choose from the list to view details</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Automations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            GitHub Automations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600" /></div>
                <div>
                  <p className="font-medium">Create issue on low stock alert</p>
                  <p className="text-xs text-gray-500">Auto-create GitHub issues when stock falls below threshold</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><Bell className="w-4 h-4 text-orange-600" /></div>
                <div>
                  <p className="font-medium">Create issue on reorder suggestion</p>
                  <p className="text-xs text-gray-500">Auto-create issues for products needing reorder</p>
                </div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><LayoutGrid className="w-4 h-4 text-purple-600" /></div>
                <div>
                  <p className="font-medium">Add issues to project board</p>
                  <p className="text-xs text-gray-500">Auto-add created issues to your selected project</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateIssueDialog
        open={showNewIssue}
        onOpenChange={setShowNewIssue}
        selectedRepo={selectedRepo}
      />
    </div>
  );
}