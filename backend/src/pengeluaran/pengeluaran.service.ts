import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';
import { JenisPengeluaran } from '../generated/enums.js';
import ExcelJS from 'exceljs';

@Injectable()
export class PengeluaranService {
  constructor(private prisma: PrismaService) {}

  async createPengeluaran(
    data: {
      nama: string;
      jenis: string;
      harga: number;
      tanggalPengeluaran: string;
    },
    file?: any,
  ) {
    let buktiUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'Evidence',
        file.mimetype,
      );
      buktiUrl = uploadResult.url;
    }

    return this.prisma.pengeluaran.create({
      data: {
        nama: data.nama,
        jenis: data.jenis as JenisPengeluaran,
        harga: data.harga,
        bukti: buktiUrl,
        tanggalPengeluaran: new Date(data.tanggalPengeluaran),
      },
    });
  }

  async getAllPengeluaran(page: number = 1, limit: number = 20, bulan?: string, tahun?: string) {
    const skip = (page - 1) * limit;
    
    // Build date filter
    let whereClause: any = {};
    if (bulan && tahun) {
      const month = parseInt(bulan);
      const year = parseInt(tahun);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.tanggalPengeluaran = { gte: startDate, lte: endDate };
    } else if (tahun) {
      const year = parseInt(tahun);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      whereClause.tanggalPengeluaran = { gte: startDate, lte: endDate };
    }

    const [data, total] = await Promise.all([
      this.prisma.pengeluaran.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          tanggalPengeluaran: 'desc',
        },
      }),
      this.prisma.pengeluaran.count({ where: whereClause }),
    ]);

    // Convert Decimal to Number for JSON serialization
    const pengeluaranWithNumbers = data.map(item => ({
      ...item,
      harga: Number(item.harga),
    }));

    return {
      data: pengeluaranWithNumbers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPengeluaranById(id: string) {
    const pengeluaran = await this.prisma.pengeluaran.findUnique({
      where: { id },
    });

    if (!pengeluaran) {
      throw new NotFoundException('Data pengeluaran tidak ditemukan');
    }

    return {
      ...pengeluaran,
      harga: Number(pengeluaran.harga),
    };
  }

  async updatePengeluaran(
    id: string,
    data: {
      nama: string;
      jenis: string;
      harga: number;
      tanggalPengeluaran: string;
    },
    file?: any,
  ) {
    const pengeluaran = await this.prisma.pengeluaran.findUnique({
      where: { id },
    });

    if (!pengeluaran) {
      throw new NotFoundException('Data pengeluaran tidak ditemukan');
    }

    let buktiUrl = pengeluaran.bukti;

    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'Evidence',
        file.mimetype,
      );
      buktiUrl = uploadResult.url;
    }

    return this.prisma.pengeluaran.update({
      where: { id },
      data: {
        nama: data.nama,
        jenis: data.jenis as JenisPengeluaran,
        harga: data.harga,
        tanggalPengeluaran: new Date(data.tanggalPengeluaran),
        ...(file && { bukti: buktiUrl }),
      },
    });
  }

  async deletePengeluaran(id: string) {
    const pengeluaran = await this.prisma.pengeluaran.findUnique({
      where: { id },
    });

    if (!pengeluaran) {
      throw new NotFoundException('Data pengeluaran tidak ditemukan');
    }

    await this.prisma.pengeluaran.delete({
      where: { id },
    });

    return { message: 'Data pengeluaran berhasil dihapus' };
  }

  async getPengeluaranTerbaru(limit: number = 10, bulan?: string, tahun?: string) {
    // Build date filter
    let whereClause: any = {};
    
    if (bulan && tahun) {
      const month = parseInt(bulan);
      const year = parseInt(tahun);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.tanggalPengeluaran = { gte: startDate, lte: endDate };
    } else if (tahun) {
      const year = parseInt(tahun);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      whereClause.tanggalPengeluaran = { gte: startDate, lte: endDate };
    }

    const data = await this.prisma.pengeluaran.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        tanggalPengeluaran: 'desc',
      },
    });

    // Convert Decimal to Number for JSON serialization
    return data.map(item => ({
      ...item,
      harga: Number(item.harga),
    }));
  }

  async exportPengeluaranToExcel(
    filterType?: string,
    tanggal?: string,
    bulan?: string,
    tahun?: string,
  ): Promise<Buffer> {
    // Build where clause based on filter
    const where: any = {};

    if (filterType === 'tanggal' && tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);

      where.tanggalPengeluaran = {
        gte: startDate,
        lt: endDate,
      };
    } else if (filterType === 'bulan' && bulan) {
      const [year, month] = bulan.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);

      where.tanggalPengeluaran = {
        gte: startDate,
        lt: endDate,
      };
    } else if (filterType === 'tahun' && tahun) {
      const startDate = new Date(parseInt(tahun), 0, 1);
      const endDate = new Date(parseInt(tahun) + 1, 0, 1);

      where.tanggalPengeluaran = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Get pengeluaran data based on filter
    const pengeluaranData = await this.prisma.pengeluaran.findMany({
      where,
      orderBy: {
        tanggalPengeluaran: 'desc',
      },
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Pengeluaran');

    // Set column headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Jenis', key: 'jenis', width: 20 },
      { header: 'Harga', key: 'harga', width: 18 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10b981' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Helper function to format jenis
    const formatJenis = (jenis: string) => {
      const jenisMap: Record<string, string> = {
        SERAGAM: 'Seragam',
        LISTRIK: 'Listrik',
        INTERNET: 'Internet',
        LAUK: 'Lauk',
        BERAS: 'Beras',
        PERCETAKAN: 'Percetakan',
        JASA: 'Jasa',
        LAUNDRY: 'Laundry',
        PERBAIKAN_FASILITAS_PONDOK: 'Perbaikan Fasilitas Pondok',
        PENGELUARAN_NON_RUTIN: 'Pengeluaran Non Rutin',
        LAINNYA: 'Lainnya',
      };
      return jenisMap[jenis] || jenis;
    };

    // Add data rows
    pengeluaranData.forEach((pengeluaran, index) => {
      worksheet.addRow({
        no: index + 1,
        tanggal: new Date(pengeluaran.tanggalPengeluaran).toLocaleDateString('id-ID'),
        nama: pengeluaran.nama,
        jenis: formatJenis(pengeluaran.jenis),
        harga: Number(pengeluaran.harga),
      });
    });

    // Format currency column
    const hargaCol = worksheet.getColumn('harga');
    hargaCol.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.numFmt = 'Rp#,##0';
        cell.alignment = { horizontal: 'right' };
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
