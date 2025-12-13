"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";

interface Pembayaran {
  id: string;
  siswa: {
    id: string;
    nama: string;
    kelas: string | null;
    tingkatan: string | null;
    jenisKelamin: string;
  };
  totalPembayaranInfaq: number;
  totalPembayaranLaundry: number;
  buktiPembayaran: string;
  tanggalPembayaran: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RiwayatPembayaranPage() {
  const router = useRouter();
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
  const [editFormData, setEditFormData] = useState({
    totalPembayaranInfaq: "",
    totalPembayaranLaundry: "",
    tanggalPembayaran: "",
  });
  const [newBukti, setNewBukti] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData(pagination.page);
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran-all?page=${page}&limit=20`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setPembayaranList(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleEditPembayaran = (pembayaran: Pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setEditFormData({
      totalPembayaranInfaq: pembayaran.totalPembayaranInfaq.toString(),
      totalPembayaranLaundry: pembayaran.totalPembayaranLaundry.toString(),
      tanggalPembayaran: new Date(pembayaran.tanggalPembayaran)
        .toISOString()
        .split("T")[0],
    });
    setNewBukti(null);
    setShowEditDialog(true);
  };

  const handleUpdatePembayaran = async () => {
    if (!selectedPembayaran) return;

    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("totalPembayaranInfaq", editFormData.totalPembayaranInfaq);
      formDataToSend.append("totalPembayaranLaundry", editFormData.totalPembayaranLaundry);
      formDataToSend.append("tanggalPembayaran", editFormData.tanggalPembayaran);

      if (newBukti) {
        formDataToSend.append("buktiPembayaran", newBukti);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran/${selectedPembayaran.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Data pembayaran berhasil diperbarui!");
        setShowEditDialog(false);
        setSelectedPembayaran(null);
        setNewBukti(null);
        fetchData(pagination.page);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui data pembayaran");
      }
    } catch (error) {
      toast.error("Gagal memperbarui data pembayaran");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePembayaran = async () => {
    if (!selectedPembayaran) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran/${selectedPembayaran.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Data pembayaran berhasil dihapus!");
        setShowDeleteDialog(false);
        setSelectedPembayaran(null);

        // If current page becomes empty after delete, go to previous page
        if (pembayaranList.length === 1 && pagination.page > 1) {
          fetchData(pagination.page - 1);
        } else {
          fetchData(pagination.page);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menghapus data pembayaran");
      }
    } catch (error) {
      toast.error("Gagal menghapus data pembayaran");
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Riwayat Pembayaran
          </h1>
          <p className="text-zinc-600">
            Semua riwayat pembayaran dari seluruh santri
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Daftar Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">Loading...</div>
          ) : pembayaranList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Belum ada riwayat pembayaran
            </div>
          ) : (
            <>
              <div className="rounded-md border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Nama Santri</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Jenis Kelamin</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Pembayaran Infaq</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Pembayaran Laundry</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Total</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700">Bukti</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pembayaranList.map((pembayaran, index) => (
                      <TableRow key={pembayaran.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-sm">
                          {new Date(pembayaran.tanggalPembayaran).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900">{pembayaran.siswa.nama}</TableCell>
                        <TableCell className="text-zinc-600">
                          {pembayaran.siswa.jenisKelamin === "LakiLaki" ? "Laki-Laki" : "Perempuan"}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {pembayaran.siswa.kelas ? pembayaran.siswa.kelas.replace(/_/g, " ") : "-"}
                        </TableCell>
                        <TableCell className="text-zinc-600">
                          {pembayaran.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell className="text-right text-zinc-900">
                          {formatRupiah(pembayaran.totalPembayaranInfaq)}
                        </TableCell>
                        <TableCell className="text-right text-zinc-900">
                          {formatRupiah(pembayaran.totalPembayaranLaundry)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700">
                          {formatRupiah(pembayaran.totalPembayaranInfaq + pembayaran.totalPembayaranLaundry)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(pembayaran.buktiPembayaran, "_blank")}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPembayaran(pembayaran)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPembayaran(pembayaran);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-zinc-600">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                    {pagination.total} pembayaran
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={pageNum === pagination.page ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          >
                            {pageNum}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Data Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal">Tanggal Pembayaran</Label>
              <Input
                id="edit-tanggal"
                type="date"
                value={editFormData.tanggalPembayaran}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, tanggalPembayaran: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-infaq">Total Pembayaran Infaq</Label>
              <Input
                id="edit-infaq"
                type="number"
                step="0.01"
                value={editFormData.totalPembayaranInfaq}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, totalPembayaranInfaq: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-laundry">Total Pembayaran Laundry</Label>
              <Input
                id="edit-laundry"
                type="number"
                step="0.01"
                value={editFormData.totalPembayaranLaundry}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, totalPembayaranLaundry: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Bukti Pembayaran (Opsional)</Label>
              <FileUpload
                onFileSelect={setNewBukti}
                accept="image/*,application/pdf"
                maxSize={5}
              />
              <p className="text-xs text-zinc-500">
                Kosongkan jika tidak ingin mengubah bukti
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdatePembayaran}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pembayaran ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePembayaran}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
