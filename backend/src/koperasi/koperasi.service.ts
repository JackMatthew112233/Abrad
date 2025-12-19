import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JenisPemasukanKoperasi, JenisPengeluaranKoperasi } from '../generated/enums.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';

@Injectable()
export class KoperasiService {
  constructor(private prisma: PrismaService) {}

  // Create anggota koperasi
  async createAnggota(data: { nama: string; alamat?: string; noTelp?: string }) {
    return this.prisma.anggotaKoperasi.create({
      data: {
        nama: data.nama,
        alamat: data.alamat,
        noTelp: data.noTelp,
      },
    });
  }

  // Get all anggota koperasi
  async getAllAnggota(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          nama: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [anggotaList, total] = await Promise.all([
      this.prisma.anggotaKoperasi.findMany({
        where,
        skip,
        take: limit,
        include: {
          pemasukan: {
            select: {
              jenis: true,
              jumlah: true,
            },
          },
          pengeluaran: {
            select: {
              jenis: true,
              jumlah: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.anggotaKoperasi.count({ where }),
    ]);

    // Calculate totals for each anggota
    const anggotaWithTotals = anggotaList.map((anggota) => {
      const totalSimpananPokok = anggota.pemasukan
        .filter((p) => p.jenis === 'SIMPANAN_POKOK')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalSimpananWajib = anggota.pemasukan
        .filter((p) => p.jenis === 'SIMPANAN_WAJIB')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalSimpananSukarela = anggota.pemasukan
        .filter((p) => p.jenis === 'SIMPANAN_SUKARELA')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalPenyertaanModal = anggota.pemasukan
        .filter((p) => p.jenis === 'PENYERTAAN_MODAL')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalPemasukan = totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela + totalPenyertaanModal;

      const totalBelanja = anggota.pengeluaran
        .filter((p) => p.jenis === 'BELANJA')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalPinjaman = anggota.pengeluaran
        .filter((p) => p.jenis === 'PINJAMAN')
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalPengeluaran = totalBelanja + totalPinjaman;

      return {
        id: anggota.id,
        nama: anggota.nama,
        alamat: anggota.alamat,
        noTelp: anggota.noTelp,
        totalSimpananPokok,
        totalSimpananWajib,
        totalSimpananSukarela,
        totalPenyertaanModal,
        totalPemasukan,
        totalBelanja,
        totalPinjaman,
        totalPengeluaran,
        saldo: totalPemasukan - totalPengeluaran,
        createdAt: anggota.createdAt,
      };
    });

    return {
      data: anggotaWithTotals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get anggota by ID
  async getAnggotaById(id: string) {
    const anggota = await this.prisma.anggotaKoperasi.findUnique({
      where: { id },
      include: {
        pemasukan: {
          orderBy: { tanggal: 'desc' },
        },
        pengeluaran: {
          orderBy: { tanggal: 'desc' },
        },
      },
    });

    if (!anggota) {
      throw new NotFoundException('Anggota koperasi tidak ditemukan');
    }

    return anggota;
  }

  // Search anggota
  async searchAnggota(query: string) {
    return this.prisma.anggotaKoperasi.findMany({
      where: {
        nama: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        noTelp: true,
      },
      take: 10,
    });
  }

  // Create pemasukan
  async createPemasukan(
    data: {
      anggotaId: string;
      jenis: JenisPemasukanKoperasi;
      jumlah: number;
      tanggal: string;
      keterangan?: string;
    },
    file?: any,
  ) {
    const anggota = await this.prisma.anggotaKoperasi.findUnique({
      where: { id: data.anggotaId },
    });

    if (!anggota) {
      throw new NotFoundException('Anggota koperasi tidak ditemukan');
    }

    let buktiUrl: string | null = null;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'koperasi-bukti',
      );
      buktiUrl = uploadResult.url;
    }

    return this.prisma.pemasukanKoperasi.create({
      data: {
        anggotaId: data.anggotaId,
        jenis: data.jenis,
        jumlah: data.jumlah,
        tanggal: new Date(data.tanggal),
        keterangan: data.keterangan,
        bukti: buktiUrl,
      },
      include: {
        anggota: {
          select: { nama: true },
        },
      },
    });
  }

  // Create pengeluaran
  async createPengeluaran(
    data: {
      anggotaId: string;
      jenis: JenisPengeluaranKoperasi;
      jumlah: number;
      tanggal: string;
      keterangan?: string;
    },
    file?: any,
  ) {
    const anggota = await this.prisma.anggotaKoperasi.findUnique({
      where: { id: data.anggotaId },
    });

    if (!anggota) {
      throw new NotFoundException('Anggota koperasi tidak ditemukan');
    }

    let buktiUrl: string | null = null;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'koperasi-bukti',
      );
      buktiUrl = uploadResult.url;
    }

    return this.prisma.pengeluaranKoperasi.create({
      data: {
        anggotaId: data.anggotaId,
        jenis: data.jenis,
        jumlah: data.jumlah,
        tanggal: new Date(data.tanggal),
        keterangan: data.keterangan,
        bukti: buktiUrl,
      },
      include: {
        anggota: {
          select: { nama: true },
        },
      },
    });
  }

  // Get all pemasukan
  async getAllPemasukan(page: number = 1, limit: number = 20, jenis?: string) {
    const skip = (page - 1) * limit;
    const where = jenis ? { jenis: jenis as JenisPemasukanKoperasi } : {};

    const [list, total] = await Promise.all([
      this.prisma.pemasukanKoperasi.findMany({
        where,
        skip,
        take: limit,
        include: {
          anggota: {
            select: { id: true, nama: true },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.pemasukanKoperasi.count({ where }),
    ]);

    return {
      data: list,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get all pengeluaran
  async getAllPengeluaran(page: number = 1, limit: number = 20, jenis?: string) {
    const skip = (page - 1) * limit;
    const where = jenis ? { jenis: jenis as JenisPengeluaranKoperasi } : {};

    const [list, total] = await Promise.all([
      this.prisma.pengeluaranKoperasi.findMany({
        where,
        skip,
        take: limit,
        include: {
          anggota: {
            select: { id: true, nama: true },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.pengeluaranKoperasi.count({ where }),
    ]);

    return {
      data: list,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get statistik koperasi
  async getStatistik() {
    const [
      totalAnggota,
      simpananPokok,
      simpananWajib,
      simpananSukarela,
      penyertaanModal,
      belanja,
      pinjaman,
    ] = await Promise.all([
      this.prisma.anggotaKoperasi.count(),
      this.prisma.pemasukanKoperasi.aggregate({
        where: { jenis: 'SIMPANAN_POKOK' },
        _sum: { jumlah: true },
      }),
      this.prisma.pemasukanKoperasi.aggregate({
        where: { jenis: 'SIMPANAN_WAJIB' },
        _sum: { jumlah: true },
      }),
      this.prisma.pemasukanKoperasi.aggregate({
        where: { jenis: 'SIMPANAN_SUKARELA' },
        _sum: { jumlah: true },
      }),
      this.prisma.pemasukanKoperasi.aggregate({
        where: { jenis: 'PENYERTAAN_MODAL' },
        _sum: { jumlah: true },
      }),
      this.prisma.pengeluaranKoperasi.aggregate({
        where: { jenis: 'BELANJA' },
        _sum: { jumlah: true },
      }),
      this.prisma.pengeluaranKoperasi.aggregate({
        where: { jenis: 'PINJAMAN' },
        _sum: { jumlah: true },
      }),
    ]);

    const totalSimpananPokok = Number(simpananPokok._sum.jumlah || 0);
    const totalSimpananWajib = Number(simpananWajib._sum.jumlah || 0);
    const totalSimpananSukarela = Number(simpananSukarela._sum.jumlah || 0);
    const totalPenyertaanModal = Number(penyertaanModal._sum.jumlah || 0);
    const totalPemasukan = totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela + totalPenyertaanModal;

    const totalBelanja = Number(belanja._sum.jumlah || 0);
    const totalPinjaman = Number(pinjaman._sum.jumlah || 0);
    const totalPengeluaran = totalBelanja + totalPinjaman;

    return {
      totalAnggota,
      totalSimpananPokok,
      totalSimpananWajib,
      totalSimpananSukarela,
      totalPenyertaanModal,
      totalPemasukan,
      totalBelanja,
      totalPinjaman,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
    };
  }

  // Delete anggota
  async deleteAnggota(id: string) {
    const anggota = await this.prisma.anggotaKoperasi.findUnique({
      where: { id },
    });

    if (!anggota) {
      throw new NotFoundException('Anggota koperasi tidak ditemukan');
    }

    await this.prisma.anggotaKoperasi.delete({ where: { id } });

    return { message: 'Anggota koperasi berhasil dihapus' };
  }

  // Delete pemasukan
  async deletePemasukan(id: string) {
    const item = await this.prisma.pemasukanKoperasi.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Pemasukan tidak ditemukan');
    }

    await this.prisma.pemasukanKoperasi.delete({ where: { id } });

    return { message: 'Pemasukan berhasil dihapus' };
  }

  // Delete pengeluaran
  async deletePengeluaran(id: string) {
    const item = await this.prisma.pengeluaranKoperasi.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Pengeluaran tidak ditemukan');
    }

    await this.prisma.pengeluaranKoperasi.delete({ where: { id } });

    return { message: 'Pengeluaran berhasil dihapus' };
  }
}
