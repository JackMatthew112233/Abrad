import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { uploadToSupabase, deleteFromSupabase } from '../utils/supabase-upload.util.js';
import ExcelJS from 'exceljs';

@Injectable()
export class PelanggaranService {
  constructor(private prisma: PrismaService) {}

  async createPelanggaran(
    data: {
      siswaId: string;
      sanksi: string;
      keterangan: string;
    },
    file?: any,
  ) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: data.siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    let evidenceUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'Evidence',
        file.mimetype,
      );
      evidenceUrl = uploadResult.url;
    }

    return this.prisma.pelanggaran.create({
      data: {
        siswaId: data.siswaId,
        sanksi: data.sanksi as any,
        keterangan: data.keterangan,
        evidence: evidenceUrl,
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

  async getAllPelanggaran(page: number = 1, limit: number = 20, sanksi?: string, siswaId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (sanksi) {
      where.sanksi = sanksi;
    }
    if (siswaId) {
      where.siswaId = siswaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.pelanggaran.findMany({
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
              jenisKelamin: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.pelanggaran.count({ where }),
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

  async getPelanggaranBySiswaList(page: number, limit: number) {
    // Get all pelanggaran grouped by siswa
    const pelanggaranGrouped = await this.prisma.pelanggaran.groupBy({
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
    const total = pelanggaranGrouped.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get paginated siswa data
    const paginatedData = pelanggaranGrouped.slice(skip, skip + limit);

    // Get full siswa details for paginated items
    const siswaWithPelanggaran = await Promise.all(
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
          jumlahPelanggaran: item._count.id,
        };
      }),
    );

    return {
      data: siswaWithPelanggaran,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getPelanggaranBySiswa(siswaId: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return this.prisma.pelanggaran.findMany({
      where: { siswaId },
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

  async getStatistikPelanggaran() {
    const pelanggaranData = await this.prisma.pelanggaran.groupBy({
      by: ['sanksi'],
      _count: {
        sanksi: true,
      },
    });

    const stats = {
      RINGAN: 0,
      SEDANG: 0,
      BERAT: 0,
      SP1: 0,
      SP2: 0,
      SP3: 0,
    };

    pelanggaranData.forEach((item) => {
      stats[item.sanksi] = item._count.sanksi;
    });

    const total = await this.prisma.pelanggaran.count();

    return {
      stats,
      total,
    };
  }

  async getPelanggaranTerbaru(limit: number = 10) {
    return this.prisma.pelanggaran.findMany({
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

  async getPelanggaranById(id: string) {
    const pelanggaran = await this.prisma.pelanggaran.findUnique({
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

    if (!pelanggaran) {
      throw new NotFoundException('Data pelanggaran tidak ditemukan');
    }

    return pelanggaran;
  }

  async updatePelanggaran(
    id: string,
    data: {
      sanksi: string;
      keterangan: string;
    },
    file?: any,
  ) {
    const pelanggaran = await this.prisma.pelanggaran.findUnique({
      where: { id },
    });

    if (!pelanggaran) {
      throw new NotFoundException('Data pelanggaran tidak ditemukan');
    }

    const updateData: any = {
      sanksi: data.sanksi as any,
      keterangan: data.keterangan,
    };

    // If new file is uploaded, replace the old one
    if (file) {
      // Delete old evidence if exists
      if (pelanggaran.evidence) {
        try {
          const url = new URL(pelanggaran.evidence);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts[pathParts.length - 1];
          await deleteFromSupabase(filePath, 'Evidence');
        } catch (error) {
          console.error('Error deleting old evidence:', error);
        }
      }

      // Upload new file
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'Evidence',
        file.mimetype,
      );
      updateData.evidence = uploadResult.url;
    }

    return this.prisma.pelanggaran.update({
      where: { id },
      data: updateData,
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

  async deletePelanggaran(id: string) {
    const pelanggaran = await this.prisma.pelanggaran.findUnique({
      where: { id },
    });

    if (!pelanggaran) {
      throw new NotFoundException('Data pelanggaran tidak ditemukan');
    }

    // Delete evidence from Supabase if exists
    if (pelanggaran.evidence) {
      try {
        const url = new URL(pelanggaran.evidence);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts[pathParts.length - 1];
        await deleteFromSupabase(filePath, 'Evidence');
      } catch (error) {
        // Log error but continue with deletion
        console.error('Error deleting evidence from Supabase:', error);
      }
    }

    await this.prisma.pelanggaran.delete({
      where: { id },
    });

    return { message: 'Data pelanggaran berhasil dihapus' };
  }

  async getSiswaById(siswaId: string) {
    return this.prisma.siswa.findUnique({
      where: { id: siswaId },
      select: {
        id: true,
        nama: true,
        kelas: true,
        tingkatan: true,
      },
    });
  }

  async exportPelanggaranToExcel(siswaId?: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Pelanggaran');

    // Set column headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Nama Santri / Santriwati', key: 'nama', width: 30 },
      { header: 'Tingkatan', key: 'tingkatan', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Jenis Sanksi', key: 'sanksi', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 50 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' }, // emerald-600
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Fetch data
    const where: any = {};
    if (siswaId) {
      where.siswaId = siswaId;
    }

    const pelanggaranList = await this.prisma.pelanggaran.findMany({
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
        createdAt: 'desc',
      },
    });

    // Add data rows
    pelanggaranList.forEach((pelanggaran, index) => {
      const tanggal = new Date(pelanggaran.createdAt);
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const tanggalFormatted = `${tanggal.getDate()} ${bulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`;

      worksheet.addRow({
        no: index + 1,
        tanggal: tanggalFormatted,
        nama: pelanggaran.siswa.nama,
        tingkatan: pelanggaran.siswa.tingkatan || '-',
        kelas: pelanggaran.siswa.kelas?.replace(/_/g, ' ') || '-',
        sanksi: pelanggaran.sanksi,
        keterangan: pelanggaran.keterangan,
      });
    });

    // Style all rows
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', wrapText: true };
      }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
