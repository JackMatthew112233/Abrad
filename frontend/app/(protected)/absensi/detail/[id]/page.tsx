"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCheck, UserX, Heart, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SiswaInfo {
  id: string;
  nama: string | null;
  kelas: string | null;
  tingkatan: string | null;
  jenisKelamin: string | null;
}

interface AbsensiRecord {
  id: string;
  tanggal: Date;
  status: string;
  keterangan: string | null;
}

interface AbsensiStats {
  HADIR: number;
  TIDAK_HADIR: number;
  SAKIT: number;
  IZIN: number;
}

export default function DetailAbsensiPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jenis = searchParams.get("jenis");
  const [siswa, setSiswa] = useState<SiswaInfo | null>(null);
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>([]);
  const [stats, setStats] = useState<AbsensiStats>({
    HADIR: 0,
    TIDAK_HADIR: 0,
    SAKIT: 0,
    IZIN: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (params.id) {
      fetchSiswaInfo(params.id as string);
      fetchAbsensiData(params.id as string);
    }
  }, [params.id, jenis]);

  const fetchSiswaInfo = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/${id}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSiswa({
          id: data.id,
          nama: data.nama,
          kelas: data.kelas,
          tingkatan: data.tingkatan,
          jenisKelamin: data.jenisKelamin,
        });
      }
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    }
  };

  const fetchAbsensiData = async (id: string, start?: string, end?: string) => {
    try {
      setIsLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/absensi/siswa/${id}`;
      const params = new URLSearchParams();
      if (jenis) {
        params.append("jenis", jenis);
      }
      if (start && end) {
        params.append("startDate", start);
        params.append("endDate", end);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAbsensiList(data);
        
        // Calculate stats
        const newStats = {
          HADIR: 0,
          TIDAK_HADIR: 0,
          SAKIT: 0,
          IZIN: 0,
        };
        data.forEach((item: AbsensiRecord) => {
          newStats[item.status as keyof AbsensiStats]++;
        });
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Gagal memuat data absensi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (params.id && startDate && endDate) {
      setCurrentPage(1); // Reset to first page
      fetchAbsensiData(params.id as string, startDate, endDate);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1); // Reset to first page
    if (params.id) {
      fetchAbsensiData(params.id as string);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(absensiList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = absensiList.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!siswa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-zinc-500">Memuat data...</div>
        </div>
      </div>
    );
  }

  const totalAbsensi = stats.HADIR + stats.TIDAK_HADIR + stats.SAKIT + stats.IZIN;
  const persenKehadiran = totalAbsensi > 0
    ? ((stats.HADIR / totalAbsensi) * 100).toFixed(1)
    : "0";

  // Group data by month for trend chart
  const monthlyData = absensiList.reduce((acc: any, item) => {
    const date = new Date(item.tanggal);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString("id-ID", { year: "numeric", month: "short" });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        bulan: monthName,
        hadir: 0,
        tidakHadir: 0,
        sakit: 0,
        izin: 0,
      };
    }
    
    if (item.status === "HADIR") acc[monthKey].hadir++;
    else if (item.status === "TIDAK_HADIR") acc[monthKey].tidakHadir++;
    else if (item.status === "SAKIT") acc[monthKey].sakit++;
    else if (item.status === "IZIN") acc[monthKey].izin++;
    
    return acc;
  }, {});

  const trendData = Object.keys(monthlyData)
    .sort()
    .map(key => monthlyData[key]);

  // Data for pie chart
  const pieData = [
    { name: "Hadir", value: stats.HADIR, fill: "#10b981" },
    { name: "Tidak Hadir", value: stats.TIDAK_HADIR, fill: "#ef4444" },
    { name: "Sakit", value: stats.SAKIT, fill: "#f59e0b" },
    { name: "Izin", value: stats.IZIN, fill: "#3b82f6" },
  ].filter(item => item.value > 0);

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
            Detail Absensi {jenis ? `${jenis === "KELAS" ? "Kelas" : jenis === "ASRAMA" ? "Asrama" : "Pengajian"}` : ""} - {siswa.nama}
          </h1>
          <p className="text-zinc-600">
            {siswa.kelas ? siswa.kelas.replace("_", " ") : "-"} • {siswa.tingkatan || "-"}
          </p>
        </div>
      </div>

      {/* Filter Tanggal */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Riwayat Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleFilter}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!startDate || !endDate}
              >
                Filter
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-zinc-300"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Hadir
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats.HADIR}</div>
            <p className="text-xs text-zinc-500 mt-2">
              {persenKehadiran}% tingkat kehadiran
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Tidak Hadir
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.TIDAK_HADIR}</div>
            <p className="text-xs text-zinc-500 mt-2">
              Tanpa keterangan
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Sakit
            </CardTitle>
            <Heart className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{stats.SAKIT}</div>
            <p className="text-xs text-zinc-500 mt-2">
              Sakit dengan keterangan
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Izin
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.IZIN}</div>
            <p className="text-xs text-zinc-500 mt-2">
              Izin dengan keterangan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Trend Kehadiran Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bulan" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="hadir" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Hadir"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sakit" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Sakit"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="izin" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Izin"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tidakHadir" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Tidak Hadir"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-zinc-500">
                Belum ada data untuk ditampilkan
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-emerald-700">
              Persentase Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} hari`, 'Jumlah']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-zinc-500">
                Belum ada data untuk ditampilkan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabel Riwayat */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Riwayat Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700">Hari & Tanggal</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Status</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-zinc-500">
                        Belum ada data absensi
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.status === "HADIR"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : item.status === "TIDAK_HADIR"
                                ? "border-red-300 bg-red-50 text-red-700"
                                : item.status === "SAKIT"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-blue-300 bg-blue-50 text-blue-700"
                            }
                          >
                            {item.status === "HADIR"
                              ? "Hadir"
                              : item.status === "TIDAK_HADIR"
                              ? "Tidak Hadir"
                              : item.status === "SAKIT"
                              ? "Sakit"
                              : "Izin"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.keterangan || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && absensiList.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, absensiList.length)} dari {absensiList.length} data
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
