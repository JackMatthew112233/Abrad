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
import { FileInterceptor } from '@nestjs/platform-express';
import { PengeluaranService } from './pengeluaran.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('pengeluaran')
@UseGuards(JwtAuthGuard)
export class PengeluaranController {
  constructor(private readonly pengeluaranService: PengeluaranService) {}

  @Post()
  @UseInterceptors(FileInterceptor('bukti'))
  async createPengeluaran(
    @Body()
    body: {
      nama: string;
      jenis: string;
      harga: string;
      tanggalPengeluaran: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.pengeluaranService.createPengeluaran(
      {
        nama: body.nama,
        jenis: body.jenis,
        harga: parseFloat(body.harga),
        tanggalPengeluaran: body.tanggalPengeluaran,
      },
      file,
    );
  }

  @Get()
  async getAllPengeluaran(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.pengeluaranService.getAllPengeluaran(pageNum, limitNum, bulan, tahun);
  }

  @Get('terbaru')
  async getPengeluaranTerbaru(
    @Query('limit') limit?: string,
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.pengeluaranService.getPengeluaranTerbaru(limitNum, bulan, tahun);
  }

  @Get('export')
  async exportPengeluaran(
    @Res() res: any,
    @Query('filterType') filterType?: string,
    @Query('tanggal') tanggal?: string,
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    const buffer = await this.pengeluaranService.exportPengeluaranToExcel(
      filterType,
      tanggal,
      bulan,
      tahun,
    );

    // Generate filename based on filter
    let filename = 'Riwayat_Pengeluaran';
    if (filterType === 'tanggal' && tanggal) {
      filename += `_${tanggal}`;
    } else if (filterType === 'bulan' && bulan) {
      const [year, month] = bulan.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      filename += `_${monthNames[parseInt(month) - 1]}_${year}`;
    } else if (filterType === 'tahun' && tahun) {
      filename += `_${tahun}`;
    } else {
      filename += '_Semua';
    }
    filename += '.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  async getPengeluaranById(@Param('id') id: string) {
    return this.pengeluaranService.getPengeluaranById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('bukti'))
  async updatePengeluaran(
    @Param('id') id: string,
    @Body()
    body: {
      nama: string;
      jenis: string;
      harga: string;
      tanggalPengeluaran: string;
    },
    @UploadedFile() file?: any,
  ) {
    return this.pengeluaranService.updatePengeluaran(
      id,
      {
        nama: body.nama,
        jenis: body.jenis,
        harga: parseFloat(body.harga),
        tanggalPengeluaran: body.tanggalPengeluaran,
      },
      file,
    );
  }

  @Delete(':id')
  async deletePengeluaran(@Param('id') id: string) {
    return this.pengeluaranService.deletePengeluaran(id);
  }
}
