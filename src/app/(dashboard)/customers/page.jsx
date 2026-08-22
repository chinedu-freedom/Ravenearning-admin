"use client"

import { useState } from "react"
import { useFetchData, useDelete } from "@/hooks/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Eye, Trash2, Users, Shield, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: usersRes, isLoading, refetch } = useFetchData("/admin/users", ["admin-users"])
  const deleteMutation = useDelete((id) => `/admin/users/${id}`, ["admin-users"])

  const users = Array.isArray(usersRes) ? usersRes : usersRes?.users || usersRes?.data || []

  const filteredUsers = users.filter(
    (user) =>
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const executeDeleteUser = async () => {
    if (!userToDelete) return
    try {
      setIsDeleting(true)
      await deleteMutation.mutateAsync(userToDelete.id)
      setUserToDelete(null)
      refetch()
    } catch (err) {
      // Handled by useDelete hook
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 font-['Poppins',sans-serif]">
      {/* Header Banner */}
      <div className="bg-white border-none shadow-sm rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, search, and manage registered members and their accounts.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by phone number, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-800">Registered Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader className="bg-gray-50/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider pl-6 py-4">USER ID / PHONE</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">BALANCE (ZAR)</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">WITHDRAWABLE (ZAR)</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">SPIN ACCESS</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider py-4">JOINED DATE</TableHead>
                  <TableHead className="font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right pr-6 py-4">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4f8cff]" />
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 bg-gray-50/30">
                      <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-base font-medium text-gray-600 mb-1">No customers found</p>
                      <p className="text-sm text-gray-500">There are no users matching your search term.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const joinedDate = user.created_at ? format(new Date(user.created_at), "MMM dd, yyyy") : "N/A"

                    return (
                      <TableRow key={user.id} className="hover:bg-gray-50 border-b last:border-0">
                        <TableCell className="pl-6 py-4">
                          <div className="font-bold text-[14px] text-gray-800 leading-tight">
                            {user.phone || "No Phone"}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            ID: {user.id ? `${user.id.slice(0, 8)}...` : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-bold text-gray-900 text-[14px]">
                          ZAR {Number(user.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-4 font-bold text-emerald-600 text-[14px]">
                          ZAR {Number(user.withdrawable_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${user.can_spin !== false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"} border-0 capitalize shadow-none font-bold text-xs`}>
                            {user.can_spin !== false ? "Allowed" : "Blocked"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-gray-600 py-4">
                          {joinedDate}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Link href={`/customers/${user.id}`}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-blue-600 border-gray-200 hover:bg-blue-50"
                                title="View Customer Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 border-gray-200 hover:bg-red-50"
                              onClick={() => handleDeleteClick(user)}
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Delete User Account</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete user {userToDelete?.phone}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
