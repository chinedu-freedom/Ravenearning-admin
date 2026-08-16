"use client"

import Link from "next/link"
import { ChevronLeft, Save, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { useFetchData, usePut } from "@/hooks/useApi"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"

export default function EditLanguagePage() {
  const router = useRouter()
  const { id } = useParams()
  
  const { data: languageData, isLoading: isLoadingData } = useFetchData(`/admin/languages/${id}`)
  const updateLanguageMutation = usePut(`/admin/languages/${id}`)
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      language_code: "",
      language_name: "",
      native_name: "",
      flag_emoji: "",
      text_direction: "ltr",
      sort_order: 0,
      status: "active"
    }
  })

  useEffect(() => {
    if (languageData) {
      reset({
        language_code: languageData.language_code,
        language_name: languageData.language_name,
        native_name: languageData.native_name,
        flag_emoji: languageData.flag_emoji,
        text_direction: languageData.text_direction,
        sort_order: Number(languageData.sort_order),
        status: languageData.status ? "active" : "inactive"
      })
    }
  }, [languageData, reset])

  const onSubmit = async (data) => {
    try {
      await updateLanguageMutation.mutateAsync(data)
      // toast call removed per user
      router.push("/settings/languages")
    } catch (error) {
      // Handled by useApi
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-[1.2rem] font-bold text-gray-800">Edit Language</h2>
        <Link href="/settings/languages">
          <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 text-[13px] font-bold rounded-lg shadow-sm border-0 flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            Back To List
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8 space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Row 1 */}
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Language Code</label>
              <Input {...register("language_code", { required: true })} placeholder="e.g. en, es, pt" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              <p className="text-[11px] text-gray-400 mt-1.5">ISO language code (e.g. en, es, pt, ru, hi)</p>
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Language Name (English)</label>
              <Input {...register("language_name", { required: true })} placeholder="e.g. English, Spanish" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
            </div>

            {/* Row 2 */}
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Native Name</label>
              <Input {...register("native_name", { required: true })} placeholder="e.g. Español, Português" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              <p className="text-[11px] text-gray-400 mt-1.5">Name in the language itself</p>
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Flag Emoji</label>
              <Input {...register("flag_emoji", { required: true })} placeholder="🌐" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              <p className="text-[11px] text-gray-400 mt-1.5">Emoji flag for the language</p>
            </div>

            {/* Row 3 */}
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Text Direction</label>
              <Controller
                name="text_direction"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 w-full text-gray-700 text-[13px] rounded-lg bg-white">
                      <SelectValue placeholder="Select Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                      <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">RTL for Arabic, Hebrew, etc.</p>
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Sort Order</label>
              <Input type="number" {...register("sort_order", { required: true })} className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] rounded-lg bg-white" />
              <p className="text-[11px] text-gray-400 mt-1.5">Lower numbers appear first</p>
            </div>

            {/* Row 4 */}
            <div>
              <label className="text-[13px] font-bold text-gray-700 block mb-1">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 w-full text-gray-700 text-[13px] rounded-lg bg-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button disabled={updateLanguageMutation.isPending} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2">
              {updateLanguageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Language
            </Button>
          </div>

        </CardContent>
      </Card>
      </form>
    </div>
  )
}
