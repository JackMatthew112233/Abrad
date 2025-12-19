"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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

  const totalMapel = kelasSummary.reduce((sum, k) => sum + k.jumlahMataPelajaran, 0);
  const totalSantri = kelasSummary.reduce((sum, k) => sum + k.jumlahSiswa, 0);

  const KelasCard = ({ item }: { item: KelasSummary }) => (
    <button
      onClick={() => router.push(`/nilai/mata-pelajaran/${item.kelas}`)}
      className="group bg-white border border-zinc-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-zinc-900 text-sm lg:text-base group-hover:text-emerald-700 transition-colors">
          {item.kelas.replace("_", " ")}
        </h3>
        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
      </div>
      <div className="flex items-center gap-4 text-xs lg:text-sm text-zinc-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{item.jumlahMataPelajaran} mapel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{item.jumlahSiswa} santri</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Back Button - Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => router.push("/nilai")}
          className="w-full text-xs h-9"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Kembali
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/nilai")}
          className="hidden lg:flex text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-emerald-700">
            Kelola Mata Pelajaran
          </h1>
          <p className="text-xs lg:text-sm text-zinc-500">
            Pilih kelas untuk mengelola mata pelajaran
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Mata Pelajaran</p>
          <p className="text-xl lg:text-2xl font-bold text-emerald-700">
            {isLoading ? "..." : totalMapel}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Santri</p>
          <p className="text-xl lg:text-2xl font-bold text-emerald-700">
            {isLoading ? "..." : totalSantri}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Memuat data...
        </div>
      ) : kelasSummary.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Tidak ada data kelas
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {kelasSummary.map((item) => (
            <KelasCard key={item.kelas} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
