"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Wallet, TrendingUp, Users, CreditCard, DollarSign, Receipt, List, Download, Search, ChevronLeft, ChevronRight, X, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
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
import { toast } from "sonner";

interface BiodataKeuangan {
  id: string;
  siswa: {
    id: string;
    nama: string;
    kelas: string | null;
    tingkatan: string | null;
    jenisKelamin: string | null;
  };
  komitmenInfaqLaundry: number;
  infaq: number;
  laundry: number;
}

interface Statistik {
  totalKomitmen: number;
  totalInfaq: number;
  totalLaundry: number;
  totalPembayaranInfaq: number;
  totalPembayaranLaundry: number;
  jumlahSantriTerdaftar: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function KeuanganPage() {
  const router = useRouter();
  const [biodataList, setBiodataList] = useState<BiodataKeuangan[]>([]);
  const [stats, setStats] = useState<Statistik>({
    totalKomitmen: 0,
    totalInfaq: 0,
    totalLaundry: 0,
    totalPembayaranInfaq: 0,
    totalPembayaranLaundry: 0,
    jumlahSantriTerdaftar: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chartPembayaran, setChartPembayaran] = useState<any[]>([]);
  const [chartDistribusi, setChartDistribusi] = useState<any[]>([]);
  const [pembayaranTerbaru, setPembayaranTerbaru] = useState<any[]>([]);
  const [pengeluaranTerbaru, setPengeluaranTerbaru] = useState<any[]>([]);
  
  // Filter states
  const [filterTingkatan, setFilterTingkatan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  
  // Download dialog state
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadMode, setDownloadMode] = useState<"semua" | "per_santri">("semua");
  const [selectedSiswaForDownload, setSelectedSiswaForDownload] = useState<any>(null);
  const [siswaSearchQuery, setSiswaSearchQuery] = useState("");
  const [siswaSearchResults, setSiswaSearchResults] = useState<any[]>([]);
  
  // Download pengeluaran dialog state
  const [showDownloadPengeluaranDialog, setShowDownloadPengeluaranDialog] = useState(false);
  const [downloadPengeluaranMode, setDownloadPengeluaranMode] = useState<"semua" | "tanggal" | "bulan" | "tahun">("semua");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  useEffect(() => {
    fetchData();
    fetchChartData();
    fetchRecentData();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const [biodataResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata?page=${page}&limit=20`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/keuangan/statistik`, {
          credentials: "include",
        }),
      ]);

      if (biodataResponse.ok && statsResponse.ok) {
        const biodataData = await biodataResponse.json();
        const statsData = await statsResponse.json();
        setBiodataList(biodataData.data);
        setPagination(biodataData.pagination);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const [pembayaranResponse, distribusiResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/keuangan/chart-pembayaran`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/keuangan/chart-distribusi`, {
          credentials: "include",
        }),
      ]);

      if (pembayaranResponse.ok && distribusiResponse.ok) {
        const pembayaranData = await pembayaranResponse.json();
        const distribusiData = await distribusiResponse.json();
        setChartPembayaran(pembayaranData);
        setChartDistribusi(distribusiData);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchRecentData = async () => {
    try {
      const [pembayaranResponse, pengeluaranResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran-terbaru?limit=10`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pengeluaran/terbaru?limit=10`, {
          credentials: "include",
        }),
      ]);

      if (pembayaranResponse.ok) {
        const data = await pembayaranResponse.json();
        setPembayaranTerbaru(data);
      }

      if (pengeluaranResponse.ok) {
        const data = await pengeluaranResponse.json();
        setPengeluaranTerbaru(data);
      }
    } catch (error) {
      console.error("Error fetching recent data:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredBiodata = biodataList.filter((item) => {
    const matchesSearch = item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTingkatan = !filterTingkatan || filterTingkatan === "all" || item.siswa.tingkatan === filterTingkatan;
    const matchesKelas = !filterKelas || filterKelas === "all" || item.siswa.kelas === filterKelas;
    return matchesSearch && matchesTingkatan && matchesKelas;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <Wallet className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <DollarSign className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Wallet className="h-4 w-4" />
            Manajemen Keuangan
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Keuangan Pesantren
          </h1>
          <p className="max-w-2xl text-lg text-emerald-50">
            Kelola biodata keuangan dan pembayaran santri / santriwati dengan mudah
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Komitmen
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.totalKomitmen)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Total komitmen infaq & laundry
              </p>
              <p className="text-xs text-zinc-500">
                {stats.jumlahSantriTerdaftar} santri terdaftar
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Biaya Infaq
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.totalInfaq)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Total komitmen biaya infaq
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Biaya Laundry
            </CardTitle>
            <Receipt className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.totalLaundry)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Total komitmen biaya laundry
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santri Terdaftar
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : stats.jumlahSantriTerdaftar}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Santri dengan biodata keuangan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Daftar Biodata Keuangan
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Total {pagination.total} biodata keuangan santri
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/keuangan/biodata/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Biodata Keuangan
              </Button>
              <Button
                onClick={() => router.push("/keuangan/pembayaran/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pembayaran
              </Button>
              <Button
                onClick={() => router.push("/keuangan/pengeluaran/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengeluaran
              </Button>
              <Button
                onClick={() => setShowDownloadDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Riwayat Pembayaran
              </Button>
              <Button
                onClick={() => setShowDownloadPengeluaranDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Riwayat Pengeluaran
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Jenis Kelamin</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700">
                    Total Komitmen
                  </TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700">
                    Total Biaya Infaq
                  </TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700">
                    Total Biaya Laundry
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBiodata.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                      Tidak ada data biodata keuangan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBiodata.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900">
                        <button
                          onClick={() => router.push(`/keuangan/biodata/${item.id}`)}
                          className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                        >
                          {item.siswa.nama}
                        </button>
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {item.siswa.jenisKelamin === "LakiLaki" ? "Laki-Laki" : item.siswa.jenisKelamin === "Perempuan" ? "Perempuan" : "-"}
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {item.siswa.kelas ? item.siswa.kelas.replace("_", " ") : "-"}
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {item.siswa.tingkatan || "-"}
                      </TableCell>
                      <TableCell className="text-right text-zinc-900">
                        {formatRupiah(item.komitmenInfaqLaundry)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-900">
                        {formatRupiah(item.infaq)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-900">
                        {formatRupiah(item.laundry)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredBiodata.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                {pagination.total} biodata
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-zinc-400">...</span>
                        )}
                        <Button
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 ${
                            page === pagination.page
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend Pembayaran Bar Chart */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Trend Pembayaran (6 Bulan Terakhir)
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Tracking pembayaran infaq dan laundry
            </p>
          </CardHeader>
          <CardContent>
            {chartPembayaran.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-zinc-500">
                Belum ada data pembayaran
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartPembayaran}>
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
                    formatter={(value: number) => `Rp ${value}jt`}
                  />
                  <Legend />
                  <Bar
                    dataKey="infaq"
                    fill="#10b981"
                    name="Infaq"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="laundry"
                    fill="#22c55e"
                    name="Laundry"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribusi Pie Chart */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Distribusi Keuangan
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Pemasukan vs Pengeluaran
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {chartDistribusi.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-zinc-500">
                Belum ada data distribusi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartDistribusi}
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
                    {chartDistribusi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatRupiah(value)
                    }
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Terbaru Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Riwayat Pembayaran Terbaru */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-emerald-700">
                Riwayat Pembayaran Terbaru (Global)
              </CardTitle>
              <p className="text-xs text-zinc-500">
                10 Pembayaran terakhir dari semua santri
              </p>
            </div>
            <Button
              onClick={() => router.push("/keuangan/pembayaran")}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Lihat Semua Riwayat
            </Button>
          </CardHeader>
          <CardContent>
            {pembayaranTerbaru.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Belum ada riwayat pembayaran
              </div>
            ) : (
              <div className="rounded-md border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pembayaranTerbaru.map((pembayaran, index) => (
                      <TableRow key={pembayaran.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600">{index + 1}</TableCell>
                        <TableCell className="text-zinc-600 text-sm">
                          {new Date(pembayaran.tanggalPembayaran).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900">
                          {pembayaran.siswa.nama}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {pembayaran.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {pembayaran.siswa.kelas ? pembayaran.siswa.kelas.replace(/_/g, " ") : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700">
                          {formatRupiah(pembayaran.totalPembayaranInfaq + pembayaran.totalPembayaranLaundry)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Pengeluaran Terbaru */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-emerald-700">
                Riwayat Pengeluaran Terbaru (Global)
              </CardTitle>
              <p className="text-xs text-zinc-500">
                10 Pengeluaran terakhir
              </p>
            </div>
            <Button
              onClick={() => router.push("/keuangan/pengeluaran")}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Lihat Semua Riwayat
            </Button>
          </CardHeader>
          <CardContent>
            {pengeluaranTerbaru.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Belum ada riwayat pengeluaran
              </div>
            ) : (
              <div className="rounded-md border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Jenis</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pengeluaranTerbaru.map((pengeluaran, index) => (
                      <TableRow key={pengeluaran.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600">{index + 1}</TableCell>
                        <TableCell className="text-zinc-600 text-sm">
                          {new Date(pengeluaran.tanggalPengeluaran).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900">
                          {pengeluaran.nama}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {pengeluaran.jenis}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatRupiah(pengeluaran.harga)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Unduh Riwayat Pembayaran */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unduh Riwayat Pembayaran</DialogTitle>
            <DialogDescription>
              Pilih mode unduh riwayat pembayaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mode Unduh</Label>
              <Select
                value={downloadMode}
                onValueChange={(value: "semua" | "per_santri") => {
                  setDownloadMode(value);
                  setSelectedSiswaForDownload(null);
                  setSiswaSearchQuery("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Pembayaran</SelectItem>
                  <SelectItem value="per_santri">Per Santri / Santriwati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {downloadMode === "per_santri" && (
              <div className="space-y-2">
                <Label>Pilih Santri / Santriwati</Label>
                <div className="relative">
                  <Input
                    placeholder="Cari nama santri..."
                    value={siswaSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setSiswaSearchQuery(query);
                      
                      if (query.length >= 2) {
                        try {
                          const response = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/keuangan/search-siswa?q=${query}`,
                            { credentials: "include" }
                          );
                          if (response.ok) {
                            const data = await response.json();
                            setSiswaSearchResults(data);
                          }
                        } catch (error) {
                          console.error("Error searching siswa:", error);
                        }
                      } else {
                        setSiswaSearchResults([]);
                      }
                    }}
                  />
                  {siswaSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {siswaSearchResults.map((siswa) => (
                        <button
                          key={siswa.id}
                          onClick={() => {
                            setSelectedSiswaForDownload(siswa);
                            setSiswaSearchQuery(siswa.nama);
                            setSiswaSearchResults([]);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-50 flex flex-col"
                        >
                          <span className="font-medium text-zinc-900">{siswa.nama}</span>
                          <span className="text-xs text-zinc-500">
                            {siswa.kelas?.replace(/_/g, " ") || "-"} • {siswa.tingkatan || "-"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedSiswaForDownload && (
                  <Card className="border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-900">{selectedSiswaForDownload.nama}</p>
                        <p className="text-sm text-emerald-700">
                          {selectedSiswaForDownload.kelas?.replace(/_/g, " ")} • {selectedSiswaForDownload.tingkatan}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSiswaForDownload(null);
                          setSiswaSearchQuery("");
                        }}
                        className="text-emerald-700 hover:text-emerald-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadDialog(false);
                setDownloadMode("semua");
                setSelectedSiswaForDownload(null);
                setSiswaSearchQuery("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (downloadMode === "per_santri" && !selectedSiswaForDownload) {
                  toast.error("Pilih santri terlebih dahulu");
                  return;
                }

                try {
                  const params = new URLSearchParams();
                  if (downloadMode === "per_santri" && selectedSiswaForDownload) {
                    params.append("siswaId", selectedSiswaForDownload.id);
                  }

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran/export?${params.toString()}`,
                    { credentials: "include" }
                  );

                  if (!response.ok) {
                    throw new Error("Gagal mengunduh data");
                  }

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;

                  // Generate filename
                  let filename = "Riwayat_Pembayaran";
                  if (downloadMode === "per_santri" && selectedSiswaForDownload) {
                    filename += `_${selectedSiswaForDownload.nama.replace(/\s+/g, "_")}`;
                  } else {
                    filename += "_Semua_Santri";
                  }
                  filename += ".xlsx";

                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  setShowDownloadDialog(false);
                  setDownloadMode("semua");
                  setSelectedSiswaForDownload(null);
                  setSiswaSearchQuery("");
                  toast.success("Riwayat pembayaran berhasil diunduh");
                } catch (error) {
                  console.error("Error downloading:", error);
                  toast.error("Gagal mengunduh riwayat pembayaran");
                }
              }}
              disabled={downloadMode === "per_santri" && !selectedSiswaForDownload}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Unduh Riwayat Pengeluaran */}
      <Dialog open={showDownloadPengeluaranDialog} onOpenChange={setShowDownloadPengeluaranDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unduh Riwayat Pengeluaran</DialogTitle>
            <DialogDescription>
              Pilih filter untuk mengunduh riwayat pengeluaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mode Filter</Label>
              <Select
                value={downloadPengeluaranMode}
                onValueChange={(value: "semua" | "tanggal" | "bulan" | "tahun") => {
                  setDownloadPengeluaranMode(value);
                  setFilterTanggal("");
                  setFilterBulan("");
                  setFilterTahun("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Pengeluaran</SelectItem>
                  <SelectItem value="tanggal">Filter per Tanggal</SelectItem>
                  <SelectItem value="bulan">Filter per Bulan</SelectItem>
                  <SelectItem value="tahun">Filter per Tahun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {downloadPengeluaranMode === "tanggal" && (
              <div className="space-y-2">
                <Label htmlFor="filter-tanggal">Pilih Tanggal</Label>
                <Input
                  id="filter-tanggal"
                  type="date"
                  value={filterTanggal}
                  onChange={(e) => setFilterTanggal(e.target.value)}
                  required
                />
              </div>
            )}

            {downloadPengeluaranMode === "bulan" && (
              <div className="space-y-2">
                <Label htmlFor="filter-bulan">Pilih Bulan</Label>
                <Input
                  id="filter-bulan"
                  type="month"
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  required
                />
              </div>
            )}

            {downloadPengeluaranMode === "tahun" && (
              <div className="space-y-2">
                <Label htmlFor="filter-tahun">Pilih Tahun</Label>
                <Select
                  value={filterTahun}
                  onValueChange={setFilterTahun}
                >
                  <SelectTrigger id="filter-tahun">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(
                      (year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadPengeluaranDialog(false);
                setDownloadPengeluaranMode("semua");
                setFilterTanggal("");
                setFilterBulan("");
                setFilterTahun("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (downloadPengeluaranMode === "tanggal" && !filterTanggal) {
                  toast.error("Pilih tanggal terlebih dahulu");
                  return;
                }
                if (downloadPengeluaranMode === "bulan" && !filterBulan) {
                  toast.error("Pilih bulan terlebih dahulu");
                  return;
                }
                if (downloadPengeluaranMode === "tahun" && !filterTahun) {
                  toast.error("Pilih tahun terlebih dahulu");
                  return;
                }

                try {
                  const params = new URLSearchParams();
                  
                  if (downloadPengeluaranMode === "tanggal") {
                    params.append("filterType", "tanggal");
                    params.append("tanggal", filterTanggal);
                  } else if (downloadPengeluaranMode === "bulan") {
                    params.append("filterType", "bulan");
                    params.append("bulan", filterBulan);
                  } else if (downloadPengeluaranMode === "tahun") {
                    params.append("filterType", "tahun");
                    params.append("tahun", filterTahun);
                  }

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/pengeluaran/export?${params.toString()}`,
                    { credentials: "include" }
                  );

                  if (!response.ok) {
                    throw new Error("Gagal mengunduh data");
                  }

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;

                  // Generate filename
                  let filename = "Riwayat_Pengeluaran";
                  if (downloadPengeluaranMode === "tanggal") {
                    filename += `_${filterTanggal}`;
                  } else if (downloadPengeluaranMode === "bulan") {
                    const [year, month] = filterBulan.split("-");
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                    filename += `_${monthNames[parseInt(month) - 1]}_${year}`;
                  } else if (downloadPengeluaranMode === "tahun") {
                    filename += `_${filterTahun}`;
                  } else {
                    filename += "_Semua";
                  }
                  filename += ".xlsx";

                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  setShowDownloadPengeluaranDialog(false);
                  setDownloadPengeluaranMode("semua");
                  setFilterTanggal("");
                  setFilterBulan("");
                  setFilterTahun("");
                  toast.success("Riwayat pengeluaran berhasil diunduh");
                } catch (error) {
                  console.error("Error downloading:", error);
                  toast.error("Gagal mengunduh riwayat pengeluaran");
                }
              }}
              disabled={
                (downloadPengeluaranMode === "tanggal" && !filterTanggal) ||
                (downloadPengeluaranMode === "bulan" && !filterBulan) ||
                (downloadPengeluaranMode === "tahun" && !filterTahun)
              }
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
