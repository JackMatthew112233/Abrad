import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PelanggaranService } from './pelanggaran.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('pelanggaran')
@UseGuards(JwtAuthGuard)
export class PelanggaranController {
  constructor(private readonly pelanggaranService: PelanggaranService) {}

  @Post()
  @UseInterceptors(FileInterceptor('evidence'))
  async createPelanggaran(
    @Body()
    body: {
      siswaId: string;
      sanksi: string;
      keterangan: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.pelanggaranService.createPelanggaran(body, file);
  }

  @Get('by-siswa')
  async getPelanggaranBySiswaList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.pelanggaranService.getPelanggaranBySiswaList(pageNum, limitNum);
  }

  @Get('statistik')
  async getStatistikPelanggaran() {
    return this.pelanggaranService.getStatistikPelanggaran();
  }

  @Get('terbaru')
  async getPelanggaranTerbaru(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.pelanggaranService.getPelanggaranTerbaru(limitNum);
  }

  @Get('export')
  async exportPelanggaran(
    @Res() res: Response,
    @Query('siswaId') siswaId?: string,
  ) {
    const buffer = await this.pelanggaranService.exportPelanggaranToExcel(siswaId);

    // Generate filename based on filter
    let filename = 'Riwayat_Pelanggaran';
    if (siswaId) {
      const siswa = await this.pelanggaranService.getSiswaById(siswaId);
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

  @Get()
  async getAllPelanggaran(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sanksi') sanksi?: string,
    @Query('siswaId') siswaId?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.pelanggaranService.getAllPelanggaran(pageNum, limitNum, sanksi, siswaId);
  }

  @Get('siswa/:siswaId')
  async getPelanggaranBySiswa(@Param('siswaId') siswaId: string) {
    return this.pelanggaranService.getPelanggaranBySiswa(siswaId);
  }

  @Get(':id')
  async getPelanggaranById(@Param('id') id: string) {
    return this.pelanggaranService.getPelanggaranById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('evidence'))
  async updatePelanggaran(
    @Param('id') id: string,
    @Body()
    body: {
      sanksi: string;
      keterangan: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.pelanggaranService.updatePelanggaran(id, body, file);
  }

  @Delete(':id')
  async deletePelanggaran(@Param('id') id: string) {
    return this.pelanggaranService.deletePelanggaran(id);
  }
}
