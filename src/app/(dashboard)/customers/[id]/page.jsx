"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  User, 
  Phone,
  Shield, 
  ShieldCheck,
  ShieldAlert,
  CreditCard, 
  WalletCards, 
  Save, 
  Trash, 
  LogIn, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle,
  History,
  Lock,
  Calendar,
  Clock,
  MapPin,
  Hash,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFetchData } from "@/hooks/useApi"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { toast } from "sonner"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch full user data
  const { data: userResponse, isLoading, refetch } = useFetchData(`/admin/users/${id}`, ["user-detail", id])
  const user = userResponse?.data || userResponse || {}

  // Safe Date Formatting helper
  const safeFormatDate = (dateVal, formatStr) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    try {
      return format(d, formatStr);
    } catch (e) {
      return "N/A";
    }
  };

  // State management
  const [editData, setEditData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deletingRef = useRef(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const [activeHistoryTab, setActiveHistoryTab] = useState("transactions")

  // Credit/Debit states
  const [creditData, setCreditData] = useState({ balance_type: "main", amount: "", reason: "" })
  const [debitData, setDebitData] = useState({ balance_type: "main", amount: "", reason: "" })
  const [isCreditProcessing, setIsCreditProcessing] = useState(false)
  const [isDebitProcessing, setIsDebitProcessing] = useState(false)
  const [securityModal, setSecurityModal] = useState({ isOpen: false, actionType: "", password: "" })

  useEffect(() => {
    if (user && !user.error && !editData && !isLoading) {
      setEditData({
        full_name: user.full_name || "",
        username: user.username || "",
        phone: user.phone || "",
        is_active: user.is_active ?? true,
        can_deposit: user.can_deposit ?? true,
        can_withdraw: user.can_withdraw ?? true,
        can_earn_daily: user.can_earn_daily ?? true,
        new_password: ""
      })
    }
  }, [user, editData, isLoading])

  const handleSave = () => {
    setShowSaveConfirm(true)
  }

  const executeSave = async () => {
    setIsSaving(true)
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Customer profile updated successfully")
        refetch()
        queryClient.invalidateQueries()
      } else {
        toast.error(data.message || data.error || "Failed to update customer profile")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while saving changes")
    } finally {
      setIsSaving(false)
      setShowSaveConfirm(false)
    }
  }

  const executeDeleteUser = async () => {
    if (deletingRef.current || isDeleting) return
    deletingRef.current = true
    setIsDeleting(true)
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok || data.success) {
        toast.success("User deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["admin-users"] })
        setShowDeleteConfirm(false)
        router.push("/customers")
      } else {
        toast.error(data.message || data.error || "Failed to delete user")
        deletingRef.current = false
        setIsDeleting(false)
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting user")
      deletingRef.current = false
      setIsDeleting(false)
    }
  }

  const handleImpersonate = async () => {
    setIsImpersonating(true)
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${id}/impersonate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok && data.token) {
        toast.success(`Logging in as ${user.username || "user"}...`)
        window.open(`http://localhost:3000?impersonate_token=${data.token}`, "_blank")
      } else {
        toast.error(data.error || "Failed to impersonate user")
      }
    } catch (error) {
      toast.error("Failed to impersonate user")
    } finally {
      setIsImpersonating(false)
    }
  }

  const handleTriggerFinance = (type) => {
    const data = type === 'credit' ? creditData : debitData;
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      return toast.error("Please enter a valid positive amount");
    }
    setSecurityModal({
      isOpen: true,
      actionType: type,
      password: ""
    });
  };

  const handleConfirmProcessFinance = async () => {
    const { actionType, password } = securityModal;
    if (!password) {
      return toast.error("Please enter your admin password");
    }

    const payload = actionType === 'credit' 
      ? { ...creditData, balance_type: creditData.balance_type === 'main' ? 'balance' : 'withdrawable', adminPassword: password }
      : { ...debitData, balance_type: debitData.balance_type === 'main' ? 'balance' : 'withdrawable', adminPassword: password };

    const setProcessing = actionType === 'credit' ? setIsCreditProcessing : setIsDebitProcessing;
    const resetData = actionType === 'credit' 
      ? () => setCreditData({ balance_type: "main", amount: "", reason: "" })
      : () => setDebitData({ balance_type: "main", amount: "", reason: "" });

    setProcessing(true);
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${id}/${actionType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully ${actionType}ed funds!`);
        resetData();
        setSecurityModal({ isOpen: false, actionType: "", password: "" });
        refetch();
      } else {
        toast.error(data.error || data.message || `Failed to ${actionType} user`);
      }
    } catch (err) {
      toast.error(err.message || `Failed to process ${actionType}`);
    } finally {
      setProcessing(false);
    }
  };

  let symbol = "R";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  if (isLoading || !editData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A8DEE]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-card">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>{user.full_name || user.username || "Customer Details"}</span>
              <StatusBadge status={user.is_active ? "ACTIVE" : "BANNED"} />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">User Profile & Access Controls</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={handleImpersonate}
            disabled={isImpersonating}
            variant="outline" 
            className="border-border bg-card hover:bg-muted text-cyan-600 gap-2 h-9 text-xs font-semibold"
          >
            {isImpersonating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
            Login As User
          </Button>

          <Button 
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline" 
            className="border-red-200 bg-red-50/50 hover:bg-red-100 text-red-600 gap-2 h-9 text-xs font-semibold"
          >
            <Trash className="w-3.5 h-3.5" />
            Delete Account
          </Button>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#5A8DEE] hover:bg-[#477ae0] text-white gap-2 h-9 text-xs font-semibold shadow-sm"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Grid: Profile Card & Summary */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Col: Profile Overview */}
          <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border flex flex-col items-center lg:items-start text-center lg:text-left bg-muted/5">
            <div className="w-24 h-24 rounded-full border-4 border-card bg-[#5A8DEE] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
              {(user.phone || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-foreground">{user.full_name || user.username || "Member"}</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1 mb-3 justify-center lg:justify-start">
              <Phone className="w-4 h-4" /> {user.phone || user.username}
            </div>
            <div className="mb-6">
              <StatusBadge status={user.is_active ? "ACTIVE" : "BANNED"} />
            </div>

            <div className="w-full space-y-3 pt-6 border-t border-border/50 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-muted-foreground flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> User ID</span>
                <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-xs">{(user.id || "").substring(0, 12)}...</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Registered</span>
                <span className="font-medium text-foreground">{safeFormatDate(user.created_at, "MMM dd, yyyy")}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Last Login</span>
                <span className="font-medium text-foreground">{safeFormatDate(user.last_login, "MMM dd, HH:mm")}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> IP Address</span>
                <span className="font-medium text-foreground">{user.last_ip === "::1" ? "127.0.0.1 (Local)" : (user.last_ip || "Unknown")}</span>
              </div>
            </div>
          </div>

          {/* Right Col: Balances & Edit Form */}
          <div className="lg:col-span-8 p-6 space-y-8">
            {/* Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Main Balance</p>
                  <h3 className="text-2xl font-bold text-foreground">{symbol}{Number(user.balance || 0).toFixed(2)}</h3>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-xl hidden sm:block"><CreditCard className="w-5 h-5 text-blue-500" /></div>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Withdrawable</p>
                  <h3 className="text-2xl font-bold text-foreground">{symbol}{Number(user.withdrawable_balance || 0).toFixed(2)}</h3>
                </div>
                <div className="p-2.5 bg-purple-500/10 rounded-xl hidden sm:block"><WalletCards className="w-5 h-5 text-purple-500" /></div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Edit Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-foreground">Full Name</Label>
                  <Input value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} className="bg-background border-border text-foreground h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Username</Label>
                  <Input value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="bg-background border-border text-foreground h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Phone Number</Label>
                  <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="bg-background border-border text-foreground h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</Label>
                  <Input type="password" placeholder="Leave blank to keep current" value={editData.new_password} onChange={(e) => setEditData({ ...editData, new_password: e.target.value })} className="bg-background border-border text-foreground h-10" />
                </div>
              </div>
            </div>

            {/* Permissions & Controls */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Access & Permissions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <Label className="font-semibold text-foreground text-sm">Account Status</Label>
                    <p className="text-xs text-muted-foreground">{editData.is_active ? "Active" : "Banned"}</p>
                  </div>
                  <Switch checked={editData.is_active} onCheckedChange={(val) => setEditData({ ...editData, is_active: val })} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <Label className="font-semibold text-foreground text-sm">Deposit Permission</Label>
                    <p className="text-xs text-muted-foreground">{editData.can_deposit ? "Allowed" : "Disabled"}</p>
                  </div>
                  <Switch checked={editData.can_deposit} onCheckedChange={(val) => setEditData({ ...editData, can_deposit: val })} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <Label className="font-semibold text-foreground text-sm">Withdrawal Permission</Label>
                    <p className="text-xs text-muted-foreground">{editData.can_withdraw ? "Allowed" : "Disabled"}</p>
                  </div>
                  <Switch checked={editData.can_withdraw} onCheckedChange={(val) => setEditData({ ...editData, can_withdraw: val })} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <Label className="font-semibold text-foreground text-sm">Daily Mining Earning</Label>
                    <p className="text-xs text-muted-foreground">{editData.can_earn_daily ? "Allowed" : "Disabled"}</p>
                  </div>
                  <Switch checked={editData.can_earn_daily} onCheckedChange={(val) => setEditData({ ...editData, can_earn_daily: val })} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* Manual Balance Adjustments (Credit / Debit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Credit Card */}
        <Card className="border-border shadow-sm bg-card">
          <div className="p-5 border-b border-border bg-emerald-500/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              Credit User Balance
            </h3>
            <Badge showDot={false} className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">Add Funds</Badge>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Target Balance</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="credit_type" value="main" checked={creditData.balance_type === 'main'} onChange={() => setCreditData({ ...creditData, balance_type: 'main' })} />
                  Main Deposit Balance
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="credit_type" value="withdrawable" checked={creditData.balance_type === 'withdrawable'} onChange={() => setCreditData({ ...creditData, balance_type: 'withdrawable' })} />
                  Withdrawable Balance
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Amount ({symbol})</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={creditData.amount} 
                onChange={(e) => setCreditData({ ...creditData, amount: e.target.value })} 
                className="bg-background border-border text-foreground h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Reason / Reference (Optional)</Label>
              <Input 
                placeholder="e.g. Compensation, Promo bonus" 
                value={creditData.reason} 
                onChange={(e) => setCreditData({ ...creditData, reason: e.target.value })} 
                className="bg-background border-border text-foreground h-10"
              />
            </div>

            <Button 
              onClick={() => handleTriggerFinance('credit')} 
              disabled={isCreditProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 mt-2"
            >
              {isCreditProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Apply Credit
            </Button>
          </CardContent>
        </Card>

        {/* Debit Card */}
        <Card className="border-border shadow-sm bg-card">
          <div className="p-5 border-b border-border bg-red-500/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <MinusCircle className="w-5 h-5 text-red-500" />
              Debit User Balance
            </h3>
            <Badge showDot={false} className="bg-red-500/10 text-red-600 border border-red-500/20 text-xs">Deduct Funds</Badge>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Target Balance</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="debit_type" value="main" checked={debitData.balance_type === 'main'} onChange={() => setDebitData({ ...debitData, balance_type: 'main' })} />
                  Main Deposit Balance
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="debit_type" value="withdrawable" checked={debitData.balance_type === 'withdrawable'} onChange={() => setDebitData({ ...debitData, balance_type: 'withdrawable' })} />
                  Withdrawable Balance
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Amount ({symbol})</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={debitData.amount} 
                onChange={(e) => setDebitData({ ...debitData, amount: e.target.value })} 
                className="bg-background border-border text-foreground h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Reason / Reference (Optional)</Label>
              <Input 
                placeholder="e.g. Penalty, Chargeback" 
                value={debitData.reason} 
                onChange={(e) => setDebitData({ ...debitData, reason: e.target.value })} 
                className="bg-background border-border text-foreground h-10"
              />
            </div>

            <Button 
              onClick={() => handleTriggerFinance('debit')} 
              disabled={isDebitProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-10 mt-2"
            >
              {isDebitProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MinusCircle className="w-4 h-4 mr-2" />}
              Apply Debit
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* History Tabs (Transactions / Investments) */}
      <Card className="border-border shadow-sm bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center gap-4">
          <Button 
            variant={activeHistoryTab === 'transactions' ? 'default' : 'ghost'}
            onClick={() => setActiveHistoryTab('transactions')}
            className={`h-9 text-xs font-semibold ${activeHistoryTab === 'transactions' ? 'bg-[#5A8DEE] text-white' : 'text-muted-foreground'}`}
          >
            <History className="w-3.5 h-3.5 mr-1.5" /> Recent Transactions
          </Button>
          <Button 
            variant={activeHistoryTab === 'investments' ? 'default' : 'ghost'}
            onClick={() => setActiveHistoryTab('investments')}
            className={`h-9 text-xs font-semibold ${activeHistoryTab === 'investments' ? 'bg-[#5A8DEE] text-white' : 'text-muted-foreground'}`}
          >
            <WalletCards className="w-3.5 h-3.5 mr-1.5" /> Active Investments
          </Button>
        </div>

        {activeHistoryTab === 'transactions' && (
          <div className="overflow-x-auto p-0">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">TX ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">TYPE</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">AMOUNT</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">DESCRIPTION</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(user.transactions) && user.transactions.length > 0 ? (
                  user.transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-b border-border hover:bg-muted/20">
                      <TableCell className="font-mono text-xs text-foreground font-medium">
                        {tx.id.substring(0, 10)}...
                      </TableCell>
                      <TableCell>
                        <Badge showDot={false} className="bg-muted text-foreground border-border text-xs font-semibold">{tx.type}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-sm text-[#5A8DEE]">
                        {symbol}{Number(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-xs truncate">
                        {tx.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFormatDate(tx.created_at, "MMM dd, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground text-sm border-none">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeHistoryTab === 'investments' && (
          <div className="overflow-x-auto p-0">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">PLAN ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">AMOUNT</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">STATUS</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">CREATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(user.investments) && user.investments.length > 0 ? (
                  user.investments.map((inv) => (
                    <TableRow key={inv.id} className="border-b border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-sm text-foreground">{(inv.plan_id || "").substring(0, 8)}...</TableCell>
                      <TableCell className="font-bold text-sm text-[#5A8DEE]">
                        {symbol}{Number(inv.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge showDot={false} className="bg-[#5A8DEE]/10 text-[#5A8DEE] border border-[#5A8DEE]/20 text-xs font-medium shadow-sm">{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFormatDate(inv.created_at, "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground text-sm border-none">
                      No active investments
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card">
          <DialogHeader className="border-b border-border bg-muted/20 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6 pb-6">
            <p className="text-muted-foreground">Are you absolutely sure you want to delete this user? This action cannot be undone and will remove all associated data including transactions and investments.</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-border">Cancel</Button>
              <Button onClick={executeDeleteUser} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white">
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash className="w-4 h-4 mr-2" />}
                Yes, Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card">
          <DialogHeader className="border-b border-border bg-muted/20 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Save className="w-5 h-5 text-[#5A8DEE]" />
              Confirm Changes
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6 pb-6">
            <p className="text-muted-foreground">Are you sure you want to save these changes to the user's profile and permissions?</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSaveConfirm(false)} className="border-border bg-background">Cancel</Button>
              <Button onClick={executeSave} disabled={isSaving} className="bg-[#5A8DEE] hover:bg-[#477ae0] text-white">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Verification Modal */}
      <Dialog 
        open={securityModal.isOpen} 
        onOpenChange={(open) => setSecurityModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Confirm Admin Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              You are about to {securityModal.actionType} <strong>{symbol}{Number(securityModal.actionType === 'credit' ? creditData.amount : debitData.amount).toFixed(2)}</strong> to this user's <strong>{securityModal.actionType === 'credit' ? creditData.balance_type : debitData.balance_type} balance</strong>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Enter Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password to confirm"
                value={securityModal.password}
                onChange={(e) => setSecurityModal(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmProcessFinance();
                }}
                className="bg-background border-border text-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
              className="border-border text-foreground bg-background hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProcessFinance}
              className={`text-white ${securityModal.actionType === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
