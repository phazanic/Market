"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map as MapIcon, LayoutDashboard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  href: string, 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean 
}) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-200",
        isActive ? "text-blue-600 scale-105" : "text-slate-500 hover:text-slate-900"
      )}
    >
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 max-w-md mx-auto">
        <NavItem 
          href="/" 
          icon={MapIcon} 
          label="Map" 
          isActive={pathname === "/"} 
        />
        <NavItem 
          href="/admin" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          isActive={pathname.startsWith("/admin")} 
        />
        <NavItem 
          href="/settings" 
          icon={Settings} 
          label="Settings" 
          isActive={pathname.startsWith("/settings")} 
        />
      </div>
    </nav>
  )
}
