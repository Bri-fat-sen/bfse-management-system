import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Eye, 
  RotateCcw, 
  Clock, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { SL_DOCUMENT_STYLES } from "./DocumentTemplates";

export default function DocumentVersionHistory({ 
  document, 
  onRevert, 
  isReverting = false,
  canRevert = true 
}) {
  const [previewVersion, setPreviewVersion] = useState(null);
  const [confirmRevert, setConfirmRevert] = useState(null);

  const versions = document?.version_history || [];
  const currentVersion = document?.version || 1;

  const allVersions = [
    {
      version: currentVersion,
      content: document?.content,
      variables: document?.variables,
      status: document?.status,
      updated_by_name: document?.issued_by_name || 'System',
      updated_at: document?.updated_date || document?.created_date,
      change_reason: 'Current version',
      isCurrent: true
    },
    ...versions.sort((a, b) => b.version - a.version)
  ];

  const confirmRevertAction = () => {
    if (confirmRevert && onRevert) {
      onRevert(confirmRevert);
    }
    setConfirmRevert(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
      pending_signature: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
      signed: { label: 'Signed', class: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
      expired: { label: 'Expired', class: 'bg-gray-100 text-gray-600' },
      cancelled: { label: 'Cancelled', class: 'bg-gray-100 text-gray-600' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={`${config.class} border-0`}>{config.label}</Badge>;
  };

  if (versions.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
            <History className="w-4 h-4 text-[#0072C6]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#0F1F3C]">Version History</h4>
            <p className="text-xs text-gray-500">Track changes to this document</p>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No previous versions</p>
          <p className="text-gray-400 text-xs mt-1">This is the original document (v1)</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
              <History className="w-4 h-4 text-[#0072C6]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0F1F3C]">Version History</h4>
              <p className="text-xs text-gray-500">{allVersions.length} version(s) available</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Current: v{currentVersion}
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="divide-y">
            {allVersions.map((ver) => (
              <div 
                key={ver.version} 
                className={`p-4 transition-colors ${ver.isCurrent ? 'bg-[#1EB053]/5' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      ver.isCurrent 
                        ? 'bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      v{ver.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ver.isCurrent && (
                          <Badge className="bg-[#1EB053] text-white border-0 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Current
                          </Badge>
                        )}
                        {getStatusBadge(ver.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ver.updated_by_name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ver.updated_at ? format(new Date(ver.updated_at), 'MMM d, yyyy h:mm a') : 'N/A'}
                        </span>
                      </div>
                      {ver.change_reason && !ver.isCurrent && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 px-2 py-1 rounded">
                          {ver.change_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewVersion(ver)}
                      className="text-[#0072C6] hover:text-[#0072C6] hover:bg-[#0072C6]/10"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {!ver.isCurrent && canRevert && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmRevert(ver)}
                        disabled={isReverting}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Version Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <span>Version {previewVersion?.version}</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  {previewVersion?.updated_at && format(new Date(previewVersion.updated_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              {previewVersion?.isCurrent && (
                <Badge className="bg-[#1EB053] text-white ml-2">Current</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4">
              <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
              <div 
                className="bg-white border rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{ __html: previewVersion?.content || '' }}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Close
            </Button>
            {!previewVersion?.isCurrent && canRevert && (
              <Button 
                onClick={() => {
                  setConfirmRevert(previewVersion);
                  setPreviewVersion(null);
                }}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Revert to This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Revert Dialog */}
      <Dialog open={!!confirmRevert} onOpenChange={() => setConfirmRevert(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Revert
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to revert to <strong>Version {confirmRevert?.version}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The current version will be saved in the version history before reverting.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRevert(null)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRevertAction}
              disabled={isReverting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isReverting ? 'Reverting...' : 'Yes, Revert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}