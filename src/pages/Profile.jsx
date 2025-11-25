import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Save,
  Camera,
  Clock,
  Award
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', employee?.[0]?.organisation_id],
    queryFn: () => base44.entities.Organisation.filter({ id: employee?.[0]?.organisation_id }),
    enabled: !!employee?.[0]?.organisation_id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['myAttendance', employee?.[0]?.id],
    queryFn: () => base44.entities.Attendance.filter({ employee_id: employee?.[0]?.id }, '-date', 30),
    enabled: !!employee?.[0]?.id,
  });

  const currentEmployee = employee?.[0];
  const currentOrg = organisation?.[0];

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emergency_contact: "",
    emergency_phone: ""
  });

  React.useEffect(() => {
    if (currentEmployee) {
      setFormData({
        phone: currentEmployee.phone || "",
        address: currentEmployee.address || "",
        emergency_contact: currentEmployee.emergency_contact || "",
        emergency_phone: currentEmployee.emergency_phone || ""
      });
    }
  }, [currentEmployee]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(currentEmployee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
    },
  });

  // Calculate stats
  const daysWorked = attendance.filter(a => a.clock_in_time).length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const avgHoursPerDay = daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0;

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        subtitle="View and update your personal information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={currentEmployee?.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white text-4xl">
                    {currentEmployee?.first_name?.[0]}{currentEmployee?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 sl-gradient"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold mt-4">{currentEmployee?.full_name}</h2>
              <p className="text-gray-500">{currentEmployee?.position || currentEmployee?.role}</p>
              
              <div className="flex gap-2 mt-3">
                <Badge className="bg-gradient-to-r from-[#1EB053] to-[#1D5FC3] text-white capitalize">
                  {currentEmployee?.role?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className={
                  currentEmployee?.status === 'active' ? "border-green-500 text-green-600" : "border-gray-500"
                }>
                  {currentEmployee?.status}
                </Badge>
              </div>

              <div className="w-full mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{currentEmployee?.email || user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{currentEmployee?.phone || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{currentOrg?.name || "Organisation"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {currentEmployee?.hire_date ? format(new Date(currentEmployee.hire_date), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={currentEmployee?.first_name || ""} disabled />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={currentEmployee?.last_name || ""} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Employee Code</Label>
                <Input value={currentEmployee?.employee_code || ""} disabled />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={currentEmployee?.department || ""} disabled />
              </div>
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Emergency Contact Name</Label>
                <Input 
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <Input 
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  placeholder="Contact phone"
                />
              </div>
            </div>
            <Button 
              onClick={() => updateProfileMutation.mutate(formData)}
              disabled={updateProfileMutation.isPending}
              className="sl-gradient"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1EB053]/20 to-[#1EB053]/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#1EB053]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Worked (30d)</p>
                <p className="text-2xl font-bold">{daysWorked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1D5FC3]/20 to-[#1D5FC3]/10 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-[#1D5FC3]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hours (30d)</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 flex items-center justify-center">
                <Award className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Hours/Day</p>
                <p className="text-2xl font-bold">{avgHoursPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendance.slice(0, 7).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'late' ? 'bg-yellow-500' :
                    record.status === 'absent' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium">{record.date && format(new Date(record.date), 'EEEE, MMM d')}</p>
                    <p className="text-sm text-gray-500">
                      {record.clock_in_time || '--:--'} - {record.clock_out_time || '--:--'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{record.total_hours?.toFixed(1) || 0} hrs</p>
                  <Badge variant="outline" className="capitalize">{record.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}