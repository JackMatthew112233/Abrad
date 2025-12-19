"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, MapPin, Phone, FileText, User, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SiswaDetail {
  id: string;
  nama: string | null;
  nik: string | null;
  nis: string | null;
  nisn: string | null;
  npsn: string | null;
  jenisKelamin: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  sekolahAsal: string | null;
  alamat: string | null;
  kodePos: string | null;
  noKartuKeluarga: string | null;
  kelas: string | null;
  tingkatan: string | null;
  isAktif: boolean;
  status: string | null;
  namaAyah: string | null;
  nikAyah: string | null;
  ttlAyah: string | null;
  pekerjaanAyah: string | null;
  pendidikanAyah: string | null;
  noTelpAyah: string | null;
  namaIbu: string | null;
  nikIbu: string | null;
  ttlIbu: string | null;
  pekerjaanIbu: string | null;
  pendidikanIbu: string | null;
  noTelpIbu: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const [siswa, setSiswa] = useState<SiswaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchSiswaDetail(params.id as string);
    }
  }, [params.id]);

  const fetchSiswaDetail = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSiswa(data);
      } else {
        toast.error("Gagal memuat detail santri / santriwati");
        router.push("/siswa");
      }
    } catch (error) {
      toast.error("Gagal memuat detail santri / santriwati");
      router.push("/siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!siswa) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${siswa.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Data santri / santriwati berhasil dihapus!");
        router.push("/siswa");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Gagal menghapus data");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data santri / santriwati");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-zinc-500">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (!siswa) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-3">
        {/* Mobile: Full width button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="text-xs h-8 w-full lg:hidden"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Kembali
        </Button>

        {/* Desktop: Icon button with title */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-emerald-700">
              Detail Biodata
            </h1>
            <p className="text-sm text-zinc-600">
              Informasi lengkap biodata santri atau santriwati
            </p>
          </div>
        </div>

        {/* Mobile: Centered title */}
        <div className="text-center lg:hidden">
          <h1 className="text-lg font-bold text-emerald-700">
            Detail Biodata
          </h1>
          <p className="text-xs text-zinc-600">
            Informasi lengkap biodata santri atau santriwati
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => router.push(`/siswa/${siswa.id}/edit`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs lg:text-sm h-8 lg:h-9 w-full sm:w-auto"
            >
              <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
              Edit Data
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm h-8 lg:h-9 w-full sm:w-auto"
                >
                  <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  Hapus Data
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus data <strong>{siswa.nama}</strong>?
                  <br />
                  <br />
                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Biodata santri/santriwati</li>
                    <li>Data keuangan</li>
                    <li>Riwayat pembayaran</li>
                    <li>Riwayat absensi</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Data Santri */}
      <Card className="border-emerald-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 text-sm lg:text-base">
            <User className="h-4 w-4 lg:h-5 lg:w-5" />
            Data Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Nama Lengkap</p>
              <p className="font-semibold text-xs lg:text-sm">{siswa.nama || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Jenis Kelamin</p>
              <p className="font-medium text-xs lg:text-sm">
                {siswa.jenisKelamin ? (
                  siswa.jenisKelamin === "LakiLaki" ? "Laki-laki" : "Perempuan"
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NIS</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.nis || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NIK</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.nik || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NISN</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.nisn || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NPSN</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.npsn || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tingkatan</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.tingkatan || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Kelas</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.kelas ? siswa.kelas.replace("_", " ") : "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Status</p>
              <p className="font-medium text-xs lg:text-sm">
                {siswa.status === "AKTIF" && "Aktif"}
                {siswa.status === "TIDAK_AKTIF" && "Tidak Aktif"}
                {siswa.status === "LULUS" && "Lulus"}
                {!siswa.status && "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tempat Lahir</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.tempatLahir || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tanggal Lahir</p>
              <p className="font-medium text-xs lg:text-sm">
                {siswa.tanggalLahir
                  ? new Date(siswa.tanggalLahir).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Sekolah Asal</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.sekolahAsal || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">No. Kartu Keluarga</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.noKartuKeluarga || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Alamat</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.alamat || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Kode Pos</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.kodePos || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ayah */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 text-sm lg:text-base">
            <Users className="h-4 w-4 lg:h-5 lg:w-5" />
            Data Ayah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Nama Ayah</p>
              <p className="font-semibold text-xs lg:text-sm">{siswa.namaAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NIK Ayah</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.nikAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tempat, Tanggal Lahir Ayah</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.ttlAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Pekerjaan Ayah</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.pekerjaanAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Pendidikan Ayah</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.pendidikanAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">No. Telepon Ayah</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.noTelpAyah || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ibu */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 text-sm lg:text-base">
            <Users className="h-4 w-4 lg:h-5 lg:w-5" />
            Data Ibu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Nama Ibu</p>
              <p className="font-semibold text-xs lg:text-sm">{siswa.namaIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">NIK Ibu</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.nikIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tempat, Tanggal Lahir Ibu</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.ttlIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Pekerjaan Ibu</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.pekerjaanIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Pendidikan Ibu</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.pendidikanIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">No. Telepon Ibu</p>
              <p className="font-medium text-xs lg:text-sm">{siswa.noTelpIbu || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Tambahan */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 text-sm lg:text-base">
            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
            Informasi Tambahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Tanggal Dibuat</p>
              <p className="font-medium text-xs lg:text-sm">
                {new Date(siswa.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-zinc-500">Terakhir Diupdate</p>
              <p className="font-medium text-xs lg:text-sm">
                {new Date(siswa.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
