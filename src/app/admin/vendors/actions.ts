"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createVendor(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const vendorType = formData.get("vendorType") as string;

  if (!name || !vendorType) {
    return { error: "Name and Vendor Type are required" };
  }

  try {
    await prisma.vendor.create({
      data: { name, phone, vendorType },
    });
    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create vendor" };
  }
}
