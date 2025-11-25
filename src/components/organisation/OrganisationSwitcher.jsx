import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OrganisationSwitcher({ currentEmployee, user }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all employees for this user (each represents membership in an org)
  const { data: userEmployees = [] } = useQuery({
    queryKey: ['userEmployees', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  // Get all organisations for the user's employees
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

  const handleSwitchOrg = async (orgId) => {
    if (orgId === currentEmployee?.organisation_id) return;
    
    // Store the selected org in user preferences
    await base44.auth.updateMe({ 
      active_organisation_id: orgId 
    });
    
    toast({ 
      title: "Organisation Switched",
      description: "Refreshing to load new organisation data..."
    });
    
    // Reload to refresh all data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (organisations.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <span className="font-medium text-sm truncate max-w-[120px]">
          {currentOrg?.name || 'My Organisation'}
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
          <span className="font-medium text-sm truncate max-w-[120px]">
            {currentOrg?.name || 'Select Organisation'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
          Your Organisations
        </div>
        {organisations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="flex items-center gap-3 p-3 cursor-pointer"
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
              <p className="font-medium truncate">{org.name}</p>
              <p className="text-xs text-gray-500 truncate">{org.city}, {org.country}</p>
            </div>
            {org.id === currentEmployee?.organisation_id && (
              <Check className="w-4 h-4 text-[#1EB053]" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={createPageUrl("OrganisationSetup")} className="flex items-center gap-2 p-3 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create New Organisation</span>
          </Link>
        </DropdownMenuItem>
        {currentOrg && (
          <DropdownMenuItem asChild>
            <Link to={createPageUrl("Settings")} className="flex items-center gap-2 p-3 cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Organisation Settings</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}