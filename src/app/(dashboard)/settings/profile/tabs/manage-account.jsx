"use client";

import { useState } from "react";
import { ShieldAlert, KeyRound, Lock, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePut } from "@/hooks/useApi";
import { toast } from "sonner";

export default function VerificationPasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const updatePasswordMutation = usePut("/admin/settings/security", ["admin-security-settings"]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current verification password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter your new verification password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New verification password must be at least 6 characters long");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New verification password must be different from current password");
      return;
    }

    try {
      const res = await updatePasswordMutation.mutateAsync({
        currentPassword,
        newPassword
      });

      toast.success(res?.message || "Verification password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to update verification password");
    }
  };

  const isSubmitting = updatePasswordMutation.isPending;

  return (
    <div className="space-y-6 w-full max-w-lg font-['Poppins',sans-serif]">
      <Card className="border border-gray-100 shadow-sm bg-white rounded-xl">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3.5 p-4 bg-amber-50 rounded-xl border border-amber-200/80">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-900 font-bold text-sm">Important Security Notice</h4>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                This verification password is required to authorize manual additions or deductions on any customer's main or withdrawable balances. Keep it confidential.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5" autoComplete="off">
            {/* Current Verification Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-500" />
                Current Verification Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="new-password"
                  className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500 focus:border-blue-500 h-11 pr-10 text-gray-800 bg-white rounded-lg font-mono text-sm font-semibold"
                  placeholder="Enter current verification password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Verification Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-500" />
                New Verification Password
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500 focus:border-blue-500 h-11 pr-10 text-gray-800 bg-white rounded-lg font-mono text-sm font-semibold"
                  placeholder="Enter new verification password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4f8cff] hover:bg-[#3b7bed] text-white px-6 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center justify-center gap-2 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Verification Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
