import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { KesehatanService } from './kesehatan.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('kesehatan')
@UseGuards(JwtAuthGuard)
export class KesehatanController {
  constructor(private readonly kesehatanService: KesehatanService) {}

  @Post()
  async createKesehatan(
    @Body()
    body: {
      siswaId: string;
      jenisAsuransi?: 'BPJS' | 'NON_BPJS';
      noBpjs?: string;
      noAsuransi?: string;
      riwayatSakit: string;
      tanggal: string;
    },
  ) {
    return this.kesehatanService.createKesehatan(body);
  }

  @Get('by-siswa')
  async getKesehatanBySiswaList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.kesehatanService.getKesehatanBySiswaList(pageNum, limitNum);
  }

  @Get('statistik')
  async getStatistikKesehatan() {
    return this.kesehatanService.getStatistikKesehatan();
  }

  @Get('terbaru')
  async getKesehatanTerbaru(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.kesehatanService.getKesehatanTerbaru(limitNum);
  }

  @Get()
  async getAllKesehatan(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('siswaId') siswaId?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.kesehatanService.getAllKesehatan(pageNum, limitNum, siswaId);
  }

  @Get(':id')
  async getKesehatanById(@Param('id') id: string) {
    return this.kesehatanService.getKesehatanById(id);
  }

  @Put(':id')
  async updateKesehatan(
    @Param('id') id: string,
    @Body()
    body: {
      jenisAsuransi?: 'BPJS' | 'NON_BPJS';
      noBpjs?: string;
      noAsuransi?: string;
      riwayatSakit: string;
      tanggal: string;
    },
  ) {
    return this.kesehatanService.updateKesehatan(id, body);
  }

  @Delete(':id')
  async deleteKesehatan(@Param('id') id: string) {
    return this.kesehatanService.deleteKesehatan(id);
  }
}
