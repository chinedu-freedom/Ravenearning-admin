"use client"

import Link from "next/link"
import { ChevronLeft, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, Controller } from "react-hook-form"
import { usePost } from "@/hooks/useApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AddCountryPage() {
  const router = useRouter()
  const createCountryMutation = usePost("/admin/countries")
  
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      country_code: "",
      country_name: "",
      currency_symbol: "",
      currency_code: "",
      exchange_rate: 1,
      status: "active",
      auto_update: true
    }
  })

  const onSubmit = async (data) => {
    try {
      await createCountryMutation.mutateAsync(data)
      // toast call removed per user
      router.push("/settings/countries")
    } catch (error) {
      // Handled by useApi
    }
  }
  return (
    <div className="space-y-6 pb-10">
      <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-0">
          
          {/* Header Section */}
          <div className="p-6 border-b border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-[1.2rem] font-bold text-gray-800">Add New Country</h2>
            <Link href="/settings/countries">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 text-[13px] font-bold rounded-lg shadow-sm border-0 flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="p-8 space-y-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Row 1 */}
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-1">Country Code (ISO)</label>
                <Input {...register("country_code", { required: true })} placeholder="e.g. NG, IN, US" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
                <p className="text-[11px] text-gray-400 mt-1.5">2-letter ISO country code</p>
              </div>
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-1">Country Name</label>
                <Input {...register("country_name", { required: true })} placeholder="e.g. Nigeria, India" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              </div>

              {/* Row 2 */}
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-1">Currency Symbol</label>
                <Input {...register("currency_symbol", { required: true })} placeholder="e.g. ₦, $, ₹" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-1">Currency Code</label>
                <Input {...register("currency_code", { required: true })} placeholder="e.g. NGN, USD, INR" className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 text-gray-700 text-[13px] placeholder:text-gray-400 rounded-lg bg-white" />
              </div>

              {/* Row 3 */}
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
              <Button disabled={createCountryMutation.isPending} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2">
                {createCountryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Country
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
      </form>
    </div>
  )
}
