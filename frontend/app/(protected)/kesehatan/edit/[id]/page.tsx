"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface Kesehatan {
  id: string;
  siswaId: string;
  noBpjs?: string;
  riwayatSakit: string;
  tanggal: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

export default function EditKesehatanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kesehatan, setKesehatan] = useState<Kesehatan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    noBpjs: "",
    riwayatSakit: "",
    tanggal: "",
  });

  useEffect(() => {
    fetchKesehatan();
  }, [id]);

  const fetchKesehatan = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan/${id}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setKesehatan(data);
        setFormData({
          noBpjs: data.noBpjs || "",
          riwayatSakit: data.riwayatSakit,
          tanggal: new Date(data.tanggal).toISOString().split("T")[0],
        });
      } else {
        toast.error("Gagal memuat data kesehatan");
        router.push("/kesehatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
      router.push("/kesehatan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.riwayatSakit) {
      toast.error("Riwayat sakit wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            noBpjs: formData.noBpjs || undefined,
            riwayatSakit: formData.riwayatSakit,
            tanggal: formData.tanggal,
          }),
        }
      );

      if (response.ok) {
        toast.success("Data kesehatan berhasil diperbarui!");
        router.push(`/kesehatan/siswa/${kesehatan?.siswaId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui data kesehatan");
      }
    } catch (error) {
      toast.error("Gagal memperbarui data kesehatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !kesehatan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Edit Data Kesehatan
          </h1>
          <p className="text-zinc-600">
            {kesehatan.siswa.nama} • {kesehatan.siswa.tingkatan} • {kesehatan.siswa.kelas?.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Data Kesehatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                required
              />
            </div>

            {/* No BPJS */}
            <div className="space-y-2">
              <Label htmlFor="noBpjs">No BPJS (Opsional)</Label>
              <Input
                id="noBpjs"
                placeholder="Masukkan nomor BPJS..."
                value={formData.noBpjs}
                onChange={(e) =>
                  setFormData({ ...formData, noBpjs: e.target.value })
                }
              />
            </div>

            {/* Riwayat Sakit */}
            <div className="space-y-2">
              <Label htmlFor="riwayatSakit">
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
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

