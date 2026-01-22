"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  CheckCircle,
  BookOpen,
  Users,
  UserCheck,
  Settings,
  Table,
  Search,
  ArrowRight,
  Sparkles,
  History,
  ChevronRight,
  AlertTriangle,
  X,
  Filter,
  Wallet,
} from "lucide-react";

// Illustration for Bulk Nilai Input
function BulkNilaiIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Ilustrasi Flow Baru</div>
      
      {/* Step by Step */}
      <div className="space-y-3">
        {/* Step 1 */}
        <div className="bg-white rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</div>
            <span className="text-sm font-medium text-zinc-700">Pilih Santri / Santriwati</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 ml-8">
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-500">Cari nama santri...</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</div>
            <span className="text-sm font-medium text-zinc-700">Pilih Semester & Tahun Ajaran</span>
          </div>
          <div className="grid grid-cols-2 gap-2 ml-8">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-600">
              Semester: Ganjil
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-600">
              TA: 2025/2026
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</div>
            <span className="text-sm font-medium text-zinc-700">Input Nilai Semua Mapel Sekaligus</span>
          </div>
          <div className="ml-8 border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="text-left p-2 font-medium text-emerald-700">Mata Pelajaran</th>
                  <th className="text-center p-2 font-medium text-emerald-700 w-20">Jenis</th>
                  <th className="text-center p-2 font-medium text-emerald-700 w-16">Nilai</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-100">
                  <td className="p-2 text-zinc-700">Fiqh</td>
                  <td className="p-2 text-center text-zinc-500">UAS</td>
                  <td className="p-2 text-center font-medium text-emerald-700">85</td>
                </tr>
                <tr className="border-t border-zinc-100">
                  <td className="p-2 text-zinc-700">Hadits</td>
                  <td className="p-2 text-center text-zinc-500">UAS</td>
                  <td className="p-2 text-center font-medium text-emerald-700">90</td>
                </tr>
                <tr className="border-t border-zinc-100">
                  <td className="p-2 text-zinc-700">Tajwid</td>
                  <td className="p-2 text-center text-zinc-500">UAS</td>
                  <td className="p-2 text-center font-medium text-emerald-700">88</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Before/After Summary */}
      <div className="mt-4 pt-4 border-t border-zinc-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-red-600 flex items-center gap-1 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Sebelum
            </div>
            <p className="text-xs text-zinc-500">Input nilai satu per satu, pilih mapel dari dropdown setiap kali</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sesudah
            </div>
            <p className="text-xs text-zinc-500">Input semua nilai sekaligus dalam satu tabel, lebih cepat dan efisien</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Illustration for KPI Cards with Status Breakdown
function KPICardBreakdownIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200 space-y-4">
      {/* Bug Fix Section */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Bug Fix - KPI Santri Aktif
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-red-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500 line-through">Santri Aktif</span>
              <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-red-500 mb-1">118</div>
            <p className="text-[10px] text-red-500">Menghitung SEMUA status (bug)</p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Santri / Santriwati Aktif</span>
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mb-1">98</div>
            <p className="text-[10px] text-emerald-600">Hanya status AKTIF (fixed)</p>
          </div>
        </div>
      </div>

      {/* New Feature Section */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Fitur Baru - Badge Breakdown Status
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-red-600">Sebelum</div>
            <div className="bg-white rounded-lg border border-zinc-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Total Santri / Santriwati</span>
                <Users className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-2">118</div>
              <p className="text-xs text-emerald-600 font-semibold">76 Santri • 40 Santriwati</p>
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-600">Sesudah</div>
            <div className="bg-white rounded-lg border border-zinc-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Total Santri / Santriwati</span>
                <Users className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-2">118</div>
              <p className="text-xs text-zinc-500 mb-2">76 Santri dan 40 Santriwati</p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                  98 Aktif
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                  15 Lulus
                </Badge>
                <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                  5 Tidak Aktif
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All KPI Cards Preview */}
      <div className="pt-4 border-t border-zinc-200">
        <div className="text-xs text-zinc-500 mb-2">Semua KPI Card yang diperbarui:</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg border border-emerald-200 p-2">
            <div className="flex items-center justify-between mb-1">
              <Users className="h-3 w-3 text-emerald-600" />
              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1 rounded">UPDATED</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-medium block">Total Santri / Santriwati</span>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-2">
            <div className="flex items-center justify-between mb-1">
              <Users className="h-3 w-3 text-emerald-600" />
              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1 rounded">UPDATED</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-medium block">Santri</span>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-2">
            <div className="flex items-center justify-between mb-1">
              <Users className="h-3 w-3 text-emerald-600" />
              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1 rounded">UPDATED</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-medium block">Santriwati</span>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-2">
            <div className="flex items-center justify-between mb-1">
              <UserCheck className="h-3 w-3 text-emerald-600" />
              <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">FIXED</span>
            </div>
            <span className="text-[10px] text-zinc-700 font-medium block">Santri / Santriwati Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Illustration for Dashboard KPI Fix
function DashboardKPIFixIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200 space-y-4">
      {/* Before/After Section */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Perubahan KPI Card di Dashboard
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-red-600">Sebelum</div>
            <div className="bg-white rounded-lg border border-red-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500 line-through">Total Santri Aktif</span>
                <Users className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-red-500 mb-1">118</div>
              <p className="text-[10px] text-zinc-500">76 putra • 42 putri</p>
              <p className="text-[10px] text-red-400 mt-2 italic">Bug: Menghitung berdasarkan isAktif (boolean), menghitung SEMUA status</p>
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-600">Sesudah</div>
            <div className="bg-white rounded-lg border border-emerald-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Total Santri / Santriwati Aktif</span>
                <Users className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-1">98</div>
              <p className="text-[10px] text-zinc-500 mb-2">83.1% dari total</p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                  98 Aktif
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                  15 Lulus
                </Badge>
                <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] px-1.5 py-0 h-5">
                  5 Tidak Aktif
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Changed */}
      <div className="pt-3 border-t border-zinc-200">
        <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Perubahan yang Dilakukan</div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-zinc-600">KPI sekarang hanya menghitung santri dengan status AKTIF saja</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-zinc-600">Menampilkan persentase dari total santri</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-zinc-600">Ditambahkan badge breakdown status: Aktif, Lulus, Tidak Aktif</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-zinc-600">Konsisten dengan KPI &quot;Santri / Santriwati Aktif&quot; di halaman Kelola Santri</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Illustration for Keuangan Filter Feature
