"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
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

interface KelasSummary {
  kelas: string;
  jumlahSiswa: number;
  jumlahMataPelajaran: number;
}

export default function MataPelajaranPage() {
  const router = useRouter();
  const [kelasSummary, setKelasSummary] = useState<KelasSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran/summary/by-kelas`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setKelasSummary(data);
      } else {
        toast.error("Gagal memuat data mata pelajaran");
      }
    } catch (error) {
      toast.error("Gagal memuat data mata pelajaran");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/nilai")}
          className="text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Kelola Mata Pelajaran
          </h1>
          <p className="text-zinc-600">
            Tambah dan kelola mata pelajaran untuk setiap kelas
          </p>
        </div>
      </div>

      {/* Table */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Daftar Kelas & Mata Pelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-zinc-500">Memuat data...</div>
          ) : (
            <div className="rounded-md border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="w-12 font-semibold text-emerald-700">
                      No
                    </TableHead>
                    <TableHead className="font-semibold text-emerald-700">
                      Kelas
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Jumlah Santri / Santriwati
                    </TableHead>
                    <TableHead className="text-center font-semibold text-emerald-700">
                      Jumlah Mata Pelajaran
                    </TableHead>
                    <TableHead className="text-right font-semibold text-emerald-700">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kelasSummary.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-zinc-500 py-8"
                      >
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    kelasSummary.map((item, index) => (
                      <TableRow key={item.kelas} className="hover:bg-zinc-50">
                        <TableCell className="font-medium text-zinc-900">
                          {index + 1}
                        </TableCell>
                        <TableCell 
                          className="font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer hover:underline"
                          onClick={() =>
                            router.push(`/nilai/mata-pelajaran/${item.kelas}`)
                          }
                        >
                          {item.kelas.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="border-blue-500 text-blue-700 bg-blue-50"
                          >
                            {item.jumlahSiswa} siswa
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="border-emerald-500 text-emerald-700 bg-emerald-50"
                          >
                            {item.jumlahMataPelajaran} mapel
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/nilai/mata-pelajaran/${item.kelas}`)
                            }
                            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
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
