import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Github, Loader2, CheckCircle, ExternalLink, X } from "lucide-react";

export default function CreateIssueDialog({ 
  open, 
  onOpenChange, 
  selectedRepo,
  defaultTitle = "",
  defaultBody = "",
  defaultLabels = []
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState(defaultLabels);
  const [createdIssue, setCreatedIssue] = useState(null);

  React.useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setBody(defaultBody);
      setLabels(defaultLabels);
      setCreatedIssue(null);
    }
  }, [open, defaultTitle, defaultBody, defaultLabels]);

  const createMutation = useMutation({
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
    onSuccess: (data) => {
      setCreatedIssue(data);
      queryClient.invalidateQueries({ queryKey: ['githubIssues', selectedRepo?.full_name] });
      toast.success("Issue created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create issue: " + error.message);
    }
  });

  const handleAddLabel = (e) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      if (!labels.includes(labelInput.trim())) {
        setLabels([...labels, labelInput.trim()]);
      }
      setLabelInput("");
    }
  };

  const removeLabel = (label) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      labels: labels.filter(Boolean)
    });
  };

  const handleClose = () => {
    setCreatedIssue(null);
    setTitle("");
    setBody("");
    setLabels([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            {createdIssue ? "Issue Created!" : "Create Issue"}
          </DialogTitle>
        </DialogHeader>

        {createdIssue ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Issue #{createdIssue.number}</h3>
            <p className="text-gray-500 mb-4 line-clamp-2">{createdIssue.title}</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Repository</Label>
              <p className="text-sm text-gray-600 mt-1">{selectedRepo?.full_name}</p>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="body">Description</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the issue..."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={handleAddLabel}
                placeholder="Type label and press Enter"
                className="mt-1"
              />
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {labels.map((label) => (
                    <Badge key={label} variant="secondary" className="pr-1">
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1EB053]"
                disabled={createMutation.isPending || !title.trim()}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Issue
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}