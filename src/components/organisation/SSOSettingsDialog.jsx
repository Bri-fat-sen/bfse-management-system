import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Info, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SSOSettingsDialog({ open, onOpenChange, organisation, onSave }) {
  const [formData, setFormData] = useState({
    sso_enabled: organisation?.sso_enabled || false,
    sso_provider: organisation?.sso_provider || "none",
    sso_google_client_id: organisation?.sso_google_client_id || "",
    sso_google_client_secret: organisation?.sso_google_client_secret || "",
    sso_google_domain: organisation?.sso_google_domain || "",
    allow_email_signup: organisation?.allow_email_signup !== false,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>SSO Configuration</DialogTitle>
              <p className="text-sm text-gray-500">Configure Single Sign-On for {organisation?.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable SSO */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#1EB053]" />
              <div>
                <Label className="text-base font-semibold">Enable SSO</Label>
                <p className="text-sm text-gray-600">Allow users to login with corporate accounts</p>
              </div>
            </div>
            <Switch
              checked={formData.sso_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, sso_enabled: checked })}
            />
          </div>

          {formData.sso_enabled && (
            <>
              {/* Provider Selection */}
              <div>
                <Label>SSO Provider</Label>
                <Select
                  value={formData.sso_provider}
                  onValueChange={(value) => setFormData({ ...formData, sso_provider: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google">Google Workspace</SelectItem>
                    <SelectItem value="microsoft">Microsoft 365</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.sso_provider === "google" && (
                <>
                  {/* Google Setup Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 space-y-2">
                        <p className="font-semibold">Google OAuth Setup:</p>
                        <ol className="list-decimal ml-4 space-y-1">
                          <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                          <li>Create/Select a project for your organisation</li>
                          <li>Enable Google+ API</li>
                          <li>Create OAuth 2.0 credentials (Web application)</li>
                          <li>Add authorized redirect URI: <code className="bg-white px-2 py-0.5 rounded font-mono text-xs">{window.location.origin}/api/auth/callback</code></li>
                          <li>Copy Client ID and Client Secret below</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Client ID */}
                  <div>
                    <Label>Google Client ID *</Label>
                    <Input
                      value={formData.sso_google_client_id}
                      onChange={(e) => setFormData({ ...formData, sso_google_client_id: e.target.value })}
                      placeholder="xxxxxx.apps.googleusercontent.com"
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  {/* Client Secret */}
                  <div>
                    <Label>Google Client Secret *</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showSecret ? "text" : "password"}
                        value={formData.sso_google_client_secret}
                        onChange={(e) => setFormData({ ...formData, sso_google_client_secret: e.target.value })}
                        placeholder="GOCSPX-xxxxxxxxxxxxx"
                        className="font-mono text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Domain Restriction */}
                  <div>
                    <Label>Restrict to Domain (Optional)</Label>
                    <Input
                      value={formData.sso_google_domain}
                      onChange={(e) => setFormData({ ...formData, sso_google_domain: e.target.value })}
                      placeholder="company.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only allow login from specific Google Workspace domain
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Allow Email Signup */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base">Allow Email/Password Signup</Label>
              <p className="text-sm text-gray-600">Users can create accounts without SSO</p>
            </div>
            <Switch
              checked={formData.allow_email_signup}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_email_signup: checked })}
            />
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Security Best Practices:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Keep your OAuth credentials secure</li>
                  <li>Use domain restrictions for Google Workspace</li>
                  <li>Regularly rotate client secrets</li>
                  <li>Monitor SSO access logs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || (formData.sso_enabled && formData.sso_provider === "google" && (!formData.sso_google_client_id || !formData.sso_google_client_secret))}
              className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}