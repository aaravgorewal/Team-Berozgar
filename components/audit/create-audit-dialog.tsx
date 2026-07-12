"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createAuditCycle } from "@/app/actions/audit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  scope: z.string().min(2, "Scope is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export function CreateAuditDialog({ auditors }: { auditors: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Just use the first auditor for simplicity in this MVP
  const defaultAuditorId = auditors.length > 0 ? auditors[0].id : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scope: "ALL",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!defaultAuditorId) return; // Needs an auditor
    setIsLoading(true);
    try {
      await createAuditCycle({
        name: values.name,
        scope: values.scope,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        auditorIds: [defaultAuditorId],
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
          New Audit Cycle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Audit Cycle</DialogTitle>
          <DialogDescription>Start a new verification cycle for your assets.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cycle Name</Label>
            <Input id="name" placeholder="Q3 Annual Audit" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Input id="scope" placeholder="e.g. ALL, IT Dept, NYC Office" {...form.register("scope")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !defaultAuditorId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {defaultAuditorId ? "Create Cycle" : "No Auditors Available"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
