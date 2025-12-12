"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, User, Wallet } from "lucide-react";
import { toast } from "sonner";
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

interface BiodataKeuangan {
  id: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    nik?: string;
    nis?: string;
    nisn?: string;
    jenisKelamin?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    alamat?: string;
  };
  komitmenInfaqLaundry: number;
  infaq: number;
  laundry: number;
  createdAt: string;
  updatedAt: string;
}

export default function DetailBiodataKeuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [biodata, setBiodata] = useState<BiodataKeuangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBiodata();
    }
  }, [id]);

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

      {/* Informasi Santri */}
      <Card className="border-emerald-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-700" />
            <CardTitle className="text-base font-semibold text-emerald-700">
              Informasi Santri / Santriwati
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl font-bold">
              {biodata.siswa.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                {biodata.siswa.nama}
              </h2>
              <div className="flex gap-2 mb-4">
                {biodata.siswa.tingkatan && (
                  <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {biodata.siswa.tingkatan}
                  </span>
                )}
                {biodata.siswa.kelas && (
                  <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {biodata.siswa.kelas.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {biodata.siswa.nis && (
                  <div>
                    <p className="text-xs text-zinc-500">NIS</p>
                    <p className="font-medium text-zinc-900">{biodata.siswa.nis}</p>
                  </div>
                )}
                {biodata.siswa.nisn && (
                  <div>
                    <p className="text-xs text-zinc-500">NISN</p>
                    <p className="font-medium text-zinc-900">{biodata.siswa.nisn}</p>
                  </div>
                )}
                {biodata.siswa.nik && (
                  <div>
                    <p className="text-xs text-zinc-500">NIK</p>
                    <p className="font-medium text-zinc-900">{biodata.siswa.nik}</p>
                  </div>
                )}
                {biodata.siswa.jenisKelamin && (
                  <div>
                    <p className="text-xs text-zinc-500">Jenis Kelamin</p>
                    <p className="font-medium text-zinc-900">
                      {biodata.siswa.jenisKelamin === "LAKI_LAKI"
                        ? "Laki-laki"
                        : "Perempuan"}
                    </p>
                  </div>
                )}
                {biodata.siswa.tempatLahir && biodata.siswa.tanggalLahir && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-zinc-500">Tempat, Tanggal Lahir</p>
                    <p className="font-medium text-zinc-900">
                      {biodata.siswa.tempatLahir},{" "}
                      {new Date(biodata.siswa.tanggalLahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {biodata.siswa.alamat && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-zinc-500">Alamat</p>
                    <p className="font-medium text-zinc-900">{biodata.siswa.alamat}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Keuangan */}
      <Card className="border-emerald-200 bg-white">
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
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-1">Total Komitmen</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(biodata.komitmenInfaqLaundry)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-1">Total Biaya Infaq</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatRupiah(biodata.infaq)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50">
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

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
