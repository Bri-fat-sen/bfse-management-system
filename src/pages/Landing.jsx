import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, ArrowRight, Lock, Shield, Users, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [useCode, setUseCode] = useState(false);
  const [orgCode, setOrgCode] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { data: organisations = [], isLoading } = useQuery({
    queryKey: ['publicOrganisations'],
    queryFn: () => base44.entities.Organisation.filter({ status: 'active' }),
  });

  const handleOrgSelect = (org) => {
    // Store org selection in localStorage
    localStorage.setItem('selected_org_id', org.id);
    localStorage.setItem('selected_org_code', org.code);
    
    // Redirect to base44 auth with org context
    if (org.sso_enabled && org.sso_provider === 'google') {
      // Use org-specific SSO
      window.location.href = `/api/auth/org-sso?org_id=${org.id}`;
    } else {
      // Use standard login
      base44.auth.redirectToLogin();
    }
  };

  const handleCodeSearch = () => {
    const org = organisations.find(o => o.code?.toUpperCase() === orgCode.toUpperCase());
    if (org) {
      setSelectedOrg(org);
    }
  };

  const filteredOrgs = organisations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#0072C6] rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/564ad3427_file_00000000014871faa409619479a5f0ef.png" 
            alt="BRI-FAT-SEN Enterprise"
            className="w-full max-w-md mx-auto h-auto object-contain drop-shadow-2xl mb-4"
          />
          <p className="text-white/80 text-lg">Enterprise Management System</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Organisation</h2>
              <p className="text-gray-600">Choose your organisation to continue</p>
            </div>

            {/* Method Toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant={!useCode ? "default" : "outline"}
                onClick={() => setUseCode(false)}
                className={!useCode ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white" : ""}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse
              </Button>
              <Button
                variant={useCode ? "default" : "outline"}
                onClick={() => setUseCode(true)}
                className={useCode ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white" : ""}
              >
                <Lock className="w-4 h-4 mr-2" />
                Use Code
              </Button>
            </div>

            {useCode ? (
              // Code Entry
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg p-6">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Enter your organisation code provided by your administrator
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCodeSearch()}
                      placeholder="ORG-CODE"
                      className="font-mono text-center text-lg uppercase"
                    />
                    <Button
                      onClick={handleCodeSearch}
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  {selectedOrg && (
                    <Card className="mt-4 border-2 border-[#1EB053]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {selectedOrg.logo_url ? (
                            <img src={selectedOrg.logo_url} alt={selectedOrg.name} className="w-12 h-12 object-contain rounded border" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg">
                              {selectedOrg.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{selectedOrg.name}</p>
                            <p className="text-sm text-gray-600">{selectedOrg.city}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOrgSelect(selectedOrg)}
                          className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                        >
                          Continue to Login
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              // Browse List
              <div>
                <div className="mb-4">
                  <Label>Search Organisations</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredOrgs.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No organisations found
                    </div>
                  ) : (
                    filteredOrgs.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleOrgSelect(org)}
                        className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-[#1EB053] hover:shadow-md transition-all bg-white"
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
                            <p className="text-xs text-gray-500 font-mono">{org.code}</p>
                            {org.city && <p className="text-xs text-gray-400 mt-1">{org.city}</p>}
                            {org.sso_enabled && (
                              <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                SSO Enabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? Contact your organisation administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure Multi-Tenant Platform</span>
        </div>
      </div>
    </div>
  );
}