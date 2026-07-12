"use server";

import { PrismaClient, MaintenanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getMaintenanceRequests() {
  return await prisma.maintenanceRequest.findMany({
    include: {
      asset: true,
      requestedBy: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createMaintenanceRequest(data: {
  assetId: string;
  requestedById: string;
  issue: string;
  priority: string;
}) {
  const result = await prisma.maintenanceRequest.create({
    data: {
      assetId: data.assetId,
      requestedById: data.requestedById,
      issue: data.issue,
      priority: data.priority,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard/maintenance");
  return result;
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceStatus, assetId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.maintenanceRequest.update({
      where: { id },
      data: { status }
    });

    if (status === "APPROVED" || status === "IN_PROGRESS") {
      await tx.asset.update({
        where: { id: assetId },
        data: { status: "UNDER_MAINTENANCE" }
      });
    } else if (status === "RESOLVED") {
      await tx.asset.update({
        where: { id: assetId },
        data: { status: "AVAILABLE" }
      });
    }
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/assets");
}
