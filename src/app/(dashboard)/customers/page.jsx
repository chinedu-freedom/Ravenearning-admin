"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Edit, 
  LogIn, 
  Lock, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Phone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { useFetchData, useDelete } from "@/hooks/useApi"
import { toast } from "sonner"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch Users
  const { data: usersResponse, isLoading, refetch } = useFetchData("/admin/users", ["admin-users"])
  const deleteMutation = useDelete((id) => `/admin/users/${id}`, ["admin-users"])

  // Read platform symbol
  let symbol = "R";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || [])

  // Calculate dynamic stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const bannedUsers = users.filter(u => !u.is_active).length

  // Filter users based on query and status (specifically supporting phone search)
  const filteredUsers = users.filter(user => {
    const rawSearch = searchTerm.trim().toLowerCase();
    const digitsSearch = rawSearch.replace(/\D/g, "");

    const userPhone = (user.phone || "").toLowerCase();
    const userPhoneDigits = (user.phone || "").replace(/\D/g, "");
    const userFullName = (user.full_name || "").toLowerCase();
    const userUsername = (user.username || "").toLowerCase();
    const userId = (user.id || "").toLowerCase();

    const matchesSearch = 
      !rawSearch ||
      userPhone.includes(rawSearch) ||
      (digitsSearch.length > 0 && userPhoneDigits.includes(digitsSearch)) ||
      userFullName.includes(rawSearch) ||
      userUsername.includes(rawSearch) ||
      userId.includes(rawSearch);

    const matchesStatus = 
      statusFilter === "all-status" || 
      (statusFilter === "active" && user.is_active) || 
      (statusFilter === "banned" && !user.is_active);

    return matchesSearch && matchesStatus;
  })

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const executeDeleteUser = async () => {
    if (!userToDelete) return
    try {
      setIsDeleting(true)
      await deleteMutation.mutateAsync(userToDelete.id)
      toast.success("User account deleted successfully")
      setUserToDelete(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-none shadow-sm rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">All Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, monitor and update user profiles across your platform.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-gray-500 tracking-wide">Total Users</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{totalUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-gray-500 tracking-wide">Active Users</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-gray-500 tracking-wide">Banned Users</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">{bannedUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
              <UserX className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-sm bg-white rounded-lg overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by phone number, name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 h-10 w-full rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200 h-10 text-gray-600">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider w-[50px] py-4">#</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">USER</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">DEPOSIT BALANCE</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">EARNING BALANCE</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">REGISTERED</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">STATUS</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500 bg-gray-50/30">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5A8DEE]" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-600">No users found</p>
                      <p className="text-sm mt-1 text-gray-400">We couldn't find any users matching your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 border-b last:border-0">
                  <TableCell className="font-medium text-gray-700 text-[13px] py-4">
                    {user.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#5A8DEE] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(user.phone || user.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-[13px] leading-tight">{user.full_name || user.username || "Member"}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {user.phone || user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className="font-bold text-[#5A8DEE] text-[13px]">{symbol}{Number(user.balance || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-bold text-blue-600 text-[13px]">{symbol}{Number(user.withdrawable_balance || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-[12px] text-gray-600 py-4 whitespace-nowrap">
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={user.is_active ? "ACTIVE" : "BANNED"} />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/customers/${user.id}`}>
                        <Button variant="outline" size="icon" className="h-7 w-7 text-blue-500 border-gray-200 hover:bg-blue-50" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleDeleteClick(user)}
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 text-red-500 border-gray-200 hover:bg-red-50" 
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete User</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{userToDelete.full_name || userToDelete.username || userToDelete.phone}</span>? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="border-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={executeDeleteUser}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
