"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface Anggota {
  id: string;
  nama: string;
  alamat: string | null;
  noTelp: string | null;
}

export default function EditAnggotaKoperasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    noTelp: "",
  });

  useEffect(() => {
    if (id) {
      fetchAnggota();
    }
  }, [id]);

  const fetchAnggota = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data: Anggota = await response.json();
        setFormData({
          nama: data.nama || "",
          alamat: data.alamat || "",
          noTelp: data.noTelp || "",
        });
      } else {
        toast.error("Anggota koperasi tidak ditemukan");
        router.push("/koperasi");
      }
    } catch (error) {
      console.error("Error fetching anggota:", error);
      toast.error("Gagal memuat data anggota");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/koperasi/anggota/${id}`,
        {
          method: "PUT",
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
        toast.success("Data anggota berhasil diperbarui!");
        router.push(`/koperasi/anggota/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui data anggota");
      }
    } catch (error) {
      toast.error("Gagal memperbarui data anggota");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    );
  }

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
            Edit Anggota Koperasi
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            Perbarui data anggota koperasi
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardContent className="p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
              Formulir Edit Anggota
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
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
