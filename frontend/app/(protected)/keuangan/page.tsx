"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Wallet, TrendingUp, Users, CreditCard, DollarSign, Receipt, List, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

interface BiodataKeuangan {
  id: string;
  siswa: {
    id: string;
    nama: string;
    kelas: string | null;
    tingkatan: string | null;
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

  useEffect(() => {
    fetchData();
    fetchChartData();
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

  const filteredBiodata = biodataList.filter((item) =>
    item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Card className="border-emerald-200 bg-white">
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

        <Card className="border-emerald-200 bg-white">
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

        <Card className="border-emerald-200 bg-white">
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

        <Card className="border-emerald-200 bg-white">
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
                onClick={() => router.push("/keuangan/pembayaran")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Riwayat Pembayaran
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
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
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBiodata.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
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
              Breakdown komitmen dan pembayaran
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
    </div>
  );
}
