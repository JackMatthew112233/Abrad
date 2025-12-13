"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
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
            Tambah Pengeluaran
          </h1>
          <p className="text-zinc-600">
            Isi formulir di bawah untuk menambahkan data pengeluaran
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama Pengeluaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Masukkan nama pengeluaran"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis">
                Jenis Pengeluaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jenis"
                placeholder="Contoh: Operasional, Pemeliharaan, dll"
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({ ...formData, jenis: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harga">
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">
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
                  <Label htmlFor="useToday" className="text-sm font-normal cursor-pointer">
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
                  className={useToday ? "bg-zinc-50 cursor-not-allowed" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bukti (Opsional)</Label>
              <FileUpload
                onFileSelect={setBukti}
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
