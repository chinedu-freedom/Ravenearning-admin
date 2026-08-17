"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import logoImg from "../../../../public/logo.jpeg";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "Ravenearning";

  const requestOtpMutation = usePost("/auth/admin/forgot-password", null);

  const onSubmit = (data) => {
    const rawDigits = data.phone.replace(/[^0-9]/g, '');
    const cleanDigits = rawDigits.startsWith('0') ? rawDigits.substring(1) : rawDigits;
    const normalizedPhone = cleanDigits.startsWith('27') ? cleanDigits : `27${cleanDigits}`;

    localStorage.setItem("resetPhone", normalizedPhone);

    requestOtpMutation.mutate({ phone: normalizedPhone }, {
      onSuccess: () => {
        router.push("/auth/verify-otp");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-900">
      <div className="flex flex-col justify-center items-center w-full max-w-xl px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
              <Image src={logoImg} alt="Logo" width={64} height={64} className="w-full h-full object-cover" priority />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">
              Enter your registered phone number for {siteName} Admin Panel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input
                label="Phone Number"
                prefix="+27"
                icon={Smartphone}
                placeholder="Phone number"
                type="tel"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white rounded-md h-10 text-sm font-medium hover:brightness-95 active:brightness-90 transition-all shadow-sm cursor-pointer"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{" "}
              <Link href="/" className="text-[#4fb3ff] font-medium hover:underline cursor-pointer">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
