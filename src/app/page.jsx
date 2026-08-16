"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { CookieManager } from "@/utils/cookie-utils";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      keepMeLoggedIn: false,
    },
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "SatrixNow";
  const siteLogo = settings.platform_logo || null;

  useEffect(() => {
    setIsMounted(true);
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setValue("keepMeLoggedIn", true);
    }
  }, [setValue]);

  const loginMutation = usePost("/auth/admin/login", null, false);

  if (!isMounted) {
    return null; // Prevents hydration mismatch
  }

  const onSubmit = (data) => {
    const keepMeLoggedIn = data.keepMeLoggedIn ?? false;

    if (keepMeLoggedIn) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    loginMutation.mutate({ email: data.email, password: data.password, keepMeLoggedIn }, {
      onSuccess: (res) => {
        if (res?.token) {
          const cookieOptions = {
            path: "/",
            expires: keepMeLoggedIn ? 1 : 1 / 24, // 24 hours (1 day) or 1 hour
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
          };
          CookieManager.set("sec-admin-token", res.token, cookieOptions);
          localStorage.setItem("adminToken", res.token);
          localStorage.setItem("adminUser", JSON.stringify(res.admin));
        }
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] font-['Poppins',sans-serif] text-slate-800 p-4">
      <div className="flex flex-col justify-center items-center w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        
        {/* Decorative Top Gradient bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff]"></div>

        <div className="w-full">
          <div className="mb-8 flex flex-col items-center text-center">
            {siteLogo ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
                <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-tr from-[#4f8cff] to-[#6ee7ff] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 text-white">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              Admin Portal
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              Sign in to manage {siteName} ecosystem
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input label="Email Address" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between -mt-1">
              <Controller
                name="keepMeLoggedIn"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                      id="keepMeLoggedIn"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                     Remember me
                    </span>
                  </label>
                )}
              />

              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#4f8cff] hover:text-[#2563eb] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] text-white hover:opacity-95 rounded-xl py-3.5 text-xs font-bold tracking-wide shadow-md shadow-blue-500/25 transition-all cursor-pointer h-12"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In</span>
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
