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
import { Loader2, Camera, Sparkles } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const planSchema = z.object({
  title: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  dailyReturn: z.coerce.number().min(0.01, "Daily return % is required"),
  status: z.enum(["active", "inactive"]),
});

export default function PlanDialog({ open, setOpen, initialData }) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData?.id;
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [dailyIncomeInput, setDailyIncomeInput] = useState("");

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
      dailyReturn: 25,
      status: "active",
    },
  });

  const price = watch("price") || 0;
  const duration = watch("duration") || 0;
  const dailyReturn = watch("dailyReturn") || 0;
  const status = watch("status");

  // Calculated daily income & total revenue
  const dailyIncomeAmount = price > 0 && dailyReturn > 0 ? (price * dailyReturn) / 100 : 0;
  const totalRevenue = dailyIncomeAmount * duration;

  // Handle manual Daily Income (ZAR) change
  const handleDailyIncomeChange = (e) => {
    const val = e.target.value;
    setDailyIncomeInput(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && price > 0) {
      const calculatedPercent = (numVal / price) * 100;
      setValue("dailyReturn", parseFloat(calculatedPercent.toFixed(4)), { shouldValidate: true });
    }
  };

  // Keep daily income input in sync when price or dailyReturn changes
  useEffect(() => {
    if (price > 0 && dailyReturn > 0) {
      setDailyIncomeInput(((price * dailyReturn) / 100).toFixed(2));
    }
  }, [price, dailyReturn]);

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      const planPrice = initialData.min_investment ? Number(initialData.min_investment) : 300;
      const planDailyPercent = initialData.daily_income ? Number(initialData.daily_income) : 25;
      
      reset({
        title: initialData.name || "",
        description: initialData.description || "",
        price: planPrice,
        duration: initialData.duration || 180,
        dailyReturn: planDailyPercent,
        status: initialData.status ? "active" : "inactive",
      });
      setDailyIncomeInput(((planPrice * planDailyPercent) / 100).toFixed(2));
      setImagePreview(initialData.image || null);
      setImageName(initialData.image ? "Current Image" : "");
    } else {
      reset({
        title: "",
        description: "",
        price: 300,
        duration: 180,
        dailyReturn: 25,
        status: "active",
      });
      setDailyIncomeInput("75.00");
      setImagePreview(null);
      setImageName("");
    }
  }, [initialData, reset, open]);

  // API mutations
  const createPlanMutation = usePost("/admin/plans", ["plans"]);
  const updatePlanMutation = usePut(
    initialData?.id ? `/admin/plans/${initialData.id}` : null,
    ["plans"]
  );

  const isSubmitting = createPlanMutation.isPending || updatePlanMutation.isPending;

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.title,
        description: data.description || `${data.title} VIP Projector`,
        duration: Number(data.duration),
        daily_income: Number(data.dailyReturn),
        min_investment: Number(data.price),
        max_investment: Number(data.price),
        capital_return: false,
        is_fixed_deposit: false,
        status: data.status === "active",
        image: imagePreview || "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=600&q=80",
      };

      if (isEdit) {
        await updatePlanMutation.mutateAsync(payload);
        toast.success("Plan updated successfully!");
      } else {
        await createPlanMutation.mutateAsync(payload);
        toast.success("Plan created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["plans"] });
      setOpen(false);
    } catch (error) {
      console.error("Plan submit error:", error);
      toast.error(error?.response?.data?.error || "Failed to save plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden font-['Poppins',sans-serif] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-slate-50/50 shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4f8cff]" />
            {isEdit ? "Edit VIP Package" : "Create VIP Package"}
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Configure product price, daily revenue, and investment term for Raven products.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Info */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Product Name</Label>
                <Input
                  {...register("title")}
                  placeholder="e.g. Raven Z6X, Raven H6 Max"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Price (ZAR)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register("price")}
                  placeholder="e.g. 300, 800, 1500"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-[#2563eb]"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Description / Subtitle</Label>
                <Input
                  {...register("description")}
                  placeholder="e.g. VIP1 Smart Home Theater Projector"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Revenue & Term Settings */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Income & Term Configuration</h3>
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
                  value={dailyIncomeInput}
                  onChange={handleDailyIncomeChange}
                  placeholder="e.g. 75"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-emerald-600"
                />
                <p className="text-[10.5px] text-gray-400 mt-1">Daily cash payout amount</p>
              </div>

              <div>
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">Daily Return (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("dailyReturn")}
                  placeholder="e.g. 25"
                  className="border-gray-200 focus-visible:ring-[#4f8cff] h-10 rounded-lg text-sm font-bold text-blue-600"
                />
                <p className="text-[10.5px] text-gray-400 mt-1">Calculated % per day</p>
              </div>
            </div>

            {/* Total Return Preview Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Estimated Total Revenue</span>
                <span className="text-xl font-black text-[#2563eb]">
                  ZAR {Number(totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Yield</span>
                <span className="text-base font-extrabold text-emerald-600">
                  +{((dailyReturn * duration) || 0).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Product Image</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-gray-700 text-xs font-semibold mb-1.5 block">
                  Upload / Image URL
                </Label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <Input 
                    type="text" 
                    placeholder="Choose file or enter image URL" 
                    value={imageName || (imagePreview ? "Image Selected" : "")}
                    onChange={(e) => {
                      setImagePreview(e.target.value);
                      setImageName(e.target.value);
                    }}
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
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                        };
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

          {/* Status Switch */}
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

          {/* Footer Submit Button */}
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
