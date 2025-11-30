import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, Printer, Clock, CheckCircle2, 
  XCircle, AlertCircle, User, Calendar, History
} from "lucide-react";
import { format } from "date-fns";
import { SL_DOCUMENT_STYLES, DOCUMENT_TYPE_INFO } from "./DocumentTemplates";
import DocumentVersionHistory from "./DocumentVersionHistory";

const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Clock, color: "bg-gray-100 text-gray-800" },
  pending_signature: { label: "Pending Signature", icon: AlertCircle, color: "bg-amber-100 text-amber-800" },
  signed: { label: "Signed", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", icon: Clock, color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-gray-100 text-gray-600" }
};

export default function DocumentViewer({ document, onClose, onRevert, isReverting, canRevert = true }) {
  const printRef = useRef();
  const statusConfig = STATUS_CONFIG[document?.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document?.title}</title>
        <style>
          ${SL_DOCUMENT_STYLES}
          body { margin: 0; padding: 20px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${document?.content}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document?.title}</title>
        <style>${SL_DOCUMENT_STYLES}</style>
      </head>
      <body>
        ${document?.content}
      </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document?.title?.replace(/\s+/g, '_')}.html`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!document) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{document.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">
                {DOCUMENT_TYPE_INFO[document.document_type]?.label || document.document_type}
              </Badge>
              <Badge variant="outline" className="bg-[#0072C6]/5 text-[#0072C6] border-[#0072C6]/20">
                <History className="w-3 h-3 mr-1" />
                v{document.version || 1}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-500">Employee</p>
            <p className="font-medium flex items-center gap-1">
              <User className="w-3 h-3" />
              {document.employee_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Issued By</p>
            <p className="font-medium">{document.issued_by_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Issued Date</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {document.issued_at ? format(new Date(document.issued_at), 'MMM d, yyyy') : '-'}
            </p>
          </div>
          {document.signed_at && (
            <div>
              <p className="text-gray-500">Signed Date</p>
              <p className="font-medium text-green-600">
                {format(new Date(document.signed_at), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        {document.signature_name && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              Digitally signed by <strong>{document.signature_name}</strong> on {format(new Date(document.signed_at), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {document.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <XCircle className="w-4 h-4 inline mr-1" />
              Rejected: {document.rejection_reason}
            </p>
          </div>
        )}
      </div>

      {/* Document content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6" ref={printRef}>
          <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
          <div 
            className="bg-white border rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
          
          {/* Version History Section */}
          <DocumentVersionHistory 
            document={document}
            onRevert={onRevert}
            isReverting={isReverting}
            canRevert={canRevert}
          />
        </div>
      </ScrollArea>
    </div>
  );
}