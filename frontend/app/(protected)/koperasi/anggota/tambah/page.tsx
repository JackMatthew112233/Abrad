"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function TambahAnggotaKoperasiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    noTelp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nama: formData.nama,
            alamat: formData.alamat || undefined,
            noTelp: formData.noTelp || undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success("Anggota koperasi berhasil ditambahkan!");
        router.push("/koperasi");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menambahkan anggota koperasi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan anggota koperasi");
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
            Tambah Anggota Koperasi
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Daftarkan anggota baru ke koperasi
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardContent className="p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
              Formulir Pendaftaran Anggota
            </CardTitle>
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-xs lg:text-sm">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Masukkan nama anggota"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat" className="text-xs lg:text-sm">
                Alamat
              </Label>
              <Textarea
                id="alamat"
                placeholder="Masukkan alamat (opsional)"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="text-xs lg:text-sm min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noTelp" className="text-xs lg:text-sm">
                No. Telp
              </Label>
              <Input
                id="noTelp"
                type="tel"
                placeholder="Masukkan nomor telepon (opsional)"
                value={formData.noTelp}
                onChange={(e) =>
                  setFormData({ ...formData, noTelp: e.target.value })
                }
                className="text-xs lg:text-sm h-9 lg:h-10"
              />
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
                disabled={isLoading}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isLoading ? "Menyimpan..." : "Daftarkan Anggota"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
