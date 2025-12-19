import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';

@Injectable()
export class DonasiService {
  constructor(private prisma: PrismaService) {}

  async createDonasi(
    data: {
      nama: string;
      jumlahDonasi: number;
    },
    file?: any,
  ) {
    let evidenceUrl: string | null = null;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'donasi-evidence',
      );
      evidenceUrl = uploadResult.url;
    }

    const donasi = await this.prisma.donasi.create({
      data: {
        nama: data.nama,
        jumlahDonasi: data.jumlahDonasi,
        evidence: evidenceUrl,
      },
    });

    return donasi;
  }

  async getAllDonasi(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [donasiList, total] = await Promise.all([
      this.prisma.donasi.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.donasi.count(),
    ]);

    return {
      data: donasiList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDonasiTerbaru(limit: number = 10) {
    return this.prisma.donasi.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDonasiById(id: string) {
    const donasi = await this.prisma.donasi.findUnique({
      where: { id },
    });

    if (!donasi) {
      throw new NotFoundException('Donasi tidak ditemukan');
    }

    return donasi;
  }

  async deleteDonasi(id: string) {
    const donasi = await this.prisma.donasi.findUnique({
      where: { id },
    });

    if (!donasi) {
      throw new NotFoundException('Donasi tidak ditemukan');
    }

    await this.prisma.donasi.delete({
      where: { id },
    });

    return { message: 'Donasi berhasil dihapus' };
  }
}
