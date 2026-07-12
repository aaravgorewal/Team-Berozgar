"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createAsset } from "@/app/actions/assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Asset name is required"),
  assetTag: z.string().min(2, "Asset Tag is required"),
  serialNumber: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.string().optional(),
  location: z.string().optional(),
  isSharedBookable: z.string(),
  acquisitionCost: z.string().optional(),
});

export function CreateAssetDialog({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      assetTag: "",
      serialNumber: "",
      categoryId: "",
      condition: "New",
      location: "",
      isSharedBookable: "false",
      acquisitionCost: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let photoUrl = undefined;
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.secure_url;
        }
      }

      await createAsset({
        name: values.name,
        assetTag: values.assetTag,
        serialNumber: values.serialNumber,
        categoryId: values.categoryId,
        condition: values.condition,
        location: values.location,
        isSharedBookable: values.isSharedBookable === "true",
        acquisitionCost: values.acquisitionCost ? parseFloat(values.acquisitionCost) : undefined,
        photoUrl,
      });
      setIsOpen(false);
      form.reset();
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Asset</DialogTitle>
          <DialogDescription>Add a new physical asset or shared resource to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Asset Photo (Optional)</Label>
            <Input id="photo" type="file" accept="image/*" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input id="name" placeholder="MacBook Pro 16" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag (e.g. AF-0001)</Label>
              <Input id="assetTag" placeholder="AF-0001" {...form.register("assetTag")} />
              {form.formState.errors.assetTag && (
                <p className="text-sm text-red-500">{form.formState.errors.assetTag.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select onValueChange={(val) => form.setValue("categoryId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
              <Input id="serialNumber" {...form.register("serialNumber")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select onValueChange={(val) => form.setValue("condition", val)} defaultValue="New">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / Room (Optional)</Label>
              <Input id="location" {...form.register("location")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isSharedBookable">Is Shared/Bookable Resource?</Label>
              <Select onValueChange={(val) => form.setValue("isSharedBookable", val)} defaultValue="false">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No (Individual Asset)</SelectItem>
                  <SelectItem value="true">Yes (Room, Shared Vehicle, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisitionCost">Acquisition Cost ($) (Optional)</Label>
              <Input id="acquisitionCost" type="number" step="0.01" {...form.register("acquisitionCost")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="mt-4 w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
