"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Tabs from "@/components/ui/tabs";
import ManageAccount from "./tabs/manage-account";
import ChangePassword from "./tabs/change-password";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "verification-password";

  const tabs = ["Verification Password", "Change Password"];

  const isVerificationTab = tab === "verification-password" || tab === "manage-account";
  const isChangePasswordTab = tab === "change-password";

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Security & Password Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage system verification authorization password and admin login credentials.
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab="verification-password" />

      <div className="mt-4">
        {isVerificationTab && <ManageAccount />}
        {isChangePasswordTab && <ChangePassword />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