function KeuanganFilterIllustration() {
  return (
    <div className="bg-zinc-50 rounded-xl p-4 lg:p-6 border border-zinc-200 space-y-4">
      {/* Filter Location */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Lokasi Filter
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-emerald-200 p-3">
            <div className="text-xs font-medium text-emerald-700">Halaman Kelola Keuangan</div>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-3">
            <div className="text-xs font-medium text-emerald-700">Halaman Semua Riwayat Pembayaran</div>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-3">
            <div className="text-xs font-medium text-emerald-700">Halaman Semua Riwayat Pengeluaran</div>
          </div>
        </div>
      </div>

      {/* What's Filtered */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Yang Dipengaruhi Filter
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
            <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] text-emerald-700 block">Chart Trend Pembayaran</span>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
            <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] text-emerald-700 block">Chart Target vs Realisasi</span>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
            <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] text-emerald-700 block">Chart Distribusi</span>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
            <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] text-emerald-700 block">Riwayat Terbaru</span>
          </div>
        </div>
      </div>

      {/* What's NOT Filtered */}
      <div>
        <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Yang TIDAK Dipengaruhi Filter
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-red-700">4 KPI Cards</div>
                <div className="text-[10px] text-red-600 mt-1">
                  Total Komitmen, Total Infaq, Total Laundry, Total Donasi
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 italic">
                  Alasan: KPI menampilkan data komitmen/target yang bersifat tetap, bukan transaksi berbasis waktu
                </div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-red-700">Tabel Daftar Biodata Keuangan</div>
                <div className="text-[10px] text-red-600 mt-1">
                  Data komitmen infaq & laundry per santri
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 italic">
                  Alasan: Biodata keuangan adalah data profil santri, bukan data transaksi yang memiliki tanggal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Preview */}
      <div className="pt-3 border-t border-zinc-200">
        <div className="text-xs text-zinc-500 mb-2">Preview Filter Dropdown:</div>
        <div className="flex items-center gap-2">
          <div className="bg-white rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 flex items-center gap-2">
            <span>Januari</span>
            <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
          <div className="bg-white rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 flex items-center gap-2">
            <span>2026</span>
            <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
          <span className="text-[10px] text-zinc-400 ml-2">Auto-select tahun saat bulan dipilih</span>
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
  alert?: string;
}

