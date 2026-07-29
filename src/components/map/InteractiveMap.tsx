"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Vendor = {
  name: string
  phone: string | null
}

type Contract = {
  vendor: Vendor
}

type PaymentCollection = {
  status: string
}

type Stall = {
  id: string
  stallNumber: string
  status: string
  dailyRate: number
  monthlyRate: number
  contracts: Contract[]
  paymentCollections: PaymentCollection[]
}

type Zone = {
  id: string
  name: string
  stalls: Stall[]
}

export function InteractiveMap({ zones }: { zones: Zone[] }) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(zones.length > 0 ? zones[0].id : null)

  const selectedZone = zones.find(z => z.id === selectedZoneId)
  
  if (zones.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-8 text-muted-foreground">
        No zones found. Please add zones in the admin dashboard.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-lg font-bold">Interactive Floor Map</h1>
      </header>

      {/* Zone Selector */}
      <div className="flex overflow-x-auto p-4 gap-2 border-b bg-white scrollbar-hide">
        {zones.map(zone => (
          <Button
            key={zone.id}
            variant={selectedZoneId === zone.id ? "default" : "outline"}
            className={cn(
              "rounded-full px-6 flex-shrink-0 transition-colors",
              selectedZoneId === zone.id ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent" : "border-slate-200"
            )}
            onClick={() => setSelectedZoneId(zone.id)}
          >
            {zone.name}
          </Button>
        ))}
      </div>

      {/* Map Grid */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4">
          {selectedZone?.stalls.map(stall => {
            const hasActiveContract = stall.contracts.length > 0
            const todayPayment = stall.paymentCollections[0]
            
            // Determine Color Status
            // Gray (Vacant) - No active contract
            // Green (Paid) - Active contract and payment recorded for today
            // Red (Unpaid) - Active contract but no payment recorded for today
            let stallColor = "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200" // Vacant
            let statusText = "Vacant"

            if (hasActiveContract) {
              if (todayPayment?.status === "PAID") {
                stallColor = "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-[inset_0_0_0_2px_rgba(16,185,129,0.2)] hover:bg-emerald-200"
                statusText = "Paid"
              } else {
                stallColor = "bg-red-100 border-red-400 text-red-800 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.2)] hover:bg-red-200"
                statusText = "Unpaid"
              }
            }

            return (
              <Dialog key={stall.id}>
                <DialogTrigger
                  className={cn(
                    "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 shadow-sm transition-transform active:scale-95 duration-100",
                    stallColor
                  )}
                >
                  <span className="font-bold text-xl">{stall.stallNumber}</span>
                  <span className="text-xs font-medium mt-1">{statusText}</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[90%] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Stall {stall.stallNumber}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-3 h-3 rounded-full",
                          statusText === "Vacant" ? "bg-gray-400" : 
                          statusText === "Paid" ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className="font-medium text-lg">{statusText}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rates</span>
                      <div className="flex justify-between bg-slate-50 p-3 rounded-lg border">
                        <div>
                          <div className="text-sm text-slate-500">Daily</div>
                          <div className="font-medium">฿{stall.dailyRate.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500">Monthly</div>
                          <div className="font-medium">฿{stall.monthlyRate.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {hasActiveContract && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Tenant</span>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-1">
                          <div className="font-bold text-blue-900 text-lg">{stall.contracts[0].vendor.name}</div>
                          {stall.contracts[0].vendor.phone && (
                            <div className="text-blue-700 text-sm">{stall.contracts[0].vendor.phone}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
          {selectedZone?.stalls.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">
              No stalls in this zone yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
