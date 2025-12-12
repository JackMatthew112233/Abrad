"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, ClipboardCheck, School } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Kelola Santri / Santriwati",
    href: "/siswa",
    icon: Users,
  },
  {
    title: "Kelola Keuangan",
    href: "/keuangan",
    icon: Wallet,
  },
  {
    title: "Kelola Absensi",
    href: "/absensi",
    icon: ClipboardCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6">
        <School className="h-6 w-6 text-emerald-600" />
        <h1 className="text-xl font-bold text-emerald-700">ABRAD SCHOOL</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-700 hover:bg-zinc-50 hover:text-emerald-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
