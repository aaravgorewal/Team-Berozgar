"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ArrowRightLeft, 
  CalendarDays, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Bell 
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Organization setup", href: "/dashboard/organization", icon: Building2 },
  { name: "Assets", href: "/dashboard/assets", icon: Package },
  { name: "Allocation & Transfer", href: "/dashboard/allocations", icon: ArrowRightLeft },
  { name: "Resource Booking", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Audit", href: "/dashboard/audit", icon: ClipboardCheck },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-950 text-zinc-50">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">AssetFlow</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-zinc-800 hover:text-white",
                isActive ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400">
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-white">User Name</span>
            <span className="text-xs text-zinc-500">Role</span>
          </div>
        </div>
      </div>
    </div>
  );
}
