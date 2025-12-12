"use client";

import { useState, useEffect } from "react";
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
}

interface Statistik {
  totalSiswa: number;
  siswaLakiLaki: number;
  siswaPerempuan: number;
  siswaAktif: number;
  siswaNonAktif: number;
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const [siswaResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa?page=${page}&limit=20`, {
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

  const filteredSiswa = siswaList.filter((siswa) =>
    siswa.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.nik?.includes(searchQuery)
  );

  const totalSiswa = stats.totalSiswa;
  const siswaLakiLaki = stats.siswaLakiLaki;
  const siswaPerempuan = stats.siswaPerempuan;
  const siswaAktif = stats.siswaAktif;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-4 right-24 opacity-15">
          <BookOpen className="h-32 w-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Users className="h-4 w-4" />
            Data Santri / Santriwati
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Santri / Santriwati
          </h1>
          <p className="max-w-2xl text-lg text-emerald-50">
            Kelola data biodata santri / santriwati pesantren dengan mudah
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Santri / Santriwati
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{totalSiswa}</div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-emerald-600">
                <span className="font-semibold">
                  {siswaLakiLaki} Santri • {siswaPerempuan} Santriwati
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Total keseluruhan santri aktif dan non-aktif
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santri
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{siswaLakiLaki}</div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? ((siswaLakiLaki / totalSiswa) * 100).toFixed(1) : "0"}% dari total
              </p>
              <p className="text-xs text-zinc-500">
                Santri laki-laki
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santriwati
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{siswaPerempuan}</div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? ((siswaPerempuan / totalSiswa) * 100).toFixed(1) : "0"}% dari total
              </p>
              <p className="text-xs text-zinc-500">
                Santri perempuan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Santri Aktif
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-700">{siswaAktif}</div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                {totalSiswa > 0 ? ((siswaAktif / totalSiswa) * 100).toFixed(1) : "0"}% tingkat keaktifan
              </p>
              <p className="text-xs text-zinc-500">
                {stats.siswaNonAktif} cuti/non-aktif
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-emerald-700">
            Daftar Santri / Santriwati
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDownloadDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Biodata Santri / Santriwati
            </Button>
            <Button
              onClick={() => router.push("/siswa/tambah")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Biodata
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Cari nama atau NIK santri / santriwati..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700">NIS</TableHead>
                    <TableHead className="font-semibold text-emerald-700">NIK</TableHead>
                    <TableHead className="font-semibold text-emerald-700">NISN</TableHead>
                    <TableHead className="font-semibold text-emerald-700">NPSN</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Jenis Kelamin</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tempat, Tanggal Lahir</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Sekolah Asal</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Alamat</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kode Pos</TableHead>
                    <TableHead className="font-semibold text-emerald-700">No. KK</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswa.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center text-zinc-500">
                        {searchQuery ? "Tidak ada data yang sesuai pencarian" : "Belum ada data santri / santriwati"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSiswa.map((siswa) => (
                      <TableRow key={siswa.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => router.push(`/siswa/${siswa.id}`)}
                            className="text-emerald-600 hover:text-emerald-700 hover:underline text-left"
                          >
                            {siswa.nama || "-"}
                          </button>
                        </TableCell>
                        <TableCell>{siswa.nis || "-"}</TableCell>
                        <TableCell>{siswa.nik || "-"}</TableCell>
                        <TableCell>{siswa.nisn || "-"}</TableCell>
                        <TableCell>{siswa.npsn || "-"}</TableCell>
                        <TableCell>{siswa.tingkatan || "-"}</TableCell>
                        <TableCell>{siswa.kelas ? siswa.kelas.replace("_", " ") : "-"}</TableCell>
                        <TableCell>
                          {siswa.jenisKelamin ? (
                            siswa.jenisKelamin === "LakiLaki" ? "Laki-laki" : "Perempuan"
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
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
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={siswa.sekolahAsal || "-"}>
                            {siswa.sekolahAsal || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate" title={siswa.alamat || "-"}>
                            {siswa.alamat || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{siswa.kodePos || "-"}</TableCell>
                        <TableCell>{siswa.noKartuKeluarga || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              siswa.isAktif
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-zinc-300 bg-zinc-50 text-zinc-700"
                            }
                          >
                            {siswa.isAktif ? "Aktif" : "Non-Aktif"}
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
