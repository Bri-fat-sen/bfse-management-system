import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SetPinDialog({ 
  open, 
  onOpenChange, 
  employee,
  isAdmin = false 
}) {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  const updatePinMutation = useMutation({
    mutationFn: async (newPin) => {
      return base44.entities.Employee.update(employee.id, { pin_hash: newPin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentEmployee'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("PIN set successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to set PIN");
    }
  });

  const resetForm = () => {
    setPin("");
    setConfirmPin("");
    setError("");
    setShowPin(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must contain only numbers");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    updatePinMutation.mutate(pin);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>
                {employee?.pin_hash ? 'Change PIN' : 'Set PIN'}
              </DialogTitle>
              <DialogDescription>
                {isAdmin 
                  ? `Set PIN for ${employee?.full_name}`
                  : 'Create a 4-digit PIN to secure your account'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>New PIN</Label>
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit PIN"
                className="pr-10 text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Confirm PIN</Label>
            <Input
              type={showPin ? "text" : "password"}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Confirm 4-digit PIN"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={4}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p>⚠️ Remember your PIN! You'll need it every time you access the app.</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePinMutation.isPending || pin.length !== 4}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {updatePinMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save PIN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}