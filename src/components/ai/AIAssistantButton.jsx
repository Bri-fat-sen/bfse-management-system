import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Copy, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function AIAssistantButton({ 
  data, 
  context = {}, 
  promptType = "general",
  buttonLabel = "Ask AI",
  buttonVariant = "outline",
  size = "sm"
}) {
  const [open, setOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSystemPrompt = () => {
    switch (promptType) {
      case 'financial':
        return `You are a financial analyst assistant. Analyze the following business financial data and answer questions about revenue, expenses, profitability, and financial health. Be specific, use numbers, and provide actionable insights.`;
      case 'hr':
        return `You are an HR analytics assistant. Analyze employee performance data, attendance, and workforce metrics. Provide insights about team performance, training needs, and HR optimization.`;
      case 'inventory':
        return `You are an inventory management assistant. Analyze stock levels, sales trends, and provide recommendations for reordering, stock optimization, and preventing stockouts.`;
      case 'transport':
        return `You are a transport operations assistant. Analyze trip data, routes, fuel costs, and vehicle performance. Provide recommendations for route optimization and cost reduction.`;
      default:
        return `You are a business intelligence assistant. Analyze the provided data and answer questions with specific, actionable insights.`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    setIsLoading(true);
    try {
      const systemPrompt = getSystemPrompt();
      const fullPrompt = `${systemPrompt}

Business Data:
${JSON.stringify(data, null, 2)}

Additional Context:
${JSON.stringify(context, null, 2)}

User Question: ${userQuestion}

Provide a clear, concise answer with specific numbers and actionable recommendations. Format your response in markdown.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
      });

      setResponse(result);
    } catch (error) {
      toast.error("Failed to get AI response", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={size}
        onClick={() => setOpen(true)}
        className="border-purple-300 hover:border-purple-500 hover:bg-purple-50"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              AI Business Assistant
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Ask questions about your data and get instant insights
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask anything... e.g., 'What are my top selling products?' or 'Why did expenses spike last week?'"
                className="min-h-24"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={isLoading || !userQuestion.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </form>

          {response && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">AI Response</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}