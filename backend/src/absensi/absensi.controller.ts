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
  ) {
    return this.absensiService.getAbsensiBySiswa(siswaId, startDate, endDate);
  }

  @Get('statistik')
  async getStatistikAbsensi(
    @Query('jenis') jenis?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.absensiService.getStatistikAbsensi(jenis, startDate, endDate);
  }

  @Get('statistik-per-siswa')
  async getStatistikPerSiswa(
    @Query('jenis') jenis?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.absensiService.getStatistikAbsensiPerSiswa(jenis, pageNum, limitNum);
  }

  @Get('today')
  async getAllSiswaWithTodayAbsensi() {
    return this.absensiService.getAllSiswaWithTodayAbsensi();
  }

  @Get('trend-bulanan')
  async getTrendBulanan() {
    return this.absensiService.getTrendBulanan();
  }

  @Get('distribusi-harian')
  async getDistribusiHarian() {
    return this.absensiService.getDistribusiHarian();
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
}
