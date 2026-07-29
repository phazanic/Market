"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Zones ---

export async function getZones() {
  return await prisma.zone.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createZone(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return;

  await prisma.zone.create({
    data: { name, description },
  });

  revalidatePath("/admin/zones");
}

// --- Stalls ---

export async function getStalls() {
  return await prisma.stall.findMany({
    include: { zone: true },
    orderBy: { stallNumber: "asc" },
  });
}

export async function createStall(formData: FormData) {
  const stallNumber = formData.get("stallNumber") as string;
  const zoneId = formData.get("zoneId") as string;
  const dailyRate = parseFloat(formData.get("dailyRate") as string);
  const monthlyRate = parseFloat(formData.get("monthlyRate") as string);
  const status = formData.get("status") as string || "AVAILABLE";

  if (!stallNumber || !zoneId || isNaN(dailyRate) || isNaN(monthlyRate)) {
    return;
  }

  try {
    await prisma.stall.create({
      data: { stallNumber, zoneId, dailyRate, monthlyRate, status },
    });
    revalidatePath("/admin/stalls");
  } catch (error) {
    console.error("Failed to create stall", error);
  }
}

// --- Vendors ---

export async function getVendors() {
  return await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createVendor(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const vendorType = formData.get("vendorType") as string;

  if (!name || !vendorType) {
    return;
  }

  await prisma.vendor.create({
    data: { name, phone, vendorType },
  });

  revalidatePath("/admin/vendors");
}
