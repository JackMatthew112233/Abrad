"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Plus } from "lucide-react";
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

interface BiodataKeuangan {
  id: string;
  komitmenInfaqLaundry: number;
  infaq: number;
  laundry: number;
  siswa: {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
  };
}

export default function BiodataKeuanganListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [biodataList, setBiodataList] = useState<BiodataKeuangan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBiodataKeuangan();
  }, []);

  const fetchBiodataKeuangan = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/keuangan/biodata`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBiodataList(data);
      } else {
        toast.error("Gagal memuat data biodata keuangan");
      }
    } catch (error) {
      toast.error("Gagal memuat data biodata keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBiodata = biodataList.filter((biodata) =>
    biodata.siswa.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
            Daftar Biodata Keuangan
          </h1>
          <p className="text-zinc-600">
            Data komitmen infaq dan laundry santri / santriwati
          </p>
        </div>
        <Button
          onClick={() => router.push("/keuangan/biodata/tambah")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Biodata
        </Button>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-700">
            Biodata Keuangan Santri / Santriwati
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
                    <TableHead className="font-semibold text-emerald-700">Nama</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Tingkatan</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Kelas</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Komitmen Total</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Infaq</TableHead>
                    <TableHead className="font-semibold text-emerald-700">Laundry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBiodata.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-zinc-500">
                        {searchQuery
                          ? "Tidak ada data yang sesuai pencarian"
                          : "Belum ada biodata keuangan"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBiodata.map((biodata, index) => (
                      <TableRow key={biodata.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{biodata.siswa.nama}</TableCell>
                        <TableCell>
                          {biodata.siswa.tingkatan && (
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                              {biodata.siswa.tingkatan}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {biodata.siswa.kelas && (
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                              {biodata.siswa.kelas.replace("_", " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-700">
                          {formatCurrency(biodata.komitmenInfaqLaundry)}
                        </TableCell>
                        <TableCell>{formatCurrency(biodata.infaq)}</TableCell>
                        <TableCell>{formatCurrency(biodata.laundry)}</TableCell>
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
