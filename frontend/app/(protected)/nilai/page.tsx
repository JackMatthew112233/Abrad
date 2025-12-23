"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface NilaiBySiswa {
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    jenisKelamin?: string;
  };
  jumlahNilai: number;
  rataRata: number;
}

interface NilaiTerbaru {
  id: string;
  mataPelajaran: string;
  jenisNilai: string;
  nilai: number;
  semester: string;
  tahunAjaran: string;
  tanggal: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

interface Statistik {
  totalNilai: number;
  siswaWithNilai: number;
  totalSiswa: number;
  rataRataKeseluruhan: number;
  rataRataAdDurusAlFiqhiyyahFiqh?: number | null;
  rataRataQiraahAlKutub?: number | null;
  rataRataKeDDIan?: number | null;
}

interface TahfidzStatistik {
  totalCatatan: number;
  totalSiswaWithTahfidz: number;
  modusJuz: number | null;
  modusJuzCount: number;
  rataRataNilai: number | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NilaiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTingkatan, setFilterTingkatan] = useState("Semua Tingkatan");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [siswaList, setSiswaList] = useState<NilaiBySiswa[]>([]);
  const [nilaiTerbaru, setNilaiTerbaru] = useState<NilaiTerbaru[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    totalNilai: 0,
    siswaWithNilai: 0,
    totalSiswa: 0,
    rataRataKeseluruhan: 0,
  });
  const [tahfidzStatistik, setTahfidzStatistik] = useState<TahfidzStatistik>({
    totalCatatan: 0,
    totalSiswaWithTahfidz: 0,
    modusJuz: null,
    modusJuzCount: 0,
    rataRataNilai: null,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Reset ke halaman 1 saat filter berubah
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAllData(1);
  }, [debouncedSearch, filterTingkatan, filterKelas]);

  const fetchAllData = async (page: number = 1) => {
    try {
      setIsLoading(true);

      // Build query params for filter
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterTingkatan && filterTingkatan !== "Semua Tingkatan") params.append("tingkatan", filterTingkatan);
      if (filterKelas && filterKelas !== "Semua Kelas") params.append("kelas", filterKelas);

      const [siswaRes, statsRes, terbarRes, tahfidzStatsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/nilai/by-siswa?${params.toString()}`,
          { credentials: "include" }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai/statistik`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai/terbaru`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tahfidz/statistik`, {
          credentials: "include",
        }),
      ]);

      if (siswaRes.ok) {
        const siswaData = await siswaRes.json();
        setSiswaList(siswaData.data);
        setPagination(siswaData.pagination);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistik(statsData);
      }

      if (terbarRes.ok) {
        const terbarData = await terbarRes.json();
        setNilaiTerbaru(terbarData);
      }

      if (tahfidzStatsRes.ok) {
        const tahfidzData = await tahfidzStatsRes.json();
        setTahfidzStatistik(tahfidzData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchAllData(newPage);
  };

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Data sudah difilter dari server, tidak perlu filter client-side lagi
  const filteredSiswa = siswaList;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <BookOpen className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Award className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4" />
            Manajemen Nilai
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">Kelola Nilai</h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola data nilai dan prestasi akademik santri / santriwati
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Rata-rata Fiqh
            </CardTitle>
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading
                ? "..."
                : statistik.rataRataAdDurusAlFiqhiyyahFiqh?.toFixed(1) || "-"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Ad-Durus Al-Fiqhiyyah
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Rata-rata Qira'ah
            </CardTitle>
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading
                ? "..."
                : statistik.rataRataQiraahAlKutub?.toFixed(1) || "-"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Qira'ah Al-Kutub
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Rata-rata Ke-DDI-an
            </CardTitle>
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading
                ? "..."
                : statistik.rataRataKeDDIan?.toFixed(1) || "-"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Ke-DDI-an
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Modus Juz Tahfidz
            </CardTitle>
            <Award className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading
                ? "..."
                : tahfidzStatistik.modusJuz
                  ? `Juz ${tahfidzStatistik.modusJuz}`
                  : "-"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {tahfidzStatistik.modusJuzCount > 0
                ? `${tahfidzStatistik.modusJuzCount} santri`
                : "Belum ada data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Santri */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base lg:text-lg font-semibold text-emerald-700">
                Daftar Santri & Data Nilai
              </CardTitle>
              <p className="mt-1 text-xs lg:text-sm text-zinc-500">
                Total {pagination.total} santri dengan data nilai
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/nilai/mata-pelajaran")}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
              >
                <BookOpen className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Kelola </span>Mapel
              </Button>
              <Button
                onClick={() => router.push("/nilai/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
              >
                <Plus className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Tambah </span>Nilai
              </Button>
              <Button
                onClick={() => router.push("/ekstrakurikuler")}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
              >
                <Award className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Kelola </span>Ekstrakurikuler
              </Button>
              <Button
                onClick={() => router.push("/nilai/tambah-ekstra")}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
              >
                <Plus className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Tambah </span>Nilai Ekstrakurikuler
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 lg:p-6 pt-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
              />
            </div>
            <Select value={filterTingkatan} onValueChange={setFilterTingkatan}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] text-xs lg:text-sm h-9 lg:h-10">
                <SelectValue placeholder="Pilih Tingkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Tingkatan">
                  Semua Tingkatan
                </SelectItem>
                <SelectItem value="TK">TK</SelectItem>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                <SelectItem value="ULYA">ULYA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] text-xs lg:text-sm h-9 lg:h-10">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Kelas">Semua Kelas</SelectItem>
                {/* TK */}
                <SelectItem value="TK_1">TK 1</SelectItem>
                <SelectItem value="TK_2">TK 2</SelectItem>
                <SelectItem value="TK_3">TK 3</SelectItem>
                {/* SD */}
                <SelectItem value="I_SD_Putra">1 SD Putra</SelectItem>
                <SelectItem value="II_SD_Putra">2 SD Putra</SelectItem>
                <SelectItem value="III_SD_Putra">3 SD Putra</SelectItem>
                <SelectItem value="IV_SD_Putra">4 SD Putra</SelectItem>
                <SelectItem value="V_SD_Putra">5 SD Putra</SelectItem>
                <SelectItem value="VI_SD_Putra">6 SD Putra</SelectItem>
                <SelectItem value="I_SD_Putri">1 SD Putri</SelectItem>
                <SelectItem value="II_SD_Putri">2 SD Putri</SelectItem>
                <SelectItem value="III_SD_Putri">3 SD Putri</SelectItem>
                <SelectItem value="IV_SD_Putri">4 SD Putri</SelectItem>
                <SelectItem value="V_SD_Putri">5 SD Putri</SelectItem>
                <SelectItem value="VI_SD_Putri">6 SD Putri</SelectItem>
                {/* Wustha */}
                <SelectItem value="VII_Putra">VII Putra</SelectItem>
                <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                <SelectItem value="IX_Putra">IX Putra</SelectItem>
                <SelectItem value="VII_Putri">VII Putri</SelectItem>
                <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                <SelectItem value="IX_Putri">IX Putri</SelectItem>
                {/* Ulya */}
                <SelectItem value="X_Putra">X Putra</SelectItem>
                <SelectItem value="XI_Putra">XI Putra</SelectItem>
                <SelectItem value="XII_Putra">XII Putra</SelectItem>
                <SelectItem value="X_Putri">X Putri</SelectItem>
                <SelectItem value="XI_Putri">XI Putri</SelectItem>
                <SelectItem value="XII_Putri">XII Putri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 lg:mx-0">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Jenis Kelamin
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Kelas
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Tingkatan
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Jumlah Nilai
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Rata-rata
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8 text-xs lg:text-sm"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredSiswa.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8 text-xs lg:text-sm"
                    >
                      Tidak ada data yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSiswa.map((item, index) => {
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    return (
                      <TableRow key={item.siswa.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-xs lg:text-sm whitespace-nowrap">
                          <button
                            onClick={() =>
                              router.push(`/nilai/siswa/${item.siswa.id}`)
                            }
                            className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                          >
                            {item.siswa.nama}
                          </button>
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.jenisKelamin === "LakiLaki"
                            ? "Laki-laki"
                            : "Perempuan"}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.kelas?.replace("_", " ") || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs"
                          >
                            {item.jumlahNilai}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-emerald-700 text-xs lg:text-sm">
                            {item.rataRata.toFixed(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredSiswa.length > 0 && (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <p className="text-xs lg:text-sm text-zinc-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} data
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
                        (page >= pagination.page - 1 &&
                          page <= pagination.page + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-zinc-400 text-xs">...</span>
                        )}
                        <Button
                          variant={
                            page === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 text-xs lg:text-sm ${page === pagination.page
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

      {/* Nilai Terbaru */}
      <Card className="border-zinc-200 bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Nilai Terbaru
          </CardTitle>
          <p className="text-xs text-zinc-500">
            10 catatan terakhir yang tercatat
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          {nilaiTerbaru.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-zinc-500 text-xs lg:text-sm px-6">
              Belum ada nilai tercatat
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 text-zinc-500 text-xs lg:text-sm px-6">
              Memuat data...
            </div>
          ) : (
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Mata Pelajaran
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Jenis
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nilai
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Semester
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nilaiTerbaru.map((nilai, index) => (
                  <TableRow key={nilai.id} className="hover:bg-zinc-50">
                    <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {formatTanggal(nilai.tanggal)}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {nilai.siswa.nama}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm max-w-[150px] truncate">
                      {nilai.mataPelajaran}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-500 text-xs">
                        {nilai.jenisNilai}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-emerald-700 text-xs lg:text-sm">
                        {nilai.nilai}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {nilai.semester}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
