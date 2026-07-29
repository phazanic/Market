import { prisma } from "@/lib/prisma"
import { AdminDashboardWrapper } from "@/components/admin/AdminDashboardWrapper"
import { VendorForm } from "./VendorForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { VENDOR_TYPE_COLORS, VendorType } from "@/lib/constants"

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <AdminDashboardWrapper 
      title="Vendors (Tenants)" 
      actionButton={<VendorForm trigger={<Button>Add Vendor</Button>} />}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name / Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell className="font-bold">{vendor.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  VENDOR_TYPE_COLORS[vendor.vendorType as VendorType] || 'bg-gray-100 text-gray-700'
                }`}>
                  {vendor.vendorType}
                </span>
              </TableCell>
              <TableCell>{vendor.phone || "-"}</TableCell>
            </TableRow>
          ))}
          {vendors.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No vendors found. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminDashboardWrapper>
  )
}
