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

interface Pengeluaran {
  id: string;
  nama: string;
  jenis: string;
  harga: number;
  bukti: string | null;
  tanggalPengeluaran: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RiwayatPengeluaranPage() {
  const router = useRouter();
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPengeluaran, setSelectedPengeluaran] = useState<Pengeluaran | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama: "",
    jenis: "",
    harga: "",
    tanggalPengeluaran: "",
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
        `${process.env.NEXT_PUBLIC_API_URL}/pengeluaran?page=${page}&limit=20`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setPengeluaranList(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching pengeluaran:", error);
      toast.error("Gagal memuat data pengeluaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleEditPengeluaran = (pengeluaran: Pengeluaran) => {
    setSelectedPengeluaran(pengeluaran);
    setEditFormData({
      nama: pengeluaran.nama,
      jenis: pengeluaran.jenis,
      harga: pengeluaran.harga.toString(),
      tanggalPengeluaran: new Date(pengeluaran.tanggalPengeluaran)
        .toISOString()
        .split("T")[0],
    });
    setNewBukti(null);
    setShowEditDialog(true);
  };

  const handleUpdatePengeluaran = async () => {
    if (!selectedPengeluaran) return;

    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", editFormData.nama);
      formDataToSend.append("jenis", editFormData.jenis);
      formDataToSend.append("harga", editFormData.harga);
      formDataToSend.append("tanggalPengeluaran", editFormData.tanggalPengeluaran);

      if (newBukti) {
        formDataToSend.append("bukti", newBukti);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pengeluaran/${selectedPengeluaran.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Data pengeluaran berhasil diperbarui!");
        setShowEditDialog(false);
        setSelectedPengeluaran(null);
        setNewBukti(null);
        fetchData(pagination.page);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui data pengeluaran");
      }
    } catch (error) {
      toast.error("Gagal memperbarui data pengeluaran");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePengeluaran = async () => {
    if (!selectedPengeluaran) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pengeluaran/${selectedPengeluaran.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Data pengeluaran berhasil dihapus!");
        setShowDeleteDialog(false);
        setSelectedPengeluaran(null);

        // If current page becomes empty after delete, go to previous page
        if (pengeluaranList.length === 1 && pagination.page > 1) {
          fetchData(pagination.page - 1);
        } else {
          fetchData(pagination.page);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menghapus data pengeluaran");
      }
    } catch (error) {
      toast.error("Gagal menghapus data pengeluaran");
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
            Riwayat Pengeluaran
          </h1>
          <p className="text-zinc-600">
            Semua riwayat pengeluaran
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Daftar Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">Loading...</div>
          ) : pengeluaranList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Belum ada riwayat pengeluaran
            </div>
          ) : (
            <>
              <div className="rounded-md border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                      <TableHead className="font-semibold text-emerald-700">Jenis</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-700">Harga</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700">Bukti</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-700">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pengeluaranList.map((pengeluaran, index) => (
                      <TableRow key={pengeluaran.id} className="hover:bg-zinc-50">
                        <TableCell className="text-zinc-600">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-600 text-sm">
                          {new Date(pengeluaran.tanggalPengeluaran).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-zinc-900">{pengeluaran.nama}</TableCell>
                        <TableCell className="text-zinc-600">{pengeluaran.jenis}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatRupiah(pengeluaran.harga)}
                        </TableCell>
                        <TableCell className="text-center">
                          {pengeluaran.bukti ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(pengeluaran.bukti!, "_blank")}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-zinc-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPengeluaran(pengeluaran)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPengeluaran(pengeluaran);
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
                    {pagination.total} pengeluaran
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
            <DialogTitle>Edit Data Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal">Tanggal Pengeluaran</Label>
              <Input
                id="edit-tanggal"
                type="date"
                value={editFormData.tanggalPengeluaran}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, tanggalPengeluaran: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Pengeluaran</Label>
              <Input
                id="edit-nama"
                value={editFormData.nama}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, nama: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-jenis">Jenis Pengeluaran</Label>
              <Input
                id="edit-jenis"
                value={editFormData.jenis}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, jenis: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-harga">Harga</Label>
              <Input
                id="edit-harga"
                type="number"
                step="0.01"
                value={editFormData.harga}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, harga: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Bukti (Opsional)</Label>
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
              onClick={handleUpdatePengeluaran}
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
            <AlertDialogTitle>Hapus Data Pengeluaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePengeluaran}
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
