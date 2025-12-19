"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
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
  const [activeTab, setActiveTab] = useState<"mapel" | "santri">("mapel");

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
    <div className="space-y-4 lg:space-y-6">
      {/* Back Button - Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => router.push("/nilai/mata-pelajaran")}
          className="w-full text-xs h-9"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Kembali
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/nilai/mata-pelajaran")}
            className="hidden lg:flex text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-emerald-700">
              Kelas {kelas.replace("_", " ")}
            </h1>
            <p className="text-xs lg:text-sm text-zinc-500">
              {mataPelajaranList.length} mapel, {siswaList.length} santri
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tambah </span>Mapel
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("mapel")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${
            activeTab === "mapel"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Mata Pelajaran
        </button>
        <button
          onClick={() => setActiveTab("santri")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${
            activeTab === "santri"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Daftar Santri
        </button>
      </div>

      {/* Mapel Tab Content */}
      {activeTab === "mapel" && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Memuat data...
            </div>
          ) : mataPelajaranList.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Belum ada mata pelajaran</p>
              <Button
                onClick={() => handleOpenDialog()}
                variant="link"
                className="text-emerald-600 text-sm mt-1"
              >
                Tambah sekarang
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {mataPelajaranList.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 lg:p-4 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-6">{index + 1}.</span>
                    <span className="text-sm lg:text-base font-medium text-zinc-800">
                      {item.nama}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(item)}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedId(item.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Santri Tab Content */}
      {activeTab === "santri" && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {isLoadingSiswa ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Memuat data...
            </div>
          ) : siswaList.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Belum ada santri di kelas ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left text-xs font-semibold text-zinc-600 p-3 lg:p-4">No</th>
                    <th className="text-left text-xs font-semibold text-zinc-600 p-3 lg:p-4">Nama</th>
                    <th className="text-left text-xs font-semibold text-zinc-600 p-3 lg:p-4">NIS</th>
                    <th className="text-left text-xs font-semibold text-zinc-600 p-3 lg:p-4">Jenis Kelamin</th>
                    <th className="text-center text-xs font-semibold text-zinc-600 p-3 lg:p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {siswaList.map((siswa, index) => (
                    <tr key={siswa.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 lg:p-4 text-xs lg:text-sm text-zinc-500">{index + 1}</td>
                      <td className="p-3 lg:p-4 text-xs lg:text-sm font-medium text-zinc-800">{siswa.nama}</td>
                      <td className="p-3 lg:p-4 text-xs lg:text-sm text-zinc-600">{siswa.nis || "-"}</td>
                      <td className="p-3 lg:p-4 text-xs lg:text-sm text-zinc-600">
                        {siswa.jenisKelamin === "LakiLaki" ? "Laki-Laki" : "Perempuan"}
                      </td>
                      <td className="p-3 lg:p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            siswa.isAktif
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {siswa.isAktif ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-700">
              {editMode ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <DialogDescription className="text-xs lg:text-sm">
              {editMode
                ? "Perbarui nama mata pelajaran"
                : `Tambah mata pelajaran baru untuk kelas ${kelas.replace("_", " ")}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-xs lg:text-sm">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Contoh: Matematika, Bahasa Indonesia"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="text-sm h-9 lg:h-10"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="text-xs lg:text-sm h-9"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9"
              >
                {editMode ? "Simpan" : "Tambah"}
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
            <AlertDialogDescription className="text-sm">
              Yakin ingin menghapus mata pelajaran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-sm"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
