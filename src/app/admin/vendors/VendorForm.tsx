"use client"

import { useActionState, useEffect, useState, ReactElement } from "react"
import { createVendor } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VENDOR_TYPE } from "@/lib/constants"

interface VendorFormProps {
  trigger: ReactElement
}

export function VendorForm({ trigger }: VendorFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createVendor, null)

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
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name / Company</Label>
            <Input id="name" name="name" required placeholder="e.g. Somchai Vegetables" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" placeholder="e.g. 0812345678" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type</Label>
            <Select name="vendorType" defaultValue={VENDOR_TYPE.FIXED} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VENDOR_TYPE.FIXED}>Fixed</SelectItem>
                <SelectItem value={VENDOR_TYPE.CASUAL}>Casual</SelectItem>
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
