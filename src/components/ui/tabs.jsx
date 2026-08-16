"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Tabs({ tabs = [], defaultTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultTab || tabs[0];

  const toKebab = (str) => str.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", toKebab(tab));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative flex bg-slate-100/90 rounded-full p-1 w-full sm:w-fit overflow-x-auto no-scrollbar whitespace-nowrap shadow-inner border border-slate-200/50">
      <div className="flex gap-1 w-full sm:w-auto">
        {tabs.map((tab) => {
          const isActive = toKebab(tab) === currentTab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer capitalize whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] text-white shadow-md shadow-[#4f8cff]/20 font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
