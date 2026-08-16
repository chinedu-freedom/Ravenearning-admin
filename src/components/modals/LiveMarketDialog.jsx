"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { Switch } from "@/components/ui/switch";

const marketSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  trading_pair: z.string().min(1, "Binance Trading Pair is required"),
  logo_url: z.string().url("Must be a valid URL").or(z.literal("")),
  status: z.boolean(),
});

export default function LiveMarketDialog({ open, setOpen, initialData, onSuccess }) {
  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      symbol: "",
      name: "",
      trading_pair: "",
      logo_url: "",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          symbol: initialData.symbol || "",
          name: initialData.name || "",
          trading_pair: initialData.trading_pair || "",
          logo_url: initialData.logo_url || "",
          status: initialData.status !== undefined ? initialData.status : true,
        });
      } else {
        reset({
          symbol: "",
          name: "",
          trading_pair: "",
          logo_url: "",
          status: true,
        });
      }
    }
  }, [initialData, open, reset]);

  const isStatus = watch("status");

  const createMutation = usePost("/admin/live-market", ["admin-live-market"]);
  const editMutation = usePut(initialData?.id ? `/admin/live-market/${initialData.id}` : "", ["admin-live-market"]);
  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await editMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      if (onSuccess) onSuccess();
      setOpen(false);
      reset();
    } catch (error) {
      // toast.error is handled by hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit Cryptocurrency" : "Add New Cryptocurrency"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Symbol *</Label>
              <Input
                {...register("symbol")}
                placeholder="e.g., BTC"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">The cryptocurrency symbol (e.g., BTC, ETH)</p>
              {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol.message}</p>}
            </div>

            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Name *</Label>
              <Input
                {...register("name")}
                placeholder="e.g., Bitcoin"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-600 text-sm mb-1.5 block">Binance Trading Pair *</Label>
              <Input
                {...register("trading_pair")}
                placeholder="e.g., BTCUSDT"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">The Binance trading pair symbol (e.g., BTCUSDT, ETHUSDT). This is used to fetch live prices.</p>
              {errors.trading_pair && <p className="text-red-500 text-sm mt-1">{errors.trading_pair.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-600 text-sm mb-1.5 block">Logo URL (CoinGecko)</Label>
              <Input
                {...register("logo_url")}
                placeholder="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">Get logo URL from CoinGecko. Right-click on coin logo → Copy image address</p>
              {errors.logo_url && <p className="text-red-500 text-sm mt-1">{errors.logo_url.message}</p>}
            </div>

            <div className="md:col-span-2 flex items-center justify-between">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Publish Status</Label>
                <p className="text-[11px] text-gray-500">● Active cryptocurrencies will be visible to users</p>
              </div>
              <Switch
                checked={isStatus}
                onCheckedChange={(val) => setValue("status", val)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 pb-6">
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
                isEdit ? "Update Cryptocurrency" : "Save Cryptocurrency"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
