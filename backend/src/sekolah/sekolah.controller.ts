import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SekolahService } from './sekolah.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('sekolah')
@UseGuards(JwtAuthGuard)
export class SekolahController {
    constructor(private readonly sekolahService: SekolahService) { }

    @Get()
    async getSettings() {
        return this.sekolahService.getSettings();
    }

    @Put()
    async updateSettings(@Body() data: any) {
        return this.sekolahService.updateSettings(data);
    }
}
