"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Plus, ExternalLink } from "lucide-react";
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

interface Pembayaran {
  id: string;
  totalPembayaranInfaq: number;
  totalPembayaranLaundry: number;
  buktiPembayaran: string;
  createdAt: string;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

export default function RiwayatPembayaranPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const fetchPembayaran = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/pembayaran`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPembayaranList(data);
      } else {
        toast.error("Gagal memuat data pembayaran");
      }
    } catch (error) {
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPembayaran = pembayaranList.filter((pembayaran) =>
    pembayaran.siswa.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-emerald-700">
            Riwayat Pembayaran
          </h1>
          <p className="text-zinc-600">
            Data pembayaran infaq dan laundry santri / santriwati
          </p>
        </div>
        <Button
          onClick={() => router.push("/keuangan/pembayaran/tambah")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pembayaran
        </Button>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Riwayat Pembayaran Santri / Santriwati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Cari nama santri / santriwati..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-700">No</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Infaq</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Laundry</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Total</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Bukti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPembayaran.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-zinc-500">
                        {searchQuery
                          ? "Tidak ada data yang sesuai pencarian"
                          : "Belum ada riwayat pembayaran"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPembayaran.map((pembayaran, index) => (
                      <TableRow key={pembayaran.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(pembayaran.createdAt)}
                        </TableCell>
                        <TableCell>{pembayaran.siswa.nama}</TableCell>
                        <TableCell>
                          {pembayaran.siswa.tingkatan && (
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                              {pembayaran.siswa.tingkatan}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {pembayaran.siswa.kelas && (
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                              {pembayaran.siswa.kelas.replace("_", " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(pembayaran.totalPembayaranInfaq)}</TableCell>
                        <TableCell>{formatCurrency(pembayaran.totalPembayaranLaundry)}</TableCell>
                        <TableCell className="font-semibold text-emerald-700">
                          {formatCurrency(pembayaran.totalPembayaranInfaq + pembayaran.totalPembayaranLaundry)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(pembayaran.buktiPembayaran, "_blank")}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
