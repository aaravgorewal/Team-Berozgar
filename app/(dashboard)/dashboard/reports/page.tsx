import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { ReportsPieChart } from "@/components/reports/reports-pie-chart";

const prisma = new PrismaClient();

export default async function ReportsPage() {
  const [totalAssets, availableAssets, allocatedAssets, maintenanceCount, assetsByCategory, maintenanceByCategory] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.maintenanceRequest.count(),
    prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    }),
    prisma.maintenanceRequest.findMany({
      include: { asset: { include: { category: true } } }
    })
  ]);

  const utilRate = totalAssets === 0 ? 0 : Math.round((allocatedAssets / totalAssets) * 100);

  // Fetch category names for the charts
  const categories = await prisma.assetCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  // Process data for Assets by Category pie chart
  const assetsPieData = assetsByCategory.map(item => ({
    name: item.categoryId ? categoryMap.get(item.categoryId) || 'Unknown' : 'Uncategorized',
    value: item._count.id
  })).filter(item => item.value > 0);

  // Process data for Maintenance by Category bar chart
  const maintenanceMap = new Map();
  maintenanceByCategory.forEach(req => {
    const catName = req.asset.category?.name || 'Uncategorized';
    maintenanceMap.set(catName, (maintenanceMap.get(catName) || 0) + 1);
  });
  
  const maintenanceChartData = Array.from(maintenanceMap.entries()).map(([name, count]) => ({
    name,
    tickets: count
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Actionable operational insights and utilization metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Maintenance Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 h-[450px]">
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ReportsPieChart data={assetsPieData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 h-[450px]">
          <CardHeader>
            <CardTitle>Maintenance Frequency by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ReportsCharts data={maintenanceChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
