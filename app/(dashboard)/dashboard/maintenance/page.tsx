import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { CreateMaintenanceDialog } from "@/components/maintenance/create-maintenance-dialog";
import { getMaintenanceRequests } from "@/app/actions/maintenance";
import { getAssets } from "@/app/actions/assets";

export default async function MaintenancePage() {
  const [requests, assets] = await Promise.all([
    getMaintenanceRequests(),
    getAssets(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Management</h2>
          <p className="text-muted-foreground">
            Track and route repairs through an approval workflow.
          </p>
        </div>
        <CreateMaintenanceDialog assets={assets} />
      </div>

      <MaintenanceList initialData={requests} />
    </div>
  );
}
