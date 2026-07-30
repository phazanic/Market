"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { collectPayment } from "@/app/actions/payment"
import { toggleAttendance } from "@/app/actions/attendance"
import { QRCodeSVG } from "qrcode.react"
import generatePayload from "promptpay-qr"
import { CheckCircle2 } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

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

type AttendanceLog = {
  id: string
  date: string
  isPresent: boolean
}

type Stall = {
  id: string
  stallNumber: string
  status: string
  dailyRate: number
  monthlyRate: number
  contracts: Contract[]
  paymentCollections: PaymentCollection[]
  attendanceLogs: AttendanceLog[]
}

type Zone = {
  id: string
  name: string
  stalls: Stall[]
}

function getLocalISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function AttendanceToggle({ stallId, attendanceLogs }: { stallId: string, attendanceLogs: AttendanceLog[] }) {
  const [isPending, startTransition] = useTransition()

  const todayStr = getLocalISODate(new Date())
  const todayAttendance = attendanceLogs?.find(log => log.date.startsWith(todayStr))
  const isPresentToday = todayAttendance?.isPresent ?? false

  const handleToggleAttendance = () => {
    startTransition(async () => {
      const res = await toggleAttendance(stallId, todayStr, !isPresentToday)
      if (!res.success) {
        alert("Failed to update attendance. Please try again.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">การเช็คชื่อเข้าตลาด</span>
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg border dark:border-neutral-700">
        <span className="font-medium flex-1">{isPresentToday ? "มาแล้ววันนี้" : "ยังไม่มา"}</span>
        <Button 
          onClick={handleToggleAttendance}
          variant={isPresentToday ? "default" : "outline"}
          className={cn("h-8 text-xs", isPresentToday ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" : "border-slate-300 text-slate-700")}
          disabled={isPending}
        >
          {isPresentToday ? "เช็คว่าขาด" : "เช็คว่ามา"}
        </Button>
      </div>
    </div>
  )
}

function StallDialog({ stall, stallColor, statusText }: { stall: Stall, stallColor: string, statusText: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"none" | "form" | "qr" | "receipt">("none")
  const [waterFee, setWaterFee] = useState<number>(0)
  const [electricFee, setElectricFee] = useState<number>(0)
  const [garbageFee, setGarbageFee] = useState<number>(0)
  const [isPending, startTransition] = useTransition()
  const [qrPayload, setQrPayload] = useState<string>("")

  const hasActiveContract = stall.contracts.length > 0
  const contract = hasActiveContract ? stall.contracts[0] : null
  const vendor = contract?.vendor

  const todayStr = getLocalISODate(new Date())
  const todayAttendance = stall.attendanceLogs?.find(log => log.date.startsWith(todayStr))
  const isPresentToday = todayAttendance?.isPresent ?? false

  // Determine stall fee based on vendor type or fallback to dailyRate
  const stallFee = vendor?.vendorType === "FIXED" ? stall.monthlyRate / 30 : stall.dailyRate
  const totalAmount = stallFee + waterFee + electricFee + garbageFee

  const handleCollectPayment = (method: "CASH" | "QR") => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("stallId", stall.id)
      if (vendor) formData.append("vendorId", vendor.id)
      formData.append("stallFee", stallFee.toString())
      formData.append("waterFee", waterFee.toString())
      formData.append("electricFee", electricFee.toString())
      formData.append("garbageFee", garbageFee.toString())
      formData.append("paymentMethod", method)

      const res = await collectPayment(formData)
      if (res.success) {
        setPaymentStep("receipt")
      }
    })
  }

  const handleGenerateQR = () => {
    const payload = generatePayload("0899999999", { amount: totalAmount })
    setQrPayload(payload)
    setPaymentStep("qr")
  }
  
  const handleShareReceipt = async () => {
    const text = `Receipt for Stall ${stall.stallNumber}\nTotal: ฿${totalAmount.toFixed(2)}\nDate: ${new Date().toLocaleDateString()}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Receipt",
          text: text,
        })
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      alert("Sharing is not supported on this browser. Receipt copied to clipboard.")
      navigator.clipboard.writeText(text)
    }
  }

  // Handle dialog open state change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => {
        setPaymentStep("none")
        setWaterFee(0)
        setElectricFee(0)
        setGarbageFee(0)
      }, 200) // Reset form state when closing
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className={cn(
          "relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 shadow-sm transition-transform active:scale-95 duration-100",
          stallColor
        )}
      >
        <span className="font-bold text-xl">{stall.stallNumber}</span>
        <span className="text-xs font-medium mt-1">{statusText}</span>
        {isPresentToday && (
          <CheckCircle2 className="absolute -top-2 -right-2 w-6 h-6 text-emerald-500 bg-white rounded-full border-2 border-white shadow-sm" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[90%] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">แผง {stall.stallNumber}</DialogTitle>
        </DialogHeader>
        
        {paymentStep === "none" && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">สถานะ</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-3 h-3 rounded-full",
                  statusText === "Vacant" ? "bg-gray-400" : 
                  statusText === "Paid" ? "bg-emerald-500" : "bg-red-500"
                )} />
                <span className="font-medium text-lg">{statusText}</span>
              </div>
            </div>

            <AttendanceToggle stallId={stall.id} attendanceLogs={stall.attendanceLogs} />
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ค่าเช่า</span>
              <div className="flex justify-between bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg border dark:border-neutral-700">
                <div>
                  <div className="text-sm text-slate-500 dark:text-neutral-400">รายวัน</div>
                  <div className="font-medium">฿{stall.dailyRate.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-neutral-400">รายเดือน</div>
                  <div className="font-medium">฿{stall.monthlyRate.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {hasActiveContract && vendor && (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ผู้เช่าปัจจุบัน</span>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col gap-1">
                  <div className="font-bold text-blue-900 dark:text-blue-100 text-lg">{vendor.name}</div>
                  <div className="text-blue-800 dark:text-blue-300 text-sm">{vendor.vendorType === "FIXED" ? "รายเดือน" : "รายวัน"}</div>
                  {vendor.phone && (
                    <div className="text-blue-700 dark:text-blue-400 text-sm mt-1">{vendor.phone}</div>
                  )}
                </div>
              </div>
            )}

            {statusText === "ยังไม่จ่าย" && (
              <Button 
                onClick={() => setPaymentStep("form")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold h-12"
              >
                เก็บค่าเช่า
              </Button>
            )}
          </div>
        )}

        {paymentStep === "form" && (
          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 dark:bg-neutral-800 dark:border-neutral-700 p-4 rounded-lg border flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-neutral-400">ค่าเช่าแผง</span>
              <span className="font-bold text-lg">฿{stallFee.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="water">ค่าน้ำ (฿)</Label>
              <Input 
                id="water" 
                type="number" 
                min="0" 
                value={waterFee || ""}
                onChange={e => setWaterFee(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="electric">ค่าไฟ (฿)</Label>
              <Input 
                id="electric" 
                type="number" 
                min="0" 
                value={electricFee || ""}
                onChange={e => setElectricFee(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="garbage">ค่าขยะ (฿)</Label>
              <Input 
                id="garbage" 
                type="number" 
                min="0" 
                value={garbageFee || ""}
                onChange={e => setGarbageFee(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="mt-4 pt-4 border-t dark:border-neutral-700 flex justify-between items-center">
              <span className="font-bold text-lg">ยอดรวมทั้งหมด</span>
              <span className="font-bold text-2xl text-blue-700 dark:text-blue-400">฿{totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setPaymentStep("none")}
                className="flex-1 border-slate-300 dark:border-neutral-600"
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <div className="flex-[2] flex gap-2">
                <Button 
                  onClick={handleGenerateQR}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs px-2"
                  disabled={isPending}
                >
                  สแกนจ่าย QR
                </Button>
                <Button 
                  onClick={() => handleCollectPayment("CASH")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white text-xs px-2"
                  disabled={isPending}
                >
                  {isPending ? "..." : "ยืนยันเงินสด"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {paymentStep === "qr" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="bg-slate-50 dark:bg-neutral-800 dark:border-neutral-700 p-4 rounded-lg border w-full flex justify-between items-center mb-2">
              <span className="font-medium text-slate-600 dark:text-neutral-400">ยอดรวมทั้งหมด</span>
              <span className="font-bold text-xl text-blue-700 dark:text-blue-400">฿{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="p-4 bg-white rounded-xl shadow-sm border flex flex-col items-center">
              <QRCodeSVG value={qrPayload} size={200} />
              <div className="mt-4 text-center">
                <p className="font-bold text-lg text-slate-800">089-999-9999</p>
                <p className="text-sm font-medium text-slate-500">Market Admin Co., Ltd.</p>
              </div>
            </div>
            
            <div className="text-center text-sm text-slate-500 dark:text-neutral-400">
              กรุณาให้ผู้เช่าสแกน QR Code เพื่อชำระเงินผ่าน PromptPay
            </div>

            <div className="flex w-full gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={() => setPaymentStep("form")}
                className="flex-1"
                disabled={isPending}
              >
                ย้อนกลับ
              </Button>
              <Button 
                onClick={() => handleCollectPayment("QR")}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                disabled={isPending}
              >
                {isPending ? "กำลังประมวลผล..." : "ยืนยันการสแกนจ่าย"}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === "receipt" && (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">ชำระเงินสำเร็จ</h3>
              <p className="text-slate-500 dark:text-neutral-400 mt-1">แผง {stall.stallNumber}</p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-neutral-800 dark:border-neutral-700 rounded-lg border p-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-neutral-400">วันที่</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-neutral-400">ผู้เช่า</span>
                <span className="font-medium">{vendor?.name || "-"}</span>
              </div>
              <div className="border-t dark:border-neutral-700 my-1"></div>
              <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-white">
                <span>ยอดชำระรวม</span>
                <span>฿{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={handleShareReceipt}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white h-12 text-lg"
            >
              แชร์สลิป
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="w-full text-slate-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ปิดหน้าต่าง
            </Button>
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
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-50 dark:bg-neutral-950 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-bold">แผนผังตลาด</h1>
        <ThemeToggle />
      </header>

      {/* Zone Selector */}
      <div className="flex overflow-x-auto p-4 gap-2 border-b dark:border-neutral-800 bg-white dark:bg-neutral-900 scrollbar-hide">
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
            let stallColor = "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:border-neutral-600 dark:hover:bg-neutral-700" // Vacant
            let statusText = "ว่าง"

            if (hasActiveContract) {
              if (todayPayment?.status === "PAID") {
                stallColor = "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-[inset_0_0_0_2px_rgba(16,185,129,0.2)] hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900"
                statusText = "จ่ายแล้ว"
              } else {
                stallColor = "bg-red-100 border-red-400 text-red-800 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.2)] hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
                statusText = "ยังไม่จ่าย"
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
