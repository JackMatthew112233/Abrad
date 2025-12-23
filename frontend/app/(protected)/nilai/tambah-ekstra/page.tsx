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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Siswa {
    id: string;
    nama: string;
    kelas?: string;
    tingkatan?: string;
}

interface Ekstrakurikuler {
    id: string;
    nama: string;
}

export default function TambahNilaiEkstraPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ekstraList, setEkstraList] = useState<Ekstrakurikuler[]>([]);

    const [formData, setFormData] = useState({
        ekstrakurikulerId: "",
        nilai: "",
        semester: "Ganjil",
        tahunAjaran: "2024/2025",
        tanggal: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                searchSiswa(searchQuery);
            } else {
                setSiswaList([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchSiswa = async (query: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/keuangan/search-siswa?q=${query}`,
                {
                    credentials: "include",
                }
            );
            if (response.ok) {
                const data = await response.json();
                setSiswaList(data);
                setShowResults(true);
            }
        } catch (error) {
            console.error("Error searching siswa:", error);
        }
    };

    const selectSiswa = async (siswa: Siswa) => {
        setSelectedSiswa(siswa);
        setSearchQuery(siswa.nama);
        setShowResults(false);

        // Fetch ekstrakurikuler list (master)
        // Assuming /ekstrakurikuler returns all available activities
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler`,
                { credentials: "include" }
            );
            if (response.ok) {
                const data = await response.json();
                setEkstraList(data);
            }
        } catch (error) {
            console.error("Error fetching ekstrakurikuler:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSiswa) {
            toast.error("Pilih santri / santriwati terlebih dahulu");
            return;
        }

        if (!formData.ekstrakurikulerId || !formData.nilai || !formData.semester || !formData.tahunAjaran) {
            toast.error("Semua field wajib diisi");
            return;
        }

        setIsSubmitting(true);

        try {
            // Using the backend logic that expects create payload
            // Or upsert logic? The service `create` method handles logic? 
            // The controller has @Post() create(@Body() createNilaiEkstrakurikulerDto: CreateNilaiEkstrakurikulerDto)
            // Dto: siswaId, ekstrakurikulerId, nilai, semester, tahunAjaran

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/nilai-ekstrakurikuler`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        siswaId: selectedSiswa.id,
                        ekstrakurikulerId: formData.ekstrakurikulerId,
                        nilai: formData.nilai,
                        semester: formData.semester,
                        tahunAjaran: formData.tahunAjaran,
                    }),
                }
            );

            if (response.ok) {
                toast.success("Data nilai ekstrakurikuler berhasil ditambahkan!");
                router.push("/nilai");
            } else {
                const error = await response.json();
                toast.error(error.message || "Gagal menambahkan data nilai");
            }
        } catch (error) {
            toast.error("Gagal menambahkan data nilai");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        Tambah Nilai Ekstrakurikuler
                    </h1>
                    <p className="text-zinc-600">
                        Isi formulir di bawah untuk menambahkan nilai ekstrakurikuler santri
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card className="border-zinc-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-emerald-700">
                        Formulir Nilai Ekstrakurikuler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Search Siswa */}
                        <div className="space-y-2">
                            <Label htmlFor="siswa">
                                Nama Santri / Santriwati <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        id="siswa"
                                        placeholder="Cari nama santri / santriwati..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => siswaList.length > 0 && setShowResults(true)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {showResults && siswaList.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                                        {siswaList.map((siswa) => (
                                            <button
                                                key={siswa.id}
                                                type="button"
                                                onClick={() => selectSiswa(siswa)}
                                                className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-zinc-100 last:border-b-0"
                                            >
                                                <p className="font-medium text-zinc-900">{siswa.nama}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {siswa.tingkatan && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                                            {siswa.tingkatan}
                                                        </span>
                                                    )}
                                                    {siswa.kelas && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                                            {siswa.kelas?.replace("_", " ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedSiswa && (
                                <Card className="mt-3 border-emerald-200 bg-emerald-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                                                        {selectedSiswa.nama.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-emerald-900">
                                                            {selectedSiswa.nama}
                                                        </p>
                                                        <div className="flex gap-2 mt-1">
                                                            {selectedSiswa.tingkatan && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                                                                    {selectedSiswa.tingkatan}
                                                                </span>
                                                            )}
                                                            {selectedSiswa.kelas && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">
                                                                    {selectedSiswa.kelas.replace("_", " ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSiswa(null);
                                                    setSearchQuery("");
                                                }}
                                                className="text-zinc-600 hover:text-red-600"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Ekstrakurikuler */}
                        <div className="space-y-2">
                            <Label htmlFor="ekstrakurikuler">
                                Ekstrakurikuler <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.ekstrakurikulerId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, ekstrakurikulerId: value })
                                }
                                disabled={!selectedSiswa}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Ekstrakurikuler" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ekstraList.map((ekstra) => (
                                        <SelectItem key={ekstra.id} value={ekstra.id}>
                                            {ekstra.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nilai */}
                        <div className="space-y-2">
                            <Label htmlFor="nilai">
                                Nilai (Huruf/Predikat) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nilai"
                                placeholder="Contoh: A, B, Baik, Sangat Baik"
                                value={formData.nilai}
                                onChange={(e) =>
                                    setFormData({ ...formData, nilai: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* Semester & Tahun Ajaran */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="semester">
                                    Semester <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.semester}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, semester: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ganjil">Ganjil</SelectItem>
                                        <SelectItem value="Genap">Genap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tahunAjaran">
                                    Tahun Ajaran <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tahunAjaran"
                                    placeholder="Contoh: 2024/2025"
                                    value={formData.tahunAjaran}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tahunAjaran: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={isSubmitting}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
