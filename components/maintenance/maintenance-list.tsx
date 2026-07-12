"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, Eye, Settings2 } from "lucide-react";
import { updateMaintenanceStatus } from "@/app/actions/maintenance";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export function MaintenanceList({ initialData }: { initialData: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatusUpdate(id: string, newStatus: any, assetId: string) {
    setLoadingId(id);
    try {
      await updateMaintenanceStatus(id, newStatus, assetId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No maintenance requests found.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {req.asset?.name} <span className="text-muted-foreground text-xs block">({req.asset?.assetTag})</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{req.issue}</TableCell>
                  <TableCell>
                    {req.requestedBy?.name}
                    <span className="text-xs text-muted-foreground block">{format(new Date(req.createdAt), "PP")}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      req.priority === "HIGH" ? "destructive" :
                      req.priority === "MEDIUM" ? "default" : "secondary"
                    }>
                      {req.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      req.status === "PENDING" ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                      req.status === "IN_PROGRESS" ? "text-blue-600 border-blue-200 bg-blue-50" :
                      req.status === "RESOLVED" ? "text-green-600 border-green-200 bg-green-50" : ""
                    }>
                      {req.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {loadingId === req.id ? (
                      <Button variant="ghost" size="sm" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </Button>
                    ) : (
                      <Select 
                        value={req.status} 
                        onValueChange={(val) => handleStatusUpdate(req.id, val, req.assetId)}
                      >
                        <SelectTrigger className="w-[130px] inline-flex h-8 ml-auto">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approve</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="REJECTED">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
