import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AbsensiService } from './absensi.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('absensi')
@UseGuards(JwtAuthGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post()
  async createAbsensi(
    @Body()
    body: {
      siswaId: string;
      tanggal: string;
      jenis: string;
      status: string;
      keterangan?: string;
    },
  ) {
    return this.absensiService.createAbsensi(body);
  }

  @Post('bulk')
  async createBulkAbsensi(
    @Body()
    body: {
      tanggal: string;
      jenis: string;
      absensiList: Array<{
        siswaId: string;
        status: string;
        keterangan?: string;
      }>;
    },
  ) {
    return this.absensiService.createBulkAbsensi(body);
  }

  @Get('date/:tanggal')
  async getAbsensiByDate(@Param('tanggal') tanggal: string) {
    return this.absensiService.getAbsensiByDate(tanggal);
  }

  @Get('siswa/:siswaId')
  async getAbsensiBySiswa(
    @Param('siswaId') siswaId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('jenis') jenis?: string,
  ) {
    return this.absensiService.getAbsensiBySiswa(siswaId, startDate, endDate, jenis);
  }

  @Get('statistik')
  async getStatistikAbsensi(
    @Query('jenis') jenis?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('periode') periode?: string,
  ) {
    // Convert periode to date range
    const dateRange = this.getDateRangeFromPeriode(periode, startDate, endDate);
    return this.absensiService.getStatistikAbsensi(jenis, dateRange.startDate, dateRange.endDate);
  }

  @Get('statistik-per-siswa')
  async getStatistikPerSiswa(
    @Query('jenis') jenis?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('periode') periode?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const dateRange = this.getDateRangeFromPeriode(periode);
    return this.absensiService.getStatistikAbsensiPerSiswa(jenis, pageNum, limitNum, dateRange.startDate, dateRange.endDate);
  }

  @Get('today')
  async getAllSiswaWithTodayAbsensi(
    @Query('kelas') kelas?: string,
    @Query('tingkatan') tingkatan?: string,
    @Query('jenis') jenis?: string,
  ) {
    return this.absensiService.getAllSiswaWithTodayAbsensi(kelas, tingkatan, jenis);
  }

  @Get('trend-bulanan')
  async getTrendBulanan(@Query('jenis') jenis?: string) {
    return this.absensiService.getTrendBulanan(jenis);
  }

  @Get('distribusi-harian')
  async getDistribusiHarian(@Query('jenis') jenis?: string) {
    return this.absensiService.getDistribusiHarian(jenis);
  }

  @Get('export')
  async exportAbsensi(
    @Query('bulan') bulan: string,
    @Query('tahun') tahun: string,
    @Query('kelas') kelas: string,
    @Query('tingkatan') tingkatan: string,
    @Res() res: Response,
  ) {
    const buffer = await this.absensiService.exportAbsensiToExcel(
      bulan,
      tahun,
      kelas,
      tingkatan,
    );

    const kelasName = kelas.replace('_', ' ');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Absensi_${kelasName}_${tingkatan}_${bulan}_${tahun}.xlsx`,
    );

    res.send(buffer);
  }

  // Helper method to convert periode to date range
  private getDateRangeFromPeriode(
    periode?: string,
    startDate?: string,
    endDate?: string,
  ): { startDate?: string; endDate?: string } {
    if (startDate || endDate) {
      return { startDate, endDate };
    }

    if (!periode || periode === 'semua') {
      return {};
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (periode === 'hari-ini') {
      const todayStr = today.toISOString().split('T')[0];
      return { startDate: todayStr, endDate: todayStr };
    }

    if (periode === 'minggu-ini') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
      };
    }

    return {};
  }
}
