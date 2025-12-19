import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('pendaftaran')
@UseGuards(JwtAuthGuard)
export class PendaftaranController {
  constructor(private readonly pendaftaranService: PendaftaranService) {}

  @Get()
  async getAllPendaftaran(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.pendaftaranService.getAllPendaftaran(status, pageNum, limitNum);
  }

  @Get('statistik')
  async getStatistik() {
    return this.pendaftaranService.getStatistik();
  }

  @Post(':id/approve')
  async approveUser(@Param('id') id: string) {
    return this.pendaftaranService.approveUser(id);
  }

  @Post(':id/reject')
  async rejectUser(@Param('id') id: string) {
    return this.pendaftaranService.rejectUser(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.pendaftaranService.deleteUser(id);
  }
}
