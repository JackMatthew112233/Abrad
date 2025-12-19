"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  Edit,
  User,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

interface Anggota {
  id: string;
  nama: string;
  alamat: string | null;
  noTelp: string | null;
  createdAt: string;
  updatedAt: string;
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

interface Pemasukan {
  id: string;
  jenis: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  bukti: string | null;
}

interface Pengeluaran {
  id: string;
  jenis: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  bukti: string | null;
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

const formatJenisPemasukan = (jenis: string) => {
  const map: Record<string, string> = {
    SIMPANAN_POKOK: "Simpanan Pokok",
    SIMPANAN_WAJIB: "Simpanan Wajib",
    SIMPANAN_SUKARELA: "Simpanan Sukarela",
    PENYERTAAN_MODAL: "Penyertaan Modal",
  };
  return map[jenis] || jenis;
};

const formatJenisPengeluaran = (jenis: string) => {
  const map: Record<string, string> = {
    BELANJA: "Belanja",
    PINJAMAN: "Pinjaman",
  };
  return map[jenis] || jenis;
};

export default function DetailAnggotaKoperasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [pemasukanList, setPemasukanList] = useState<Pemasukan[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [pemasukanPage, setPemasukanPage] = useState(1);
  const [pemasukanPagination, setPemasukanPagination] = useState<PaginationInfo | null>(null);
  const [pengeluaranPage, setPengeluaranPage] = useState(1);
  const [pengeluaranPagination, setPengeluaranPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    if (id) {
      fetchAnggota();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPemasukan(pemasukanPage);
    }
  }, [id, pemasukanPage]);

  useEffect(() => {
    if (id) {
      fetchPengeluaran(pengeluaranPage);
    }
  }, [id, pengeluaranPage]);

