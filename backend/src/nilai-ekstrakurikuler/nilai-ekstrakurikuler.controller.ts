import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { NilaiEkstrakurikulerService } from './nilai-ekstrakurikuler.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('nilai-ekstrakurikuler')
@UseGuards(JwtAuthGuard)
export class NilaiEkstrakurikulerController {
    constructor(
        private readonly nilaiEkstrakurikulerService: NilaiEkstrakurikulerService,
    ) { }

    @Post()
    create(
        @Body()
        body: {
            siswaId: string;
            ekstrakurikulerId: string;
            nilai: string;
            semester: string;
            tahunAjaran: string;
        },
    ) {
        return this.nilaiEkstrakurikulerService.create(body);
    }

    @Post('bulk')
    upsertBulk(
        @Body()
        body: {
            siswaId: string;
            semester: string;
            tahunAjaran: string;
            nilaiList: Array<{
                ekstrakurikulerId: string;
                nilai: string;
            }>
        }
    ) {
        return this.nilaiEkstrakurikulerService.upsertBulk(body);
    }

    @Get('siswa/:siswaId')
    findBySiswa(
        @Param('siswaId') siswaId: string,
        @Query('semester') semester?: string,
        @Query('tahunAjaran') tahunAjaran?: string,
    ) {
        return this.nilaiEkstrakurikulerService.findBySiswa(
            siswaId,
            semester,
            tahunAjaran,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.nilaiEkstrakurikulerService.remove(id);
    }
}
