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
import { TahfidzService } from './tahfidz.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('tahfidz')
@UseGuards(JwtAuthGuard)
export class TahfidzController {
  constructor(private readonly tahfidzService: TahfidzService) {}

  @Post()
  async createTahfidz(
    @Body()
    body: {
      siswaId: string;
      juzKe: number;
      nilai?: number;
      keterangan?: string;
      tanggal: string;
    },
  ) {
    return this.tahfidzService.createTahfidz(body);
  }

  @Get('by-siswa')
  async getTahfidzBySiswaList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.tahfidzService.getTahfidzBySiswaList(pageNum, limitNum);
  }

  @Get('statistik')
  async getStatistikTahfidz() {
    return this.tahfidzService.getStatistikTahfidz();
  }

  @Get('terbaru')
  async getTahfidzTerbaru(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.tahfidzService.getTahfidzTerbaru(limitNum);
  }

  @Get()
  async getAllTahfidz(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('siswaId') siswaId?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.tahfidzService.getAllTahfidz(pageNum, limitNum, siswaId);
  }

  @Get(':id')
  async getTahfidzById(@Param('id') id: string) {
    return this.tahfidzService.getTahfidzById(id);
  }

  @Put(':id')
  async updateTahfidz(
    @Param('id') id: string,
    @Body()
    body: {
      juzKe?: number;
      nilai?: number;
      keterangan?: string;
      tanggal?: string;
    },
  ) {
    return this.tahfidzService.updateTahfidz(id, body);
  }

  @Delete(':id')
  async deleteTahfidz(@Param('id') id: string) {
    return this.tahfidzService.deleteTahfidz(id);
  }
}
