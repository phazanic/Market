import { getDashboardStats } from "./actions";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const initialData = await getDashboardStats();

  return <DashboardClient initialData={initialData} />;
}
