"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Eye } from "lucide-react";
import { closeAuditCycle, updateAuditRecord } from "@/app/actions/audit";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuditList({ initialData }: { initialData: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleClose(id: string) {
    setLoadingId(id);
    try {
      await closeAuditCycle(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRecordUpdate(recordId: string, status: any) {
    try {
      await updateAuditRecord(recordId, status);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {initialData.length === 0 ? (
        <Card>
          <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
            No audit cycles have been created.
          </CardContent>
        </Card>
      ) : (
        initialData.map((cycle) => (
          <Card key={cycle.id}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">{cycle.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Scope: {cycle.scope} • {new Date(cycle.startDate).toLocaleDateString()} to {new Date(cycle.endDate).toLocaleDateString()}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={cycle.status === "OPEN" ? "default" : "secondary"}>{cycle.status}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    Auditors: {cycle.auditors.map((a: any) => a.name).join(", ")}
                  </span>
                </div>
              </div>
              {cycle.status === "OPEN" && (
                <Button 
                  variant="outline" 
                  onClick={() => handleClose(cycle.id)}
                  disabled={loadingId === cycle.id}
                  className="mt-4 sm:mt-0"
                >
                  {loadingId === cycle.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Close Audit Cycle
                </Button>
              )}
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycle.records.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.asset?.assetTag}</TableCell>
                      <TableCell>{record.asset?.name}</TableCell>
                      <TableCell>
                        {cycle.status === "OPEN" ? (
                          <Select 
                            defaultValue={record.status}
                            onValueChange={(val) => handleRecordUpdate(record.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VERIFIED">Verified</SelectItem>
                              <SelectItem value="MISSING">Missing</SelectItem>
                              <SelectItem value="DAMAGED">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={record.status === "VERIFIED" ? "outline" : "destructive"}>
                            {record.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
