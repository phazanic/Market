"use client"

import { useActionState, useEffect, useState, ReactElement } from "react"
import { createStall, updateStall } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STALL_STATUS } from "@/lib/constants"

type Zone = { id: string; name: string }

type Stall = {
  id: string
  stallNumber: string
  zoneId: string
  dailyRate: number
  monthlyRate: number
  status: string
}

interface StallFormProps {
  zones: Zone[]
  stall?: Stall | null
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function StallForm({ zones, stall, trigger, open, onOpenChange }: StallFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const isEditing = !!stall
  const action = isEditing ? updateStall : createStall
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      handleOpenChange(false)
    }
  }, [state])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "แก้ไขแผงร้านค้า" : "เพิ่มแผงร้านค้าใหม่"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-4">
          {isEditing && <input type="hidden" name="id" value={stall.id} />}
          
          <div className="space-y-2">
            <Label htmlFor="stallNumber">รหัสแผง</Label>
            <Input 
              id="stallNumber" 
              name="stallNumber" 
              defaultValue={stall?.stallNumber} 
              required 
              placeholder="เช่น A01" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zoneId">โซน</Label>
            <Select name="zoneId" defaultValue={stall?.zoneId} required>
              <SelectTrigger>
                <SelectValue placeholder="เลือกโซน" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">ค่าเช่ารายวัน (บาท)</Label>
              <Input 
                id="dailyRate" 
                name="dailyRate" 
                type="number" 
                defaultValue={stall?.dailyRate} 
                required 
                placeholder="100" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRate">ค่าเช่ารายเดือน (บาท)</Label>
              <Input 
                id="monthlyRate" 
                name="monthlyRate" 
                type="number" 
                defaultValue={stall?.monthlyRate} 
                required 
                placeholder="3000" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">สถานะ</Label>
            <Select name="status" defaultValue={stall?.status || STALL_STATUS.AVAILABLE}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STALL_STATUS.AVAILABLE}>ว่าง</SelectItem>
                <SelectItem value={STALL_STATUS.OCCUPIED}>มีผู้เช่า</SelectItem>
                <SelectItem value={STALL_STATUS.MAINTENANCE}>ซ่อมบำรุง</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {state?.error && (
            <p className="text-sm font-medium text-destructive text-red-500">{state.error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
