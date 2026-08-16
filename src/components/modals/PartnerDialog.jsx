"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { Switch } from "@/components/ui/switch";

const partnerSchema = z.object({
  partner_name: z.string().min(2, "Partner name is required"),
  display_order: z.number().min(0),
  status: z.boolean(),
});

export default function PartnerDialog({ open, setOpen, initialData }) {
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
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      partner_name: "",
      display_order: 0,
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          partner_name: initialData.partner_name || "",
          display_order: initialData.display_order || 0,
          status: initialData.status !== undefined ? initialData.status : true,
        });
        setImagePreview(initialData.logo || null);
        setImageName(initialData.logo ? "Current Image" : "");
      } else {
        reset({
          partner_name: "",
          display_order: 0,
          status: true,
        });
        setImagePreview(null);
        setImageName("");
      }
    }
  }, [open, initialData, reset]);

  const isStatus = watch("status");

  const createMutation = usePost("/admin/partners", ["partners"]);
  const editMutation = usePut(initialData?.id ? `/admin/partners/${initialData.id}` : "", ["partners"]);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    if (!imagePreview) {
      toast.error("Please upload a logo for the partner");
      return;
    }

    const payload = {
      partner_name: data.partner_name,
      display_order: data.display_order,
      status: data.status,
      logo: imagePreview,
    };

    try {
      if (isEdit) {
        await editMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setOpen(false);
      reset();
    } catch (err) {
      // Handled by useApi
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
            <div className="md:col-span-2">
              <Label className="text-gray-600 text-sm mb-1.5 block">Partner Name</Label>
              <Input
                {...register("partner_name")}
                placeholder="e.g. Binance, Coinbase"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-blue-500 mt-1.5">● This will be displayed as the partner's name</p>
              {errors.partner_name && <p className="text-red-500 text-sm mt-1">{errors.partner_name.message}</p>}
            </div>

            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Display Order</Label>
              <Input
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                placeholder="0"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-blue-500 mt-1.5">● Lower numbers appear first</p>
              {errors.display_order && <p className="text-red-500 text-sm mt-1">{errors.display_order.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Publish Status</Label>
                <p className="text-[11px] text-gray-500">● Active partners will be visible to users</p>
              </div>
              <Switch
                checked={isStatus}
                onCheckedChange={(val) => setValue("status", val)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Partner Logo</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Label className="text-gray-600 text-sm mb-1.5 block">
                  Upload Logo <span className="text-gray-400 text-xs">(Recommended: transparent PNG, 200x200px)</span>
                </Label>
                <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                  <Input 
                    type="text" 
                    placeholder="Choose file" 
                    value={imageName}
                    readOnly 
                    className="border-0 bg-transparent flex-1 rounded-sm h-10" 
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
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="rounded-sm-none border-l h-10 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              <div className="w-16 h-16 rounded bg-gray-200 border-2 border-gray-100 flex items-center justify-center shrink-0 overflow-hidden p-2">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
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
                isEdit ? "Update Partner" : "Add Partner"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
