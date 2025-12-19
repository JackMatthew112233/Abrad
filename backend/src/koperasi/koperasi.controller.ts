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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KoperasiService } from './koperasi.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JenisPemasukanKoperasi, JenisPengeluaranKoperasi } from '../generated/enums.js';

@Controller('koperasi')
@UseGuards(JwtAuthGuard)
export class KoperasiController {
  constructor(private readonly koperasiService: KoperasiService) {}

  @Get('statistik')
  async getStatistik() {
    return this.koperasiService.getStatistik();
  }

  // Anggota endpoints
  @Get('anggota')
  async getAllAnggota(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.koperasiService.getAllAnggota(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get('anggota/search')
  async searchAnggota(@Query('q') query: string) {
    return this.koperasiService.searchAnggota(query || '');
  }

  @Get('anggota/:id')
  async getAnggotaById(@Param('id') id: string) {
    return this.koperasiService.getAnggotaById(id);
  }

  @Get('anggota/:id/pemasukan')
  async getPemasukanByAnggotaId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.koperasiService.getPemasukanByAnggotaId(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('anggota/:id/pengeluaran')
  async getPengeluaranByAnggotaId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.koperasiService.getPengeluaranByAnggotaId(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Post('anggota')
  async createAnggota(
    @Body() body: { nama: string; alamat?: string; noTelp?: string },
  ) {
    return this.koperasiService.createAnggota(body);
  }

  @Put('anggota/:id')
  async updateAnggota(
    @Param('id') id: string,
    @Body() body: { nama?: string; alamat?: string; noTelp?: string },
  ) {
    return this.koperasiService.updateAnggota(id, body);
  }

  @Delete('anggota/:id')
  async deleteAnggota(@Param('id') id: string) {
    return this.koperasiService.deleteAnggota(id);
  }

  // Pemasukan endpoints
  @Get('pemasukan')
  async getAllPemasukan(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('jenis') jenis?: string,
  ) {
    return this.koperasiService.getAllPemasukan(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      jenis,
    );
  }

  @Post('pemasukan')
  @UseInterceptors(FileInterceptor('bukti'))
  async createPemasukan(
    @Body()
    body: {
      anggotaId: string;
      jenis: JenisPemasukanKoperasi;
      jumlah: string;
      tanggal: string;
      keterangan?: string;
    },
    @UploadedFile() file: any,
  ) {
    return this.koperasiService.createPemasukan(
      {
        anggotaId: body.anggotaId,
        jenis: body.jenis,
        jumlah: parseFloat(body.jumlah),
        tanggal: body.tanggal,
        keterangan: body.keterangan,
      },
      file,
    );
  }

  @Delete('pemasukan/:id')
  async deletePemasukan(@Param('id') id: string) {
    return this.koperasiService.deletePemasukan(id);
  }

  // Pengeluaran endpoints
  @Get('pengeluaran')
  async getAllPengeluaran(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('jenis') jenis?: string,
  ) {
    return this.koperasiService.getAllPengeluaran(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      jenis,
    );
  }

  @Post('pengeluaran')
  @UseInterceptors(FileInterceptor('bukti'))
  async createPengeluaran(
    @Body()
    body: {
      anggotaId: string;
      jenis: JenisPengeluaranKoperasi;
      jumlah: string;
      tanggal: string;
      keterangan?: string;
    },
    @UploadedFile() file: any,
  ) {
    return this.koperasiService.createPengeluaran(
      {
        anggotaId: body.anggotaId,
        jenis: body.jenis,
        jumlah: parseFloat(body.jumlah),
        tanggal: body.tanggal,
        keterangan: body.keterangan,
      },
      file,
    );
  }

  @Delete('pengeluaran/:id')
  async deletePengeluaran(@Param('id') id: string) {
    return this.koperasiService.deletePengeluaran(id);
  }
}
