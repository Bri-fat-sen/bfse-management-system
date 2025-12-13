import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatutoryRateManager from "./StatutoryRateManager";
import PayComponentManager from "./PayComponentManager";
import RemunerationPackageManager from "./RemunerationPackageManager";

export default function SierraLeonePayrollSettings({ orgId, currentEmployee }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statutory Rates (NASSIT & Tax)</CardTitle>
        </CardHeader>
        <CardContent>
          <StatutoryRateManager orgId={orgId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pay Components</CardTitle>
        </CardHeader>
        <CardContent>
          <PayComponentManager orgId={orgId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remuneration Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <RemunerationPackageManager orgId={orgId} currentEmployee={currentEmployee} />
        </CardContent>
      </Card>
    </div>
  );
}