import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';
import ExcelJS from 'exceljs';

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
        siswa: true,
      },
    });

    if (!biodata) {
      throw new NotFoundException('Biodata keuangan tidak ditemukan');
    }

    // Convert Decimal to Number for JSON serialization
    return {
      ...biodata,
      komitmenInfaqLaundry: Number(biodata.komitmenInfaqLaundry),
      infaq: Number(biodata.infaq),
      laundry: Number(biodata.laundry),
    };
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
              jenisKelamin: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.biodataKeuangan.count(),
    ]);

    // Convert Decimal to Number for JSON serialization
    const biodataWithNumbers = biodataList.map(biodata => ({
      ...biodata,
      komitmenInfaqLaundry: Number(biodata.komitmenInfaqLaundry),
      infaq: Number(biodata.infaq),
      laundry: Number(biodata.laundry),
    }));

    return {
      data: biodataWithNumbers,
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

    // Calculate totals (convert Decimal to Number)
    const totalKomitmen = allBiodata.reduce(
      (sum, item) => sum + Number(item.komitmenInfaqLaundry || 0),
      0,
    );
    const totalInfaq = allBiodata.reduce((sum, item) => sum + Number(item.infaq || 0), 0);
    const totalLaundry = allBiodata.reduce(
      (sum, item) => sum + Number(item.laundry || 0),
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
      (sum, item) => sum + Number(item.totalPembayaranInfaq || 0),
      0,
    );
    const totalPembayaranLaundry = allPembayaran.reduce(
      (sum, item) => sum + Number(item.totalPembayaranLaundry || 0),
      0,
    );

    // Count santri with biodata
    const jumlahSantriTerdaftar = await this.prisma.biodataKeuangan.count();

    // Get total donasi
    const donasiAggregate = await this.prisma.donasi.aggregate({
      _sum: {
        jumlahDonasi: true,
      },
    });
    const totalDonasi = Number(donasiAggregate._sum.jumlahDonasi || 0);

    return {
      totalKomitmen,
      totalInfaq,
      totalLaundry,
      totalPembayaranInfaq,
      totalPembayaranLaundry,
      jumlahSantriTerdaftar,
      totalDonasi,
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

      monthlyData[monthKey].infaq += Number(pembayaran.totalPembayaranInfaq || 0);
      monthlyData[monthKey].laundry += Number(pembayaran.totalPembayaranLaundry || 0);
    });

    // Convert to array format for charts
    return Object.entries(monthlyData).map(([bulan, data]) => ({
      bulan: bulan.split(' ')[0], // Get just month name
      infaq: Math.round(data.infaq / 1000000), // Convert to millions
      laundry: Math.round(data.laundry / 1000000),
    }));
  }

  async getChartTargetRealisasi() {
    // Get total target (komitmen) from biodata keuangan
    const biodataKeuangan = await this.prisma.biodataKeuangan.aggregate({
      _sum: {
        komitmenInfaqLaundry: true,
        infaq: true,
        laundry: true,
      },
    });

    // Get total realisasi (pembayaran)
    const pembayaran = await this.prisma.pembayaran.aggregate({
      _sum: {
        totalPembayaranInfaq: true,
        totalPembayaranLaundry: true,
      },
    });

    const totalTarget = Number(biodataKeuangan._sum.komitmenInfaqLaundry || 0);
    const totalRealisasi = Number(pembayaran._sum.totalPembayaranInfaq || 0) + Number(pembayaran._sum.totalPembayaranLaundry || 0);

    // Calculate percentage
    const persentase = totalTarget > 0 ? Math.round((totalRealisasi / totalTarget) * 100) : 0;

    // Get last 6 months of payment data for trend chart
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

    // Group by month for trend data
    const monthlyData: Record<string, { realisasi: number }> = {};

    pembayaranList.forEach((p) => {
      const monthKey = new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        year: 'numeric',
      }).format(p.createdAt);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { realisasi: 0 };
      }

      monthlyData[monthKey].realisasi += Number(p.totalPembayaranInfaq || 0) + Number(p.totalPembayaranLaundry || 0);
    });

    // Calculate monthly target (total target divided by 12 months as baseline)
    const monthlyTarget = Math.round(totalTarget / 12);

    // Convert to array format for line chart
    const trendData = Object.entries(monthlyData).map(([bulan, data]) => ({
      bulan: bulan.split(' ')[0], // Get just month name
      target: Math.round(monthlyTarget / 1000000), // Convert to millions
      realisasi: Math.round(data.realisasi / 1000000), // Convert to millions
    }));

    return {
      target: totalTarget,
      realisasi: totalRealisasi,
      persentase,
      sisa: totalTarget - totalRealisasi,
      trendData, // New: monthly trend data for line chart
      chartData: [
        {
          name: 'Target',
          value: totalTarget,
          color: '#94a3b8', // slate-400
        },
        {
          name: 'Realisasi',
          value: totalRealisasi,
          color: '#10b981', // emerald-600
        },
      ],
    };
  }

  async getChartDistribusi(filter?: string) {
    // Filter: all (default), pemasukan, pengeluaran, donasi, jenis_SERAGAM, jenis_LISTRIK, etc
    
    if (filter === 'pemasukan') {
      // Detail breakdown pemasukan
      const pembayaran = await this.prisma.pembayaran.aggregate({
        _sum: {
          totalPembayaranInfaq: true,
          totalPembayaranLaundry: true,
        },
      });

      return [
        {
          name: 'Infaq',
          value: Number(pembayaran._sum.totalPembayaranInfaq || 0),
          color: '#10b981',
        },
        {
          name: 'Laundry',
          value: Number(pembayaran._sum.totalPembayaranLaundry || 0),
          color: '#22c55e',
        },
      ];
    }
    
    if (filter === 'donasi') {
      // Detail breakdown donasi by nama
      const donasiList = await this.prisma.donasi.findMany({
        select: {
          nama: true,
          jumlahDonasi: true,
        },
      });

      // Group by nama and sum
      const groupedData: Record<string, number> = {};
      donasiList.forEach((item) => {
        if (!groupedData[item.nama]) {
          groupedData[item.nama] = 0;
        }
        groupedData[item.nama] += Number(item.jumlahDonasi);
      });

      const colors = ['#10b981', '#22c55e', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
      
      return Object.entries(groupedData)
        .map(([nama, total], index) => ({
          name: nama,
          value: total,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10
    }
    
    if (filter === 'pengeluaran') {
      // Pengeluaran breakdown by jenis
      const pengeluaranByJenis = await this.prisma.pengeluaran.groupBy({
        by: ['jenis'],
        _sum: {
          harga: true,
        },
      });

      const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];
      
      return pengeluaranByJenis.map((item, index) => {
        const jenisMap: Record<string, string> = {
          SERAGAM: 'Seragam',
          LISTRIK: 'Listrik',
          INTERNET: 'Internet',
          LAUK: 'Lauk',
          BERAS: 'Beras',
          PERCETAKAN: 'Percetakan',
          JASA: 'Jasa',
          LAUNDRY: 'Laundry',
          PERBAIKAN_FASILITAS_PONDOK: 'Perbaikan Fasilitas',
          PENGELUARAN_NON_RUTIN: 'Non Rutin',
          LAINNYA: 'Lainnya',
        };
        
        return {
          name: jenisMap[item.jenis] || item.jenis,
          value: Number(item._sum.harga || 0),
          color: colors[index % colors.length],
        };
      });
    }
    
    if (filter && filter.startsWith('jenis_')) {
      // Show specific jenis breakdown by month or detail
      const jenis = filter.replace('jenis_', '');
      
      const pengeluaranList = await this.prisma.pengeluaran.findMany({
        where: {
          jenis: jenis as any,
        },
        select: {
          nama: true,
          harga: true,
        },
      });

      // Group by nama and sum
      const groupedData: Record<string, number> = {};
      pengeluaranList.forEach((item) => {
        if (!groupedData[item.nama]) {
          groupedData[item.nama] = 0;
        }
        groupedData[item.nama] += Number(item.harga);
      });

      const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6'];
      
      return Object.entries(groupedData)
        .map(([nama, total], index) => ({
          name: nama,
          value: total,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10
    }
    
    // Default: Pemasukan vs Pengeluaran
    const pembayaran = await this.prisma.pembayaran.aggregate({
      _sum: {
        totalPembayaranInfaq: true,
        totalPembayaranLaundry: true,
      },
    });

    const pengeluaran = await this.prisma.pengeluaran.aggregate({
      _sum: {
        harga: true,
      },
    });

    const totalPemasukan = Number(pembayaran._sum.totalPembayaranInfaq || 0) + Number(pembayaran._sum.totalPembayaranLaundry || 0);
    const totalPengeluaran = Number(pengeluaran._sum.harga || 0);

    return [
      {
        name: 'Pemasukan',
        value: totalPemasukan,
        color: '#10b981',
      },
      {
        name: 'Pengeluaran',
        value: totalPengeluaran,
        color: '#ef4444',
      },
    ];
  }

  async createPembayaran(
    data: {
      siswaId: string;
      totalPembayaranInfaq: number;
      totalPembayaranLaundry: number;
      tanggalPembayaran: string;
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
      'Evidence',
      file.mimetype,
    );

    return this.prisma.pembayaran.create({
      data: {
        siswaId: data.siswaId,
        totalPembayaranInfaq: data.totalPembayaranInfaq,
        totalPembayaranLaundry: data.totalPembayaranLaundry,
        buktiPembayaran: uploadResult.url,
        tanggalPembayaran: new Date(data.tanggalPembayaran),
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
    const pembayaranList = await this.prisma.pembayaran.findMany({
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
        tanggalPembayaran: 'desc',
      },
    });

    // Convert Decimal to Number for JSON serialization
    return pembayaranList.map(pembayaran => ({
      ...pembayaran,
      totalPembayaranInfaq: Number(pembayaran.totalPembayaranInfaq),
      totalPembayaranLaundry: Number(pembayaran.totalPembayaranLaundry),
    }));
  }

  async getAllPembayaranWithPagination(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [pembayaranList, total] = await Promise.all([
      this.prisma.pembayaran.findMany({
        skip,
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
          tanggalPembayaran: 'desc',
        },
      }),
      this.prisma.pembayaran.count(),
    ]);

    // Convert Decimal to Number for JSON serialization
    const pembayaranWithNumbers = pembayaranList.map(pembayaran => ({
      ...pembayaran,
      totalPembayaranInfaq: Number(pembayaran.totalPembayaranInfaq),
      totalPembayaranLaundry: Number(pembayaran.totalPembayaranLaundry),
    }));

    return {
      data: pembayaranWithNumbers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPembayaranTerbaru(limit: number = 10) {
    const pembayaranList = await this.prisma.pembayaran.findMany({
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
        tanggalPembayaran: 'desc',
      },
    });

    // Convert Decimal to Number for JSON serialization
    return pembayaranList.map(pembayaran => ({
      ...pembayaran,
      totalPembayaranInfaq: Number(pembayaran.totalPembayaranInfaq),
      totalPembayaranLaundry: Number(pembayaran.totalPembayaranLaundry),
    }));
  }

  async getPembayaranBySiswa(siswaId: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;

    const [pembayaranList, total] = await Promise.all([
      this.prisma.pembayaran.findMany({
        where: {
          siswaId,
        },
        skip,
        take: limit,
        orderBy: {
          tanggalPembayaran: 'desc',
        },
      }),
      this.prisma.pembayaran.count({
        where: {
          siswaId,
        },
      }),
    ]);

    // Convert Decimal to Number for JSON serialization
    const pembayaranWithNumbers = pembayaranList.map(pembayaran => ({
      ...pembayaran,
      totalPembayaranInfaq: Number(pembayaran.totalPembayaranInfaq),
      totalPembayaranLaundry: Number(pembayaran.totalPembayaranLaundry),
    }));

    return {
      data: pembayaranWithNumbers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePembayaran(
    id: string,
    data: {
      totalPembayaranInfaq: number;
      totalPembayaranLaundry: number;
      tanggalPembayaran: string;
    },
    file?: any,
  ) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
    });

    if (!pembayaran) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }

    const updateData: any = {
      totalPembayaranInfaq: data.totalPembayaranInfaq,
      totalPembayaranLaundry: data.totalPembayaranLaundry,
      tanggalPembayaran: new Date(data.tanggalPembayaran),
    };

    // If new file uploaded, upload it and update URL
    if (file) {
      const uploadResult = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'Evidence',
        file.mimetype,
      );
      updateData.buktiPembayaran = uploadResult.url;
    }

    return this.prisma.pembayaran.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePembayaran(id: string) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
    });

    if (!pembayaran) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }

    await this.prisma.pembayaran.delete({
      where: { id },
    });

    return { message: 'Data pembayaran berhasil dihapus' };
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

  async getSiswaById(id: string) {
    return this.prisma.siswa.findUnique({
      where: { id },
    });
  }

  async exportPembayaranToExcel(siswaId?: string): Promise<Buffer> {
    // Build where clause based on provided filter
    const where: any = {};
    
    if (siswaId) {
      where.siswaId = siswaId;
    }

    // Get all pembayaran data based on filter
    const pembayaranData = await this.prisma.pembayaran.findMany({
      where,
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            jenisKelamin: true,
          },
        },
      },
      orderBy: {
        tanggalPembayaran: 'desc',
      },
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Pembayaran');

    // Set column headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Nama Santri', key: 'nama', width: 30 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Pembayaran Infaq', key: 'infaq', width: 18 },
      { header: 'Pembayaran Laundry', key: 'laundry', width: 18 },
      { header: 'Total', key: 'total', width: 18 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10b981' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    pembayaranData.forEach((pembayaran, index) => {
      let jenisKelamin = '-';
      if (pembayaran.siswa.jenisKelamin === 'LakiLaki') {
        jenisKelamin = 'Laki-Laki';
      } else if (pembayaran.siswa.jenisKelamin === 'Perempuan') {
        jenisKelamin = 'Perempuan';
      }
      const kelas = pembayaran.siswa.kelas ? pembayaran.siswa.kelas.replace(/_/g, ' ') : '-';
      
      worksheet.addRow({
        no: index + 1,
        tanggal: new Date(pembayaran.tanggalPembayaran).toLocaleDateString('id-ID'),
        nama: pembayaran.siswa.nama,
        jenisKelamin: jenisKelamin,
        kelas: kelas,
        tingkatan: pembayaran.siswa.tingkatan || '-',
        infaq: Number(pembayaran.totalPembayaranInfaq),
        laundry: Number(pembayaran.totalPembayaranLaundry),
        total: Number(pembayaran.totalPembayaranInfaq) + Number(pembayaran.totalPembayaranLaundry),
      });
    });

    // Format currency columns
    ['infaq', 'laundry', 'total'].forEach((key) => {
      const col = worksheet.getColumn(key);
      col.eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.numFmt = 'Rp#,##0';
          cell.alignment = { horizontal: 'right' };
        }
      });
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
