"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Camera } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Switch } from "@/components/ui/switch";

const sliderSchema = z.object({
  display_location: z.string().min(1, "Page view is required"),
  status: z.boolean(),
});

export default function SliderDialog({ open, setOpen, initialData, onSuccess }) {
  const isEdit = !!initialData?.id;
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      display_location: "home_page",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          display_location: initialData.display_location || "home_page",
          status: initialData.status !== undefined ? initialData.status : true,
        });
        setImagePreview(initialData.image || null);
        setImageName(initialData.image ? "Current Image" : "");
      } else {
        reset({
          display_location: "home_page",
          status: true,
        });
        setImagePreview(null);
        setImageName("");
      }
    }
  }, [initialData, open, reset]);

  const display_location = watch("display_location");
  const status = watch("status");

  const createMutation = usePost("/admin/sliders", ["admin-sliders"]);
  const editMutation = usePut(initialData?.id ? `/admin/sliders/${initialData.id}` : "", ["admin-sliders"]);
  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    if (!imagePreview) {
      toast.error("Please upload an image for the slider");
      return;
    }

    const payload = {
      display_location: data.display_location,
      status: data.status,
      image: imagePreview,
    };

    try {
      if (isEdit) {
        await editMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit Slider" : "Create New Slider"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
            {/* Upload Section */}
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block font-bold">
                Upload Photo <span className="text-gray-400 font-normal">{"{Suggestion: size 1920x800(px)}"}</span>
              </Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center border rounded-md overflow-hidden bg-gray-50 border-gray-300">
                  <Input 
                    type="text" 
                    placeholder="Choose file" 
                    value={imageName}
                    readOnly 
                    className="border-0 bg-transparent flex-1 text-gray-500 rounded-sm h-10" 
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
                    className="rounded-sm-none border-l h-10 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-normal border-gray-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
                
                <div className="w-[160px] h-[100px] rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">No image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Select & Status Section */}
            <div className="space-y-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block font-bold">Page View</Label>
                <Select value={display_location} onValueChange={(val) => setValue("display_location", val)}>
                  <SelectTrigger className="border-blue-300 focus:ring-blue-500 text-gray-600 rounded-sm h-10">
                    <SelectValue placeholder="Select page view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_page">Home Page</SelectItem>
                    <SelectItem value="about_page">About Page</SelectItem>
                    <SelectItem value="services_page">Services Page</SelectItem>
                  </SelectContent>
                </Select>
                {errors.display_location && <p className="text-red-500 text-xs mt-1">{errors.display_location.message}</p>}
              </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-600 text-sm mb-1.5 block font-bold">Status</Label>
                  <Switch
                    checked={status}
                    onCheckedChange={(val) => setValue("status", val)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
            </div>
          </div>

          {/* Footer Area inside form */}
          <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center justify-between mt-6">
            <h3 className="text-[16px] text-[#475f7b] font-medium">Submit Your Slider Information</h3>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 text-[15px] font-medium rounded-sm-sm shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "+ Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
