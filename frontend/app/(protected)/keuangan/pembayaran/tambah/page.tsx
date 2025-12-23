"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

export default function TambahPembayaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [buktiPembayaran, setBuktiPembayaran] = useState<File | null>(null);
  const [useToday, setUseToday] = useState(true);
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("id-ID", { month: "long" });
  const currentYear = currentDate.getFullYear();
  
  const [formData, setFormData] = useState({
    totalPembayaranInfaq: "",
    totalPembayaranLaundry: "",
    tanggalPembayaran: new Date().toISOString().split("T")[0],
    periodeBulan: currentMonth,
    periodeTahun: currentYear.toString(),
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchSiswa(searchQuery);
      } else {
        setSearchResults([]);
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
        setSearchResults(data);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSiswa) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    if (!buktiPembayaran) {
      toast.error("Upload bukti pembayaran terlebih dahulu");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("siswaId", selectedSiswa.id);
      formDataToSend.append("totalPembayaranInfaq", formData.totalPembayaranInfaq);
      formDataToSend.append("totalPembayaranLaundry", formData.totalPembayaranLaundry);
      formDataToSend.append("tanggalPembayaran", formData.tanggalPembayaran);
      formDataToSend.append("periodePembayaran", `${formData.periodeBulan} ${formData.periodeTahun}`);
      formDataToSend.append("buktiPembayaran", buktiPembayaran);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Pembayaran berhasil ditambahkan!");
        router.push("/keuangan");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan pembayaran");
      }
    } catch (error) {
      toast.error("Gagal menambahkan pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-8">
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hidden lg:flex text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-emerald-700">
            Tambah Pembayaran
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Isi formulir untuk menambahkan pembayaran santri/santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siswa" className="text-xs lg:text-sm">
                Nama Santri / Santriwati <span className="text-red-500">*</span>
              </Label>
              
              {selectedSiswa ? (
                <Card className="border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs lg:text-sm">
                        {selectedSiswa.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-emerald-900 text-sm lg:text-base">
                          {selectedSiswa.nama}
                        </p>
                        <div className="flex gap-1 mt-0.5">
                          {selectedSiswa.tingkatan && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              {selectedSiswa.tingkatan}
                            </span>
                          )}
                          {selectedSiswa.kelas && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              {selectedSiswa.kelas.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSiswa(null);
                        setSearchQuery("");
                      }}
                      className="text-emerald-700 hover:text-red-600 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="siswa"
                    placeholder="Cari nama santri / santriwati..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
                    required
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((siswa) => (
                        <button
                          key={siswa.id}
                          type="button"
                          onClick={() => selectSiswa(siswa)}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors border-b border-zinc-100 last:border-b-0"
                        >
                          <p className="font-medium text-zinc-900 text-sm">{siswa.nama}</p>
                          <div className="flex gap-1 mt-0.5">
                            {siswa.tingkatan && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                {siswa.tingkatan}
                              </span>
                            )}
                            {siswa.kelas && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                {siswa.kelas?.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="infaq" className="text-xs lg:text-sm">
                  Total Pembayaran Infaq <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="infaq"
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal infaq"
                  value={formData.totalPembayaranInfaq}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPembayaranInfaq: e.target.value })
                  }
                  className="text-xs lg:text-sm h-9 lg:h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laundry" className="text-xs lg:text-sm">
                  Total Pembayaran Laundry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laundry"
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal laundry"
                  value={formData.totalPembayaranLaundry}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPembayaranLaundry: e.target.value })
                  }
                  className="text-xs lg:text-sm h-9 lg:h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-xs lg:text-sm">
                Tanggal Pembayaran <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useToday"
                    checked={useToday}
                    onChange={(e) => {
                      setUseToday(e.target.checked);
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          tanggalPembayaran: new Date().toISOString().split("T")[0],
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="useToday" className="text-xs lg:text-sm font-normal cursor-pointer">
                    Gunakan tanggal hari ini
                  </Label>
                </div>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggalPembayaran}
                  onChange={(e) => {
                    setFormData({ ...formData, tanggalPembayaran: e.target.value });
                    setUseToday(false);
                  }}
                  disabled={useToday}
                  required
                  className={`text-xs lg:text-sm h-9 lg:h-10 ${useToday ? "bg-zinc-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">
                Periode Pembayaran <span className="text-red-500">*</span>
              </Label>
              <div className="grid gap-4 grid-cols-2">
                <Select
                  value={formData.periodeBulan}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodeBulan: value })
                  }
                >
                  <SelectTrigger className="text-xs lg:text-sm h-9 lg:h-10">
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Januari">Januari</SelectItem>
                    <SelectItem value="Februari">Februari</SelectItem>
                    <SelectItem value="Maret">Maret</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="Mei">Mei</SelectItem>
                    <SelectItem value="Juni">Juni</SelectItem>
                    <SelectItem value="Juli">Juli</SelectItem>
                    <SelectItem value="Agustus">Agustus</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                    <SelectItem value="Oktober">Oktober</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="Desember">Desember</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.periodeTahun}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodeTahun: value })
                  }
                >
                  <SelectTrigger className="text-xs lg:text-sm h-9 lg:h-10">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">
                Bukti Pembayaran <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                onFileSelect={setBuktiPembayaran}
                accept="image/*,application/pdf"
                maxSize={5}
                required
              />
              <p className="text-xs text-zinc-500">
                Upload gambar atau PDF bukti pembayaran (Wajib)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="w-full sm:w-auto text-xs lg:text-sm h-9 lg:h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isLoading || !buktiPembayaran || !selectedSiswa}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
