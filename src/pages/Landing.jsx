import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, ArrowRight, Shield, Lock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [orgCode, setOrgCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { data: organisations = [] } = useQuery({
    queryKey: ['publicOrganisations'],
    queryFn: () => base44.entities.Organisation.filter({ status: 'active' }),
  });

  const handleOrgSelect = (org) => {
    localStorage.setItem('selected_org_id', org.id);
    localStorage.setItem('selected_org_code', org.code);
    
    // Redirect to login with organisation context
    const authConfig = org.auth_config || {};
    
    if (authConfig.auth_type === 'google_sso' && authConfig.google_client_id) {
      // Initiate Google SSO for this organisation
      window.location.href = `/api/auth/google?org_id=${org.id}`;
    } else if (authConfig.auth_type === 'microsoft_sso' && authConfig.microsoft_client_id) {
      // Initiate Microsoft SSO for this organisation
      window.location.href = `/api/auth/microsoft?org_id=${org.id}`;
    } else {
      // Default email/password login
      base44.auth.redirectToLogin();
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!orgCode.trim()) return;
    
    const org = organisations.find(o => o.code?.toUpperCase() === orgCode.toUpperCase());
    if (org) {
      handleOrgSelect(org);
    } else {
      alert("Organisation not found with that code");
    }
  };

  const filteredOrgs = searchTerm
    ? organisations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : organisations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#0072C6] rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" style={{ animationDuration: '3.5s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/e3d7b69e5_file_00000000014871faa409619479a5f0ef.png"
                alt="BRI-FAT-SEN"
                className="h-12 w-auto"
              />
            </div>
            <div className="flex h-1 w-24 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                Welcome to BRI-FAT-SEN
              </h1>
              <p className="text-xl text-white/80 mb-2">Enterprise Management System</p>
              <div className="flex items-center justify-center gap-6 mt-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1EB053]" />
                  <span>Secure Multi-Tenant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#0072C6]" />
                  <span>Enterprise Grade</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-white" />
                  <span>Global Access</span>
                </div>
              </div>
            </div>

            {/* Organisation Selection */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Organisation</h2>
                  <p className="text-gray-600">Enter your organisation code or browse the list below</p>
                </div>

                {/* Code Entry */}
                <form onSubmit={handleCodeSubmit} className="mb-8">
                  <div className="flex gap-3 max-w-md mx-auto">
                    <Input
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                      placeholder="Enter Organisation Code"
                      className="font-mono text-center text-lg h-12"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white h-12 px-8"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <span className="text-sm text-gray-500">OR BROWSE</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search organisations..."
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                {/* Organisation List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredOrgs.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No organisations found</p>
                    </div>
                  ) : (
                    filteredOrgs.map((org) => {
                      const authType = org.auth_config?.auth_type || 'email';
                      const authLabel = {
                        email: 'Email/Password',
                        google_sso: 'Google SSO',
                        microsoft_sso: 'Microsoft SSO',
                        custom_sso: 'SSO'
                      }[authType];

                      return (
                        <button
                          key={org.id}
                          onClick={() => handleOrgSelect(org)}
                          className="text-left p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-[#1EB053] hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {org.logo_url ? (
                              <img
                                src={org.logo_url}
                                alt={org.name}
                                className="w-12 h-12 rounded object-contain bg-white border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg">
                                {org.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-[#1EB053] transition-colors">
                                {org.name}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">{org.code}</p>
                              {org.city && (
                                <p className="text-xs text-gray-400 mt-1">{org.city}</p>
                              )}
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  {authLabel}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#1EB053] transition-colors" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="text-center mt-8 text-white/60 text-sm">
              <p>Secure • Multi-Tenant • Enterprise Grade</p>
              <p className="mt-2">Each organisation has isolated data and can configure their own authentication</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex h-1 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <p className="text-center text-white/60 text-sm mt-4">
              © 2025 BRI-FAT-SEN. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}