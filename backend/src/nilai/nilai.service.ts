import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NilaiService {
  constructor(private prisma: PrismaService) {}

  async getNilaiBySiswaList(
    page: number = 1,
    limit: number = 20,
    search?: string,
    tingkatan?: string,
    kelas?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      isAktif: true,
    };

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tingkatan && tingkatan !== 'Semua Tingkatan') {
      where.tingkatan = tingkatan;
    }

    if (kelas && kelas !== 'Semua Kelas') {
      where.kelas = kelas;
    }

    // Get siswa with their nilai count and average
    const siswaList = await this.prisma.siswa.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        nama: true,
        kelas: true,
        tingkatan: true,
        jenisKelamin: true,
        nilai: {
          select: {
            id: true,
            nilai: true,
          },
        },
      },
      orderBy: { nama: 'asc' },
    });

    const total = await this.prisma.siswa.count({ where });

    const data = siswaList.map((siswa) => {
      const jumlahNilai = siswa.nilai.length;
      const rataRata =
        jumlahNilai > 0
          ? siswa.nilai.reduce((sum, n) => sum + Number(n.nilai), 0) /
            jumlahNilai
          : 0;

      return {
        siswa: {
          id: siswa.id,
          nama: siswa.nama,
          kelas: siswa.kelas,
          tingkatan: siswa.tingkatan,
          jenisKelamin: siswa.jenisKelamin,
        },
        jumlahNilai,
        rataRata: Math.round(rataRata * 100) / 100,
      };
    });

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

  async getStatistikNilai() {
    const totalNilai = await this.prisma.nilai.count();
    
    const siswaWithNilai = await this.prisma.siswa.count({
      where: {
        nilai: {
          some: {},
        },
      },
    });

    const totalSiswa = await this.prisma.siswa.count({
      where: { isAktif: true },
    });

    // Calculate average nilai
    const allNilai = await this.prisma.nilai.findMany({
      select: { nilai: true },
    });

    const rataRataKeseluruhan =
      allNilai.length > 0
        ? allNilai.reduce((sum, n) => sum + Number(n.nilai), 0) /
          allNilai.length
        : 0;

    // Calculate average for specific mata pelajaran
    const mapelStats = await this.getStatistikPerMapel([
      "Ad-Durus Al-Fiqhiyyah (Fiqh)",
      "Qira'ah Al-Kutub",
      "Ke-DDI-an",
    ]);

    return {
      totalNilai,
      siswaWithNilai,
      totalSiswa,
      rataRataKeseluruhan: Math.round(rataRataKeseluruhan * 100) / 100,
      ...mapelStats,
    };
  }

  async getStatistikPerMapel(mapelNames: string[]) {
    const result: Record<string, number | null> = {};

    for (const mapel of mapelNames) {
      const avgResult = await this.prisma.nilai.aggregate({
        _avg: { nilai: true },
        where: {
          mataPelajaran: {
            contains: mapel,
            mode: 'insensitive',
          },
        },
      });

      // Create key from mapel name (sanitized)
      const key = `rataRata${mapel.replace(/[^a-zA-Z]/g, '')}`;
      result[key] = avgResult._avg.nilai
        ? Math.round(Number(avgResult._avg.nilai) * 100) / 100
        : null;
    }

    return result;
  }

  async getNilaiTerbaru() {
    const nilaiList = await this.prisma.nilai.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    return nilaiList.map((nilai) => ({
      ...nilai,
      nilai: Number(nilai.nilai),
    }));
  }

  async getAllNilai(
    siswaId?: string,
    mataPelajaran?: string,
    semester?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (siswaId) where.siswaId = siswaId;
    if (mataPelajaran && mataPelajaran !== 'Semua Mata Pelajaran')
      where.mataPelajaran = mataPelajaran;
    if (semester && semester !== 'Semua Semester') where.semester = semester;

    const data = await this.prisma.nilai.findMany({
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
          },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    const total = await this.prisma.nilai.count({ where });

    return {
      data: data.map((nilai) => ({
        ...nilai,
        nilai: Number(nilai.nilai),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNilaiById(id: string) {
    const nilai = await this.prisma.nilai.findUnique({
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

    if (!nilai) {
      throw new NotFoundException('Nilai tidak ditemukan');
    }

    return {
      ...nilai,
      nilai: Number(nilai.nilai),
    };
  }

  async createNilai(data: any) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const nilai = await this.prisma.nilai.create({
      data: {
        siswaId: data.siswaId,
        mataPelajaran: data.mataPelajaran,
        jenisNilai: data.jenisNilai,
        nilai: data.nilai,
        semester: data.semester,
        tahunAjaran: data.tahunAjaran,
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

    return {
      ...nilai,
      nilai: Number(nilai.nilai),
    };
  }

  async updateNilai(id: string, data: any) {
    const existingNilai = await this.prisma.nilai.findUnique({
      where: { id },
    });

    if (!existingNilai) {
      throw new NotFoundException('Nilai tidak ditemukan');
    }

    const nilai = await this.prisma.nilai.update({
      where: { id },
      data: {
        mataPelajaran: data.mataPelajaran,
        jenisNilai: data.jenisNilai,
        nilai: data.nilai,
        semester: data.semester,
        tahunAjaran: data.tahunAjaran,
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

    return {
      ...nilai,
      nilai: Number(nilai.nilai),
    };
  }

  async deleteNilai(id: string) {
    const nilai = await this.prisma.nilai.findUnique({
      where: { id },
    });

    if (!nilai) {
      throw new NotFoundException('Nilai tidak ditemukan');
    }

    await this.prisma.nilai.delete({
      where: { id },
    });

    return { message: 'Nilai berhasil dihapus' };
  }
}
