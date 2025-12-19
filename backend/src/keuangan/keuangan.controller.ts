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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('chart-target-realisasi')
  async getChartTargetRealisasi() {
    return this.keuanganService.getChartTargetRealisasi();
  }

  @Get('chart-distribusi')
  async getChartDistribusi(@Query('filter') filter?: string) {
    return this.keuanganService.getChartDistribusi(filter);
  }

  @Post('pembayaran')
  @UseInterceptors(FileInterceptor('buktiPembayaran'))
  async createPembayaran(
    @Body()
    body: {
      siswaId: string;
      totalPembayaranInfaq: string;
      totalPembayaranLaundry: string;
      tanggalPembayaran: string;
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
        tanggalPembayaran: body.tanggalPembayaran,
      },
      file,
    );
  }

  @Get('pembayaran')
  async getAllPembayaran() {
    return this.keuanganService.getAllPembayaran();
  }

  @Get('pembayaran-all')
  async getAllPembayaranWithPagination(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.keuanganService.getAllPembayaranWithPagination(pageNum, limitNum);
  }

  @Get('pembayaran-terbaru')
  async getPembayaranTerbaru(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.keuanganService.getPembayaranTerbaru(limitNum);
  }

  @Get('pembayaran/siswa/:siswaId')
  async getPembayaranBySiswa(
    @Param('siswaId') siswaId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 12;
    return this.keuanganService.getPembayaranBySiswa(siswaId, pageNum, limitNum);
  }

  @Put('pembayaran/:id')
  @UseInterceptors(FileInterceptor('buktiPembayaran'))
  async updatePembayaran(
    @Param('id') id: string,
    @Body()
    body: {
      totalPembayaranInfaq: string;
      totalPembayaranLaundry: string;
      tanggalPembayaran: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.keuanganService.updatePembayaran(
      id,
      {
        totalPembayaranInfaq: parseFloat(body.totalPembayaranInfaq),
        totalPembayaranLaundry: parseFloat(body.totalPembayaranLaundry),
        tanggalPembayaran: body.tanggalPembayaran,
      },
      file,
    );
  }

  @Delete('pembayaran/:id')
  async deletePembayaran(@Param('id') id: string) {
    return this.keuanganService.deletePembayaran(id);
  }

  @Get('search-siswa')
  async searchSiswa(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return this.keuanganService.searchSiswa(query);
  }

  @Get('pembayaran/export')
  async exportPembayaran(
    @Res() res: Response,
    @Query('siswaId') siswaId?: string,
  ) {
    const buffer = await this.keuanganService.exportPembayaranToExcel(siswaId);

    // Generate filename based on filter
    let filename = 'Riwayat_Pembayaran';
    if (siswaId) {
      const siswa = await this.keuanganService.getSiswaById(siswaId);
      if (siswa?.nama) {
        filename += `_${siswa.nama.replace(/\s+/g, '_')}`;
      }
    } else {
      filename += '_Semua_Santri';
    }
    filename += '.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
