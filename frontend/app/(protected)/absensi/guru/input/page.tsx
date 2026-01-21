"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  GraduationCap,
  Save,
  Search,
  Calendar,
  UserCheck,
  UserX,
  Heart,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Guru {
  id: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
}

export default function InputAbsensiGuruPage() {
  const router = useRouter();
  
  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [status, setStatus] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [useTodayDate, setUseTodayDate] = useState(true);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  
  // Data states
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [filteredGuru, setFilteredGuru] = useState<Guru[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all guru on mount
  useEffect(() => {
    fetchGuruList();
  }, []);

  // Filter guru based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGuru([]);
      setShowDropdown(false);
    } else {
      const filtered = guruList.filter(
        (guru) =>
          guru.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guru.nip?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuru(filtered);
      setShowDropdown(filtered.length > 0 && !selectedGuru);
    }
  }, [searchQuery, guruList, selectedGuru]);

  // Update tanggal when checkbox changes
  useEffect(() => {
    if (useTodayDate) {
      setTanggal(new Date().toISOString().split("T")[0]);
    }
  }, [useTodayDate]);

  const fetchGuruList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guru?limit=1000`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setGuruList(data.data || []);
      }
    } catch (error) {
      toast.error("Gagal memuat data guru");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGuru = (guru: Guru) => {
    setSelectedGuru(guru);
    setSearchQuery(guru.nama);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedGuru(null);
    setSearchQuery("");
    setStatus("");
    setKeterangan("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuru) {
      toast.error("Pilih guru terlebih dahulu");
      return;
    }

    if (!status) {
      toast.error("Pilih status kehadiran");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guru/absensi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            guruId: selectedGuru.id,
            tanggal,
            status,
            keterangan: keterangan || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Absensi berhasil disimpan!");
        // Reset form
        handleClearSelection();
      } else {
        toast.error(data.message || "Gagal menyimpan absensi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: "HADIR", label: "Hadir", icon: UserCheck, color: "emerald", bgColor: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", activeColor: "bg-emerald-500 text-white border-emerald-500" },
    { value: "TIDAK_HADIR", label: "Tidak Hadir", icon: UserX, color: "red", bgColor: "bg-red-50 hover:bg-red-100 border-red-200", activeColor: "bg-red-500 text-white border-red-500" },
    { value: "SAKIT", label: "Sakit", icon: Heart, color: "blue", bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200", activeColor: "bg-blue-500 text-white border-blue-500" },
    { value: "IZIN", label: "Izin", icon: FileText, color: "amber", bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200", activeColor: "bg-amber-500 text-white border-amber-500" },
  ];

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

      {/* Form Card */}
      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-emerald-700">
            Form Input Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Guru */}
            <div className="space-y-2">
              <Label htmlFor="search-guru" className="text-sm font-medium">
                Cari Nama Guru <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="search-guru"
                  placeholder="Ketik nama atau NIP guru..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedGuru) setSelectedGuru(null);
                  }}
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                {selectedGuru && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Dropdown Results */}
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                    {filteredGuru.map((guru) => (
                      <button
                        key={guru.id}
                        type="button"
                        onClick={() => handleSelectGuru(guru)}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-zinc-100 last:border-0"
                      >
                        <div className="font-medium text-zinc-900">{guru.nama}</div>
                        <div className="text-xs text-zinc-500">
                          {guru.nip ? `NIP: ${guru.nip}` : "NIP: -"} • {guru.jabatan || "-"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Guru Info */}
              {selectedGuru && (
                <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-700">{selectedGuru.nama}</p>
                      <p className="text-xs text-emerald-600">
                        {selectedGuru.nip ? `NIP: ${selectedGuru.nip}` : "NIP: -"} • {selectedGuru.jabatan || "-"}
                      </p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-emerald-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Status Kehadiran */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Status Kehadiran <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        isActive ? option.activeColor : option.bgColor
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${isActive ? "text-white" : `text-${option.color}-600`}`} />
                      <span className={`text-sm font-medium ${isActive ? "text-white" : `text-${option.color}-700`}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-sm font-medium">
                Keterangan <span className="text-zinc-400">(opsional)</span>
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Tambahkan keterangan jika diperlukan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant={useTodayDate ? "default" : "outline"}
                  onClick={() => setUseTodayDate(true)}
                  className={useTodayDate ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Hari Ini ({new Date().toLocaleDateString("id-ID", { 
                    day: "numeric", 
                    month: "short", 
                    year: "numeric" 
                  })})
                </Button>
                <Button
                  type="button"
                  variant={!useTodayDate ? "default" : "outline"}
                  onClick={() => setUseTodayDate(false)}
                  className={!useTodayDate ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Pilih Tanggal Lain
                </Button>
              </div>

              {!useTodayDate && (
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-auto"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                disabled={isSaving || !selectedGuru || !status}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Absensi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
