"use client";

import { useState, useEffect } from "react";
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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (page: number = 1) => {
    try {
      setIsLoading(true);

      const [siswaRes, statsRes, terbarRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/nilai/by-siswa?page=${page}&limit=20`,
          { credentials: "include" }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai/statistik`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai/terbaru`, {
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

  const filteredSiswa = siswaList.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.siswa.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTingkatan =
      filterTingkatan === "Semua Tingkatan" ||
      item.siswa.tingkatan === filterTingkatan;
    const matchKelas =
      filterKelas === "Semua Kelas" || item.siswa.kelas === filterKelas;
    return matchSearch && matchTingkatan && matchKelas;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <BookOpen className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <Award className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <BookOpen className="h-4 w-4" />
            Manajemen Nilai
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Kelola Nilai</h1>
          <p className="max-w-2xl text-lg text-emerald-50">
            Kelola data nilai dan prestasi akademik santri / santriwati
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Nilai
            </CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.totalNilai}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Catatan nilai tercatat
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Siswa dengan Nilai
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.siswaWithNilai}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Dari {statistik.totalSiswa} siswa
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Rata-rata Keseluruhan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.rataRataKeseluruhan.toFixed(1)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Nilai rata-rata</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Persentase
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading
                ? "..."
                : statistik.totalSiswa > 0
                ? Math.round(
                    (statistik.siswaWithNilai / statistik.totalSiswa) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-zinc-500 mt-1">Siswa memiliki nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Santri */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Daftar Santri & Data Nilai
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Total {pagination.total} santri dengan data nilai
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/nilai/mata-pelajaran")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Kelola Mata Pelajaran
              </Button>
              <Button
                onClick={() => router.push("/nilai/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data Nilai
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
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
                <SelectValue placeholder="Pilih Tingkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Tingkatan">
                  Semua Tingkatan
                </SelectItem>
                <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                <SelectItem value="ULYA">ULYA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua Kelas">Semua Kelas</SelectItem>
                <SelectItem value="VII_Putra">VII Putra</SelectItem>
                <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                <SelectItem value="IX_Putra">IX Putra</SelectItem>
                <SelectItem value="X_Putra">X Putra</SelectItem>
                <SelectItem value="XI_Putra">XI Putra</SelectItem>
                <SelectItem value="XII_Putra">XII Putra</SelectItem>
                <SelectItem value="VII_Putri">VII Putri</SelectItem>
                <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                <SelectItem value="IX_Putri">IX Putri</SelectItem>
                <SelectItem value="X_Putri">X Putri</SelectItem>
                <SelectItem value="XI_Putri">XI Putri</SelectItem>
                <SelectItem value="XII_Putri">XII Putri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Jenis Kelamin
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Kelas
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Tingkatan
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">
                    Jumlah Nilai
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">
                    Rata-rata
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredSiswa.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8"
                    >
                      Tidak ada data yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSiswa.map((item, index) => {
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    return (
                      <TableRow key={item.siswa.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() =>
                              router.push(`/nilai/siswa/${item.siswa.id}`)
                            }
                            className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                          >
                            {item.siswa.nama}
                          </button>
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {item.siswa.jenisKelamin === "LakiLaki"
                            ? "Laki-laki"
                            : "Perempuan"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {item.siswa.kelas?.replace("_", " ") || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {item.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="border-emerald-500 text-emerald-700 bg-emerald-50"
                          >
                            {item.jumlahNilai}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-emerald-700">
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
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
                        (page >= pagination.page - 1 &&
                          page <= pagination.page + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-zinc-400">...</span>
                        )}
                        <Button
                          variant={
                            page === pagination.page ? "default" : "outline"
                          }
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

      {/* Nilai Terbaru */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Nilai Terbaru
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                10 catatan terakhir yang tercatat
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Mata Pelajaran
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Jenis
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">
                    Nilai
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700">
                    Semester
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : nilaiTerbaru.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-zinc-500 py-8"
                    >
                      Belum ada nilai tercatat
                    </TableCell>
                  </TableRow>
                ) : (
                  nilaiTerbaru.map((nilai, index) => (
                    <TableRow key={nilai.id} className="hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-900">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {formatTanggal(nilai.tanggal)}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {nilai.siswa.nama}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {nilai.mataPelajaran}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-500">
                          {nilai.jenisNilai}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-emerald-700">
                          {nilai.nilai}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {nilai.semester}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
