"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, ClipboardCheck, School, AlertTriangle, Heart, BookOpen, X, Landmark } from "lucide-react";
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
    title: "Kelola Koperasi",
    href: "/koperasi",
    icon: Landmark,
  },
  {
    title: "Kelola Absensi",
    href: "/absensi",
    icon: ClipboardCheck,
  },
  {
    title: "Kelola Pelanggaran",
    href: "/pelanggaran",
    icon: AlertTriangle,
  },
  {
    title: "Kelola Kesehatan",
    href: "/kesehatan",
    icon: Heart,
  },
  {
    title: "Kelola Nilai",
    href: "/nilai",
    icon: BookOpen,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <div className="flex items-center gap-3">
            <School className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-emerald-700">ABRAD SCHOOL</h1>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose?.();
                  }
                }}
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
    </>
  );
}
