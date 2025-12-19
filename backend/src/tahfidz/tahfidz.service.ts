import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TahfidzService {
  constructor(private prisma: PrismaService) {}

  async createTahfidz(data: {
    siswaId: string;
    juzKe: number;
    nilai?: number;
    keterangan?: string;
    tanggal: string;
  }) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return this.prisma.tahfidz.create({
      data: {
        siswaId: data.siswaId,
        juzKe: data.juzKe,
        nilai: data.nilai,
        keterangan: data.keterangan,
        tanggal: new Date(data.tanggal),
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
          },
        },
      },
    });
  }

  async getAllTahfidz(
    page: number = 1,
    limit: number = 20,
    siswaId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (siswaId) {
      where.siswaId = siswaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.tahfidz.findMany({
        where,
        skip,
        take: limit,
        include: {
          siswa: {
            select: {
              id: true,
              nama: true,
              kelas: true,
              tingkatan: true,
              jenisKelamin: true,
            },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.tahfidz.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        nilai: item.nilai ? Number(item.nilai) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTahfidzBySiswaList(page: number = 1, limit: number = 20) {
    // Get all tahfidz grouped by siswa
    const tahfidzGrouped = await this.prisma.tahfidz.groupBy({
      by: ['siswaId'],
      _count: { id: true },
      _max: { juzKe: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const total = tahfidzGrouped.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedData = tahfidzGrouped.slice(skip, skip + limit);

    const siswaWithTahfidz = await Promise.all(
      paginatedData.map(async (item) => {
        const siswa = await this.prisma.siswa.findUnique({
          where: { id: item.siswaId },
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
            jenisKelamin: true,
          },
        });

        return {
          siswa,
          jumlahCatatan: item._count.id,
          juzTertinggi: item._max.juzKe,
        };
      }),
    );

    return {
      data: siswaWithTahfidz,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTahfidzById(id: string) {
    const tahfidz = await this.prisma.tahfidz.findUnique({
      where: { id },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
          },
        },
      },
    });

    if (!tahfidz) {
      throw new NotFoundException('Data tahfidz tidak ditemukan');
    }

    return {
      ...tahfidz,
      nilai: tahfidz.nilai ? Number(tahfidz.nilai) : null,
    };
  }

  async updateTahfidz(
    id: string,
    data: {
      juzKe?: number;
      nilai?: number;
      keterangan?: string;
      tanggal?: string;
    },
  ) {
    const tahfidz = await this.prisma.tahfidz.findUnique({
      where: { id },
    });

    if (!tahfidz) {
      throw new NotFoundException('Data tahfidz tidak ditemukan');
    }

    const updated = await this.prisma.tahfidz.update({
      where: { id },
      data: {
        juzKe: data.juzKe,
        nilai: data.nilai,
        keterangan: data.keterangan,
        tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
          },
        },
      },
    });

    return {
      ...updated,
      nilai: updated.nilai ? Number(updated.nilai) : null,
    };
  }

  async deleteTahfidz(id: string) {
    const tahfidz = await this.prisma.tahfidz.findUnique({
      where: { id },
    });

    if (!tahfidz) {
      throw new NotFoundException('Data tahfidz tidak ditemukan');
    }

    await this.prisma.tahfidz.delete({
      where: { id },
    });

    return { message: 'Data tahfidz berhasil dihapus' };
  }

  async getStatistikTahfidz() {
    const totalCatatan = await this.prisma.tahfidz.count();

    const siswaWithTahfidz = await this.prisma.tahfidz.groupBy({
      by: ['siswaId'],
    });

    // Get modus (most frequent) juz
    const juzCount = await this.prisma.tahfidz.groupBy({
      by: ['juzKe'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    const modusJuz = juzCount.length > 0 ? juzCount[0].juzKe : null;
    const modusJuzCount = juzCount.length > 0 ? juzCount[0]._count.id : 0;

    // Get average nilai if exists
    const avgNilai = await this.prisma.tahfidz.aggregate({
      _avg: { nilai: true },
      where: { nilai: { not: null } },
    });

    return {
      totalCatatan,
      totalSiswaWithTahfidz: siswaWithTahfidz.length,
      modusJuz,
      modusJuzCount,
      rataRataNilai: avgNilai._avg.nilai
        ? Math.round(Number(avgNilai._avg.nilai) * 100) / 100
        : null,
    };
  }

  async getTahfidzTerbaru(limit: number = 10) {
    const data = await this.prisma.tahfidz.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
            jenisKelamin: true,
          },
        },
      },
    });

    return data.map((item) => ({
      ...item,
      nilai: item.nilai ? Number(item.nilai) : null,
    }));
  }
}
