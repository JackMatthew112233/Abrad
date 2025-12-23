"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Nilai {
  id: string;
  mataPelajaran: string;
  jenisNilai: string;
  nilai: number;
  semester: string;
  tahunAjaran: string;
  tanggal: string;
  createdAt: string;
}

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DetailNilaiSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const siswaId = params.id as string;

  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("Ganjil");
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState("2024/2025");

  // Ekstrakurikuler State
  const [ekstraList, setEkstraList] = useState<any[]>([]);
  const [siswaEkstraList, setSiswaEkstraList] = useState<any[]>([]);
  const [isEkstraDialogOpen, setIsEkstraDialogOpen] = useState(false);
  const [selectedEkstra, setSelectedEkstra] = useState<any>(null);
  const [ekstraFormData, setEkstraFormData] = useState({
    ekstrakurikulerId: "",
    nilai: "",
    semester: "Ganjil",
    tahunAjaran: "2024/2025",
  });

  useEffect(() => {
    fetchData();
    fetchEkstraData();
  }, [siswaId]);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai?siswaId=${siswaId}&page=${page}&limit=10`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setNilaiList(data.data);
        setPagination(data.pagination);

        // Get siswa info from first record
        if (data.data.length > 0 && data.data[0].siswa) {
          setSiswa(data.data[0].siswa);
        }
      } else {
        toast.error("Gagal memuat data nilai");
      }
    } catch (error) {
      toast.error("Gagal memuat data nilai");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEkstraData = async () => {
    try {
      // Fetch master data ekstrakurikuler
      const resEkstra = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler`, {
        credentials: "include",
      });
      if (resEkstra.ok) {
        setEkstraList(await resEkstra.json());
      }

      // Fetch siswa nilai ekstrakurikuler
      const resSiswaEkstra = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai-ekstrakurikuler/siswa/${siswaId}`,
        { credentials: "include" }
      );
      if (resSiswaEkstra.ok) {
        setSiswaEkstraList(await resSiswaEkstra.json());
      }
    } catch (error) {
      console.error("Gagal memuat data ekstrakurikuler");
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

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai/${selectedId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Data nilai berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchData(pagination.page);
      } else {
        toast.error("Gagal menghapus data nilai");
      }
    } catch (error) {
      toast.error("Gagal menghapus data nilai");
    }
  };

  const handleDownloadRaport = () => {
    setDownloadDialogOpen(false);
    router.push(`/nilai/raport/preview/${siswaId}?semester=${selectedSemester}&tahunAjaran=${selectedTahunAjaran}`);
  };

  const openDownloadDialog = () => {
    const latestNilai =
      nilaiList.find((n) => n.jenisNilai === "UAS") || nilaiList[0];
    setSelectedSemester(latestNilai?.semester || "Ganjil");
    setSelectedTahunAjaran(latestNilai?.tahunAjaran || "2024/2025");
    setDownloadDialogOpen(true);
  };

  // Ekstrakurikuler Handlers
  const handleOpenEkstraDialog = (item?: any) => {
    if (item) {
      setSelectedEkstra(item);
      setEkstraFormData({
        ekstrakurikulerId: item.ekstrakurikulerId,
        nilai: item.nilai,
        semester: item.semester,
        tahunAjaran: item.tahunAjaran,
      });
    } else {
      setSelectedEkstra(null);
      setEkstraFormData({
        ekstrakurikulerId: "",
        nilai: "",
        semester: "Ganjil",
        tahunAjaran: "2024/2025",
      });
    }
    setIsEkstraDialogOpen(true);
  };

  const handleSaveEkstra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai-ekstrakurikuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siswaId,
          ...ekstraFormData,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan nilai ekstrakurikuler");

      toast.success("Nilai ekstrakurikuler berhasil disimpan");
      setIsEkstraDialogOpen(false);
      fetchEkstraData();
    } catch (error) {
      toast.error("Gagal menyimpan nilai ekstrakurikuler");
    }
  };

  const handleDeleteEkstra = async (id: string) => {
    if (!confirm("Hapus nilai ini?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai-ekstrakurikuler/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        toast.success("Berhasil dihapus");
        fetchEkstraData();
      }
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  }

  if (isLoading && !siswa) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Memuat data...</p>
      </div>
    );
  }

  // Calculate average
  const rataRata = nilaiList.length > 0
    ? nilaiList.reduce((sum, n) => sum + n.nilai, 0) / nilaiList.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/nilai")}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Detail Nilai Santri / Santriwati
          </h1>
          <p className="text-zinc-600">
            {siswa?.nama} • {siswa?.tingkatan} • {siswa?.kelas?.replace(/_/g, " ")}
          </p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={openDownloadDialog}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh Raport
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Total Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {pagination.total}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Catatan nilai tercatat</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Rata-rata Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {rataRata.toFixed(1)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Dari semua mata pelajaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Nilai Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Daftar Nilai
            </CardTitle>
            <div className="text-sm font-medium text-zinc-700">
              Total: {pagination.total} nilai
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Mata Pelajaran</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Jenis</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">Nilai</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Semester</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tahun Ajaran</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : nilaiList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                      Belum ada nilai tercatat
                    </TableCell>
                  </TableRow>
                ) : (
                  nilaiList.map((nilai, index) => {
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    return (
                      <TableRow key={nilai.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {formatTanggal(nilai.tanggal)}
                        </TableCell>
                        <TableCell className="text-zinc-700 font-medium">
                          {nilai.mataPelajaran}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-500">
                            {nilai.jenisNilai}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg text-emerald-700">
                            {nilai.nilai}
                          </span>
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {nilai.semester}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {nilai.tahunAjaran}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/nilai/edit/${nilai.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedId(nilai.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && nilaiList.length > 0 && (
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
                          className={`h-8 w-8 p-0 ${page === pagination.page
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

      {/* Nilai Ekstrakurikuler Table */}
      <Card className="border-zinc-200 bg-white mt-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Nilai Ekstrakurikuler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50">
                <TableHead className="font-semibold text-emerald-700">Kegiatan</TableHead>
                <TableHead className="font-semibold text-emerald-700">Nilai</TableHead>
                <TableHead className="font-semibold text-emerald-700">Semester</TableHead>
                <TableHead className="font-semibold text-emerald-700">Tahun Ajaran</TableHead>
                <TableHead className="text-center font-semibold text-emerald-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {siswaEkstraList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-zinc-500">
                    Belum ada data ekstrakurikuler
                  </TableCell>
                </TableRow>
              ) : (
                siswaEkstraList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.ekstrakurikuler?.nama}</TableCell>
                    <TableCell>{item.nilai}</TableCell>
                    <TableCell>{item.semester}</TableCell>
                    <TableCell>{item.tahunAjaran}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEkstraDialog(item)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEkstra(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Nilai</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data nilai ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Raport Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unduh Raport</DialogTitle>
            <DialogDescription>
              Pilih periode semester dan tahun ajaran untuk raport yang akan diunduh.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tahunAjaran" className="text-right whitespace-nowrap">
                Tahun Ajaran
              </Label>
              <Input
                id="tahunAjaran"
                value={selectedTahunAjaran}
                onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                className="col-span-3"
                placeholder="2024/2025"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleDownloadRaport}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Unduh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ekstrakurikuler Input Dialog */}
      <Dialog open={isEkstraDialogOpen} onOpenChange={setIsEkstraDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEkstra ? "Edit Nilai Ekstra" : "Tambah Nilai Ekstra"}</DialogTitle>
            <DialogDescription>Input nilai kegiatan ekstrakurikuler siswa</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEkstra}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Kegiatan</Label>
                <Select
                  value={ekstraFormData.ekstrakurikulerId}
                  onValueChange={(val) => setEkstraFormData({ ...ekstraFormData, ekstrakurikulerId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {ekstraList.map((ek) => (
                      <SelectItem key={ek.id} value={ek.id}>{ek.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nilai</Label>
                <Input
                  value={ekstraFormData.nilai}
                  onChange={(e) => setEkstraFormData({ ...ekstraFormData, nilai: e.target.value })}
                  placeholder="Contoh: A, B, Baik, Sangat Baik"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Semester</Label>
                  <Select
                    value={ekstraFormData.semester}
                    onValueChange={(val) => setEkstraFormData({ ...ekstraFormData, semester: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ganjil">Ganjil</SelectItem>
                      <SelectItem value="Genap">Genap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tahun Ajaran</Label>
                  <Input
                    value={ekstraFormData.tahunAjaran}
                    onChange={(e) => setEkstraFormData({ ...ekstraFormData, tahunAjaran: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEkstraDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
