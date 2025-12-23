"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Search,
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

interface WaliKelas {
  id: string;
  namaGuru: string;
  kelas: string;
  noTelp: string | null;
  createdAt: string;
}

interface Statistik {
  totalWaliKelas: number;
  totalKelas: number;
  kelasTerassign: number;
  kelasBelumAssign: number;
}

const formatKelas = (kelas: string) => {
  return kelas.replace("_", " ");
};

export default function WaliKelasPage() {
  const [waliKelasList, setWaliKelasList] = useState<WaliKelas[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    totalWaliKelas: 0,
    totalKelas: 12,
    kelasTerassign: 0,
    kelasBelumAssign: 12,
  });
  const [availableKelas, setAvailableKelas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWaliKelas, setSelectedWaliKelas] = useState<WaliKelas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    namaGuru: "",
    kelas: "",
    noTelp: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [waliKelasRes, statistikRes, availableRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/wali-kelas`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/wali-kelas/statistik`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/wali-kelas/available-kelas`, {
          credentials: "include",
        }),
      ]);

      if (waliKelasRes.ok) {
        const data = await waliKelasRes.json();
        setWaliKelasList(data);
      }

      if (statistikRes.ok) {
        const data = await statistikRes.json();
        setStatistik(data);
      }

      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableKelas(data);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setSelectedWaliKelas(null);
    setFormData({ namaGuru: "", kelas: "", noTelp: "" });
    setShowFormDialog(true);
  };

  const handleOpenEditDialog = (waliKelas: WaliKelas) => {
    setSelectedWaliKelas(waliKelas);
    setFormData({
      namaGuru: waliKelas.namaGuru,
      kelas: waliKelas.kelas,
      noTelp: waliKelas.noTelp || "",
    });
    setShowFormDialog(true);
  };

  const handleOpenDeleteDialog = (waliKelas: WaliKelas) => {
    setSelectedWaliKelas(waliKelas);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namaGuru || !formData.kelas) {
      toast.error("Nama guru dan kelas harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = selectedWaliKelas
        ? `${process.env.NEXT_PUBLIC_API_URL}/wali-kelas/${selectedWaliKelas.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/wali-kelas`;

      const method = selectedWaliKelas ? "PUT" : "POST";

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
    if (!selectedWaliKelas) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wali-kelas/${selectedWaliKelas.id}`,
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

  const filteredWaliKelas = waliKelasList.filter(
    (item) =>
      item.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatKelas(item.kelas).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get available kelas for edit (include current kelas)
  const getKelasOptionsForEdit = () => {
    if (selectedWaliKelas) {
      return [...availableKelas, selectedWaliKelas.kelas].sort();
    }
    return availableKelas;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
            Manajemen Wali Kelas
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Kelola Wali Kelas
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Atur dan kelola wali kelas untuk setiap kelas
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Total Kelas
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {statistik.totalKelas}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Wali Kelas Terdaftar
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {statistik.totalWaliKelas}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Kelas Sudah Assign
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-600">
              {statistik.kelasTerassign}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Kelas Belum Assign
            </CardTitle>
            <XCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-amber-600">
              {statistik.kelasBelumAssign}
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
                Daftar Wali Kelas
              </CardTitle>
              <p className="mt-1 text-xs lg:text-sm text-zinc-500">
                Total {waliKelasList.length} wali kelas terdaftar
              </p>
            </div>
            <Button
              onClick={handleOpenAddDialog}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-8 lg:h-9"
              disabled={availableKelas.length === 0}
            >
              <Plus className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              Tambah Wali Kelas
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama guru atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama Guru
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Kelas
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No. Telepon
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
                      colSpan={5}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredWaliKelas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      {searchQuery
                        ? "Tidak ada data yang cocok"
                        : "Belum ada wali kelas terdaftar"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWaliKelas.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                        {item.namaGuru}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          {formatKelas(item.kelas)}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {item.noTelp ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.noTelp}
                          </span>
                        ) : (
                          "-"
                        )}
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
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedWaliKelas ? "Edit Wali Kelas" : "Tambah Wali Kelas"}
            </DialogTitle>
            <DialogDescription>
              {selectedWaliKelas
                ? "Ubah data wali kelas yang sudah terdaftar"
                : "Tambahkan wali kelas baru untuk kelas yang tersedia"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="namaGuru" className="text-sm">
                  Nama Guru <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="namaGuru"
                  value={formData.namaGuru}
                  onChange={(e) =>
                    setFormData({ ...formData, namaGuru: e.target.value })
                  }
                  placeholder="Masukkan nama guru"
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas" className="text-sm">
                  Kelas <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.kelas}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kelas: value })
                  }
                  required
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {getKelasOptionsForEdit().map((kelas) => (
                      <SelectItem key={kelas} value={kelas}>
                        {formatKelas(kelas)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="Masukkan no. telepon (opsional)"
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
                  : selectedWaliKelas
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
            <AlertDialogTitle>Hapus Wali Kelas</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus <strong>{selectedWaliKelas?.namaGuru}</strong>{" "}
              sebagai wali kelas <strong>{selectedWaliKelas && formatKelas(selectedWaliKelas.kelas)}</strong>?
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
