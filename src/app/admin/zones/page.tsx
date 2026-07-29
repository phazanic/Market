import { prisma } from "@/lib/prisma"
import { AdminDashboardWrapper } from "@/components/admin/AdminDashboardWrapper"
import { ZoneForm } from "./ZoneForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ZonesPage() {
  const zones = await prisma.zone.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <AdminDashboardWrapper title="Zones" actionButton={<ZoneForm />}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((zone) => (
            <TableRow key={zone.id}>
              <TableCell className="font-bold">{zone.name}</TableCell>
              <TableCell>{zone.description || "-"}</TableCell>
            </TableRow>
          ))}
          {zones.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                No zones found. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminDashboardWrapper>
  )
}
