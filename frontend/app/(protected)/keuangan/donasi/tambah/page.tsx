"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import { toast } from "sonner";

interface Siswa {
  id: string;
  nama: string;
  kelas: string | null;
  tingkatan: string | null;
}

export default function TambahDonasiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    jumlahDonasi: "",
  });
  
  // Search siswa states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSiswa = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/keuangan/search-siswa?q=${query}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Error searching siswa:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setFormData({ ...formData, nama: siswa.nama });
    setSearchQuery(siswa.nama);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedSiswa(null);
    setFormData({ ...formData, nama: "" });
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("jumlahDonasi", formData.jumlahDonasi);
      
      if (evidence) {
        formDataToSend.append("evidence", evidence);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/donasi`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Donasi berhasil ditambahkan!");
        router.push("/keuangan");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan donasi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan donasi");
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
            Tambah Donasi
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Isi formulir untuk menambahkan data donasi dari santri/santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Donasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-xs lg:text-sm">
                Nama Donatur (Santri/Santriwati) <span className="text-red-500">*</span>
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
                              {selectedSiswa.kelas.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
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
                    id="nama"
                    value={searchQuery}
                    onChange={(e) => handleSearchSiswa(e.target.value)}
                    placeholder="Cari nama santri/santriwati..."
                    required
                    className="pl-9 text-xs lg:text-sm h-9 lg:h-10"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((siswa) => (
                        <button
                          key={siswa.id}
                          type="button"
                          onClick={() => handleSelectSiswa(siswa)}
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
                                {siswa.kelas?.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg p-3 text-center text-zinc-500 text-xs">
                      Mencari...
                    </div>
                  )}
                  {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg p-3 text-center text-zinc-500 text-xs">
                      Tidak ditemukan santri dengan nama tersebut
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlahDonasi" className="text-xs lg:text-sm">
                Jumlah Donasi (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jumlahDonasi"
                type="number"
                value={formData.jumlahDonasi}
                onChange={(e) =>
                  setFormData({ ...formData, jumlahDonasi: e.target.value })
                }
                placeholder="Masukkan jumlah donasi"
                required
                min="0"
                step="1000"
                className="text-xs lg:text-sm h-9 lg:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence" className="text-xs lg:text-sm">
                Bukti Transfer (Opsional)
              </Label>
              <FileUpload
                accept="image/*"
                onFileSelect={(file) => setEvidence(file)}
                className="text-xs lg:text-sm"
              />
              {evidence && (
                <p className="text-xs text-zinc-500 mt-1">
                  File: {evidence.name}
                </p>
              )}
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
                disabled={isLoading || !selectedSiswa}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Donasi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
