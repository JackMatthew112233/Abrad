import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import ExcelJS from 'exceljs';

@Injectable()
export class BackupService {
  constructor(private prisma: PrismaService) {}

  private formatDateTime(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatCurrency(value: any): string {
    if (!value) return '-';
    return Number(value).toLocaleString('id-ID');
  }

  private styleHeader(worksheet: ExcelJS.Worksheet) {
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  }

  async backupSiswa(): Promise<Buffer> {
    const data = await this.prisma.siswa.findMany({
      orderBy: { nama: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Santri');

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
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Kode Pos', key: 'kodePos', width: 10 },
      { header: 'No. KK', key: 'noKK', width: 18 },
      { header: 'Sekolah Asal', key: 'sekolahAsal', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Nama Ayah', key: 'namaAyah', width: 25 },
      { header: 'NIK Ayah', key: 'nikAyah', width: 18 },
      { header: 'Pekerjaan Ayah', key: 'pekerjaanAyah', width: 20 },
      { header: 'No. Telp Ayah', key: 'noTelpAyah', width: 15 },
      { header: 'Nama Ibu', key: 'namaIbu', width: 25 },
      { header: 'NIK Ibu', key: 'nikIbu', width: 18 },
      { header: 'Pekerjaan Ibu', key: 'pekerjaanIbu', width: 20 },
      { header: 'No. Telp Ibu', key: 'noTelpIbu', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Aktif', key: 'isAktif', width: 10 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: item.nama || '-',
        nik: item.nik || '-',
        nis: item.nis || '-',
        nisn: item.nisn || '-',
        npsn: item.npsn || '-',
        jenisKelamin: item.jenisKelamin || '-',
        tempatLahir: item.tempatLahir || '-',
        tanggalLahir: this.formatDate(item.tanggalLahir),
        alamat: item.alamat || '-',
        kodePos: item.kodePos || '-',
        noKK: item.noKartuKeluarga || '-',
        sekolahAsal: item.sekolahAsal || '-',
        kelas: item.kelas?.replace('_', ' ') || '-',
        tingkatan: item.tingkatan || '-',
        namaAyah: item.namaAyah || '-',
        nikAyah: item.nikAyah || '-',
        pekerjaanAyah: item.pekerjaanAyah || '-',
        noTelpAyah: item.noTelpAyah || '-',
        namaIbu: item.namaIbu || '-',
        nikIbu: item.nikIbu || '-',
        pekerjaanIbu: item.pekerjaanIbu || '-',
        noTelpIbu: item.noTelpIbu || '-',
        status: item.status || '-',
        isAktif: item.isAktif ? 'Ya' : 'Tidak',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupNilai(): Promise<Buffer> {
    const data = await this.prisma.nilai.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: 'desc' }, { siswa: { nama: 'asc' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Nilai');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Mata Pelajaran', key: 'mataPelajaran', width: 35 },
      { header: 'Jenis Nilai', key: 'jenisNilai', width: 12 },
      { header: 'Nilai', key: 'nilai', width: 10 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Tahun Ajaran', key: 'tahunAjaran', width: 15 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        mataPelajaran: item.mataPelajaran || '-',
        jenisNilai: item.jenisNilai || '-',
        nilai: Number(item.nilai) || 0,
        semester: item.semester || '-',
        tahunAjaran: item.tahunAjaran || '-',
        tanggal: this.formatDateTime(item.tanggal),
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupAbsensi(): Promise<Buffer> {
    const data = await this.prisma.absensi.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: 'desc' }, { siswa: { nama: 'asc' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Absensi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Jenis Absensi', key: 'jenis', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        tanggal: this.formatDate(item.tanggal),
        jenis: item.jenis || '-',
        status: item.status || '-',
        keterangan: item.keterangan || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupPelanggaran(): Promise<Buffer> {
    const data = await this.prisma.pelanggaran.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { siswa: { nama: 'asc' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Pelanggaran');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Jenis Sanksi', key: 'sanksi', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 40 },
      { header: 'Bukti', key: 'evidence', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        sanksi: item.sanksi || '-',
        keterangan: item.keterangan || '-',
        evidence: item.evidence || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupKesehatan(): Promise<Buffer> {
    const data = await this.prisma.kesehatan.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: 'desc' }, { siswa: { nama: 'asc' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Kesehatan');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Jenis Asuransi', key: 'jenisAsuransi', width: 15 },
      { header: 'No. BPJS', key: 'noBpjs', width: 18 },
      { header: 'No. Asuransi', key: 'noAsuransi', width: 18 },
      { header: 'Riwayat Sakit', key: 'riwayatSakit', width: 40 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        jenisAsuransi: item.jenisAsuransi || '-',
        noBpjs: item.noBpjs || '-',
        noAsuransi: item.noAsuransi || '-',
        riwayatSakit: item.riwayatSakit || '-',
        tanggal: this.formatDateTime(item.tanggal),
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupKeuangan(): Promise<Buffer> {
    const pembayaran = await this.prisma.pembayaran.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggalPembayaran: 'desc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Pembayaran');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Total Infaq (Rp)', key: 'totalInfaq', width: 18 },
      { header: 'Total Laundry (Rp)', key: 'totalLaundry', width: 18 },
      { header: 'Tanggal Pembayaran', key: 'tanggalPembayaran', width: 20 },
      { header: 'Bukti', key: 'bukti', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    pembayaran.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        totalInfaq: this.formatCurrency(item.totalPembayaranInfaq),
        totalLaundry: this.formatCurrency(item.totalPembayaranLaundry),
        tanggalPembayaran: this.formatDate(item.tanggalPembayaran),
        bukti: item.buktiPembayaran || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    // Add pengeluaran sheet
    const pengeluaran = await this.prisma.pengeluaran.findMany({
      orderBy: [{ tanggalPengeluaran: 'desc' }],
    });

    const worksheetPengeluaran = workbook.addWorksheet('Data Pengeluaran');

    worksheetPengeluaran.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Jenis', key: 'jenis', width: 20 },
      { header: 'Harga (Rp)', key: 'harga', width: 18 },
      { header: 'Tanggal Pengeluaran', key: 'tanggalPengeluaran', width: 20 },
      { header: 'Bukti', key: 'bukti', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheetPengeluaran);

    pengeluaran.forEach((item, index) => {
      worksheetPengeluaran.addRow({
        no: index + 1,
        nama: item.nama || '-',
        jenis: item.jenis || '-',
        harga: this.formatCurrency(item.harga),
        tanggalPengeluaran: this.formatDate(item.tanggalPengeluaran),
        bukti: item.bukti || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    // Add donasi sheet
    const donasi = await this.prisma.donasi.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });

    const worksheetDonasi = workbook.addWorksheet('Data Donasi');

    worksheetDonasi.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Donatur', key: 'nama', width: 30 },
      { header: 'Jumlah Donasi (Rp)', key: 'jumlahDonasi', width: 20 },
      { header: 'Bukti', key: 'evidence', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheetDonasi);

    donasi.forEach((item, index) => {
      worksheetDonasi.addRow({
        no: index + 1,
        nama: item.nama || '-',
        jumlahDonasi: this.formatCurrency(item.jumlahDonasi),
        evidence: item.evidence || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupKoperasi(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Anggota
    const anggota = await this.prisma.anggotaKoperasi.findMany({
      orderBy: { nama: 'asc' },
    });

    const worksheetAnggota = workbook.addWorksheet('Data Anggota');

    worksheetAnggota.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'No. Telp', key: 'noTelp', width: 15 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheetAnggota);

    anggota.forEach((item, index) => {
      worksheetAnggota.addRow({
        no: index + 1,
        nama: item.nama || '-',
        alamat: item.alamat || '-',
        noTelp: item.noTelp || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    // Pemasukan
    const pemasukan = await this.prisma.pemasukanKoperasi.findMany({
      include: {
        anggota: {
          select: { nama: true },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    const worksheetPemasukan = workbook.addWorksheet('Data Pemasukan');

    worksheetPemasukan.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Anggota', key: 'namaAnggota', width: 30 },
      { header: 'Jenis', key: 'jenis', width: 20 },
      { header: 'Jumlah (Rp)', key: 'jumlah', width: 18 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
      { header: 'Bukti', key: 'bukti', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheetPemasukan);

    pemasukan.forEach((item, index) => {
      worksheetPemasukan.addRow({
        no: index + 1,
        namaAnggota: item.anggota?.nama || '-',
        jenis: item.jenis?.replace('_', ' ') || '-',
        jumlah: this.formatCurrency(item.jumlah),
        tanggal: this.formatDate(item.tanggal),
        keterangan: item.keterangan || '-',
        bukti: item.bukti || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    // Pengeluaran
    const pengeluaranKoperasi = await this.prisma.pengeluaranKoperasi.findMany({
      include: {
        anggota: {
          select: { nama: true },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    const worksheetPengeluaranKoperasi = workbook.addWorksheet('Data Pengeluaran');

    worksheetPengeluaranKoperasi.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Anggota', key: 'namaAnggota', width: 30 },
      { header: 'Jenis', key: 'jenis', width: 20 },
      { header: 'Jumlah (Rp)', key: 'jumlah', width: 18 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
      { header: 'Bukti', key: 'bukti', width: 30 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheetPengeluaranKoperasi);

    pengeluaranKoperasi.forEach((item, index) => {
      worksheetPengeluaranKoperasi.addRow({
        no: index + 1,
        namaAnggota: item.anggota?.nama || '-',
        jenis: item.jenis?.replace('_', ' ') || '-',
        jumlah: this.formatCurrency(item.jumlah),
        tanggal: this.formatDate(item.tanggal),
        keterangan: item.keterangan || '-',
        bukti: item.bukti || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupWaliKelas(): Promise<Buffer> {
    const data = await this.prisma.waliKelas.findMany({
      orderBy: { kelas: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Wali Kelas');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Guru', key: 'namaGuru', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'No. Telp', key: 'noTelp', width: 15 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaGuru: item.namaGuru || '-',
        kelas: item.kelas?.replace('_', ' ') || '-',
        noTelp: item.noTelp || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupTahfidz(): Promise<Buffer> {
    const data = await this.prisma.tahfidz.findMany({
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            tingkatan: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: 'desc' }, { siswa: { nama: 'asc' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Tahfidz');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'namaSantri', width: 30 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Juz Ke', key: 'juzKe', width: 10 },
      { header: 'Nilai', key: 'nilai', width: 10 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        namaSantri: item.siswa?.nama || '-',
        nisn: item.siswa?.nisn || '-',
        kelas: item.siswa?.kelas?.replace('_', ' ') || '-',
        tingkatan: item.siswa?.tingkatan || '-',
        juzKe: item.juzKe || 0,
        nilai: item.nilai ? Number(item.nilai) : '-',
        keterangan: item.keterangan || '-',
        tanggal: this.formatDateTime(item.tanggal),
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupUsers(): Promise<Buffer> {
    const data = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Users');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Nama', key: 'name', width: 25 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Dibuat', key: 'createdAt', width: 20 },
      { header: 'Diperbarui', key: 'updatedAt', width: 20 },
    ];

    this.styleHeader(worksheet);

    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        email: item.email || '-',
        name: item.name || '-',
        role: item.role || '-',
        status: item.status || '-',
        createdAt: this.formatDateTime(item.createdAt),
        updatedAt: this.formatDateTime(item.updatedAt),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async backupAll(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Siswa
    const siswa = await this.prisma.siswa.findMany({ orderBy: { nama: 'asc' } });
    const wsSiswa = workbook.addWorksheet('Santri');
    wsSiswa.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'NIK', key: 'nik', width: 18 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Tingkatan', key: 'tingkatan', width: 12 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
      { header: 'Aktif', key: 'isAktif', width: 10 },
    ];
    this.styleHeader(wsSiswa);
    siswa.forEach((item, i) => {
      wsSiswa.addRow({
        no: i + 1,
        nama: item.nama || '-',
        nik: item.nik || '-',
        nis: item.nis || '-',
        nisn: item.nisn || '-',
        kelas: item.kelas?.replace('_', ' ') || '-',
        tingkatan: item.tingkatan || '-',
        jenisKelamin: item.jenisKelamin || '-',
        isAktif: item.isAktif ? 'Ya' : 'Tidak',
      });
    });

    // Nilai
    const nilai = await this.prisma.nilai.findMany({
      include: { siswa: { select: { nama: true, nisn: true } } },
      orderBy: { tanggal: 'desc' },
    });
    const wsNilai = workbook.addWorksheet('Nilai');
    wsNilai.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'nama', width: 30 },
      { header: 'Mata Pelajaran', key: 'mapel', width: 35 },
      { header: 'Jenis', key: 'jenis', width: 12 },
      { header: 'Nilai', key: 'nilai', width: 10 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Tahun Ajaran', key: 'tahun', width: 15 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
    ];
    this.styleHeader(wsNilai);
    nilai.forEach((item, i) => {
      wsNilai.addRow({
        no: i + 1,
        nama: item.siswa?.nama || '-',
        mapel: item.mataPelajaran || '-',
        jenis: item.jenisNilai || '-',
        nilai: Number(item.nilai) || 0,
        semester: item.semester || '-',
        tahun: item.tahunAjaran || '-',
        tanggal: this.formatDateTime(item.tanggal),
      });
    });

    // Absensi
    const absensi = await this.prisma.absensi.findMany({
      include: { siswa: { select: { nama: true } } },
      orderBy: { tanggal: 'desc' },
    });
    const wsAbsensi = workbook.addWorksheet('Absensi');
    wsAbsensi.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Santri', key: 'nama', width: 30 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Jenis', key: 'jenis', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Keterangan', key: 'ket', width: 30 },
    ];
    this.styleHeader(wsAbsensi);
    absensi.forEach((item, i) => {
      wsAbsensi.addRow({
        no: i + 1,
        nama: item.siswa?.nama || '-',
        tanggal: this.formatDate(item.tanggal),
        jenis: item.jenis || '-',
        status: item.status || '-',
        ket: item.keterangan || '-',
      });
    });

    // Continue for other tables...
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
