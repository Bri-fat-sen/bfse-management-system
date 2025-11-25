import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OrganisationSwitcher({ currentEmployee, onSwitch }) {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Get all employees linked to this user (could be in multiple orgs)
  const { data: userEmployees = [] } = useQuery({
    queryKey: ['userEmployees', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // Get all organisations for these employees
  const orgIds = userEmployees.map(e => e.organisation_id).filter(Boolean);
  
  const { data: organisations = [] } = useQuery({
    queryKey: ['userOrganisations', orgIds],
    queryFn: async () => {
      if (orgIds.length === 0) return [];
      const orgs = await Promise.all(
        orgIds.map(id => base44.entities.Organisation.filter({ id }))
      );
      return orgs.flat();
    },
    enabled: orgIds.length > 0,
  });

  const currentOrg = organisations.find(o => o.id === currentEmployee?.organisation_id);

  const handleSwitch = async (orgId) => {
    // Find the employee record for this org
    const targetEmployee = userEmployees.find(e => e.organisation_id === orgId);
    if (targetEmployee && onSwitch) {
      onSwitch(targetEmployee);
    }
    // Invalidate queries to refresh data
    queryClient.invalidateQueries();
  };

  if (organisations.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <span className="font-medium text-sm truncate max-w-32">
          {currentOrg?.name || 'Organisation'}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
          {currentOrg?.logo_url ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentOrg.logo_url} />
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                {currentOrg.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          )}
          <span className="font-medium text-sm truncate max-w-32">
            {currentOrg?.name || 'Select Organisation'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
          Your Organisations
        </div>
        {organisations.map((org) => {
          const isActive = org.id === currentEmployee?.organisation_id;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className="flex items-center gap-3 p-2 cursor-pointer"
            >
              {org.logo_url ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={org.logo_url} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                    {org.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#0072C6]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{org.name}</p>
                <p className="text-xs text-gray-500">{org.city || org.country || 'Sierra Leone'}</p>
              </div>
              {isActive && (
                <Check className="w-4 h-4 text-[#1EB053]" />
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            to={createPageUrl('OrganisationSetup')} 
            className="flex items-center gap-2 p-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Organisation</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}