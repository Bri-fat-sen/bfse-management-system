import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Building2, Plus, Edit, Trash2, Users, CheckCircle, XCircle, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SuperAdminPanel() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sierra Leone",
    status: "active",
    owner_name: "",
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organisations = [], isLoading } = useQuery({
    queryKey: ['allOrganisations'],
    queryFn: () => base44.asServiceRole.entities.Organisation.list(),
    enabled: user?.role === 'admin',
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['allEmployees'],
    queryFn: () => base44.asServiceRole.entities.Employee.list(),
    enabled: user?.role === 'admin',
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Organisation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrganisations'] });
      toast.success("Organisation Created", "New organisation has been created successfully");
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Creation Failed", error.message);
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.Organisation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrganisations'] });
      toast.success("Organisation Updated");
      setEditingOrg(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Update Failed", error.message);
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.Organisation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrganisations'] });
      toast.success("Organisation Deleted");
    },
    onError: (error) => {
      toast.error("Deletion Failed", error.message);
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This panel is only accessible to super administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading Super Admin Panel..." />;
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Sierra Leone",
      status: "active",
      owner_name: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("Missing Fields", "Organisation name and code are required");
      return;
    }

    // Check if code already exists
    const codeExists = organisations.some(org => 
      org.code?.toLowerCase() === formData.code.toLowerCase() && org.id !== editingOrg?.id
    );
    if (codeExists) {
      toast.error("Code Exists", "This organisation code is already in use");
      return;
    }

    if (editingOrg) {
      updateOrgMutation.mutate({ id: editingOrg.id, data: formData });
    } else {
      createOrgMutation.mutate(formData);
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || "",
      code: org.code || "",
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
      city: org.city || "",
      country: org.country || "Sierra Leone",
      status: org.status || "active",
      owner_name: org.owner_name || "",
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (org) => {
    const orgEmployees = employees.filter(e => e.organisation_id === org.id);
    if (orgEmployees.length > 0) {
      if (!confirm(`This organisation has ${orgEmployees.length} employees. Are you sure you want to delete it?`)) {
        return;
      }
    }
    deleteOrgMutation.mutate(org.id);
  };

  const filteredOrgs = organisations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOrgEmployeeCount = (orgId) => {
    return employees.filter(e => e.organisation_id === orgId).length;
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    suspended: "bg-red-100 text-red-800",
  };

  const statusIcons = {
    active: CheckCircle,
    pending: AlertTriangle,
    suspended: XCircle,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-1 flex rounded-full overflow-hidden">
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Super Admin Panel</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Manage all organisations</p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingOrg(null);
                setShowCreateDialog(true);
              }}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Organisation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orgs</p>
                    <p className="text-2xl font-bold text-gray-900">{organisations.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {organisations.filter(o => o.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {organisations.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search organisations by name, code, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Organisations List */}
          <div className="space-y-3">
            {filteredOrgs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No organisations found</div>
            ) : (
              filteredOrgs.map((org) => {
                const StatusIcon = statusIcons[org.status] || AlertTriangle;
                const employeeCount = getOrgEmployeeCount(org.id);
                
                return (
                  <Card key={org.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded object-contain bg-white border" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {org.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{org.name}</h3>
                              <Badge className={statusColors[org.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {org.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              <p className="text-sm text-gray-600">
                                <span className="font-mono font-semibold text-[#0072C6]">{org.code}</span>
                              </p>
                              {org.city && (
                                <p className="text-sm text-gray-500">{org.city}</p>
                              )}
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {employeeCount} employees
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(org)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(org)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? 'Edit Organisation' : 'Create New Organisation'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organisation Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ABC Company Ltd"
                />
              </div>
              <div>
                <Label>Organisation Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABC123"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique code for users to join. All caps, no spaces.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner Name</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Owner's full name"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+232..."
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Freetown"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Sierra Leone"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingOrg(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createOrgMutation.isPending || updateOrgMutation.isPending}
                className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                {editingOrg ? 'Update' : 'Create'} Organisation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}