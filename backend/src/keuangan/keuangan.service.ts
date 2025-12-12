import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';

@Injectable()
export class KeuanganService {
  constructor(private prisma: PrismaService) {}

  async createBiodataKeuangan(data: {
    siswaId: string;
    komitmenInfaqLaundry: number;
    infaq: number;
    laundry: number;
  }) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const existingBiodata = await this.prisma.biodataKeuangan.findUnique({
      where: { siswaId: data.siswaId },
    });

    if (existingBiodata) {
      return this.prisma.biodataKeuangan.update({
        where: { siswaId: data.siswaId },
        data: {
          komitmenInfaqLaundry: data.komitmenInfaqLaundry,
          infaq: data.infaq,
          laundry: data.laundry,
        },
        include: {
          siswa: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });
    }

    return this.prisma.biodataKeuangan.create({
      data,
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
  }

  async getBiodataKeuanganById(id: string) {
    const biodata = await this.prisma.biodataKeuangan.findUnique({
      where: { id },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
            nik: true,
            nis: true,
            nisn: true,
            jenisKelamin: true,
            tempatLahir: true,
            tanggalLahir: true,
            alamat: true,
          },
        },
      },
    });

    if (!biodata) {
      throw new NotFoundException('Biodata keuangan tidak ditemukan');
    }

    return biodata;
  }

  async updateBiodataKeuangan(
    id: string,
    data: {
      komitmenInfaqLaundry: number;
      infaq: number;
      laundry: number;
    },
  ) {
    const biodata = await this.prisma.biodataKeuangan.findUnique({
      where: { id },
    });

    if (!biodata) {
      throw new NotFoundException('Biodata keuangan tidak ditemukan');
    }

    return this.prisma.biodataKeuangan.update({
      where: { id },
      data,
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

  async deleteBiodataKeuangan(id: string) {
    const biodata = await this.prisma.biodataKeuangan.findUnique({
      where: { id },
    });

    if (!biodata) {
      throw new NotFoundException('Biodata keuangan tidak ditemukan');
    }

    await this.prisma.biodataKeuangan.delete({
      where: { id },
    });

    return { message: 'Biodata keuangan berhasil dihapus' };
  }

  async getAllBiodataKeuangan(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [biodataList, total] = await Promise.all([
      this.prisma.biodataKeuangan.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.biodataKeuangan.count(),
    ]);

    return {
      data: biodataList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistikKeuangan() {
    // Get all biodata keuangan
    const allBiodata = await this.prisma.biodataKeuangan.findMany({
      select: {
        komitmenInfaqLaundry: true,
        infaq: true,
        laundry: true,
      },
    });

    // Calculate totals
    const totalKomitmen = allBiodata.reduce(
      (sum, item) => sum + (item.komitmenInfaqLaundry || 0),
      0,
    );
    const totalInfaq = allBiodata.reduce((sum, item) => sum + (item.infaq || 0), 0);
    const totalLaundry = allBiodata.reduce(
      (sum, item) => sum + (item.laundry || 0),
      0,
    );

    // Get all pembayaran
    const allPembayaran = await this.prisma.pembayaran.findMany({
      select: {
        totalPembayaranInfaq: true,
        totalPembayaranLaundry: true,
      },
    });

    const totalPembayaranInfaq = allPembayaran.reduce(
      (sum, item) => sum + (item.totalPembayaranInfaq || 0),
      0,
    );
    const totalPembayaranLaundry = allPembayaran.reduce(
      (sum, item) => sum + (item.totalPembayaranLaundry || 0),
      0,
    );

    // Count santri with biodata
    const jumlahSantriTerdaftar = await this.prisma.biodataKeuangan.count();

    return {
      totalKomitmen,
      totalInfaq,
      totalLaundry,
      totalPembayaranInfaq,
      totalPembayaranLaundry,
      jumlahSantriTerdaftar,
    };
  }

  async getChartPembayaran() {
    // Get last 6 months of payment data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pembayaranList = await this.prisma.pembayaran.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        totalPembayaranInfaq: true,
        totalPembayaranLaundry: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const monthlyData: Record<
      string,
      { infaq: number; laundry: number }
    > = {};

    pembayaranList.forEach((pembayaran) => {
      const monthKey = new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        year: 'numeric',
      }).format(pembayaran.createdAt);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { infaq: 0, laundry: 0 };
      }

      monthlyData[monthKey].infaq += pembayaran.totalPembayaranInfaq || 0;
      monthlyData[monthKey].laundry += pembayaran.totalPembayaranLaundry || 0;
    });

    // Convert to array format for charts
    return Object.entries(monthlyData).map(([bulan, data]) => ({
      bulan: bulan.split(' ')[0], // Get just month name
      infaq: Math.round(data.infaq / 1000000), // Convert to millions
      laundry: Math.round(data.laundry / 1000000),
    }));
  }

  async getChartDistribusi() {
    const stats = await this.getStatistikKeuangan();

    return [
      {
        name: 'Total Infaq',
        value: stats.totalInfaq,
        color: '#10b981',
      },
      {
        name: 'Total Laundry',
        value: stats.totalLaundry,
        color: '#22c55e',
      },
      {
        name: 'Pembayaran Infaq',
        value: stats.totalPembayaranInfaq,
        color: '#34d399',
      },
      {
        name: 'Pembayaran Laundry',
        value: stats.totalPembayaranLaundry,
        color: '#6ee7b7',
      },
    ];
  }

  async createPembayaran(
    data: {
      siswaId: string;
      totalPembayaranInfaq: number;
      totalPembayaranLaundry: number;
    },
    file: any,
  ) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const uploadResult = await uploadToSupabase(
      file.buffer,
      file.originalname,
      'evidence',
      file.mimetype,
    );

    return this.prisma.pembayaran.create({
      data: {
        siswaId: data.siswaId,
        totalPembayaranInfaq: data.totalPembayaranInfaq,
        totalPembayaranLaundry: data.totalPembayaranLaundry,
        buktiPembayaran: uploadResult.url,
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
  }

  async getAllPembayaran() {
    return this.prisma.pembayaran.findMany({
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
        createdAt: 'desc',
      },
    });
  }

  async searchSiswa(query: string) {
    return this.prisma.siswa.findMany({
      where: {
        nama: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nama: true,
        kelas: true,
        tingkatan: true,
        nik: true,
        nis: true,
        nisn: true,
        jenisKelamin: true,
        tempatLahir: true,
        tanggalLahir: true,
        alamat: true,
      },
      take: 10,
    });
  }
}
