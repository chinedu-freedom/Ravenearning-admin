"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { usePost, useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import logoImg from "../../../../public/logo.jpeg";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "Ravenearning";

  const resetPasswordMutation = usePost("/auth/admin/reset-password", null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const phone = localStorage.getItem("resetPhone");
    if (!phone) {
      toast.error("Session expired. Please request a new reset code.");
      router.push("/auth/forgot-password");
      return;
    }

    resetPasswordMutation.mutate(
      { phone, newPassword: form.newPassword },
      {
        onSuccess: () => {
          localStorage.removeItem("resetPhone");
          router.push("/");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-900">
      <div className="flex flex-col justify-center items-center w-full max-w-xl px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
              <Image src={logoImg} alt="Logo" width={64} height={64} className="w-full h-full object-cover" priority />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Reset Password
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your new password and confirm it below for {siteName} Admin Panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white rounded-md py-3 font-medium transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Back to{" "}
              <Link
                href="/"
                className="text-[#4fb3ff] font-medium hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
