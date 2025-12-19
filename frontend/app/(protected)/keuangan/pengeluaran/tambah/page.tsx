"use client";

import { useState } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function TambahPengeluaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [bukti, setBukti] = useState<File | null>(null);
  const [useToday, setUseToday] = useState(true);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    harga: "",
    tanggalPengeluaran: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("jenis", formData.jenis);
      formDataToSend.append("harga", formData.harga);
      formDataToSend.append("tanggalPengeluaran", formData.tanggalPengeluaran);
      
      if (bukti) {
        formDataToSend.append("bukti", bukti);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pengeluaran`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Pengeluaran berhasil ditambahkan!");
        router.push("/keuangan");
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
            Isi formulir untuk menambahkan data pengeluaran
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
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-xs lg:text-sm">
                Nama Pengeluaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Masukkan nama pengeluaran"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis" className="text-xs lg:text-sm">
                Jenis Pengeluaran <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jenis}
                onValueChange={(value) =>
                  setFormData({ ...formData, jenis: value })
                }
                required
              >
                <SelectTrigger id="jenis" className="text-xs lg:text-sm h-9 lg:h-10">
                  <SelectValue placeholder="Pilih jenis pengeluaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERAGAM" className="text-xs lg:text-sm">Seragam</SelectItem>
                  <SelectItem value="LISTRIK" className="text-xs lg:text-sm">Listrik</SelectItem>
                  <SelectItem value="INTERNET" className="text-xs lg:text-sm">Internet</SelectItem>
                  <SelectItem value="LAUK" className="text-xs lg:text-sm">Lauk</SelectItem>
                  <SelectItem value="BERAS" className="text-xs lg:text-sm">Beras</SelectItem>
                  <SelectItem value="PERCETAKAN" className="text-xs lg:text-sm">Percetakan</SelectItem>
                  <SelectItem value="JASA" className="text-xs lg:text-sm">Jasa</SelectItem>
                  <SelectItem value="LAUNDRY" className="text-xs lg:text-sm">Laundry</SelectItem>
                  <SelectItem value="PERBAIKAN_FASILITAS_PONDOK" className="text-xs lg:text-sm">Perbaikan Fasilitas</SelectItem>
                  <SelectItem value="PENGELUARAN_NON_RUTIN" className="text-xs lg:text-sm">Non Rutin</SelectItem>
                  <SelectItem value="LAINNYA" className="text-xs lg:text-sm">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="harga" className="text-xs lg:text-sm">
                Harga <span className="text-red-500">*</span>
              </Label>
              <Input
                id="harga"
                type="number"
                step="0.01"
                placeholder="Masukkan nominal"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-xs lg:text-sm">
                Tanggal Pengeluaran <span className="text-red-500">*</span>
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
                          tanggalPengeluaran: new Date().toISOString().split("T")[0],
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
                  value={formData.tanggalPengeluaran}
                  onChange={(e) => {
                    setFormData({ ...formData, tanggalPengeluaran: e.target.value });
                    setUseToday(false);
                  }}
                  disabled={useToday}
                  required
                  className={`text-xs lg:text-sm h-9 lg:h-10 ${useToday ? "bg-zinc-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs lg:text-sm">Bukti (Opsional)</Label>
              <FileUpload
                onFileSelect={setBukti}
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
                className="w-full sm:w-auto text-xs lg:text-sm h-9 lg:h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm h-9 lg:h-10"
                disabled={isLoading}
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
