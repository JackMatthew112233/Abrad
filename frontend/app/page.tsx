"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  Sparkles,
  Moon,
  Check,
  LayoutDashboard,
  Wallet,
  Landmark,
  ClipboardCheck,
  AlertTriangle,
  Heart,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Check user status and redirect accordingly
        if (data.user.role === "Admin") {
          toast.success("Login berhasil!");
          router.push("/pendaftaran");
        } else if (data.user.status === "DITERIMA") {
          toast.success("Login berhasil!");
          router.push("/dashboard");
        } else {
          // MENUNGGU or DITOLAK - redirect to status page
          router.push("/status");
        }
      } else {
        toast.error(data.message || "Login gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(registerData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Auto login after register then redirect to status page
        const loginRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: registerData.email,
              password: registerData.password,
            }),
          }
        );
        
        if (loginRes.ok) {
          router.push("/status");
        } else {
          toast.success("Registrasi berhasil! Silakan login untuk cek status.");
          setActiveTab("login");
          setRegisterData({ name: "", email: "", password: "" });
        }
      } else {
        toast.error(data.message || "Registrasi gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Manajemen Santri",
      desc: "Kelola data santri dengan mudah dan terstruktur",
    },
    {
      icon: BookOpen,
      title: "Akademik & Tahfidz",
      desc: "Pantau nilai dan progress hafalan Al-Quran",
    },
    {
      icon: Shield,
      title: "Keuangan Terintegrasi",
      desc: "Kelola pembayaran SPP, infaq, dan koperasi",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Hero */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20">
          {/* Logo & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200">
                <Moon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">
                  Abrad School
                </h1>
                <p className="text-sm text-emerald-600">
                  Sistem Informasi Manajemen
                </p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-zinc-800 leading-tight mb-4">
              Kelola Pesantren
              <span className="block text-emerald-600">Lebih Modern & Efisien</span>
            </h2>

            <p className="text-lg text-zinc-600 max-w-lg">
              Platform digital terintegrasi untuk manajemen pesantren modern.
              Dari data santri hingga keuangan, semua dalam satu sistem.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <feature.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800">{feature.title}</h3>
                  <p className="text-sm text-zinc-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-emerald-600">500+</p>
              <p className="text-sm text-zinc-500">Santri Aktif</p>
            </div>
            <div className="w-px h-12 bg-emerald-200" />
            <div>
              <p className="text-3xl font-bold text-emerald-600">50+</p>
              <p className="text-sm text-zinc-500">Tenaga Pengajar</p>
            </div>
            <div className="w-px h-12 bg-emerald-200" />
            <div>
              <p className="text-3xl font-bold text-emerald-600">30</p>
              <p className="text-sm text-zinc-500">Juz Al-Quran</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
                  <Moon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-emerald-800">
                  Abrad School
                </h1>
              </div>
              <p className="text-sm text-zinc-500">
                Sistem Informasi Manajemen Pesantren
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-emerald-100">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                    activeTab === "login"
                      ? "text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600"
                      : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                    activeTab === "register"
                      ? "text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600"
                      : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Daftar
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 lg:p-8">
                {activeTab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-zinc-800">
                        Selamat Datang Kembali
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Masuk ke akun Anda untuk melanjutkan
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-zinc-700">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        placeholder="Masukkan email"
                        className="h-11 text-sm placeholder:text-sm border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-zinc-700">
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        placeholder="Masukkan password"
                        className="h-11 text-sm placeholder:text-sm border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-zinc-800">
                        Buat Akun Baru
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Daftar untuk mengakses sistem
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-zinc-700">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, name: e.target.value })
                        }
                        placeholder="Masukkan nama lengkap"
                        className="h-11 text-sm placeholder:text-sm border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-zinc-700">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        placeholder="Masukkan email"
                        className="h-11 text-sm placeholder:text-sm border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-zinc-700">
                        Password
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        required
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Masukkan password"
                        className="h-11 text-sm placeholder:text-sm border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-zinc-400">
                      Fitur Sistem
                    </span>
                  </div>
                </div>

                {/* Quick Features - All Sidebar Menus */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Dashboard</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <Users className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Santri</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <Wallet className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Keuangan</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <Landmark className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Koperasi</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Absensi</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Pelanggaran</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <Heart className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Kesehatan</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <BookOpen className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-zinc-600">Nilai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-zinc-400 mt-6">
              &copy; {new Date().getFullYear()} Abrad School. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
