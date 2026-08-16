"use client";

import { Bell, Search, Menu, Sparkles } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { useFetchData } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

export function Header({ onMenuClick }) {
  const { data, isLoading } = useFetchData("/admin/profile", "profile");
  const { data: settingsData } = useFetchData("/settings", "platform-settings");
  
  const admin = data?.success && data?.data ? data.data : null;
  const siteLogo = settingsData?.settings?.platform_logo;

  const displayName = admin?.username || (admin?.email ? admin.email.split("@")[0] : "Admin");
  const avatarLetter = (admin?.username ? admin.username[0] : (admin?.email ? admin.email[0] : "A")).toUpperCase();

  return (
    <header className="h-[65px] flex items-center justify-between px-6 bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 font-['Poppins',sans-serif]">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-[#4f8cff] hover:bg-blue-50 rounded-xl transition-all lg:hidden cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#2563eb] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#4f8cff]" />
          <span>Management Portal</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </>
          ) : (
            <>
              <div className="flex flex-col items-end">
                <span className="text-[13.5px] font-bold text-gray-800 capitalize leading-tight">{displayName}</span>
                <span className="text-[10.5px] font-medium text-[#4f8cff] uppercase tracking-wider">Administrator</span>
              </div>
              <Avatar.Root className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 ring-[#4f8cff]/20 ${(!siteLogo && !admin?.image) ? 'bg-gradient-to-tr from-[#4f8cff] to-[#6ee7ff]' : 'bg-transparent'}`}>
                {admin?.image ? (
                  <Avatar.Image src={admin.image} className="h-full w-full object-cover" />
                ) : siteLogo ? (
                  <Avatar.Image src={siteLogo} className="h-full w-full object-cover" />
                ) : (
                  <Avatar.Fallback className="text-sm font-bold text-white leading-none">
                    {avatarLetter}
                  </Avatar.Fallback>
                )}
              </Avatar.Root>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
