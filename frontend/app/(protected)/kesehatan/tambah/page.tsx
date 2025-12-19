"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

export default function TambahKesehatanPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    jenisAsuransi: "" as "" | "BPJS" | "NON_BPJS",
    noBpjs: "",
    noAsuransi: "",
    riwayatSakit: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

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

  const selectSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setSearchQuery(siswa.nama);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSiswa) {
      toast.error("Pilih santri / santriwati terlebih dahulu");
      return;
    }

    if (!formData.riwayatSakit) {
      toast.error("Riwayat sakit wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            siswaId: selectedSiswa.id,
            jenisAsuransi: formData.jenisAsuransi || undefined,
            noBpjs: formData.jenisAsuransi === "BPJS" ? formData.noBpjs : undefined,
            noAsuransi: formData.jenisAsuransi === "NON_BPJS" ? formData.noAsuransi : undefined,
            riwayatSakit: formData.riwayatSakit,
            tanggal: formData.tanggal,
          }),
        }
      );

      if (response.ok) {
        toast.success("Data kesehatan berhasil ditambahkan!");
        router.push("/kesehatan");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan data kesehatan");
      }
    } catch (error) {
      toast.error("Gagal menambahkan data kesehatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
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
            Tambah Data Kesehatan
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Isi formulir untuk menambahkan data kesehatan santri / santriwati
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Data Kesehatan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Search Siswa */}
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
                    onFocus={() => siswaList.length > 0 && setShowResults(true)}
                    className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
                    required
                  />
                  {showResults && siswaList.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {siswaList.map((siswa) => (
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

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-xs lg:text-sm">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
                required
              />
            </div>

            {/* Jenis Asuransi */}
            <div className="space-y-2">
              <Label htmlFor="jenisAsuransi" className="text-xs lg:text-sm">Jenis Asuransi (Opsional)</Label>
              <Select
                value={formData.jenisAsuransi}
                onValueChange={(value: "BPJS" | "NON_BPJS") =>
                  setFormData({ ...formData, jenisAsuransi: value, noBpjs: "", noAsuransi: "" })
                }
              >
                <SelectTrigger className="text-xs lg:text-sm h-9 lg:h-10">
                  <SelectValue placeholder="Pilih jenis asuransi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPJS">BPJS</SelectItem>
                  <SelectItem value="NON_BPJS">Non BPJS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* No BPJS - tampil jika pilih BPJS */}
            {formData.jenisAsuransi === "BPJS" && (
              <div className="space-y-2">
                <Label htmlFor="noBpjs" className="text-xs lg:text-sm">
                  No BPJS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="noBpjs"
                  placeholder="Masukkan nomor BPJS..."
                  value={formData.noBpjs}
                  onChange={(e) =>
                    setFormData({ ...formData, noBpjs: e.target.value })
                  }
                  className="text-xs lg:text-sm h-9 lg:h-10"
                  required
                />
              </div>
            )}

            {/* No Asuransi - tampil jika pilih Non BPJS */}
            {formData.jenisAsuransi === "NON_BPJS" && (
              <div className="space-y-2">
                <Label htmlFor="noAsuransi" className="text-xs lg:text-sm">
                  No Asuransi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="noAsuransi"
                  placeholder="Masukkan nomor asuransi..."
                  value={formData.noAsuransi}
                  onChange={(e) =>
                    setFormData({ ...formData, noAsuransi: e.target.value })
                  }
                  className="text-xs lg:text-sm h-9 lg:h-10"
                  required
                />
              </div>
            )}

            {/* Riwayat Sakit */}
            <div className="space-y-2">
              <Label htmlFor="riwayatSakit" className="text-xs lg:text-sm">
                Riwayat Sakit <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="riwayatSakit"
                placeholder="Jelaskan riwayat sakit atau keluhan kesehatan..."
                value={formData.riwayatSakit}
                onChange={(e) =>
                  setFormData({ ...formData, riwayatSakit: e.target.value })
                }
                rows={4}
                className="text-xs lg:text-sm"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:flex-1 text-xs lg:text-sm h-9 lg:h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isSubmitting || !selectedSiswa}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
