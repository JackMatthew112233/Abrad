"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, FileText, Trash2, ChevronLeft, ChevronRight, Pencil, User, GraduationCap, BookOpen } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
  jenisKelamin?: string;
}

interface Pelanggaran {
  id: string;
  sanksi: string;
  keterangan: string;
  evidence?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatistikPelanggaran {
  RINGAN: number;
  SEDANG: number;
  BERAT: number;
  SP1: number;
  SP2: number;
  SP3: number;
}

export default function DetailPelanggaranSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const siswaId = params.id as string;

  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [statistik, setStatistik] = useState<StatistikPelanggaran>({
    RINGAN: 0,
    SEDANG: 0,
    BERAT: 0,
    SP1: 0,
    SP2: 0,
    SP3: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPelanggaranId, setSelectedPelanggaranId] = useState<string | null>(null);
  const [showBuktiDialog, setShowBuktiDialog] = useState(false);
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string>("");

  useEffect(() => {
    if (siswaId) {
      fetchData(1);
    }
  }, [siswaId]);

  const fetchData = async (page: number) => {
    try {
      setIsLoading(true);
      
      // Fetch siswa data
      const siswaResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/${siswaId}`,
        { credentials: "include" }
      );

      // Fetch pelanggaran data
      const pelanggaranResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran?siswaId=${siswaId}&page=${page}&limit=10`,
        { credentials: "include" }
      );

      if (siswaResponse.ok && pelanggaranResponse.ok) {
        const siswaData = await siswaResponse.json();
        const pelanggaranData = await pelanggaranResponse.json();

        setSiswa(siswaData);
        setPelanggaranList(pelanggaranData.data || []);
        setPagination(pelanggaranData.pagination);

        // Calculate statistik from all pelanggaran data
        const allPelanggaranResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran?siswaId=${siswaId}&limit=1000`,
          { credentials: "include" }
        );
        
        if (allPelanggaranResponse.ok) {
          const allData = await allPelanggaranResponse.json();
          const stats: StatistikPelanggaran = {
            RINGAN: 0,
            SEDANG: 0,
            BERAT: 0,
            SP1: 0,
            SP2: 0,
            SP3: 0,
          };
          
          allData.data.forEach((item: Pelanggaran) => {
            if (stats[item.sanksi as keyof StatistikPelanggaran] !== undefined) {
              stats[item.sanksi as keyof StatistikPelanggaran]++;
            }
          });
          
          setStatistik(stats);
        }
      } else {
        toast.error("Gagal memuat data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPelanggaranId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPelanggaranId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/${selectedPelanggaranId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Pelanggaran berhasil dihapus");
        setShowDeleteDialog(false);
        setSelectedPelanggaranId(null);
        
        // Check if current page becomes empty after delete
        if (pelanggaranList.length === 1 && pagination.page > 1) {
          fetchData(pagination.page - 1);
        } else {
          fetchData(pagination.page);
        }
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleViewBukti = (buktiUrl: string) => {
    setSelectedBuktiUrl(buktiUrl);
    setShowBuktiDialog(true);
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const getSanksiVariant = (sanksi: string) => {
    const variants: Record<string, string> = {
      RINGAN: "bg-blue-50 text-blue-700 border-blue-200",
      SEDANG: "bg-amber-50 text-amber-700 border-amber-200",
      BERAT: "bg-red-50 text-red-700 border-red-200",
      SP1: "bg-purple-50 text-purple-700 border-purple-200",
      SP2: "bg-pink-50 text-pink-700 border-pink-200",
      SP3: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return variants[sanksi] || "";
  };

  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (isLoading && !siswa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Memuat data...</p>
      </div>
    );
  }

  if (!siswa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Data tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Back Button - Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => router.push("/pelanggaran")}
          className="w-full text-xs h-9"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Kembali
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/pelanggaran")}
          className="hidden lg:flex"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-emerald-700">
            Detail Pelanggaran
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Riwayat pelanggaran {siswa.nama}
          </p>
        </div>
      </div>

      {/* Riwayat Pelanggaran Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
                Riwayat Pelanggaran
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-1">
                Daftar semua pelanggaran yang pernah dilakukan
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-500 mb-1">Total Pelanggaran</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">{pagination.total}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Sanksi</TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Keterangan</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Bukti</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-xs lg:text-sm">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : pelanggaranList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-xs lg:text-sm">
                      Tidak ada data pelanggaran
                    </TableCell>
                  </TableRow>
                ) : (
                  pelanggaranList.map((pelanggaran, index) => (
                    <TableRow key={pelanggaran.id} className="hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="text-zinc-700 text-xs lg:text-sm whitespace-nowrap">
                        {formatTanggal(pelanggaran.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getSanksiVariant(pelanggaran.sanksi)} font-medium text-xs`}
                        >
                          {pelanggaran.sanksi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-700 text-xs lg:text-sm max-w-[200px] truncate">
                        {pelanggaran.keterangan}
                      </TableCell>
                      <TableCell className="text-center">
                        {pelanggaran.evidence ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBukti(pelanggaran.evidence!)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0"
                          >
                            <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/pelanggaran/edit/${pelanggaran.id}`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Pencil className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(pelanggaran.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pelanggaran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bukti Pelanggaran Dialog */}
      <Dialog open={showBuktiDialog} onOpenChange={setShowBuktiDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bukti Pelanggaran</DialogTitle>
            <DialogDescription>
              Preview bukti pelanggaran
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedBuktiUrl && (
              <img
                src={selectedBuktiUrl}
                alt="Bukti Pelanggaran"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<p class="text-center text-zinc-500">Tidak dapat memuat gambar</p>';
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.open(selectedBuktiUrl, "_blank")}
            >
              Buka di Tab Baru
            </Button>
            <Button onClick={() => setShowBuktiDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
