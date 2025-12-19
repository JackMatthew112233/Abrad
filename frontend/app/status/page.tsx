"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, Moon } from "lucide-react";

interface UserStatus {
  id: string;
  email: string;
  name: string;
  status: "MENUNGGU" | "DITERIMA" | "DITOLAK";
}

export default function StatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);

          // If user is approved, redirect to dashboard
          if (data.status === "DITERIMA") {
            router.push("/dashboard");
            return;
          }
        } else {
          // Not logged in, redirect to home
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore errors
    }
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="text-zinc-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
                <Moon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-emerald-800">
              Abrad School
            </h1>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-100 overflow-hidden">
            {user?.status === "MENUNGGU" && (
              <div className="p-8 text-center">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-amber-100 mb-6">
                  <Clock className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-800 mb-2">
                  Menunggu Persetujuan
                </h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Pendaftaran Anda sedang dalam proses verifikasi oleh
                  administrator. Mohon tunggu hingga akun Anda disetujui.
                </p>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Kembali ke Halaman Utama
                </Button>
              </div>
            )}

            {user?.status === "DITOLAK" && (
              <div className="p-8 text-center">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-red-100 mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-800 mb-2">
                  Pendaftaran Ditolak
                </h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Maaf, pendaftaran Anda tidak disetujui oleh administrator.
                  Silakan hubungi pihak pesantren untuk informasi lebih lanjut.
                </p>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Kembali ke Halaman Utama
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400 mt-6">
            &copy; {new Date().getFullYear()} Pesantren Digital. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
