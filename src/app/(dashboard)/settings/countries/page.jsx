"use client"

import Link from "next/link"
import { Info, Edit, Trash2, RefreshCw, Plus, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFetchData, useDelete, usePost } from "@/hooks/useApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CountriesRatesPage() {
  const router = useRouter()
  const { data: countries, isLoading } = useFetchData("/admin/countries")
  const deleteCountryMutation = useDelete((id) => `/admin/countries/${id}`, "/admin/countries")
  const updateRatesMutation = usePost("/admin/countries/update-rates", "/admin/countries")

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this country? This action cannot be undone.")) {
      try {
        await deleteCountryMutation.mutateAsync(id)
      } catch (error) {
        // Handled by useApi
      }
    }
  }

  const handleUpdateRates = async () => {
    try {
      await updateRatesMutation.mutateAsync({})
    } catch (error) {
      // Handled by useApi
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-0">
          
          {/* Header Section */}
          <div className="p-6 border-b border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-[1.2rem] font-bold text-gray-800">Country & Currency Management</h2>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleUpdateRates}
                disabled={updateRatesMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2"
              >
                {updateRatesMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Update All Rates
              </Button>
              <Link href="/settings/countries/add">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Country
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
              <div className="text-[13px] leading-relaxed text-blue-800">
                <p>
                  <span className="font-bold">Exchange Rate:</span> Set how much 1 unit of site currency (USD) equals in local currency.
                </p>
                <p>
                  <span className="font-bold">Example:</span> If 1 USD = 1600 NGN, enter 1600 as the exchange rate.
                </p>
                <p>
                  <span className="font-bold">Auto Update:</span> Enable to automatically fetch real-time rates from exchange rate APIs.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader className="bg-gray-50/50 border-y">
                  <TableRow className="border-b border-gray-200 bg-transparent hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4 w-[80px]">Code</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Country</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Currency</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Exchange Rate</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Auto Update</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries?.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="py-4">
                        <span className="font-bold text-[13px] text-gray-700">{item.country_code}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-[14px] text-gray-700">{item.country_name}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-[12px] font-bold min-w-[80px]">
                          {item.currency_symbol} ({item.currency_code})
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[13px] text-gray-700">
                            $1 = <span className="text-black">{Number(item.exchange_rate).toFixed(2)} {item.currency_code}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {item.auto_update ? (
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                            AUTO
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                            MANUAL
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${item.status ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/settings/countries/edit/${item.id}`}>
                            <Button size="icon" className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 shadow-none">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button disabled={deleteCountryMutation.isPending} onClick={() => handleDelete(item.id)} size="icon" className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 shadow-none">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!countries || countries.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                        No countries found. Add a new country.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
