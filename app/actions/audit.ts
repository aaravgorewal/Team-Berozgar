"use server";

import { PrismaClient, AuditStatus, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getAuditCycles() {
  return await prisma.auditCycle.findMany({
    include: {
      auditors: true,
      records: {
        include: { asset: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAuditCycle(data: {
  name: string;
  scope: string;
  startDate: Date;
  endDate: Date;
  auditorIds: string[];
}) {
  const result = await prisma.auditCycle.create({
    data: {
      name: data.name,
      scope: data.scope,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "OPEN",
      auditors: {
        connect: data.auditorIds.map(id => ({ id }))
      }
    }
  });

  // Automatically fetch assets based on scope (for now we assume all assets if scope is "ALL")
  // For simplicity, we just create records for all assets in this example
  const assets = await prisma.asset.findMany();
  
  await prisma.auditRecord.createMany({
    data: assets.map(a => ({
      auditCycleId: result.id,
      assetId: a.id,
      status: "VERIFIED" as VerificationStatus, // Default to verified
    }))
  });

  revalidatePath("/dashboard/audit");
  return result;
}

export async function updateAuditRecord(recordId: string, status: VerificationStatus, notes?: string) {
  await prisma.auditRecord.update({
    where: { id: recordId },
    data: { status, notes }
  });
  revalidatePath("/dashboard/audit");
}

export async function closeAuditCycle(cycleId: string) {
  await prisma.$transaction(async (tx) => {
    const cycle = await tx.auditCycle.update({
      where: { id: cycleId },
      data: { status: "CLOSED" },
      include: { records: true }
    });

    // Update asset statuses based on missing/damaged
    for (const record of cycle.records) {
      if (record.status === "MISSING") {
        await tx.asset.update({ where: { id: record.assetId }, data: { status: "LOST" }});
      }
      if (record.status === "DAMAGED") {
        await tx.asset.update({ where: { id: record.assetId }, data: { condition: "Poor" }});
      }
    }
  });

  revalidatePath("/dashboard/audit");
  revalidatePath("/dashboard/assets");
}
