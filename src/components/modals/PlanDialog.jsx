"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Sparkles, Tag } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

const planSchema = z.object({
  title: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  dailyIncomeZar: z.coerce.number().min(0.01, "Daily income is required"),
  totalRevenueZar: z.coerce.number().min(0.01, "Total revenue is required"),
  status: z.enum(["active", "inactive"]),
  is_sold_out: z.boolean().default(false),
  category: z.string().default("VIP Series"),
});

export default function PlanDialog({ open, setOpen, initialData }) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData?.id;
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 300,
      duration: 180,
      dailyIncomeZar: 78,
      totalRevenueZar: 14040,
      status: "active",
      is_sold_out: false,
      category: "VIP Series",
    },
  });

  const duration = watch("duration");
  const dailyIncomeZar = watch("dailyIncomeZar");
  const status = watch("status");
  const isSoldOut = watch("is_sold_out");

  useEffect(() => {
    if (duration > 0 && dailyIncomeZar > 0) {
      const calculatedTotal = Number((dailyIncomeZar * duration).toFixed(2));
      setValue("totalRevenueZar", calculatedTotal);
    }
  }, [duration, dailyIncomeZar, setValue]);

  useEffect(() => {
    if (initialData) {
      const planPrice = initialData.min_investment ? Number(initialData.min_investment) : 300;
      const durationDays = initialData.duration ? Number(initialData.duration) : 180;
      let dailyZar = initialData.daily_income ? Number(initialData.daily_income) : 78;
      if (dailyZar <= 1) {
        dailyZar = Number((planPrice * dailyZar).toFixed(2));
      }
      const totalRev = initialData.total_revenue ? Number(initialData.total_revenue) : Number((dailyZar * durationDays).toFixed(2));

      reset({
        title: initialData.name || "",
        description: initialData.description || "",
        price: planPrice,
        duration: durationDays,
        dailyIncomeZar: dailyZar,
        totalRevenueZar: totalRev,
        status: initialData.status ? "active" : "inactive",
        is_sold_out: initialData.is_sold_out ?? false,
        category: initialData.category || "VIP Series",
      });
      setImagePreview(initialData.image || null);
      setImageName(initialData.image ? "Current Image" : "");
    } else {
      reset({
        title: "",
        description: "",
        price: 300,
        duration: 180,
        dailyIncomeZar: 78,
        totalRevenueZar: 14040,
        status: "active",
        is_sold_out: false,
      });
      setImagePreview(null);
      setImageName("");
    }
  }, [initialData, reset, open]);

  const createPlanMutation = usePost("/admin/plans", ["plans"]);
  const updatePlanMutation = usePut(
    initialData?.id ? "/admin/plans/" + initialData.id : null,
    ["plans"]
  );

  const isSubmitting = createPlanMutation.isPending || updatePlanMutation.isPending;

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.title,
        category: data.category || "VIP Series",
        description: data.description || (data.title + " Investment Plan"),
        duration: Number(data.duration),
        daily_income: Number(data.dailyIncomeZar),
        total_revenue: Number(data.totalRevenueZar),
        min_investment: Number(data.price),
        max_investment: Number(data.price),
        capital_return: false,
        is_fixed_deposit: false,
        status: data.status === "active",
        is_sold_out: Boolean(data.is_sold_out),
        image: imagePreview || "/logo.png",
      };
      
      if (isEdit) {
        await updatePlanMutation.mutateAsync(payload);
      } else {
        await createPlanMutation.mutateAsync(payload);
      }
      queryClient.invalidateQueries(["plans"]);
      setOpen(false);
    } catch (error) {
      // Toasts handled automatically by useApi
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-50 p-6 rounded-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-[#4f8cff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {isEdit ? "Edit VIP Package" : "Create VIP Package"}
              </DialogTitle>
              <p className="text-xs text-gray-500">Set exact package price, daily earnings, duration and sold out status</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Package Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Package / Product Name</Label>
                <Input
                  {...register("title")}
                  placeholder="e.g. VIP1, VIP2, VIP3"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-medium"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Package Price (ZAR)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("price")}
                  placeholder="e.g. 300, 700, 1500"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-[#2563eb]"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Description / Subtitle</Label>
                <Input
                  {...register("description")}
                  placeholder="e.g. VIP1 Smart Projector Package"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          
          {/* Series / Category Selection */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
            <Label className="text-gray-800 text-sm font-bold block">Series / Category</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Category Name</Label>
                <select
                  {...register("category")}
                  className="w-full border border-gray-200 focus:ring-[#4f8cff] h-10 rounded-lg text-sm px-3 bg-white font-medium text-gray-800"
                >
                  <option value="VIP Series">VIP Series</option>
                  <option value="Activity Series">Activity Series</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Or Custom Series</Label>
                <Input
                  type="text"
                  placeholder="e.g. Special Series"
                  onChange={(e) => {
                    if (e.target.value) {
                      setValue("category", e.target.value);
                    }
                  }}
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Income & Term Direct Inputs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Duration (Days)</Label>
                <Input
                  type="number"
                  {...register("duration")}
                  placeholder="180"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-semibold"
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Daily Income (ZAR)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("dailyIncomeZar")}
                  placeholder="e.g. 78"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-emerald-600"
                />
                {errors.dailyIncomeZar && <p className="text-red-500 text-xs mt-1">{errors.dailyIncomeZar.message}</p>}
                <p className="text-[10.5px] text-gray-400 mt-1">Exact cash payout per day</p>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Total Revenue (ZAR)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("totalRevenueZar")}
                  placeholder="e.g. 14040"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-[#2563eb]"
                />
                {errors.totalRevenueZar && <p className="text-red-500 text-xs mt-1">{errors.totalRevenueZar.message}</p>}
                <p className="text-[10.5px] text-gray-400 mt-1">Total cash revenue over duration</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Product Image</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Upload / Image URL</Label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <Input
                    type="text"
                    placeholder="Choose file or enter image URL"
                    value={imageName || (imagePreview ? "Image Selected" : "")}
                    onChange={(e) => { setImagePreview(e.target.value); setImageName(e.target.value); }}
                    className="border-0 bg-transparent flex-1 h-10 text-xs"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => { setImagePreview(reader.result); };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="border-l rounded-none h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status & Sold Out Controls */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <Label className="text-gray-800 text-sm font-bold block">Active Status</Label>
                <p className="text-xs text-gray-500">Active packages are visible to members on the investment page</p>
              </div>
              <Switch
                checked={status === "active"}
                onCheckedChange={(val) => setValue("status", val ? "active" : "inactive")}
                className="data-[state=checked]:bg-[#4f8cff]"
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <Label className="text-gray-800 text-sm font-bold block flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-500" />
                  Sold Out Status
                </Label>
                <p className="text-xs text-gray-500">Marking a product as sold out disables new investments and shows a "Sold Out" badge</p>
              </div>
              <Switch
                checked={isSoldOut}
                onCheckedChange={(val) => setValue("is_sold_out", val)}
                className="data-[state=checked]:bg-slate-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-200 text-gray-700 h-10 px-6 rounded-lg text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#4f8cff] hover:bg-[#3b7bed] text-white px-8 h-10 text-sm font-bold rounded-lg shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Package" : "Create Package"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
