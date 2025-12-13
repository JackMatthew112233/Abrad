"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Search, Save } from "lucide-react";
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
            Tambah Data Pelanggaran
          </h1>
          <p className="text-zinc-600">
            Isi formulir di bawah untuk menambahkan data pelanggaran santri / santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Pelanggaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siswa">
                Nama Santri / Santriwati <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="siswa"
                    placeholder="Cari nama santri / santriwati..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    className="pl-10"
                    required
                  />
                </div>
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((siswa) => (
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
                <Card className="mt-3 border-emerald-200 bg-emerald-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                            {selectedSiswa.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-900">
                              {selectedSiswa.nama}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {selectedSiswa.tingkatan && (
                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                                  {selectedSiswa.tingkatan}
                                </span>
                              )}
                              {selectedSiswa.kelas && (
                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                                  {selectedSiswa.kelas.replace("_", " ")}
                                </span>
                              )}
                            </div>
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
                        className="text-zinc-600 hover:text-red-600"
                      >
                        Batal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sanksi">
                Jenis Sanksi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sanksi}
                onValueChange={(value) =>
                  setFormData({ ...formData, sanksi: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis sanksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RINGAN">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Ringan
                    </div>
                  </SelectItem>
                  <SelectItem value="SEDANG">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Sedang
                    </div>
                  </SelectItem>
                  <SelectItem value="BERAT">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Berat
                    </div>
                  </SelectItem>
                  <SelectItem value="SP1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      SP1
                    </div>
                  </SelectItem>
                  <SelectItem value="SP2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500" />
                      SP2
                    </div>
                  </SelectItem>
                  <SelectItem value="SP3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      SP3
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Evidence (Opsional)</Label>
              <FileUpload
                onFileSelect={setEvidence}
                accept="image/*,application/pdf"
                maxSize={5}
              />
              <p className="text-xs text-zinc-500">
                Upload gambar atau PDF sebagai bukti (Opsional)
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
