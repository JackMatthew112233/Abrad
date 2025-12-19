import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import ExcelJS from 'exceljs';

@Injectable()
export class AbsensiService {
  constructor(private prisma: PrismaService) {}

  async createAbsensi(data: {
    siswaId: string;
    tanggal: string;
    jenis: string;
    status: string;
    keterangan?: string;
  }) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const tanggalDate = new Date(data.tanggal);
    tanggalDate.setHours(0, 0, 0, 0);

    // Check if absensi already exists for this siswa, date and jenis
    const existingAbsensi = await this.prisma.absensi.findFirst({
      where: {
        siswaId: data.siswaId,
        tanggal: tanggalDate,
        jenis: data.jenis as any,
      },
    });

    if (existingAbsensi) {
      // Update existing absensi
      return this.prisma.absensi.update({
        where: {
          id: existingAbsensi.id,
        },
        data: {
          status: data.status as any,
          keterangan: data.keterangan,
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

    return this.prisma.absensi.create({
      data: {
        siswaId: data.siswaId,
        tanggal: tanggalDate,
        jenis: data.jenis as any,
        status: data.status as any,
        keterangan: data.keterangan,
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

  async createBulkAbsensi(data: {
    tanggal: string;
    jenis: string;
    absensiList: Array<{
      siswaId: string;
      status: string;
      keterangan?: string;
    }>;
  }) {
    const tanggalDate = new Date(data.tanggal);
    const results: any[] = [];

    for (const item of data.absensiList) {
      const result = await this.createAbsensi({
        siswaId: item.siswaId,
        tanggal: data.tanggal,
        jenis: data.jenis,
        status: item.status,
        keterangan: item.keterangan,
      });
      results.push(result);
    }

    return results;
  }

  async getAbsensiByDate(tanggal: string) {
    const tanggalDate = new Date(tanggal);

    return this.prisma.absensi.findMany({
      where: {
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
      orderBy: {
        siswa: {
          nama: 'asc',
        },
      },
    });
  }

  async getAbsensiBySiswa(siswaId: string, startDate?: string, endDate?: string, jenis?: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const where: any = {
      siswaId,
    };

    if (jenis) {
      where.jenis = jenis;
    }

    if (startDate && endDate) {
      where.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.absensi.findMany({
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
    });
  }

  async getStatistikAbsensi(jenis?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (jenis) {
      where.jenis = jenis;
    }

    if (startDate && endDate) {
      where.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const absensi = await this.prisma.absensi.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });

    const stats = {
      HADIR: 0,
      TIDAK_HADIR: 0,
      SAKIT: 0,
      IZIN: 0,
    };

    absensi.forEach((item) => {
      stats[item.status] = item._count.status;
    });

    return stats;
  }

  async getAllSiswaWithTodayAbsensi(kelas?: string, tingkatan?: string, jenis?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = {
      isAktif: true,
    };

    if (kelas) {
      // Convert format from "XII_PUTRA" to "XII_Putra" to match Prisma enum
      const kelasFormatted = kelas
        .split('_')
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join('_');
      where.kelas = kelasFormatted as any;
    }

    if (tingkatan) {
      where.tingkatan = tingkatan as any;
    }

    const absensiWhere: any = {
      tanggal: today,
    };

    if (jenis) {
      absensiWhere.jenis = jenis;
    }

    const siswaList = await this.prisma.siswa.findMany({
      where,
      select: {
        id: true,
        nama: true,
        kelas: true,
        tingkatan: true,
        absensi: {
          where: absensiWhere,
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return siswaList.map((siswa) => ({
      id: siswa.id,
      nama: siswa.nama,
      kelas: siswa.kelas,
      tingkatan: siswa.tingkatan,
      absensiToday: siswa.absensi[0] || null,
    }));
  }

  async getStatistikAbsensiPerSiswa(jenis?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [siswaList, total] = await Promise.all([
      this.prisma.siswa.findMany({
        skip,
        take: limit,
        where: {
          isAktif: true,
        },
        select: {
          id: true,
          nama: true,
          kelas: true,
          tingkatan: true,
        },
        orderBy: {
          nama: 'asc',
        },
      }),
      this.prisma.siswa.count({
        where: {
          isAktif: true,
        },
      }),
    ]);

    // Get absensi stats for each siswa
    const siswaWithStats = await Promise.all(
      siswaList.map(async (siswa) => {
        const where: any = {
          siswaId: siswa.id,
        };
        
        if (jenis) {
          where.jenis = jenis;
        }

        const absensiStats = await this.prisma.absensi.groupBy({
          by: ['status'],
          where,
          _count: {
            status: true,
          },
        });

        const stats = {
          HADIR: 0,
          TIDAK_HADIR: 0,
          SAKIT: 0,
          IZIN: 0,
        };

        absensiStats.forEach((item) => {
          stats[item.status] = item._count.status;
        });

        return {
          id: siswa.id,
          nama: siswa.nama,
          kelas: siswa.kelas,
          tingkatan: siswa.tingkatan,
          hadir: stats.HADIR,
          tidakHadir: stats.TIDAK_HADIR,
          sakit: stats.SAKIT,
          izin: stats.IZIN,
        };
      })
    );

    return {
      data: siswaWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportAbsensiToExcel(
    bulan: string,
    tahun: string,
    kelas: string,
    tingkatan: string,
  ): Promise<Buffer> {
    // Parse bulan dan tahun
    const startDate = new Date(`${tahun}-${bulan}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of the month

    // Convert kelas format from "XII_PUTRA" to "XII_Putra" to match Prisma enum
    const kelasFormatted = kelas
      .split('_')
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join('_');

    // Get all absensi data for the month filtered by kelas and tingkatan
    const absensiData = await this.prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        siswa: {
          is: {
            kelas: kelasFormatted as any,
            tingkatan: tingkatan as any,
          },
        },
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [
        {
          siswa: {
            tingkatan: 'asc',
          },
        },
        {
          siswa: {
            kelas: 'asc',
          },
        },
        {
          siswa: {
            nama: 'asc',
          },
        },
        {
          tanggal: 'asc',
        },
      ],
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Absensi');

    // Set column headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }, // Emerald color
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    absensiData.forEach((absensi, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        nisn: absensi.siswa.nisn || '-',
        nama: absensi.siswa.nama || '-',
        kelas: absensi.siswa.kelas ? absensi.siswa.kelas.replace('_', ' ') : '-',
        tingkatan: absensi.siswa.tingkatan || '-',
        tanggal: absensi.tanggal.toLocaleDateString('id-ID'),
        status: absensi.status.replace('_', ' '),
        keterangan: absensi.keterangan || '-',
      });

      // Add borders to all cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Add borders to header
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getTrendBulanan(jenis?: string) {
    // Get last 6 months data
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const where: any = {
      tanggal: {
        gte: sixMonthsAgo,
        lte: today,
      },
    };

    if (jenis) {
      where.jenis = jenis;
    }

    const absensiData = await this.prisma.absensi.findMany({
      where,
      select: {
        tanggal: true,
        status: true,
      },
    });

    // Group by month
    const monthlyStats: any = {};
    
    absensiData.forEach((item) => {
      const date = new Date(item.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          bulan: monthName,
          hadir: 0,
          tidakHadir: 0,
          sakit: 0,
          izin: 0,
        };
      }
      
      if (item.status === 'HADIR') monthlyStats[monthKey].hadir++;
      else if (item.status === 'TIDAK_HADIR') monthlyStats[monthKey].tidakHadir++;
      else if (item.status === 'SAKIT') monthlyStats[monthKey].sakit++;
      else if (item.status === 'IZIN') monthlyStats[monthKey].izin++;
    });

    // Convert to array and sort by date
    const result = Object.keys(monthlyStats)
      .sort()
      .map(key => monthlyStats[key]);

    return result;
  }

  async getDistribusiHarian(jenis?: string) {
    // Get last 30 days data
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where: any = {
      tanggal: {
        gte: thirtyDaysAgo,
        lte: today,
      },
    };

    if (jenis) {
      where.jenis = jenis;
    }

    const absensiData = await this.prisma.absensi.findMany({
      where,
      select: {
        tanggal: true,
        status: true,
      },
    });

    // Get total siswa aktif for target
    const totalSiswaAktif = await this.prisma.siswa.count({
      where: {
        isAktif: true,
      },
    });

    // Group by day of week
    const dayStats: any = {
      'Senin': { hadir: 0, count: 0 },
      'Selasa': { hadir: 0, count: 0 },
      'Rabu': { hadir: 0, count: 0 },
      'Kamis': { hadir: 0, count: 0 },
      'Jumat': { hadir: 0, count: 0 },
    };

    absensiData.forEach((item) => {
      const date = new Date(item.tanggal);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
      
      if (dayStats[dayName]) {
        dayStats[dayName].count++;
        if (item.status === 'HADIR') {
          dayStats[dayName].hadir++;
        }
      }
    });

    // Calculate average attendance per day
    const result = Object.keys(dayStats).map(day => {
      const avgHadir = dayStats[day].count > 0 
        ? Math.round(dayStats[day].hadir / (dayStats[day].count / totalSiswaAktif))
        : 0;
      
      return {
        kategori: day,
        hadir: avgHadir,
        target: totalSiswaAktif,
      };
    });

    return result;
  }
}
