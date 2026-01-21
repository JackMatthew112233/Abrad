"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Newspaper,
  CheckCircle,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Heart,
  FileText,
  Search,
  Filter,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Illustration Components
function StatusBadgeIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Ilustrasi Perubahan</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Sebelum
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Ahmad Fadil</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Fatimah Zahra</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Muhammad Rizki</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic">Semua status tampil "Aktif" meski sudah diubah</p>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sesudah
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Ahmad Fadil</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Fatimah Zahra</span>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Lulus</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Muhammad Rizki</span>
              <Badge className="bg-zinc-100 text-zinc-600 border-zinc-300 text-xs">Tidak Aktif</Badge>
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic">Status tampil sesuai dengan yang diinput</p>
        </div>
      </div>

      {/* Color Legend */}
      <div className="mt-4 pt-4 border-t border-zinc-200">
        <div className="text-xs text-zinc-500 mb-2">Legenda Warna:</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Aktif</Badge>
            <span className="text-xs text-zinc-500">Hijau</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Lulus</Badge>
            <span className="text-xs text-zinc-500">Biru</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-zinc-100 text-zinc-600 border-zinc-300 text-xs">Tidak Aktif</Badge>
            <span className="text-xs text-zinc-500">Abu-abu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminologyIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Ilustrasi Perubahan</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Sebelum
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-zinc-500">Total</div>
                <div className="text-sm font-semibold line-through text-red-400">Santri Putra</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="text-xs text-zinc-500">Total</div>
                <div className="text-sm font-semibold">Santriwati</div>
              </div>
            </div>
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sesudah
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-zinc-500">Total</div>
                <div className="text-sm font-semibold text-emerald-700">Santri</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="text-xs text-zinc-500">Total</div>
                <div className="text-sm font-semibold text-emerald-700">Santriwati</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center gap-2 text-sm">
          <ArrowRight className="h-4 w-4 text-emerald-600" />
          <span className="text-zinc-600">"Santri Putra" / "Santri laki-laki"</span>
          <ArrowRight className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-emerald-700">"Santri"</span>
        </div>
      </div>
    </div>
  );
}

function FilterPeriodeIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Ilustrasi Fitur Baru</div>
      
      {/* Filter UI Mockup */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-600">Filter data berdasarkan periode</span>
          <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-lg px-3 py-1.5 shadow-sm">
            <Filter className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium">Minggu Ini</span>
            <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* KPI Cards Preview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-200">
            <div className="text-lg font-bold text-emerald-700">45</div>
            <div className="text-xs text-emerald-600">Hadir</div>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
            <div className="text-lg font-bold text-red-700">3</div>
            <div className="text-xs text-red-600">Tidak Hadir</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
            <div className="text-lg font-bold text-blue-700">2</div>
            <div className="text-xs text-blue-600">Sakit</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-200">
            <div className="text-lg font-bold text-amber-700">1</div>
            <div className="text-xs text-amber-600">Izin</div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border border-zinc-200 p-2 text-center">
          <Calendar className="h-4 w-4 text-zinc-500 mx-auto mb-1" />
          <span className="text-xs font-medium text-zinc-700">Hari Ini</span>
        </div>
        <div className="bg-emerald-50 rounded-lg border-2 border-emerald-400 p-2 text-center">
          <Calendar className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
          <span className="text-xs font-medium text-emerald-700">Minggu Ini</span>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-2 text-center">
          <Calendar className="h-4 w-4 text-zinc-500 mx-auto mb-1" />
          <span className="text-xs font-medium text-zinc-700">Semua</span>
        </div>
      </div>
    </div>
  );
}

function FormAbsensiGuruIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Ilustrasi Form Baru</div>
      
      <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-4">
        {/* Search */}
        <div>
          <div className="text-xs text-zinc-500 mb-1.5">Cari Nama Guru</div>
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-500">Ketik nama atau NIP...</span>
          </div>
        </div>

        {/* Selected Teacher */}
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-emerald-700">Ustadz Ahmad Rahman</div>
            <div className="text-xs text-emerald-600">NIP: 198501012010011001</div>
          </div>
          <GraduationCap className="h-6 w-6 text-emerald-300" />
        </div>

        {/* Status Cards */}
        <div>
          <div className="text-xs text-zinc-500 mb-1.5">Status Kehadiran</div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-emerald-500 text-white rounded-lg p-2 text-center border-2 border-emerald-500">
              <UserCheck className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs font-medium">Hadir</span>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
              <UserX className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-red-700">Tidak Hadir</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
              <Heart className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-blue-700">Sakit</span>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-200">
              <FileText className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-amber-700">Izin</span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="text-xs text-zinc-500 mb-1.5">Tanggal</div>
          <div className="flex gap-2">
            <div className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Hari Ini
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-600">
              Pilih Tanggal Lain
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update Card Component
interface UpdateCardProps {
  number: number;
  title: string;
  description: string;
  highlights: string[];
  illustration: React.ReactNode;
}

function UpdateCard({ number, title, description, highlights, illustration }: UpdateCardProps) {
  return (
    <Card className="border-zinc-200 bg-white overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
            <span className="text-lg font-bold text-emerald-700">{number}</span>
          </div>
          <div>
            <CardTitle className="text-base lg:text-lg font-bold text-zinc-800 leading-tight">
              {title}
            </CardTitle>
            <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Illustration */}
        {illustration}

        {/* Highlights */}
        <div className="space-y-2">
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Poin Penting
          </div>
          <div className="grid gap-2">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-zinc-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PembaharuanPage() {
  const updates = [
    {
      number: 1,
      title: "Perbaikan Tampilan Status Santri di Halaman Daftar",
      description: "Status santri (Aktif/Tidak Aktif/Lulus) sekarang ditampilkan dengan benar sesuai yang diinput. Sebelumnya, semua status selalu tampil 'Aktif' meskipun sudah diubah.",
      highlights: [
        "Status sinkron antara form biodata dan tabel daftar santri",
        "Warna badge berbeda untuk setiap status (Hijau/Biru/Abu-abu)",
        "Laporan dan statistik santri menjadi lebih akurat",
      ],
      illustration: <StatusBadgeIllustration />,
    },
    {
      number: 2,
      title: "Perbaikan Konsistensi Terminologi 'Santri'",
      description: "Menghilangkan penggunaan kata yang redundan seperti 'Santri Putra' dan 'Santri laki-laki'. Sekarang menggunakan terminologi standar: 'Santri' untuk putra, 'Santriwati' untuk putri.",
      highlights: [
        "Terminologi lebih profesional dan konsisten",
        "Tampilan statistik di Dashboard lebih ringkas",
        "Menghilangkan redundansi yang membingungkan",
      ],
      illustration: <TerminologyIllustration />,
    },
    {
      number: 3,
      title: "Filter Periode di Semua Halaman Absensi",
      description: "Fitur baru untuk memfilter data absensi berdasarkan periode waktu (Hari Ini / Minggu Ini / Semua) di halaman Absensi Kelas, Asrama, Pengajian, Tahfidz, dan Guru.",
      highlights: [
        "Filter tersedia di pojok kanan atas halaman absensi",
        "KPI Cards, Tabel, dan Grafik otomatis diperbarui",
        "Memudahkan monitoring kehadiran harian/mingguan",
      ],
      illustration: <FilterPeriodeIllustration />,
    },
    {
      number: 4,
      title: "Form Input Absensi Guru yang Lebih Simpel",
      description: "Tampilan baru form input absensi guru dengan desain modern - pencarian guru autocomplete, card status berwarna, dan pilihan tanggal yang praktis.",
      highlights: [
        "Search bar dengan dropdown hasil pencarian otomatis",
        "Card status visual berwarna untuk setiap pilihan",
        "Tombol 'Hari Ini' sebagai default tanggal",
      ],
      illustration: <FormAbsensiGuruIllustration />,
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <Newspaper className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Terakhir Diperbaharui 21 Januari 2026
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Pembaharuan Sistem
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Riwayat update, fitur baru, dan perbaikan sistem manajemen pesantren
          </p>
        </div>
      </div>

      {/* Updates Grid */}
      <div className="grid gap-4 lg:gap-6">
        {updates.map((update) => (
          <UpdateCard key={update.number} {...update} />
        ))}
      </div>
    </div>
  );
}
