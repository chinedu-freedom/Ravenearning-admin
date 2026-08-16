"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePost, usePut } from "@/hooks/useApi";

const taskSchema = z.object({
  name: z.string().min(3, "Name is required"),
  invitesRequired: z.coerce.number().min(1, "Number is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
  description: z.string().min(3, "Description is required"),
  status: z.enum(["active", "inactive"]),
});

export default function TaskDialog({ open, setOpen, initialData }) {
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
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      invitesRequired: "",
      amount: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.task_name || "",
        invitesRequired: initialData.required_referrals || "",
        amount: initialData.reward_amount || "",
        description: initialData.description || "",
        status: initialData.status === false ? "inactive" : "active",
      });
    } else {
      reset({
        name: "",
        invitesRequired: "",
        amount: "",
        description: "",
        status: "active",
      });
    }
  }, [initialData, reset, open]);

  const status = watch("status");
  
  const createMutation = usePost("/admin/rewards/tasks", ["admin-tasks"]);
  const editMutation = usePut(initialData?.id ? `/admin/rewards/tasks/${initialData.id}` : "", ["admin-tasks"]);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {
    const payload = {
      task_name: data.name,
      description: data.description,
      required_referrals: Number(data.invitesRequired),
      reward_amount: Number(data.amount),
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
            {isEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          
          {/* Main Task Information */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Task Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Name</Label>
                <Input
                  {...register("name")}
                  placeholder="Task Name"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Enter a descriptive name for this task</p>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Short Description</Label>
                <Input
                  {...register("description")}
                  placeholder="Short Description"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Briefly describe what the user needs to do</p>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Requirements & Reward */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Requirements & Reward</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Invitation Number Required</Label>
                <Input
                  type="number"
                  {...register("invitesRequired")}
                  placeholder="e.g. 10"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Number of successful referrals needed to complete the task</p>
                {errors.invitesRequired && <p className="text-red-500 text-sm mt-1">{errors.invitesRequired.message}</p>}
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Reward Amount ({symbol})</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  placeholder="e.g. 5.00"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Amount to be credited upon task completion</p>
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Task Status</Label>
                  <p className="text-[11px] text-blue-500">● Determine if this task is currently visible to users</p>
                </div>
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(val) => setValue("status", val ? "active" : "inactive")}
                  className="data-[state=checked]:bg-blue-600"
                />
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
                isEdit ? "Update Task" : "Create Task"
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
