"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getAllocations() {
  return await prisma.allocation.findMany({
    include: {
      asset: { include: { category: true } },
      user: true,
      department: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAllocation(data: {
  assetId: string;
  userId?: string;
  departmentId?: string;
  expectedReturnDate?: Date;
}) {
  // Check conflict
  const existingAllocation = await prisma.allocation.findFirst({
    where: {
      assetId: data.assetId,
      status: "ACTIVE"
    },
    include: { user: true, department: true }
  });

  if (existingAllocation) {
    const holder = existingAllocation.user?.name || existingAllocation.department?.name || "someone";
    return { 
      error: `Currently held by ${holder}`, 
      existingAllocationId: existingAllocation.id 
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.create({
      data: {
        assetId: data.assetId,
        userId: data.userId || null,
        departmentId: data.departmentId || null,
        expectedReturnDate: data.expectedReturnDate || null,
        status: "ACTIVE"
      }
    });

    await tx.asset.update({
      where: { id: data.assetId },
      data: { status: "ALLOCATED" }
    });

    return allocation;
  });

  revalidatePath("/dashboard/allocations");
  revalidatePath("/dashboard/assets");
  return { success: true, allocation: result };
}

export async function returnAsset(allocationId: string, assetId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.allocation.update({
      where: { id: allocationId },
      data: { status: "RETURNED", returnDate: new Date() }
    });

    await tx.asset.update({
      where: { id: assetId },
      data: { status: "AVAILABLE" }
    });
  });

  revalidatePath("/dashboard/allocations");
  revalidatePath("/dashboard/assets");
}

export async function createTransferRequest(data: {
  allocationId: string;
  requestedById: string; // The person asking for it
  targetUserId?: string; // If transferring to a user
  targetDepartmentId?: string; // If transferring to a dept
}) {
  const result = await prisma.transferRequest.create({
    data: {
      allocationId: data.allocationId,
      requestedById: data.requestedById,
      targetUserId: data.targetUserId || null,
      targetDepartmentId: data.targetDepartmentId || null,
      status: "PENDING"
    }
  });
  revalidatePath("/dashboard/allocations");
  return result;
}
