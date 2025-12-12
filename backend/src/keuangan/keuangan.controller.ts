import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KeuanganService } from './keuangan.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('keuangan')
@UseGuards(JwtAuthGuard)
export class KeuanganController {
  constructor(private readonly keuanganService: KeuanganService) {}

  @Post('biodata')
  async createBiodataKeuangan(
    @Body()
    body: {
      siswaId: string;
      komitmenInfaqLaundry: number;
      infaq: number;
      laundry: number;
    },
  ) {
    return this.keuanganService.createBiodataKeuangan(body);
  }

  @Get('biodata/:id')
  async getBiodataKeuanganById(@Param('id') id: string) {
    return this.keuanganService.getBiodataKeuanganById(id);
  }

  @Get('biodata')
  async getAllBiodataKeuangan(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.keuanganService.getAllBiodataKeuangan(pageNum, limitNum);
  }

  @Put('biodata/:id')
  async updateBiodataKeuangan(
    @Param('id') id: string,
    @Body()
    body: {
      komitmenInfaqLaundry: number;
      infaq: number;
      laundry: number;
    },
  ) {
    return this.keuanganService.updateBiodataKeuangan(id, body);
  }

  @Delete('biodata/:id')
  async deleteBiodataKeuangan(@Param('id') id: string) {
    return this.keuanganService.deleteBiodataKeuangan(id);
  }

  @Get('statistik')
  async getStatistikKeuangan() {
    return this.keuanganService.getStatistikKeuangan();
  }

  @Get('chart-pembayaran')
  async getChartPembayaran() {
    return this.keuanganService.getChartPembayaran();
  }

  @Get('chart-distribusi')
  async getChartDistribusi() {
    return this.keuanganService.getChartDistribusi();
  }

  @Post('pembayaran')
  @UseInterceptors(FileInterceptor('buktiPembayaran'))
  async createPembayaran(
    @Body()
    body: {
      siswaId: string;
      totalPembayaranInfaq: string;
      totalPembayaranLaundry: string;
    },
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Bukti pembayaran wajib diupload');
    }

    return this.keuanganService.createPembayaran(
      {
        siswaId: body.siswaId,
        totalPembayaranInfaq: parseFloat(body.totalPembayaranInfaq),
        totalPembayaranLaundry: parseFloat(body.totalPembayaranLaundry),
      },
      file,
    );
  }

  @Get('pembayaran')
  async getAllPembayaran() {
    return this.keuanganService.getAllPembayaran();
  }

  @Get('search-siswa')
  async searchSiswa(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return this.keuanganService.searchSiswa(query);
  }
}
