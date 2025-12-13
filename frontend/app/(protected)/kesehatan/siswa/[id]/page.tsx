"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Kesehatan {
  id: string;
  noBpjs?: string;
  riwayatSakit: string;
  tanggal: string;
  createdAt: string;
}

interface Siswa {
  id: string;
  nama: string;
  kelas?: string;
  tingkatan?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DetailKesehatanSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const siswaId = params.id as string;

  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [kesehatanList, setKesehatanList] = useState<Kesehatan[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [siswaId]);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan?siswaId=${siswaId}&page=${page}&limit=10`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setKesehatanList(data.data);
        setPagination(data.pagination);

        // Get siswa info from first record
        if (data.data.length > 0 && data.data[0].siswa) {
          setSiswa(data.data[0].siswa);
        }
      } else {
        toast.error("Gagal memuat data kesehatan");
      }
    } catch (error) {
      toast.error("Gagal memuat data kesehatan");
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

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kesehatan/${selectedId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Data kesehatan berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchData(pagination.page);
      } else {
        toast.error("Gagal menghapus data kesehatan");
      }
    } catch (error) {
      toast.error("Gagal menghapus data kesehatan");
    }
  };

  if (isLoading && !siswa) {
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
          onClick={() => router.push("/kesehatan")}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Detail Riwayat Kesehatan
          </h1>
          <p className="text-zinc-600">
            {siswa?.nama} • {siswa?.tingkatan} • {siswa?.kelas?.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Riwayat Kesehatan Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-emerald-700">
              Riwayat Kesehatan
            </CardTitle>
            <div className="text-sm font-medium text-zinc-700">
              Total Riwayat: {pagination.total}
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
                  <TableHead className="font-semibold text-emerald-700">No BPJS</TableHead>
                  <TableHead className="font-semibold text-emerald-700">Riwayat Sakit</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : kesehatanList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      Belum ada riwayat kesehatan
                    </TableCell>
                  </TableRow>
                ) : (
                  kesehatanList.map((kesehatan, index) => {
                    const startIndex = (pagination.page - 1) * pagination.limit;
                    return (
                      <TableRow key={kesehatan.id} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {formatTanggal(kesehatan.tanggal)}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {kesehatan.noBpjs || "-"}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                          {kesehatan.riwayatSakit}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/kesehatan/edit/${kesehatan.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedId(kesehatan.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && kesehatanList.length > 0 && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kesehatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data kesehatan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
