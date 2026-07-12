"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createTransferRequest } from "@/app/actions/allocations";
import { useSession } from "next-auth/react";

export function RaiseTransferDialog({ 
  allocation, 
  users, 
  departments, 
  open, 
  onOpenChange 
}: { 
  allocation: any; 
  users: any[]; 
  departments: any[]; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [assigneeType, setAssigneeType] = useState("user");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");

  if (!allocation) return null;

  async function onSubmit() {
    if (!assigneeId) {
      setError("Please select an assignee.");
      return;
    }
    if (!session?.user?.id) {
      setError("You must be logged in.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await createTransferRequest({
        allocationId: allocation.id,
        requestedById: session.user.id,
        targetUserId: assigneeType === "user" ? assigneeId : undefined,
        targetDepartmentId: assigneeType === "department" ? assigneeId : undefined,
      });
      onOpenChange(false);
      setAssigneeId("");
    } catch (err) {
      console.error(err);
      setError("Failed to create transfer request.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Transfer Request</DialogTitle>
          <DialogDescription>
            Request to transfer {allocation.asset?.name} ({allocation.asset?.assetTag}) to someone else.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Currently Allocated To</Label>
            <div className="text-sm font-medium p-2 bg-muted rounded-md">
              {allocation.user?.name || allocation.department?.name || "Unknown"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transfer To Type</Label>
              <Select value={assigneeType} onValueChange={(val) => { setAssigneeType(val); setAssigneeId(""); }}>
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
              <Label>Select {assigneeType === "user" ? "Employee" : "Department"}</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
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
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isLoading || !assigneeId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
