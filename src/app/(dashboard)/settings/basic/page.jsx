"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFetchData, usePut } from "@/hooks/useApi"
import { useImageSrc } from "@/hooks/useImageSrc"
import { 
  Building2, 
  HeadphonesIcon, 
  Settings2, 
  Upload, 
  Clock, 
  Loader2 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const basicSettingsSchema = z.object({
  site_name: z.string().min(1, "Site Name is required"),
  currency_name: z.string().min(1, "Currency Name is required"),
  currency_symbol: z.string().min(1, "Currency Symbol is required"),
  timezone: z.string().optional(),
  registration_bonus: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  telegram_support: z.string().optional(),
  telegram_group: z.string().optional(),
  deposit_notice: z.string().optional(),
  withdrawal_notice: z.string().optional(),
  daily_withdrawal_limit: z.coerce.number().min(0).default(0),
  min_deposit: z.coerce.number().min(0).default(10),
  max_deposit: z.coerce.number().min(0).default(10000),
  deposit_charge: z.coerce.number().min(0).default(0),
  min_withdrawal: z.coerce.number().min(0).default(10),
  max_withdrawal: z.coerce.number().min(0).default(10000),
  withdrawal_charge: z.coerce.number().min(0).default(2),
  withdrawal_open_time: z.string().optional(),
  withdrawal_close_time: z.string().optional(),
  require_investment_to_withdraw: z.boolean().default(false),
  min_investment_to_withdraw: z.coerce.number().min(0).default(1),
  quickpay_enabled: z.boolean().default(true),
  quickpay_merchant: z.string().optional(),
  quickpay_key: z.string().optional(),
  quickpay_url: z.string().optional(),
  quickpay_channel: z.string().optional(),
})

export default function BasicSettingsPage() {
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")

  const { data: responseData, isLoading } = useFetchData("/settings", ["platform-settings"])
  const settingsData = responseData?.settings || responseData

  const updateMutation = usePut("/admin/settings/platform", ["platform-settings"])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(basicSettingsSchema),
    defaultValues: {
      site_name: "",
      currency_name: "ZAR",
      currency_symbol: "R",
      timezone: "UTC",
      registration_bonus: 0,
      telegram_support: "",
      telegram_group: "",
      deposit_notice: "",
      withdrawal_notice: "",
      daily_withdrawal_limit: 0,
      min_deposit: 10,
      max_deposit: 10000,
      deposit_charge: 0,
      min_withdrawal: 100,
      max_withdrawal: 10000,
      withdrawal_charge: 15,
      withdrawal_open_time: "",
      withdrawal_close_time: "",
      require_investment_to_withdraw: false,
      min_investment_to_withdraw: 1,
      quickpay_enabled: true,
      quickpay_merchant: "customerTest01",
      quickpay_key: "147258",
      quickpay_url: "https://safricaapi.quickn.vip",
      quickpay_channel: "8001",
    }
  })

  const previewSrc = useImageSrc(logoPreview, "")

  useEffect(() => {
    if (settingsData) {
      if (settingsData.platform_logo) {
        setLogoPreview(settingsData.platform_logo)
      }
      reset({
        site_name: settingsData.site_name || "",
        currency_name: settingsData.currency_name || "ZAR",
        currency_symbol: settingsData.currency_symbol || "R",
        timezone: settingsData.timezone || "UTC",
        registration_bonus: Number(settingsData.registration_bonus) || 0,
        telegram_support: settingsData.telegram_support || settingsData.telegram_support_link || "",
        telegram_group: settingsData.telegram_group || settingsData.telegram_group_chat || settingsData.telegram_link || "",
        deposit_notice: settingsData.deposit_notice || "",
        withdrawal_notice: settingsData.withdrawal_notice || "",
        daily_withdrawal_limit: Number(settingsData.daily_withdrawal_limit) || 0,
        withdrawal_open_time: settingsData.withdrawal_open_time || "",
        withdrawal_close_time: settingsData.withdrawal_close_time || "",
        activity_series_enabled: settingsData.activity_series_enabled ?? false,
        require_investment_to_withdraw: settingsData.require_investment_to_withdraw ?? false,
        min_investment_to_withdraw: settingsData.min_investment_to_withdraw || 1,
        min_withdrawal: Number(settingsData.min_withdrawal) || 100,
        max_withdrawal: Number(settingsData.max_withdrawal) || 10000,
        withdrawal_charge: Number(settingsData.withdrawal_charge) || 15,
        max_deposit: Number(settingsData.max_deposit) || 10000,
        min_deposit: Number(settingsData.min_deposit) || 10,
        deposit_charge: Number(settingsData.deposit_charge) || 0,
        quickpay_enabled: settingsData.quickpay_enabled ?? true,
        quickpay_merchant: settingsData.quickpay_merchant || "customerTest01",
        quickpay_key: settingsData.quickpay_key || "147258",
        quickpay_url: settingsData.quickpay_url || "https://safricaapi.quickn.vip",
        quickpay_channel: settingsData.quickpay_channel || "8001"
      })
    }
  }, [settingsData, reset])

  const onSubmit = async (formData) => {
    try {
      let base64Logo = settingsData?.platform_logo || "";
      
      if (logoFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoFile);
        });
        base64Logo = await base64Promise;
      }

      const payload = {
        ...formData,
        site_title: formData.site_name,
        telegram_link: formData.telegram_group,
        telegram_group_chat: formData.telegram_group,
        platform_logo: base64Logo,
        registration_bonus: Number(formData.registration_bonus),
        daily_withdrawal_limit: Number(formData.daily_withdrawal_limit),
        withdrawal_open_time: String(formData.withdrawal_open_time || "").trim(),
        withdrawal_close_time: String(formData.withdrawal_close_time || "").trim(),
        activity_series_enabled: Boolean(formData.activity_series_enabled),
        min_deposit: Number(formData.min_deposit),
        max_deposit: Number(formData.max_deposit),
        deposit_charge: Number(formData.deposit_charge),
        min_withdrawal: Number(formData.min_withdrawal),
        max_withdrawal: Number(formData.max_withdrawal),
        withdrawal_charge: Number(formData.withdrawal_charge),
        min_investment_to_withdraw: Number(formData.min_investment_to_withdraw),
        quickpay_enabled: Boolean(formData.quickpay_enabled),
        quickpay_merchant: formData.quickpay_merchant,
        quickpay_key: formData.quickpay_key,
        quickpay_url: formData.quickpay_url,
        quickpay_channel: formData.quickpay_channel,
      }

      await updateMutation.mutateAsync(payload)
      if (typeof window !== "undefined" && formData.currency_symbol) {
        localStorage.setItem("admin-platform-settings-symbol", formData.currency_symbol);
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-2 pb-12">

      {/* Section 1: Basic Information */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">Configure your company identity, system currencies and brand assets</p>
          </div>

          <div className="mb-8 p-6 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {previewSrc ? (
                  <img src={previewSrc} alt="Platform Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <label className="text-[14px] font-bold text-gray-800 block mb-1">Platform Brand Logo</label>
                <p className="text-[12px] text-gray-500 mb-3">Upload your main brand logo. Recommended transparent PNG or SVG.</p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative cursor-pointer bg-white hover:bg-gray-50 text-blue-600 border-blue-200 hover:border-blue-300 font-semibold text-xs h-9 px-4 rounded-lg shadow-none"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        <div className="flex flex-col space-y-2 md:col-span-2 bg-blue-50/60 p-5 rounded-2xl border border-blue-100/80 mb-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-extrabold text-slate-900">
                  Activity Series Mode (Temporal Event Packages)
                </label>
                <span className="text-[10px] bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  FEATURE TOGGLE
                </span>
              </div>

              <Controller
                name="activity_series_enabled"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        !field.value
                          ? "bg-white border-blue-500 ring-2 ring-blue-500/20 text-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                      }`}
                      onClick={() => field.onChange(false)}
                    >
                      <input
                        type="radio"
                        name="activity_series_enabled_radio"
                        checked={!field.value}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-extrabold text-[13px] block leading-tight text-slate-900">
                          Disabled (Hidden)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Activity Series tab is hidden from members
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        field.value
                          ? "bg-white border-blue-500 ring-2 ring-blue-500/20 text-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                      }`}
                      onClick={() => field.onChange(true)}
                    >
                      <input
                        type="radio"
                        name="activity_series_enabled_radio"
                        checked={Boolean(field.value)}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-extrabold text-[13px] block leading-tight text-slate-900">
                          Enabled (Active)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Active for members with a VIP plan
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              />

              <p className="text-[11.5px] text-blue-600 mt-1 font-medium">
                When enabled, members who have activated a VIP package can view and activate Activity Series packages.
              </p>
            </div>


            <ValidatedInput label="Registration Bonus" name="registration_bonus" type="number" register={register} requiredNote={false} />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Contact & Support Links */}
      <Card className="border-none shadow-sm bg-white rounded-lg pb-10">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5" />
              Contact & Support Links
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">Configure support contact and community links displayed on the Help and Service pages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ValidatedInput 
              label="Telegram Support (Customer Service)" 
              name="telegram_support"
              register={register}
              subText="Direct link to your Telegram support account for customer inquiries" 
            />
            <ValidatedInput 
              label="Telegram Group Chat" 
              name="telegram_group"
              register={register}
              subText="Telegram group link for community discussions and member interactions" 
            />
            
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
              <div className="h-full">
                <RichTextEditor 
                  label="Recharge Notice"
                  name="deposit_notice"
                  control={control}
                />
              </div>
              <div className="h-full">
                <RichTextEditor 
                  label="Withdraw Notice"
                  name="withdrawal_notice"
                  control={control}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* Quick Pay Automatic Gateway Section */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2 mb-1">
              <Settings2 className="w-5 h-5" />
              Quick Pay Automatic Payment Gateway
            </h2>
            <p className="text-[12px] text-gray-400">Configure Quick Pay instant payment gateway integration for South Africa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-bold text-gray-700">Quick Pay Automatic Status</label>
              <Controller
                name="quickpay_enabled"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? "enabled" : "disabled"} onValueChange={(val) => field.onChange(val === "enabled")}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 rounded-lg text-gray-700 text-[13px] bg-white">
                      <SelectValue placeholder="Select Gateway Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled (Automatic Invoices & Instant Webhook Approval)</SelectItem>
                      <SelectItem value="disabled">Disabled (Manual Admin Review Only)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <ValidatedInput 
              label="Merchant Code (payMemberId)" 
              name="quickpay_merchant"
              register={register}
              subText="Your Quick Pay merchant account code (e.g. customerTest01)" 
            />

            <ValidatedInput 
              label="Secret Key (MER_KEY)" 
              name="quickpay_key"
              register={register}
              subText="Your Quick Pay merchant secret key for MD5 signing" 
            />

            <ValidatedInput 
              label="Gateway Base URL" 
              name="quickpay_url"
              register={register}
              subText="API base URL (e.g. https://safricaapi.quickn.vip)" 
            />

            <ValidatedInput 
              label="Pay Channel Code" 
              name="quickpay_channel"
              register={register}
              subText="Payment channel code for South Africa ZAR (default: 8001)" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Withdrawal Settings */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5" />
              Deposit & Withdrawal Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ValidatedInput 
              label="Daily Withdrawal Limit (times)" 
              name="daily_withdrawal_limit"
              type="number"
              register={register}
              subText="How many times a user can withdraw per day" 
            />
            <ValidatedInput 
              label="Minimum Deposit" 
              name="min_deposit"
              type="number"
              register={register}
              subText="Minimum amount a user can deposit" 
            />
            <ValidatedInput 
              label="Maximum Deposit" 
              name="max_deposit"
              type="number"
              register={register}
              subText="Maximum amount a user can deposit per request" 
            />
            <ValidatedInput 
              label="Deposit Charge (%)" 
              name="deposit_charge"
              type="number"
              register={register}
              subText="Percentage fee applied to deposits" 
            />
            <ValidatedInput 
              label="Minimum Payout" 
              name="min_withdrawal"
              type="number"
              register={register}
              subText="Minimum amount a user can withdraw" 
            />
            <ValidatedInput 
              label="Maximum Payout" 
              name="max_withdrawal"
              type="number"
              register={register}
              subText="Maximum amount a user can withdraw per request" 
            />
            <ValidatedInput 
              label="Payout Charge (%)" 
              name="withdrawal_charge"
              type="number"
              register={register}
              subText="Percentage fee applied to withdrawals" 
            />
            <ValidatedInput 
              label="Withdrawal Opening Time" 
              name="withdrawal_open_time"
              register={register}
              icon={Clock}
              subText="Time when withdrawals open (24-hour format)" 
            />
            <ValidatedInput 
              label="Withdrawal Closing Time" 
              name="withdrawal_close_time"
              register={register}
              icon={Clock}
              subText="Time when withdrawals close (24-hour format)" 
            />
            
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-bold text-gray-700">Require Investment to Withdraw</label>
              <Controller
                name="require_investment_to_withdraw"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? "yes" : "no"} onValueChange={(val) => field.onChange(val === "yes")}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 rounded-lg text-gray-700 text-[13px] bg-white">
                      <SelectValue placeholder="Select Requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Users must have active investment</SelectItem>
                      <SelectItem value="no">No - Anyone can withdraw</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-[11px] text-blue-600 mt-1">If enabled, users must have at least 1 active mining plan to withdraw</p>
            </div>

            <ValidatedInput 
              label="Minimum Investments Required" 
              name="min_investment_to_withdraw"
              type="number"
              register={register}
              subText="Minimum number of active investments required to withdraw" 
            />
          </div>

          <div className="mt-10">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

function ValidatedInput({ label, name, type = "text", register, requiredNote = false, icon: Icon, subText }) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[13px] font-bold text-gray-700 flex items-center justify-between">
        <span>{label}</span>
        {requiredNote && <span className="text-[10px] text-red-500 font-normal">REQUIRED</span>}
      </label>
      <div className="relative">
        <Input 
          type={type} 
          {...register(name)}
          className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 rounded-lg text-gray-700 text-[13px] bg-white"
        />
        {Icon && <Icon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />}
      </div>
      {subText && <p className="text-[11px] text-gray-400 mt-0.5">{subText}</p>}
    </div>
  )
}

function RichTextEditor({ label, name, control }) {
  return (
    <div className="flex flex-col space-y-1 h-full">
      <label className="text-[13px] font-bold text-gray-700">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea 
            value={field.value || ""} 
            onChange={field.onChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 min-h-[140px] rounded-lg text-gray-700 text-[13px] bg-white leading-relaxed resize-none p-3"
            placeholder={`Enter ${label.toLowerCase()} content...`}
          />
        )}
      />
    </div>
  )
}

