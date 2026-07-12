import { AllocationList } from "@/components/allocations/allocation-list";
import { CreateAllocationDialog } from "@/components/allocations/create-allocation-dialog";
import { getAllocations } from "@/app/actions/allocations";
import { getAssets } from "@/app/actions/assets";
import { getEmployees, getDepartments } from "@/app/actions/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

async function getTransferRequests() {
  return await prisma.transferRequest.findMany({
    include: {
      allocation: { include: { asset: true, user: true } },
      requestedBy: true,
      targetUser: true,
      targetDepartment: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export default async function AllocationsPage() {
  const [allocations, assets, users, departments, transfers] = await Promise.all([
    getAllocations(),
    getAssets(),
    getEmployees(),
    getDepartments(),
    getTransferRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Allocations & Transfers</h2>
          <p className="text-muted-foreground">
            Manage who holds what and handle transfer requests.
          </p>
        </div>
        <CreateAllocationDialog assets={assets} users={users} departments={departments} />
      </div>

      {transfers.length > 0 && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="text-lg text-blue-900">Pending Transfer Requests</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {transfers.map(req => (
              <div key={req.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{req.allocation.asset.name} ({req.allocation.asset.assetTag})</div>
                  <div className="text-sm text-muted-foreground">
                    Currently with: <span className="font-medium text-foreground">{req.allocation.user?.name || 'Department'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Requested by: <span className="font-medium text-foreground">{req.requestedBy.name}</span> 
                    {req.targetUser && ` for ${req.targetUser.name}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-600 bg-blue-50">Pending Approval</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AllocationList initialData={allocations} users={users} departments={departments} />
    </div>
  );
}
