import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WaliKelasService } from './wali-kelas.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('wali-kelas')
@UseGuards(JwtAuthGuard)
export class WaliKelasController {
  constructor(private readonly waliKelasService: WaliKelasService) {}

  @Get()
  async getAll() {
    return this.waliKelasService.getAll();
  }

  @Get('statistik')
  async getStatistik() {
    return this.waliKelasService.getStatistik();
  }

  @Get('available-kelas')
  async getAvailableKelas() {
    return this.waliKelasService.getAvailableKelas();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.waliKelasService.getById(id);
  }

  @Post()
  async create(
    @Body() body: { namaGuru: string; kelas: string; noTelp?: string },
  ) {
    return this.waliKelasService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { namaGuru?: string; kelas?: string; noTelp?: string },
  ) {
    return this.waliKelasService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.waliKelasService.delete(id);
  }
}
