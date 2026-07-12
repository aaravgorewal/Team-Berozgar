"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Eye, ArrowRightLeft } from "lucide-react";
import { returnAsset } from "@/app/actions/allocations";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { RaiseTransferDialog } from "./raise-transfer-dialog";

export function AllocationList({ initialData, users = [], departments = [] }: { initialData: any[], users?: any[], departments?: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [transferAllocation, setTransferAllocation] = useState<any>(null);

  async function handleReturn(allocationId: string, assetId: string) {
    setLoadingId(allocationId);
    try {
      await returnAsset(allocationId, assetId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Allocated To</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No allocations found.
                  </TableCell>
                </TableRow>
              ) : (
                initialData.map((allocation) => {
                  const isOverdue = allocation.status === "ACTIVE" && allocation.expectedReturnDate && new Date(allocation.expectedReturnDate) < new Date();
                  
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">{allocation.asset?.assetTag}</TableCell>
                      <TableCell>{allocation.asset?.name}</TableCell>
                      <TableCell>
                        {allocation.user?.name || allocation.department?.name || "Unknown"}
                        {allocation.user && <span className="text-xs text-muted-foreground block">Employee</span>}
                        {allocation.department && <span className="text-xs text-muted-foreground block">Department</span>}
                      </TableCell>
                      <TableCell>
                        {allocation.expectedReturnDate 
                          ? new Date(allocation.expectedReturnDate).toLocaleDateString()
                          : "Indefinite"}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-500 font-medium">Overdue</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          allocation.status === "ACTIVE" ? "default" :
                          allocation.status === "RETURNED" ? "outline" : "secondary"
                        }>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {allocation.status === "ACTIVE" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setTransferAllocation(allocation)}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transfer
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleReturn(allocation.id, allocation.assetId)}
                              disabled={loadingId === allocation.id}
                            >
                              {loadingId === allocation.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CornerDownLeft className="h-4 w-4 mr-2" />
                              )}
                              Return
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RaiseTransferDialog 
        allocation={transferAllocation}
        users={users}
        departments={departments}
        open={!!transferAllocation}
        onOpenChange={(open) => !open && setTransferAllocation(null)}
      />
    </div>
  );
}
