"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createZone(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await prisma.zone.create({
      data: { name, description },
    });
    revalidatePath("/admin/zones");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create zone" };
  }
}
