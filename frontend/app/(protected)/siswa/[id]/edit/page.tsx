"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
    isAktif: true,
    status: "AKTIF",
  });

  useEffect(() => {
    if (params.id) {
      fetchSiswaData(params.id as string);
    }
  }, [params.id]);

  const fetchSiswaData = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Format date for input
        const tanggalLahir = data.tanggalLahir 
          ? new Date(data.tanggalLahir).toISOString().split('T')[0]
          : "";

        setFormData({
          nama: data.nama || "",
          kelas: data.kelas || "",
          tingkatan: data.tingkatan || "",
          nisn: data.nisn || "",
          npsn: data.npsn || "",
          sekolahAsal: data.sekolahAsal || "",
          nis: data.nis || "",
          nik: data.nik || "",
          tempatLahir: data.tempatLahir || "",
          tanggalLahir,
          alamat: data.alamat || "",
          kodePos: data.kodePos || "",
          namaAyah: data.namaAyah || "",
          nikAyah: data.nikAyah || "",
          ttlAyah: data.ttlAyah || "",
          noKartuKeluarga: data.noKartuKeluarga || "",
          pekerjaanAyah: data.pekerjaanAyah || "",
          pendidikanAyah: data.pendidikanAyah || "",
          noTelpAyah: data.noTelpAyah || "",
          namaIbu: data.namaIbu || "",
          nikIbu: data.nikIbu || "",
          ttlIbu: data.ttlIbu || "",
          pekerjaanIbu: data.pekerjaanIbu || "",
          pendidikanIbu: data.pendidikanIbu || "",
          noTelpIbu: data.noTelpIbu || "",
          jenisKelamin: data.jenisKelamin || "",
          isAktif: data.isAktif ?? true,
          status: data.status || "AKTIF",
        });
      } else {
        toast.error("Gagal memuat data santri / santriwati");
        router.push("/siswa");
      }
    } catch (error) {
      toast.error("Gagal memuat data santri / santriwati");
      router.push("/siswa");
    } finally {
      setIsFetching(false);
    }
  };

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
            payload[key] = new Date(value as string).toISOString();
          } else {
            payload[key] = value;
          }
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengupdate data siswa");
      }

      toast.success("Data santri / santriwati berhasil diupdate!");
      router.push(`/siswa/${params.id}`);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-zinc-500">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-3">
        {/* Mobile: Full width button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="text-xs h-8 w-full lg:hidden"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Kembali
        </Button>

        {/* Desktop: Icon button with title */}
        <div className="hidden lg:flex items-center gap-4">
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
              Edit Biodata
            </h1>
            <p className="text-sm text-zinc-600">
              Perbarui informasi biodata santri atau santriwati
            </p>
          </div>
        </div>

        {/* Mobile: Centered title */}
        <div className="text-center lg:hidden">
          <h1 className="text-lg font-bold text-emerald-700">
            Edit Biodata
          </h1>
          <p className="text-xs text-zinc-600">
            Perbarui informasi biodata santri atau santriwati
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Formulir Edit Biodata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            {/* Data Siswa */}
            <div className="space-y-3 lg:space-y-4">
              <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-xs lg:text-sm">Nama Santri / Santriwati</Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tingkatan" className="text-xs lg:text-sm">Tingkatan</Label>
                  <Select
                    value={formData.tingkatan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tingkatan: value, kelas: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TK">TK</SelectItem>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="WUSTHA">WUSTHA</SelectItem>
                      <SelectItem value="ULYA">ULYA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kelas" className="text-xs lg:text-sm">Kelas</Label>
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
                      {/* TK */}
                      {formData.tingkatan === "TK" && (
                        <>
                          <SelectItem value="TK_1">TK 1</SelectItem>
                          <SelectItem value="TK_2">TK 2</SelectItem>
                          <SelectItem value="TK_3">TK 3</SelectItem>
                        </>
                      )}
                      {/* SD */}
                      {formData.tingkatan === "SD" && (
                        <>
                          <SelectItem value="I_SD_Putra">1 SD Putra</SelectItem>
                          <SelectItem value="II_SD_Putra">2 SD Putra</SelectItem>
                          <SelectItem value="III_SD_Putra">3 SD Putra</SelectItem>
                          <SelectItem value="IV_SD_Putra">4 SD Putra</SelectItem>
                          <SelectItem value="V_SD_Putra">5 SD Putra</SelectItem>
                          <SelectItem value="VI_SD_Putra">6 SD Putra</SelectItem>
                          <SelectItem value="I_SD_Putri">1 SD Putri</SelectItem>
                          <SelectItem value="II_SD_Putri">2 SD Putri</SelectItem>
                          <SelectItem value="III_SD_Putri">3 SD Putri</SelectItem>
                          <SelectItem value="IV_SD_Putri">4 SD Putri</SelectItem>
                          <SelectItem value="V_SD_Putri">5 SD Putri</SelectItem>
                          <SelectItem value="VI_SD_Putri">6 SD Putri</SelectItem>
                        </>
                      )}
                      {/* WUSTHA (SMP/MTs) */}
                      {formData.tingkatan === "WUSTHA" && (
                        <>
                          <SelectItem value="VII_Putra">VII Putra</SelectItem>
                          <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                          <SelectItem value="IX_Putra">IX Putra</SelectItem>
                          <SelectItem value="VII_Putri">VII Putri</SelectItem>
                          <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                          <SelectItem value="IX_Putri">IX Putri</SelectItem>
                        </>
                      )}
                      {/* ULYA (SMA/MA) */}
                      {formData.tingkatan === "ULYA" && (
                        <>
                          <SelectItem value="X_Putra">X Putra</SelectItem>
                          <SelectItem value="XI_Putra">XI Putra</SelectItem>
                          <SelectItem value="XII_Putra">XII Putra</SelectItem>
                          <SelectItem value="X_Putri">X Putri</SelectItem>
                          <SelectItem value="XI_Putri">XI Putri</SelectItem>
                          <SelectItem value="XII_Putri">XII Putri</SelectItem>
                        </>
                      )}
                      {/* Default: Semua kelas jika tingkatan belum dipilih */}
                      {!formData.tingkatan && (
                        <>
                          <SelectItem value="TK_1">TK 1</SelectItem>
                          <SelectItem value="TK_2">TK 2</SelectItem>
                          <SelectItem value="TK_3">TK 3</SelectItem>
                          <SelectItem value="I_SD_Putra">1 SD Putra</SelectItem>
                          <SelectItem value="II_SD_Putra">2 SD Putra</SelectItem>
                          <SelectItem value="III_SD_Putra">3 SD Putra</SelectItem>
                          <SelectItem value="IV_SD_Putra">4 SD Putra</SelectItem>
                          <SelectItem value="V_SD_Putra">5 SD Putra</SelectItem>
                          <SelectItem value="VI_SD_Putra">6 SD Putra</SelectItem>
                          <SelectItem value="I_SD_Putri">1 SD Putri</SelectItem>
                          <SelectItem value="II_SD_Putri">2 SD Putri</SelectItem>
                          <SelectItem value="III_SD_Putri">3 SD Putri</SelectItem>
                          <SelectItem value="IV_SD_Putri">4 SD Putri</SelectItem>
                          <SelectItem value="V_SD_Putri">5 SD Putri</SelectItem>
                          <SelectItem value="VI_SD_Putri">6 SD Putri</SelectItem>
                          <SelectItem value="VII_Putra">VII Putra</SelectItem>
                          <SelectItem value="VIII_Putra">VIII Putra</SelectItem>
                          <SelectItem value="IX_Putra">IX Putra</SelectItem>
                          <SelectItem value="VII_Putri">VII Putri</SelectItem>
                          <SelectItem value="VIII_Putri">VIII Putri</SelectItem>
                          <SelectItem value="IX_Putri">IX Putri</SelectItem>
                          <SelectItem value="X_Putra">X Putra</SelectItem>
                          <SelectItem value="XI_Putra">XI Putra</SelectItem>
                          <SelectItem value="XII_Putra">XII Putra</SelectItem>
                          <SelectItem value="X_Putri">X Putri</SelectItem>
                          <SelectItem value="XI_Putri">XI Putri</SelectItem>
                          <SelectItem value="XII_Putri">XII Putri</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jenisKelamin" className="text-xs lg:text-sm">Jenis Kelamin</Label>
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
                  <Label htmlFor="status" className="text-xs lg:text-sm">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AKTIF">Aktif</SelectItem>
                      <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
                      <SelectItem value="LULUS">Lulus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nisn" className="text-xs lg:text-sm">NISN</Label>
                  <Input
                    id="nisn"
                    placeholder="Masukkan NISN"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npsn" className="text-xs lg:text-sm">NPSN</Label>
                  <Input
                    id="npsn"
                    placeholder="Masukkan NPSN"
                    value={formData.npsn}
                    onChange={(e) =>
                      setFormData({ ...formData, npsn: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sekolahAsal" className="text-xs lg:text-sm">Sekolah Asal</Label>
                  <Input
                    id="sekolahAsal"
                    placeholder="Masukkan sekolah asal"
                    value={formData.sekolahAsal}
                    onChange={(e) =>
                      setFormData({ ...formData, sekolahAsal: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nis" className="text-xs lg:text-sm">NIS</Label>
                  <Input
                    id="nis"
                    placeholder="Masukkan NIS"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nik" className="text-xs lg:text-sm">NIK</Label>
                  <Input
                    id="nik"
                    placeholder="Masukkan NIK (16 digit)"
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value })
                    }
                    maxLength={16}
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempatLahir" className="text-xs lg:text-sm">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    placeholder="Masukkan tempat lahir"
                    value={formData.tempatLahir}
                    onChange={(e) =>
                      setFormData({ ...formData, tempatLahir: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir" className="text-xs lg:text-sm">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalLahir: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kodePos" className="text-xs lg:text-sm">Kode Pos</Label>
                  <Input
                    id="kodePos"
                    placeholder="Masukkan kode pos"
                    value={formData.kodePos}
                    onChange={(e) =>
                      setFormData({ ...formData, kodePos: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noKartuKeluarga" className="text-xs lg:text-sm">No. Kartu Keluarga</Label>
                  <Input
                    id="noKartuKeluarga"
                    placeholder="Masukkan nomor kartu keluarga"
                    value={formData.noKartuKeluarga}
                    onChange={(e) =>
                      setFormData({ ...formData, noKartuKeluarga: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alamat" className="text-xs lg:text-sm">Alamat</Label>
                  <Textarea
                    id="alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    rows={3}
                    className="text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Data Ayah */}
            <div className="space-y-3 lg:space-y-4">
              <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="namaAyah" className="text-xs lg:text-sm">Nama Ayah</Label>
                  <Input
                    id="namaAyah"
                    placeholder="Masukkan nama ayah"
                    value={formData.namaAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, namaAyah: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nikAyah" className="text-xs lg:text-sm">NIK Ayah</Label>
                  <Input
                    id="nikAyah"
                    placeholder="Masukkan NIK ayah"
                    value={formData.nikAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, nikAyah: e.target.value })
                    }
                    maxLength={16}
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttlAyah" className="text-xs lg:text-sm">Tempat, Tanggal Lahir Ayah</Label>
                  <Input
                    id="ttlAyah"
                    placeholder="Contoh: Jakarta, 1 Januari 1980"
                    value={formData.ttlAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, ttlAyah: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaanAyah" className="text-xs lg:text-sm">Pekerjaan Ayah</Label>
                  <Input
                    id="pekerjaanAyah"
                    placeholder="Masukkan pekerjaan ayah"
                    value={formData.pekerjaanAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, pekerjaanAyah: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pendidikanAyah" className="text-xs lg:text-sm">Pendidikan Ayah</Label>
                  <Input
                    id="pendidikanAyah"
                    placeholder="Masukkan pendidikan ayah"
                    value={formData.pendidikanAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, pendidikanAyah: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noTelpAyah" className="text-xs lg:text-sm">No. Telepon Ayah</Label>
                  <Input
                    id="noTelpAyah"
                    placeholder="Masukkan nomor telepon ayah"
                    value={formData.noTelpAyah}
                    onChange={(e) =>
                      setFormData({ ...formData, noTelpAyah: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Data Ibu */}
            <div className="space-y-3 lg:space-y-4">
              <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="namaIbu" className="text-xs lg:text-sm">Nama Ibu</Label>
                  <Input
                    id="namaIbu"
                    placeholder="Masukkan nama ibu"
                    value={formData.namaIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, namaIbu: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nikIbu" className="text-xs lg:text-sm">NIK Ibu</Label>
                  <Input
                    id="nikIbu"
                    placeholder="Masukkan NIK ibu"
                    value={formData.nikIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, nikIbu: e.target.value })
                    }
                    maxLength={16}
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttlIbu" className="text-xs lg:text-sm">Tempat, Tanggal Lahir Ibu</Label>
                  <Input
                    id="ttlIbu"
                    placeholder="Contoh: Bandung, 1 Januari 1985"
                    value={formData.ttlIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, ttlIbu: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaanIbu" className="text-xs lg:text-sm">Pekerjaan Ibu</Label>
                  <Input
                    id="pekerjaanIbu"
                    placeholder="Masukkan pekerjaan ibu"
                    value={formData.pekerjaanIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, pekerjaanIbu: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pendidikanIbu" className="text-xs lg:text-sm">Pendidikan Ibu</Label>
                  <Input
                    id="pendidikanIbu"
                    placeholder="Masukkan pendidikan ibu"
                    value={formData.pendidikanIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, pendidikanIbu: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noTelpIbu" className="text-xs lg:text-sm">No. Telepon Ibu</Label>
                  <Input
                    id="noTelpIbu"
                    placeholder="Masukkan nomor telepon ibu"
                    value={formData.noTelpIbu}
                    onChange={(e) =>
                      setFormData({ ...formData, noTelpIbu: e.target.value })
                    }
                    className="text-xs lg:text-sm h-9 lg:h-10 placeholder:text-xs lg:placeholder:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 lg:gap-3 border-t pt-4 lg:pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs lg:text-sm h-9 lg:h-10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs lg:text-sm h-9 lg:h-10"
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
