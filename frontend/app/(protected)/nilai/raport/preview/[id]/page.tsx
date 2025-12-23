"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, RefreshCw, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Types
interface Helper {
    headerText1: string;
    headerText2: string;
    logoKiriUrl: string | null;
    logoKananUrl: string | null;
    namaSekolah: string;
    headmasterTitle: string;
}

interface Siswa {
    id: string;
    nama: string;
    kelas: string;
    nisn: string;
    nis: string;
}

interface NilaiItem {
    id: string;
    mataPelajaran: string;
    nilai: number;
    predikat: string;
    kategori?: "KEPESANTRENAN" | "KEKHUSUSAN" | "UMUM";
    mapelId?: string;
}

interface PrestasiItem {
    id: string; // temp id
    nama: string;
    keterangan: string;
}

interface RaportData {
    siswa: Siswa;
    sekolah: Helper;
    waliKelas: string;
    nilai: {
        kepesantrenan: NilaiItem[];
        kekhususan: NilaiItem[];
        umum: NilaiItem[];
    };
    ekstrakurikuler: any[];
    absensi: any;
    meta: {
        semester: string;
        tahunAjaran: string;
        tanggal: string;
    };
    // Editable fields
    prestasi: PrestasiItem[];
    catatanWaliKelas: string;
    tanggapanOrangTua: string;
    namaOrangTua: string;
    namaKepalaSekolah: string;
}

