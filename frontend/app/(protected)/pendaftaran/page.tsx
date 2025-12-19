"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Clock,
  Check,
  X,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "MENUNGGU" | "DITERIMA" | "DITOLAK";
  createdAt: string;
}

interface Statistik {
  total: number;
  menunggu: number;
  diterima: number;
  ditolak: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PendaftaranPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [statistik, setStatistik] = useState<Statistik>({
    total: 0,
    menunggu: 0,
    diterima: 0,
    ditolak: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData(1);
  }, [filterStatus]);

  const fetchData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pendaftaran?status=${filterStatus}&page=${page}&limit=20`,
          { credentials: "include" }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pendaftaran/statistik`, {
          credentials: "include",
        }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.data);
        setPagination(data.pagination);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStatistik(data);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pendaftaran/${id}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Pendaftaran berhasil disetujui");
        fetchData();
      } else {
        toast.error("Gagal menyetujui pendaftaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pendaftaran/${id}/reject`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Pendaftaran berhasil ditolak");
        fetchData();
      } else {
        toast.error("Gagal menolak pendaftaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pendaftaran/${selectedUserId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("User berhasil dihapus");
        setDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error("Gagal menghapus user");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        );
      case "DITERIMA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <Check className="h-3 w-3" />
            Diterima
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <X className="h-3 w-3" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 lg:p-8 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-20">
          <UserCheck className="h-64 w-64 text-white" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="mb-2 lg:mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium text-white backdrop-blur-sm">
            <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
            Administrator
          </div>
          <h1 className="mb-1 lg:mb-2 text-2xl lg:text-4xl font-bold text-white">
            Kelola Pendaftaran
          </h1>
          <p className="max-w-2xl text-sm lg:text-lg text-emerald-50">
            Kelola dan verifikasi pendaftaran pengguna baru
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Total Pendaftar
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-700">
              {statistik.total}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Menunggu
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-amber-600">
              {statistik.menunggu}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Diterima
            </CardTitle>
            <Check className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-emerald-600">
              {statistik.diterima}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-zinc-600">
              Ditolak
            </CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-red-600">
              {statistik.ditolak}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">Filter:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua Status</SelectItem>
            <SelectItem value="MENUNGGU">Menunggu</SelectItem>
            <SelectItem value="DITERIMA">Diterima</SelectItem>
            <SelectItem value="DITOLAK">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-sm lg:text-base font-semibold text-emerald-700">
            Daftar Pendaftaran
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Total {pagination.total} pendaftar
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Memuat data...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Tidak ada data pendaftaran
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-400 mr-1">
                          {(pagination.page - 1) * pagination.limit + index + 1}.
                        </span>
                        <h3 className="font-medium text-zinc-800">
                          {user.name || "Tanpa Nama"}
                        </h3>
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Daftar: {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.status === "MENUNGGU" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(user.id)}
                            className="bg-red-600 hover:bg-red-700 h-8 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-zinc-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-3">
                  <p className="text-xs lg:text-sm text-zinc-500">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                    {pagination.total} pendaftar
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="h-8 text-xs lg:text-sm"
                    >
                      <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden lg:inline ml-1">Prev</span>
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
                              <span className="px-2 text-zinc-400 text-xs">...</span>
                            )}
                            <Button
                              variant={page === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`h-8 w-8 p-0 text-xs lg:text-sm ${
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
                      className="h-8 text-xs lg:text-sm"
                    >
                      <span className="hidden lg:inline mr-1">Next</span>
                      <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus user ini? Tindakan ini tidak dapat
              dibatalkan.
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
