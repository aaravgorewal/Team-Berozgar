"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cancelBooking } from "@/app/actions/bookings";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function BookingList({ initialData }: { initialData: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    setLoadingId(id);
    try {
      await cancelBooking(id);
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
              <TableHead>Resource</TableHead>
              <TableHead>Booked By</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.asset?.name} <span className="text-muted-foreground text-xs block">({booking.asset?.assetTag})</span>
                  </TableCell>
                  <TableCell>{booking.user?.name}</TableCell>
                  <TableCell>{format(new Date(booking.startTime), "PPp")}</TableCell>
                  <TableCell>{format(new Date(booking.endTime), "PPp")}</TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === "UPCOMING" ? "default" :
                      booking.status === "ONGOING" ? "secondary" :
                      booking.status === "CANCELLED" ? "destructive" : "outline"
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {(booking.status === "UPCOMING" || booking.status === "ONGOING") && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(booking.id)}
                        disabled={loadingId === booking.id}
                      >
                        {loadingId === booking.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Cancel
                      </Button>
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
