"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePost, usePut } from "@/hooks/useApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from '@iconify/react';

const ICON_OPTIONS = [
  { value: "solar:gift-bold", label: "Gift" },
  { value: "solar:star-bold", label: "Star" },
  { value: "solar:crown-star-bold", label: "Crown" },
  { value: "ph:diamond-fill", label: "Diamond" },
  { value: "solar:wallet-bold", label: "Wallet" },
  { value: "solar:medal-ribbon-star-bold", label: "Medal" },
  { value: "solar:cup-star-bold", label: "Trophy" },
  { value: "solar:refresh-bold", label: "Try Again" },
];

const prizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.coerce.number().min(0, "Value is required"),
  color: z.string().min(1, "Color is required"),
  weight: z.coerce.number().min(1, "Weight must be at least 1"),
  position: z.coerce.number().min(1, "Position is required"),
  icon: z.string().optional(),
  is_jackpot: z.boolean().default(false),
  status: z.enum(["active", "inactive"]),
});

export default function SpinPrizeDialog({ open, setOpen, initialData }) {
  const isEdit = !!initialData?.id;

  let symbol = "R";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(prizeSchema),
    defaultValues: {
      name: "",
      value: "",
      color: "#3b82f6",
      weight: 10,
      position: "",
      icon: "solar:gift-bold",
      is_jackpot: false,
      status: "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        value: initialData.value || 0,
        color: initialData.color || "#3b82f6",
        weight: initialData.weight || 10,
        position: initialData.position || "",
        icon: initialData.icon || "solar:gift-bold",
        is_jackpot: initialData.is_jackpot || false,
        status: initialData.status === false ? "inactive" : "active",
      });
    } else {
      reset({
        name: "",
        value: "",
        color: "#3b82f6",
        weight: 10,
        position: "",
        icon: "solar:gift-bold",
        is_jackpot: false,
        status: "active",
      });
    }
  }, [initialData, reset, open]);

  const status = watch("status");
  const is_jackpot = watch("is_jackpot");
  
  const createMutation = usePost("/admin/rewards/spin-prizes", ["admin-spin-prizes"]);
  const editMutation = usePut(initialData?.id ? `/admin/rewards/spin-prizes/${initialData.id}` : "", ["admin-spin-prizes"]);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      value: Number(data.value),
      color: data.color,
      weight: Number(data.weight),
      probability: 0, // Server or frontend can calculate real probability later
      position: Number(data.position),
      icon: data.icon,
      is_jackpot: data.is_jackpot,
      status: data.status === "active",
    };

    try {
      if (isEdit) {
        await editMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setOpen(false);
      reset();
    } catch (error) {
      // Error is handled by useApi
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit Spin Wheel Prize" : "Create New Spin Wheel Prize"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          
          {/* Main Information */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Prize Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Prize Name *</Label>
                <Input
                  {...register("name")}
                  placeholder="e.g. 10 Coins, Jackpot, Try Again"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Display name shown on the wheel segment</p>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Prize Value *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{symbol}</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("value")}
                    placeholder="0"
                    className="pl-8 border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                  />
                </div>
                <p className="text-[11px] text-blue-500 mt-1.5">● Amount credited to user's main balance (0 for "Try Again")</p>
                {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Segment Color *</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    {...register("color")}
                    className="p-1 w-20 border-blue-500 cursor-pointer rounded-sm h-10"
                  />
                  <Input
                    type="text"
                    {...register("color")}
                    placeholder="#3b82f6"
                    className="flex-1 border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                  />
                </div>
                <p className="text-[11px] text-blue-500 mt-1.5">● Color of the wheel segment</p>
                {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Probability Weight *</Label>
                <Input
                  type="number"
                  {...register("weight")}
                  placeholder="10"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Higher weight = higher chance (1-100)</p>
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Position *</Label>
                <Input
                  type="number"
                  {...register("position")}
                  placeholder="e.g. 1"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Order on the wheel</p>
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Appearance & Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2 space-y-3 border-b pb-6">
                <Label className="text-gray-600 text-sm mb-1.5 block">Display Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("icon", opt.value)}
                      className={`flex items-center px-4 py-2 border rounded-sm text-[13px] transition-colors ${
                        watch("icon") === opt.value
                          ? "bg-slate-50 border-slate-500 text-slate-700 font-medium"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon icon={opt.value} className="mr-2 w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[12px] text-gray-400">Or enter custom Iconify name:</span>
                  <Input
                    {...register("icon")}
                    placeholder="solar:gift-bold"
                    className="border-blue-500 focus-visible:ring-blue-500 w-48 text-[12px] rounded-sm h-10"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center pt-2 md:col-span-2">
                <Label className="text-gray-600 text-sm mb-3 block">Special Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_jackpot" 
                    checked={is_jackpot}
                    onCheckedChange={(val) => setValue("is_jackpot", val)}
                  />
                  <label
                    htmlFor="is_jackpot"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-orange-500 flex items-center"
                  >
                    ★ Jackpot Prize
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Prize Status</Label>
                  <p className="text-[11px] text-blue-500">● Determine if this prize is active on the wheel</p>
                </div>
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(val) => setValue("status", val ? "active" : "inactive")}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-2 pb-6 space-x-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-auto text-base rounded-sm-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Prize" : "Create Prize"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-[#475f7b] text-white hover:bg-[#34465b] border-0 px-8 py-2 h-auto text-base rounded-sm-sm hover:text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
