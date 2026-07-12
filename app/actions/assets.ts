"use server";

import { PrismaClient, AssetStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getAssets() {
  return await prisma.asset.findMany({
    include: {
      category: true,
      allocations: {
        where: { status: "ACTIVE" },
        include: { user: true, department: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAsset(data: {
  name: string;
  assetTag: string;
  serialNumber?: string;
  acquisitionCost?: number;
  condition?: string;
  location?: string;
  photoUrl?: string;
  isSharedBookable: boolean;
  categoryId: string;
}) {
  const result = await prisma.asset.create({
    data: {
      name: data.name,
      assetTag: data.assetTag,
      serialNumber: data.serialNumber || null,
      acquisitionCost: data.acquisitionCost || null,
      condition: data.condition || null,
      location: data.location || null,
      photoUrl: data.photoUrl || null,
      isSharedBookable: data.isSharedBookable,
      categoryId: data.categoryId,
      status: "AVAILABLE",
    }
  });
  revalidatePath("/dashboard/assets");
  return result;
}

export async function updateAssetStatus(id: string, status: AssetStatus) {
  const result = await prisma.asset.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/dashboard/assets");
  return result;
}
