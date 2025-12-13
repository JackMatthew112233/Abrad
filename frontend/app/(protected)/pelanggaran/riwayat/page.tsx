"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Pelanggaran {
  id: string;
  sanksi: string;
  keterangan: string;
  createdAt: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
    jenisKelamin?: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RiwayatPelanggaranPage() {
  const router = useRouter();
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pelanggaran?page=${page}&limit=20`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setPelanggaranList(data.data || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Gagal memuat data pelanggaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  const filteredPelanggaran = pelanggaranList.filter((item) =>
    item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/pelanggaran")}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Semua Riwayat Pelanggaran
          </h1>
          <p className="text-zinc-600">
            Daftar lengkap riwayat pelanggaran santri / santriwati
          </p>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-emerald-700">
                Riwayat Pelanggaran
              </CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Total {pagination.total} data pelanggaran
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-12 font-semibold text-emerald-700">No</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Nama Santri</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Jenis Kelamin</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Jenis Sanksi</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredPelanggaran.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                      Tidak ada data pelanggaran
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPelanggaran.map((pelanggaran, index) => {
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    return (
                      <TableRow key={pelanggaran.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {formatTanggal(pelanggaran.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium text-zinc-900">
                          {pelanggaran.siswa.nama}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {pelanggaran.siswa.jenisKelamin === "LakiLaki"
                            ? "Laki-Laki"
                            : pelanggaran.siswa.jenisKelamin === "Perempuan"
                            ? "Perempuan"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {pelanggaran.siswa.kelas?.replace(/_/g, " ") || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {pelanggaran.siswa.tingkatan || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              pelanggaran.sanksi === "RINGAN"
                                ? "border-blue-500 text-blue-700 bg-blue-50"
                                : pelanggaran.sanksi === "SEDANG"
                                ? "border-amber-500 text-amber-700 bg-amber-50"
                                : pelanggaran.sanksi === "BERAT"
                                ? "border-red-500 text-red-700 bg-red-50"
                                : pelanggaran.sanksi === "SP1"
                                ? "border-purple-500 text-purple-700 bg-purple-50"
                                : pelanggaran.sanksi === "SP2"
                                ? "border-pink-500 text-pink-700 bg-pink-50"
                                : "border-rose-500 text-rose-700 bg-rose-50"
                            }
                          >
                            {pelanggaran.sanksi}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-700 max-w-md">
                          {pelanggaran.keterangan}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredPelanggaran.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                {pagination.total} data
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-zinc-400">...</span>
                        )}
                        <Button
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 ${
                            page === pagination.page
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
