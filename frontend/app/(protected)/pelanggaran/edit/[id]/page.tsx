"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface Pelanggaran {
  id: string;
  sanksi: string;
  keterangan: string;
  evidence?: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

export default function EditPelanggaranPage() {
  const router = useRouter();
  const params = useParams();
  const pelanggaranId = params.id as string;

  const [pelanggaran, setPelanggaran] = useState<Pelanggaran | null>(null);
  const [sanksi, setSanksi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pelanggaranId) {
      fetchPelanggaran();
    }
  }, [pelanggaranId]);

  const fetchPelanggaran = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/${pelanggaranId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setPelanggaran(data);
        setSanksi(data.sanksi);
        setKeterangan(data.keterangan);
      } else {
        toast.error("Gagal memuat data pelanggaran");
        router.push("/pelanggaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
      router.push("/pelanggaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sanksi || !keterangan) {
      toast.error("Sanksi dan keterangan harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("sanksi", sanksi);
      formData.append("keterangan", keterangan);

      if (evidence) {
        formData.append("evidence", evidence);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran/${pelanggaranId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Data pelanggaran berhasil diupdate!");
        router.push(`/pelanggaran/siswa/${pelanggaran?.siswa.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal mengupdate data pelanggaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengupdate data");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Memuat data...</p>
      </div>
    );
  }

  if (!pelanggaran) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Data tidak ditemukan</p>
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
          onClick={() => router.push(`/pelanggaran/siswa/${pelanggaran.siswa.id}`)}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Edit Data Pelanggaran
          </h1>
          <p className="text-zinc-600">
            Update data pelanggaran untuk {pelanggaran.siswa.nama}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Pelanggaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sanksi */}
            <div className="space-y-2">
              <Label htmlFor="sanksi">
                Jenis Sanksi <span className="text-red-500">*</span>
              </Label>
              <Select value={sanksi} onValueChange={setSanksi} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis sanksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RINGAN">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Ringan
                    </div>
                  </SelectItem>
                  <SelectItem value="SEDANG">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Sedang
                    </div>
                  </SelectItem>
                  <SelectItem value="BERAT">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Berat
                    </div>
                  </SelectItem>
                  <SelectItem value="SP1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      SP1
                    </div>
                  </SelectItem>
                  <SelectItem value="SP2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500" />
                      SP2
                    </div>
                  </SelectItem>
                  <SelectItem value="SP3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      SP3
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan">
                Keterangan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Jelaskan pelanggaran yang dilakukan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Evidence */}
            <div className="space-y-2">
              <Label>Evidence (Opsional)</Label>
              <FileUpload
                onFileSelect={setEvidence}
                accept="image/*,application/pdf"
                maxSize={5}
              />
              <p className="text-xs text-zinc-500">
                Upload gambar atau PDF sebagai bukti (Opsional)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/pelanggaran/siswa/${pelanggaran.siswa.id}`)}
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
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
