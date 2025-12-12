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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
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
            Detail Santri / Santriwati
          </h1>
          <p className="text-zinc-600">
            Informasi lengkap biodata santri / santriwati
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push(`/siswa/${siswa.id}/edit`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Data
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
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

          <Badge
            variant="outline"
            className={
              siswa.isAktif
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 text-base px-4 py-2"
                : "border-zinc-300 bg-zinc-50 text-zinc-700 text-base px-4 py-2"
            }
          >
            {siswa.isAktif ? "Aktif" : "Non-Aktif"}
          </Badge>
        </div>
      </div>

      {/* Data Santri */}
      <Card className="border-emerald-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <User className="h-5 w-5" />
            Data Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Nama Lengkap</p>
              <p className="font-semibold">{siswa.nama || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Jenis Kelamin</p>
              <p className="font-medium">
                {siswa.jenisKelamin ? (
                  siswa.jenisKelamin === "LakiLaki" ? "Laki-laki" : "Perempuan"
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NIS</p>
              <p className="font-medium">{siswa.nis || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NIK</p>
              <p className="font-medium">{siswa.nik || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NISN</p>
              <p className="font-medium">{siswa.nisn || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NPSN</p>
              <p className="font-medium">{siswa.npsn || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tingkatan</p>
              <p className="font-medium">{siswa.tingkatan || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Kelas</p>
              <p className="font-medium">{siswa.kelas ? siswa.kelas.replace("_", " ") : "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tempat Lahir</p>
              <p className="font-medium">{siswa.tempatLahir || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tanggal Lahir</p>
              <p className="font-medium">
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
              <p className="text-sm text-zinc-500">Sekolah Asal</p>
              <p className="font-medium">{siswa.sekolahAsal || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">No. Kartu Keluarga</p>
              <p className="font-medium">{siswa.noKartuKeluarga || "-"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-zinc-500">Alamat</p>
              <p className="font-medium">{siswa.alamat || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Kode Pos</p>
              <p className="font-medium">{siswa.kodePos || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ayah */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Users className="h-5 w-5" />
            Data Ayah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Nama Ayah</p>
              <p className="font-semibold">{siswa.namaAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NIK Ayah</p>
              <p className="font-medium">{siswa.nikAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tempat, Tanggal Lahir Ayah</p>
              <p className="font-medium">{siswa.ttlAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Pekerjaan Ayah</p>
              <p className="font-medium">{siswa.pekerjaanAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Pendidikan Ayah</p>
              <p className="font-medium">{siswa.pendidikanAyah || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">No. Telepon Ayah</p>
              <p className="font-medium">{siswa.noTelpAyah || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ibu */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Users className="h-5 w-5" />
            Data Ibu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Nama Ibu</p>
              <p className="font-semibold">{siswa.namaIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">NIK Ibu</p>
              <p className="font-medium">{siswa.nikIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tempat, Tanggal Lahir Ibu</p>
              <p className="font-medium">{siswa.ttlIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Pekerjaan Ibu</p>
              <p className="font-medium">{siswa.pekerjaanIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Pendidikan Ibu</p>
              <p className="font-medium">{siswa.pendidikanIbu || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">No. Telepon Ibu</p>
              <p className="font-medium">{siswa.noTelpIbu || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Tambahan */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <FileText className="h-5 w-5" />
            Informasi Tambahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">Tanggal Dibuat</p>
              <p className="font-medium">
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
              <p className="text-sm text-zinc-500">Terakhir Diupdate</p>
              <p className="font-medium">
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
