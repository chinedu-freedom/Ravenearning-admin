"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  ArrowRight,
  Play,
  ClipboardCheck,
  CalendarCheck,
  Loader,
  Newspaper,
  Building,
  Activity,
  LogOut,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { CookieManager } from "@/utils/cookie-utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { type: "divider", name: "APPS & OPERATIONS" },
  { name: "Packages", href: "/packages", icon: ArrowRight },
  { 
    name: "Gift Bonus", 
    icon: Play,
    children: [
      { name: "Bonus", href: "/gift-bonus/bonus" },
      { name: "Uses List", href: "/gift-bonus/uses-list" }
    ]
  },
  { name: "Tasks", href: "/tasks", icon: ClipboardCheck },
  { name: "Daily Check-In", href: "/daily-check-in", icon: CalendarCheck },
  { name: "Spin Wheel", href: "/spin-wheel", icon: Loader },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Partners", href: "/partners", icon: Building },
  { name: "Live Market", href: "/live-market", icon: TrendingUp }, 
  { name: "Customers", href: "/customers", icon: ArrowRight },
  { name: "Activity Monitor", href: "/activity-monitor", icon: Activity },
  {
    name: "Recharge Payments",
    icon: Play,
    children: [
      { name: "Pending", href: "/recharge/pending" },
      { name: "Approved", href: "/recharge/approved" },
      { name: "Rejected", href: "/recharge/rejected" }
    ]
  },
  {
    name: "Withdrawal Payments",
    icon: Play,
    children: [
      { name: "Pending", href: "/withdrawals/pending" },
      { name: "Approved", href: "/withdrawals/approved" },
      { name: "Rejected", href: "/withdrawals/rejected" }
    ]
  },
  { name: "Slider Images", href: "/slider-images", icon: ArrowRight },
  {
    name: "Settings",
    icon: Play,
    children: [
      { name: "Profile", href: "/settings/profile" },
      { name: "Basic", href: "/settings/basic" },
      { name: "Email Settings", href: "/settings/email" },
      { name: "Countries & Rates", href: "/settings/countries" },
      { name: "Languages", href: "/settings/languages" },
      { name: "About Us", href: "/settings/about" },
      { name: "Commission", href: "/settings/commission" },
      { name: "Verification Password", href: "/settings/security" },
    ]
  }
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(prev => (prev === name ? "" : name));
  };

  const isActive = (href) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isChildActive = (children) => {
    return children?.some(child => isActive(child.href));
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex h-full w-[260px] flex-col bg-white border-r border-gray-100 shadow-[0_0_20px_0_rgba(0,0,0,0.03)] font-['Poppins',sans-serif] transition-transform duration-300 ease-in-out`}>
        {/* Brand Header */}
        <div className="flex h-[75px] items-center px-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3 w-full group" onClick={handleLinkClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f8cff] to-[#6ee7ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[17px] font-bold text-gray-800 tracking-tight block leading-tight">SatrixNow</span>
              <span className="text-[10px] font-semibold text-[#4f8cff] uppercase tracking-wider block">Admin Panel</span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-3 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-1">
            {navigation.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <div key={index} className="px-4 pt-5 pb-2">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{item.name}</span>
                  </div>
                );
              }

              const active = isActive(item.href) || isChildActive(item.children);
              const isMenuOpen = openMenu !== null ? openMenu === item.name : isChildActive(item.children);

              if (item.children) {
                return (
                  <div key={item.name} className="mb-1 transition-all">
                    <div className={`rounded-xl overflow-hidden transition-all duration-200 ${isMenuOpen ? 'bg-slate-50/80 border border-slate-100' : ''}`}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                          !isMenuOpen && active 
                            ? "bg-gradient-to-r from-[#4f8cff]/10 to-[#6ee7ff]/15 text-[#2563eb] font-semibold" 
                            : !isMenuOpen 
                              ? "text-gray-600 hover:bg-blue-50/60 hover:text-[#4f8cff]" 
                              : "text-[#2563eb] font-semibold"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && <item.icon className={`w-[18px] h-[18px] ${(active || isMenuOpen) ? "text-[#4f8cff]" : "text-gray-400 group-hover:text-[#4f8cff] transition-colors"}`} />}
                          <span className="text-[13.5px]">{item.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-[#4f8cff]' : ''}`} />
                      </button>
                      
                      {isMenuOpen && (
                        <div className="py-1.5 px-1 space-y-1">
                          {item.children.map((child) => {
                            const childActive = isActive(child.href);
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-2.5 pl-6 pr-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                                  childActive 
                                    ? "bg-white text-[#2563eb] font-semibold shadow-sm border border-slate-200/60" 
                                    : "text-gray-500 hover:text-[#4f8cff] hover:bg-white/60"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${childActive ? 'bg-[#4f8cff]' : 'bg-gray-300 group-hover:bg-[#4f8cff]'}`}></span>
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.name} className="mb-1">
                  <Link
                    href={item.href || "#"}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 group ${
                      active 
                        ? "bg-gradient-to-r from-[#4f8cff]/10 to-[#6ee7ff]/15 text-[#2563eb] font-semibold shadow-sm" 
                        : "text-gray-600 hover:bg-blue-50/60 hover:text-[#4f8cff]"
                    }`}
                  >
                    {item.icon && <item.icon className={`w-[18px] h-[18px] ${active ? "text-[#4f8cff]" : "text-gray-400 group-hover:text-[#4f8cff] transition-colors"}`} />}
                    <span>{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
