"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createStall(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const stallNumber = formData.get("stallNumber") as string;
  const zoneId = formData.get("zoneId") as string;
  const dailyRate = parseFloat(formData.get("dailyRate") as string);
  const monthlyRate = parseFloat(formData.get("monthlyRate") as string);
  const status = formData.get("status") as string || "AVAILABLE";

  if (!stallNumber || !zoneId || isNaN(dailyRate) || isNaN(monthlyRate)) {
    return { error: "Please fill in all required fields" };
  }

  try {
    await prisma.stall.create({
      data: { stallNumber, zoneId, dailyRate, monthlyRate, status },
    });
    revalidatePath("/admin/stalls");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create stall (stall number might be duplicate)" };
  }
}

export async function updateStall(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const id = formData.get("id") as string;
  const stallNumber = formData.get("stallNumber") as string;
  const zoneId = formData.get("zoneId") as string;
  const dailyRate = parseFloat(formData.get("dailyRate") as string);
  const monthlyRate = parseFloat(formData.get("monthlyRate") as string);
  const status = formData.get("status") as string;

  if (!id || !stallNumber || !zoneId || isNaN(dailyRate) || isNaN(monthlyRate) || !status) {
    return { error: "Please fill in all required fields" };
  }

  try {
    await prisma.stall.update({
      where: { id },
      data: { stallNumber, zoneId, dailyRate, monthlyRate, status },
    });
    revalidatePath("/admin/stalls");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update stall" };
  }
}
