import { prisma } from "@/lib/prisma"
import { AdminDashboardWrapper } from "@/components/admin/AdminDashboardWrapper"
import { StallForm } from "./StallForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { STALL_STATUS_COLORS, StallStatus } from "@/lib/constants"
import { PencilIcon } from "lucide-react"

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
      title="Stalls" 
      actionButton={<StallForm zones={zones} trigger={<Button>Add Stall</Button>} />}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stall Number</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stalls.map((stall) => (
            <TableRow key={stall.id}>
              <TableCell className="font-bold">{stall.stallNumber}</TableCell>
              <TableCell>{stall.zone.name}</TableCell>
              <TableCell>฿{stall.dailyRate}</TableCell>
              <TableCell>฿{stall.monthlyRate}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  STALL_STATUS_COLORS[stall.status as StallStatus] || 'bg-gray-100 text-gray-700'
                }`}>
                  {stall.status}
                </span>
              </TableCell>
              <TableCell>
                <StallForm 
                  zones={zones} 
                  stall={stall} 
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  } 
                />
              </TableCell>
            </TableRow>
          ))}
          {stalls.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No stalls found. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminDashboardWrapper>
  )
}
