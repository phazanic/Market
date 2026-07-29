import { InteractiveMap } from "@/components/map/InteractiveMap"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const toISODates = <T extends { createdAt: Date, updatedAt: Date }>(obj: T) => ({
  ...obj,
  createdAt: obj.createdAt.toISOString(),
  updatedAt: obj.updatedAt.toISOString(),
})

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
          },
          attendanceLogs: {
            where: {
              date: {
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
    ...toISODates(zone),
    stalls: zone.stalls.map(stall => ({
      ...toISODates(stall),
      contracts: stall.contracts.map(contract => ({
        ...toISODates(contract),
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate?.toISOString() || null,
        vendor: toISODates(contract.vendor)
      })),
      paymentCollections: stall.paymentCollections.map(payment => ({
        ...toISODates(payment),
        paymentDate: payment.paymentDate.toISOString(),
      })),
      attendanceLogs: stall.attendanceLogs.map((log: any) => ({
        ...toISODates(log),
        date: log.date.toISOString(),
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
