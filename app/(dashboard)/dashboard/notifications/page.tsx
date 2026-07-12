import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, AlertTriangle, ArrowRightLeft, UserPlus } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NotificationsPage() {
  const [allocations, transfers, maintenance] = await Promise.all([
    prisma.allocation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { asset: true, user: true, department: true }
    }),
    prisma.transferRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { allocation: { include: { asset: true } }, requestedBy: true }
    }),
    prisma.maintenanceRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { asset: true }
    }),
  ]);

  const notifications = [
    ...allocations.map(a => ({
      id: `alloc-${a.id}`,
      type: "allocation",
      title: "New Asset Allocation",
      message: `${a.asset.name} was allocated to ${a.user?.name || a.department?.name}.`,
      date: a.createdAt,
      icon: UserPlus,
      color: "text-blue-500",
      bg: "bg-blue-50"
    })),
    ...transfers.map(t => ({
      id: `trans-${t.id}`,
      type: "transfer",
      title: "Transfer Requested",
      message: `${t.requestedBy.name} requested to transfer ${t.allocation.asset.name}.`,
      date: t.createdAt,
      icon: ArrowRightLeft,
      color: "text-purple-500",
      bg: "bg-purple-50"
    })),
    ...maintenance.map(m => ({
      id: `maint-${m.id}`,
      type: "maintenance",
      title: m.status === "RESOLVED" ? "Maintenance Resolved" : "Maintenance Requested",
      message: `${m.asset.name}: ${m.issue}`,
      date: m.createdAt,
      icon: m.status === "RESOLVED" ? CheckCircle : AlertTriangle,
      color: m.status === "RESOLVED" ? "text-green-500" : "text-amber-500",
      bg: m.status === "RESOLVED" ? "bg-green-50" : "bg-amber-50"
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Feed</h2>
        <p className="text-muted-foreground">
          Stay informed about real-time activity across the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className={`p-2 rounded-full ${notif.bg} ${notif.color}`}>
                  <notif.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.date.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
