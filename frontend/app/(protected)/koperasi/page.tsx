"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  Landmark,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Statistik {
  totalAnggota: number;
  totalSimpananPokok: number;
  totalSimpananWajib: number;
  totalSimpananSukarela: number;
  totalPenyertaanModal: number;
  totalPemasukan: number;
  totalBelanja: number;
  totalPinjaman: number;
  totalPengeluaran: number;
  saldo: number;
}

interface Anggota {
  id: string;
  nama: string;
  alamat: string | null;
  noTelp: string | null;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function KoperasiPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistik>({
    totalAnggota: 0,
    totalSimpananPokok: 0,
    totalSimpananWajib: 0,
    totalSimpananSukarela: 0,
    totalPenyertaanModal: 0,
    totalPemasukan: 0,
    totalBelanja: 0,
    totalPinjaman: 0,
    totalPengeluaran: 0,
    saldo: 0,
  });
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, anggotaRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/koperasi/statistik`, {
          credentials: "include",
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota?page=${pagination.page}&limit=20`,
          { credentials: "include" }
        ),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (anggotaRes.ok) {
        const anggotaData = await anggotaRes.json();
        setAnggotaList(anggotaData.data);
        setPagination(anggotaData.pagination);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredAnggota = anggotaList.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <Landmark className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <DollarSign className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <Landmark className="h-3 w-3 lg:h-4 lg:w-4" />
            Manajemen Koperasi
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Koperasi Pesantren
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola anggota, pemasukan, dan pengeluaran koperasi dengan mudah
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Anggota
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : stats.totalAnggota}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Anggota terdaftar</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.totalPemasukan)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Simpanan + Penyertaan Modal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Pengeluaran
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.totalPengeluaran)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Belanja + Pinjaman</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Saldo Koperasi
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : formatRupiah(stats.saldo)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Pemasukan - Pengeluaran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base lg:text-lg font-semibold text-emerald-700">
                Daftar Anggota Koperasi
              </CardTitle>
              <p className="mt-1 text-xs lg:text-sm text-zinc-500">
                Total {pagination.total} anggota koperasi
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9">
                  <Menu className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => router.push("/koperasi/anggota/tambah")}
                  className="cursor-pointer text-xs"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Anggota Koperasi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/koperasi/pemasukan/tambah")}
                  className="cursor-pointer text-xs"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pemasukan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/koperasi/pengeluaran/tambah")}
                  className="cursor-pointer text-xs"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengeluaran
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No. Telp
                  </TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Total Pemasukan
                  </TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Total Pengeluaran
                  </TableHead>
                  <TableHead className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Saldo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAnggota.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Tidak ada data anggota koperasi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnggota.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/koperasi/anggota/${item.id}`)}
                          className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                        >
                          {item.nama}
                        </button>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {item.noTelp || "-"}
                      </TableCell>
                      <TableCell className="text-right text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                        {formatRupiah(item.totalPemasukan)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 text-xs lg:text-sm whitespace-nowrap">
                        {formatRupiah(item.totalPengeluaran)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                        {formatRupiah(item.saldo)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredAnggota.length > 0 && (
            <div className="mt-4 px-4 sm:px-0 flex flex-col lg:flex-row items-center justify-between gap-3">
              <p className="text-xs lg:text-sm text-zinc-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                dari {pagination.total} anggota
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8 text-xs lg:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline ml-1">Prev</span>
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
                          <span className="px-2 text-zinc-400 text-xs">...</span>
                        )}
                        <Button
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 text-xs lg:text-sm ${
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
                  className="h-8 text-xs lg:text-sm"
                >
                  <span className="hidden lg:inline mr-1">Next</span>
                  <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
