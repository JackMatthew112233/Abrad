"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function TambahSiswaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    tingkatan: "",
    nisn: "",
    npsn: "",
    sekolahAsal: "",
    nis: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamat: "",
    kodePos: "",
    namaAyah: "",
    nikAyah: "",
    ttlAyah: "",
    noKartuKeluarga: "",
    pekerjaanAyah: "",
    pendidikanAyah: "",
    noTelpAyah: "",
    namaIbu: "",
    nikIbu: "",
    ttlIbu: "",
    pekerjaanIbu: "",
    pendidikanIbu: "",
    noTelpIbu: "",
    jenisKelamin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data with proper formatting
      const payload: any = {};
      
      // Add non-empty fields only
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "tanggalLahir") {
            // Convert to ISO Date string
            payload[key] = new Date(value).toISOString();
          } else {
            payload[key] = value;
          }
        }
      });

      // Set default isAktif to true
      payload.isAktif = true;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal menambahkan data siswa");
      }

      toast.success("Data santri / santriwati berhasil ditambahkan!");
      router.push("/siswa");
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan data siswa");
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
            Tambah Biodata Santri / Santriwati
          </h1>
          <p className="text-zinc-600">
            Isi formulir di bawah untuk menambahkan santri / santriwati baru
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Formulir Biodata Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Siswa */}
            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Santri / Santriwati</Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tingkatan">Tingkatan</Label>
                  <Select
                    value={formData.tingkatan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tingkatan: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                      <SelectItem value="ULYA">ULYA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kelas">Kelas</Label>
                  <Select
                    value={formData.kelas}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kelas: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VII_Putra">VII Putra</SelectItem>
                      <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                      <SelectItem value="IX_Putra">IX Putra</SelectItem>
                      <SelectItem value="X_Putra">X Putra</SelectItem>
                      <SelectItem value="XI_Putra">XI Putra</SelectItem>
                      <SelectItem value="XII_Putra">XII Putra</SelectItem>
                      <SelectItem value="VII_Putri">VII Putri</SelectItem>
                      <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                      <SelectItem value="IX_Putri">IX Putri</SelectItem>
                      <SelectItem value="X_Putri">X Putri</SelectItem>
                      <SelectItem value="XI_Putri">XI Putri</SelectItem>
                      <SelectItem value="XII_Putri">XII Putri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(value) =>
                      setFormData({ ...formData, jenisKelamin: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LakiLaki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nisn">NISN</Label>
                  <Input
                    id="nisn"
                    placeholder="Masukkan NISN"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npsn">NPSN</Label>
                  <Input
                    id="npsn"
                    placeholder="Masukkan NPSN"
                    value={formData.npsn}
                    onChange={(e) =>
                      setFormData({ ...formData, npsn: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sekolahAsal">Sekolah Asal</Label>
                  <Input
                    id="sekolahAsal"
                    placeholder="Masukkan sekolah asal"
                    value={formData.sekolahAsal}
                    onChange={(e) =>
                      setFormData({ ...formData, sekolahAsal: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input
                    id="nis"
                    placeholder="Masukkan NIS"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nik">NIK</Label>
                  <Input
                    id="nik"
                    placeholder="Masukkan NIK (16 digit)"
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value })
                    }
                    maxLength={16}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    placeholder="Masukkan tempat lahir"
                    value={formData.tempatLahir}
                    onChange={(e) =>
                      setFormData({ ...formData, tempatLahir: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalLahir: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kodePos">Kode Pos</Label>
                  <Input
                    id="kodePos"
                    placeholder="Masukkan kode pos"
                    value={formData.kodePos}
                    onChange={(e) =>
                      setFormData({ ...formData, kodePos: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noKartuKeluarga">No Kartu Keluarga</Label>
                  <Input
                    id="noKartuKeluarga"
                    placeholder="Masukkan nomor kartu keluarga"
                    value={formData.noKartuKeluarga}
                    onChange={(e) =>
                      setFormData({ ...formData, noKartuKeluarga: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Data Ayah */}
            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="namaAyah">Nama Ayah</Label>
                  <Input
                    id="namaAyah"
                    placeholder="Masukkan nama ayah"
                    value={formData.namaAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, namaAyah: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nikAyah">NIK Ayah</Label>
                  <Input
                    id="nikAyah"
                    placeholder="Masukkan NIK ayah (16 digit)"
                    value={formData.nikAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, nikAyah: e.target.value })
                    }
                    maxLength={16}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttlAyah">TTL Ayah</Label>
                  <Input
                    id="ttlAyah"
                    placeholder="Contoh: Jakarta, 01 Januari 1980"
                    value={formData.ttlAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, ttlAyah: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaanAyah">Pekerjaan Ayah</Label>
                  <Input
                    id="pekerjaanAyah"
                    placeholder="Masukkan pekerjaan ayah"
                    value={formData.pekerjaanAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, pekerjaanAyah: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pendidikanAyah">Pendidikan Terakhir Ayah</Label>
                  <Input
                    id="pendidikanAyah"
                    placeholder="Masukkan pendidikan terakhir ayah"
                    value={formData.pendidikanAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, pendidikanAyah: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noTelpAyah">No Telp Ayah</Label>
                  <Input
                    id="noTelpAyah"
                    placeholder="Masukkan nomor telepon ayah"
                    value={formData.noTelpAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, noTelpAyah: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Data Ibu */}
            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="namaIbu">Nama Ibu</Label>
                  <Input
                    id="namaIbu"
                    placeholder="Masukkan nama ibu"
                    value={formData.namaIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, namaIbu: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nikIbu">NIK Ibu</Label>
                  <Input
                    id="nikIbu"
                    placeholder="Masukkan NIK ibu (16 digit)"
                    value={formData.nikIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, nikIbu: e.target.value })
                    }
                    maxLength={16}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttlIbu">TTL Ibu</Label>
                  <Input
                    id="ttlIbu"
                    placeholder="Contoh: Jakarta, 01 Januari 1980"
                    value={formData.ttlIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, ttlIbu: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaanIbu">Pekerjaan Ibu</Label>
                  <Input
                    id="pekerjaanIbu"
                    placeholder="Masukkan pekerjaan ibu"
                    value={formData.pekerjaanIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, pekerjaanIbu: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pendidikanIbu">Pendidikan Terakhir Ibu</Label>
                  <Input
                    id="pendidikanIbu"
                    placeholder="Masukkan pendidikan terakhir ibu"
                    value={formData.pendidikanIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, pendidikanIbu: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noTelpIbu">No Telp Ibu</Label>
                  <Input
                    id="noTelpIbu"
                    placeholder="Masukkan nomor telepon ibu"
                    value={formData.noTelpIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, noTelpIbu: e.target.value })
                    }
                  />
                </div>
              </div>
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
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
