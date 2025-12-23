"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  GraduationCap,
  Save,
  Calendar,
  UserCheck,
  UserX,
  Heart,
  FileText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface GuruAbsensi {
  guruId: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  status: string | null;
  keterangan: string | null;
  absensiId: string | null;
}

export default function InputAbsensiGuruPage() {
  const router = useRouter();
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [guruList, setGuruList] = useState<GuruAbsensi[]>([]);
  const [absensiData, setAbsensiData] = useState<
    Record<string, { status: string; keterangan: string }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAbsensiData();
  }, [tanggal]);

  const fetchAbsensiData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guru/absensi/tanggal/${tanggal}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGuruList(data);

        // Initialize absensi data
        const initialData: Record<
          string,
          { status: string; keterangan: string }
        > = {};
        data.forEach((guru: GuruAbsensi) => {
          initialData[guru.guruId] = {
            status: guru.status || "",
            keterangan: guru.keterangan || "",
          };
        });
        setAbsensiData(initialData);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (guruId: string, status: string) => {
    setAbsensiData((prev) => ({
      ...prev,
      [guruId]: {
        ...prev[guruId],
        status,
      },
    }));
  };

  const handleKeteranganChange = (guruId: string, keterangan: string) => {
    setAbsensiData((prev) => ({
      ...prev,
      [guruId]: {
        ...prev[guruId],
        keterangan,
      },
    }));
  };

  const handleSetAllStatus = (status: string) => {
    const newData: Record<string, { status: string; keterangan: string }> = {};
    guruList.forEach((guru) => {
      newData[guru.guruId] = {
        status,
        keterangan: absensiData[guru.guruId]?.keterangan || "",
      };
    });
    setAbsensiData(newData);
  };

  const handleSave = async () => {
    // Filter out empty status
    const absensiToSave = Object.entries(absensiData)
      .filter(([_, data]) => data.status)
      .map(([guruId, data]) => ({
        guruId,
        status: data.status,
        keterangan: data.keterangan || undefined,
      }));

    if (absensiToSave.length === 0) {
      toast.error("Pilih status kehadiran minimal untuk satu guru");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guru/absensi/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tanggal,
            absensi: absensiToSave,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Absensi berhasil disimpan");
        fetchAbsensiData(); // Refresh data
      } else {
        toast.error(data.message || "Gagal menyimpan absensi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  // Count statistics
  const stats = {
    hadir: Object.values(absensiData).filter((d) => d.status === "HADIR")
      .length,
    tidakHadir: Object.values(absensiData).filter(
      (d) => d.status === "TIDAK_HADIR"
    ).length,
    sakit: Object.values(absensiData).filter((d) => d.status === "SAKIT")
      .length,
    izin: Object.values(absensiData).filter((d) => d.status === "IZIN").length,
  };

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <GraduationCap className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hidden lg:flex text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
              <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
              Input Absensi Guru
            </div>
            <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
              Input Absensi Guru
            </h1>
            <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
              Catat kehadiran guru dan tenaga pengajar
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 lg:gap-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Hadir
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {stats.hadir}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Tidak Hadir
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-red-600">
              {stats.tidakHadir}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Sakit
            </CardTitle>
            <Heart className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-amber-600">
              {stats.sakit}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Izin
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-blue-600">
              {stats.izin}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Form */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <Label htmlFor="tanggal" className="text-sm font-medium">
                  Tanggal:
                </Label>
              </div>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-auto text-sm h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetAllStatus("HADIR")}
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
              >
                Set Semua Hadir
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Absensi"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Nama Guru
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    NIP
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Jabatan
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap w-40">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm whitespace-nowrap">
                    Keterangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : guruList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-zinc-500 text-xs lg:text-sm"
                    >
                      Belum ada guru terdaftar
                    </TableCell>
                  </TableRow>
                ) : (
                  guruList.map((guru, index) => (
                    <TableRow key={guru.guruId} className="hover:bg-zinc-50">
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm whitespace-nowrap">
                        {guru.nama}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {guru.nip || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs lg:text-sm whitespace-nowrap">
                        {guru.jabatan || "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={absensiData[guru.guruId]?.status || ""}
                          onValueChange={(value) =>
                            handleStatusChange(guru.guruId, value)
                          }
                        >
                          <SelectTrigger className="text-xs lg:text-sm h-8">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HADIR">Hadir</SelectItem>
                            <SelectItem value="TIDAK_HADIR">
                              Tidak Hadir
                            </SelectItem>
                            <SelectItem value="SAKIT">Sakit</SelectItem>
                            <SelectItem value="IZIN">Izin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Keterangan (opsional)"
                          value={absensiData[guru.guruId]?.keterangan || ""}
                          onChange={(e) =>
                            handleKeteranganChange(guru.guruId, e.target.value)
                          }
                          className="text-xs lg:text-sm h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
