"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

interface Absensi {
  id: string;
  tanggal: string;
  status: string;
  keterangan?: string;
}

export default function RekapAbsensiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchSiswa(searchQuery);
      } else {
        setSiswaList([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchSiswa = async (query: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/search-siswa?q=${query}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching siswa:", error);
    }
  };

  const selectSiswa = async (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setSearchQuery(siswa.nama);
    setShowResults(false);
    setIsLoading(true);

    try {
      // Get last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/siswa/${siswa.id}?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAbsensiList(data);
      } else {
        toast.error("Gagal memuat data absensi");
      }
    } catch (error) {
      toast.error("Gagal memuat data absensi");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      HADIR: "bg-emerald-50 text-emerald-700 border-emerald-200",
      TIDAK_HADIR: "bg-red-50 text-red-700 border-red-200",
      SAKIT: "bg-blue-50 text-blue-700 border-blue-200",
      IZIN: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      HADIR: "Hadir",
      TIDAK_HADIR: "Tidak Hadir",
      SAKIT: "Sakit",
      IZIN: "Izin",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const calculateStats = () => {
    const stats = {
      hadir: 0,
      tidakHadir: 0,
      sakit: 0,
      izin: 0,
    };

    absensiList.forEach((absensi) => {
      if (absensi.status === "HADIR") stats.hadir++;
      else if (absensi.status === "TIDAK_HADIR") stats.tidakHadir++;
      else if (absensi.status === "SAKIT") stats.sakit++;
      else if (absensi.status === "IZIN") stats.izin++;
    });

    return stats;
  };

  const stats = calculateStats();
  const totalAbsensi = absensiList.length;
  const persenKehadiran = totalAbsensi > 0 
    ? ((stats.hadir / totalAbsensi) * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-6">
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
            Rekap Kehadiran Santri / Santriwati
          </h1>
          <p className="text-zinc-600">
            Lihat riwayat kehadiran per santri / santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Cari Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari nama santri / santriwati..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => siswaList.length > 0 && setShowResults(true)}
              className="pl-10"
            />
            {showResults && siswaList.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                {siswaList.map((siswa) => (
                  <button
                    key={siswa.id}
                    type="button"
                    onClick={() => selectSiswa(siswa)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-zinc-100 last:border-b-0"
                  >
                    <p className="font-medium text-zinc-900">{siswa.nama}</p>
                    <div className="flex gap-2 mt-1">
                      {siswa.tingkatan && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          {siswa.tingkatan}
                        </span>
                      )}
                      {siswa.kelas && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {siswa.kelas?.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSiswa && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-700 mb-1">
                Data Kehadiran:
              </p>
              <p className="text-lg font-bold text-emerald-900">
                {selectedSiswa.nama}
              </p>
              <div className="flex gap-2 mt-1">
                {selectedSiswa.tingkatan && (
                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                    Tingkatan: {selectedSiswa.tingkatan}
                  </span>
                )}
                {selectedSiswa.kelas && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Kelas: {selectedSiswa.kelas?.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSiswa && (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-emerald-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700">
                  Hadir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{stats.hadir}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {persenKehadiran}% dari total
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700">
                  Tidak Hadir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{stats.tidakHadir}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {totalAbsensi > 0 ? ((stats.tidakHadir / totalAbsensi) * 100).toFixed(1) : "0"}% dari total
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700">
                  Sakit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{stats.sakit}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {totalAbsensi > 0 ? ((stats.sakit / totalAbsensi) * 100).toFixed(1) : "0"}% dari total
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700">
                  Izin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{stats.izin}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {totalAbsensi > 0 ? ((stats.izin / totalAbsensi) * 100).toFixed(1) : "0"}% dari total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Absensi History */}
          <Card className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-emerald-700">
                Riwayat Absensi (30 Hari Terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-zinc-500">
                  Memuat data...
                </div>
              ) : absensiList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  Belum ada data absensi
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                        <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                        <TableHead className="font-semibold text-emerald-700">Status</TableHead>
                        <TableHead className="font-semibold text-emerald-700">Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {absensiList.map((absensi) => (
                        <TableRow key={absensi.id}>
                          <TableCell className="font-medium">
                            {new Date(absensi.tanggal).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusBadge(absensi.status)}
                            >
                              {getStatusLabel(absensi.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-600">
                            {absensi.keterangan || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