function UpdateCard({ number, title, description, highlights, illustration, alert }: UpdateCardProps) {
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

        {/* Alert */}
        {alert && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Perhatian</div>
              <p className="text-sm text-amber-700">{alert}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PembaharuanPage() {
  const updates = [
    {
      number: 1,
      title: "Input Nilai Bulk - Semua Mata Pelajaran Sekaligus",
      description: "Fitur baru untuk menginput nilai semua mata pelajaran dalam satu halaman. Tidak perlu lagi memilih mata pelajaran satu per satu dari dropdown.",
      highlights: [
        "Pilih siswa → Pilih semester & tahun ajaran → Semua mapel langsung muncul",
        "Setiap mapel memiliki dropdown jenis nilai (Harian/Tugas/UTS/UAS/Praktik)",
        "Nilai existing otomatis ter-load saat pilih semester & tahun ajaran",
        "Simpan semua nilai sekaligus dengan satu klik",
      ],
      illustration: <BulkNilaiIllustration />,
    },
    {
      number: 2,
      title: "Perbaikan & Peningkatan KPI Cards di Halaman Kelola Santri",
      description: "Pembaruan menyeluruh pada 4 KPI Card di halaman Kelola Santri / Santriwati dengan penambahan breakdown status dan perbaikan bug perhitungan.",
      highlights: [
        "KPI 'Total Santri / Santriwati': Ditambahkan badge breakdown (Aktif, Lulus, Tidak Aktif) dan format teks diubah menjadi 'X Santri dan Y Santriwati'",
        "KPI 'Santri': Ditambahkan badge breakdown status (Aktif, Lulus, Tidak Aktif) untuk santri laki-laki",
        "KPI 'Santriwati': Ditambahkan badge breakdown status (Aktif, Lulus, Tidak Aktif) untuk santri perempuan",
        "KPI 'Santri Aktif' diubah nama menjadi 'Santri / Santriwati Aktif' dan diperbaiki perhitungannya agar hanya menghitung yang berstatus AKTIF (sebelumnya menghitung semua status)",
        "Badge berwarna: Hijau untuk Aktif, Biru untuk Lulus, Abu-abu untuk Tidak Aktif",
      ],
      illustration: <KPICardBreakdownIllustration />,
      alert: "Jika Jenis Kelamin tidak diinput pada biodata santri, maka santri tersebut tidak akan terhitung di KPI 'Santri' maupun 'Santriwati', namun tetap terhitung di 'Total'. Pastikan semua data Jenis Kelamin terisi dengan benar.",
    },
    {
      number: 3,
      title: "Filter Periode di Halaman Kelola Keuangan",
      description: "Fitur filter berdasarkan Bulan dan Tahun untuk memfilter data keuangan di halaman Kelola Keuangan, Riwayat Pembayaran, dan Riwayat Pengeluaran.",
      highlights: [
        "Filter dropdown Bulan (Januari - Desember) dan Tahun (5 tahun terakhir) tersedia di 3 halaman: Kelola Keuangan, Riwayat Pembayaran, dan Riwayat Pengeluaran",
        "Auto-select tahun saat ini jika memilih bulan tanpa tahun",
        "Data yang difilter: Chart Trend Pembayaran, Chart Target vs Realisasi, Chart Distribusi, Riwayat Pembayaran Terbaru, Riwayat Pengeluaran Terbaru",
        "Halaman Riwayat Pembayaran: Tabel data pembayaran difilter berdasarkan tanggal pembayaran",
        "Halaman Riwayat Pengeluaran: Tabel data pengeluaran difilter berdasarkan tanggal pengeluaran",
      ],
      illustration: <KeuanganFilterIllustration />,
      alert: "Filter TIDAK mempengaruhi KPI Cards (Total Komitmen, Total Infaq, Total Laundry, Total Donasi) dan Tabel Daftar Biodata Keuangan. Alasannya: KPI menampilkan total komitmen/target yang bersifat tetap (bukan transaksi), sedangkan Tabel Biodata Keuangan menampilkan data profil keuangan santri yang tidak berbasis waktu.",
    },
    {
      number: 4,
      title: "Perbaikan KPI Total Santri / Santriwati Aktif di Dashboard",
      description: "Perbaikan bug pada KPI Card 'Total Santri Aktif' di halaman Dashboard yang sebelumnya menghitung semua status santri. Sekarang konsisten dengan KPI 'Santri / Santriwati Aktif' di halaman Kelola Santri.",
      highlights: [
        "Perbaikan bug: KPI sekarang hanya menghitung santri dengan status AKTIF (sebelumnya menghitung semua status karena menggunakan field isAktif boolean)",
        "Nama KPI diubah dari 'Total Santri Aktif' menjadi 'Total Santri / Santriwati Aktif'",
        "Menampilkan persentase santri aktif dari total santri (contoh: '83.1% dari total')",
        "Ditambahkan badge breakdown status: Aktif (hijau), Lulus (biru), Tidak Aktif (abu-abu)",
        "Tampilan konsisten dengan KPI 'Santri / Santriwati Aktif' di halaman Kelola Santri / Santriwati",
      ],
      illustration: <DashboardKPIFixIllustration />,
    },
  ];

  const archives = [
    {
      date: "21 Januari 2026",
      href: "/pembaharuan/arsip/21-januari-2026",
      summary: "Perbaikan status santri, terminologi, filter absensi, form absensi guru",
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
            Terakhir Diperbaharui 22 Januari 2026
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

      {/* Archive Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 via-zinc-50 to-white border border-zinc-200 p-4 lg:p-6">
        <div className="absolute -right-4 -top-4 opacity-5">
          <History className="h-40 w-40 text-zinc-900" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200">
              <History className="h-4 w-4 text-zinc-600" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-zinc-700">
              Arsip Pembaharuan Sebelumnya
            </h2>
          </div>
          
          <div className="space-y-3">
            {archives.map((archive) => (
              <Link
                key={archive.href}
                href={archive.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100 transition-all duration-200 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors flex-shrink-0">
                  <Newspaper className="h-5 w-5 text-zinc-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-zinc-800 group-hover:text-emerald-700 transition-colors">
                      {archive.date}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      4 Pembaharuan
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 truncate">{archive.summary}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 group-hover:bg-emerald-500 transition-colors flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
