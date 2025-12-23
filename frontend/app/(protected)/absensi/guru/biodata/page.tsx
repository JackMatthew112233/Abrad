"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Guru {
  id: string;
  nama: string;
  nip: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  alamat: string | null;
  noTelp: string | null;
  email: string | null;
  jabatan: string | null;
  mataPelajaran: string | null;
  isAktif: boolean;
  createdAt: string;
}

interface Statistik {
  totalGuru: number;
  guruAktif: number;
  guruNonAktif: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BiodataGuruPage() {
  const router = useRouter();
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    totalGuru: 0,
    guruAktif: 0,
    guruNonAktif: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    noTelp: "",
    email: "",
    jabatan: "",
    mataPelajaran: "",
    isAktif: true,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, searchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", "20");
      if (searchQuery) params.append("search", searchQuery);

      const [guruRes, statistikRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru?${params.toString()}`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/statistik`, {
          credentials: "include",
        }),
      ]);

      if (guruRes.ok) {
        const data = await guruRes.json();
        setGuruList(data.data);
        setPagination(data.pagination);
      }

      if (statistikRes.ok) {
        const data = await statistikRes.json();
        setStatistik(data);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setSelectedGuru(null);
    setFormData({
      nama: "",
      nip: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "",
      alamat: "",
      noTelp: "",
      email: "",
      jabatan: "",
      mataPelajaran: "",
      isAktif: true,
    });
    setShowFormDialog(true);
  };

  const handleOpenEditDialog = (guru: Guru) => {
    setSelectedGuru(guru);
    setFormData({
      nama: guru.nama,
      nip: guru.nip || "",
      tempatLahir: guru.tempatLahir || "",
      tanggalLahir: guru.tanggalLahir
        ? new Date(guru.tanggalLahir).toISOString().split("T")[0]
        : "",
      jenisKelamin: guru.jenisKelamin || "",
      alamat: guru.alamat || "",
      noTelp: guru.noTelp || "",
      email: guru.email || "",
      jabatan: guru.jabatan || "",
      mataPelajaran: guru.mataPelajaran || "",
      isAktif: guru.isAktif,
    });
    setShowFormDialog(true);
  };

  const handleOpenDeleteDialog = (guru: Guru) => {
    setSelectedGuru(guru);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama) {
      toast.error("Nama guru harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = selectedGuru
        ? `${process.env.NEXT_PUBLIC_API_URL}/guru/${selectedGuru.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/guru`;

      const method = selectedGuru ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowFormDialog(false);
        fetchData();
      } else {
        toast.error(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGuru) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guru/${selectedGuru.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowDeleteDialog(false);
        fetchData();
      } else {
        toast.error(data.message || "Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hidden lg:flex text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
              <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
              Biodata Guru
            </div>
            <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
              Kelola Biodata Guru
            </h1>
            <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
              Atur dan kelola data guru dan tenaga pengajar
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Total Guru
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {statistik.totalGuru}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Guru Aktif
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-600">
              {statistik.guruAktif}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Non-Aktif
            </CardTitle>
            <UserX className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-amber-600">
              {statistik.guruNonAktif}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base lg:text-lg font-semibold text-emerald-700">
                Daftar Guru
              </CardTitle>
              <p className="mt-1 text-xs lg:text-sm text-zinc-500">
                Total {pagination.total} guru terdaftar
              </p>
            </div>
            <Button
              onClick={handleOpenAddDialog}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
            >
              <Plus className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              Tambah Guru
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama, NIP, atau jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    NIP
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Jabatan
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No. Telp
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : guruList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      {searchQuery
                        ? "Tidak ada data yang cocok"
                        : "Belum ada guru terdaftar"}
                    </TableCell>
                  </TableRow>
                ) : (
                  guruList.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                        {item.nama}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {item.nip || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {item.jabatan || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {item.noTelp || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.isAktif
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {item.isAktif ? "Aktif" : "Non-Aktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(item)}
                            className="h-8 w-8 p-0 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(item)}
                            className="h-8 w-8 p-0 text-zinc-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 px-4">
              <p className="text-xs lg:text-sm text-zinc-600">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGuru ? "Edit Guru" : "Tambah Guru"}
            </DialogTitle>
            <DialogDescription>
              {selectedGuru
                ? "Ubah data guru yang sudah terdaftar"
                : "Tambahkan guru baru ke dalam sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip" className="text-sm">
                  NIP
                </Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  placeholder="Masukkan NIP"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempatLahir" className="text-sm">
                  Tempat Lahir
                </Label>
                <Input
                  id="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tempatLahir: e.target.value })
                  }
                  placeholder="Masukkan tempat lahir"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalLahir" className="text-sm">
                  Tanggal Lahir
                </Label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalLahir: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenisKelamin" className="text-sm">
                  Jenis Kelamin
                </Label>
                <Select
                  value={formData.jenisKelamin}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jenisKelamin: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LakiLaki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan" className="text-sm">
                  Jabatan
                </Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) =>
                    setFormData({ ...formData, jabatan: e.target.value })
                  }
                  placeholder="Masukkan jabatan"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mataPelajaran" className="text-sm">
                  Mata Pelajaran
                </Label>
                <Input
                  id="mataPelajaran"
                  value={formData.mataPelajaran}
                  onChange={(e) =>
                    setFormData({ ...formData, mataPelajaran: e.target.value })
                  }
                  placeholder="Masukkan mata pelajaran"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noTelp" className="text-sm">
                  No. Telepon
                </Label>
                <Input
                  id="noTelp"
                  value={formData.noTelp}
                  onChange={(e) =>
                    setFormData({ ...formData, noTelp: e.target.value })
                  }
                  placeholder="Masukkan no. telepon"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Masukkan email"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isAktif" className="text-sm">
                  Status
                </Label>
                <Select
                  value={formData.isAktif ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isAktif: value === "true" })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat" className="text-sm">
                  Alamat
                </Label>
                <Input
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                  placeholder="Masukkan alamat lengkap"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFormDialog(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : selectedGuru
                    ? "Simpan Perubahan"
                    : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Guru</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus <strong>{selectedGuru?.nama}</strong>?
              Tindakan ini tidak dapat dibatalkan.
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
