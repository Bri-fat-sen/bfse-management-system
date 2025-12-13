import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Clock, XCircle, ArrowRight, Users, Mail, User, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";

export default function JoinOrganisation() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [requestedRole, setRequestedRole] = useState("read_only");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organisations = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['activeOrganisations'],
    queryFn: () => base44.entities.Organisation.filter({ status: 'active' }),
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['myJoinRequests', user?.email],
    queryFn: () => base44.entities.OrganisationJoinRequest.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const createRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.OrganisationJoinRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJoinRequests'] });
      toast.success("Request Sent", "Your join request has been submitted for approval");
      setSelectedOrg(null);
      setNotes("");
    },
    onError: (error) => {
      toast.error("Request Failed", error.message);
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (id) => base44.entities.OrganisationJoinRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJoinRequests'] });
      toast.success("Request Cancelled");
    },
  });

  if (!user) {
    return <LoadingSpinner message="Loading..." />;
  }

  const handleSubmitRequest = () => {
    if (!selectedOrg) return;

    createRequestMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      organisation_id: selectedOrg.id,
      organisation_name: selectedOrg.name,
      requested_role: requestedRole,
      notes: notes || undefined,
      status: "pending",
    });
  };

  const filteredOrgs = organisations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected');

  const roleOptions = [
    { value: "read_only", label: "Read Only" },
    { value: "support_staff", label: "Support Staff" },
    { value: "retail_cashier", label: "Retail Cashier" },
    { value: "vehicle_sales", label: "Vehicle Sales" },
    { value: "driver", label: "Driver" },
    { value: "warehouse_manager", label: "Warehouse Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "hr_admin", label: "HR Admin" },
    { value: "payroll_admin", label: "Payroll Admin" },
  ];

  const [useCode, setUseCode] = useState(false);
  const [orgCode, setOrgCode] = useState("");
  const [foundOrg, setFoundOrg] = useState(null);

  const handleFindByCode = () => {
    if (!orgCode.trim()) return;
    const org = organisations.find(o => o.code?.toUpperCase() === orgCode.toUpperCase());
    if (org) {
      setFoundOrg(org);
      setSelectedOrg(org);
    } else {
      toast.error("Not Found", "No organisation found with that code");
      setFoundOrg(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex h-1 rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Join an Organisation</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Request to join an active organisation</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* My Requests Status */}
          {myRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                My Requests
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-900">{req.organisation_name}</p>
                        <p className="text-xs text-gray-600">Pending approval • {req.requested_role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelRequestMutation.mutate(req.id)}
                      disabled={cancelRequestMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
                {approvedRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{req.organisation_name}</p>
                      <p className="text-xs text-gray-600">Approved • Refresh to access</p>
                    </div>
                  </div>
                ))}
                {rejectedRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{req.organisation_name}</p>
                      <p className="text-xs text-gray-600">Rejected • {req.rejection_reason || 'No reason provided'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join Method Selection */}
          {!selectedOrg && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant={!useCode ? "default" : "outline"}
                onClick={() => setUseCode(false)}
                className={!useCode ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white" : ""}
              >
                Browse All
              </Button>
              <Button
                variant={useCode ? "default" : "outline"}
                onClick={() => setUseCode(true)}
                className={useCode ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white" : ""}
              >
                Use Code
              </Button>
            </div>
          )}

          {/* Organisation Selection */}
          {!selectedOrg ? (
            <div className="space-y-4">
              {useCode ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg p-6 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Organisation Code</h3>
                    <p className="text-sm text-gray-600 mb-4">Ask your administrator for the organisation code</p>
                    <div className="flex gap-2 max-w-md mx-auto">
                      <Input
                        value={orgCode}
                        onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                        placeholder="e.g. ABC123"
                        className="font-mono text-center text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleFindByCode()}
                      />
                      <Button
                        onClick={handleFindByCode}
                        className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                      >
                        Find
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Search Organisations</Label>
                    <Input
                      placeholder="Search by name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {loadingOrgs ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">Loading organisations...</div>
                ) : filteredOrgs.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">No organisations found</div>
                ) : (
                  filteredOrgs.map((org) => {
                    const hasPendingRequest = pendingRequests.some(r => r.organisation_id === org.id);
                    return (
                      <button
                        key={org.id}
                        onClick={() => !hasPendingRequest && setSelectedOrg(org)}
                        disabled={hasPendingRequest}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          hasPendingRequest
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                            : 'bg-white border-gray-200 hover:border-[#1EB053] hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="w-10 h-10 rounded object-contain bg-white border" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold">
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{org.name}</p>
                            <p className="text-xs text-gray-500">{org.code}</p>
                            {org.city && <p className="text-xs text-gray-400 mt-1">{org.city}</p>}
                            {hasPendingRequest && (
                              <Badge className="mt-2 bg-amber-100 text-amber-800 text-xs">Request Pending</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedOrg.logo_url ? (
                      <img src={selectedOrg.logo_url} alt={selectedOrg.name} className="w-12 h-12 rounded object-contain bg-white border" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg">
                        {selectedOrg.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedOrg.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrg.code}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrg(null)}>
                    Change
                  </Button>
                </div>
              </div>

              <div>
                <Label>Requested Role</Label>
                <Select value={requestedRole} onValueChange={setRequestedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Final role will be assigned by administrator upon approval</p>
              </div>

              <div>
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Tell them why you want to join..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 h-24"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrg(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={createRequestMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                >
                  {createRequestMutation.isPending ? "Sending..." : "Submit Request"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}