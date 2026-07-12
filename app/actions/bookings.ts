"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getBookings() {
  return await prisma.booking.findMany({
    include: {
      asset: true,
      user: true,
    },
    orderBy: { startTime: "asc" }
  });
}

export async function createBooking(data: {
  assetId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
}) {
  // Overlap validation logic
  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId: data.assetId,
      status: { in: ["UPCOMING", "ONGOING"] },
      AND: [
        { startTime: { lt: data.endTime } },
        { endTime: { gt: data.startTime } }
      ]
    }
  });

  if (overlapping) {
    return { error: "Time slot is already booked for this resource." };
  }

  const result = await prisma.booking.create({
    data: {
      assetId: data.assetId,
      userId: data.userId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "UPCOMING"
    }
  });

  revalidatePath("/dashboard/bookings");
  return { success: true, booking: result };
}

export async function cancelBooking(id: string) {
  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
  revalidatePath("/dashboard/bookings");
}
