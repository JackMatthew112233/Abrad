import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import ExcelJS from 'exceljs';

@Injectable()
export class SiswaService {
  constructor(private prisma: PrismaService) {}

  async getAllSiswa(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [siswa, total] = await Promise.all([
      this.prisma.siswa.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.siswa.count(),
    ]);

    return {
      data: siswa,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistik() {
    const totalSiswa = await this.prisma.siswa.count();
    
    const siswaLakiLaki = await this.prisma.siswa.count({
      where: {
        jenisKelamin: 'LakiLaki',
      },
    });

    const siswaPerempuan = await this.prisma.siswa.count({
      where: {
        jenisKelamin: 'Perempuan',
      },
    });

    const siswaAktif = await this.prisma.siswa.count({
      where: {
        isAktif: true,
      },
    });

    return {
      totalSiswa,
      siswaLakiLaki,
      siswaPerempuan,
      siswaAktif,
      siswaNonAktif: totalSiswa - siswaAktif,
    };
  }

  async getSiswaById(id: string) {
    return this.prisma.siswa.findUnique({
      where: { id },
    });
  }

  async createSiswa(data: any) {
    // Convert date string to Date object if present
    if (data.tanggalLahir) {
      data.tanggalLahir = new Date(data.tanggalLahir);
    }

    // Ensure enums are valid
    const validData: any = {};
    
    // Copy all fields, ensuring empty strings become null for optional fields
    Object.keys(data).forEach((key) => {
      if (data[key] === '' || data[key] === undefined) {
        validData[key] = null;
      } else {
        validData[key] = data[key];
      }
    });

    return this.prisma.siswa.create({
      data: validData,
    });
  }

  async updateSiswa(id: string, data: any) {
    // Convert date string to Date object if present
    if (data.tanggalLahir) {
      data.tanggalLahir = new Date(data.tanggalLahir);
    }

    // Ensure enums are valid
    const validData: any = {};
    
    // Copy all fields, ensuring empty strings become null for optional fields
    Object.keys(data).forEach((key) => {
      if (data[key] === '' || data[key] === undefined) {
        validData[key] = null;
      } else {
        validData[key] = data[key];
      }
    });

    return this.prisma.siswa.update({
      where: { id },
      data: validData,
    });
  }

  async deleteSiswa(id: string) {
    return this.prisma.siswa.delete({
      where: { id },
    });
  }

  async exportSiswaToExcel(kelas?: string, tingkatan?: string): Promise<Buffer> {
    // Build where clause based on provided filters
    const where: any = {};
    
    if (kelas) {
      // Convert kelas format from "XII_PUTRA" to "XII_Putra" to match Prisma enum
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

    // Get all siswa data based on filters
    const siswaData = await this.prisma.siswa.findMany({
      where,
      orderBy: [
        { tingkatan: 'asc' },
        { kelas: 'asc' },
        { nama: 'asc' },
      ],
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Biodata Santri');

    // Set column headers with all fields
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'NIK', key: 'nik', width: 18 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'NPSN', key: 'npsn', width: 15 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
      { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
      { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
      { header: 'Sekolah Asal', key: 'sekolahAsal', width: 30 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Kode Pos', key: 'kodePos', width: 10 },
      { header: 'No. KK', key: 'noKK', width: 18 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
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
    siswaData.forEach((siswa, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        nama: siswa.nama || '-',
        nik: siswa.nik || '-',
        nis: siswa.nis || '-',
        nisn: siswa.nisn || '-',
        npsn: siswa.npsn || '-',
        jenisKelamin: siswa.jenisKelamin || '-',
        tempatLahir: siswa.tempatLahir || '-',
        tanggalLahir: siswa.tanggalLahir ? siswa.tanggalLahir.toLocaleDateString('id-ID') : '-',
        sekolahAsal: siswa.sekolahAsal || '-',
        alamat: siswa.alamat || '-',
        kodePos: siswa.kodePos || '-',
        noKK: siswa.noKartuKeluarga || '-',
        kelas: siswa.kelas ? siswa.kelas.replace('_', ' ') : '-',
        tingkatan: siswa.tingkatan || '-',
        status: siswa.isAktif ? 'Aktif' : 'Non-Aktif',
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
}
