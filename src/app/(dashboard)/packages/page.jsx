"use client"

import { useState } from "react"
import { Search, Edit, Package, Plus, Trash2, Loader2, Sparkles, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import PlanDialog from "@/components/modals/PlanDialog"
import { useFetchData, useDelete } from "@/hooks/useApi"
import { format } from "date-fns"

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal State
  const [open, setOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    planId: null,
  });

  const { data: plansRes, isLoading } = useFetchData("/admin/plans", ["plans"]);
  const plansData = Array.isArray(plansRes) 
    ? [...plansRes].sort((a, b) => Number(a.min_investment || 0) - Number(b.min_investment || 0))
    : plansRes?.data 
      ? [...plansRes.data].sort((a, b) => Number(a.min_investment || 0) - Number(b.min_investment || 0))
      : [];

  const deleteMutation = useDelete((id) => `/admin/plans/${id}`, ["plans"]);

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, planId: id });
  };

  const executeDelete = async () => {
    if (confirmDialog.planId) {
      try {
        await deleteMutation.mutateAsync(confirmDialog.planId);
      } catch (error) {
        console.error("Failed to delete plan", error);
      } finally {
        setConfirmDialog({ isOpen: false, planId: null });
      }
    }
  };

  const getStatusColor = (status) => {
    const statusStr = typeof status === "boolean" ? (status ? "active" : "inactive") : String(status || "inactive");
    switch (statusStr.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800"
      case "inactive":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPlans = plansData.filter((plan) => {
    const matchesSearch =
      plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? plan.status === true : plan.status === false);

    return matchesSearch && matchesStatus
  })

  // Dynamic stats
  const activeCount = plansData.filter(p => p.status === true).length;
  const inactiveCount = plansData.filter(p => p.status === false).length;

  const dynamicStats = [
    {
      title: "Total Packages",
      value: plansData.length.toString(),
      icon: Package,
      color: "text-[#4f8cff]",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Packages",
      value: activeCount.toString(),
      icon: Sparkles,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Inactive Packages",
      value: inactiveCount.toString(),
      icon: Package,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-['Poppins',sans-serif]">
      {/* Header Banner */}
      <div className="bg-white border-none shadow-sm rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">VIP Investment Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and configure Raven projector investment products and returns.</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPlan(null)
            setOpen(true)
          }}
          className="bg-[#4f8cff] hover:bg-[#3b7bed] text-white gap-2 font-semibold shadow-sm h-10 px-5 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Create VIP Package
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dynamicStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-none shadow-sm bg-white rounded-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-gray-500 tracking-wide">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filter and Search */}
      <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-gray-200 h-10 text-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Packages Table */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-800">All VIP Packages ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader className="bg-gray-50/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider pl-6 py-4">#</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">PRODUCT</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">PRICE (ZAR)</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">DAILY INCOME (ZAR)</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">TOTAL REVENUE (ZAR)</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">DURATION</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">STATUS</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right pr-6 py-4">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4f8cff]" />
                      Loading packages...
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500 bg-gray-50/30">
                      <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-base font-medium text-gray-600 mb-1">No packages available</p>
                      <p className="text-sm text-gray-500">There are no packages matching your search criteria.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.map((plan, index) => {
                  const price = Number(plan.min_investment || 0);
                  let dailyIncomeZar = Number(plan.daily_income || 0);
                  if (dailyIncomeZar <= 1) {
                    dailyIncomeZar = Number((price * dailyIncomeZar).toFixed(2));
                  }
                  const totalRevenueZar = plan.total_revenue ? Number(plan.total_revenue) : Number((dailyIncomeZar * Number(plan.duration || 0)).toFixed(2));

                  return (
                    <TableRow key={plan.id} className="hover:bg-gray-50 border-b last:border-0">
                      <TableCell className="font-bold text-[13px] text-gray-400 pl-6 py-4">
                        VIP{index + 1}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          {plan.image ? (
                            <img src={plan.image} alt={plan.name} className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                              <Package className="w-5 h-5 text-[#4f8cff]" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[14px] text-gray-800 leading-tight">{plan.name}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{plan.description || "VIP Projector"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-bold text-gray-900 text-[14px]">
                          ZAR {price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-bold text-emerald-600 text-[14px]">
                          ZAR {dailyIncomeZar.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-black text-[#2563eb] text-[14px]">
                          ZAR {totalRevenueZar.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-gray-700 py-4">
                        {plan.duration}-DAYS
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${getStatusColor(plan.status ? "active" : "inactive")} border-0 capitalize shadow-none font-bold text-xs`}>
                          {plan.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-blue-600 border-gray-200 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedPlan(plan)
                              setOpen(true)
                            }}
                            title="Edit Plan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 border-gray-200 hover:bg-red-50"
                            onClick={() => handleDeleteClick(plan.id)}
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Plan Dialog */}
      <PlanDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedPlan}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Delete Package</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this package? If users have active investments in this package, you should deactivate it instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, planId: null })}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
