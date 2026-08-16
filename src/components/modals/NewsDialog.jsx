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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { Switch } from "@/components/ui/switch";

const newsSchema = z.object({
  title: z.string().min(3, "Title is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(10, "Description is required"),
  content: z.string().min(20, "Content is required"),
  is_featured: z.boolean(),
  status: z.boolean(),
});

export default function NewsDialog({ open, setOpen, initialData }) {
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
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      content: "",
      is_featured: false,
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title || "",
          category: initialData.category || "",
          description: initialData.description || "",
          content: initialData.content || "",
          is_featured: initialData.is_featured || false,
          status: initialData.status !== undefined ? initialData.status : true,
        });
        setImagePreview(initialData.image || null);
        setImageName(initialData.image ? "Current Image" : "");
      } else {
        reset({
          title: "",
          category: "",
          description: "",
          content: "",
          is_featured: false,
          status: true,
        });
        setImagePreview(null);
        setImageName("");
      }
    }
  }, [open, initialData, reset]);

  const isFeatured = watch("is_featured");
  const isStatus = watch("status");

  const createMutation = usePost("/admin/news", ["news"]);
  const editMutation = usePut(initialData?.id ? `/admin/news/${initialData.id}` : "", ["news"]);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    if (!imagePreview) {
      toast.error("Please upload an image for the news");
      return;
    }

    const payload = {
      title: data.title,
      category: data.category,
      description: data.description,
      content: data.content,
      is_featured: data.is_featured,
      status: data.status,
      image: imagePreview,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit News Article" : "Create News Article"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
            <div className="md:col-span-2">
              <Label className="text-gray-600 text-sm mb-1.5 block">Title</Label>
              <Input
                {...register("title")}
                placeholder="e.g. Platform Upgrade Announcement"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-blue-500 mt-1.5">● This will be displayed as the news title</p>
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Category</Label>
              <Select 
                value={watch("category") || ""} 
                onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
              >
                <SelectTrigger className="border-blue-500 focus-visible:ring-blue-500 bg-white rounded-sm h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Tips">Tips</SelectItem>
                  <SelectItem value="Promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Featured News</Label>
                <p className="text-[11px] text-gray-500">● Show prominently on user dashboard</p>
              </div>
              <Switch
                checked={isFeatured}
                onCheckedChange={(val) => setValue("is_featured", val)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          {/* Plan Image Replacement -> News Image */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Featured Image</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Label className="text-gray-600 text-sm mb-1.5 block">
                  Upload Cover <span className="text-gray-400 text-xs">(Recommended: 800x400px)</span>
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
              <div className="w-24 h-16 rounded bg-gray-200 border-2 border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Content Info */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
            <h3 className="text-lg font-medium text-blue-500">Content</h3>
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Short Description</Label>
              <Textarea
                {...register("description")}
                placeholder="A brief summary of the news"
                className="resize-none border-blue-500 focus-visible:ring-blue-500 rounded-sm"
                rows={2}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Full Content</Label>
              <Textarea
                {...register("content")}
                placeholder="Write the full details here..."
                className="min-h-[150px] border-blue-500 focus-visible:ring-blue-500 rounded-sm"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Publish Status</h3>
            <div className="flex items-center justify-between gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Status</Label>
                <p className="text-[11px] text-gray-500">● Active news will be visible to users</p>
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
                isEdit ? "Update News" : "Publish News"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
