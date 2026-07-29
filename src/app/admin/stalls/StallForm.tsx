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
  stall?: Stall
  trigger: ReactElement
}

export function StallForm({ zones, stall, trigger }: StallFormProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!stall
  const action = isEditing ? updateStall : createStall
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Stall" : "Add New Stall"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-4">
          {isEditing && <input type="hidden" name="id" value={stall.id} />}
          
          <div className="space-y-2">
            <Label htmlFor="stallNumber">Stall Number</Label>
            <Input 
              id="stallNumber" 
              name="stallNumber" 
              defaultValue={stall?.stallNumber} 
              required 
              placeholder="e.g. A01" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zoneId">Zone</Label>
            <Select name="zoneId" defaultValue={stall?.zoneId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a zone" />
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
              <Label htmlFor="dailyRate">Daily Rate (THB)</Label>
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
              <Label htmlFor="monthlyRate">Monthly Rate (THB)</Label>
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
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={stall?.status || STALL_STATUS.AVAILABLE}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STALL_STATUS.AVAILABLE}>Available</SelectItem>
                <SelectItem value={STALL_STATUS.OCCUPIED}>Occupied</SelectItem>
                <SelectItem value={STALL_STATUS.MAINTENANCE}>Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {state?.error && (
            <p className="text-sm font-medium text-destructive text-red-500">{state.error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
