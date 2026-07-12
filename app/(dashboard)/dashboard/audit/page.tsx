import { AuditList } from "@/components/audit/audit-list";
import { CreateAuditDialog } from "@/components/audit/create-audit-dialog";
import { getAuditCycles } from "@/app/actions/audit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AuditPage() {
  const [cycles, auditors] = await Promise.all([
    getAuditCycles(),
    // For MVP testing, allowing all users to act as auditors. In production, restrict to ADMIN/ASSET_MANAGER.
    prisma.user.findMany()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Cycles</h2>
          <p className="text-muted-foreground">
            Run structured verification cycles and catch discrepancies.
          </p>
        </div>
        <CreateAuditDialog auditors={auditors} />
      </div>

      <AuditList initialData={cycles} />
    </div>
  );
}
