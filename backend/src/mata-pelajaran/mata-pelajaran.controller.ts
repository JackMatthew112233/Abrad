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
import { MataPelajaranService } from './mata-pelajaran.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('mata-pelajaran')
@UseGuards(JwtAuthGuard)
export class MataPelajaranController {
  constructor(private readonly mataPelajaranService: MataPelajaranService) {}

  @Get()
  async getAllMataPelajaran(@Query('kelas') kelas?: string) {
    return this.mataPelajaranService.getAllMataPelajaran(kelas);
  }

  @Get('summary/by-kelas')
  async getSummaryByKelas() {
    return this.mataPelajaranService.getSummaryByKelas();
  }

  @Get(':id')
  async getMataPelajaranById(@Param('id') id: string) {
    return this.mataPelajaranService.getMataPelajaranById(id);
  }

  @Post()
  async createMataPelajaran(@Body() data: any) {
    return this.mataPelajaranService.createMataPelajaran(data);
  }

  @Put(':id')
  async updateMataPelajaran(@Param('id') id: string, @Body() data: any) {
    return this.mataPelajaranService.updateMataPelajaran(id, data);
  }

  @Delete(':id')
  async deleteMataPelajaran(@Param('id') id: string) {
    return this.mataPelajaranService.deleteMataPelajaran(id);
  }
}
