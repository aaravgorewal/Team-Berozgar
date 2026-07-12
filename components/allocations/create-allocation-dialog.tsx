"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { createAllocation, createTransferRequest } from "@/app/actions/allocations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  assigneeType: z.enum(["user", "department"]),
  assigneeId: z.string().min(1, "Assignee is required"),
  expectedReturnDate: z.string().optional(),
});

export function CreateAllocationDialog({ assets, users, departments }: { assets: any[], users: any[], departments: any[] }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conflictError, setConflictError] = useState<{ error: string, existingAllocationId: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: "",
      assigneeType: "user",
      assigneeId: "",
      expectedReturnDate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setConflictError(null);
    try {
      const data = {
        assetId: values.assetId,
        userId: values.assigneeType === "user" ? values.assigneeId : undefined,
        departmentId: values.assigneeType === "department" ? values.assigneeId : undefined,
        expectedReturnDate: values.expectedReturnDate ? new Date(values.expectedReturnDate) : undefined,
      };

      const result = await createAllocation(data);

      if (result.error) {
        setConflictError({ error: result.error, existingAllocationId: result.existingAllocationId! });
      } else {
        setIsOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTransferRequest() {
    if (!conflictError || !session?.user?.id) return;
    setIsLoading(true);
    try {
      const values = form.getValues();
      await createTransferRequest({
        allocationId: conflictError.existingAllocationId,
        requestedById: session.user.id,
        targetUserId: values.assigneeType === "user" ? values.assigneeId : undefined,
        targetDepartmentId: values.assigneeType === "department" ? values.assigneeId : undefined,
      });
      setIsOpen(false);
      form.reset();
      setConflictError(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const assigneeType = form.watch("assigneeType");
  const availableAssets = assets.filter(a => a.status === "AVAILABLE" || a.status === "ALLOCATED"); // We show ALLOCATED to trigger conflict if selected

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Asset</DialogTitle>
          <DialogDescription>Assign an asset to an employee or a department.</DialogDescription>
        </DialogHeader>

        {conflictError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Asset Already Allocated</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{conflictError.error}</p>
              <Button size="sm" variant="outline" className="w-full bg-white text-red-600 hover:bg-red-50" onClick={handleTransferRequest} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Raise Transfer Request
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assetId">Asset</Label>
            <Select onValueChange={(val) => form.setValue("assetId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Asset" />
              </SelectTrigger>
              <SelectContent>
                {availableAssets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.assetTag})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.assetId && (
              <p className="text-sm text-red-500">{form.formState.errors.assetId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeType">Assign To</Label>
              <Select onValueChange={(val: any) => form.setValue("assigneeType", val)} defaultValue="user">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Employee</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Select {assigneeType === "user" ? "Employee" : "Department"}</Label>
              <Select onValueChange={(val) => form.setValue("assigneeId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {assigneeType === "user" ? (
                    users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))
                  ) : (
                    departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.assigneeId && (
                <p className="text-sm text-red-500">{form.formState.errors.assigneeId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedReturnDate">Expected Return Date (Optional)</Label>
            <Input id="expectedReturnDate" type="date" {...form.register("expectedReturnDate")} />
          </div>

          <DialogFooter>
            {!conflictError && (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Allocate
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
