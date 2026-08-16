"use client"

import Link from "next/link"
import { Info, Edit, Trash2, Plus, Check, Loader2 } from "lucide-react"
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
import { useFetchData, useDelete, usePatch } from "@/hooks/useApi"
import { toast } from "sonner"

export default function LanguagesPage() {
  const { data: languages, isLoading } = useFetchData("/admin/languages")
  const deleteLanguageMutation = useDelete((id) => `/admin/languages/${id}`, "/admin/languages")
  const setAsDefaultMutation = usePatch((id) => `/admin/languages/${id}/default`, "/admin/languages")

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
      try {
        await deleteLanguageMutation.mutateAsync(id)
      } catch (error) {}
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await setAsDefaultMutation.mutateAsync({ id })
    } catch (error) {}
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
            <h2 className="text-[1.2rem] font-bold text-gray-800">Language Management</h2>
            <Link href="/settings/languages/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Language
              </Button>
            </Link>
          </div>

          <div className="p-6">
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
              <div className="text-[13px] leading-relaxed text-blue-800">
                <p>
                  <span className="font-bold">Default Language:</span> The default language is used for new visitors who haven't selected a language preference.
                </p>
                <p>
                  Click "Set Default" to change the default language for your site.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader className="bg-gray-50/50 border-y">
                  <TableRow className="border-b border-gray-200 bg-transparent hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Flag</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Code</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Name</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Native Name</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Direction</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Default</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[11px] uppercase tracking-wider py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages?.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <span className="font-bold text-[14px] text-gray-800 tracking-wide">{item.flag_emoji || item.language_code.toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-bold text-[13px] text-gray-800 uppercase">{item.language_code}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-[13px] text-gray-700">{item.language_name}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-[13px] text-gray-700">{item.native_name}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                          {item.text_direction}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {item.is_default ? (
                          <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-[10px] font-bold tracking-wider gap-1">
                            <Check className="w-3.5 h-3.5" />
                            DEFAULT
                          </span>
                        ) : (
                          <button disabled={setAsDefaultMutation.isPending} onClick={() => handleSetDefault(item.id)} className="inline-flex items-center justify-center bg-transparent border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-[11px] font-medium transition-colors">
                            Set Default
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${item.status ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/settings/languages/edit/${item.id}`}>
                            <Button size="icon" className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 shadow-none">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          {!item.is_default && (
                            <Button disabled={deleteLanguageMutation.isPending} onClick={() => handleDelete(item.id)} size="icon" className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 shadow-none">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!languages || languages.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                        No languages found. Add a new language.
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
