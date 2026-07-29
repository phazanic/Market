import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Manage your market preferences and master data.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Master Data</CardTitle>
            <CardDescription>
              Configuration for stalls, zones, and tenants will be available here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Manage Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
