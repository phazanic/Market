import { getStalls, getZones, createStall } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default async function StallsPage() {
  const [stalls, zones] = await Promise.all([getStalls(), getZones()]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Stalls</h1>
        <Dialog>
          <DialogTrigger render={<Button>Add Stall</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Stall</DialogTitle>
            </DialogHeader>
            <form action={createStall} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="stallNumber">Stall Number</Label>
                <Input id="stallNumber" name="stallNumber" required placeholder="e.g. A01" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneId">Zone</Label>
                <Select name="zoneId" required>
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
                  <Input id="dailyRate" name="dailyRate" type="number" required placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRate">Monthly Rate (THB)</Label>
                  <Input id="monthlyRate" name="monthlyRate" type="number" required placeholder="3000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="AVAILABLE">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Save Stall
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stalls</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stall Number</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Status</TableHead>
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
                      stall.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      stall.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {stall.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {stalls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No stalls found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
