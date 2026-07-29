"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { collectPayment } from "@/app/actions/payment"

type Vendor = {
  id: string
  name: string
  phone: string | null
  vendorType: string
}

type Contract = {
  id: string
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

function StallDialog({ stall, stallColor, statusText }: { stall: Stall, stallColor: string, statusText: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false)
  const [waterFee, setWaterFee] = useState<number>(0)
  const [electricFee, setElectricFee] = useState<number>(0)
  const [garbageFee, setGarbageFee] = useState<number>(0)
  const [isPending, startTransition] = useTransition()

  const hasActiveContract = stall.contracts.length > 0
  const contract = hasActiveContract ? stall.contracts[0] : null
  const vendor = contract?.vendor

  // Determine stall fee based on vendor type or fallback to dailyRate
  const stallFee = vendor?.vendorType === "FIXED" ? stall.monthlyRate / 30 : stall.dailyRate
  const totalAmount = stallFee + waterFee + electricFee + garbageFee

  const handleCollectPayment = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("stallId", stall.id)
      if (vendor) formData.append("vendorId", vendor.id)
      formData.append("stallFee", stallFee.toString())
      formData.append("waterFee", waterFee.toString())
      formData.append("electricFee", electricFee.toString())
      formData.append("garbageFee", garbageFee.toString())
      formData.append("paymentMethod", "CASH")

      const res = await collectPayment(formData)
      if (res.success) {
        setIsOpen(false)
        setIsPaymentFormOpen(false)
        setWaterFee(0)
        setElectricFee(0)
        setGarbageFee(0)
      }
    })
  }

  // Handle dialog open state change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => setIsPaymentFormOpen(false), 200) // Reset form state when closing
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className={cn(
          "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 shadow-sm transition-transform active:scale-95 duration-100",
          stallColor
        )}
      >
        <span className="font-bold text-xl">{stall.stallNumber}</span>
        <span className="text-xs font-medium mt-1">{statusText}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[90%] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Stall {stall.stallNumber}</DialogTitle>
        </DialogHeader>
        
        {!isPaymentFormOpen ? (
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

            {hasActiveContract && vendor && (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Tenant</span>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-1">
                  <div className="font-bold text-blue-900 text-lg">{vendor.name}</div>
                  <div className="text-blue-800 text-sm">{vendor.vendorType === "FIXED" ? "Monthly Contract" : "Casual Renter"}</div>
                  {vendor.phone && (
                    <div className="text-blue-700 text-sm mt-1">{vendor.phone}</div>
                  )}
                </div>
              </div>
            )}

            {statusText === "Unpaid" && (
              <Button 
                onClick={() => setIsPaymentFormOpen(true)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
              >
                Collect Payment
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg border flex justify-between items-center">
              <span className="font-medium text-slate-600">Stall Fee</span>
              <span className="font-bold text-lg">฿{stallFee.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="water">Water Fee (฿)</Label>
              <Input 
                id="water" 
                type="number" 
                min="0" 
                value={waterFee || ""}
                onChange={e => setWaterFee(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="electric">Electric Fee (฿)</Label>
              <Input 
                id="electric" 
                type="number" 
                min="0" 
                value={electricFee || ""}
                onChange={e => setElectricFee(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="garbage">Garbage Fee (฿)</Label>
              <Input 
                id="garbage" 
                type="number" 
                min="0" 
                value={garbageFee || ""}
                onChange={e => setGarbageFee(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl text-blue-700">฿{totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsPaymentFormOpen(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCollectPayment}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Confirm Cash"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
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
              <StallDialog 
                key={stall.id} 
                stall={stall} 
                stallColor={stallColor} 
                statusText={statusText} 
              />
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
