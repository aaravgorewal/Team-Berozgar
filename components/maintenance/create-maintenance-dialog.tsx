"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createMaintenanceRequest } from "@/app/actions/maintenance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issue: z.string().min(5, "Please describe the issue in detail"),
  priority: z.string(),
});

export function CreateMaintenanceDialog({ assets }: { assets: any[] }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: "",
      issue: "",
      priority: "MEDIUM",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      await createMaintenanceRequest({
        assetId: values.assetId,
        requestedById: session.user.id,
        issue: values.issue,
        priority: values.priority,
      });
      setIsOpen(false);
      form.reset();
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
          Raise Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Maintenance Request</DialogTitle>
          <DialogDescription>Report an issue with an asset to trigger the repair workflow.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assetId">Select Asset</Label>
            <Select onValueChange={(val) => form.setValue("assetId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an asset..." />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.assetTag})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.assetId && (
              <p className="text-sm text-red-500">{form.formState.errors.assetId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select onValueChange={(val) => form.setValue("priority", val)} defaultValue="MEDIUM">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">Issue Description</Label>
            <Input id="issue" placeholder="Screen flickering..." {...form.register("issue")} />
            {form.formState.errors.issue && (
              <p className="text-sm text-red-500">{form.formState.errors.issue.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
