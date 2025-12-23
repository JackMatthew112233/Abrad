import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GuruService } from './guru.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('guru')
@UseGuards(JwtAuthGuard)
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isAktif') isAktif?: string,
  ) {
    return this.guruService.getAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      isAktif: isAktif ? isAktif === 'true' : undefined,
    });
  }

  @Get('statistik')
  async getStatistik() {
    return this.guruService.getStatistik();
  }

  @Get('absensi')
  async getAbsensiGuru(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.guruService.getAbsensiGuru({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      tanggal,
    });
  }

  @Get('absensi/statistik')
  async getStatistikAbsensiGuru(
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    return this.guruService.getStatistikAbsensiGuru({
      bulan: bulan ? parseInt(bulan) : undefined,
      tahun: tahun ? parseInt(tahun) : undefined,
    });
  }

  @Get('absensi/rekap')
  async getRekapAbsensiGuru(
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.guruService.getRekapAbsensiGuru({
      bulan: bulan ? parseInt(bulan) : undefined,
      tahun: tahun ? parseInt(tahun) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('absensi/tanggal/:tanggal')
  async getAbsensiGuruByTanggal(@Param('tanggal') tanggal: string) {
    return this.guruService.getAbsensiGuruByTanggal(tanggal);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.guruService.getById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      nama: string;
      nip?: string;
      tempatLahir?: string;
      tanggalLahir?: string;
      jenisKelamin?: string;
      alamat?: string;
      noTelp?: string;
      email?: string;
      jabatan?: string;
      mataPelajaran?: string;
      isAktif?: boolean;
    },
  ) {
    return this.guruService.create(body);
  }

  @Post('absensi')
  async createAbsensiGuru(
    @Body()
    body: {
      guruId: string;
      tanggal: string;
      status: string;
      keterangan?: string;
    },
  ) {
    return this.guruService.createOrUpdateAbsensiGuru(body);
  }

  @Post('absensi/bulk')
  async bulkCreateAbsensiGuru(
    @Body()
    body: {
      tanggal: string;
      absensi: Array<{
        guruId: string;
        status: string;
        keterangan?: string;
      }>;
    },
  ) {
    return this.guruService.bulkCreateAbsensiGuru(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      nama?: string;
      nip?: string;
      tempatLahir?: string;
      tanggalLahir?: string;
      jenisKelamin?: string;
      alamat?: string;
      noTelp?: string;
      email?: string;
      jabatan?: string;
      mataPelajaran?: string;
      isAktif?: boolean;
    },
  ) {
    return this.guruService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.guruService.delete(id);
  }
}
