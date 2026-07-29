import { InteractiveMap } from "@/components/map/InteractiveMap"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function FieldCollectorHome() {
  // Fetch zones and stalls
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const zones = await prisma.zone.findMany({
    include: {
      stalls: {
        include: {
          contracts: {
            where: {
              status: "ACTIVE"
            },
            include: {
              vendor: true
            }
          },
          paymentCollections: {
            where: {
              createdAt: {
                gte: startOfDay
              }
            }
          }
        },
        orderBy: {
          stallNumber: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // We map dates correctly for client serialization
  const serializedZones = zones.map(zone => ({
    ...zone,
    createdAt: zone.createdAt.toISOString(),
    updatedAt: zone.updatedAt.toISOString(),
    stalls: zone.stalls.map(stall => ({
      ...stall,
      createdAt: stall.createdAt.toISOString(),
      updatedAt: stall.updatedAt.toISOString(),
      contracts: stall.contracts.map(contract => ({
        ...contract,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate?.toISOString() || null,
        createdAt: contract.createdAt.toISOString(),
        updatedAt: contract.updatedAt.toISOString(),
        vendor: {
          ...contract.vendor,
          createdAt: contract.vendor.createdAt.toISOString(),
          updatedAt: contract.vendor.updatedAt.toISOString(),
        }
      })),
      paymentCollections: stall.paymentCollections.map(payment => ({
        ...payment,
        paymentDate: payment.paymentDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      }))
    }))
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <InteractiveMap zones={serializedZones as any} />
    </div>
  )
}
