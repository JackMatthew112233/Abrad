import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DonasiService } from './donasi.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('donasi')
@UseGuards(JwtAuthGuard)
export class DonasiController {
  constructor(private readonly donasiService: DonasiService) {}

  @Post()
  @UseInterceptors(FileInterceptor('evidence'))
  async createDonasi(
    @Body()
    body: {
      nama: string;
      jumlahDonasi: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.donasiService.createDonasi(
      {
        nama: body.nama,
        jumlahDonasi: parseFloat(body.jumlahDonasi),
      },
      file,
    );
  }

  @Get()
  async getAllDonasi(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.donasiService.getAllDonasi(pageNum, limitNum);
  }

  @Get('terbaru')
  async getDonasiTerbaru(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.donasiService.getDonasiTerbaru(limitNum);
  }

  @Get(':id')
  async getDonasiById(@Param('id') id: string) {
    return this.donasiService.getDonasiById(id);
  }

  @Delete(':id')
  async deleteDonasi(@Param('id') id: string) {
    return this.donasiService.deleteDonasi(id);
  }
}
