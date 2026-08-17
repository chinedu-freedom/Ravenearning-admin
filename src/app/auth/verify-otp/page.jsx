"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi"; 
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logoImg from "../../../../public/logo.jpeg";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const { handleSubmit, setValue } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "Ravenearning";

  const verifyOtpMutation = usePost("/auth/admin/verify-otp", null);
  const resendOtpMutation = usePost("/auth/admin/forgot-password", null);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const joinedOtp = newOtp.join("");
    setValue("otp", joinedOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = (data) => {
    const phone = localStorage.getItem("resetPhone");
    if (!phone) {
      toast.error("Session expired. Please request a new OTP.");
      return;
    }

    verifyOtpMutation.mutate({ ...data, phone }, {
      onSuccess: () => router.push("/auth/reset-password"),
    });
  };

  const handleResend = () => {
    const phone = localStorage.getItem("resetPhone");
    if (!phone) {
      toast.error("Session expired. Please go back and enter your phone number again.");
      return;
    }

    resendOtpMutation.mutate({ phone }, {
      onSuccess: () => toast.success("OTP resent successfully"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-900">
      <div className="flex flex-col justify-center items-center w-full max-w-xl px-8 py-12">
        <div className="w-full max-w-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
            <Image src={logoImg} alt="Logo" width={64} height={64} className="w-full h-full object-cover" priority />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-sm text-gray-500 mb-8">
            Enter the 4-digit code sent to your phone for {siteName} Admin Panel.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 focus:ring-2 focus:ring-[#4fb3ff]"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white rounded-md h-10 text-sm font-medium hover:brightness-95 active:brightness-90 transition-all shadow-sm cursor-pointer"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className={`font-medium cursor-pointer hover:underline ${
                  resendOtpMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#4fb3ff]"
                }`}
              >
                {resendOtpMutation.isPending ? "Resending..." : "Resend"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
