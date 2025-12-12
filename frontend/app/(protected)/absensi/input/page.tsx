"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Save } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
  absensiToday: {
    id: string;
    status: string;
    keterangan?: string;
  } | null;
}

export default function InputAbsensiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [absensiData, setAbsensiData] = useState<
    Record<string, { status: string; keterangan: string }>
  >({});

  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/today`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
        
        // Pre-fill existing absensi
        const initialData: Record<string, { status: string; keterangan: string }> = {};
        data.forEach((siswa: Siswa) => {
          if (siswa.absensiToday) {
            initialData[siswa.id] = {
              status: siswa.absensiToday.status,
              keterangan: siswa.absensiToday.keterangan || "",
            };
          } else {
            initialData[siswa.id] = {
              status: "HADIR",
              keterangan: "",
            };
          }
        });
        setAbsensiData(initialData);
      }
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    }
  };

  const handleStatusChange = (siswaId: string, status: string) => {
    setAbsensiData((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status,
      },
    }));
  };

  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setAbsensiData((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const absensiList = Object.entries(absensiData).map(([siswaId, data]) => ({
        siswaId,
        status: data.status,
        keterangan: data.keterangan || undefined,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            tanggal,
            absensiList,
          }),
        }
      );

      if (response.ok) {
        toast.success("Absensi berhasil disimpan!");
        router.push("/absensi");
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal menyimpan absensi");
      }
    } catch (error) {
      toast.error("Gagal menyimpan absensi");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSiswa = siswaList.filter((siswa) =>
    siswa.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      HADIR: "bg-emerald-50 text-emerald-700 border-emerald-200",
      TIDAK_HADIR: "bg-red-50 text-red-700 border-red-200",
      SAKIT: "bg-blue-50 text-blue-700 border-blue-200",
      IZIN: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      HADIR: "Hadir",
      TIDAK_HADIR: "Tidak Hadir",
      SAKIT: "Sakit",
      IZIN: "Izin",
    };
    return labels[status as keyof typeof labels] || status;
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
            Input Absensi Santri / Santriwati
          </h1>
          <p className="text-zinc-600">
            Catat kehadiran santri / santriwati untuk hari ini
          </p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Daftar Absensi
            </CardTitle>
            <div className="flex items-center gap-3">
              <Label>Tanggal:</Label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Cari nama santri / santriwati..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-emerald-50 z-10">
                  <TableRow className="hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700">No</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Status</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswa.map((siswa, index) => (
                    <TableRow key={siswa.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{siswa.nama}</TableCell>
                      <TableCell>
                        {siswa.tingkatan && (
                          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                            {siswa.tingkatan}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {siswa.kelas && (
                          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                            {siswa.kelas.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={absensiData[siswa.id]?.status || "HADIR"}
                          onValueChange={(value) => handleStatusChange(siswa.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HADIR">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                Hadir
                              </div>
                            </SelectItem>
                            <SelectItem value="TIDAK_HADIR">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Tidak Hadir
                              </div>
                            </SelectItem>
                            <SelectItem value="SAKIT">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                Sakit
                              </div>
                            </SelectItem>
                            <SelectItem value="IZIN">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                Izin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Keterangan (opsional)"
                          value={absensiData[siswa.id]?.keterangan || ""}
                          onChange={(e) =>
                            handleKeteranganChange(siswa.id, e.target.value)
                          }
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Absensi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
