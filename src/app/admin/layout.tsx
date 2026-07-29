import Link from "next/link";
import { Store, LayoutDashboard, Map, Users } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900">
      {/* Sidebar Navigation */}
      <aside className="hidden md:block w-full md:w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-white">
            <Store className="h-6 w-6 text-primary" />
            Market Admin
          </Link>
        </div>
        <nav className="px-4 py-2 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/zones"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors"
          >
            <Map className="h-5 w-5" />
            Zones
          </Link>
          <Link
            href="/admin/stalls"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors"
          >
            <Store className="h-5 w-5" />
            Stalls
          </Link>
          <Link
            href="/admin/vendors"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors"
          >
            <Users className="h-5 w-5" />
            Vendors
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
