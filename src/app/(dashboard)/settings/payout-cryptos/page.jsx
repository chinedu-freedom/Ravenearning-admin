"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetchData, useDelete } from "@/hooks/useApi"

export default function PayoutCryptosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    cryptoId: null,
  })

  const { data: cryptos, isLoading } = useFetchData("/admin/settings/payout-cryptos")
  const deleteCryptoMutation = useDelete((id) => `/admin/settings/payout-cryptos/${id}`, "/admin/settings/payout-cryptos")

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, cryptoId: id })
  }

  const executeDelete = async () => {
    if (confirmDialog.cryptoId) {
      try {
        await deleteCryptoMutation.mutateAsync(confirmDialog.cryptoId)
      } catch (error) {
        // error handled by hook
      } finally {
        setConfirmDialog({ isOpen: false, cryptoId: null })
      }
    }
  }

  const filteredCryptos = cryptos?.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.network.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === "active") matchesStatus = c.status === true
    if (statusFilter === "inactive") matchesStatus = c.status === false

    return matchesSearch && matchesStatus
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payout Cryptocurrencies</h1>
          <p className="text-gray-500 text-sm">Manage cryptocurrency networks and addresses for withdrawals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/settings/payout-cryptos/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 font-bold shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Crypto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-150 shadow-sm bg-white rounded-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <Input
                  placeholder="Search by name, symbol, or network..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-0 focus:border-blue-500/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-150 shadow-sm bg-white rounded-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Table className="min-w-[1000px] whitespace-nowrap">
                <TableHeader className="bg-gray-50/50 border-y">
                  <TableRow className="border-b border-gray-200 bg-transparent hover:bg-transparent">
                    <TableHead className="w-[60px] font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">S.N</TableHead>
                    <TableHead className="w-[60px] font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Icon</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Name</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Symbol</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Network</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Sort Order</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCryptos.length > 0 ? filteredCryptos.map((item, index) => (
                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-700 py-4">{index + 1}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          {item.icon ? (
                            <img src={item.icon} alt={item.symbol} className="w-8 h-8 object-contain" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[11px] text-gray-500 font-bold">
                              {item.symbol.substring(0, 2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-800 py-4">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                          {item.symbol}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col items-start">
                          <span className="inline-flex items-center justify-center bg-cyan-50 border border-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                            {item.network}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-1">{item.network_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-700 py-4">
                        {item.sort_order}
                      </TableCell>
                      <TableCell className="py-4">
                        {item.status ? (
                          <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center bg-red-100 text-red-800 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/settings/payout-cryptos/edit/${item.id}`}>
                            <Button size="icon" className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 shadow-none flex items-center justify-center text-blue-600">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="icon" 
                            disabled={deleteCryptoMutation.isPending}
                            onClick={() => handleDeleteClick(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 shadow-none flex items-center justify-center text-red-600"
                          >
                            {deleteCryptoMutation.isPending && confirmDialog.cryptoId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No payout cryptocurrencies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog({ ...confirmDialog, isOpen })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cryptocurrency? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg font-bold" onClick={() => setConfirmDialog({ isOpen: false, cryptoId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-lg font-bold" onClick={executeDelete} disabled={deleteCryptoMutation.isPending}>
              {deleteCryptoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
