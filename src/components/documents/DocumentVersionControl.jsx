import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Clock, User, RotateCcw, Eye, FileText, CheckCircle2, AlertCircle
} from "lucide-react";

export default function DocumentVersionControl({ 
  document, 
  open, 
  onOpenChange,
  onRevert,
  isReverting = false
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!document) return null;

  const allVersions = [
    {
      version: document.version || 1,
      content: document.content,
      variables: document.variables,
      status: document.status,
      updated_by_name: document.issued_by_name || 'System',
      updated_at: document.updated_date || document.created_date,
      change_reason: 'Current Version',
      is_current: true
    },
    ...(document.version_history || [])
  ].sort((a, b) => b.version - a.version);

  const handleRevert = (version) => {
    if (onRevert) {
      onRevert(version);
      setSelectedVersion(null);
      setShowPreview(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0072C6]" />
              Document Version History
            </DialogTitle>
            <p className="text-sm text-gray-500">
              {document.title} • {allVersions.length} version(s)
            </p>
          </DialogHeader>

          <div className="flex h-1 w-full">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-4">
              {allVersions.map((version, idx) => (
                <div 
                  key={idx}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    version.is_current 
                      ? 'border-[#1EB053] bg-gradient-to-r from-[#1EB053]/5 to-[#1EB053]/10' 
                      : 'border-gray-200 hover:border-[#0072C6]/30 hover:shadow-md'
                  }`}
                >
                  {version.is_current && (
                    <div className="flex h-0.5 w-full">
                      <div className="flex-1 bg-[#1EB053]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#0072C6]" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          version.is_current 
                            ? 'bg-gradient-to-br from-[#1EB053] to-[#15803d] text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className="text-sm font-bold">v{version.version}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#0F1F3C]">
                              Version {version.version}
                            </h4>
                            {version.is_current && (
                              <Badge className="bg-[#1EB053] text-white border-0 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>Updated by {version.updated_by_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{format(new Date(version.updated_at), 'MMM d, yyyy HH:mm')}</span>
                            </div>
                            {version.change_reason && (
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-xs italic">{version.change_reason}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {version.status}
                            </Badge>
                            {Object.keys(version.variables || {}).length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {Object.keys(version.variables).length} variables
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowPreview(true);
                          }}
                          className="text-[#0072C6]"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        {!version.is_current && document.status !== 'signed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevert(version)}
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
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex h-1 w-full">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Preview Dialog */}
      {selectedVersion && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0072C6]" />
                Version {selectedVersion.version} Preview
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Updated {format(new Date(selectedVersion.updated_at), 'MMM d, yyyy HH:mm')} by {selectedVersion.updated_by_name}
              </p>
            </DialogHeader>

            <div className="flex h-1 w-full">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>

            <ScrollArea className="max-h-[70vh]">
              <div 
                className="bg-gray-50 p-6"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </ScrollArea>

            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <div className="flex h-1.5 w-12 rounded-full overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                {!selectedVersion.is_current && document.status !== 'signed' && (
                  <Button
                    onClick={() => {
                      handleRevert(selectedVersion);
                      setShowPreview(false);
                    }}
                    disabled={isReverting}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {isReverting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reverting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Revert to This Version
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}