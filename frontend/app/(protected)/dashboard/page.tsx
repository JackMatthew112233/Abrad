"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wallet,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sppData = [
  { bulan: "Jul", lunas: 145, belum: 23 },
  { bulan: "Agu", lunas: 152, belum: 16 },
  { bulan: "Sep", lunas: 158, belum: 10 },
  { bulan: "Okt", lunas: 162, belum: 6 },
  { bulan: "Nov", lunas: 165, belum: 3 },
  { bulan: "Des", lunas: 168, belum: 0 },
];

const absensiData = [
  { hari: "Sen", hadir: 165, izin: 2, sakit: 1, alpha: 0 },
  { hari: "Sel", hadir: 167, izin: 1, sakit: 0, alpha: 0 },
  { hari: "Rab", hadir: 164, izin: 2, sakit: 2, alpha: 0 },
  { hari: "Kam", hadir: 166, izin: 1, sakit: 1, alpha: 0 },
  { hari: "Jum", hadir: 168, izin: 0, sakit: 0, alpha: 0 },
];

const keuanganPieData = [
  { name: "SPP", value: 45000000, color: "#10b981" },
  { name: "Laundry", value: 8500000, color: "#22c55e" },
  { name: "Lainnya", value: 3500000, color: "#86efac" },
];

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <BookOpen className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Sparkles className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            {currentDate}
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Selamat Datang Kembali! 👋
          </h1>
          <p className="max-w-2xl text-lg text-emerald-50">
            Pantau aktivitas pesantren secara real-time dan kelola sistem dengan mudah dari dashboard ini
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Santri
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">168</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="font-semibold">+12%</span>
                <span className="ml-1 text-zinc-500">(+18 santri)</span>
              </div>
              <p className="text-xs text-zinc-500">
                86 Putra • 82 Putri
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Pembayaran SPP
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              Rp 45.2jt
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="font-semibold">+8.3%</span>
                <span className="ml-1 text-zinc-500">(Rp 3.5jt)</span>
              </div>
              <p className="text-xs text-zinc-500">
                165/168 lunas • 3 pending
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Biaya Laundry
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              Rp 8.7jt
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                <span className="font-semibold">-3.2%</span>
                <span className="ml-1 text-zinc-500">(Rp 280rb)</span>
              </div>
              <p className="text-xs text-zinc-500">
                142 transaksi bulan ini
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Kehadiran Hari Ini
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">98.8%</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="font-semibold">+1.2%</span>
                <span className="ml-1 text-zinc-500">(lebih baik)</span>
              </div>
              <p className="text-xs text-zinc-500">
                166 hadir • 1 izin • 1 sakit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* SPP Payment Chart */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Pembayaran SPP (6 Bulan Terakhir)
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Tracking pembayaran SPP santri
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sppData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 12 }}
                  stroke="#71717a"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="lunas" fill="#10b981" name="Lunas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="belum" fill="#ef4444" name="Belum Bayar" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Keuangan Pie Chart */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Distribusi Keuangan
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Total pemasukan bulan ini: Rp 57jt
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={keuanganPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {keuanganPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `Rp ${(value / 1000000).toFixed(1)}jt`
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Absensi Chart */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Absensi Mingguan
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Tracking kehadiran santri minggu ini
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={absensiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hari" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="hadir"
                stroke="#10b981"
                strokeWidth={2}
                name="Hadir"
                dot={{ fill: "#10b981", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="izin"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Izin"
                dot={{ fill: "#f59e0b", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sakit"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Sakit"
                dot={{ fill: "#3b82f6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="alpha"
                stroke="#ef4444"
                strokeWidth={2}
                name="Alpha"
                dot={{ fill: "#ef4444", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 border-b border-zinc-100 pb-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  5 Santri baru terdaftar
                </p>
                <p className="text-xs text-zinc-500">2 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-zinc-100 pb-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  12 Pembayaran SPP diterima
                </p>
                <p className="text-xs text-zinc-500">5 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  Absensi hari ini telah direkap
                </p>
                <p className="text-xs text-zinc-500">1 hari yang lalu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Pengumuman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-900">
                Pembayaran SPP Bulan Januari
              </p>
              <p className="text-xs text-emerald-700">
                Batas pembayaran: 10 Januari 2026
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">
                Libur Semester Genap
              </p>
              <p className="text-xs text-blue-700">
                Tanggal 20 Desember - 5 Januari 2026
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-900">
                Cek Kesehatan Santri
              </p>
              <p className="text-xs text-amber-700">
                Jadwal: 15 Desember 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
