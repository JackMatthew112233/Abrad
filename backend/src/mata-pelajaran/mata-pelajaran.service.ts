import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MataPelajaranService {
  constructor(private prisma: PrismaService) {}

  async getSummaryByKelas() {
    // Get all kelas enum values
    const allKelas = [
      'VII_Putra',
      'VIII_Putra',
      'IX_Putra',
      'X_Putra',
      'XI_Putra',
      'XII_Putra',
      'VII_Putri',
      'VIII_Putri',
      'IX_Putri',
      'X_Putri',
      'XI_Putri',
      'XII_Putri',
    ];

    const summary = await Promise.all(
      allKelas.map(async (kelas) => {
        // Count siswa in this kelas
        const jumlahSiswa = await this.prisma.siswa.count({
          where: {
            kelas: kelas as any,
            isAktif: true,
          },
        });

        // Count mata pelajaran for this kelas
        const jumlahMataPelajaran = await this.prisma.mataPelajaran.count({
          where: {
            kelas: kelas as any,
          },
        });

        return {
          kelas,
          jumlahSiswa,
          jumlahMataPelajaran,
        };
      }),
    );

    return summary;
  }

  async getAllMataPelajaran(kelas?: string) {
    const where: any = {};

    if (kelas && kelas !== 'Semua Kelas') {
      where.kelas = kelas;
    }

    const mataPelajaran = await this.prisma.mataPelajaran.findMany({
      where,
      orderBy: [{ kelas: 'asc' }, { nama: 'asc' }],
    });

    return mataPelajaran;
  }

  async getMataPelajaranById(id: string) {
    const mataPelajaran = await this.prisma.mataPelajaran.findUnique({
      where: { id },
    });

    if (!mataPelajaran) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    return mataPelajaran;
  }

  async createMataPelajaran(data: any) {
    // Check if mata pelajaran with same name and kelas already exists
    const existing = await this.prisma.mataPelajaran.findFirst({
      where: {
        nama: data.nama,
        kelas: data.kelas,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Mata pelajaran dengan nama dan kelas yang sama sudah ada',
      );
    }

    const mataPelajaran = await this.prisma.mataPelajaran.create({
      data: {
        nama: data.nama,
        kelas: data.kelas,
      },
    });

    return mataPelajaran;
  }

  async updateMataPelajaran(id: string, data: any) {
    const existingMataPelajaran = await this.prisma.mataPelajaran.findUnique({
      where: { id },
    });

    if (!existingMataPelajaran) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    // Check if mata pelajaran with same name and kelas already exists (excluding current)
    const duplicate = await this.prisma.mataPelajaran.findFirst({
      where: {
        nama: data.nama,
        kelas: data.kelas,
        id: { not: id },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Mata pelajaran dengan nama dan kelas yang sama sudah ada',
      );
    }

    const mataPelajaran = await this.prisma.mataPelajaran.update({
      where: { id },
      data: {
        nama: data.nama,
        kelas: data.kelas,
      },
    });

    return mataPelajaran;
  }

  async deleteMataPelajaran(id: string) {
    const mataPelajaran = await this.prisma.mataPelajaran.findUnique({
      where: { id },
    });

    if (!mataPelajaran) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    await this.prisma.mataPelajaran.delete({
      where: { id },
    });

    return { message: 'Mata pelajaran berhasil dihapus' };
  }
}
