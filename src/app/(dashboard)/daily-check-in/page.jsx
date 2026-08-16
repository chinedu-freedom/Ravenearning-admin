"use client"

import { useState, useEffect } from "react"
import { Save, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useFetchData, usePut } from "@/hooks/useApi"
import { toast } from "sonner"

export default function DailyCheckInPage() {
  const router = useRouter()
  const [isSystemEnabled, setIsSystemEnabled] = useState(true)
  const [rewards, setRewards] = useState([])

  const { data: settingsData, isLoading: loadingSettings } = useFetchData("/admin/settings/platform", ["admin-platform-settings"])
  const { data: checkinsData, isLoading: loadingCheckins } = useFetchData("/admin/rewards/check-ins", ["admin-checkins"])

  const updateSettingsMutation = usePut("/admin/settings/platform", ["admin-platform-settings"])
  const updateCheckinsMutation = usePut("/admin/rewards/check-ins/bulk", ["admin-checkins"])

  useEffect(() => {
    if (settingsData) {
      setIsSystemEnabled(settingsData.daily_checkin_enabled ?? true)
    }
  }, [settingsData])

  useEffect(() => {
    if (checkinsData && Array.isArray(checkinsData)) {
      // Sort by day number
      const sorted = [...checkinsData].sort((a, b) => a.day_number - b.day_number)
      setRewards(sorted)
    }
  }, [checkinsData])

  const handleAmountChange = (index, value) => {
    const newRewards = [...rewards]
    newRewards[index].reward_amount = value
    setRewards(newRewards)
  }

  const handleDescriptionChange = (index, value) => {
    const newRewards = [...rewards]
    newRewards[index].description = value
    setRewards(newRewards)
  }

  const handleSave = async () => {
    try {
      // Save global setting
      await updateSettingsMutation.mutateAsync({
        daily_checkin_enabled: isSystemEnabled
      })

      // Prepare payload and update check-ins
      const checkinsPayload = {
        checkins: rewards.map(r => ({
          id: r.id,
          reward_amount: Number(r.reward_amount),
          description: r.description
        }))
      }
      await updateCheckinsMutation.mutateAsync(checkinsPayload)
      
    } catch (error) {
      // Errors handled by useApi
    }
  }

  const isSubmitting = updateSettingsMutation.isPending || updateCheckinsMutation.isPending

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Section - Settings */}
      <Card className="border-none shadow-sm bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#475f7b]">Daily Check-In Settings</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium">Configure Rewards For 7-Day Check-In System</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-[#8b9eb3] p-8 text-white">
            <div className="flex items-start gap-4">
              <Switch 
                checked={isSystemEnabled}
                onCheckedChange={setIsSystemEnabled}
                className="mt-1 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-400"
              />
              <div>
                <Label className="text-base font-semibold block mb-2 cursor-pointer" onClick={() => setIsSystemEnabled(!isSystemEnabled)}>
                  Daily Check-In System
                </Label>
                <div className="text-sm text-blue-50/90 space-y-1 mt-3">
                  <p className="font-medium opacity-90 mb-2">When disabled:</p>
                  <ul className="list-disc pl-5 space-y-1.5 opacity-90">
                    <li>Check-in card will be hidden from home page</li>
                    <li>Check-in popup will not appear on login</li>
                    <li>Users cannot claim daily rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card className="border-none shadow-sm bg-card rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 font-bold tracking-wider uppercase border-b bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 w-[30%]">DAY</th>
                <th scope="col" className="px-6 py-4 w-[35%]">REWARD AMOUNT</th>
                <th scope="col" className="px-6 py-4 w-[35%]">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {loadingCheckins ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500 bg-gray-50/30">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading daily check-in rewards...
                  </td>
                </tr>
              ) : rewards.map((reward, index) => (
                <tr key={reward.day_number} className="border-b last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">Day {reward.day_number}</span>
                      {reward.day_number === 7 && (
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold">
                          Final Reward
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex max-w-[280px] rounded-md border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-center bg-slate-50 px-4 border-r border-gray-200 text-slate-600 font-medium">
                        $
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={reward.reward_amount}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 outline-none text-slate-700 bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      value={reward.description || ""}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className={`w-full outline-none bg-transparent ${index === 0 ? "text-[#00cfdd]" : index === 6 ? "text-blue-600" : "text-gray-400"} font-medium`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t p-4 flex justify-end gap-3">
    <Button 
      onClick={handleSave} 
      disabled={isSubmitting}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm rounded-sm-sm py-4.5"
    >
      <Save className="w-4 h-4 mr-2" />
      {isSubmitting ? "Saving..." : "Save Settings"}
    </Button>
  </div>  
      </Card>

    
    </div>
  )
}
