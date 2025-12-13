"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Edit, Trash2, User, Wallet, Receipt, FileText, X } from "lucide-react";
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

interface BiodataKeuangan {
  id: string;
  siswa: {
    id: string;
    nama: string;
    nis?: string;
    nik?: string;
    nisn?: string;
    npsn?: string;
    sekolahAsal?: string;
    tingkatan?: string;
    kelas?: string;
    jenisKelamin?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    alamat?: string;
    kodePos?: string;
    namaAyah?: string;
    nikAyah?: string;
    ttlAyah?: string;
    noKartuKeluarga?: string;
    pekerjaanAyah?: string;
    pendidikanAyah?: string;
    noTelpAyah?: string;
    namaIbu?: string;
    nikIbu?: string;
    ttlIbu?: string;
    pekerjaanIbu?: string;
    pendidikanIbu?: string;
    noTelpIbu?: string;
    isAktif: boolean;
  };
  komitmenInfaqLaundry: number;
  infaq: number;
  laundry: number;
  createdAt: string;
  updatedAt: string;
}

interface Pembayaran {
  id: string;
  totalPembayaranInfaq: number;
  totalPembayaranLaundry: number;
  buktiPembayaran: string;
  tanggalPembayaran: string;
  createdAt: string;
}

export default function DetailBiodataKeuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [biodata, setBiodata] = useState<BiodataKeuangan | null>(null);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeletePembayaranDialog, setShowDeletePembayaranDialog] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
  const [editFormData, setEditFormData] = useState({
    totalPembayaranInfaq: "",
    totalPembayaranLaundry: "",
    tanggalPembayaran: "",
  });
  const [newBukti, setNewBukti] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pembayaranPage, setPembayaranPage] = useState(1);
  const [pembayaranPagination, setPembayaranPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchBiodata();
    }
  }, [id]);

  useEffect(() => {
    if (biodata?.siswa?.id) {
      fetchPembayaran(pembayaranPage);
    }
  }, [biodata?.siswa?.id, pembayaranPage]);

  const fetchBiodata = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata/${id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBiodata(data);
      } else {
        toast.error("Biodata keuangan tidak ditemukan");
        router.push("/keuangan");
      }
    } catch (error) {
      console.error("Error fetching biodata:", error);
      toast.error("Gagal memuat biodata keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPembayaran = async (page: number = 1) => {
    if (!biodata?.siswa?.id) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran/siswa/${biodata.siswa.id}?page=${page}&limit=12`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setPembayaranList(result.data);
        setPembayaranPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Biodata keuangan berhasil dihapus!");
        router.push("/keuangan");
      } else {
        toast.error("Gagal menghapus biodata keuangan");
      }
    } catch (error) {
      toast.error("Gagal menghapus biodata keuangan");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditPembayaran = (pembayaran: Pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setEditFormData({
      totalPembayaranInfaq: pembayaran.totalPembayaranInfaq.toString(),
      totalPembayaranLaundry: pembayaran.totalPembayaranLaundry.toString(),
      tanggalPembayaran: new Date(pembayaran.tanggalPembayaran).toISOString().split("T")[0],
    });
    setNewBukti(null);
    setShowEditDialog(true);
  };

  const handleUpdatePembayaran = async () => {
    if (!selectedPembayaran) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("totalPembayaranInfaq", editFormData.totalPembayaranInfaq);
      formData.append("totalPembayaranLaundry", editFormData.totalPembayaranLaundry);
      formData.append("tanggalPembayaran", editFormData.tanggalPembayaran);
      
      if (newBukti) {
        formData.append("buktiPembayaran", newBukti);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran/${selectedPembayaran.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Data pembayaran berhasil diperbarui!");
        setShowEditDialog(false);
        setSelectedPembayaran(null);
        setNewBukti(null);
        fetchPembayaran(pembayaranPage);
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
        setShowDeletePembayaranDialog(false);
        setSelectedPembayaran(null);
        
        // Check if current page becomes empty after delete
        if (pembayaranList.length === 1 && pembayaranPage > 1) {
          setPembayaranPage(pembayaranPage - 1);
        } else {
          fetchPembayaran(pembayaranPage);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!biodata) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Detail Biodata Keuangan
            </h1>
            <p className="text-zinc-600">
              Informasi lengkap biodata keuangan santri / santriwati
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/keuangan/biodata/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Informasi Keuangan */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-base font-semibold text-emerald-700">
              Informasi Keuangan
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-zinc-200 bg-white">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-1">Total Komitmen</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(biodata.komitmenInfaqLaundry)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 bg-white">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-1">Total Biaya Infaq</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(biodata.infaq)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 bg-white">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-1">Total Biaya Laundry</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(biodata.laundry)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Dibuat pada</p>
                <p className="font-medium text-zinc-900">
                  {new Date(biodata.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Terakhir diperbarui</p>
                <p className="font-medium text-zinc-900">
                  {new Date(biodata.updatedAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Pembayaran */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-base font-semibold text-emerald-700">
              Riwayat Pembayaran
            </CardTitle>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Total {pembayaranList.length} pembayaran
          </p>
        </CardHeader>
        <CardContent>
          {pembayaranList.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              Belum ada riwayat pembayaran
            </div>
          ) : (
            <div className="rounded-md border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                    <TableHead className="text-right font-semibold text-emerald-700">
                      Pembayaran Infaq
                    </TableHead>
                    <TableHead className="text-right font-semibold text-emerald-700">
                      Pembayaran Laundry
                    </TableHead>
                    <TableHead className="text-right font-semibold text-emerald-700">
                      Total
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Bukti
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pembayaranList.map((pembayaran, index) => (
                    <TableRow key={pembayaran.id} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600">{index + 1}</TableCell>
                      <TableCell className="text-zinc-600">
                        {new Date(pembayaran.tanggalPembayaran).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right text-zinc-900">
                        {formatRupiah(pembayaran.totalPembayaranInfaq)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-900">
                        {formatRupiah(pembayaran.totalPembayaranLaundry)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        {formatRupiah(
                          pembayaran.totalPembayaranInfaq + pembayaran.totalPembayaranLaundry
                        )}
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
                              setShowDeletePembayaranDialog(true);
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
          )}

          {/* Pagination Controls */}
          {pembayaranPagination && pembayaranPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-zinc-600">
                Menampilkan {((pembayaranPage - 1) * 12) + 1} - {Math.min(pembayaranPage * 12, pembayaranPagination.total)} dari {pembayaranPagination.total} pembayaran
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPembayaranPage(pembayaranPage - 1)}
                  disabled={pembayaranPage === 1}
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pembayaranPagination.totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === pembayaranPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPembayaranPage(pageNum)}
                        className={pageNum === pembayaranPage ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPembayaranPage(pembayaranPage + 1)}
                  disabled={pembayaranPage === pembayaranPagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Biodata Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Biodata Keuangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus biodata keuangan untuk{" "}
              <strong>{biodata.siswa.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Pembayaran Dialog */}
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

      {/* Delete Pembayaran Confirmation Dialog */}
      <AlertDialog open={showDeletePembayaranDialog} onOpenChange={setShowDeletePembayaranDialog}>
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
