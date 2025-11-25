import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Star,
  Plus,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  MessageSquare,
  Calendar,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import PerformanceReviewDialog from "./PerformanceReviewDialog";

export default function EmployeePerformanceSection({ employee, currentEmployee, orgId, canEdit = false }) {
  const queryClient = useQueryClient();
  const [expandedReview, setExpandedReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['performanceReviews', employee?.id],
    queryFn: () => base44.entities.PerformanceReview.filter({ employee_id: employee?.id }, '-review_date'),
    enabled: !!employee?.id,
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      toast.success("Review updated");
      setFeedbackDialogOpen(false);
      setFeedback("");
    },
  });

  const handleAddFeedback = () => {
    if (!feedback.trim()) return;
    
    const existingComments = selectedReview.employee_comments || "";
    const newComment = `[${format(new Date(), 'MMM d, yyyy')} - ${currentEmployee?.full_name}]: ${feedback}`;
    const updatedComments = existingComments 
      ? `${existingComments}\n\n${newComment}` 
      : newComment;

    updateReviewMutation.mutate({
      id: selectedReview.id,
      data: { employee_comments: updatedComments }
    });
  };

  const handleDocumentUpload = async (reviewId, existingUrls = [], existingNames = []) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploadingDocs(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        updateReviewMutation.mutate({
          id: reviewId,
          data: { 
            document_urls: [...existingUrls, file_url],
            document_names: [...existingNames, file.name]
          }
        });
        toast.success("Document uploaded");
      } catch (error) {
        toast.error("Upload failed");
      } finally {
        setUploadingDocs(false);
      }
    };
    input.click();
  };

  const handleRemoveDocument = (reviewId, index, urls, names) => {
    const newUrls = urls.filter((_, i) => i !== index);
    const newNames = names.filter((_, i) => i !== index);
    
    updateReviewMutation.mutate({
      id: reviewId,
      data: { document_urls: newUrls, document_names: newNames }
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-600 bg-green-50";
    if (rating >= 3.5) return "text-blue-600 bg-blue-50";
    if (rating >= 2.5) return "text-gray-600 bg-gray-50";
    if (rating >= 1.5) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Outstanding";
    if (rating >= 3.5) return "Exceeds Expectations";
    if (rating >= 2.5) return "Meets Expectations";
    if (rating >= 1.5) return "Needs Improvement";
    return "Unsatisfactory";
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Performance Reviews
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setReviewDialogOpen(true)} className="bg-[#1EB053]">
              <Plus className="w-4 h-4 mr-1" />
              New Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#0072C6]">{reviews.length}</p>
              <p className="text-xs text-gray-500">Total Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1EB053]">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-sm font-medium">{getRatingLabel(averageRating)}</p>
              <p className="text-xs text-gray-500">Overall Performance</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No performance reviews yet</p>
          ) : (
            reviews.map((review) => (
              <Collapsible 
                key={review.id} 
                open={expandedReview === review.id}
                onOpenChange={(open) => setExpandedReview(open ? review.id : null)}
              >
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRatingColor(review.overall_rating)}`}>
                          <span className="text-lg font-bold">{review.overall_rating?.toFixed(1)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{review.review_period}</span>
                            <Badge variant={review.status === 'acknowledged' ? 'default' : review.status === 'submitted' ? 'secondary' : 'outline'}>
                              {review.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {review.review_date && format(new Date(review.review_date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {review.reviewer_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      {expandedReview === review.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t bg-gray-50/50">
                      {/* Ratings Breakdown */}
                      {review.ratings && (
                        <div className="pt-4">
                          <p className="text-sm font-medium mb-2">Ratings Breakdown</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(review.ratings).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                                <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}</span>
                                <div className="flex items-center gap-1">
                                  <Star className={`w-3 h-3 ${value >= 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                  <span className="font-medium">{value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.strengths && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-1">Strengths</p>
                            <p className="text-sm text-green-700">{review.strengths}</p>
                          </div>
                        )}
                        {review.areas_for_improvement && (
                          <div className="p-3 bg-amber-50 rounded-lg">
                            <p className="text-sm font-medium text-amber-800 mb-1">Areas for Improvement</p>
                            <p className="text-sm text-amber-700">{review.areas_for_improvement}</p>
                          </div>
                        )}
                      </div>

                      {review.goals && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">Goals</p>
                          <p className="text-sm text-blue-700">{review.goals}</p>
                        </div>
                      )}

                      {/* Employee Comments/Feedback */}
                      {review.employee_comments && (
                        <div className="p-3 bg-white rounded-lg border">
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Feedback & Comments
                          </p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.employee_comments}</p>
                        </div>
                      )}

                      {/* Documents */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Documents</p>
                          {canEdit && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDocumentUpload(review.id, review.document_urls || [], review.document_names || [])}
                              disabled={uploadingDocs}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              {uploadingDocs ? "Uploading..." : "Upload"}
                            </Button>
                          )}
                        </div>
                        {(review.document_urls?.length > 0) ? (
                          <div className="space-y-1">
                            {review.document_urls.map((url, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border text-sm">
                                <FileText className="w-4 h-4 text-[#0072C6]" />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 hover:underline text-[#0072C6]">
                                  {review.document_names?.[idx] || `Document ${idx + 1}`}
                                </a>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </a>
                                {canEdit && (
                                  <button 
                                    onClick={() => handleRemoveDocument(review.id, idx, review.document_urls, review.document_names || [])}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No documents attached</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedReview(review);
                            setFeedbackDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Add Feedback
                        </Button>
                        {review.status === 'submitted' && employee?.id === currentEmployee?.id && (
                          <Button 
                            size="sm"
                            onClick={() => updateReviewMutation.mutate({ id: review.id, data: { status: 'acknowledged' } })}
                          >
                            Acknowledge Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>

        {/* New Review Dialog */}
        <PerformanceReviewDialog 
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          employee={employee}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />

        {/* Add Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Feedback</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Your Feedback</Label>
              <Textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback or comments..."
                className="mt-1"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddFeedback}
                disabled={updateReviewMutation.isPending || !feedback.trim()}
                className="bg-[#1EB053]"
              >
                Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}