"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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

interface Ekstrakurikuler {
    id: string;
    nama: string;
    keterangan: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function EkstrakurikulerPage() {
    const router = useRouter();
    const [data, setData] = useState<Ekstrakurikuler[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Ekstrakurikuler | null>(null);
    const [formData, setFormData] = useState({ nama: "", keterangan: "" });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler`, { credentials: "include" });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            toast.error("Gagal memuat data ekstrakurikuler");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (item?: Ekstrakurikuler) => {
        if (item) {
            setSelectedItem(item);
            setFormData({ nama: item.nama, keterangan: item.keterangan || "" });
        } else {
            setSelectedItem(null);
            setFormData({ nama: "", keterangan: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = selectedItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler/${selectedItem.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler`;

            const method = selectedItem ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (!response.ok) throw new Error("Gagal menyimpan data");

            toast.success(selectedItem ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/ekstrakurikuler/${selectedItem.id}`,
                { method: "DELETE", credentials: "include" }
            );

            if (!response.ok) throw new Error("Gagal menghapus data");

            toast.success("Data berhasil dihapus");
            setIsDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menghapus data");
        }
    };

    const filteredData = data.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header with Back Button */}
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
                    <h1 className="text-xl lg:text-2xl font-bold text-emerald-700">
                        Kelola Ekstrakurikuler
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Daftar kegiatan ekstrakurikuler yang tersedia
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-xs lg:text-sm">
                    <Plus className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Tambah Baru
                </Button>
            </div>

            <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder="Cari ekstrakurikuler..."
                            className="pl-9 text-xs lg:text-sm h-9 lg:h-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                                <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm pl-4">Nama Kegiatan</TableHead>
                                <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm">Keterangan</TableHead>
                                <TableHead className="font-semibold text-emerald-700 text-xs lg:text-sm w-[100px] text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-xs lg:text-sm text-zinc-500">
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-xs lg:text-sm text-zinc-500">
                                        Tidak ada data ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-zinc-50">
                                        <TableCell className="font-medium text-zinc-900 text-xs lg:text-sm pl-4">{item.nama}</TableCell>
                                        <TableCell className="text-zinc-600 text-xs lg:text-sm">{item.keterangan || "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleOpenDialog(item)}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-emerald-700">{selectedItem ? "Edit Data" : "Tambah Data Baru"}</DialogTitle>
                        <DialogDescription>
                            Isi formulir berikut untuk {selectedItem ? "memperbarui" : "menambahkan"} data ekstrakurikuler.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama Kegiatan <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nama"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Pramuka"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    placeholder="Deskripsi singkat kegiatan..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
