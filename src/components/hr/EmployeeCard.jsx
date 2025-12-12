import { } from "react";
import { Phone, Mail, MapPin, Calendar, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
};

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-700',
  org_admin: 'bg-blue-100 text-blue-700',
  hr_admin: 'bg-indigo-100 text-indigo-700',
  payroll_admin: 'bg-green-100 text-green-700',
  warehouse_manager: 'bg-amber-100 text-amber-700',
  retail_cashier: 'bg-cyan-100 text-cyan-700',
  driver: 'bg-orange-100 text-orange-700',
  accountant: 'bg-emerald-100 text-emerald-700',
  read_only: 'bg-gray-100 text-gray-700',
};

export default function EmployeeCard({ employee, onEdit, onViewDetails, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={employee.profile_photo} />
            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{employee.full_name}</p>
            <p className="text-xs text-gray-500">{employee.position || employee.role}</p>
          </div>
        </div>
        <Badge variant="outline" className={statusColors[employee.status]}>
          {employee.status}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={employee.profile_photo} />
            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-lg">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{employee.full_name}</h3>
                <p className="text-sm text-gray-500">{employee.employee_code}</p>
              </div>
              <Badge variant="outline" className={statusColors[employee.status]}>
                {employee.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={roleColors[employee.role] || roleColors.read_only}>
                {employee.role?.replace('_', ' ')}
              </Badge>
              {employee.department && (
                <Badge variant="secondary">{employee.department}</Badge>
              )}
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {employee.position && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3" />
                  <span>{employee.position}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.hire_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Hired {format(new Date(employee.hire_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {(onEdit || onViewDetails) && (
              <div className="flex gap-2 mt-4">
                {onViewDetails && (
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(employee)}>
                    View Details
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(employee)}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}