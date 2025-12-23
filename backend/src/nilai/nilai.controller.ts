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
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { NilaiService } from './nilai.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { uploadToSupabase } from '../utils/supabase-upload.util.js';

@Controller('nilai')
@UseGuards(JwtAuthGuard)
export class NilaiController {
  constructor(private readonly nilaiService: NilaiService) { }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const result = await uploadToSupabase(file.buffer, file.originalname, 'Evidence');
    return { url: result.url };
  }

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

  @Get('raport/preview/:siswaId')
  async getRaportPreview(
    @Param('siswaId') siswaId: string,
    @Query('semester') semester: string,
    @Query('tahunAjaran') tahunAjaran: string,
  ) {
    return this.nilaiService.getRaportPreview(siswaId, semester, tahunAjaran);
  }

  @Get('raport/:siswaId')
  async downloadRaport(
    @Param('siswaId') siswaId: string,
    @Query('semester') semester: string,
    @Query('tahunAjaran') tahunAjaran: string,
    @Res() res: Response,
  ) {
    const buffer = await this.nilaiService.downloadRaport(
      siswaId,
      semester,
      tahunAjaran,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=Raport-${siswaId}.xlsx`,
      'Content-Length': (buffer as any).length,
    });

    res.end(buffer);
  }

  @Post('raport/generate')
  async generateRaport(@Body() data: any, @Res() res: Response) {
    const buffer = await this.nilaiService.generateRaportFromData(data);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=Raport-${data.siswa.nama}.xlsx`,
      'Content-Length': (buffer as any).length,
    });

    res.end(buffer);
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
