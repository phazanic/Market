import { getZones, createZone } from "../actions";
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
import { Button } from "@/components/ui/button";

export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Zones</h1>
        <Dialog>
          <DialogTrigger render={<Button>Add Zone</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
            </DialogHeader>
            <form action={createZone} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Fresh Food" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="Short description..." />
              </div>
              <Button type="submit" className="w-full">
                Save Zone
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Market Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-mono text-xs">{zone.id}</TableCell>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{zone.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    {new Date(zone.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {zones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No zones found. Add one to get started.
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
