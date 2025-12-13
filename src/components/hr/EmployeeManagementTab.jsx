import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/Toast";
import AddEmployeeDialog from "@/components/hr/AddEmployeeDialog";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";

export default function EmployeeManagementTab({ orgId, employees, currentEmployee, userRole }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    super_admin: "bg-purple-100 text-purple-800",
    org_admin: "bg-blue-100 text-blue-800",
    hr_admin: "bg-green-100 text-green-800",
    payroll_admin: "bg-amber-100 text-amber-800",
    warehouse_manager: "bg-orange-100 text-orange-800",
    accountant: "bg-teal-100 text-teal-800",
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setShowAddDialog(true);
          }}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={emp.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white font-semibold">
                    {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{emp.full_name}</h3>
                  <p className="text-sm text-gray-600 truncate">{emp.employee_code}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={statusColors[emp.status] || "bg-gray-100 text-gray-800"}>
                      {emp.status}
                    </Badge>
                    <Badge className={roleColors[emp.role] || "bg-gray-100 text-gray-800"}>
                      {emp.role?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {emp.department && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{emp.department}</span>
                  </div>
                )}
                {emp.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                )}
                {emp.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                )}
                {emp.base_salary > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-gray-600">Base Salary:</span>
                    <span className="font-semibold text-[#1EB053]">{formatLeone(emp.base_salary)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingEmployee(emp);
                    setShowAddDialog(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No employees found</p>
        </div>
      )}

      {/* Add/Edit Employee Dialog */}
      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        employee={editingEmployee}
        orgId={orgId}
      />
    </div>
  );
}