"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface BiodataKeuangan {
  id: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    nik?: string;
    nis?: string;
    nisn?: string;
    jenisKelamin?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    alamat?: string;
  };
  komitmenInfaqLaundry: number;
  infaq: number;
  laundry: number;
}

export default function EditBiodataKeuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [biodata, setBiodata] = useState<BiodataKeuangan | null>(null);
  const [formData, setFormData] = useState({
    komitmenInfaqLaundry: "",
    infaq: "",
    laundry: "",
  });

  useEffect(() => {
    if (id) {
      fetchBiodata();
    }
  }, [id]);

  const fetchBiodata = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata/${id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBiodata(data);
        setFormData({
          komitmenInfaqLaundry: data.komitmenInfaqLaundry.toString(),
          infaq: data.infaq.toString(),
          laundry: data.laundry.toString(),
        });
      } else {
        toast.error("Biodata keuangan tidak ditemukan");
        router.push("/keuangan");
      }
    } catch (error) {
      console.error("Error fetching biodata:", error);
      toast.error("Gagal memuat biodata keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            komitmenInfaqLaundry: parseFloat(formData.komitmenInfaqLaundry),
            infaq: parseFloat(formData.infaq),
            laundry: parseFloat(formData.laundry),
          }),
        }
      );

      if (response.ok) {
        toast.success("Biodata keuangan berhasil diperbarui!");
        router.push(`/keuangan/biodata/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui biodata keuangan");
      }
    } catch (error) {
      toast.error("Gagal memperbarui biodata keuangan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!biodata) {
    return null;
  }

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
            Edit Biodata Keuangan
          </h1>
          <p className="text-zinc-600">
            Edit biodata keuangan untuk {biodata.siswa.nama}
          </p>
        </div>
      </div>

      {/* Informasi Santri (Read-only) */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white text-xl font-bold">
              {biodata.siswa.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-900 mb-1">
                {biodata.siswa.nama}
              </p>
              <div className="flex gap-2">
                {biodata.siswa.tingkatan && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                    {biodata.siswa.tingkatan}
                  </span>
                )}
                {biodata.siswa.kelas && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                    {biodata.siswa.kelas.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Edit */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Form Edit Biodata Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="komitmen">
                Komitmen Infaq & Laundry (Total) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="komitmen"
                type="number"
                step="0.01"
                placeholder="Masukkan nominal total"
                value={formData.komitmenInfaqLaundry}
                onChange={(e) =>
                  setFormData({ ...formData, komitmenInfaqLaundry: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="infaq">
                  Infaq <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="infaq"
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal infaq"
                  value={formData.infaq}
                  onChange={(e) =>
                    setFormData({ ...formData, infaq: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laundry">
                  Laundry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laundry"
                  type="number"
                  step="0.01"
                  placeholder="Masukkan nominal laundry"
                  value={formData.laundry}
                  onChange={(e) =>
                    setFormData({ ...formData, laundry: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
