"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface MataPelajaran {
  id: string;
  nama: string;
  kelas: string;
  createdAt: string;
  updatedAt: string;
}

interface Siswa {
  id: string;
  nama: string;
  nis: string;
  nisn: string;
  jenisKelamin: string;
  kelas: string;
  isAktif: boolean;
}

export default function DetailMataPelajaranKelasPage() {
  const router = useRouter();
  const params = useParams();
  const kelas = params.kelas as string;

  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    fetchData();
    fetchSiswaData();
  }, [kelas]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran?kelas=${kelas}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setMataPelajaranList(data);
      } else {
        toast.error("Gagal memuat data mata pelajaran");
      }
    } catch (error) {
      toast.error("Gagal memuat data mata pelajaran");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiswaData = async () => {
    try {
      setIsLoadingSiswa(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa?kelas=${kelas}&limit=1000`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setSiswaList(data.data || []);
      } else {
        toast.error("Gagal memuat data siswa");
      }
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    } finally {
      setIsLoadingSiswa(false);
    }
  };

  const handleOpenDialog = (mataPelajaran?: MataPelajaran) => {
    if (mataPelajaran) {
      setEditMode(true);
      setSelectedId(mataPelajaran.id);
      setFormData({
        nama: mataPelajaran.nama,
      });
    } else {
      setEditMode(false);
      setSelectedId("");
      setFormData({
        nama: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      toast.error("Nama mata pelajaran wajib diisi");
      return;
    }

    try {
      const url = editMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran/${selectedId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran`;

      const response = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nama: formData.nama,
          kelas: kelas,
        }),
      });

      if (response.ok) {
        toast.success(
          `Mata pelajaran berhasil ${editMode ? "diperbarui" : "ditambahkan"}!`
        );
        setDialogOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menyimpan mata pelajaran");
      }
    } catch (error) {
      toast.error("Gagal menyimpan mata pelajaran");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran/${selectedId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Mata pelajaran berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error("Gagal menghapus mata pelajaran");
      }
    } catch (error) {
      toast.error("Gagal menghapus mata pelajaran");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/nilai/mata-pelajaran")}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Mata Pelajaran - {kelas.replace("_", " ")}
          </h1>
          <p className="text-zinc-600">
            Kelola daftar mata pelajaran untuk kelas {kelas.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Mata Pelajaran Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Daftar Mata Pelajaran
            </CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mata Pelajaran
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="w-12 font-semibold text-emerald-700">
                      No
                    </TableHead>
                    <TableHead className="font-semibold text-emerald-700">
                      Nama Mata Pelajaran
                    </TableHead>
                    <TableHead className="text-right font-semibold text-emerald-700">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mataPelajaranList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-zinc-500 py-8"
                      >
                        Belum ada mata pelajaran untuk kelas ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    mataPelajaranList.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-700 font-medium">
                          {item.nama}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedId(item.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Siswa Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSiswa ? (
            <div className="py-8 text-center text-zinc-500">Memuat data...</div>
          ) : (
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
                      NIS
                    </TableHead>
                    <TableHead className="font-semibold text-emerald-700">
                      NISN
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Jenis Kelamin
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswaList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-zinc-500 py-8"
                      >
                        Belum ada siswa di kelas ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    siswaList.map((siswa, index) => (
                      <TableRow key={siswa.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-700 font-medium">
                          {siswa.nama}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {siswa.nis || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {siswa.nisn || "-"}
                        </TableCell>
                        <TableCell className="text-center text-zinc-700">
                          {siswa.jenisKelamin === "LakiLaki"
                            ? "Laki-Laki"
                            : "Perempuan"}
                        </TableCell>
                        <TableCell className="text-center text-zinc-700">
                          {siswa.isAktif ? "Aktif" : "Non-Aktif"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Perbarui nama mata pelajaran"
                : `Tambah mata pelajaran baru untuk kelas ${kelas.replace("_", " ")}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Contoh: Matematika, Bahasa Indonesia"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {editMode ? "Perbarui" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mata pelajaran ini? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
}
