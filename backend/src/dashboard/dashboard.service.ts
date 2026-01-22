import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(year: number, month: number) {
    // Create date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch all data in parallel
    const [
      siswaStats,
      pembayaranStats,
      absensiStats,
      kesehatanStats,
      pelanggaranStats,
      nilaiStats,
      tahfidzStats,
      koperasiStats,
      donasiStats,
      pengeluaranStats,
      pembayaranTrend,
      absensiTrend,
    ] = await Promise.all([
      this.getSiswaStats(),
      this.getPembayaranStats(startDate, endDate),
      this.getAbsensiStats(startDate, endDate),
      this.getKesehatanStats(startDate, endDate),
      this.getPelanggaranStats(startDate, endDate),
      this.getNilaiStats(),
      this.getTahfidzStats(),
      this.getKoperasiStats(),
      this.getDonasiStats(startDate, endDate),
      this.getPengeluaranStats(startDate, endDate),
      this.getPembayaranTrend(year),
      this.getAbsensiTrend(year, month),
    ]);

    return {
      period: { year, month },
      siswa: siswaStats,
      pembayaran: pembayaranStats,
      absensi: absensiStats,
      kesehatan: kesehatanStats,
      pelanggaran: pelanggaranStats,
      nilai: nilaiStats,
      tahfidz: tahfidzStats,
      koperasi: koperasiStats,
      donasi: donasiStats,
      pengeluaran: pengeluaranStats,
      charts: {
        pembayaranTrend,
        absensiTrend,
      },
    };
  }

  private async getSiswaStats() {
    // Total counts (all statuses)
    const total = await this.prisma.siswa.count();
    const putra = await this.prisma.siswa.count({
      where: { jenisKelamin: 'LakiLaki' },
    });
    const putri = await this.prisma.siswa.count({
      where: { jenisKelamin: 'Perempuan' },
    });

    // Status breakdown for all
    const totalAktif = await this.prisma.siswa.count({
      where: { status: 'AKTIF' },
    });
    const totalTidakAktif = await this.prisma.siswa.count({
      where: { status: 'TIDAK_AKTIF' },
    });
    const totalLulus = await this.prisma.siswa.count({
      where: { status: 'LULUS' },
    });

    // Status breakdown for Laki-laki (Santri)
    const santriAktif = await this.prisma.siswa.count({
      where: { jenisKelamin: 'LakiLaki', status: 'AKTIF' },
    });
    const santriTidakAktif = await this.prisma.siswa.count({
      where: { jenisKelamin: 'LakiLaki', status: 'TIDAK_AKTIF' },
    });
    const santriLulus = await this.prisma.siswa.count({
      where: { jenisKelamin: 'LakiLaki', status: 'LULUS' },
    });

    // Status breakdown for Perempuan (Santriwati)
    const santriwatiAktif = await this.prisma.siswa.count({
      where: { jenisKelamin: 'Perempuan', status: 'AKTIF' },
    });
    const santriwatiTidakAktif = await this.prisma.siswa.count({
      where: { jenisKelamin: 'Perempuan', status: 'TIDAK_AKTIF' },
    });
    const santriwatiLulus = await this.prisma.siswa.count({
      where: { jenisKelamin: 'Perempuan', status: 'LULUS' },
    });

    return {
      total,
      putra,
      putri,
      aktif: totalAktif,
      breakdown: {
        total: {
          aktif: totalAktif,
          tidakAktif: totalTidakAktif,
          lulus: totalLulus,
        },
        santri: {
          aktif: santriAktif,
          tidakAktif: santriTidakAktif,
          lulus: santriLulus,
        },
        santriwati: {
          aktif: santriwatiAktif,
          tidakAktif: santriwatiTidakAktif,
          lulus: santriwatiLulus,
        },
      },
    };
  }

  private async getPembayaranStats(startDate: Date, endDate: Date) {
    const pembayaran = await this.prisma.pembayaran.findMany({
      where: {
        tanggalPembayaran: { gte: startDate, lte: endDate },
      },
      select: {
        totalPembayaranInfaq: true,
        totalPembayaranLaundry: true,
      },
    });

    let totalInfaq = 0;
    let totalLaundry = 0;

    pembayaran.forEach((p) => {
      totalInfaq += Number(p.totalPembayaranInfaq);
      totalLaundry += Number(p.totalPembayaranLaundry);
    });

    const totalNominal = totalInfaq + totalLaundry;
    const totalTransaksi = pembayaran.length;

    return {
      totalNominal,
      totalTransaksi,
      byJenis: { infaq: totalInfaq, laundry: totalLaundry },
    };
  }

  private async getAbsensiStats(startDate: Date, endDate: Date) {
    const absensi = await this.prisma.absensi.findMany({
      where: {
        tanggal: { gte: startDate, lte: endDate },
      },
      select: {
        status: true,
      },
    });

    const total = absensi.length;
    const hadir = absensi.filter((a) => a.status === 'HADIR').length;
    const izin = absensi.filter((a) => a.status === 'IZIN').length;
    const sakit = absensi.filter((a) => a.status === 'SAKIT').length;
    const alpha = absensi.filter((a) => a.status === 'TIDAK_HADIR').length;

    const persentaseHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { total, hadir, izin, sakit, alpha, persentaseHadir };
  }

  private async getKesehatanStats(startDate: Date, endDate: Date) {
    const totalCatatan = await this.prisma.kesehatan.count({
      where: {
        tanggal: { gte: startDate, lte: endDate },
      },
    });

    const siswaWithAsuransi = await this.prisma.kesehatan.groupBy({
      by: ['siswaId'],
      where: {
        OR: [{ noBpjs: { not: null } }, { noAsuransi: { not: null } }],
      },
    });

    return {
      totalCatatan,
      siswaWithAsuransi: siswaWithAsuransi.length,
    };
  }

  private async getPelanggaranStats(startDate: Date, endDate: Date) {
    const pelanggaran = await this.prisma.pelanggaran.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        sanksi: true,
      },
    });

    const total = pelanggaran.length;
    const ringan = pelanggaran.filter((p) => p.sanksi === 'RINGAN').length;
    const sedang = pelanggaran.filter((p) => p.sanksi === 'SEDANG').length;
    const berat = pelanggaran.filter((p) => p.sanksi === 'BERAT').length;

    return { total, ringan, sedang, berat };
  }

  private async getNilaiStats() {
    const totalNilai = await this.prisma.nilai.count();
    const avgNilai = await this.prisma.nilai.aggregate({
      _avg: { nilai: true },
    });

    return {
      totalNilai,
      rataRata: avgNilai._avg.nilai
        ? Math.round(Number(avgNilai._avg.nilai) * 100) / 100
        : 0,
    };
  }

  private async getTahfidzStats() {
    const juzCount = await this.prisma.tahfidz.groupBy({
      by: ['juzKe'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    return {
      modusJuz: juzCount.length > 0 ? juzCount[0].juzKe : null,
      modusCount: juzCount.length > 0 ? juzCount[0]._count.id : 0,
    };
  }

  private async getKoperasiStats() {
    const totalAnggota = await this.prisma.anggotaKoperasi.count();

    const pemasukan = await this.prisma.pemasukanKoperasi.aggregate({
      _sum: { jumlah: true },
    });

    const pengeluaran = await this.prisma.pengeluaranKoperasi.aggregate({
      _sum: { jumlah: true },
    });

    const totalPemasukan = Number(pemasukan._sum?.jumlah || 0);
    const totalPengeluaran = Number(pengeluaran._sum?.jumlah || 0);
    const saldo = totalPemasukan - totalPengeluaran;

    return { totalAnggota, totalPemasukan, totalPengeluaran, saldo };
  }

  private async getDonasiStats(startDate: Date, endDate: Date) {
    const donasi = await this.prisma.donasi.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { jumlahDonasi: true },
    });

    const totalNominal = donasi.reduce(
      (sum, d) => sum + Number(d.jumlahDonasi),
      0,
    );
    const totalDonatur = donasi.length;

    return { totalNominal, totalDonatur };
  }

  private async getPengeluaranStats(startDate: Date, endDate: Date) {
    const pengeluaran = await this.prisma.pengeluaran.findMany({
      where: {
        tanggalPengeluaran: { gte: startDate, lte: endDate },
      },
      select: { harga: true },
    });

    const totalNominal = pengeluaran.reduce(
      (sum, p) => sum + Number(p.harga),
      0,
    );
    const totalTransaksi = pengeluaran.length;

    return { totalNominal, totalTransaksi };
  }

  private async getPembayaranTrend(year: number) {
    const months: { bulan: number; nominal: number; transaksi: number }[] = [];

    for (let m = 1; m <= 12; m++) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);

      const pembayaran = await this.prisma.pembayaran.findMany({
        where: {
          tanggalPembayaran: { gte: startDate, lte: endDate },
        },
        select: {
          totalPembayaranInfaq: true,
          totalPembayaranLaundry: true,
        },
      });

      let totalNominal = 0;
      pembayaran.forEach((p) => {
        totalNominal +=
          Number(p.totalPembayaranInfaq) + Number(p.totalPembayaranLaundry);
      });

      months.push({
        bulan: m,
        nominal: totalNominal,
        transaksi: pembayaran.length,
      });
    }

    return months;
  }

  private async getAbsensiTrend(year: number, month: number) {
    const endDate = new Date(year, month, 0);
    const daysInMonth = endDate.getDate();

    const days: {
      tanggal: number;
      hadir: number;
      izin: number;
      sakit: number;
      alpha: number;
    }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(year, month - 1, d);
      const dayEnd = new Date(year, month - 1, d, 23, 59, 59);

      const absensi = await this.prisma.absensi.findMany({
        where: {
          tanggal: { gte: dayStart, lte: dayEnd },
        },
        select: { status: true },
      });

      days.push({
        tanggal: d,
        hadir: absensi.filter((a) => a.status === 'HADIR').length,
        izin: absensi.filter((a) => a.status === 'IZIN').length,
        sakit: absensi.filter((a) => a.status === 'SAKIT').length,
        alpha: absensi.filter((a) => a.status === 'TIDAK_HADIR').length,
      });
    }

    return days;
  }
}
