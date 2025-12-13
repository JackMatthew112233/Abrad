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
import { NilaiService } from './nilai.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('nilai')
@UseGuards(JwtAuthGuard)
export class NilaiController {
  constructor(private readonly nilaiService: NilaiService) {}

  @Get('by-siswa')
  async getNilaiBySiswaList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('tingkatan') tingkatan?: string,
    @Query('kelas') kelas?: string,
  ) {
    return this.nilaiService.getNilaiBySiswaList(
      parseInt(page),
      parseInt(limit),
      search,
      tingkatan,
      kelas,
    );
  }

  @Get('statistik')
  async getStatistikNilai() {
    return this.nilaiService.getStatistikNilai();
  }

  @Get('terbaru')
  async getNilaiTerbaru() {
    return this.nilaiService.getNilaiTerbaru();
  }

  @Get()
  async getAllNilai(
    @Query('siswaId') siswaId?: string,
    @Query('mataPelajaran') mataPelajaran?: string,
    @Query('semester') semester?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.nilaiService.getAllNilai(
      siswaId,
      mataPelajaran,
      semester,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async getNilaiById(@Param('id') id: string) {
    return this.nilaiService.getNilaiById(id);
  }

  @Post()
  async createNilai(@Body() data: any) {
    return this.nilaiService.createNilai(data);
  }

  @Put(':id')
  async updateNilai(@Param('id') id: string, @Body() data: any) {
    return this.nilaiService.updateNilai(id, data);
  }

  @Delete(':id')
  async deleteNilai(@Param('id') id: string) {
    return this.nilaiService.deleteNilai(id);
  }
}
