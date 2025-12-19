"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Anggota {
  id: string;
  nama: string;
  noTelp: string | null;
}

export default function TambahPengeluaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anggota[]>([]);
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [bukti, setBukti] = useState<File | null>(null);
  const [useToday, setUseToday] = useState(true);
  const [formData, setFormData] = useState({
    jenis: "",
    jumlah: "",
    tanggal: new Date().toISOString().split("T")[0],
    keterangan: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchAnggota(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchAnggota = async (query: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/search?q=${query}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching anggota:", error);
    }
  };

  const selectAnggota = (anggota: Anggota) => {
    setSelectedAnggota(anggota);
    setSearchQuery(anggota.nama);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAnggota) {
      toast.error("Pilih anggota koperasi terlebih dahulu");
      return;
    }

    if (!formData.jenis) {
      toast.error("Pilih jenis pengeluaran");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("anggotaId", selectedAnggota.id);
      formDataToSend.append("jenis", formData.jenis);
      formDataToSend.append("jumlah", formData.jumlah);
      formDataToSend.append("tanggal", formData.tanggal);
      if (formData.keterangan) {
        formDataToSend.append("keterangan", formData.keterangan);
      }
      if (bukti) {
        formDataToSend.append("bukti", bukti);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/pengeluaran`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Pengeluaran berhasil ditambahkan!");
        router.push("/koperasi");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan pengeluaran");
      }
    } catch (error) {
      toast.error("Gagal menambahkan pengeluaran");
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
            Tambah Pengeluaran
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Tambahkan pengeluaran koperasi (Belanja / Pinjaman)
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Anggota Search */}
            <div className="space-y-2">
              <Label htmlFor="anggota" className="text-xs lg:text-sm">
                Anggota Koperasi <span className="text-red-500">*</span>
              </Label>

              {selectedAnggota ? (
                <Card className="border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs lg:text-sm">
                        {selectedAnggota.nama?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-emerald-900 text-sm lg:text-base">
                          {selectedAnggota.nama}
                        </p>
                        {selectedAnggota.noTelp && (
                          <p className="text-xs text-emerald-700">
                            {selectedAnggota.noTelp}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAnggota(null);
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
                    id="anggota"
                    placeholder="Cari anggota koperasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowResults(true)
                    }
                    className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((anggota) => (
                        <button
                          key={anggota.id}
                          type="button"
                          onClick={() => selectAnggota(anggota)}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors border-b border-zinc-100 last:border-b-0"
                        >
                          <p className="font-medium text-zinc-900 text-sm">
                            {anggota.nama}
                          </p>
                          {anggota.noTelp && (
                            <p className="text-xs text-zinc-500">
                              {anggota.noTelp}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Jenis Pengeluaran */}
            <div className="space-y-2">
              <Label htmlFor="jenis" className="text-xs lg:text-sm">
                Jenis Pengeluaran <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jenis}
                onValueChange={(value) =>
                  setFormData({ ...formData, jenis: value })
                }
              >
                <SelectTrigger className="text-xs lg:text-sm h-9 lg:h-10">
                  <SelectValue placeholder="Pilih jenis pengeluaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELANJA" className="text-xs lg:text-sm">
                    Belanja
                  </SelectItem>
                  <SelectItem value="PINJAMAN" className="text-xs lg:text-sm">
                    Pinjaman
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jumlah */}
            <div className="space-y-2">
              <Label htmlFor="jumlah" className="text-xs lg:text-sm">
                Jumlah (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jumlah"
                type="number"
                placeholder="Masukkan jumlah"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
                required
                min="0"
                step="1000"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-xs lg:text-sm">
                Tanggal <span className="text-red-500">*</span>
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
                          tanggal: new Date().toISOString().split("T")[0],
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label
                    htmlFor="useToday"
                    className="text-xs lg:text-sm font-normal cursor-pointer"
                  >
                    Gunakan tanggal hari ini
                  </Label>
                </div>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => {
                    setFormData({ ...formData, tanggal: e.target.value });
                    setUseToday(false);
                  }}
                  disabled={useToday}
                  className={`text-xs lg:text-sm h-9 lg:h-10 ${
                    useToday ? "bg-zinc-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-xs lg:text-sm">
                Keterangan
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Keterangan tambahan (opsional)"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="text-xs lg:text-sm min-h-[60px]"
              />
            </div>

            {/* Bukti */}
            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">Bukti (Opsional)</Label>
              <FileUpload
                onFileSelect={setBukti}
                accept="image/*,application/pdf"
                maxSize={5}
              />
            </div>

            {/* Buttons */}
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
                disabled={isLoading || !selectedAnggota || !formData.jenis}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
