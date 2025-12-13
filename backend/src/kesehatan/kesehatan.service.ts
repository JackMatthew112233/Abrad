import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class KesehatanService {
  constructor(private prisma: PrismaService) {}

  async createKesehatan(data: {
    siswaId: string;
    noBpjs?: string;
    riwayatSakit: string;
    tanggal: string;
  }) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const tanggalDate = new Date(data.tanggal);

    return this.prisma.kesehatan.create({
      data: {
        siswaId: data.siswaId,
        noBpjs: data.noBpjs,
        riwayatSakit: data.riwayatSakit,
        tanggal: tanggalDate,
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

  async getAllKesehatan(page: number = 1, limit: number = 20, siswaId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (siswaId) {
      where.siswaId = siswaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.kesehatan.findMany({
        skip,
        take: limit,
        where,
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
        orderBy: {
          tanggal: 'desc',
        },
      }),
      this.prisma.kesehatan.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getKesehatanBySiswaList(page: number, limit: number) {
    // Get all kesehatan grouped by siswa
    const kesehatanGrouped = await this.prisma.kesehatan.groupBy({
      by: ['siswaId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Calculate pagination
    const total = kesehatanGrouped.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get paginated siswa data
    const paginatedData = kesehatanGrouped.slice(skip, skip + limit);

    // Get full siswa details for paginated items
    const siswaWithKesehatan = await Promise.all(
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

        // Get latest kesehatan record for BPJS
        const latestKesehatan = await this.prisma.kesehatan.findFirst({
          where: { siswaId: item.siswaId },
          orderBy: { createdAt: 'desc' },
          select: { noBpjs: true },
        });

        return {
          siswa,
          jumlahRiwayat: item._count.id,
          noBpjs: latestKesehatan?.noBpjs || null,
        };
      }),
    );

    return {
      data: siswaWithKesehatan,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getStatistikKesehatan() {
    const total = await this.prisma.kesehatan.count();
    const totalSiswaWithBpjs = await this.prisma.kesehatan.groupBy({
      by: ['siswaId'],
      where: {
        noBpjs: {
          not: null,
        },
      },
    });

    const totalSiswaWithKesehatan = await this.prisma.kesehatan.groupBy({
      by: ['siswaId'],
    });

    return {
      totalRiwayat: total,
      totalSiswaWithBpjs: totalSiswaWithBpjs.length,
      totalSiswaWithKesehatan: totalSiswaWithKesehatan.length,
    };
  }

  async getKesehatanTerbaru(limit: number = 10) {
    return this.prisma.kesehatan.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getKesehatanById(id: string) {
    const kesehatan = await this.prisma.kesehatan.findUnique({
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

    if (!kesehatan) {
      throw new NotFoundException('Data kesehatan tidak ditemukan');
    }

    return kesehatan;
  }

  async updateKesehatan(
    id: string,
    data: {
      noBpjs?: string;
      riwayatSakit: string;
      tanggal: string;
    },
  ) {
    const kesehatan = await this.prisma.kesehatan.findUnique({
      where: { id },
    });

    if (!kesehatan) {
      throw new NotFoundException('Data kesehatan tidak ditemukan');
    }

    const tanggalDate = new Date(data.tanggal);

    return this.prisma.kesehatan.update({
      where: { id },
      data: {
        noBpjs: data.noBpjs,
        riwayatSakit: data.riwayatSakit,
        tanggal: tanggalDate,
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

  async deleteKesehatan(id: string) {
    const kesehatan = await this.prisma.kesehatan.findUnique({
      where: { id },
    });

    if (!kesehatan) {
      throw new NotFoundException('Data kesehatan tidak ditemukan');
    }

    await this.prisma.kesehatan.delete({
      where: { id },
    });

    return { message: 'Data kesehatan berhasil dihapus' };
  }
}
