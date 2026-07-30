"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { STALL_STATUS_COLORS, StallStatus } from "@/lib/constants"
import { PencilIcon } from "lucide-react"
import { StallForm } from "./StallForm"

type Zone = { id: string; name: string }

type Stall = {
  id: string
  stallNumber: string
  zoneId: string
  dailyRate: number
  monthlyRate: number
  status: string
  zone: Zone
}

interface StallTableClientProps {
  stalls: Stall[]
  zones: Zone[]
}

export function StallTableClient({ stalls, zones }: StallTableClientProps) {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stall Number</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stalls.map((stall) => (
            <TableRow key={stall.id}>
              <TableCell className="font-bold">{stall.stallNumber}</TableCell>
              <TableCell>{stall.zone.name}</TableCell>
              <TableCell>฿{stall.dailyRate}</TableCell>
              <TableCell>฿{stall.monthlyRate}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  STALL_STATUS_COLORS[stall.status as StallStatus] || 'bg-gray-100 text-gray-700'
                }`}>
                  {stall.status}
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => setSelectedStall(stall)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {stalls.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No stalls found. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Shared form for editing */}
      <StallForm 
        zones={zones} 
        stall={selectedStall} 
        open={!!selectedStall} 
        onOpenChange={(open) => !open && setSelectedStall(null)} 
      />
    </>
  )
}
