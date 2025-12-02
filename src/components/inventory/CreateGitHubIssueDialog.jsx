import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Github, Loader2, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

export default function CreateGitHubIssueDialog({
  open,
  onOpenChange,
  issueType = "alert", // "alert" or "reorder"
  data = null, // alert or suggestion data
}) {
  const [selectedRepo, setSelectedRepo] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labels, setLabels] = useState("inventory");
  const [createdIssue, setCreatedIssue] = useState(null);

  // Fetch repositories
  const { data: repos = [], isLoading: reposLoading } = useQuery({
    queryKey: ['githubReposForIssue'],
    queryFn: async () => {
      const res = await base44.functions.invoke('github', { action: 'getRepos' });
      return res.data;
    },
    enabled: open,
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async ({ owner, repo, issueData }) => {
      const res = await base44.functions.invoke('github', {
        action: 'createIssue',
        owner,
        repo,
        issueData
      });
      return res.data;
    },
    onSuccess: (issueData) => {
      setCreatedIssue(issueData);
      toast.success("GitHub issue created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create issue: " + error.message);
    }
  });

  // Generate default title and body based on type
  React.useEffect(() => {
    if (!data || !open) return;

    if (issueType === "alert") {
      const alertTypeLabel = {
        low_stock: "Low Stock",
        out_of_stock: "Out of Stock",
        overstock: "Overstock",
        expiring_soon: "Expiring Soon",
        expired: "Expired"
      }[data.alert_type] || "Stock Alert";

      setTitle(`[Inventory] ${alertTypeLabel}: ${data.product_name}`);
      setBody(`## Stock Alert

**Product:** ${data.product_name}
**Alert Type:** ${alertTypeLabel}
**Warehouse:** ${data.warehouse_name || 'Main Warehouse'}

### Details
- **Current Quantity:** ${data.current_quantity}
- **Threshold:** ${data.threshold_quantity}
${data.batch_number ? `- **Batch:** ${data.batch_number}` : ''}
${data.expiry_date ? `- **Expiry Date:** ${data.expiry_date}` : ''}

### Action Required
Please review and take appropriate action to resolve this stock alert.

---
*Created from inventory management system*`);
      setLabels("inventory,alert," + data.alert_type.replace('_', '-'));
    } else if (issueType === "reorder") {
      const priorityEmoji = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🔵"
      }[data.priority] || "";

      setTitle(`[Reorder] ${priorityEmoji} ${data.product_name} - ${data.priority} priority`);
      setBody(`## Reorder Suggestion

**Product:** ${data.product_name}
**Priority:** ${data.priority.toUpperCase()}

### Stock Status
- **Current Stock:** ${data.current_stock} units
- **Reorder Point:** ${data.reorder_point} units
- **Days of Stock Remaining:** ${data.days_of_stock === 999 ? 'N/A' : data.days_of_stock + ' days'}
- **Average Daily Sales:** ${data.avg_daily_sales} units/day

### Recommendation
- **Suggested Order Quantity:** ${data.suggested_quantity} units
- **Estimated Cost:** Le ${(data.estimated_cost || 0).toLocaleString()}
- **Lead Time:** ${data.lead_time_days} days
${data.supplier_name ? `- **Preferred Supplier:** ${data.supplier_name}` : ''}

### Action Required
Create a purchase order to replenish stock before it runs out.

---
*Created from inventory management system*`);
      setLabels("inventory,reorder," + data.priority);
    }
  }, [data, issueType, open]);

  const handleSubmit = () => {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }

    const [owner, repo] = selectedRepo.split('/');
    createIssueMutation.mutate({
      owner,
      repo,
      issueData: {
        title,
        body,
        labels: labels.split(',').map(l => l.trim()).filter(Boolean)
      }
    });
  };

  const handleClose = () => {
    setCreatedIssue(null);
    setSelectedRepo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Create GitHub Issue
          </DialogTitle>
        </DialogHeader>

        {createdIssue ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Issue Created!</h3>
            <p className="text-gray-500 mb-4">
              Issue #{createdIssue.number} has been created in {selectedRepo}
            </p>
            <a
              href={createdIssue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#1EB053] hover:underline"
            >
              View on GitHub <ExternalLink className="w-4 h-4" />
            </a>
            <div className="mt-6">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label>Repository *</Label>
                {reposLoading ? (
                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading repositories...
                  </div>
                ) : repos.length === 0 ? (
                  <div className="flex items-center gap-2 mt-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    No repositories found. Check your GitHub token.
                  </div>
                ) : (
                  <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repos.map((repo) => (
                        <SelectItem key={repo.id} value={repo.full_name}>
                          {repo.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  placeholder="Issue title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1"
                  rows={8}
                  placeholder="Issue description..."
                />
              </div>

              <div>
                <Label>Labels (comma separated)</Label>
                <Input
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="mt-1"
                  placeholder="bug, enhancement, inventory"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {labels.split(',').map((label, i) => (
                    label.trim() && (
                      <Badge key={i} variant="outline" className="text-xs">
                        {label.trim()}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gray-900 hover:bg-gray-800"
                disabled={createIssueMutation.isPending || !selectedRepo || !title}
              >
                {createIssueMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                Create Issue
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}