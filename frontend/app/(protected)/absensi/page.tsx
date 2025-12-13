"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardCheck, 
  UserCheck, 
  UserX, 
  Heart, 
  FileText,
  TrendingUp,
  Calendar,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";



interface AbsensiData {
  id: string;
  nama: string | null;
  kelas: string | null;
  tingkatan: string | null;
  hadir: number;
  tidakHadir: number;
  sakit: number;
  izin: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AbsensiPage() {
  const router = useRouter();
  const [jenisAbsensi, setJenisAbsensi] = useState<"KELAS" | "ASRAMA" | "PENGAJIAN" | null>(null);
  const [stats, setStats] = useState({
    HADIR: 0,
    TIDAK_HADIR: 0,
    SAKIT: 0,
    IZIN: 0,
  });
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [filterTingkatan, setFilterTingkatan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  
  // Dialog states
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  
  // Input Absensi form
  const [inputKelas, setInputKelas] = useState("");
  const [inputTingkatan, setInputTingkatan] = useState("");
  
  // Download form
  const [downloadBulan, setDownloadBulan] = useState("");
  const [downloadTahun, setDownloadTahun] = useState("");
  const [downloadKelas, setDownloadKelas] = useState("");
  const [downloadTingkatan, setDownloadTingkatan] = useState("");
  
  // Chart data
  const [trendKehadiranData, setTrendKehadiranData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    if (jenisAbsensi) {
      fetchStats();
      fetchAbsensiData();
      fetchChartData();
    }
  }, [jenisAbsensi]);

  const fetchStats = async () => {
    if (!jenisAbsensi) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/statistik?jenis=${jenisAbsensi}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAbsensiData = async (page: number = 1) => {
    if (!jenisAbsensi) return;
    try {
      setIsLoadingTable(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/statistik-per-siswa?jenis=${jenisAbsensi}&page=${page}&limit=20`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAbsensiData(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching absensi data:", error);
    } finally {
      setIsLoadingTable(false);
    }
  };

  const fetchChartData = async () => {
    if (!jenisAbsensi) return;
    try {
      const [trendResponse, radarResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/absensi/trend-bulanan?jenis=${jenisAbsensi}`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/absensi/distribusi-harian?jenis=${jenisAbsensi}`, {
          credentials: "include",
        }),
      ]);
      
      if (trendResponse.ok && radarResponse.ok) {
        const trendData = await trendResponse.json();
        const radarDataResult = await radarResponse.json();
        
        setTrendKehadiranData(trendData);
        setRadarData(radarDataResult);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchAbsensiData(newPage);
  };

  const totalKehadiran = stats.HADIR + stats.TIDAK_HADIR + stats.SAKIT + stats.IZIN;
  const persenKehadiran = totalKehadiran > 0 
    ? ((stats.HADIR / totalKehadiran) * 100).toFixed(1) 
    : "0";

  const filteredAbsensi = absensiData.filter((item) => {
    const matchesSearch = item.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTingkatan = !filterTingkatan || filterTingkatan === "all" || item.tingkatan === filterTingkatan;
    const matchesKelas = !filterKelas || filterKelas === "all" || item.kelas === filterKelas;
    return matchesSearch && matchesTingkatan && matchesKelas;
  });

  // If no jenis selected, show selection menu
  if (!jenisAbsensi) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
          <div className="absolute -right-8 -top-8 opacity-20">
            <ClipboardCheck className="h-64 w-64 text-white" strokeWidth={0.5} />
          </div>
          <div className="absolute bottom-4 right-24 opacity-15">
            <Calendar className="h-32 w-32 text-white" strokeWidth={0.5} />
          </div>
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <ClipboardCheck className="h-4 w-4" />
              Kelola Absensi
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              Pilih Jenis Absensi
            </h1>
            <p className="max-w-2xl text-lg text-emerald-50">
              Pilih jenis absensi yang ingin Anda kelola
            </p>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card 
            className="border-emerald-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setJenisAbsensi("KELAS")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <ClipboardCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-700">
                Absensi Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-zinc-600">
                Kelola kehadiran santri di kelas formal setiap hari
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-emerald-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setJenisAbsensi("ASRAMA")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-700">
                Absensi Asrama
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-zinc-600">
                Pantau kehadiran santri di asrama dan kamar
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-emerald-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setJenisAbsensi("PENGAJIAN")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-700">
                Absensi Pengajian
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-zinc-600">
                Catat kehadiran santri dalam kegiatan pengajian
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <ClipboardCheck className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Calendar className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <ClipboardCheck className="h-4 w-4" />
              Kelola Absensi - {jenisAbsensi === "KELAS" ? "Kelas" : jenisAbsensi === "ASRAMA" ? "Asrama" : "Pengajian"}
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              Absensi {jenisAbsensi === "KELAS" ? "Kelas" : jenisAbsensi === "ASRAMA" ? "Asrama" : "Pengajian"}
            </h1>
            <p className="max-w-2xl text-lg text-emerald-50">
              Kelola dan pantau kehadiran santri / santriwati setiap hari
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Hadir
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{stats.HADIR}</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="font-semibold">{persenKehadiran}%</span>
                <span className="ml-1 text-zinc-500">(tingkat kehadiran)</span>
              </div>
              <p className="text-xs text-zinc-500">
                Santri hadir hari ini
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Tidak Hadir
            </CardTitle>
            <UserX className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{stats.TIDAK_HADIR}</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <span className="font-semibold">
                  {totalKehadiran > 0 ? ((stats.TIDAK_HADIR / totalKehadiran) * 100).toFixed(1) : "0"}%
                </span>
                <span className="ml-1 text-zinc-500">(dari total)</span>
              </div>
              <p className="text-xs text-zinc-500">
                Tanpa keterangan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Sakit
            </CardTitle>
            <Heart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{stats.SAKIT}</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <span className="font-semibold">
                  {totalKehadiran > 0 ? ((stats.SAKIT / totalKehadiran) * 100).toFixed(1) : "0"}%
                </span>
                <span className="ml-1 text-zinc-500">(dari total)</span>
              </div>
              <p className="text-xs text-zinc-500">
                Dengan surat keterangan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Izin
            </CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{stats.IZIN}</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <span className="font-semibold">
                  {totalKehadiran > 0 ? ((stats.IZIN / totalKehadiran) * 100).toFixed(1) : "0"}%
                </span>
                <span className="ml-1 text-zinc-500">(dari total)</span>
              </div>
              <p className="text-xs text-zinc-500">
                Izin resmi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Statistik Absensi Per Santri */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Statistik Kehadiran Santri / Santriwati
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowInputDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Input Absensi
              </Button>
              <Button
                onClick={() => setShowDownloadDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Riwayat Absensi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Cari nama santri / santriwati..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTingkatan} onValueChange={setFilterTingkatan}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Tingkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkatan</SelectItem>
                <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                <SelectItem value="ULYA">ULYA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                <SelectItem value="VII_Putra">VII Putra</SelectItem>
                <SelectItem value="VII_Putri">VII Putri</SelectItem>
                <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                <SelectItem value="IX_Putra">IX Putra</SelectItem>
                <SelectItem value="IX_Putri">IX Putri</SelectItem>
                <SelectItem value="X_Putra">X Putra</SelectItem>
                <SelectItem value="X_Putri">X Putri</SelectItem>
                <SelectItem value="XI_Putra">XI Putra</SelectItem>
                <SelectItem value="XI_Putri">XI Putri</SelectItem>
                <SelectItem value="XII_Putra">XII Putra</SelectItem>
                <SelectItem value="XII_Putri">XII Putri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingTable ? (
            <div className="text-center py-8 text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-center">Hadir</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-center">Tidak Hadir</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-center">Izin</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-center">Sakit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbsensi.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-zinc-500">
                        {searchQuery ? "Tidak ada data yang sesuai pencarian" : "Belum ada data absensi"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAbsensi.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => router.push(`/absensi/detail/${item.id}`)}
                            className="text-emerald-600 hover:text-emerald-700 hover:underline text-left"
                          >
                            {item.nama || "-"}
                          </button>
                        </TableCell>
                        <TableCell>{item.kelas ? item.kelas.replace("_", " ") : "-"}</TableCell>
                        <TableCell>{item.tingkatan || "-"}</TableCell>
                        <TableCell className="text-center">{item.hadir}</TableCell>
                        <TableCell className="text-center">{item.tidakHadir}</TableCell>
                        <TableCell className="text-center">{item.izin}</TableCell>
                        <TableCell className="text-center">{item.sakit}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingTable && filteredAbsensi.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          pagination.page === pageNum
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Area Chart - Trend Kehadiran */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Trend Kehadiran (6 Bulan Terakhir)
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Perkembangan status kehadiran santri
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendKehadiranData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTidakHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSakit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIzin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#71717a" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="hadir" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorHadir)" 
                  name="Hadir"
                />
                <Area 
                  type="monotone" 
                  dataKey="sakit" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSakit)" 
                  name="Sakit"
                />
                <Area 
                  type="monotone" 
                  dataKey="izin" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#colorIzin)" 
                  name="Izin"
                />
                <Area 
                  type="monotone" 
                  dataKey="tidakHadir" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorTidakHadir)" 
                  name="Tidak Hadir"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart - Kehadiran Mingguan */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Kehadiran per Hari (Minggu Ini)
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Perbandingan kehadiran dengan target
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="kategori" 
                  tick={{ fontSize: 12, fill: "#71717a" }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 168]} 
                  tick={{ fontSize: 10, fill: "#71717a" }}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Hadir"
                  dataKey="hadir"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Input Absensi */}
      <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Absensi</DialogTitle>
            <DialogDescription>
              Pilih kelas dan tingkatan untuk input absensi hari ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tingkatan">Tingkatan</Label>
              <Select value={inputTingkatan} onValueChange={setInputTingkatan}>
                <SelectTrigger id="tingkatan">
                  <SelectValue placeholder="Pilih Tingkatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                  <SelectItem value="ULYA">ULYA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={inputKelas} onValueChange={setInputKelas}>
                <SelectTrigger id="kelas">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VII_PUTRA">VII Putra</SelectItem>
                  <SelectItem value="VII_PUTRI">VII Putri</SelectItem>
                  <SelectItem value="VIII_PUTRA">VIII Putra</SelectItem>
                  <SelectItem value="VIII_PUTRI">VIII Putri</SelectItem>
                  <SelectItem value="IX_PUTRA">IX Putra</SelectItem>
                  <SelectItem value="IX_PUTRI">IX Putri</SelectItem>
                  <SelectItem value="X_PUTRA">X Putra</SelectItem>
                  <SelectItem value="X_PUTRI">X Putri</SelectItem>
                  <SelectItem value="XI_PUTRA">XI Putra</SelectItem>
                  <SelectItem value="XI_PUTRI">XI Putri</SelectItem>
                  <SelectItem value="XII_PUTRA">XII Putra</SelectItem>
                  <SelectItem value="XII_PUTRI">XII Putri</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInputDialog(false);
                setInputKelas("");
                setInputTingkatan("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                if (inputKelas && inputTingkatan && jenisAbsensi) {
                  router.push(`/absensi/input?jenis=${jenisAbsensi}&kelas=${inputKelas}&tingkatan=${inputTingkatan}`);
                }
              }}
              disabled={!inputKelas || !inputTingkatan}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Unduh Riwayat */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unduh Riwayat Absensi</DialogTitle>
            <DialogDescription>
              Pilih filter data absensi yang akan diunduh
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="download-tingkatan">Tingkatan</Label>
              <Select value={downloadTingkatan} onValueChange={setDownloadTingkatan}>
                <SelectTrigger id="download-tingkatan">
                  <SelectValue placeholder="Pilih Tingkatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                  <SelectItem value="ULYA">ULYA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="download-kelas">Kelas</Label>
              <Select value={downloadKelas} onValueChange={setDownloadKelas}>
                <SelectTrigger id="download-kelas">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VII_PUTRA">VII Putra</SelectItem>
                  <SelectItem value="VII_PUTRI">VII Putri</SelectItem>
                  <SelectItem value="VIII_PUTRA">VIII Putra</SelectItem>
                  <SelectItem value="VIII_PUTRI">VIII Putri</SelectItem>
                  <SelectItem value="IX_PUTRA">IX Putra</SelectItem>
                  <SelectItem value="IX_PUTRI">IX Putri</SelectItem>
                  <SelectItem value="X_PUTRA">X Putra</SelectItem>
                  <SelectItem value="X_PUTRI">X Putri</SelectItem>
                  <SelectItem value="XI_PUTRA">XI Putra</SelectItem>
                  <SelectItem value="XI_PUTRI">XI Putri</SelectItem>
                  <SelectItem value="XII_PUTRA">XII Putra</SelectItem>
                  <SelectItem value="XII_PUTRI">XII Putri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulan">Bulan</Label>
              <Select value={downloadBulan} onValueChange={setDownloadBulan}>
                <SelectTrigger id="bulan">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Januari</SelectItem>
                  <SelectItem value="02">Februari</SelectItem>
                  <SelectItem value="03">Maret</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                  <SelectItem value="05">Mei</SelectItem>
                  <SelectItem value="06">Juni</SelectItem>
                  <SelectItem value="07">Juli</SelectItem>
                  <SelectItem value="08">Agustus</SelectItem>
                  <SelectItem value="09">September</SelectItem>
                  <SelectItem value="10">Oktober</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">Desember</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Select value={downloadTahun} onValueChange={setDownloadTahun}>
                <SelectTrigger id="tahun">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadDialog(false);
                setDownloadBulan("");
                setDownloadTahun("");
                setDownloadKelas("");
                setDownloadTingkatan("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (downloadBulan && downloadTahun && downloadKelas && downloadTingkatan) {
                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/absensi/export?bulan=${downloadBulan}&tahun=${downloadTahun}&kelas=${downloadKelas}&tingkatan=${downloadTingkatan}`,
                      {
                        credentials: "include",
                      }
                    );
                    
                    if (!response.ok) {
                      throw new Error("Gagal mengunduh data");
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const kelasName = downloadKelas.replace("_", " ");
                    a.download = `Absensi_${kelasName}_${downloadTingkatan}_${downloadBulan}_${downloadTahun}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    setShowDownloadDialog(false);
                    setDownloadBulan("");
                    setDownloadTahun("");
                    setDownloadKelas("");
                    setDownloadTingkatan("");
                  } catch (error) {
                    console.error("Error downloading:", error);
                    alert("Gagal mengunduh data absensi");
                  }
                }
              }}
              disabled={!downloadBulan || !downloadTahun || !downloadKelas || !downloadTingkatan}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
