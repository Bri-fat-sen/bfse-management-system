import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Globe, Mail, Key, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SSOConfigDialog({ open, onOpenChange, organisation, onSave }) {
  const [config, setConfig] = useState(organisation?.auth_config || {
    auth_type: 'email',
    allow_email_signup: true,
    restrict_email_domain: false,
    allowed_email_domains: []
  });

  const [domainInput, setDomainInput] = useState("");

  const handleSave = () => {
    onSave({ ...organisation, auth_config: config });
    onOpenChange(false);
  };

  const addDomain = () => {
    if (domainInput && !config.allowed_email_domains?.includes(domainInput)) {
      setConfig({
        ...config,
        allowed_email_domains: [...(config.allowed_email_domains || []), domainInput]
      });
      setDomainInput("");
    }
  };

  const removeDomain = (domain) => {
    setConfig({
      ...config,
      allowed_email_domains: config.allowed_email_domains.filter(d => d !== domain)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1EB053]" />
            Authentication Configuration - {organisation?.name}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Configure how users will authenticate to access this organisation's workspace. Changes take effect immediately.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <Label>Authentication Type</Label>
              <Select value={config.auth_type} onValueChange={(v) => setConfig({ ...config, auth_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email/Password
                    </div>
                  </SelectItem>
                  <SelectItem value="google_sso">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Google SSO
                    </div>
                  </SelectItem>
                  <SelectItem value="microsoft_sso">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Microsoft SSO
                    </div>
                  </SelectItem>
                  <SelectItem value="custom_sso">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Custom SSO
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Email Signup</Label>
                <p className="text-xs text-gray-500">Users can create accounts with email/password</p>
              </div>
              <Switch
                checked={config.allow_email_signup}
                onCheckedChange={(v) => setConfig({ ...config, allow_email_signup: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Restrict Email Domain</Label>
                <p className="text-xs text-gray-500">Only allow specific email domains</p>
              </div>
              <Switch
                checked={config.restrict_email_domain}
                onCheckedChange={(v) => setConfig({ ...config, restrict_email_domain: v })}
              />
            </div>

            {config.restrict_email_domain && (
              <div>
                <Label>Allowed Domains</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g., company.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                  />
                  <Button onClick={addDomain}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.allowed_email_domains?.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      {domain}
                      <button
                        onClick={() => removeDomain(domain)}
                        className="ml-2 text-gray-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="google" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription>
                Configure Google OAuth for your organisation. Get credentials from Google Cloud Console.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Google Client ID</Label>
              <Input
                value={config.google_client_id || ""}
                onChange={(e) => setConfig({ ...config, google_client_id: e.target.value })}
                placeholder="xxxxx.apps.googleusercontent.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Google Client Secret</Label>
              <Input
                type="password"
                value={config.google_client_secret || ""}
                onChange={(e) => setConfig({ ...config, google_client_secret: e.target.value })}
                placeholder="Enter client secret"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">This will be encrypted when saved</p>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Redirect URI:</strong> {window.location.origin}/api/auth/google/callback
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="microsoft" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription>
                Configure Microsoft OAuth for your organisation. Get credentials from Azure Portal.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Microsoft Client ID (Application ID)</Label>
              <Input
                value={config.microsoft_client_id || ""}
                onChange={(e) => setConfig({ ...config, microsoft_client_id: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Microsoft Client Secret</Label>
              <Input
                type="password"
                value={config.microsoft_client_secret || ""}
                onChange={(e) => setConfig({ ...config, microsoft_client_secret: e.target.value })}
                placeholder="Enter client secret"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tenant ID</Label>
              <Input
                value={config.microsoft_tenant_id || ""}
                onChange={(e) => setConfig({ ...config, microsoft_tenant_id: e.target.value })}
                placeholder="common or your tenant ID"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Use 'common' for multi-tenant or your specific tenant ID</p>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Redirect URI:</strong> {window.location.origin}/api/auth/microsoft/callback
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription>
                Configure a custom OAuth 2.0 provider for your organisation.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Provider Name</Label>
              <Input
                value={config.custom_oauth_provider || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_provider: e.target.value })}
                placeholder="e.g., Okta, Auth0"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Client ID</Label>
              <Input
                value={config.custom_oauth_client_id || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_client_id: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={config.custom_oauth_client_secret || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_client_secret: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Authorization URL</Label>
              <Input
                value={config.custom_oauth_authorize_url || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_authorize_url: e.target.value })}
                placeholder="https://provider.com/oauth/authorize"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Token URL</Label>
              <Input
                value={config.custom_oauth_token_url || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_token_url: e.target.value })}
                placeholder="https://provider.com/oauth/token"
                className="mt-1"
              />
            </div>

            <div>
              <Label>UserInfo URL</Label>
              <Input
                value={config.custom_oauth_userinfo_url || ""}
                onChange={(e) => setConfig({ ...config, custom_oauth_userinfo_url: e.target.value })}
                placeholder="https://provider.com/oauth/userinfo"
                className="mt-1"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}