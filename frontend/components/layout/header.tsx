"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      toast.success("Berhasil keluar");
      router.push("/");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/50 bg-white/80 px-4 backdrop-blur-md lg:justify-end lg:px-6">
        <button className="rounded-lg p-2 hover:bg-zinc-100 lg:hidden">
          <Menu className="h-5 w-5 text-zinc-400" />
        </button>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-200" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/50 bg-gradient-to-r from-white via-emerald-50/30 to-white px-4 backdrop-blur-md shadow-sm lg:justify-end lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-600 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm focus:outline-none">
          <Avatar className="h-9 w-9 ring-2 ring-emerald-100 ring-offset-2 transition-all duration-200 group-hover:ring-emerald-200">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-semibold text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
          <div className="ml-1 rounded-full bg-emerald-100 p-1 transition-colors group-hover:bg-emerald-200">
            <svg
              className="h-3 w-3 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl border-zinc-200 shadow-lg">
          <DropdownMenuLabel className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-base font-semibold text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/pengaturan")}
            className="cursor-pointer rounded-lg transition-colors hover:bg-emerald-50"
          >
            <Settings className="mr-3 h-4 w-4 text-emerald-600" />
            <span className="font-medium">Pengaturan Akun</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
