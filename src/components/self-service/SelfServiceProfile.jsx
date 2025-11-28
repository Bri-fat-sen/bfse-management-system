import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  User, Phone, MapPin, Mail, Building2, Briefcase, 
  Calendar, Edit2, Save, X, Shield, AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function SelfServiceProfile({ employee, organisation }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: employee?.phone || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    emergency_phone: employee?.emergency_phone || ""
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEmployee'] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      phone: employee?.phone || "",
      address: employee?.address || "",
      emergency_contact: employee?.emergency_contact || "",
      emergency_phone: employee?.emergency_phone || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={employee?.profile_photo} />
              <AvatarFallback className="text-2xl bg-[#0F1F3C] text-white">
                {employee?.first_name?.charAt(0)}{employee?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="pt-4 sm:pt-8 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee?.full_name}</h2>
                  <p className="text-gray-500">{employee?.position || employee?.role?.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{employee?.employee_code}</Badge>
                  <Badge className={employee?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {employee?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information - Editable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#1EB053]" />
              Personal Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="bg-[#1EB053]">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-500 text-sm">Phone Number</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {employee?.phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-500 text-sm">Address</Label>
              {isEditing ? (
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your address"
                  rows={2}
                />
              ) : (
                <p className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  {employee?.address || "Not provided"}
                </p>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Emergency Contact
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-500 text-sm">Contact Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Emergency contact name"
                    />
                  ) : (
                    <p className="mt-1">{employee?.emergency_contact || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Contact Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      placeholder="Emergency contact phone"
                    />
                  ) : (
                    <p className="mt-1">{employee?.emergency_phone || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information - Read Only */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0072C6]" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
              <Shield className="w-4 h-4" />
              <span>These details are managed by HR</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500 text-sm">Department</Label>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {employee?.department || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Position</Label>
                <p className="font-medium mt-1">{employee?.position || "N/A"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Hire Date</Label>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {employee?.hire_date ? format(new Date(employee.hire_date), 'dd MMM yyyy') : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Role</Label>
                <Badge variant="secondary" className="mt-1">
                  {employee?.role?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Email</Label>
                <p className="font-medium flex items-center gap-2 mt-1 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {employee?.email || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Location</Label>
                <p className="font-medium mt-1">{employee?.assigned_location_name || "N/A"}</p>
              </div>
            </div>

            {organisation && (
              <div className="pt-4 border-t">
                <Label className="text-gray-500 text-sm">Organisation</Label>
                <div className="flex items-center gap-3 mt-2">
                  {organisation.logo_url && (
                    <img src={organisation.logo_url} alt={organisation.name} className="w-10 h-10 object-contain" />
                  )}
                  <div>
                    <p className="font-medium">{organisation.name}</p>
                    <p className="text-sm text-gray-500">{organisation.city}, {organisation.country}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}