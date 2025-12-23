import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WaliKelasService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const waliKelas = await this.prisma.waliKelas.findMany({
      orderBy: { kelas: 'asc' },
    });

    return waliKelas;
  }

  async getStatistik() {
    const totalWaliKelas = await this.prisma.waliKelas.count();
    
    // Total kelas yang ada (12 kelas)
    const totalKelas = 12;
    const kelasTerassign = totalWaliKelas;
    const kelasBelumAssign = totalKelas - kelasTerassign;

    return {
      totalWaliKelas,
      totalKelas,
      kelasTerassign,
      kelasBelumAssign,
    };
  }

  async getById(id: string) {
    const waliKelas = await this.prisma.waliKelas.findUnique({
      where: { id },
    });

    if (!waliKelas) {
      throw new NotFoundException('Wali kelas tidak ditemukan');
    }

    return waliKelas;
  }

  async getByKelas(kelas: string) {
    const waliKelas = await this.prisma.waliKelas.findUnique({
      where: { kelas: kelas as any },
    });

    return waliKelas;
  }

  async create(data: { namaGuru: string; kelas: string; noTelp?: string }) {
    // Check if kelas already has wali kelas
    const existing = await this.prisma.waliKelas.findUnique({
      where: { kelas: data.kelas as any },
    });

    if (existing) {
      throw new ConflictException('Kelas ini sudah memiliki wali kelas');
    }

    const waliKelas = await this.prisma.waliKelas.create({
      data: {
        namaGuru: data.namaGuru,
        kelas: data.kelas as any,
        noTelp: data.noTelp,
      },
    });

    return {
      message: 'Wali kelas berhasil ditambahkan',
      data: waliKelas,
    };
  }

  async update(id: string, data: { namaGuru?: string; kelas?: string; noTelp?: string }) {
    const existing = await this.prisma.waliKelas.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Wali kelas tidak ditemukan');
    }

    // If changing kelas, check if new kelas already has wali kelas
    if (data.kelas && data.kelas !== existing.kelas) {
      const kelasExists = await this.prisma.waliKelas.findUnique({
        where: { kelas: data.kelas as any },
      });

      if (kelasExists) {
        throw new ConflictException('Kelas ini sudah memiliki wali kelas');
      }
    }

    const waliKelas = await this.prisma.waliKelas.update({
      where: { id },
      data: {
        namaGuru: data.namaGuru,
        kelas: data.kelas as any,
        noTelp: data.noTelp,
      },
    });

    return {
      message: 'Wali kelas berhasil diperbarui',
      data: waliKelas,
    };
  }

  async delete(id: string) {
    const existing = await this.prisma.waliKelas.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Wali kelas tidak ditemukan');
    }

    await this.prisma.waliKelas.delete({
      where: { id },
    });

    return {
      message: 'Wali kelas berhasil dihapus',
    };
  }

  async getAvailableKelas() {
    // Get all kelas that don't have wali kelas yet
    const allKelas = [
      'VII_Putra', 'VIII_Putra', 'IX_Putra', 'X_Putra', 'XI_Putra', 'XII_Putra',
      'VII_Putri', 'VIII_Putri', 'IX_Putri', 'X_Putri', 'XI_Putri', 'XII_Putri',
    ];

    const assignedKelas = await this.prisma.waliKelas.findMany({
      select: { kelas: true },
    });

    const assignedKelasSet = new Set(assignedKelas.map(w => w.kelas));
    const availableKelas = allKelas.filter(k => !assignedKelasSet.has(k as any));

    return availableKelas;
  }
}
