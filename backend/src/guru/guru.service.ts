import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class GuruService {
  constructor(private prisma: PrismaService) {}

  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isAktif?: boolean;
  }) {
    const { page = 1, limit = 20, search, isAktif } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isAktif !== undefined) {
      where.isAktif = isAktif;
    }

    const [data, total] = await Promise.all([
      this.prisma.guru.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      this.prisma.guru.count({ where }),
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

  async getById(id: string) {
    const guru = await this.prisma.guru.findUnique({
      where: { id },
    });

    if (!guru) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return guru;
  }

  async getStatistik() {
    const [totalGuru, guruAktif, guruNonAktif] = await Promise.all([
      this.prisma.guru.count(),
      this.prisma.guru.count({ where: { isAktif: true } }),
      this.prisma.guru.count({ where: { isAktif: false } }),
    ]);

    return {
      totalGuru,
      guruAktif,
      guruNonAktif,
    };
  }

  async create(data: {
    nama: string;
    nip?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    jenisKelamin?: string;
    alamat?: string;
    noTelp?: string;
    email?: string;
    jabatan?: string;
    mataPelajaran?: string;
    isAktif?: boolean;
  }) {
    // Check if NIP already exists
    if (data.nip) {
      const existing = await this.prisma.guru.findUnique({
        where: { nip: data.nip },
      });

      if (existing) {
        throw new ConflictException('NIP sudah terdaftar');
      }
    }

    const guru = await this.prisma.guru.create({
      data: {
        nama: data.nama,
        nip: data.nip,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        jenisKelamin: data.jenisKelamin as any,
        alamat: data.alamat,
        noTelp: data.noTelp,
        email: data.email,
        jabatan: data.jabatan,
        mataPelajaran: data.mataPelajaran,
        isAktif: data.isAktif ?? true,
      },
    });

    return {
      message: 'Guru berhasil ditambahkan',
      data: guru,
    };
  }

  async update(
    id: string,
    data: {
      nama?: string;
      nip?: string;
      tempatLahir?: string;
      tanggalLahir?: string;
      jenisKelamin?: string;
      alamat?: string;
      noTelp?: string;
      email?: string;
      jabatan?: string;
      mataPelajaran?: string;
      isAktif?: boolean;
    },
  ) {
    const existing = await this.prisma.guru.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    // Check if NIP already exists (if changing NIP)
    if (data.nip && data.nip !== existing.nip) {
      const nipExists = await this.prisma.guru.findUnique({
        where: { nip: data.nip },
      });

      if (nipExists) {
        throw new ConflictException('NIP sudah terdaftar');
      }
    }

    const guru = await this.prisma.guru.update({
      where: { id },
      data: {
        nama: data.nama,
        nip: data.nip,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
        jenisKelamin: data.jenisKelamin as any,
        alamat: data.alamat,
        noTelp: data.noTelp,
        email: data.email,
        jabatan: data.jabatan,
        mataPelajaran: data.mataPelajaran,
        isAktif: data.isAktif,
      },
    });

    return {
      message: 'Guru berhasil diperbarui',
      data: guru,
    };
  }

  async delete(id: string) {
    const existing = await this.prisma.guru.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    await this.prisma.guru.delete({
      where: { id },
    });

    return {
      message: 'Guru berhasil dihapus',
    };
  }

  // Absensi Guru Methods
  async getAbsensiGuru(params: {
    page?: number;
    limit?: number;
    tanggal?: string;
  }) {
    const { page = 1, limit = 20, tanggal } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (tanggal) {
      where.tanggal = new Date(tanggal);
    }

    const [data, total] = await Promise.all([
      this.prisma.absensiGuru.findMany({
        where,
        skip,
        take: limit,
        include: {
          guru: {
            select: {
              id: true,
              nama: true,
              nip: true,
              jabatan: true,
            },
          },
        },
        orderBy: [{ tanggal: 'desc' }, { guru: { nama: 'asc' } }],
      }),
      this.prisma.absensiGuru.count({ where }),
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

  async getAbsensiGuruByTanggal(tanggal: string) {
    const targetDate = new Date(tanggal);

    // Get all active guru
    const allGuru = await this.prisma.guru.findMany({
      where: { isAktif: true },
      orderBy: { nama: 'asc' },
    });

    // Get existing absensi for the date
    const existingAbsensi = await this.prisma.absensiGuru.findMany({
      where: { tanggal: targetDate },
    });

    const absensiMap = new Map(existingAbsensi.map((a) => [a.guruId, a]));

    // Merge guru with absensi data
    const result = allGuru.map((guru) => ({
      guruId: guru.id,
      nama: guru.nama,
      nip: guru.nip,
      jabatan: guru.jabatan,
      status: absensiMap.get(guru.id)?.status || null,
      keterangan: absensiMap.get(guru.id)?.keterangan || null,
      absensiId: absensiMap.get(guru.id)?.id || null,
    }));

    return result;
  }

  async createOrUpdateAbsensiGuru(data: {
    guruId: string;
    tanggal: string;
    status: string;
    keterangan?: string;
  }) {
    const targetDate = new Date(data.tanggal);

    const existing = await this.prisma.absensiGuru.findUnique({
      where: {
        guruId_tanggal: {
          guruId: data.guruId,
          tanggal: targetDate,
        },
      },
    });

    if (existing) {
      return this.prisma.absensiGuru.update({
        where: { id: existing.id },
        data: {
          status: data.status as any,
          keterangan: data.keterangan,
        },
      });
    }

    return this.prisma.absensiGuru.create({
      data: {
        guruId: data.guruId,
        tanggal: targetDate,
        status: data.status as any,
        keterangan: data.keterangan,
      },
    });
  }

  async bulkCreateAbsensiGuru(data: {
    tanggal: string;
    absensi: Array<{
      guruId: string;
      status: string;
      keterangan?: string;
    }>;
  }) {
    const targetDate = new Date(data.tanggal);

    const results = await Promise.all(
      data.absensi.map((item) =>
        this.createOrUpdateAbsensiGuru({
          guruId: item.guruId,
          tanggal: data.tanggal,
          status: item.status,
          keterangan: item.keterangan,
        }),
      ),
    );

    return {
      message: `Berhasil menyimpan absensi ${results.length} guru`,
      data: results,
    };
  }

  async getStatistikAbsensiGuru(params?: { bulan?: number; tahun?: number }) {
    const now = new Date();
    const bulan = params?.bulan || now.getMonth() + 1;
    const tahun = params?.tahun || now.getFullYear();

    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0);

    const stats = await this.prisma.absensiGuru.groupBy({
      by: ['status'],
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const result = {
      HADIR: 0,
      TIDAK_HADIR: 0,
      SAKIT: 0,
      IZIN: 0,
    };

    stats.forEach((stat) => {
      result[stat.status as keyof typeof result] = stat._count;
    });

    return result;
  }

  async getRekapAbsensiGuru(params: {
    bulan?: number;
    tahun?: number;
    page?: number;
    limit?: number;
  }) {
    const now = new Date();
    const bulan = params.bulan || now.getMonth() + 1;
    const tahun = params.tahun || now.getFullYear();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0);

    const [guru, total] = await Promise.all([
      this.prisma.guru.findMany({
        where: { isAktif: true },
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      this.prisma.guru.count({ where: { isAktif: true } }),
    ]);

    const rekapData = await Promise.all(
      guru.map(async (g) => {
        const absensi = await this.prisma.absensiGuru.groupBy({
          by: ['status'],
          where: {
            guruId: g.id,
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
        });

        const stats = {
          hadir: 0,
          tidakHadir: 0,
          sakit: 0,
          izin: 0,
        };

        absensi.forEach((a) => {
          if (a.status === 'HADIR') stats.hadir = a._count;
          if (a.status === 'TIDAK_HADIR') stats.tidakHadir = a._count;
          if (a.status === 'SAKIT') stats.sakit = a._count;
          if (a.status === 'IZIN') stats.izin = a._count;
        });

        return {
          id: g.id,
          nama: g.nama,
          nip: g.nip,
          jabatan: g.jabatan,
          ...stats,
        };
      }),
    );

    return {
      data: rekapData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
