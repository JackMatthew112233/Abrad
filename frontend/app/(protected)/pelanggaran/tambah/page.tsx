"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Search, Save, X } from "lucide-react";
import { toast } from "sonner";
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

export default function TambahPelanggaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    sanksi: "",
    keterangan: "",
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

    if (!formData.sanksi) {
      toast.error("Pilih jenis sanksi");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("siswaId", selectedSiswa.id);
      formDataToSend.append("sanksi", formData.sanksi);
      formDataToSend.append("keterangan", formData.keterangan);

      if (evidence) {
        formDataToSend.append("evidence", evidence);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Pelanggaran berhasil ditambahkan!");
        router.push("/pelanggaran");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan pelanggaran");
      }
    } catch (error) {
      toast.error("Gagal menambahkan pelanggaran");
    } finally {
      setIsLoading(false);
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
            Tambah Data Pelanggaran
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Isi formulir untuk menambahkan data pelanggaran santri / santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Pelanggaran
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

            <div className="space-y-2">
              <Label htmlFor="sanksi" className="text-xs lg:text-sm">
                Jenis Sanksi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sanksi}
                onValueChange={(value) =>
                  setFormData({ ...formData, sanksi: value })
                }
                required
              >
                <SelectTrigger className="text-xs lg:text-sm h-9 lg:h-10">
                  <SelectValue placeholder="Pilih jenis sanksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RINGAN" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Ringan
                    </div>
                  </SelectItem>
                  <SelectItem value="SEDANG" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Sedang
                    </div>
                  </SelectItem>
                  <SelectItem value="BERAT" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Berat
                    </div>
                  </SelectItem>
                  <SelectItem value="SP1" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      SP1
                    </div>
                  </SelectItem>
                  <SelectItem value="SP2" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500" />
                      SP2
                    </div>
                  </SelectItem>
                  <SelectItem value="SP3" className="text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      SP3
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-xs lg:text-sm">
                Keterangan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Jelaskan pelanggaran yang dilakukan..."
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                rows={4}
                className="text-xs lg:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">Evidence (Opsional)</Label>
              <FileUpload
                onFileSelect={setEvidence}
                accept="image/*,application/pdf"
                maxSize={5}
              />
              <p className="text-xs text-zinc-500">
                Upload gambar atau PDF sebagai bukti (Opsional)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="w-full sm:flex-1 text-xs lg:text-sm h-9 lg:h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isLoading || !selectedSiswa}
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
