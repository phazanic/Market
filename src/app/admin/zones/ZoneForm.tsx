"use client"

import { useActionState, useEffect, useState } from "react"
import { createZone } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ZoneForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createZone, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>เพิ่มโซน</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มโซนใหม่</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อโซน</Label>
            <Input id="name" name="name" required placeholder="เช่น โซนอาหาร" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Input id="description" name="description" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" />
          </div>
          
          {state?.error && (
            <p className="text-sm font-medium text-destructive text-red-500">{state.error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