  const fetchAnggota = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setAnggota(data);
      } else {
        toast.error("Anggota koperasi tidak ditemukan");
        router.push("/koperasi");
      }
    } catch (error) {
      console.error("Error fetching anggota:", error);
      toast.error("Gagal memuat data anggota");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPemasukan = async (page: number = 1) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}/pemasukan?page=${page}&limit=10`,
        { credentials: "include" }
      );
      if (response.ok) {
        const result = await response.json();
        setPemasukanList(result.data);
        setPemasukanPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching pemasukan:", error);
    }
  };

  const fetchPengeluaran = async (page: number = 1) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}/pengeluaran?page=${page}&limit=10`,
        { credentials: "include" }
      );
      if (response.ok) {
        const result = await response.json();
        setPengeluaranList(result.data);
        setPengeluaranPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching pengeluaran:", error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Anggota koperasi berhasil dihapus!");
        router.push("/koperasi");
      } else {
        toast.error("Gagal menghapus anggota koperasi");
      }
    } catch (error) {
      toast.error("Gagal menghapus anggota koperasi");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!anggota) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Back Button - Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full text-xs h-9"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Kembali
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hidden lg:flex text-zinc-600 hover:text-zinc-900 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg lg:text-xl flex-shrink-0">
            {anggota.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-emerald-700">
              {anggota.nama}
            </h1>
            {anggota.noTelp && (
              <p className="text-xs lg:text-sm text-zinc-600">{anggota.noTelp}</p>
            )}
            {anggota.alamat && (
              <p className="text-xs lg:text-sm text-zinc-500">{anggota.alamat}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/koperasi/anggota/${id}/edit`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
          >
            <Edit className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
            Edit Biodata
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="text-xs lg:text-sm h-8 lg:h-9"
          >
            <Trash2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
            Hapus Anggota
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <p className="text-xs text-zinc-600">Total Pemasukan</p>
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
            </div>
            <p className="text-base lg:text-xl font-bold text-emerald-700">
              {formatRupiah(anggota.totalPemasukan)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <p className="text-xs text-zinc-600">Total Pengeluaran</p>
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
            </div>
            <p className="text-base lg:text-xl font-bold text-red-600">
              {formatRupiah(anggota.totalPengeluaran)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <p className="text-xs text-zinc-600">Saldo</p>
              <Wallet className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
            </div>
            <p className="text-base lg:text-xl font-bold text-emerald-700">
              {formatRupiah(anggota.saldo)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <p className="text-xs text-zinc-600">Terdaftar</p>
              <User className="h-3 w-3 lg:h-4 lg:w-4 text-zinc-600" />
            </div>
            <p className="text-xs lg:text-sm font-medium text-zinc-700">
              {new Date(anggota.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Pemasukan */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-700" />
            <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
              Riwayat Pemasukan
            </CardTitle>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Total {pemasukanPagination?.total || 0} pemasukan
          </p>
        </CardHeader>
        <CardContent className="p-0 lg:p-6 lg:pt-0">
          {pemasukanList.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs lg:text-sm px-4">
              Belum ada riwayat pemasukan
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jenis</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jumlah</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Keterangan</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Bukti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pemasukanList.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                          {(pemasukanPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                          {formatJenisPemasukan(item.jenis)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                          {formatRupiah(item.jumlah)}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-xs lg:text-sm max-w-[150px] truncate">
                          {item.keterangan || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.bukti ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.bukti!, "_blank")}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 w-7 p-0"
                            >
                              <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                          ) : (
                            <span className="text-zinc-400 text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Pemasukan */}
              {pemasukanPagination && pemasukanPagination.totalPages > 1 && (
                <div className="mt-4 px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-between gap-3 border-t pt-4">
                  <p className="text-xs text-zinc-500">
                    Menampilkan {(pemasukanPage - 1) * 10 + 1} -{" "}
                    {Math.min(pemasukanPage * 10, pemasukanPagination.total)} dari{" "}
                    {pemasukanPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPemasukanPage(pemasukanPage - 1)}
                      disabled={pemasukanPage === 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pemasukanPagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === pemasukanPagination.totalPages ||
                            (page >= pemasukanPage - 1 && page <= pemasukanPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-1 text-zinc-400 text-xs">...</span>
                            )}
                            <Button
                              variant={page === pemasukanPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPemasukanPage(page)}
                              className={`h-8 w-8 p-0 text-xs ${
                                page === pemasukanPage
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
                      onClick={() => setPemasukanPage(pemasukanPage + 1)}
                      disabled={pemasukanPage === pemasukanPagination.totalPages}
                      className="h-8 text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Riwayat Pengeluaran */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
            <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
              Riwayat Pengeluaran
            </CardTitle>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Total {pengeluaranPagination?.total || 0} pengeluaran
          </p>
        </CardHeader>
        <CardContent className="p-0 lg:p-6 lg:pt-0">
          {pengeluaranList.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs lg:text-sm px-4">
              Belum ada riwayat pengeluaran
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jenis</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Jumlah</TableHead>
                      <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Keterangan</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">Bukti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pengeluaranList.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                          {(pengeluaranPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                          {formatJenisPengeluaran(item.jenis)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 text-xs lg:text-sm whitespace-nowrap">
                          {formatRupiah(item.jumlah)}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-xs lg:text-sm max-w-[150px] truncate">
                          {item.keterangan || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.bukti ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.bukti!, "_blank")}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 w-7 p-0"
                            >
                              <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                          ) : (
                            <span className="text-zinc-400 text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Pengeluaran */}
              {pengeluaranPagination && pengeluaranPagination.totalPages > 1 && (
                <div className="mt-4 px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-between gap-3 border-t pt-4">
                  <p className="text-xs text-zinc-500">
                    Menampilkan {(pengeluaranPage - 1) * 10 + 1} -{" "}
                    {Math.min(pengeluaranPage * 10, pengeluaranPagination.total)} dari{" "}
                    {pengeluaranPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPengeluaranPage(pengeluaranPage - 1)}
                      disabled={pengeluaranPage === 1}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pengeluaranPagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === pengeluaranPagination.totalPages ||
                            (page >= pengeluaranPage - 1 && page <= pengeluaranPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-1 text-zinc-400 text-xs">...</span>
                            )}
                            <Button
                              variant={page === pengeluaranPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPengeluaranPage(page)}
                              className={`h-8 w-8 p-0 text-xs ${
                                page === pengeluaranPage
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
                      onClick={() => setPengeluaranPage(pengeluaranPage + 1)}
                      disabled={pengeluaranPage === pengeluaranPagination.totalPages}
                      className="h-8 text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base lg:text-lg">Hapus Anggota Koperasi?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs lg:text-sm">
              Apakah Anda yakin ingin menghapus anggota{" "}
              <strong>{anggota.nama}</strong>? Semua data pemasukan dan
              pengeluaran anggota ini juga akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs lg:text-sm">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-xs lg:text-sm"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