export default function RaportPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const semester = searchParams.get("semester") || "Ganjil";
    const tahunAjaran = searchParams.get("tahunAjaran") || "2024/2025";
    const siswaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RaportData | null>(null);
    const [generating, setGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/nilai/raport/preview/${siswaId}?semester=${semester}&tahunAjaran=${tahunAjaran}`,
                    { credentials: "include" }
                );
                if (!res.ok) throw new Error("Gagal memuat data raport");
                const result = await res.json();

                // Initialize default editable fields if missing
                if (!result.prestasi) result.prestasi = [];
                if (!result.catatanWaliKelas) result.catatanWaliKelas = "";
                if (!result.tanggapanOrangTua) result.tanggapanOrangTua = "";
                if (!result.namaOrangTua) result.namaOrangTua = "";
                if (!result.namaKepalaSekolah) result.namaKepalaSekolah = ""; // Should fetch active headmaster if possible

                setData(result);
            } catch (error) {
                toast.error("Gagal memuat data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [siswaId, semester, tahunAjaran]);

    const handleDownload = async () => {
        if (!data) return;
        setGenerating(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/nilai/raport/generate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    credentials: "include",
                }
            );

            if (!res.ok) throw new Error("Gagal generate raport");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Raport-${data.siswa.nama}-${semester}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success("Raport berhasil didownload");
        } catch (error) {
            toast.error("Gagal download raport");
        } finally {
            setGenerating(false);
        }
    };

    // Helper to add Prestasi row
    const addPrestasi = () => {
        if (!data) return;
        const newPrestasi = {
            id: Math.random().toString(36).substr(2, 9),
            nama: "",
            keterangan: ""
        };
        setData({
            ...data,
            prestasi: [...data.prestasi, newPrestasi]
        });
    };

    const removePrestasi = (id: string) => {
        if (!data) return;
        setData({
            ...data,
            prestasi: data.prestasi.filter(p => p.id !== id)
        });
    };

    const updatePrestasi = (id: string, field: 'nama' | 'keterangan', value: string) => {
        if (!data) return;
        setData({
            ...data,
            prestasi: data.prestasi.map(p => p.id === id ? { ...p, [field]: value } : p)
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'kiri' | 'kanan') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 2MB");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Mengupload logo...");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nilai/upload-logo`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!res.ok) throw new Error("Gagal upload logo");

            const result = await res.json();

            if (data) {
                setData({
                    ...data,
                    sekolah: {
                        ...data.sekolah,
                        [side === 'kiri' ? 'logoKiriUrl' : 'logoKananUrl']: result.url
                    }
                });
            }
            toast.success("Logo berhasil diupload", { id: toastId });
        } catch (error) {
            toast.error("Gagal mengupload logo", { id: toastId });
        }
    };

    // Helper to update Subject Category
    const updateCategory = async (mapelId: string | undefined, mapelName: string, newCategory: string) => {
        if (!data) return;

        // Optimistic Update
        let itemToMove: NilaiItem | undefined;

        // Find and remove from source
        const newKepesantrenan = data.nilai.kepesantrenan.filter(i => {
            if (i.mataPelajaran === mapelName) { itemToMove = i; return false; }
            return true;
        });
        const newKekhususan = data.nilai.kekhususan.filter(i => {
            if (i.mataPelajaran === mapelName) { itemToMove = i; return false; }
            return true;
        });
        const newUmum = data.nilai.umum.filter(i => {
            if (i.mataPelajaran === mapelName) { itemToMove = i; return false; }
            return true;
        });

        if (itemToMove) {
            // Add to destination
            if (newCategory === "KEPESANTRENAN") newKepesantrenan.push(itemToMove);
            else if (newCategory === "KEKHUSUSAN") newKekhususan.push(itemToMove);
            else newUmum.push(itemToMove);

            setData({
                ...data,
                nilai: {
                    kepesantrenan: newKepesantrenan,
                    kekhususan: newKekhususan,
                    umum: newUmum
                }
            });

            // Sync to backend
            if (mapelId) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mata-pelajaran/${mapelId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ kategori: newCategory }),
                        credentials: 'include'
                    });
                    toast.success("Kategori mapel berhasil diperbarui");
                } catch (e) {
                    toast.error("Gagal menyimpan kategori mapel ke database");
                }
            } else {
                toast.warning("ID Mapel tidak ditemukan, perubahan ini hanya sementara.");
            }
        }
    };


    if (loading) return <div className="p-8 text-center text-zinc-500">Memuat data raport...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data.</div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
            {/* Top Bar */}
            <div className="flex-none bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900">Editor & Preview Raport</h1>
                        <p className="text-xs text-zinc-500">{data.siswa.nama} - {semester} {tahunAjaran}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button variant={showPreview ? "secondary" : "outline"} onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? "Sembunyikan Preview" : "Lihat Preview"}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleDownload} disabled={generating}>
                        <Download className="mr-2 h-4 w-4" />
                        {generating ? "Generating..." : "Download Excel"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar (Left) */}
                <div className={`${showPreview ? "w-1/3 min-w-[400px] border-r" : "w-full max-w-5xl mx-auto"} border-zinc-200 bg-white overflow-y-auto p-4 space-y-6 transition-all`}>

                    {/* Section: Header Sekolah */}
                    <Card>
                        <CardHeader className="py-3 px-4 bg-zinc-50 border-b">
                            <CardTitle className="text-sm font-semibold">Kop & Header Laporan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Teks Baris 1</Label>
                                <Input
                                    value={data.sekolah.headerText1}
                                    onChange={(e) => setData({ ...data, sekolah: { ...data.sekolah, headerText1: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teks Baris 2</Label>
                                <Input
                                    value={data.sekolah.headerText2}
                                    onChange={(e) => setData({ ...data, sekolah: { ...data.sekolah, headerText2: e.target.value } })}
                                />
                            </div>
                            {/* Logo Upload placeholders */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs mb-1 block">Logo Kiri</Label>
                                    <div className="flex items-center gap-2">
                                        {data.sekolah.logoKiriUrl && <img src={data.sekolah.logoKiriUrl} className="h-8 w-8 object-contain border rounded bg-white" alt="Logo Kiri" />}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="h-8 text-[10px] file:mr-2 file:py-0 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                            onChange={(e) => handleLogoUpload(e, 'kiri')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Logo Kanan</Label>
                                    <div className="flex items-center gap-2">
                                        {data.sekolah.logoKananUrl && <img src={data.sekolah.logoKananUrl} className="h-8 w-8 object-contain border rounded bg-white" alt="Logo Kanan" />}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="h-8 text-[10px] file:mr-2 file:py-0 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                            onChange={(e) => handleLogoUpload(e, 'kanan')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Manajemen Mapel */}
                    <Card>
                        <CardHeader className="py-3 px-4 bg-zinc-50 border-b">
                            <CardTitle className="text-sm font-semibold">Daftar Nilai Tersedia</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-60 overflow-y-auto">
                            {[...data.nilai.kepesantrenan, ...data.nilai.kekhususan, ...data.nilai.umum].sort((a, b) => a.mataPelajaran.localeCompare(b.mataPelajaran)).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-0 text-sm">
                                    <span className="truncate max-w-[180px]" title={item.mataPelajaran}>{item.mataPelajaran}</span>
                                    <Select
                                        value={
                                            data.nilai.kepesantrenan.find(i => i.id === item.id) ? "KEPESANTRENAN" :
                                                data.nilai.kekhususan.find(i => i.id === item.id) ? "KEKHUSUSAN" : "UMUM"
                                        }
                                        onValueChange={(val) => updateCategory(item.mapelId, item.mataPelajaran, val)}
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="KEPESANTRENAN">Kepesantrenan</SelectItem>
                                            <SelectItem value="KEKHUSUSAN">Kekhususan</SelectItem>
                                            <SelectItem value="UMUM">Belum Ada Kategori</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Section: Prestasi */}
                    <Card>
                        <CardHeader className="py-3 px-4 bg-zinc-50 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Prestasi / Penghargaan</CardTitle>
                            <Button variant="ghost" size="sm" onClick={addPrestasi} className="h-6 w-6 p-0 text-emerald-600"><Plus className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {data.prestasi.length === 0 && <p className="text-xs text-zinc-400 italic">Belum ada prestasi ditambahkan.</p>}
                            {data.prestasi.map((p) => (
                                <div key={p.id} className="flex gap-2 items-start border p-2 rounded bg-zinc-50">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="Nama Kegiatan/Lomba"
                                            className="h-8 text-xs"
                                            value={p.nama}
                                            onChange={(e) => updatePrestasi(p.id, 'nama', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Keterangan (ex: Juara 1)"
                                            className="h-8 text-xs"
                                            value={p.keterangan}
                                            onChange={(e) => updatePrestasi(p.id, 'keterangan', e.target.value)}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => removePrestasi(p.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Section: Signatories & Notes */}
                    <Card>
                        <CardHeader className="py-3 px-4 bg-zinc-50 border-b">
                            <CardTitle className="text-sm font-semibold">Tanda Tangan & Catatan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Catatan Wali Kelas</Label>
                                <Textarea
                                    className="resize-none"
                                    rows={3}
                                    value={data.catatanWaliKelas}
                                    onChange={(e) => setData({ ...data, catatanWaliKelas: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggapan Orang Tua</Label>
                                <Textarea
                                    className="resize-none"
                                    rows={2}
                                    value={data.tanggapanOrangTua}
                                    onChange={(e) => setData({ ...data, tanggapanOrangTua: e.target.value })}
                                />
                            </div>
                            <Separator />
                            <div className="grid gap-3">
                                <div>
                                    <Label>Nama Wali Kelas</Label>
                                    <Input
                                        value={data.waliKelas}
                                        onChange={(e) => setData({ ...data, waliKelas: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Nama Orang Tua / Wali</Label>
                                    <Input
                                        placeholder="..................."
                                        value={data.namaOrangTua}
                                        onChange={(e) => setData({ ...data, namaOrangTua: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Jabatan Kepala</Label>
                                    <Input
                                        value={data.sekolah.headmasterTitle || "Kepala Mar'halah Wustha/Ulya"}
                                        onChange={(e) => setData({ ...data, sekolah: { ...data.sekolah, headmasterTitle: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <Label>Nama Kepala</Label>
                                    <Input
                                        value={data.namaKepalaSekolah}
                                        placeholder="..................."
                                        onChange={(e) => setData({ ...data, namaKepalaSekolah: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Area (Right) */}
                <div className={`${showPreview ? "flex-1 flex" : "hidden"} justify-center bg-zinc-100 overflow-y-auto p-8`}>
                    <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] h-fit mb-10 p-[20mm] text-[12px] leading-tight text-black scale-100 origin-top">
                        {/* Live HTML Preview approximating the Excel Layout */}

                        {/* Header */}
                        <div className="text-center font-bold mb-6">
                            <div className="flex justify-between items-center mb-2 px-10">
                                {data.sekolah.logoKiriUrl && <img src={data.sekolah.logoKiriUrl} className="h-16 w-16 object-contain" alt="Logo" />}
                                <div className="flex-1">
                                    <h1 className="text-lg uppercase">{data.sekolah.headerText1}</h1>
                                    <h2 className="text-sm uppercase">{data.sekolah.headerText2}</h2>
                                </div>
                                {data.sekolah.logoKananUrl && <img src={data.sekolah.logoKananUrl} className="h-16 w-16 object-contain" alt="Logo" />}
                            </div>
                            <div className="border-b-2 border-black w-full my-2"></div>
                        </div>

                        {/* Student Info */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6 text-sm">
                            <div className="grid grid-cols-[140px_1fr]">
                                <span>Nama Peserta Didik</span>
                                <span className="font-semibold">: {data.siswa.nama}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span>Kelas / Semester</span>
                                <span>: {data.siswa.kelas?.replace("_", " ")} / {data.meta.semester}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span>NISN / NIS</span>
                                <span>: {data.siswa.nisn || "-"} / {data.siswa.nis || "-"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span>Tahun Ajaran</span>
                                <span>: {data.meta.tahunAjaran}</span>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <table className="w-full border-collapse border border-black text-xs mb-6">
                            <thead className="text-center font-bold bg-zinc-100">
                                <tr>
                                    <th rowSpan={2} className="border border-black p-1 w-12">NO.</th>
                                    <th rowSpan={2} className="border border-black p-1">BIDANG STUDI</th>
                                    <th colSpan={2} className="border border-black p-1">NILAI</th>
                                </tr>
                                <tr>
                                    <th className="border border-black p-1 w-16">ANGKA</th>
                                    <th className="border border-black p-1 w-16">PREDIKAT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* I. Kepesantrenan */}
                                {data.nilai.kepesantrenan.length > 0 && (
                                    <>
                                        <tr><td colSpan={4} className="border border-black p-1 font-bold bg-zinc-50">I. KEPESANTRENAN</td></tr>
                                        {data.nilai.kepesantrenan.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                                <td className="border border-black p-1">{item.mataPelajaran}</td>
                                                <td className="border border-black p-1 text-center">{item.nilai}</td>
                                                <td className="border border-black p-1 text-center">{item.predikat}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}

                                {/* II. Kekhususan */}
                                {data.nilai.kekhususan.length > 0 && (
                                    <>
                                        <tr><td colSpan={4} className="border border-black p-1 font-bold bg-zinc-50">II. KEKHUSUSAN</td></tr>
                                        {data.nilai.kekhususan.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                                <td className="border border-black p-1">{item.mataPelajaran}</td>
                                                <td className="border border-black p-1 text-center">{item.nilai}</td>
                                                <td className="border border-black p-1 text-center">{item.predikat}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>

                        {/* Ekstra Table */}
                        <div className="font-bold mb-1">Ekstrakurikuler</div>
                        <table className="w-full border-collapse border border-black text-xs mb-6">
                            <thead className="text-center font-bold bg-zinc-100">
                                <tr>
                                    <th className="border border-black p-1 w-12">No</th>
                                    <th className="border border-black p-1">Kegiatan</th>
                                    <th className="border border-black p-1 w-20">Nilai</th>
                                    <th className="border border-black p-1">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.ekstrakurikuler.length > 0 ? data.ekstrakurikuler.map((ek, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                                        <td className="border border-black p-1">{ek.nama}</td>
                                        <td className="border border-black p-1 text-center">{ek.nilai}</td>
                                        <td className="border border-black p-1 text-center">{ek.keterangan || '-'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="border border-black p-1 text-center">1</td>
                                        <td className="border border-black p-1">-</td>
                                        <td className="border border-black p-1 text-center">-</td>
                                        <td className="border border-black p-1 text-center">-</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Prestasi Table */}
                        <div className="font-bold mb-1">Prestasi</div>
                        <table className="w-full border-collapse border border-black text-xs mb-6">
                            <thead className="text-center font-bold bg-zinc-100">
                                <tr>
                                    <th className="border border-black p-1 w-12">No</th>
                                    <th className="border border-black p-1">Kegiatan / Prestasi</th>
                                    <th className="border border-black p-1">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.prestasi.length > 0 ? data.prestasi.map((p, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                                        <td className="border border-black p-1">{p.nama}</td>
                                        <td className="border border-black p-1">{p.keterangan}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="border border-black p-1 text-center">1</td>
                                        <td className="border border-black p-1">-</td>
                                        <td className="border border-black p-1">-</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Absensi */}
                        <div className="font-bold mb-1">Ketidakhadiran</div>
                        <div className="border border-black p-2 w-1/2 mb-6">
                            <div className="grid grid-cols-[20px_120px_10px_1fr]">
                                <span>1.</span><span>Sakit</span><span>:</span><span>{data.absensi.SAKIT || 0} Hari</span>
                                <span>2.</span><span>Izin</span><span>:</span><span>{data.absensi.IZIN || 0} Hari</span>
                                <span>3.</span><span>Tanpa Keterangan</span><span>:</span><span>{data.absensi.TIDAK_HADIR || 0} Hari</span>
                            </div>
                        </div>

                        {/* Boxes */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="border border-black p-2 h-24">
                                <span className="font-bold underline">Catatan Wali Kelas:</span>
                                <p className="mt-1 whitespace-pre-wrap">{data.catatanWaliKelas}</p>
                            </div>
                            <div className="border border-black p-2 h-24">
                                <span className="font-bold underline">Tanggapan Orang Tua/Wali:</span>
                                <p className="mt-1 whitespace-pre-wrap">{data.tanggapanOrangTua}</p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                            <div>
                                <div className="mb-16">Orang Tua/ Wali Peserta Didik</div>
                                <div className="font-bold underline">{data.namaOrangTua || ".........................."}</div>
                            </div>
                            <div></div>
                            <div>
                                <div className="mb-16">Makassar, {data.meta.tanggal} <br /> Wali Kelas</div>
                                <div className="font-bold underline">{data.waliKelas || ".........................."}</div>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <div className="mb-16">Mengetahui,<br />{data.sekolah.headmasterTitle || "Kepala Mar'halah Wustha/Ulya"}</div>
                            <div className="font-bold underline">{data.namaKepalaSekolah || ".........................."}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
