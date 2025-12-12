import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SiswaService } from './siswa.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('siswa')
@UseGuards(JwtAuthGuard)
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Get()
  async getAllSiswa(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.siswaService.getAllSiswa(pageNum, limitNum);
  }

  @Get('statistik')
  async getStatistik() {
    return this.siswaService.getStatistik();
  }

  @Get('export')
  async exportSiswa(
    @Res() res: Response,
    @Query('kelas') kelas?: string,
    @Query('tingkatan') tingkatan?: string,
  ) {
    const buffer = await this.siswaService.exportSiswaToExcel(kelas, tingkatan);

    // Generate filename based on filters
    let filename = 'Biodata';
    if (!kelas && !tingkatan) {
      filename += '_Semua_Santri';
    } else if (!kelas) {
      filename += `_Semua_Kelas_${tingkatan}`;
    } else if (!tingkatan) {
      const kelasName = kelas.replace('_', ' ');
      filename += `_${kelasName}_Semua_Tingkatan`;
    } else {
      const kelasName = kelas.replace('_', ' ');
      filename += `_${kelasName}_${tingkatan}`;
    }
    filename += '.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}`,
    );

    res.send(buffer);
  }

  @Get(':id')
  async getSiswaById(@Param('id') id: string) {
    return this.siswaService.getSiswaById(id);
  }

  @Post()
  async createSiswa(@Body() data: any) {
    return this.siswaService.createSiswa(data);
  }

  @Put(':id')
  async updateSiswa(@Param('id') id: string, @Body() data: any) {
    return this.siswaService.updateSiswa(id, data);
  }

  @Delete(':id')
  async deleteSiswa(@Param('id') id: string) {
    return this.siswaService.deleteSiswa(id);
  }
}
