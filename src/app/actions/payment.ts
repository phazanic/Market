"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function collectPayment(formData: FormData) {
  const stallId = formData.get("stallId") as string
  const vendorId = formData.get("vendorId") as string | null
  const stallFee = parseFloat(formData.get("stallFee") as string || "0")
  const waterFee = parseFloat(formData.get("waterFee") as string || "0")
  const electricFee = parseFloat(formData.get("electricFee") as string || "0")
  const garbageFee = parseFloat(formData.get("garbageFee") as string || "0")
  const paymentMethod = formData.get("paymentMethod") as string || "CASH"

  if (!stallId) {
    throw new Error("stallId is required")
  }

  const totalAmount = stallFee + waterFee + electricFee + garbageFee

  const payment = await prisma.paymentCollection.create({
    data: {
      stallId,
      vendorId: vendorId || undefined,
      stallFee,
      waterFee,
      electricFee,
      garbageFee,
      totalAmount,
      paymentMethod,
      status: "PAID",
      paymentDate: new Date(),
    }
  })

  revalidatePath("/")
  return { success: true, paymentId: payment.id }
}
