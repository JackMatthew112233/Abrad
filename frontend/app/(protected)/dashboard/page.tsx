"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wallet,
  ClipboardCheck,
  BookOpen,
  Heart,
  AlertTriangle,
  Store,
  HandHeart,
  TrendingDown,
  TrendingUp,
  Calendar,
  GraduationCap,
  Sparkles,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardData {
  period: { year: number; month: number };
  siswa: { total: number; putra: number; putri: number };
  pembayaran: {
    totalNominal: number;
    totalTransaksi: number;
    byJenis: { infaq: number; laundry: number };
  };
  absensi: {
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    persentaseHadir: number;
  };
  kesehatan: { totalCatatan: number; siswaWithAsuransi: number };
  pelanggaran: { total: number; ringan: number; sedang: number; berat: number };
  nilai: { totalNilai: number; rataRata: number };
  tahfidz: { modusJuz: number | null; modusCount: number };
  koperasi: {
    totalAnggota: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
  donasi: { totalNominal: number; totalDonatur: number };
  pengeluaran: { totalNominal: number; totalTransaksi: number };
  charts: {
    pembayaranTrend: { bulan: number; nominal: number; transaksi: number }[];
    absensiTrend: {
      tanggal: number;
      hadir: number;
      izin: number;
      sakit: number;
      alpha: number;
    }[];
  };
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export default function DashboardPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard?year=${selectedYear}&month=${selectedMonth}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)}M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const formatRupiahFull = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

  // Chart data transformations
  const pembayaranChartData = data?.charts.pembayaranTrend.map((d) => ({
    bulan: MONTH_SHORT[d.bulan - 1],
    nominal: d.nominal / 1000000,
    transaksi: d.transaksi,
  })) || [];

  const absensiChartData = data?.charts.absensiTrend.slice(-14).map((d) => ({
    tgl: d.tanggal,
    hadir: d.hadir,
    tidakHadir: d.izin + d.sakit + d.alpha,
  })) || [];

  const siswaGenderData = data ? [
    { name: "Putra", value: data.siswa.putra },
    { name: "Putri", value: data.siswa.putri },
  ] : [];

  const pembayaranJenisData = data ? [
    { name: "Infaq", value: data.pembayaran.byJenis.infaq },
    { name: "Laundry", value: data.pembayaran.byJenis.laundry },
  ] : [];

  const absensiPieData = data ? [
    { name: "Hadir", value: data.absensi.hadir, color: "#10b981" },
    { name: "Izin", value: data.absensi.izin, color: "#f59e0b" },
    { name: "Sakit", value: data.absensi.sakit, color: "#3b82f6" },
    { name: "Alpha", value: data.absensi.alpha, color: "#ef4444" },
  ] : [];

  const pelanggaranData = data ? [
    { name: "Ringan", value: data.pelanggaran.ringan, color: "#fbbf24" },
    { name: "Sedang", value: data.pelanggaran.sedang, color: "#f97316" },
    { name: "Berat", value: data.pelanggaran.berat, color: "#ef4444" },
  ] : [];

  const keuanganSummary = data ? {
    pemasukan: data.pembayaran.totalNominal + data.donasi.totalNominal,
    pengeluaran: data.pengeluaran.totalNominal,
    saldo: (data.pembayaran.totalNominal + data.donasi.totalNominal) - data.pengeluaran.totalNominal,
  } : { pemasukan: 0, pengeluaran: 0, saldo: 0 };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Sparkles className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            {currentDate}
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Dashboard Pesantren
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Pantau aktivitas dan statistik pesantren secara real-time
          </p>
          
          {/* Filter in header */}
          <div className="flex items-center gap-2 mt-4">
            <Calendar className="h-4 w-4 text-white/70" />
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-24 h-8 text-xs bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-32 h-8 text-xs bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">
          Memuat data dashboard...
        </div>
      ) : !data ? (
        <div className="py-20 text-center text-zinc-500 text-sm">
          Gagal memuat data
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Total Santri Aktif
                </CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-3xl font-bold text-emerald-700">{data.siswa.total}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {data.siswa.putra} putra • {data.siswa.putri} putri
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Total Pemasukan
                </CardTitle>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-3xl font-bold text-emerald-700">
                  {formatRupiah(keuanganSummary.pemasukan)}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {data.pembayaran.totalTransaksi + data.donasi.totalDonatur} transaksi
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Total Pengeluaran
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-3xl font-bold text-emerald-700">
                  {formatRupiah(data.pengeluaran.totalNominal)}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {data.pengeluaran.totalTransaksi} transaksi
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Kehadiran Bulan Ini
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-3xl font-bold text-emerald-700">
                  {data.absensi.persentaseHadir}%
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {data.absensi.hadir} dari {data.absensi.total} kehadiran
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Trend Pemasukan */}
            <Card className="border-zinc-200 bg-white lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                  Trend Pemasukan Tahun {selectedYear}
                </CardTitle>
                <p className="text-xs text-zinc-500">Total pemasukan per bulan (dalam juta)</p>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pembayaranChartData}>
                      <defs>
                        <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [`Rp ${value.toFixed(1)}jt`, "Nominal"]}
                      />
                      <Area type="monotone" dataKey="nominal" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNominal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribusi Pembayaran */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                  Distribusi Pembayaran
                </CardTitle>
                <p className="text-xs text-zinc-500">Infaq vs Laundry</p>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pembayaranJenisData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pembayaranJenisData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatRupiahFull(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-xs text-zinc-500">Infaq</p>
                    <p className="text-sm font-bold text-emerald-700">{formatRupiah(data.pembayaran.byJenis.infaq)}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-xs text-zinc-500">Laundry</p>
                    <p className="text-sm font-bold text-emerald-700">{formatRupiah(data.pembayaran.byJenis.laundry)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Kehadiran Harian */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                  Kehadiran 14 Hari Terakhir
                </CardTitle>
                <p className="text-xs text-zinc-500">Perbandingan hadir vs tidak hadir</p>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={absensiChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="tgl" tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
                      <Legend />
                      <Bar dataKey="hadir" fill="#10b981" name="Hadir" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="tidakHadir" fill="#f87171" name="Tidak Hadir" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribusi Absensi */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                  Distribusi Status Absensi
                </CardTitle>
                <p className="text-xs text-zinc-500">Bulan {MONTHS[selectedMonth - 1]} {selectedYear}</p>
              </CardHeader>
              <CardContent>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={absensiPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {absensiPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <p className="text-lg font-bold text-emerald-600">{data.absensi.hadir}</p>
                    <p className="text-xs text-zinc-500">Hadir</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <p className="text-lg font-bold text-amber-600">{data.absensi.izin}</p>
                    <p className="text-xs text-zinc-500">Izin</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{data.absensi.sakit}</p>
                    <p className="text-xs text-zinc-500">Sakit</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">{data.absensi.alpha}</p>
                    <p className="text-xs text-zinc-500">Alpha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Nilai */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Rata-rata Nilai
                </CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-emerald-700">{data.nilai.rataRata}</div>
                <p className="text-xs text-zinc-500 mt-1">{data.nilai.totalNilai} catatan nilai</p>
              </CardContent>
            </Card>

            {/* Tahfidz */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Modus Juz Tahfidz
                </CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-emerald-700">
                  {data.tahfidz.modusJuz ? `Juz ${data.tahfidz.modusJuz}` : "-"}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{data.tahfidz.modusCount} santri</p>
              </CardContent>
            </Card>

            {/* Kesehatan */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Catatan Kesehatan
                </CardTitle>
                <Heart className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-emerald-700">{data.kesehatan.totalCatatan}</div>
                <p className="text-xs text-zinc-500 mt-1">{data.kesehatan.siswaWithAsuransi} memiliki asuransi</p>
              </CardContent>
            </Card>

            {/* Donasi */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
                  Total Donasi
                </CardTitle>
                <HandHeart className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-emerald-700">{formatRupiah(data.donasi.totalNominal)}</div>
                <p className="text-xs text-zinc-500 mt-1">{data.donasi.totalDonatur} donatur</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Pelanggaran */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                    Pelanggaran
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-zinc-500">Total {data.pelanggaran.total} kasus</p>
              </CardHeader>
              <CardContent>
                {data.pelanggaran.total === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-sm">
                    Tidak ada pelanggaran
                  </div>
                ) : (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pelanggaranData}
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            dataKey="value"
                          >
                            {pelanggaranData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center p-2 bg-amber-50 rounded-lg">
                        <p className="text-lg font-bold text-amber-600">{data.pelanggaran.ringan}</p>
                        <p className="text-xs text-zinc-500">Ringan</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <p className="text-lg font-bold text-orange-600">{data.pelanggaran.sedang}</p>
                        <p className="text-xs text-zinc-500">Sedang</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-600">{data.pelanggaran.berat}</p>
                        <p className="text-xs text-zinc-500">Berat</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Koperasi */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                    Koperasi Pesantren
                  </CardTitle>
                  <Store className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-zinc-500">{data.koperasi.totalAnggota} anggota aktif</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-zinc-600">Pemasukan</span>
                  </div>
                  <span className="font-semibold text-emerald-700">{formatRupiah(data.koperasi.totalPemasukan)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-zinc-600">Pengeluaran</span>
                  </div>
                  <span className="font-semibold text-red-700">{formatRupiah(data.koperasi.totalPengeluaran)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-zinc-600" />
                    <span className="text-sm text-zinc-600">Saldo</span>
                  </div>
                  <span className="font-bold text-zinc-800">{formatRupiah(data.koperasi.saldo)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Ringkasan Keuangan */}
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                    Ringkasan Keuangan
                  </CardTitle>
                  <PieChartIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-zinc-500">Bulan {MONTHS[selectedMonth - 1]}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-zinc-600">Total Pemasukan</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(keuanganSummary.pemasukan)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-zinc-600">Total Pengeluaran</span>
                  <span className="font-semibold text-red-700">{formatRupiah(keuanganSummary.pengeluaran)}</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${keuanganSummary.saldo >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <span className="text-sm font-medium text-zinc-700">Saldo Bersih</span>
                  <span className={`font-bold ${keuanganSummary.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatRupiah(keuanganSummary.saldo)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gender Distribution */}
          <Card className="border-zinc-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                Distribusi Santri
              </CardTitle>
              <p className="text-xs text-zinc-500">Berdasarkan jenis kelamin</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-28 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={siswaGenderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {siswaGenderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-zinc-600">Santri Putra</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{data.siswa.putra}</p>
                    <p className="text-xs text-zinc-500">{((data.siswa.putra / data.siswa.total) * 100).toFixed(1)}% dari total</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
                      <span className="text-sm text-zinc-600">Santriwati</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{data.siswa.putri}</p>
                    <p className="text-xs text-zinc-500">{((data.siswa.putri / data.siswa.total) * 100).toFixed(1)}% dari total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
