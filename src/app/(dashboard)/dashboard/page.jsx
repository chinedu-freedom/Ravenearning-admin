"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  User, 
  CircleDollarSign, 
  Clock, 
  FileText,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Award,
  Loader2,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Layers
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverview() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayUsers: 0,
    totalAssets: 0,
    assetsValue: 0,
    inProgressAssetsCount: 0,
    inProgressAssetsSum: 0,
    cumulativeInvestmentsSum: 0,
    pendingDepositsCount: 0,
    approvedDepositsCount: 0,
    pendingWithdrawalsCount: 0,
    approvedWithdrawalsCount: 0,
    pendingDepositsSum: 0,
    approvedDepositsSum: 0,
    pendingWithdrawalsSum: 0,
    approvedWithdrawalsSum: 0,
    todayDepositsSum: 0,
    todayWithdrawalsSum: 0,
    todayInvestmentsSum: 0,
    totalInterestAmount: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  let symbol = "R";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const { data } = await res.json();
          setStats(data || {});
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const allStats = [
    { title: "Total Members", value: (stats.totalUsers || 0).toString(), icon: Users, colorClasses: "bg-blue-50 text-[#4f8cff] border border-blue-100/50", link: "/customers" },
    { title: "Total Recharge (Approved)", value: `${symbol}${Number(stats.approvedDepositsSum || 0).toFixed(2)}`, icon: ArrowDownLeft, colorClasses: "bg-emerald-50 text-emerald-600 border border-emerald-100/50", link: "/recharge/approved" },
    { title: "Total Withdrawal (Approved)", value: `${symbol}${Number(stats.approvedWithdrawalsSum || 0).toFixed(2)}`, icon: ArrowUpRight, colorClasses: "bg-teal-50 text-teal-600 border border-teal-100/50", link: "/withdrawals/approved" },

    { title: "In-Progress Mining Plans", value: (stats.inProgressAssetsCount || 0).toString(), icon: Layers, colorClasses: "bg-indigo-50 text-indigo-600 border border-indigo-100/50", link: "/packages" },

    { title: "Pending Withdrawal Count", value: (stats.pendingWithdrawalsCount || 0).toString(), icon: Clock, colorClasses: "bg-amber-50 text-amber-600 border border-amber-100/50", link: "/withdrawals/pending" },
    { title: "Approved Withdrawal Count", value: (stats.approvedWithdrawalsCount || 0).toString(), icon: FileText, colorClasses: "bg-emerald-50 text-emerald-600 border border-emerald-100/50", link: "/withdrawals/approved" },
    { title: "Pending Recharge Count", value: (stats.pendingDepositsCount || 0).toString(), icon: Clock, colorClasses: "bg-amber-50 text-amber-600 border border-amber-100/50", link: "/recharge/pending" },
    { title: "Approved Recharge Count", value: (stats.approvedDepositsCount || 0).toString(), icon: FileText, colorClasses: "bg-emerald-50 text-emerald-600 border border-emerald-100/50", link: "/recharge/approved" },

    { title: "Pending Withdrawal Sum", value: `${symbol}${Number(stats.pendingWithdrawalsSum || 0).toFixed(2)}`, icon: ArrowUpRight, colorClasses: "bg-amber-50 text-amber-600 border border-amber-100/50", link: "/withdrawals/pending" },
    { title: "Pending Recharge Sum", value: `${symbol}${Number(stats.pendingDepositsSum || 0).toFixed(2)}`, icon: ArrowDownLeft, colorClasses: "bg-amber-50 text-amber-600 border border-amber-100/50", link: "/recharge/pending" },

    { title: "Today Recharge", value: `${symbol}${Number(stats.todayDepositsSum || 0).toFixed(2)}`, icon: ArrowDownLeft, colorClasses: "bg-cyan-50 text-cyan-600 border border-cyan-100/50", link: "/recharge/approved" },
    { title: "Today Withdrawal", value: `${symbol}${Number(stats.todayWithdrawalsSum || 0).toFixed(2)}`, icon: ArrowUpRight, colorClasses: "bg-rose-50 text-rose-500 border border-rose-100/50", link: "/withdrawals/approved" },
    { title: "New Members Today", value: (stats.todayUsers || 0).toString(), icon: User, colorClasses: "bg-blue-50 text-[#4f8cff] border border-blue-100/50", link: "/customers" },
    { title: "Today Mining Volume", value: `${symbol}${Number(stats.todayInvestmentsSum || 0).toFixed(2)}`, icon: Briefcase, colorClasses: "bg-emerald-50 text-emerald-600 border border-emerald-100/50", link: "/packages" }
  ];

  const StatCard = ({ title, value, icon: Icon, colorClasses, link }) => {
    return (
      <Card 
        onClick={() => link && router.push(link)}
        className={`border border-slate-100 shadow-sm shadow-blue-500/5 rounded-2xl bg-white transition-all duration-200 ${
          link ? 'cursor-pointer hover:shadow-md hover:border-[#4f8cff]/30 hover:-translate-y-0.5' : ''
        }`}
      >
        <CardContent className="p-5 flex items-center justify-between text-left">
          <div className="flex flex-col items-start min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-tight mb-1 truncate w-full">
              {value}
            </h3>
            <div className="text-slate-500 text-xs sm:text-[13px] font-medium truncate w-full">
              {title}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ml-4 shadow-sm ${colorClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 font-['Poppins',sans-serif]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 14 }).map((_, i) => (
            <Card key={i} className="border border-slate-100 rounded-2xl bg-white p-5">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex flex-col items-start gap-2.5 w-[70%]">
                  <Skeleton className="h-7 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <Skeleton className="w-11 h-11 rounded-2xl shrink-0 ml-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['Poppins',sans-serif]">
      {/* Top Banner / Greeting */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] text-white shadow-lg shadow-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-white/80 font-bold block mb-1">Platform Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Performance & Operations</h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">Real-time overview of member activities, financial transactions, and yield distributions.</p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <button 
            onClick={() => router.push('/recharge/pending')} 
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Pending Recharges
          </button>
          <button 
            onClick={() => router.push('/withdrawals/pending')} 
            className="px-4 py-2.5 rounded-xl bg-white text-[#2563eb] hover:bg-blue-50 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Pending Withdrawals
          </button>
        </div>
      </div>

      {/* Grid of all stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {allStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}
