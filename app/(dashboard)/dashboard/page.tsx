import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowRightLeft, Wrench, CalendarDays, AlertCircle } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const [
    availableCount,
    allocatedCount,
    totalAssets,
    activeBookingsCount,
    maintenanceCount,
    overdueAllocations,
    recentAllocations,
    recentBookings
  ] = await Promise.all([
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.asset.count(),
    prisma.booking.count({ where: { status: "ACTIVE" } }),
    prisma.maintenanceRequest.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.allocation.findMany({
      where: {
        status: "ACTIVE",
        expectedReturnDate: { lt: new Date() }
      },
      include: {
        asset: true,
        user: true,
        department: true
      },
      take: 5,
      orderBy: { expectedReturnDate: "asc" }
    }),
    prisma.allocation.findMany({
      take: 7,
      orderBy: { createdAt: "desc" }
    }),
    prisma.booking.findMany({
      take: 7,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const utilizationRate = totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0;

  // Prepare simple chart data for activity (last 7 days allocations vs bookings)
  const activityData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    activityData.push({
      date: dateStr,
      allocations: recentAllocations.filter(a => a.createdAt.toISOString().split('T')[0] === dateStr).length,
      bookings: recentBookings.filter(b => b.createdAt.toISOString().split('T')[0] === dateStr).length,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back. Here is an overview of your organization's assets and resources.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Available</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-xs text-muted-foreground">Ready for deployment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Allocated</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocatedCount}</div>
            <p className="text-xs text-muted-foreground">{utilizationRate}% utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookingsCount}</div>
            <p className="text-xs text-muted-foreground">Currently reserved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground">Open tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts data={activityData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Overdue Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueAllocations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No overdue assets.</p>
              ) : (
                overdueAllocations.map(alloc => {
                  const daysOverdue = Math.floor((new Date().getTime() - new Date(alloc.expectedReturnDate!).getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={alloc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{alloc.asset.name} ({alloc.asset.assetTag})</p>
                        <p className="text-sm text-muted-foreground">
                          {alloc.user?.name || alloc.department?.name} • Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
