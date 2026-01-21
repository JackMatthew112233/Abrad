"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Save, BookOpen, X, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

interface NilaiItem {
  mataPelajaran: string;
  mapelId: string;
  nilaiId: string | null;
  jenisNilai: string | null;
  nilai: number | null;
}

export default function TambahNilaiPage() {
  const router = useRouter();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Form states - pengaturan dulu
  const [semester, setSemester] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  
  // Nilai states
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Search siswa with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2 && !selectedSiswa) {
        searchSiswa(searchQuery);
      } else if (searchQuery.length <= 2) {
        setSiswaList([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedSiswa]);

  // Load data when all required fields are filled
  useEffect(() => {
    if (selectedSiswa && semester && tahunAjaran) {
      loadNilaiData();
    } else {
      // Reset jika ada yang berubah
      setNilaiList([]);
      setDataLoaded(false);
    }
  }, [selectedSiswa?.id, semester, tahunAjaran]);

  const searchSiswa = async (query: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/search-siswa?q=${query}`,
        { credentials: "include" }
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

  const selectSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setSearchQuery(siswa.nama);
    setShowResults(false);
    setSiswaList([]);
  };

  const clearSelection = () => {
    setSelectedSiswa(null);
    setSearchQuery("");
    setNilaiList([]);
    setDataLoaded(false);
  };

  const loadNilaiData = async () => {
    if (!selectedSiswa || !semester || !tahunAjaran) return;
    
    setIsLoading(true);
    setDataLoaded(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai/siswa/${selectedSiswa.id}/bulk?semester=${encodeURIComponent(semester)}&tahunAjaran=${encodeURIComponent(tahunAjaran)}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setNilaiList(data.mataPelajaranList || []);
        setDataLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching nilai:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJenisNilaiChange = (mataPelajaran: string, value: string) => {
    setNilaiList((prev) =>
      prev.map((item) =>
        item.mataPelajaran === mataPelajaran
          ? { ...item, jenisNilai: value }
          : item
      )
    );
  };

  const handleNilaiChange = (mataPelajaran: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    
    if (numValue !== null && (numValue < 0 || numValue > 100)) {
      return;
    }

    setNilaiList((prev) =>
      prev.map((item) =>
        item.mataPelajaran === mataPelajaran
          ? { ...item, nilai: numValue }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSiswa) {
      toast.error("Pilih santri/santriwati terlebih dahulu");
      return;
    }

    if (!semester || !tahunAjaran) {
      toast.error("Semester dan Tahun Ajaran wajib diisi");
      return;
    }

    const filledNilai = nilaiList.filter(
      (item) => item.nilai !== null && item.jenisNilai
    );
    if (filledNilai.length === 0) {
      toast.error("Isi minimal satu nilai dengan jenis nilai");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            siswaId: selectedSiswa.id,
            semester,
            tahunAjaran,
            tanggal,
            nilaiList: nilaiList.map((item) => ({
              mataPelajaran: item.mataPelajaran,
              jenisNilai: item.jenisNilai,
              nilai: item.nilai,
            })),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Data nilai berhasil disimpan!");
        router.push("/nilai");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menyimpan data nilai");
      }
    } catch (error) {
      toast.error("Gagal menyimpan data nilai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCount = nilaiList.filter(
    (item) => item.nilai !== null && item.jenisNilai
  ).length;

  const isFormReady = selectedSiswa && semester && tahunAjaran;

  return (
    <div className="space-y-6 relative">
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
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Tambah Data Nilai
          </h1>
          <p className="text-zinc-600">
            Input nilai untuk semua mata pelajaran sekaligus
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Pilih Siswa */}
        <Card className="border-zinc-200 bg-white overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-emerald-700 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">1</div>
              Pilih Santri / Santriwati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Cari nama santri / santriwati..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedSiswa) {
                      clearSelection();
                    }
                  }}
                  onFocus={() => {
                    if (siswaList.length > 0 && !selectedSiswa) {
                      setShowResults(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click on dropdown
                    setTimeout(() => setShowResults(false), 200);
                  }}
                  className="pl-10"
                />
                {showResults && siswaList.length > 0 && (
                  <div className="absolute z-[100] mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-xl max-h-60 overflow-y-auto">
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
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                      {selectedSiswa.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">
                        {selectedSiswa.nama}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        {selectedSiswa.tingkatan && (
                          <span className="text-xs text-emerald-700">
                            {selectedSiswa.tingkatan}
                          </span>
                        )}
                        {selectedSiswa.kelas && (
                          <span className="text-xs text-emerald-700">
                            • {selectedSiswa.kelas.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-zinc-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Pengaturan (Semester & Tahun Ajaran) - WAJIB DULU */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-emerald-700 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">2</div>
              Pengaturan Semester & Tahun Ajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Semester <span className="text-red-500">*</span></Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                    <SelectItem value="Genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tahun Ajaran <span className="text-red-500">*</span></Label>
                <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024">2023/2024</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                    <SelectItem value="2026/2027">2026/2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal Input</Label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Input Nilai */}
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-emerald-700 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">3</div>
                Input Nilai per Mata Pelajaran
              </CardTitle>
              {dataLoaded && nilaiList.length > 0 && (
                <span className="text-sm text-zinc-500">
                  {filledCount} dari {nilaiList.length} nilai terisi
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isFormReady ? (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-zinc-200" />
                <p className="text-lg font-medium text-zinc-400">Lengkapi data di atas terlebih dahulu</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {!selectedSiswa && "Pilih santri/santriwati, "}
                  {!semester && "pilih semester, "}
                  {!tahunAjaran && "pilih tahun ajaran"}
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-zinc-500">Memuat data mata pelajaran...</p>
              </div>
            ) : nilaiList.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-zinc-200" />
                <p className="text-lg font-medium text-zinc-400">Tidak ada mata pelajaran</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Belum ada mata pelajaran untuk kelas {selectedSiswa?.kelas?.replace("_", " ")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/nilai/mata-pelajaran")}
                  className="mt-4"
                >
                  Tambah Mata Pelajaran
                </Button>
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead className="font-semibold text-emerald-700 w-12 text-center">No</TableHead>
                        <TableHead className="font-semibold text-emerald-700">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-emerald-700 w-36">Jenis Nilai</TableHead>
                        <TableHead className="font-semibold text-emerald-700 w-28 text-center">Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nilaiList.map((item, index) => (
                        <TableRow key={item.mapelId}>
                          <TableCell className="text-zinc-500 text-center">{index + 1}</TableCell>
                          <TableCell className="font-medium text-zinc-800">{item.mataPelajaran}</TableCell>
                          <TableCell>
                            <Select
                              value={item.jenisNilai || ""}
                              onValueChange={(value) => handleJenisNilaiChange(item.mataPelajaran, value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Pilih" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HARIAN">Harian</SelectItem>
                                <SelectItem value="TUGAS">Tugas</SelectItem>
                                <SelectItem value="UTS">UTS</SelectItem>
                                <SelectItem value="UAS">UAS</SelectItem>
                                <SelectItem value="PRAKTIK">Praktik</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="-"
                              value={item.nilai ?? ""}
                              onChange={(e) => handleNilaiChange(item.mataPelajaran, e.target.value)}
                              className="text-center h-9"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting || !dataLoaded || filledCount === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : `Simpan ${filledCount > 0 ? `${filledCount} ` : ""}Nilai`}
          </Button>
        </div>
      </form>
    </div>
  );
}
