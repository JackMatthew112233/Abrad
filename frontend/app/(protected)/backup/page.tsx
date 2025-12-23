"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Download,
  Users,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  Heart,
  Wallet,
  Landmark,
  GraduationCap,
  UserCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface BackupItem {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  icon: React.ReactNode;
}

const backupItems: BackupItem[] = [
  {
    id: "siswa",
    title: "Data Santri / Santriwati",
    description: "Backup semua data biodata santri dan santriwati lengkap",
    endpoint: "/backup/siswa",
    icon: <Users className="h-6 w-6" />,
  },
  {
    id: "nilai",
    title: "Data Nilai",
    description: "Backup semua data nilai dengan nama santri, mata pelajaran, tanggal lengkap",
    endpoint: "/backup/nilai",
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    id: "absensi",
    title: "Data Absensi",
    description: "Backup semua data absensi dengan nama santri dan keterangan lengkap",
    endpoint: "/backup/absensi",
    icon: <ClipboardCheck className="h-6 w-6" />,
  },
  {
    id: "pelanggaran",
    title: "Data Pelanggaran",
    description: "Backup semua data pelanggaran dengan nama santri dan jenis sanksi",
    endpoint: "/backup/pelanggaran",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  {
    id: "kesehatan",
    title: "Data Kesehatan",
    description: "Backup semua data kesehatan dengan riwayat dan asuransi",
    endpoint: "/backup/kesehatan",
    icon: <Heart className="h-6 w-6" />,
  },
  {
    id: "keuangan",
    title: "Data Keuangan",
    description: "Backup data pembayaran, pengeluaran, dan donasi",
    endpoint: "/backup/keuangan",
    icon: <Wallet className="h-6 w-6" />,
  },
  {
    id: "koperasi",
    title: "Data Koperasi",
    description: "Backup data anggota, pemasukan, dan pengeluaran koperasi",
    endpoint: "/backup/koperasi",
    icon: <Landmark className="h-6 w-6" />,
  },
  {
    id: "wali-kelas",
    title: "Data Wali Kelas",
    description: "Backup semua data wali kelas",
    endpoint: "/backup/wali-kelas",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    id: "tahfidz",
    title: "Data Tahfidz",
    description: "Backup semua data tahfidz dengan nama santri dan juz",
    endpoint: "/backup/tahfidz",
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    id: "users",
    title: "Data Users",
    description: "Backup semua data pengguna sistem",
    endpoint: "/backup/users",
    icon: <UserCheck className="h-6 w-6" />,
  },
];

export default function BackupPage() {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleDownload = async (item: BackupItem) => {
    setLoadingItems((prev) => new Set(prev).add(item.id));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${item.endpoint}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Gagal mengunduh backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `Backup_${item.title.replace(/\s+/g, "_")}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Backup ${item.title} berhasil diunduh!`);
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast.error(`Gagal mengunduh backup ${item.title}`);
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    setLoadingItems((prev) => new Set(prev).add("all"));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/backup/all`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Gagal mengunduh backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Backup_Semua_Data.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Backup semua data berhasil diunduh!");
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast.error("Gagal mengunduh backup semua data");
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete("all");
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20 hidden lg:block">
          <Database className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 lg:px-4 py-1 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <Database className="h-3 w-3 lg:h-4 lg:w-4" />
            Backup Database
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Backup Database
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Unduh backup data dari database untuk keperluan arsip atau migrasi
          </p>
        </div>
      </div>

      {/* Download All Button */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-emerald-800">
                Backup Semua Data
              </h2>
              <p className="text-sm text-emerald-600">
                Unduh backup semua data dalam satu file Excel dengan multiple sheets
              </p>
            </div>
            <Button
              onClick={handleDownloadAll}
              disabled={loadingItems.has("all")}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            >
              {loadingItems.has("all") ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Semua Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {backupItems.map((item) => (
          <Card
            key={item.id}
            className="border-zinc-200 bg-white hover:border-emerald-300 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  {item.icon}
                </div>
              </div>
              <CardTitle className="text-base font-semibold text-zinc-800 mt-3">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500 mb-4">{item.description}</p>
              <Button
                onClick={() => handleDownload(item)}
                disabled={loadingItems.has(item.id)}
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {loadingItems.has(item.id) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 lg:p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Informasi Backup</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>File backup dalam format Excel (.xlsx)</li>
            <li>Data yang diunduh mencakup semua record dari database</li>
            <li>Nama file akan mencantumkan tanggal dan waktu backup</li>
            <li>Simpan file backup di tempat yang aman</li>
            <li>Disarankan melakukan backup secara berkala</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
