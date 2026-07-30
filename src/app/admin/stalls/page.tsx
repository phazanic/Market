import { prisma } from "@/lib/prisma"
import { AdminDashboardWrapper } from "@/components/admin/AdminDashboardWrapper"
import { StallForm } from "./StallForm"
import { Button } from "@/components/ui/button"
import { StallTableClient } from "./StallTableClient"

export default async function StallsPage() {
  const [stalls, zones] = await Promise.all([
    prisma.stall.findMany({
      include: { zone: true },
      orderBy: { stallNumber: 'asc' }
    }),
    prisma.zone.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <AdminDashboardWrapper 
      title="แผงร้านค้า" 
      actionButton={<StallForm zones={zones} trigger={<Button>เพิ่มแผงร้านค้า</Button>} />}
    >
      <StallTableClient stalls={stalls} zones={zones} />
    </AdminDashboardWrapper>
  )
}
