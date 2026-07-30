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
            <TableHead>รหัสแผง</TableHead>
            <TableHead>โซน</TableHead>
            <TableHead>ค่าเช่ารายวัน</TableHead>
            <TableHead>ค่าเช่ารายเดือน</TableHead>
            <TableHead>สถานะ</TableHead>
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
                  {stall.status === 'AVAILABLE' ? 'ว่าง' : 
                   stall.status === 'OCCUPIED' ? 'มีผู้เช่า' : 
                   stall.status === 'MAINTENANCE' ? 'ซ่อมบำรุง' : stall.status}
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => setSelectedStall(stall)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">แก้ไข</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {stalls.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                ไม่พบข้อมูลแผงร้านค้า กรุณาเพิ่มข้อมูลใหม่
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
