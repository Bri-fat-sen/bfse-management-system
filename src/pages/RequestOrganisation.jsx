import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, CheckCircle2, Clock, XCircle, Send, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RequestOrganisation() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [requestedRole, setRequestedRole] = useState("read_only");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organisations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => base44.entities.Organisation.filter({ status: 'active' }),
  });

  const { data: existingRequests = [] } = useQuery({
    queryKey: ['myJoinRequests', user?.email],
    queryFn: () => base44.entities.OrganisationJoinRequest.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const createRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.OrganisationJoinRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJoinRequests'] });
      toast.success("Request Sent", "Your request has been sent to the organisation admins");
      setSelectedOrg(null);
      setMessage("");
      setRequestedRole("read_only");
    },
    onError: (error) => {
      toast.error("Request Failed", error.message);
    }
  });

  if (!user) {
    return <LoadingSpinner message="Loading..." />;
  }

  const filteredOrgs = organisations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    createRequestMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      organisation_id: selectedOrg.id,
      organisation_name: selectedOrg.name,
      requested_role: requestedRole,
      message: message,
      status: "pending"
    });
  };

  const pendingRequest = existingRequests.find(r => r.status === 'pending' && r.organisation_id === selectedOrg?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-1 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <Card className="border-t-4 border-t-[#1EB053]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1EB053]" />
            Request to Join Organisation
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select an organisation to request access. An admin will review and approve your request.
          </p>
        </CardHeader>
      </Card>

      {existingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{req.organisation_name}</p>
                    <p className="text-xs text-gray-500">Role: {req.requested_role}</p>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {req.status === 'approved' && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                )}
                {req.status === 'rejected' && (
                  <Badge className="bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Organisation</CardTitle>
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organisations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orgsLoading ? (
            <p className="text-center text-gray-500 py-8">Loading organisations...</p>
          ) : filteredOrgs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No organisations found</p>
          ) : (
            <div className="grid gap-3">
              {filteredOrgs.map(org => {
                const hasRequest = existingRequests.some(r => r.organisation_id === org.id && r.status === 'pending');
                return (
                  <button
                    key={org.id}
                    onClick={() => !hasRequest && setSelectedOrg(org)}
                    disabled={hasRequest}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedOrg?.id === org.id
                        ? 'border-[#1EB053] bg-green-50'
                        : hasRequest
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#0072C6] hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-10 h-10 object-contain rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{org.name}</p>
                        {org.code && <p className="text-xs text-gray-500">Code: {org.code}</p>}
                      </div>
                      {hasRequest && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrg && !pendingRequest && (
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader>
            <CardTitle className="text-base">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Requesting Role</Label>
                <Select value={requestedRole} onValueChange={setRequestedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read_only">Read Only - View access only</SelectItem>
                    <SelectItem value="support_staff">Support Staff - Basic access</SelectItem>
                    <SelectItem value="retail_cashier">Retail Cashier - Sales access</SelectItem>
                    <SelectItem value="warehouse_manager">Warehouse Manager - Inventory access</SelectItem>
                    <SelectItem value="driver">Driver - Transport access</SelectItem>
                    <SelectItem value="vehicle_sales">Vehicle Sales - Sales access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Message to Admin (Optional)</Label>
                <Textarea
                  placeholder="Explain why you'd like to join this organisation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrg(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createRequestMutation.isPending ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}