import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { EkstrakurikulerService } from './ekstrakurikuler.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('ekstrakurikuler')
@UseGuards(JwtAuthGuard)
export class EkstrakurikulerController {
    constructor(private readonly ekstrakurikulerService: EkstrakurikulerService) { }

    @Post()
    create(@Body() body: { nama: string; keterangan?: string }) {
        return this.ekstrakurikulerService.create(body);
    }

    @Get()
    findAll() {
        return this.ekstrakurikulerService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ekstrakurikulerService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: { nama?: string; keterangan?: string },
    ) {
        return this.ekstrakurikulerService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ekstrakurikulerService.remove(id);
    }
}
