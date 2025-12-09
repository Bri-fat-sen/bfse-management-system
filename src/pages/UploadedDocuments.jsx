import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  Truck,
  Clock,
  FileUp,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function UploadedDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all uploaded documents from various entities
  const { data: expenses = [] } = useQuery({
    queryKey: ['expensesWithReceipts', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employeeDocuments = [] } = useQuery({
    queryKey: ['employeeDocuments', orgId],
    queryFn: () => base44.entities.EmployeeDocument.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  if (!user) {
    return <LoadingSpinner message="Loading..." fullScreen={true} />;
  }

  // Compile all documents with metadata
  const allDocuments = [
    ...expenses.filter(e => e.receipt_url).map(e => ({
      id: e.id,
      type: "Expense Receipt",
      name: e.description || "Expense",
      url: e.receipt_url,
      date: e.date || e.created_date,
      uploadedBy: e.recorded_by_name,
      amount: e.amount,
      category: e.category,
      icon: DollarSign,
    })),
    ...employeeDocuments.map(d => ({
      id: d.id,
      type: "Employee Document",
      name: d.document_name || d.document_type,
      url: d.document_url,
      date: d.upload_date || d.created_date,
      uploadedBy: d.uploaded_by_name,
      icon: FileText,
    })),
  ];

  const filteredDocuments = allDocuments
    .filter(doc => typeFilter === "all" || doc.type === typeFilter)
    .filter(doc => !searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
            <FileUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
            Document Archive
          </h1>
          <p className="text-sm text-gray-500 mt-1">View all uploaded documents</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-l-4 border-l-[#0072C6]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Documents</p>
              <p className="text-3xl font-bold text-[#0072C6]">{allDocuments.length}</p>
            </div>
            <FileText className="w-12 h-12 text-[#0072C6] opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Expense Receipt">Expense Receipts</SelectItem>
                <SelectItem value="Employee Document">Employee Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Documents Found"
              description="No documents match the current filters"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map(doc => {
                    const Icon = doc.icon;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell className="text-sm">
                          {doc.date ? format(new Date(doc.date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600">
                          {doc.uploadedBy || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}