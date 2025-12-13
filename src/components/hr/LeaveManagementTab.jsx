import React from "react";
import LeaveManagement from "./LeaveManagement";

export default function LeaveManagementTab({ orgId, leaveRequests, employees, currentEmployee }) {
  return (
    <LeaveManagement 
      orgId={orgId}
      leaveRequests={leaveRequests}
      employees={employees}
      currentEmployee={currentEmployee}
    />
  );
}