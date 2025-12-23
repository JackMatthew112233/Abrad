"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Heart, Users, FileText, Search, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SiswaWithKesehatan {
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    jenisKelamin?: string;
  };
  jumlahRiwayat: number;
  noBpjs?: string | null;
}

interface Statistik {
  totalRiwayat: number;
  totalSiswaWithBpjs: number;
  totalSiswaWithKesehatan: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function KelolaKesehatanPage() {
  const router = useRouter();
  const [siswaList, setSiswaList] = useState<SiswaWithKesehatan[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    totalRiwayat: 0,
    totalSiswaWithBpjs: 0,
    totalSiswaWithKesehatan: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [kesehatanTerbaru, setKesehatanTerbaru] = useState<any[]>([]);

  // Filter states
  const [filterTingkatan, setFilterTingkatan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");

  useEffect(() => {
    fetchData();
    fetchKesehatanTerbaru();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const [siswaResponse, statistikResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/kesehatan/by-siswa?page=${page}&limit=20`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/kesehatan/statistik`, {
          credentials: "include",
        }),
      ]);

      if (siswaResponse.ok && statistikResponse.ok) {
        const siswaData = await siswaResponse.json();
        const statistikData = await statistikResponse.json();
        setSiswaList(siswaData.data || []);
        setPagination(siswaData.pagination);
        setStatistik(statistikData);
      }
    } catch (error) {
      toast.error("Gagal memuat data kesehatan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKesehatanTerbaru = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan/terbaru?limit=10`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setKesehatanTerbaru(data);
      }
    } catch (error) {
      console.error("Error fetching kesehatan terbaru:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  const filteredSiswa = siswaList.filter((item) => {
    const matchesSearch = item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTingkatan = !filterTingkatan || filterTingkatan === "all" || item.siswa.tingkatan === filterTingkatan;
    const matchesKelas = !filterKelas || filterKelas === "all" || item.siswa.kelas === filterKelas;
    return matchesSearch && matchesTingkatan && matchesKelas;
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <Heart className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Shield className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
            Manajemen Kesehatan
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Kelola Kesehatan
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola data kesehatan dan riwayat sakit santri / santriwati
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Total Riwayat
            </CardTitle>
            <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.totalRiwayat}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Total catatan riwayat sakit
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Terdaftar Asuransi
            </CardTitle>
            <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-blue-700">
              {isLoading ? "..." : statistik.totalSiswaWithBpjs}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Memiliki asuransi
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-700">
              Santri dengan Riwayat
            </CardTitle>
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.totalSiswaWithKesehatan}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Total santri tercatat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base lg:text-lg font-semibold text-emerald-700">
                Daftar Santri & Data Kesehatan
              </CardTitle>
              <p className="mt-1 text-xs lg:text-sm text-zinc-500">
                Total {pagination.total} santri dengan data kesehatan
              </p>
            </div>
            <Button
              onClick={() => router.push("/kesehatan/tambah")}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
            >
              <Plus className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Tambah Data Kesehatan</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
              />
            </div>
            <Select value={filterTingkatan} onValueChange={setFilterTingkatan}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] text-xs lg:text-sm h-9 lg:h-10">
                <SelectValue placeholder="Semua Tingkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkatan</SelectItem>
                <SelectItem value="TK">TK</SelectItem>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                <SelectItem value="ULYA">ULYA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] text-xs lg:text-sm h-9 lg:h-10">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
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
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Nama</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jenis Kelamin</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Kelas</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tingkatan</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No BPJS</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jumlah Riwayat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500 text-xs lg:text-sm">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredSiswa.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500 text-xs lg:text-sm">
                      Tidak ada data santri dengan riwayat kesehatan
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
                            onClick={() => router.push(`/kesehatan/siswa/${item.siswa.id}`)}
                            className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                          >
                            {item.siswa.nama}
                          </button>
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.jenisKelamin === "LakiLaki"
                            ? "Laki-Laki"
                            : item.siswa.jenisKelamin === "Perempuan"
                            ? "Perempuan"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.kelas?.replace(/_/g, " ") || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                          {item.noBpjs || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs">
                            {item.jumlahRiwayat}
                          </Badge>
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
            <div className="mt-4 px-4 sm:px-0 flex flex-col lg:flex-row items-center justify-between gap-3">
              <p className="text-xs lg:text-sm text-zinc-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                {pagination.total} data
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

      {/* Riwayat Kesehatan Terbaru */}
      <Card className="border-zinc-200 bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Riwayat Kesehatan Terbaru
          </CardTitle>
          <p className="text-xs text-zinc-500">
            10 catatan terakhir yang tercatat
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          {kesehatanTerbaru.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs lg:text-sm px-6">
              Belum ada data kesehatan
            </div>
          ) : (
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Nama</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Kelas</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tingkatan</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Riwayat Sakit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kesehatanTerbaru.map((kesehatan, index) => (
                  <TableRow key={kesehatan.id} className="hover:bg-zinc-50">
                    <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">{index + 1}</TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {formatTanggal(kesehatan.tanggal)}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                      {kesehatan.siswa.nama}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {kesehatan.siswa.kelas?.replace(/_/g, " ") || "-"}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                      {kesehatan.siswa.tingkatan || "-"}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs lg:text-sm max-w-[200px] truncate">
                      {kesehatan.riwayatSakit}
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
