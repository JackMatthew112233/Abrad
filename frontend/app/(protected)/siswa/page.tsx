"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, UserCheck, TrendingUp, GraduationCap, BookOpen, ChevronLeft, ChevronRight, Download } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Siswa {
  id: string;
  nama: string | null;
  nik: string | null;
  nis: string | null;
  nisn: string | null;
  npsn: string | null;
  jenisKelamin: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  sekolahAsal: string | null;
  alamat: string | null;
  kodePos: string | null;
  noKartuKeluarga: string | null;
  kelas: string | null;
  tingkatan: string | null;
  isAktif: boolean;
  status: string | null;
}

interface StatusBreakdown {
  aktif: number;
  tidakAktif: number;
  lulus: number;
}

interface Statistik {
  totalSiswa: number;
  siswaLakiLaki: number;
  siswaPerempuan: number;
  siswaAktif: number;
  siswaNonAktif: number;
  breakdown?: {
    total: StatusBreakdown;
    santri: StatusBreakdown;
    santriwati: StatusBreakdown;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SiswaPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTingkatan, setFilterTingkatan] = useState("Semua Tingkatan");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [stats, setStats] = useState<Statistik>({
    totalSiswa: 0,
    siswaLakiLaki: 0,
    siswaPerempuan: 0,
    siswaAktif: 0,
    siswaNonAktif: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Download dialog state
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadKelas, setDownloadKelas] = useState("");
  const [downloadTingkatan, setDownloadTingkatan] = useState("");

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
    fetchData(1);
  }, [debouncedSearch, filterTingkatan, filterKelas]);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      // Build query params for filter
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterTingkatan && filterTingkatan !== "Semua Tingkatan") params.append("tingkatan", filterTingkatan);
      if (filterKelas && filterKelas !== "Semua Kelas") params.append("kelas", filterKelas);
      
      const [siswaResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa?${params.toString()}`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/statistik`, {
          credentials: "include",
        }),
      ]);

      if (siswaResponse.ok && statsResponse.ok) {
        const siswaData = await siswaResponse.json();
        const statsData = await statsResponse.json();
        setSiswaList(siswaData.data);
        setPagination(siswaData.pagination);
        setStats(statsData);
      } else {
        toast.error("Gagal memuat data siswa");
      }
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  // Data sudah difilter dari server, tidak perlu filter client-side lagi
  const filteredSiswa = siswaList;

  const totalSiswa = stats.totalSiswa;
  const siswaLakiLaki = stats.siswaLakiLaki;
  const siswaPerempuan = stats.siswaPerempuan;
  const siswaAktif = stats.siswaAktif;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20 hidden lg:block">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15 hidden lg:block">
          <BookOpen className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 lg:px-4 py-1 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            Data Santri / Santriwati
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Santri / Santriwati
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola data biodata santri / santriwati pesantren dengan mudah
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Santri / Santriwati */}
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Santri / Santriwati
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{totalSiswa}</div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                {siswaLakiLaki} Santri dan {siswaPerempuan} Santriwati
              </p>
              {stats.breakdown && (
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.aktif} Aktif
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.lulus} Lulus
                  </Badge>
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.tidakAktif} Tidak Aktif
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Santri */}
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santri
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{siswaLakiLaki}</div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? ((siswaLakiLaki / totalSiswa) * 100).toFixed(1) : "0"}% dari total
              </p>
              {stats.breakdown && (
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santri.aktif} Aktif
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santri.lulus} Lulus
                  </Badge>
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santri.tidakAktif} Tidak Aktif
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Santriwati */}
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santriwati
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{siswaPerempuan}</div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? ((siswaPerempuan / totalSiswa) * 100).toFixed(1) : "0"}% dari total
              </p>
              {stats.breakdown && (
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santriwati.aktif} Aktif
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santriwati.lulus} Lulus
                  </Badge>
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.santriwati.tidakAktif} Tidak Aktif
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Santri / Santriwati Aktif */}
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santri / Santriwati Aktif
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">
              {stats.breakdown?.total.aktif ?? siswaAktif}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? (((stats.breakdown?.total.aktif ?? siswaAktif) / totalSiswa) * 100).toFixed(1) : "0"}% dari total
              </p>
              {stats.breakdown && (
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.aktif} Aktif
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.lulus} Lulus
                  </Badge>
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                    {stats.breakdown.total.tidakAktif} Tidak Aktif
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="space-y-3 lg:space-y-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Daftar Santri / Santriwati
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setShowDownloadDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Unduh Biodata Santri / Santriwati</span>
                <span className="sm:hidden">Unduh Biodata</span>
              </Button>
              <Button
                onClick={() => router.push("/siswa/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Biodata
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Cari nama atau NIK santri / santriwati..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm h-9 lg:h-10"
                />
              </div>
              <Select value={filterTingkatan} onValueChange={setFilterTingkatan}>
                <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] text-xs lg:text-sm h-9 lg:h-10">
                  <SelectValue placeholder="Pilih Tingkatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Tingkatan">Semua Tingkatan</SelectItem>
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
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">NIS</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">NIK</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">NISN</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">NPSN</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jenis Kelamin</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tempat, Tanggal Lahir</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Sekolah Asal</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Alamat</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Kode Pos</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No. KK</TableHead>
                    <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswa.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center text-zinc-500 py-8">
                        {searchQuery ? "Tidak ada data yang sesuai pencarian" : "Belum ada data santri / santriwati"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSiswa.map((siswa) => (
                      <TableRow key={siswa.id}>
                        <TableCell className="font-medium text-xs lg:text-sm whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/siswa/${siswa.id}`)}
                            className="text-emerald-600 hover:text-emerald-700 hover:underline text-left"
                          >
                            {siswa.nama || "-"}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.nis || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.nik || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.nisn || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.npsn || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.tingkatan || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm whitespace-nowrap">{siswa.kelas ? siswa.kelas.replace("_", " ") : "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm whitespace-nowrap">
                          {siswa.jenisKelamin ? (
                            siswa.jenisKelamin === "LakiLaki" ? "Laki-laki" : "Perempuan"
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-xs lg:text-sm">
                          {siswa.tempatLahir && siswa.tanggalLahir ? (
                            <>
                              {siswa.tempatLahir},{" "}
                              {new Date(siswa.tanggalLahir).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-xs lg:text-sm">
                          <div className="truncate" title={siswa.sekolahAsal || "-"}>
                            {siswa.sekolahAsal || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] text-xs lg:text-sm">
                          <div className="truncate" title={siswa.alamat || "-"}>
                            {siswa.alamat || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.kodePos || "-"}</TableCell>
                        <TableCell className="text-xs lg:text-sm">{siswa.noKartuKeluarga || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              siswa.status === "AKTIF"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 text-xs"
                                : siswa.status === "LULUS"
                                ? "border-blue-300 bg-blue-50 text-blue-700 text-xs"
                                : "border-zinc-300 bg-zinc-50 text-zinc-700 text-xs"
                            }
                          >
                            {siswa.status === "AKTIF" ? "Aktif" : siswa.status === "LULUS" ? "Lulus" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filteredSiswa.length > 0 && (
            <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="text-xs lg:text-sm text-zinc-500 text-center lg:text-left">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 px-2 lg:px-3"
                >
                  <ChevronLeft className="h-4 w-4 lg:mr-1" />
                  <span className="hidden lg:inline">Sebelumnya</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 2) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 1) {
                      pageNum = pagination.totalPages - 2 + i;
                    } else {
                      pageNum = pagination.page - 1 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          pagination.page === pageNum
                            ? "bg-emerald-600 hover:bg-emerald-700 h-8 w-8 lg:w-auto lg:px-3"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 w-8 lg:w-auto lg:px-3"
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
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 px-2 lg:px-3"
                >
                  <span className="hidden lg:inline">Selanjutnya</span>
                  <ChevronRight className="h-4 w-4 lg:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Unduh Biodata */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unduh Biodata Santri / Santriwati</DialogTitle>
            <DialogDescription>
              Pilih filter untuk mengunduh data santri / santriwati
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
                  <SelectItem value="SEMUA">Semua Tingkatan</SelectItem>
                  <SelectItem value="TK">TK</SelectItem>
                  <SelectItem value="SD">SD</SelectItem>
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
                  <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                  {/* TK */}
                  {downloadTingkatan === "TK" && (
                    <>
                      <SelectItem value="TK_1">TK 1</SelectItem>
                      <SelectItem value="TK_2">TK 2</SelectItem>
                      <SelectItem value="TK_3">TK 3</SelectItem>
                    </>
                  )}
                  {/* SD */}
                  {downloadTingkatan === "SD" && (
                    <>
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
                    </>
                  )}
                  {/* Wustha */}
                  {downloadTingkatan === "WUSTHA" && (
                    <>
                      <SelectItem value="VII_Putra">VII Putra</SelectItem>
                      <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                      <SelectItem value="IX_Putra">IX Putra</SelectItem>
                      <SelectItem value="VII_Putri">VII Putri</SelectItem>
                      <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                      <SelectItem value="IX_Putri">IX Putri</SelectItem>
                    </>
                  )}
                  {/* Ulya */}
                  {downloadTingkatan === "ULYA" && (
                    <>
                      <SelectItem value="X_Putra">X Putra</SelectItem>
                      <SelectItem value="XI_Putra">XI Putra</SelectItem>
                      <SelectItem value="XII_Putra">XII Putra</SelectItem>
                      <SelectItem value="X_Putri">X Putri</SelectItem>
                      <SelectItem value="XI_Putri">XI Putri</SelectItem>
                      <SelectItem value="XII_Putri">XII Putri</SelectItem>
                    </>
                  )}
                  {/* Default */}
                  {!downloadTingkatan && (
                    <>
                      <SelectItem value="TK_1">TK 1</SelectItem>
                      <SelectItem value="TK_2">TK 2</SelectItem>
                      <SelectItem value="TK_3">TK 3</SelectItem>
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
                      <SelectItem value="VII_Putra">VII Putra</SelectItem>
                      <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                      <SelectItem value="IX_Putra">IX Putra</SelectItem>
                      <SelectItem value="VII_Putri">VII Putri</SelectItem>
                      <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                      <SelectItem value="IX_Putri">IX Putri</SelectItem>
                      <SelectItem value="X_Putra">X Putra</SelectItem>
                      <SelectItem value="XI_Putra">XI Putra</SelectItem>
                      <SelectItem value="XII_Putra">XII Putra</SelectItem>
                      <SelectItem value="X_Putri">X Putri</SelectItem>
                      <SelectItem value="XI_Putri">XI Putri</SelectItem>
                      <SelectItem value="XII_Putri">XII Putri</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadDialog(false);
                setDownloadKelas("");
                setDownloadTingkatan("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (downloadKelas && downloadTingkatan) {
                  try {
                    // Build query params
                    const params = new URLSearchParams();
                    if (downloadKelas !== "SEMUA") params.append("kelas", downloadKelas);
                    if (downloadTingkatan !== "SEMUA") params.append("tingkatan", downloadTingkatan);
                    
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/siswa/export?${params.toString()}`,
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
                    
                    // Generate filename based on selection
                    let filename = "Biodata";
                    if (downloadKelas === "SEMUA" && downloadTingkatan === "SEMUA") {
                      filename += "_Semua_Santri";
                    } else if (downloadKelas === "SEMUA") {
                      filename += `_Semua_Kelas_${downloadTingkatan}`;
                    } else if (downloadTingkatan === "SEMUA") {
                      const kelasName = downloadKelas.replace("_", " ");
                      filename += `_${kelasName}_Semua_Tingkatan`;
                    } else {
                      const kelasName = downloadKelas.replace("_", " ");
                      filename += `_${kelasName}_${downloadTingkatan}`;
                    }
                    filename += ".xlsx";
                    
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    setShowDownloadDialog(false);
                    setDownloadKelas("");
                    setDownloadTingkatan("");
                    toast.success("Biodata berhasil diunduh");
                  } catch (error) {
                    console.error("Error downloading:", error);
                    toast.error("Gagal mengunduh biodata");
                  }
                }
              }}
              disabled={!downloadKelas || !downloadTingkatan}
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
