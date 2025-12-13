"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, FileText, Trash2, Search, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
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

interface SiswaWithPelanggaran {
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    jenisKelamin?: string;
  };
  jumlahPelanggaran: number;
}

interface Statistik {
  stats: {
    RINGAN: number;
    SEDANG: number;
    BERAT: number;
    SP1: number;
    SP2: number;
    SP3: number;
  };
  total: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function KelolaPelanggaranPage() {
  const router = useRouter();
  const [siswaList, setSiswaList] = useState<SiswaWithPelanggaran[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    stats: { RINGAN: 0, SEDANG: 0, BERAT: 0, SP1: 0, SP2: 0, SP3: 0 },
    total: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pelanggaranTerbaru, setPelanggaranTerbaru] = useState<any[]>([]);

  // Filter states
  const [filterTingkatan, setFilterTingkatan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");

  // Download dialog state
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadMode, setDownloadMode] = useState<"semua" | "per_santri">("semua");
  const [selectedSiswaForDownload, setSelectedSiswaForDownload] = useState<any>(null);
  const [siswaSearchQuery, setSiswaSearchQuery] = useState("");
  const [siswaSearchResults, setSiswaSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchPelanggaranTerbaru();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const [siswaResponse, statistikResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/by-siswa?page=${page}&limit=20`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/statistik`, {
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
      toast.error("Gagal memuat data pelanggaran");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPelanggaranTerbaru = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/terbaru?limit=10`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setPelanggaranTerbaru(data);
      }
    } catch (error) {
      console.error("Error fetching pelanggaran terbaru:", error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <AlertTriangle className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <AlertTriangle className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4" />
            Manajemen Pelanggaran
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Kelola Pelanggaran
          </h1>
          <p className="max-w-2xl text-lg text-emerald-50">
            Kelola data pelanggaran dan sanksi santri / santriwati dengan mudah
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoading ? "..." : statistik.total}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Semua pelanggaran
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Ringan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {isLoading ? "..." : statistik.stats.RINGAN}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Pelanggaran ringan
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Sedang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {isLoading ? "..." : statistik.stats.SEDANG}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Pelanggaran sedang
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Berat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {isLoading ? "..." : statistik.stats.BERAT}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Pelanggaran berat
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              SP1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {isLoading ? "..." : statistik.stats.SP1}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Surat Peringatan 1
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              SP2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-700">
              {isLoading ? "..." : statistik.stats.SP2}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Surat Peringatan 2
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              SP3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700">
              {isLoading ? "..." : statistik.stats.SP3}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Surat Peringatan 3
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Daftar Santri & Jumlah Pelanggaran
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Total {pagination.total} santri dengan pelanggaran
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDownloadDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Riwayat
              </Button>
              <Button
                onClick={() => router.push("/pelanggaran/tambah")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data Pelanggaran
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
                  <TableHead className="text-center font-semibold text-emerald-700">Jumlah Pelanggaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredSiswa.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                      Tidak ada data santri dengan pelanggaran
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSiswa.map((item, index) => (
                    <TableRow key={item.siswa.id} className="hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-700">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => router.push(`/pelanggaran/siswa/${item.siswa.id}`)}
                          className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline text-left"
                        >
                          {item.siswa.nama}
                        </button>
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {item.siswa.jenisKelamin === "LakiLaki" 
                          ? "Laki-Laki" 
                          : item.siswa.jenisKelamin === "Perempuan" 
                          ? "Perempuan" 
                          : "-"}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {item.siswa.kelas ? item.siswa.kelas.replace(/_/g, " ") : "-"}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {item.siswa.tingkatan || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          {item.jumlahPelanggaran}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
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

      {/* Riwayat Pelanggaran Terbaru */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Riwayat Pelanggaran Terbaru
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                10 pelanggaran terakhir yang tercatat
              </p>
            </div>
            <Button
              onClick={() => router.push("/pelanggaran/riwayat")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Lihat Semua Riwayat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Jenis Sanksi</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pelanggaranTerbaru.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-zinc-500 py-8">
                      Belum ada data pelanggaran
                    </TableCell>
                  </TableRow>
                ) : (
                  pelanggaranTerbaru.map((pelanggaran, index) => (
                    <TableRow key={pelanggaran.id} className="hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-900">{index + 1}</TableCell>
                      <TableCell className="text-zinc-700">
                        {formatTanggal(pelanggaran.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900">
                        {pelanggaran.siswa.nama}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {pelanggaran.siswa.kelas?.replace(/_/g, " ") || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-700">
                        {pelanggaran.siswa.tingkatan || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            pelanggaran.sanksi === "RINGAN"
                              ? "border-blue-500 text-blue-700 bg-blue-50"
                              : pelanggaran.sanksi === "SEDANG"
                              ? "border-amber-500 text-amber-700 bg-amber-50"
                              : pelanggaran.sanksi === "BERAT"
                              ? "border-red-500 text-red-700 bg-red-50"
                              : pelanggaran.sanksi === "SP1"
                              ? "border-purple-500 text-purple-700 bg-purple-50"
                              : pelanggaran.sanksi === "SP2"
                              ? "border-pink-500 text-pink-700 bg-pink-50"
                              : "border-rose-500 text-rose-700 bg-rose-50"
                          }
                        >
                          {pelanggaran.sanksi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-700 max-w-md truncate">
                        {pelanggaran.keterangan}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Unduh Riwayat Pelanggaran */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unduh Riwayat Pelanggaran</DialogTitle>
            <DialogDescription>
              Pilih mode untuk mengunduh riwayat pelanggaran
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
                  setSiswaSearchResults([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Riwayat Pelanggaran</SelectItem>
                  <SelectItem value="per_santri">Per Santri / Santriwati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {downloadMode === "per_santri" && (
              <div className="space-y-2">
                <Label>Cari Santri / Santriwati</Label>
                <div className="relative">
                  <Input
                    placeholder="Ketik nama santri / santriwati..."
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
                    `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/export?${params.toString()}`,
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
                  let filename = "Riwayat_Pelanggaran";
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
                  toast.success("Riwayat pelanggaran berhasil diunduh");
                } catch (error) {
                  console.error("Error downloading:", error);
                  toast.error("Gagal mengunduh riwayat pelanggaran");
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
    </div>
  );
}
