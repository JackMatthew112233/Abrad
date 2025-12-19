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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Kesehatan {
  id: string;
  siswaId: string;
  jenisAsuransi?: "BPJS" | "NON_BPJS";
  noBpjs?: string;
  noAsuransi?: string;
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
    jenisAsuransi: "" as "" | "BPJS" | "NON_BPJS",
    noBpjs: "",
    noAsuransi: "",
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
          jenisAsuransi: data.jenisAsuransi || "",
          noBpjs: data.noBpjs || "",
          noAsuransi: data.noAsuransi || "",
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
            jenisAsuransi: formData.jenisAsuransi || undefined,
            noBpjs: formData.jenisAsuransi === "BPJS" ? formData.noBpjs : undefined,
            noAsuransi: formData.jenisAsuransi === "NON_BPJS" ? formData.noAsuransi : undefined,
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
            Edit Data Kesehatan
          </h1>
          <p className="text-xs lg:text-sm text-zinc-600">
            {kesehatan.siswa.nama} • {kesehatan.siswa.tingkatan} • {kesehatan.siswa.kelas?.replace(/_/g, " ")}
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
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

