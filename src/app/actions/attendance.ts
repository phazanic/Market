"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleAttendance(stallId: string, targetDateString: string, isPresent: boolean) {
  try {
    // Parse the client-provided date string (e.g., "YYYY-MM-DD") directly as UTC midnight
    const date = new Date(targetDateString)
    
    await prisma.attendanceLog.upsert({
      where: {
        stallId_date: {
          stallId,
          date
        }
      },
      update: {
        isPresent
      },
      create: {
        stallId,
        date,
        isPresent
      }
    })
    
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to toggle attendance:", error)
    return { success: false, error: "Failed to toggle attendance" }
  }
}
