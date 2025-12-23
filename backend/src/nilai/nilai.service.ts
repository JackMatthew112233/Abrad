import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import ExcelJS from 'exceljs';
import { StatusAbsensi } from '../generated/enums.js';

@Injectable()
export class NilaiService {
  constructor(private prisma: PrismaService) { }

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

  async getRaportPreview(
    siswaId: string,
    semester: string = 'Ganjil',
    tahunAjaran: string = '2024/2025',
  ) {
    // Validate/Parse tahunAjaran
    let startYear = 2024;
    let endYear = 2025;
    if (tahunAjaran && tahunAjaran.includes('/')) {
      const parts = tahunAjaran.split('/');
      startYear = parseInt(parts[0]) || 2024;
      endYear = parseInt(parts[1]) || 2025;
    }

    const startDateStr =
      semester === 'Ganjil' ? `${startYear}-07-01` : `${endYear}-01-01`;
    const endDateStr =
      semester === 'Ganjil' ? `${startYear}-12-31` : `${endYear}-06-30`;

    // 1. Fetch School Settings
    let sekolah = await this.prisma.sekolah.findFirst();
    if (!sekolah) {
      sekolah = {
        id: "",
        namaSekolah: "PONDOK PESANTREN DDI ABRAD",
        alamat: null,
        logoKiriUrl: null,
        logoKananUrl: null,
        headerText1: "LAPORAN HASIL BELAJAR",
        headerText2: "MARHALAH WUSTHA PONDOK PESANTREN DDI ABRAD",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // 2. Fetch Student Data
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        absensi: {
          where: {
            tanggal: {
              gte: new Date(startDateStr),
              lte: new Date(endDateStr),
            },
          },
        },
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    // 3. Fetch Wali Kelas
    let waliKelas: any = null;
    if (siswa.kelas) {
      waliKelas = await this.prisma.waliKelas.findUnique({
        where: {
          kelas: siswa.kelas,
        },
      });
    }

    // 4. Fetch Grades (UAS only)
    const allMapel = siswa.kelas ? await this.prisma.mataPelajaran.findMany({
      where: { kelas: siswa.kelas }
    }) : [];

    // Map key: nama -> { kategori, id }
    const mapelMap = new Map();
    allMapel.forEach(m => mapelMap.set(m.nama, { kategori: m.kategori, id: m.id }));

    const nilaiList = await this.prisma.nilai.findMany({
      where: {
        siswaId,
        jenisNilai: 'UAS',
        semester,
        tahunAjaran,
      },
    });

    // Group Grades
    const kepesantrenan: any[] = [];
    const kekhususan: any[] = [];
    const umum: any[] = []; // In case we have others

    for (const n of nilaiList) {
      const mapelData = mapelMap.get(n.mataPelajaran);
      const kategori = mapelData?.kategori || 'UMUM';
      const mapelId = mapelData?.id;

      const gradeItem = {
        ...n,
        nilai: Number(n.nilai),
        predikat: this.getPredikat(Number(n.nilai)),
        mapelId
      };

      if (kategori === 'KEPESANTRENAN') {
        kepesantrenan.push(gradeItem);
      } else if (kategori === 'KEKHUSUSAN') {
        kekhususan.push(gradeItem);
      } else {
        umum.push(gradeItem); // Default fallback
      }
    }

    // 5. Fetch Extracurriculars
    const nilaiEkstra = await this.prisma.nilaiEkstrakurikuler.findMany({
      where: {
        siswaId,
        semester,
        tahunAjaran,
      },
      include: {
        ekstrakurikuler: true,
      },
    });

    // 6. Calculate Attendance
    const absensiSummary = {
      SAKIT: 0,
      IZIN: 0,
      TIDAK_HADIR: 0,
    };

    if (siswa.absensi) {
      siswa.absensi.forEach((abs) => {
        if (absensiSummary[abs.status] !== undefined) {
          absensiSummary[abs.status]++;
        }
      });
    }

    return {
      siswa,
      sekolah,
      waliKelas: waliKelas ? waliKelas.namaGuru : '',
      nilai: {
        kepesantrenan,
        kekhususan,
        umum
      },
      ekstrakurikuler: nilaiEkstra.map(ne => ({
        nama: ne.ekstrakurikuler.nama,
        nilai: ne.nilai,
        keterangan: ne.ekstrakurikuler.keterangan
      })),
      absensi: absensiSummary,
      meta: {
        semester,
        tahunAjaran,
        tanggal: new Date().toISOString().split('T')[0] // Default date
      }
    };
  }

  async downloadRaport(
    siswaId: string,
    semester: string = 'Ganjil',
    tahunAjaran: string = '2024/2025',
  ) {
    // Validate/Parse tahunAjaran
    let startYear = 2024;
    let endYear = 2025;
    if (tahunAjaran && tahunAjaran.includes('/')) {
      const parts = tahunAjaran.split('/');
      startYear = parseInt(parts[0]) || 2024;
      endYear = parseInt(parts[1]) || 2025;
    }

    const startDateStr =
      semester === 'Ganjil' ? `${startYear}-07-01` : `${endYear}-01-01`;
    const endDateStr =
      semester === 'Ganjil' ? `${startYear}-12-31` : `${endYear}-06-30`;

    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        absensi: {
          where: {
            tanggal: {
              gte: new Date(startDateStr),
              lte: new Date(endDateStr),
            },
          },
        },
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    let waliKelas: any = null;
    if (siswa.kelas) {
      waliKelas = await this.prisma.waliKelas.findUnique({
        where: {
          kelas: siswa.kelas,
        },
      });
    }

    const nilaiList = await this.prisma.nilai.findMany({
      where: {
        siswaId,
        jenisNilai: 'UAS',
        semester,
        tahunAjaran,
      },
    });

    const nilaiEkstra = await this.prisma.nilaiEkstrakurikuler.findMany({
      where: {
        siswaId,
        semester,
        tahunAjaran,
      },
      include: {
        ekstrakurikuler: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raport');

    // Setup columns/metrics
    worksheet.columns = [
      { width: 5 }, // No
      { width: 35 }, // Bidang Studi
      { width: 10 }, // Nilai Angka
      { width: 10 }, // Nilai Predikat
    ];

    // --- Header ---
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'LAPORAN HASIL BELAJAR';
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A1').font = { bold: true };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = 'MARHALAH WUSTHA PONDOK PESANTREN DDI ABRAD';
    worksheet.getCell('A2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A2').font = { bold: true };

    // --- Student Info ---
    worksheet.getCell('A4').value = 'Nama Peserta Didik';
    worksheet.getCell('B4').value = `: ${siswa.nama}`;
    worksheet.getCell('C4').value = 'Kelas / Semester';
    worksheet.getCell('D4').value = `: ${siswa.kelas ? siswa.kelas.replace('_', ' ') : '-'
      } / ${semester}`;

    worksheet.getCell('A5').value = 'NISN/ NIS';
    worksheet.getCell('B5').value = `: ${siswa.nisn || '-'} / ${siswa.nis || '-'
      }`;
    worksheet.getCell('C5').value = 'Tahun Ajaran';
    worksheet.getCell('D5').value = `: ${tahunAjaran}`;

    // --- Table Header ---
    worksheet.mergeCells('A7:A8');
    worksheet.getCell('A7').value = 'NO.';
    worksheet.getCell('A7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('B7:B8');
    worksheet.getCell('B7').value = 'BIDANG STUDI';
    worksheet.getCell('B7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('B7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = 'NILAI';
    worksheet.getCell('C7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('C7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getCell('C8').value = 'ANGKA';
    worksheet.getCell('C8').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('C8').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getCell('D8').value = 'PREDIKAT';
    worksheet.getCell('D8').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('D8').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // --- Data ---
    const kepesantrenanSubjects = [
      'Ar-Risalah Al-Bahiyyah (Tauhid)',
      'Ad-Durus Al-Fiqhiyyah (Fiqh)',
      'An-Nukhbah Al-Mardhiyyah (Hadits)',
      'Al-Amsilah At-Tashrifiyah (Sharf)',
      'Tuntunan Tajwid',
      "Al-Ad'iya Al-Mabrurah (Do'a-do'a)",
      'Mursyid Ath-Thullab (Ushul Fiqh)',
      'Irsyad An-Nahidh (Faraidh)',
      'Tafsir Al-Munir (Tafsir)',
      'Irsyad Al-Salik (Nahwu)',
      'Ash-Shirah An-Nabawiyyah (Tarikh)',
      'Hilyah Asy-Syabab (Akhlaq)',
      "Risalah Rabbi Ij'alniy Muqiim Ash-Shalah (Fiqh Salat)",
      'Miftahul Fuhum (Ilmu Mantiq)',
      'Tamrin Ath-Thullab (Nahwu-Sharf)',
      'Sullam Al-Lughah (Bahasa Arab)',
      'Miftahul Mudzakarah',
      'Annamadzij Al jaliyyah',
    ];

    const kekhususanSubjects = [
      'Kemampuan Bahasa Arab',
      'Kemmapuan Bahasa Inggris',
      'Kemampuan Bahasa Daerah',
      'Ke-DDI-an',
      "Khat Imla'",
      "Qira'ah Al-Kutub",
    ];

    let currentRow = 9;

    // I. KEPESANTRENAN
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'I. KEPESANTRENAN';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    kepesantrenanSubjects.forEach((subject, index) => {
      const grade = nilaiList.find(
        (n) =>
          n.mataPelajaran.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(n.mataPelajaran.toLowerCase()),
      );
      this.addGradeRow(
        worksheet,
        currentRow,
        index + 1,
        subject,
        grade ? Number(grade.nilai) : 0,
      );
      currentRow++;
    });

    // II. Kekhususan
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'II. Kekhususan';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    kekhususanSubjects.forEach((subject, index) => {
      const grade = nilaiList.find(
        (n) =>
          n.mataPelajaran.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(n.mataPelajaran.toLowerCase()),
      );
      this.addGradeRow(
        worksheet,
        currentRow,
        index + 1,
        subject,
        grade ? Number(grade.nilai) : 0,
      );
      currentRow++;
    });

    currentRow += 1;

    // --- Ekstrakurikuler ---
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Ekstrakurikuler';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'No';
    worksheet.getCell(`B${currentRow}`).value = 'Kegiatan';
    worksheet.getCell(`C${currentRow}`).value = 'Nilai';
    worksheet.getCell(`D${currentRow}`).value = 'Keterangan';
    [
      `A${currentRow}`,
      `B${currentRow}`,
      `C${currentRow}`,
      `D${currentRow}`,
    ].forEach((cell) => {
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getCell(cell).alignment = { horizontal: 'center' };
      worksheet.getCell(cell).font = { bold: true };
    });
    currentRow++;

    if (nilaiEkstra.length > 0) {
      nilaiEkstra.forEach((ne, index) => {
        worksheet.getCell(`A${currentRow}`).value = index + 1;
        worksheet.getCell(`B${currentRow}`).value = ne.ekstrakurikuler.nama;
        worksheet.getCell(`C${currentRow}`).value = ne.nilai;
        worksheet.getCell(`D${currentRow}`).value = ne.ekstrakurikuler.keterangan || '-';

        [
          `A${currentRow}`,
          `B${currentRow}`,
          `C${currentRow}`,
          `D${currentRow}`,
        ].forEach((cell) => {
          worksheet.getCell(cell).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
        currentRow++;
      });
    } else {
      worksheet.getCell(`A${currentRow}`).value = 1;
      worksheet.getCell(`B${currentRow}`).value = '-';
      worksheet.getCell(`C${currentRow}`).value = '-';
      worksheet.getCell(`D${currentRow}`).value = '-';
      [
        `A${currentRow}`,
        `B${currentRow}`,
        `C${currentRow}`,
        `D${currentRow}`,
      ].forEach((cell) => {
        worksheet.getCell(cell).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
      currentRow++;
    }

    currentRow += 1;

    // --- Ketidakhadiran ---
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Ketidakhadiran';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    const absensiSummary = {
      SAKIT: 0,
      IZIN: 0,
      TIDAK_HADIR: 0,
    };

    if (siswa.absensi) {
      siswa.absensi.forEach((abs) => {
        if (absensiSummary[abs.status] !== undefined) {
          absensiSummary[abs.status]++;
        }
      });
    }

    worksheet.getCell(`A${currentRow}`).value = '1';
    worksheet.getCell(`B${currentRow}`).value = 'Sakit';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${absensiSummary.SAKIT} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = '2';
    worksheet.getCell(`B${currentRow}`).value = 'Izin';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${absensiSummary.IZIN} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = '3';
    worksheet.getCell(`B${currentRow}`).value = 'Tanpa Keterangan';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${absensiSummary.TIDAK_HADIR} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    currentRow += 2;

    // --- Signatures ---
    const today = new Date();
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const dateStr = `Makassar, ${today.getDate()} ${months[today.getMonth()]
      } ${today.getFullYear()}`;

    // Catatan & Tanggapan Boxes
    const boxStartRow = currentRow;
    worksheet.mergeCells(`A${boxStartRow}:B${boxStartRow + 4}`);
    worksheet.getCell(`A${boxStartRow}`).value = 'Catatan Wali Kelas:';
    worksheet.getCell(`A${boxStartRow}`).alignment = {
      vertical: 'top',
      horizontal: 'left',
    };
    worksheet.getCell(`A${boxStartRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`C${boxStartRow}:D${boxStartRow + 4}`);
    worksheet.getCell(`C${boxStartRow}`).value =
      'Tanggapan Orang Tua/Wali:';
    worksheet.getCell(`C${boxStartRow}`).alignment = {
      vertical: 'top',
      horizontal: 'left',
    };
    worksheet.getCell(`C${boxStartRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    currentRow += 6;

    // Signatures
    const ortuRow = currentRow;
    worksheet.getCell(`A${ortuRow}`).value = 'Orang Tua/ Wali Peserta Didik';
    worksheet.getCell(`A${ortuRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${ortuRow}:D${ortuRow}`);
    worksheet.getCell(`C${ortuRow}`).value = dateStr;
    worksheet.getCell(`C${ortuRow}`).alignment = { horizontal: 'center' };

    currentRow++;
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Wali Kelas';
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };

    currentRow += 4;

    const nameRow = currentRow;
    worksheet.getCell(`A${nameRow}`).value =
      '......................................................';
    worksheet.getCell(`A${nameRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${nameRow}:D${nameRow}`);
    worksheet.getCell(`C${nameRow}`).value = waliKelas
      ? waliKelas.nama
      : '......................................................';
    worksheet.getCell(`C${nameRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`C${nameRow}`).font = { bold: !!waliKelas, underline: true };

    currentRow += 2;

    const headRow = currentRow;
    worksheet.mergeCells(`A${headRow}:D${headRow}`);
    worksheet.getCell(`A${headRow}`).value = 'Mengetahui,';
    worksheet.getCell(`A${headRow}`).alignment = { horizontal: 'center' };

    currentRow++;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "Kepala Mar'halah Wustha/Ulya";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    currentRow += 4;

    const headNameRow = currentRow;
    worksheet.mergeCells(`A${headNameRow}:D${headNameRow}`);
    worksheet.getCell(`A${headNameRow}`).value =
      '......................................................';
    worksheet.getCell(`A${headNameRow}`).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }


  async generateRaportFromData(data: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raport');

    // Setup columns/metrics
    worksheet.columns = [
      { width: 5 }, // No
      { width: 35 }, // Bidang Studi
      { width: 10 }, // Nilai Angka
      { width: 10 }, // Nilai Predikat
    ];

    // --- Header ---
    // Use School settings from data if available
    const header1 = data.sekolah?.headerText1 || 'LAPORAN HASIL BELAJAR';
    const header2 = data.sekolah?.headerText2 || 'MARHALAH WUSTHA PONDOK PESANTREN DDI ABRAD';

    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = header1;
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A1').font = { bold: true };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = header2;
    worksheet.getCell('A2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A2').font = { bold: true };

    // --- Student Info ---
    worksheet.getCell('A4').value = 'Nama Peserta Didik';
    worksheet.getCell('B4').value = `: ${data.siswa.nama}`;
    worksheet.getCell('C4').value = 'Kelas / Semester';
    worksheet.getCell('D4').value = `: ${data.siswa.kelas ? data.siswa.kelas.replace('_', ' ') : '-'
      } / ${data.meta.semester}`;

    worksheet.getCell('A5').value = 'NISN/ NIS';
    worksheet.getCell('B5').value = `: ${data.siswa.nisn || '-'} / ${data.siswa.nis || '-'
      }`;
    worksheet.getCell('C5').value = 'Tahun Ajaran';
    worksheet.getCell('D5').value = `: ${data.meta.tahunAjaran}`;

    // --- Table Header ---
    worksheet.mergeCells('A7:A8');
    worksheet.getCell('A7').value = 'NO.';
    worksheet.getCell('A7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('A7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('B7:B8');
    worksheet.getCell('B7').value = 'BIDANG STUDI';
    worksheet.getCell('B7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('B7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = 'NILAI';
    worksheet.getCell('C7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('C7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getCell('C8').value = 'ANGKA';
    worksheet.getCell('C8').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('C8').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getCell('D8').value = 'PREDIKAT';
    worksheet.getCell('D8').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('D8').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    let currentRow = 9;

    // I. KEPESANTRENAN
    if (data.nilai.kepesantrenan && data.nilai.kepesantrenan.length > 0) {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'I. KEPESANTRENAN';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      data.nilai.kepesantrenan.forEach((item: any, index: number) => {
        this.addGradeRow(
          worksheet,
          currentRow,
          index + 1,
          item.mataPelajaran,
          Number(item.nilai),
        );
        currentRow++;
      });
    }

    // II. KEKHUSUSAN
    if (data.nilai.kekhususan && data.nilai.kekhususan.length > 0) {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'II. KEKHUSUSAN';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      data.nilai.kekhususan.forEach((item: any, index: number) => {
        this.addGradeRow(
          worksheet,
          currentRow,
          index + 1,
          item.mataPelajaran,
          Number(item.nilai),
        );
        currentRow++;
      });
    }

    // III. UMUM (If any)
    if (data.nilai.umum && data.nilai.umum.length > 0) {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'III. UMUM';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      data.nilai.umum.forEach((item: any, index: number) => {
        this.addGradeRow(
          worksheet,
          currentRow,
          index + 1,
          item.mataPelajaran,
          Number(item.nilai),
        );
        currentRow++;
      });
    }

    currentRow += 1;

    // --- Ekstrakurikuler ---
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Ekstrakurikuler';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'No';
    worksheet.getCell(`B${currentRow}`).value = 'Kegiatan';
    worksheet.getCell(`C${currentRow}`).value = 'Nilai';
    worksheet.getCell(`D${currentRow}`).value = 'Keterangan';
    [
      `A${currentRow}`,
      `B${currentRow}`,
      `C${currentRow}`,
      `D${currentRow}`,
    ].forEach((cell) => {
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getCell(cell).alignment = { horizontal: 'center' };
      worksheet.getCell(cell).font = { bold: true };
    });
    currentRow++;

    if (data.ekstrakurikuler && data.ekstrakurikuler.length > 0) {
      data.ekstrakurikuler.forEach((ne: any, index: number) => {
        worksheet.getCell(`A${currentRow}`).value = index + 1;
        worksheet.getCell(`B${currentRow}`).value = ne.nama;
        worksheet.getCell(`C${currentRow}`).value = ne.nilai;
        worksheet.getCell(`D${currentRow}`).value = ne.keterangan || '-';

        [
          `A${currentRow}`,
          `B${currentRow}`,
          `C${currentRow}`,
          `D${currentRow}`,
        ].forEach((cell) => {
          worksheet.getCell(cell).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
        currentRow++;
      });
    } else {
      // Placeholder
      worksheet.getCell(`A${currentRow}`).value = 1;
      worksheet.getCell(`B${currentRow}`).value = '-';
      worksheet.getCell(`C${currentRow}`).value = '-';
      worksheet.getCell(`D${currentRow}`).value = '-';
      [
        `A${currentRow}`,
        `B${currentRow}`,
        `C${currentRow}`,
        `D${currentRow}`,
      ].forEach((cell) => {
        worksheet.getCell(cell).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
      currentRow++;
    }

    currentRow += 1;

    // --- Prestasi (New Section) ---
    if (data.prestasi && data.prestasi.length > 0) {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'Prestasi';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      worksheet.getCell(`A${currentRow}`).value = 'No';
      worksheet.getCell(`B${currentRow}`).value = 'Kegiatan / Prestasi';
      worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = 'Keterangan';

      [
        `A${currentRow}`,
        `B${currentRow}`,
        `C${currentRow}`,
        `D${currentRow}`,
      ].forEach((cell) => {
        worksheet.getCell(cell).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        worksheet.getCell(cell).alignment = { horizontal: 'center' };
        worksheet.getCell(cell).font = { bold: true };
      });
      currentRow++;

      data.prestasi.forEach((p: any, index: number) => {
        worksheet.getCell(`A${currentRow}`).value = index + 1;
        worksheet.getCell(`B${currentRow}`).value = p.nama;
        worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
        worksheet.getCell(`C${currentRow}`).value = p.keterangan;

        [
          `A${currentRow}`,
          `B${currentRow}`,
          `C${currentRow}`,
          `D${currentRow}`,
        ].forEach((cell) => {
          worksheet.getCell(cell).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
        currentRow++;
      });
      currentRow++;
    }


    // --- Ketidakhadiran ---
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Ketidakhadiran';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = '1';
    worksheet.getCell(`B${currentRow}`).value = 'Sakit';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${data.absensi?.SAKIT || 0} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = '2';
    worksheet.getCell(`B${currentRow}`).value = 'Izin';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${data.absensi?.IZIN || 0} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = '3';
    worksheet.getCell(`B${currentRow}`).value = 'Tanpa Keterangan';
    worksheet.getCell(`C${currentRow}`).value = ':';
    worksheet.getCell(`D${currentRow}`).value = `${data.absensi?.TIDAK_HADIR || 0} Hari`;
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    currentRow += 2;

    // --- Signatures ---
    // Date
    let dateStr = "";
    if (data.meta.tanggal) {
      const d = new Date(data.meta.tanggal);
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      dateStr = `Makassar, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } else {
      const today = new Date();
      const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      dateStr = `Makassar, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    }

    // Catatan & Tanggapan Boxes
    const boxStartRow = currentRow;
    worksheet.mergeCells(`A${boxStartRow}:B${boxStartRow + 4}`);
    worksheet.getCell(`A${boxStartRow}`).value = `Catatan Wali Kelas:\n${data.catatanWaliKelas || ''}`;
    worksheet.getCell(`A${boxStartRow}`).alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true
    };
    worksheet.getCell(`A${boxStartRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells(`C${boxStartRow}:D${boxStartRow + 4}`);
    worksheet.getCell(`C${boxStartRow}`).value = `Tanggapan Orang Tua/Wali:\n${data.tanggapanOrangTua || ''}`;
    worksheet.getCell(`C${boxStartRow}`).alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true
    };
    worksheet.getCell(`C${boxStartRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    currentRow += 6;

    // Signatures
    const ortuRow = currentRow;
    worksheet.getCell(`A${ortuRow}`).value = 'Orang Tua/ Wali Peserta Didik';
    worksheet.getCell(`A${ortuRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${ortuRow}:D${ortuRow}`);
    worksheet.getCell(`C${ortuRow}`).value = dateStr;
    worksheet.getCell(`C${ortuRow}`).alignment = { horizontal: 'center' };

    currentRow++;
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Wali Kelas';
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };

    currentRow += 4;

    const nameRow = currentRow;
    worksheet.getCell(`A${nameRow}`).value = data.namaOrangTua || '......................................................';
    worksheet.getCell(`A${nameRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`C${nameRow}:D${nameRow}`);
    worksheet.getCell(`C${nameRow}`).value = data.waliKelas || '......................................................';
    worksheet.getCell(`C${nameRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`C${nameRow}`).font = { bold: !!data.waliKelas, underline: true };

    currentRow += 2;

    const headRow = currentRow;
    worksheet.mergeCells(`A${headRow}:D${headRow}`);
    worksheet.getCell(`A${headRow}`).value = 'Mengetahui,';
    worksheet.getCell(`A${headRow}`).alignment = { horizontal: 'center' };

    currentRow++;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = data.sekolah?.headmasterTitle || "Kepala Mar'halah Wustha/Ulya";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };

    currentRow += 4;

    const headNameRow = currentRow;
    worksheet.mergeCells(`A${headNameRow}:D${headNameRow}`);
    worksheet.getCell(`A${headNameRow}`).value = data.namaKepalaSekolah || '......................................................';
    worksheet.getCell(`A${headNameRow}`).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  private addGradeRow(
    worksheet: ExcelJS.Worksheet,
    row: number,
    no: number,
    subject: string,
    score: number,
  ) {
    worksheet.getCell(`A${row}`).value = no;
    worksheet.getCell(`B${row}`).value = subject;
    worksheet.getCell(`C${row}`).value = score !== 0 ? score : '';
    worksheet.getCell(`D${row}`).value = score !== 0 ? this.getPredikat(score) : '';

    [
      `A${row}`,
      `B${row}`,
      `C${row}`,
      `D${row}`,
    ].forEach((cell) => {
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`C${row}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`D${row}`).alignment = { horizontal: 'center' };
  }

  private getPredikat(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }
}
