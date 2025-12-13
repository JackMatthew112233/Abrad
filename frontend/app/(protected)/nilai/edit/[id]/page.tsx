"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Nilai {
  id: string;
  siswaId: string;
  mataPelajaran: string;
  jenisNilai: string;
  nilai: number;
  semester: string;
  tahunAjaran: string;
  tanggal: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

interface MataPelajaran {
  id: string;
  nama: string;
  kelas: string;
}

export default function EditNilaiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nilai, setNilai] = useState<Nilai | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);

  const [formData, setFormData] = useState({
    mataPelajaran: "",
    jenisNilai: "",
    nilai: "",
    semester: "",
    tahunAjaran: "",
    tanggal: "",
  });

  useEffect(() => {
    fetchNilai();
  }, [id]);

  const fetchNilai = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai/${id}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setNilai(data);
        setFormData({
          mataPelajaran: data.mataPelajaran,
          jenisNilai: data.jenisNilai,
          nilai: data.nilai.toString(),
          semester: data.semester,
          tahunAjaran: data.tahunAjaran,
          tanggal: new Date(data.tanggal).toISOString().split("T")[0],
        });

        // Fetch mata pelajaran for siswa's kelas
        if (data.siswa.kelas) {
          const mapelResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran?kelas=${data.siswa.kelas}`,
            { credentials: "include" }
          );
          if (mapelResponse.ok) {
            const mapelData = await mapelResponse.json();
            setMataPelajaranList(mapelData);
          }
        }
      } else {
        toast.error("Gagal memuat data nilai");
        router.push("/nilai");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
      router.push("/nilai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mataPelajaran || !formData.jenisNilai || !formData.nilai || !formData.semester || !formData.tahunAjaran) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const nilaiNum = parseFloat(formData.nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      toast.error("Nilai harus antara 0-100");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nilai/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            mataPelajaran: formData.mataPelajaran,
            jenisNilai: formData.jenisNilai,
            nilai: nilaiNum,
            semester: formData.semester,
            tahunAjaran: formData.tahunAjaran,
            tanggal: formData.tanggal,
          }),
        }
      );

      if (response.ok) {
        toast.success("Data nilai berhasil diperbarui!");
        router.push(`/nilai/siswa/${nilai?.siswaId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal memperbarui data nilai");
      }
    } catch (error) {
      toast.error("Gagal memperbarui data nilai");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !nilai) {
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
            Edit Data Nilai
          </h1>
          <p className="text-zinc-600">
            {nilai.siswa.nama} • {nilai.siswa.tingkatan} • {nilai.siswa.kelas?.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Data Nilai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mata Pelajaran */}
            <div className="space-y-2">
              <Label htmlFor="mataPelajaran">
                Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              {mataPelajaranList.length > 0 ? (
                <Select
                  value={formData.mataPelajaran}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mataPelajaran: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {mataPelajaranList.map((mapel) => (
                      <SelectItem key={mapel.id} value={mapel.nama}>
                        {mapel.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="mataPelajaran"
                  placeholder="Tidak ada mata pelajaran untuk kelas ini"
                  value={formData.mataPelajaran}
                  onChange={(e) =>
                    setFormData({ ...formData, mataPelajaran: e.target.value })
                  }
                  required
                />
              )}
              {mataPelajaranList.length === 0 && (
                <p className="text-xs text-amber-600">
                  Belum ada mata pelajaran untuk kelas ini.{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/nilai/mata-pelajaran")}
                    className="underline hover:text-amber-800"
                  >
                    Tambah mata pelajaran
                  </button>
                </p>
              )}
            </div>

            {/* Jenis Nilai */}
            <div className="space-y-2">
              <Label htmlFor="jenisNilai">
                Jenis Nilai <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jenisNilai}
                onValueChange={(value) =>
                  setFormData({ ...formData, jenisNilai: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis nilai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HARIAN">Harian</SelectItem>
                  <SelectItem value="TUGAS">Tugas</SelectItem>
                  <SelectItem value="UTS">UTS</SelectItem>
                  <SelectItem value="UAS">UAS</SelectItem>
                  <SelectItem value="PRAKTIK">Praktik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nilai */}
            <div className="space-y-2">
              <Label htmlFor="nilai">
                Nilai (0-100) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Masukkan nilai..."
                value={formData.nilai}
                onChange={(e) =>
                  setFormData({ ...formData, nilai: e.target.value })
                }
                required
              />
            </div>

            {/* Semester & Tahun Ajaran */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                    <SelectItem value="Genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tahunAjaran">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tahunAjaran"
                  placeholder="Contoh: 2024/2025"
                  value={formData.tahunAjaran}
                  onChange={(e) =>
                    setFormData({ ...formData, tahunAjaran: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
