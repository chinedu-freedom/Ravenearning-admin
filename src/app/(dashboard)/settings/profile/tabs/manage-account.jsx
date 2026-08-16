"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchData, usePatch } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function ManageAccount() {
  const patchProfile = usePatch("/admin/profile", "profile", false);

  const { data, refetch } = useFetchData(
    "/admin/profile",
    "profile"
  );

  const [form, setForm] = useState({
    username: "",
    email: "",
    dateOfBirth: "",
    city: "",
    postalCode: "",
    image: null,
  });

  const imageSrc = useImageSrc(form?.image, "/placeholder-user.jpg");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data?.success && data?.data) {
      const user = data.data;

      setForm({
        username: user.username || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
          : "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        image: user.image || null,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      username: form.username,
      email: form.email,
      dateOfBirth: form.dateOfBirth,
      city: form.city,
      postalCode: form.postalCode,
      image: form.image,
    };

    patchProfile.mutate(payload, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <div className="bg-white border border-gray-150 rounded-lg p-6 shadow-sm w-full md:w-[65%]">
      <h2 className="text-base text-center font-bold text-gray-800 mb-1">
        Manage your profile and security settings
      </h2>
      <p className="text-sm text-center text-muted-foreground mb-8">
        Admin Account
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="h-16 w-16">
            <AvatarImage src={imageSrc} alt="Profile photo" />
            <AvatarFallback>
              {form.username
                ? form.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "AD"}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition">
            <span className="text-xs font-medium">Change</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">Profile photo</p>
          <p className="text-xs text-muted-foreground">
            Click the avatar to upload a new one.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full name"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 rounded-lg"
          />
          <Input
            placeholder="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 rounded-lg"
          />
          <Input
            placeholder="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Postal code"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 rounded-lg"
          />
        </div>

        <Button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] rounded-lg shadow-sm border-0 flex items-center justify-center gap-2 font-bold h-10"
          disabled={patchProfile.isPending}
        >
          {patchProfile.isPending ? "Saving" : "Save Changes"}
          {patchProfile.isPending && (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          )}
        </Button>
      </form>
    </div>
  );
}